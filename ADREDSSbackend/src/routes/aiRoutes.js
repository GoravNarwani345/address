const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');

// All routes are prefixed with /api/ai
router.post('/parse-search', aiController.parseSearchQuery);
router.post('/property-insight', aiController.getPropertyInsight);

module.exports = router;
