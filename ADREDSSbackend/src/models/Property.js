const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  title: { type: String, required: true, index: true },
  description: { type: String },
  price: { type: Number, required: true, index: true },
  address: { type: String },
  propertyType: { type: String, enum: ['flat', 'house', 'other'], required: true, index: true },
  category: { type: String, enum: ['rent', 'sell'], required: true, index: true },
  bedrooms: { type: Number },
  bathrooms: { type: Number },
  area: { type: Number },
  images: [{ type: String }],
  coordinates: {
    lat: { type: Number, default: 25.3960 },
    lng: { type: Number, default: 68.3578 }
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isVerifiedListing: { type: Boolean, default: false },
  status: { type: String, enum: ['available', 'sold', 'rented'], default: 'available' }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

module.exports = mongoose.model('Property', propertySchema);
