const express = require('express');
const { signup, signin, listUsers, getPendingVerifications, updateVerificationStatus, toggleUserBlock } = require('../controllers/adminController');
const { verifyToken } = require('../middleware/auth');
const router = express.Router();

router.post('/signup', signup);
router.post('/signin', signin);

// Admin-only: management routes
router.get('/users', verifyToken, listUsers);
router.patch('/users/toggle-block', verifyToken, toggleUserBlock);
router.get('/verifications/pending', verifyToken, getPendingVerifications);
router.put('/verifications/status', verifyToken, updateVerificationStatus);

module.exports = router;
