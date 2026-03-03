const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Helper to check if user is admin
const checkAdmin = async (userId) => {
  const user = await User.findById(userId);
  return user && user.role === 'admin';
};

// Admin list all users
exports.listUsers = async (req, res) => {
  try {
    const userId = req.userId;
    const isAdmin = await checkAdmin(userId);
    if (!isAdmin) return res.status(403).json({ success: false, message: 'Forbidden' });

    const users = await User.find().select('-password -emailOTP -otpExpires -__v').sort({ created_at: -1 });
    return res.status(200).json({ success: true, users });
  } catch (error) {
    console.error('Admin listUsers Error:', error);
    return res.status(500).json({ success: false, message: 'Error fetching users' });
  }
};

// Admin: Get pending professional verifications
exports.getPendingVerifications = async (req, res) => {
  try {
    const userId = req.userId;
    const isAdmin = await checkAdmin(userId);
    if (!isAdmin) return res.status(403).json({ success: false, message: 'Forbidden' });

    const users = await User.find({ verificationStatus: 'pending' }).select('-password');
    return res.status(200).json({ success: true, users });
  } catch (error) {
    console.error('Admin getPendingVerifications Error:', error);
    res.status(500).json({ success: false, message: 'Error fetching pending verifications' });
  }
};

// Update verification status (Admin only)
exports.updateVerificationStatus = async (req, res) => {
  try {
    const adminId = req.userId;
    const isAdmin = await checkAdmin(adminId);
    if (!isAdmin) return res.status(403).json({ success: false, message: 'Forbidden' });

    const { userId, status } = req.body; // status: 'approved' | 'rejected'
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.verificationStatus = status;
    if (status === 'approved' && user.role === 'broker') {
      user.isVerifiedBroker = true;
    } else if (status === 'rejected') {
      user.isVerifiedBroker = false;
    }

    await user.save();

    // Notify user via email (optional but recommended)
    const { sendEmail } = require('../utils/email');
    const text = `Your professional account verification has been ${status}.`;
    sendEmail(user.email, 'Account Verification Update', text, `<p>${text}</p>`)
      .catch(err => console.error('Verification Notification Email Error:', err));

    return res.status(200).json({
      success: true,
      message: `User verification ${status}`,
      user: {
        id: user._id,
        verificationStatus: user.verificationStatus,
        isVerifiedBroker: user.isVerifiedBroker
      }
    });
  } catch (error) {
    console.error('Update Verification Status Error:', error);
    return res.status(500).json({ success: false, message: 'Error updating verification status' });
  }
};

// Toggle user block status (Admin only)
exports.toggleUserBlock = async (req, res) => {
  try {
    const adminId = req.userId;
    const isAdmin = await checkAdmin(adminId);
    if (!isAdmin) return res.status(403).json({ success: false, message: 'Forbidden' });

    const { userId, status } = req.body; // status: 'active' | 'blocked'
    if (!['active', 'blocked'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Prevent blocking oneself
    if (user._id.toString() === adminId.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot block your own account' });
    }

    user.status = status;
    await user.save();

    return res.status(200).json({
      success: true,
      message: `User status updated to ${status}`,
      user: {
        id: user._id,
        status: user.status
      }
    });
  } catch (error) {
    console.error('Toggle User Block Error:', error);
    return res.status(500).json({ success: false, message: 'Error toggling user block status' });
  }
};

// Placeholder routes for admin auth if needed, but normally handled by main auth
exports.signup = (req, res) => res.status(405).json({ message: 'Use main signup' });
exports.signin = (req, res) => res.status(405).json({ message: 'Use main signin' });

