import express from 'express';
import Proposal from '../models/Proposal.js';
import RFP from '../models/RFP.js';
import Vendor from '../models/Vendor.js';
import { checkForNewEmails } from '../services/emailService.js';
import { parseVendorProposal, analyzeProposal, compareProposals } from '../services/aiService.js';

const router = express.Router();

router.get('/rfp/:rfpId', async (req, res) => {
  try {
    const proposals = await Proposal.find({ rfpId: req.params.rfpId })
      .populate('vendorId')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      proposals
    });
  } catch (error) {
    console.error('Error fetching proposals:', error);
    res.status(500).json({ error: 'Failed to fetch proposals' });
  }
});

router.post('/check-emails', async (req, res) => {
  try {
    const emails = await checkForNewEmails();
    console.log('Checking for new emails...',emails);

    if (emails.length === 0) {
      return res.json({
        success: true,
        message: 'No new emails found',
        processed: 0
      });
    }

    const processedProposals = [];

    for (const email of emails) {
      try {
        // Extract RFP title from subject
        const rfpTitle = email.subject.replace(/^(Re:\s*)?RFP:\s*/i, '').trim();
        
        // Find matching RFP
        const rfp = await RFP.findOne({ title: { $regex: rfpTitle, $options: 'i' } });
        
        if (!rfp) {
          console.log(`No matching RFP found for: ${rfpTitle}`);
          continue;
        }

        // Extract vendor email from "from" field
        const emailMatch = email.from.match(/<(.+?)>/) || [null, email.from];
        const vendorEmail = emailMatch[1].trim();

        // Find vendor
        const vendor = await Vendor.findOne({ email: vendorEmail });
        
        if (!vendor) {
          console.log(`No matching vendor found for: ${vendorEmail}`);
          continue;
        }

        // Parse proposal using AI
        const parsedData = await parseVendorProposal(email.body, rfp.structuredData);

        // Create proposal
        const proposal = new Proposal({
          rfpId: rfp._id,
          vendorId: vendor._id,
          emailData: {
            subject: email.subject,
            body: email.body,
            receivedAt: email.receivedAt,
            attachments: email.attachments
          },
          parsedData,
          status: 'parsed'
        });

        const analysis = await analyzeProposal(proposal, rfp.structuredData);
        proposal.aiAnalysis = analysis;
        proposal.status = 'evaluated';

        await proposal.save();

        if (!rfp.proposals.includes(proposal._id)) {
          rfp.proposals.push(proposal._id);
          await rfp.save();
        }

        processedProposals.push(proposal);
      } catch (error) {
        console.error('Error processing email:', error);
      }
    }

    res.json({
      success: true,
      message: `Processed ${processedProposals.length} proposals`,
      processed: processedProposals.length,
      proposals: processedProposals
    });
  } catch (error) {
    console.error('Error checking emails:', error);
    res.status(500).json({ error: 'Failed to check emails' });
  }
});

router.get('/compare/:rfpId', async (req, res) => {
  try {
    const rfp = await RFP.findById(req.params.rfpId);
    if (!rfp) {
      return res.status(404).json({ error: 'RFP not found' });
    }

    const proposals = await Proposal.find({ rfpId: req.params.rfpId })
      .populate('vendorId');

    if (proposals.length === 0) {
      return res.status(404).json({ error: 'No proposals found for this RFP' });
    }

    // Get AI comparison and recommendation
    const comparison = await compareProposals(proposals, rfp.structuredData);

    res.json({
      success: true,
      proposals,
      comparison
    });
  } catch (error) {
    console.error('Error comparing proposals:', error);
    res.status(500).json({ error: 'Failed to compare proposals' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const proposal = await Proposal.findById(req.params.id)
      .populate('vendorId')
      .populate('rfpId');

    if (!proposal) {
      return res.status(404).json({ error: 'Proposal not found' });
    }

    res.json({
      success: true,
      proposal
    });
  } catch (error) {
    console.error('Error fetching proposal:', error);
    res.status(500).json({ error: 'Failed to fetch proposal' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const proposal = await Proposal.findByIdAndDelete(req.params.id);

    if (!proposal) {
      return res.status(404).json({ error: 'Proposal not found' });
    }

    // Remove from RFP's proposals array
    await RFP.findByIdAndUpdate(proposal.rfpId, {
      $pull: { proposals: proposal._id }
    });

    res.json({
      success: true,
      message: 'Proposal deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting proposal:', error);
    res.status(500).json({ error: 'Failed to delete proposal' });
  }
});

export default router;
