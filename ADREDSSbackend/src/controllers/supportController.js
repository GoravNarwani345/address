const ContactMessage = require('../models/ContactMessage');
const User = require('../models/User');

// Helper to check if user is admin
const checkAdmin = async (userId) => {
    const user = await User.findById(userId);
    return user && user.role === 'admin';
};

// Submit a new contact message
exports.submitContactMessage = async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        const newMessage = new ContactMessage({
            name,
            email,
            subject,
            message,
            user: req.userId // Will be undefined if not logged in, which is fine
        });

        await newMessage.save();

        res.status(201).json({
            success: true,
            message: 'Your message has been received. Our team will contact you soon.',
            data: newMessage
        });
    } catch (error) {
        console.error('Submit Contact Message Error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// Get all contact messages (Admin only)
exports.getContactMessages = async (req, res) => {
    try {
        const isAdmin = await checkAdmin(req.userId);
        if (!isAdmin) return res.status(403).json({ success: false, message: 'Forbidden' });

        const messages = await ContactMessage.find().sort({ created_at: -1 });
        res.status(200).json({ success: true, data: messages });
    } catch (error) {
        console.error('Get Contact Messages Error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// Update message status (Admin only)
exports.updateMessageStatus = async (req, res) => {
    try {
        const isAdmin = await checkAdmin(req.userId);
        if (!isAdmin) return res.status(403).json({ success: false, message: 'Forbidden' });

        const { id } = req.params;
        const { status } = req.body;

        const message = await ContactMessage.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        );

        if (!message) {
            return res.status(404).json({ success: false, message: 'Message not found' });
        }

        res.status(200).json({ success: true, data: message });
    } catch (error) {
        console.error('Update Message Status Error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

