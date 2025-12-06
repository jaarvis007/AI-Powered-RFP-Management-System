import mongoose from 'mongoose';

const proposalSchema = new mongoose.Schema({
  rfpId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RFP',
    required: true
  },
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true
  },
  emailData: {
    subject: String,
    body: String,
    receivedAt: Date,
    attachments: [String]
  },
  parsedData: {
    totalPrice: Number,
    itemPrices: [{
      item: String,
      price: Number,
      quantity: Number
    }],
    deliveryTime: String,
    paymentTerms: String,
    warranty: String,
    additionalTerms: [String]
  },
  aiAnalysis: {
    completenessScore: {
      type: Number,
      min: 0,
      max: 100
    },
    competitivenessScore: {
      type: Number,
      min: 0,
      max: 100
    },
    summary: String,
    pros: [String],
    cons: [String],
    recommendation: String
  },
  status: {
    type: String,
    enum: ['received', 'parsed', 'evaluated'],
    default: 'received'
  }
}, {
  timestamps: true
});

const Proposal = mongoose.model('Proposal', proposalSchema);

export default Proposal;
