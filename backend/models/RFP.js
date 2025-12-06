import mongoose from 'mongoose';

const rfpSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  structuredData: {
    items: [{
      name: String,
      quantity: Number,
      specifications: String
    }],
    budget: Number,
    deliveryDeadline: Date,
    paymentTerms: String,
    warrantyRequirements: String,
    additionalRequirements: [String]
  },
  status: {
    type: String,
    enum: ['draft', 'sent', 'closed'],
    default: 'draft'
  },
  createdBy: {
    type: String,
    default: 'Procurement Manager'
  },
  sentAt: Date,
  selectedVendors: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor'
  }],
  proposals: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Proposal'
  }]
}, {
  timestamps: true
});

const RFP = mongoose.model('RFP', rfpSchema);

export default RFP;
