const express = require('express');
const { addProperty, listProperties, getProperty, updateProperty, deleteProperty, getRecommendations, aiSearch } = require('../controllers/propertyController');
const { verifyToken } = require('../middleware/auth');
const upload = require('../middleware/upload');
const router = express.Router();

router.post('/', verifyToken, upload.array('images', 10), addProperty);
router.get('/', listProperties);
router.get('/ai-search', aiSearch);
router.get('/:id', getProperty);
router.get('/:id/recommendations', getRecommendations);
router.put('/:id', verifyToken, upload.array('images', 10), updateProperty);
router.delete('/:id', verifyToken, deleteProperty);

module.exports = router;
