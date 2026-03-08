const express = require('express');
const { getMarketStats, getAdminStats, getLeadStats, downloadReport } = require('../controllers/analyticsController');
const { verifyToken } = require('../middleware/auth');
const router = express.Router();

router.get('/stats', getMarketStats);
router.get('/admin', verifyToken, getAdminStats);
router.get('/leads', verifyToken, getLeadStats);
router.get('/download', verifyToken, downloadReport);

module.exports = router;
