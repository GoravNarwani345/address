const express = require('express');
const { addProperty, listProperties, getProperty, updateProperty, deleteProperty, getRecommendations, aiSearch } = require('../controllers/propertyController');
const { verifyToken, ensureVerified } = require('../middleware/auth');
const upload = require('../middleware/upload');
const router = express.Router();

router.post('/', verifyToken, ensureVerified, upload.array('images', 10), addProperty);
router.get('/', listProperties);
router.get('/ai-search', aiSearch);
router.get('/:id', getProperty);
router.get('/:id/recommendations', getRecommendations);
router.put('/:id', verifyToken, ensureVerified, upload.array('images', 10), updateProperty);
router.delete('/:id', verifyToken, ensureVerified, deleteProperty);

module.exports = router;
