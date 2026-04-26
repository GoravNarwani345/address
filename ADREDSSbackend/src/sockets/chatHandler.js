const Message = require('../models/Message');
const User = require('../models/User');

const chatHandler = (io, socket) => {
    if (socket.userId) {
        socket.join(socket.userId);
    }

    socket.on('join_room', ({ senderId, receiverId, propertyId }) => {
        const room = [senderId, receiverId].sort().join('_');
        socket.join(room);
    });

    socket.on('send_message', async (data) => {
        const { senderId, receiverId, propertyId, content } = data;

        try {
            // Enforce verification check
            const sender = await User.findById(senderId).select('verified');
            if (!sender || !sender.verified) {
                return socket.emit('error_message', { message: 'Email verification required to send messages' });
            }
            const newMessage = await Message.create({
                sender: senderId,
                receiver: receiverId,
                property: propertyId,
                content
            });

            const populatedMessage = await Message.findById(newMessage._id).populate('sender', 'name');

            const messagePayload = {
                ...data,
                id: newMessage._id,
                created_at: newMessage.created_at,
                senderName: populatedMessage?.sender?.name || 'User'
            };

            const room = [senderId, receiverId].sort().join('_');
            io.to(room).emit('receive_message', messagePayload);
            io.to(receiverId).emit('receive_message', messagePayload);
        } catch (error) {
            console.error('Error saving message:', error);
        }
    });

    socket.on('disconnect', () => {
        // Silent disconnect
    });
};

module.exports = chatHandler;
