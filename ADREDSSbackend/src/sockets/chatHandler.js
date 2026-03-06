const Message = require('../models/Message');

const chatHandler = (io, socket) => {
    // Make user join their personal room automatically based on their JWT userId
    if (socket.userId) {
        socket.join(socket.userId);
        console.log(`User ${socket.userId} joined personal room`);
    }

    // Maintain backwards compatibility for join_room, though not strictly needed anymore
    socket.on('join_room', ({ senderId, receiverId, propertyId }) => {
        const room = [senderId, receiverId].sort().join('_');
        socket.join(room);
    });

    socket.on('send_message', async (data) => {
        const { senderId, receiverId, propertyId, content } = data;

        try {
            // Save message to database
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

            // Emit to both users' personal rooms
            io.to(senderId).to(receiverId).emit('receive_message', messagePayload);

            console.log(`Message from ${senderId} to ${receiverId}: ${content}`);
        } catch (error) {
            console.error('Error saving message:', error);
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.userId || socket.id);
    });
};

module.exports = chatHandler;
