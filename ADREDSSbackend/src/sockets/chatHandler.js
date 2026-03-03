const Message = require('../models/Message');

const chatHandler = (io, socket) => {
    console.log('User connected:', socket.id);

    // Join a private room between two users (and optionally a property)
    socket.on('join_room', ({ senderId, receiverId, propertyId }) => {
        // Standardize room name: smallerId_largerId
        const room = [senderId, receiverId].sort().join('_');
        socket.join(room);
        console.log(`User ${senderId} joined room ${room}`);
    });

    socket.on('send_message', async (data) => {
        const { senderId, receiverId, propertyId, content } = data;
        const room = [senderId, receiverId].sort().join('_');

        try {
            // Save message to database
            const newMessage = await Message.create({
                sender: senderId,
                receiver: receiverId,
                property: propertyId,
                content
            });

            // Broadcast to users in the room
            io.to(room).emit('receive_message', {
                ...data,
                id: newMessage._id,
                created_at: newMessage.created_at
            });

            console.log(`Message from ${senderId} to ${receiverId} in room ${room}: ${content}`);
        } catch (error) {
            console.error('Error saving message:', error);
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
};

module.exports = chatHandler;
