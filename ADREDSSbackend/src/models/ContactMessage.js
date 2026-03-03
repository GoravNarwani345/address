const mongoose = require('mongoose');

const contactMessageSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    subject: { type: String, required: true },
    message: { type: String, required: true },
    status: {
        type: String,
        enum: ['unread', 'read', 'handled'],
        default: 'unread'
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } // Optional, if user is logged in
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

module.exports = mongoose.model('ContactMessage', contactMessageSchema);
