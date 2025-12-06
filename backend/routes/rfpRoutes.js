import express from 'express';
import RFP from '../models/RFP.js';
import Vendor from '../models/Vendor.js';
import { parseRFPFromNaturalLanguage } from '../services/aiService.js';
import { sendRFPEmail } from '../services/emailService.js';
const router = express.Router();


router.post('/create', async (req, res) => {
  try {
    const { description } = req.body;

    if (!description) {
      return res.status(400).json({ error: 'Description is required' });
    }

    // Use AI to parse the description into structured data
    const structuredData = await parseRFPFromNaturalLanguage(description);

    console.log("wdew",structuredData);

    // Create RFP in database
    const rfp = new RFP({
      title: structuredData.title,
      description,
      structuredData: {
        items: structuredData.items || [],
        budget: structuredData.budget,
        deliveryDeadline: structuredData.deliveryDeadline,
        paymentTerms: structuredData.paymentTerms,
        warrantyRequirements: structuredData.warrantyRequirements,
        additionalRequirements: structuredData.additionalRequirements || []
      },
      status: 'draft'
    });

    await rfp.save();

    res.status(201).json({
      success: true,
      rfp
    });
  } catch (error) {
    console.error('Error creating RFP:', error);
    res.status(500).json({ error: 'Failed to create RFP' });
  }
});

router.get('/', async (req, res) => {
  try {
    const rfps = await RFP.find()
      .populate('selectedVendors')
      .populate('proposals')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      rfps
    });
  } catch (error) {
    console.error('Error fetching RFPs:', error);
    res.status(500).json({ error: 'Failed to fetch RFPs' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const rfp = await RFP.findById(req.params.id)
      .populate('selectedVendors')
      .populate({
        path: 'proposals',
        populate: { path: 'vendorId' }
      });

    if (!rfp) {
      return res.status(404).json({ error: 'RFP not found' });
    }

    res.json({
      success: true,
      rfp
    });
  } catch (error) {
    console.error('Error fetching RFP:', error);
    res.status(500).json({ error: 'Failed to fetch RFP' });
  }
});

router.post('/:id/send', async (req, res) => {
  try {
    const { vendorIds } = req.body;

    if (!vendorIds || vendorIds.length === 0) {
      return res.status(400).json({ error: 'At least one vendor must be selected' });
    }

    const rfp = await RFP.findById(req.params.id);
    if (!rfp) {
      return res.status(404).json({ error: 'RFP not found' });
    }

    const vendors = await Vendor.find({ _id: { $in: vendorIds } });
    if (vendors.length === 0) {
      return res.status(404).json({ error: 'No vendors found' });
    }

    // Send emails
    const emailResults = await sendRFPEmail(rfp, vendors);

    // Update RFP
    rfp.selectedVendors = vendorIds;
    rfp.status = 'sent';
    rfp.sentAt = new Date();
    await rfp.save();

    res.json({
      success: true,
      message: `RFP sent to ${vendors.length} vendor(s)`,
      emailResults,
      rfp
    });
  } catch (error) {
    console.error('Error sending RFP:', error);
    res.status(500).json({ error: 'Failed to send RFP' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const rfp = await RFP.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!rfp) {
      return res.status(404).json({ error: 'RFP not found' });
    }

    res.json({
      success: true,
      rfp
    });
  } catch (error) {
    console.error('Error updating RFP:', error);
    res.status(500).json({ error: 'Failed to update RFP' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const rfp = await RFP.findByIdAndDelete(req.params.id);

    if (!rfp) {
      return res.status(404).json({ error: 'RFP not found' });
    }

    res.json({
      success: true,
      message: 'RFP deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting RFP:', error);
    res.status(500).json({ error: 'Failed to delete RFP' });
  }
});

export default router;
