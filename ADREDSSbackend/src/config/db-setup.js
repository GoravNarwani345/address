require('dotenv').config();
const { connectDB } = require('./database');

const initDatabase = async () => {
  try {
    await connectDB();
    console.log('Database initialized (MongoDB)');
  } catch (error) {
    console.error('Error initializing MongoDB:', error);
    throw error;
  }
};

module.exports = initDatabase;
