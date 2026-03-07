const express = require('express');
const { chatWithAIBroker, getPriceSuggestion } = require('../controllers/aiBrokerController');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

router.post('/chat', verifyToken, chatWithAIBroker);
router.get('/price-suggestion/:propertyId', verifyToken, getPriceSuggestion);

module.exports = router;
