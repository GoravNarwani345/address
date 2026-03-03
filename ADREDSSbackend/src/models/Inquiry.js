const mongoose = require('mongoose');

const inquirySchema = new mongoose.Schema({
    property: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // The owner/broker receiving the lead
    type: { type: String, enum: ['contact', 'booking'], required: true },
    message: { type: String },
    bookingDate: { type: Date },
    status: { type: String, enum: ['pending', 'contacted', 'visited', 'resolved', 'cancelled'], default: 'pending' }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

module.exports = mongoose.model('Inquiry', inquirySchema);
