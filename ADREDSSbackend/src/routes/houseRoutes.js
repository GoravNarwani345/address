const express = require('express');
const { addHouse, listHouses } = require('../controllers/houseController');
const { verifyToken } = require('../middleware/auth');
const upload = require('../middleware/upload');
const router = express.Router();

router.post('/', verifyToken, upload.array('images', 10), addHouse);
router.get('/', listHouses);

module.exports = router;
