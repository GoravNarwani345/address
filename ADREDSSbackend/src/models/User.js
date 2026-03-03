const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  phone: { type: String },
  password: { type: String, required: true },
  role: { type: String, enum: ['buyer', 'seller', 'broker', 'admin'], default: 'buyer', index: true },
  cnic_front: { type: String },
  cnic_back: { type: String },
  // Broker-specific fields
  agencyName: {
    type: String,
    validate: {
      validator: function (v) {
        if (this.role === 'broker') return v != null && v.length > 0;
        return true;
      },
      message: 'Agency name is required for brokers'
    }
  },
  licenseNumber: {
    type: String,
    validate: {
      validator: function (v) {
        if (this.role === 'broker') return v != null && v.length > 0;
        return true;
      },
      message: 'License number is required for brokers'
    }
  },
  licenseDocument: {
    type: String,
    validate: {
      validator: function (v) {
        if (this.role === 'broker') return v != null && v.length > 0;
        return true;
      },
      message: 'License document is required for brokers'
    }
  },
  verified: { type: Boolean, default: false },
  isVerifiedBroker: { type: Boolean, default: false },
  verificationStatus: {
    type: String,
    enum: ['unverified', 'pending', 'approved', 'rejected'],
    default: 'unverified'
  },
  verificationLevel: {
    type: String,
    enum: ['none', 'identity', 'professional'],
    default: 'none',
    index: true
  },
  fbrRegistrationNumber: { type: String },
  agencyAddress: { type: String },
  agencyPhone: { type: String },
  status: {
    type: String,
    enum: ['active', 'blocked'],
    default: 'active',
    index: true
  },
  emailOTP: { type: String },
  otpExpires: { type: Date },
  notificationSettings: {
    email: { type: Boolean, default: true },
    push: { type: Boolean, default: true },
    chat: { type: Boolean, default: true }
  },
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Property' }]
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

module.exports = mongoose.model('User', userSchema);
