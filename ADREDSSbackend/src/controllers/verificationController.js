const User = require('../models/User');
const Property = require('../models/Property');
const PropertyVerification = require('../models/PropertyVerification');

exports.submitProfessionalDocs = async (req, res) => {
    try {
        const userId = req.userId;
        const { fbrRegistrationNumber, agencyAddress, agencyPhone, agencyName, licenseNumber } = req.body;
        const updateData = {};

        if (fbrRegistrationNumber) updateData.fbrRegistrationNumber = fbrRegistrationNumber;
        if (agencyAddress) updateData.agencyAddress = agencyAddress;
        if (agencyPhone) updateData.agencyPhone = agencyPhone;
        if (agencyName) updateData.agencyName = agencyName;
        if (licenseNumber) updateData.licenseNumber = licenseNumber;

        if (req.files) {
            if (req.files.cnic_front) updateData.cnic_front = `/uploads/cnic/${req.files.cnic_front[0].filename}`;
            if (req.files.cnic_back) updateData.cnic_back = `/uploads/cnic/${req.files.cnic_back[0].filename}`;
            if (req.files.licenseDocument) updateData.licenseDocument = `/uploads/license/${req.files.licenseDocument[0].filename}`;
        }

        // When documents are submitted, set verificationStatus to pending
        updateData.verificationStatus = 'pending';

        const user = await User.findByIdAndUpdate(userId, { $set: updateData }, { new: true }).select('-password');

        res.status(200).json({
            success: true,
            message: 'Verification documents submitted successfully and are under review.',
            user
        });
    } catch (error) {
        console.error('Submit Professional Docs Error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

exports.submitPropertyDocument = async (req, res) => {
    try {
        const { propertyId } = req.params;
        const { documentType } = req.body;

        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Verification document is required' });
        }

        const documentUrl = `/uploads/verification/${req.file.filename}`;

        const verificationEntry = await PropertyVerification.create({
            propertyId,
            userId: req.userId,
            documentType: documentType || 'Deed',
            documentUrl,
            status: 'pending'
        });

        res.status(201).json({
            success: true,
            message: 'Property ownership document submitted successfully. Our team will verify it soon.',
            verification: verificationEntry
        });
    } catch (error) {
        console.error('Submit Property Document Error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

exports.getPropertyVerificationStatus = async (req, res) => {
    try {
        const { propertyId } = req.params;
        const verification = await PropertyVerification.findOne({ propertyId }).sort({ created_at: -1 });

        res.status(200).json({
            success: true,
            verification: verification || null
        });
    } catch (error) {
        console.error('Get Property Verification Status Error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
