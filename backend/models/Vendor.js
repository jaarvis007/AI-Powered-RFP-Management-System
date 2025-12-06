import mongoose from 'mongoose';

const vendorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    trim: true
  },
  company: {
    type: String,
    required: true,
    trim: true
  },
  category: [{
    type: String,
    trim: true
  }],
  notes: {
    type: String
  }
}, {
  timestamps: true
});

const Vendor = mongoose.model('Vendor', vendorSchema);

export default Vendor;
