const express = require('express');
const { getMarketStats, getAdminStats, getLeadStats } = require('../controllers/analyticsController');
const { verifyToken } = require('../middleware/auth');
const router = express.Router();

router.get('/stats', getMarketStats);
router.get('/admin', verifyToken, getAdminStats);
router.get('/leads', verifyToken, getLeadStats);

module.exports = router;
