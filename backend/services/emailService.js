import nodemailer from 'nodemailer';
import Imap from 'imap';
import { simpleParser } from 'mailparser';


const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
};

export const sendRFPEmail = async (rfp, vendors) => {
  try {
    const transporter = createTransporter();
    
    const emailPromises = vendors.map(async (vendor) => {
      const mailOptions = {
        from: process.env.SMTP_USER,
        to: vendor.email,
        subject: `RFP: ${rfp.title}`,
        html: generateRFPEmailHTML(rfp, vendor),
        text: generateRFPEmailText(rfp, vendor)
      };

      const info = await transporter.sendMail(mailOptions);
      console.log(`✅ Email sent to ${vendor.email}: ${info.messageId}`);
      return { vendor: vendor.email, success: true, messageId: info.messageId };
    });

    const results = await Promise.all(emailPromises);
    return results;
  } catch (error) {
    console.error('Error sending emails:', error);
    throw new Error('Failed to send RFP emails');
  }
};

const generateRFPEmailHTML = (rfp, vendor) => {
  const itemsHTML = rfp.structuredData.items.map(item => `
    <tr>
      <td style="padding: 8px; border: 1px solid #ddd;">${item.name}</td>
      <td style="padding: 8px; border: 1px solid #ddd;">${item.quantity}</td>
      <td style="padding: 8px; border: 1px solid #ddd;">${item.specifications || 'N/A'}</td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
        table { width: 100%; border-collapse: collapse; margin: 15px 0; background: white; }
        th { background: #f3f4f6; padding: 10px; border: 1px solid #ddd; text-align: left; }
        .info-row { margin: 10px 0; }
        .label { font-weight: bold; color: #667eea; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0;">Request for Proposal</h1>
          <p style="margin: 5px 0 0 0; opacity: 0.9;">${rfp.title}</p>
        </div>
        <div class="content">
          <p>Dear ${vendor.name},</p>
          <p>We are requesting proposals for the following procurement:</p>
          
          <div class="info-row">
            <span class="label">Description:</span><br/>
            ${rfp.description}
          </div>

          <h3>Required Items:</h3>
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Quantity</th>
                <th>Specifications</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHTML}
            </tbody>
          </table>

          <h3>Requirements:</h3>
          <div class="info-row">
            <span class="label">Budget:</span> $${rfp.structuredData.budget?.toLocaleString() || 'Not specified'}
          </div>
          <div class="info-row">
            <span class="label">Delivery Deadline:</span> ${rfp.structuredData.deliveryDeadline ? new Date(rfp.structuredData.deliveryDeadline).toLocaleDateString() : 'Not specified'}
          </div>
          <div class="info-row">
            <span class="label">Payment Terms:</span> ${rfp.structuredData.paymentTerms || 'Not specified'}
          </div>
          <div class="info-row">
            <span class="label">Warranty:</span> ${rfp.structuredData.warrantyRequirements || 'Not specified'}
          </div>

          ${rfp.structuredData.additionalRequirements?.length ? `
            <h3>Additional Requirements:</h3>
            <ul>
              ${rfp.structuredData.additionalRequirements.map(req => `<li>${req}</li>`).join('')}
            </ul>
          ` : ''}

          <p style="margin-top: 20px;">Please reply to this email with your proposal including pricing, delivery timeline, and terms.</p>
          
          <p>Best regards,<br/>Procurement Team</p>
        </div>
      </div>
    </body>
    </html>
  `;
};


const generateRFPEmailText = (rfp, vendor) => {
  const itemsText = rfp.structuredData.items.map(item => 
    `- ${item.name} (Qty: ${item.quantity}) - ${item.specifications || 'N/A'}`
  ).join('\n');

  return `
REQUEST FOR PROPOSAL
${rfp.title}

Dear ${vendor.name},

We are requesting proposals for the following procurement:

${rfp.description}

REQUIRED ITEMS:
${itemsText}

REQUIREMENTS:
Budget: $${rfp.structuredData.budget?.toLocaleString() || 'Not specified'}
Delivery Deadline: ${rfp.structuredData.deliveryDeadline ? new Date(rfp.structuredData.deliveryDeadline).toLocaleDateString() : 'Not specified'}
Payment Terms: ${rfp.structuredData.paymentTerms || 'Not specified'}
Warranty: ${rfp.structuredData.warrantyRequirements || 'Not specified'}

${rfp.structuredData.additionalRequirements?.length ? `
ADDITIONAL REQUIREMENTS:
${rfp.structuredData.additionalRequirements.map(req => `- ${req}`).join('\n')}
` : ''}

Please reply to this email with your proposal including pricing, delivery timeline, and terms.

Best regards,
Procurement Team
  `;
};


export const checkForNewEmails = () => {

  return new Promise((resolve, reject) => {
    const imap = new Imap({
      user: process.env.IMAP_USER,
      password: process.env.IMAP_PASS,
      host: process.env.IMAP_HOST,
      port: parseInt(process.env.IMAP_PORT),
      tls: process.env.IMAP_TLS === 'true',
      tlsOptions: { rejectUnauthorized: false }
    });

    const emails = [];

    imap.once('ready', () => {
      imap.openBox('INBOX', false, (err, box) => {
        if (err) {
          reject(err);
          return;
        }

        imap.search(['UNSEEN', ['SUBJECT', 'RFP']], (err, results) => {
          if (err) {
            reject(err);
            return;
          }

          if (!results || results.length === 0) {
            console.log('No new RFP emails found');
            imap.end();
            resolve([]);
            return;
          }

          const fetch = imap.fetch(results, { bodies: '', markSeen: true });

          fetch.on('message', (msg) => {
            msg.on('body', (stream) => {
              simpleParser(stream, async (err, parsed) => {
                if (err) {
                  console.error('Error parsing email:', err);
                  return;
                }

                emails.push({
                  subject: parsed.subject,
                  from: parsed.from.text,
                  body: parsed.text || parsed.html,
                  receivedAt: parsed.date,
                  attachments: parsed.attachments?.map(a => a.filename) || []
                });
              });
            });
          });

          fetch.once('error', (err) => {
            console.error('Fetch error:', err);
            reject(err);
          });

          fetch.once('end', () => {
            console.log(`✅ Processed ${emails.length} new emails`);
            imap.end();
          });
        });
      });
    });

    imap.once('error', (err) => {
      console.error('IMAP error:', err);
      reject(err);
    });

    imap.once('end', () => {
      resolve(emails);
    });

    imap.connect();
  });
};

export const extractRFPIdFromSubject = (subject) => {
  
  const match = subject.match(/RFP[:\s]+(.+)/i);
  return match ? match[1].trim() : null;
};
