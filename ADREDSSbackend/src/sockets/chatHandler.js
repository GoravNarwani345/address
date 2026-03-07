const Message = require('../models/Message');

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
            const newMessage = await Message.create({
                sender: senderId,
                receiver: receiverId,
                property: propertyId,
                content
            });

            const messagePayload = {
                ...data,
                id: newMessage._id,
                created_at: newMessage.created_at
            };

            io.to(senderId).to(receiverId).emit('receive_message', messagePayload);
        } catch (error) {
            console.error('Error saving message:', error);
        }
    });

    socket.on('disconnect', () => {
        // Silent disconnect
    });
};

module.exports = chatHandler;
