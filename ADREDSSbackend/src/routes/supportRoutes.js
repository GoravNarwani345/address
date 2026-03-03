const express = require('express');
const { submitContactMessage, getContactMessages, updateMessageStatus } = require('../controllers/supportController');
const { verifyToken, optionalVerifyToken } = require('../middleware/auth');
const router = express.Router();

// Public route to submit a contact message
router.post('/submit', optionalVerifyToken, submitContactMessage);

// Admin only routes
router.get('/messages', verifyToken, getContactMessages);
router.put('/message/:id', verifyToken, updateMessageStatus);

module.exports = router;
