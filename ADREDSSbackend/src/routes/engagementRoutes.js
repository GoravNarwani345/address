const express = require('express');
const { createInquiry, toggleFavorite, getFavorites, getInquiries, updateInquiryStatus } = require('../controllers/engagementController');
const { verifyToken } = require('../middleware/auth');
const router = express.Router();

router.post('/inquiry', verifyToken, createInquiry);
router.get('/inquiries', verifyToken, getInquiries);
router.put('/inquiry/:id/status', verifyToken, updateInquiryStatus);
router.post('/favorite', verifyToken, toggleFavorite);
router.get('/favorites', verifyToken, getFavorites);

module.exports = router;
