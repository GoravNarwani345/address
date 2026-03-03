const express = require('express');
const { addFlat, listFlats } = require('../controllers/flatController');
const { verifyToken } = require('../middleware/auth');
const upload = require('../middleware/upload');
const router = express.Router();

router.post('/', verifyToken, upload.array('images', 10), addFlat);
router.get('/', listFlats);

module.exports = router;
