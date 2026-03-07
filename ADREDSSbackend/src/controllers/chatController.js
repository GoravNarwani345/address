const Message = require('../models/Message');

// Get chat history between two users
exports.getChatHistory = async (req, res) => {
    try {
        const { userId } = req.params; // The other user's ID
        const currentUserId = req.userId;

        const messages = await Message.find({
            $or: [
                { sender: currentUserId, receiver: userId },
                { sender: userId, receiver: currentUserId }
            ]
        })
            .sort({ created_at: 1 })
            .populate('sender', 'name')
            .populate('receiver', 'name')
            .lean();

        res.status(200).json({ success: true, messages });
    } catch (error) {
        console.error('Get Chat History Error:', error);
        res.status(500).json({ success: false, message: 'Server error fetching chat history' });
    }
};

// Get list of conversations (all users I've chatted with)
exports.getConversations = async (req, res) => {
    try {
        const currentUserId = req.userId;

        const messages = await Message.find({
            $or: [{ sender: currentUserId }, { receiver: currentUserId }]
        })
            .sort({ created_at: -1 })
            .populate('sender', 'name')
            .populate('receiver', 'name')
            .lean();

        const conversations = [];
        const seenUsers = new Set();

        messages.forEach(msg => {
            const otherUser = msg.sender._id.toString() === currentUserId ? msg.receiver : msg.sender;
            const otherUserId = otherUser._id.toString();

            if (!seenUsers.has(otherUserId)) {
                seenUsers.add(otherUserId);
                conversations.push({
                    user: otherUser,
                    lastMessage: msg.content,
                    timestamp: msg.created_at,
                    propertyId: msg.property || null
                });
            }
        });

        res.status(200).json({ success: true, conversations });
    } catch (error) {
        console.error('Get Conversations Error:', error);
        res.status(500).json({ success: false, message: 'Server error fetching conversations' });
    }
};
