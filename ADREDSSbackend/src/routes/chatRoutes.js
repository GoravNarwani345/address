const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { verifyToken } = require('../middleware/auth');

router.get('/history/:userId', verifyToken, chatController.getChatHistory);
router.get('/conversations', verifyToken, chatController.getConversations);

module.exports = router;
