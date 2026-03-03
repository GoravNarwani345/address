const express = require('express');
const router = express.Router();
const verificationController = require('../controllers/verificationController');
const { verifyToken } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Professional Verification (Brokers/Sellers)
router.post('/professional/submit', verifyToken, upload.fields([
    { name: 'cnic_front', maxCount: 1 },
    { name: 'cnic_back', maxCount: 1 },
    { name: 'licenseDocument', maxCount: 1 }
]), verificationController.submitProfessionalDocs);

// Property Listing Verification
router.post('/property/:propertyId/submit', verifyToken, upload.single('verificationDoc'), verificationController.submitPropertyDocument);
router.get('/property/:propertyId/status', verifyToken, verificationController.getPropertyVerificationStatus);

module.exports = router;
