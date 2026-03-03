const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const User = require('../models/User');
const { sendEmail } = require('../utils/email');

// ... existing code ...

// Get authenticated user data
// ... (getUser code remains same) ...

// Update user notification settings
// ... (updateSettings code remains same) ...

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const { name, phone } = req.body;
    let avatar = req.body.avatar;

    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Handle profile picture upload
    if (req.file) {
      // Delete old avatar if it exists and is a local file
      if (user.avatar && user.avatar.startsWith('/uploads/avatars/')) {
        const oldPath = path.join(__dirname, '..', '..', user.avatar);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
      avatar = `/uploads/avatars/${req.file.filename}`;
    }

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (avatar) user.avatar = avatar;

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Update Profile Error:', error);
    return res.status(500).json({ success: false, message: 'Error updating profile' });
  }
};

// Change password
exports.changePassword = async (req, res) => {
  try {
    const userId = req.userId;
    const { currentPassword, newPassword } = req.body;

    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Current and new password are required' });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Incorrect current password' });
    }

    // Hash and save new password
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return res.status(200).json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change Password Error:', error);
    return res.status(500).json({ success: false, message: 'Error changing password' });
  }
};

// Generate JWT Token
const generateToken = (userId) => {
  if (!process.env.JWT_SECRET) {
    console.error('FATAL: JWT_SECRET environment variable is missing');
  }
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET || 'your_super_secret_jwt_key',
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

// Sign Up
exports.signup = async (req, res) => {
  try {
    const { name, email, phone, password, role, agencyName, licenseNumber } = req.body;

    // handle uploaded files (if any)
    let cnic_front = req.body.cnic_front || null;
    let cnic_back = req.body.cnic_back || null;
    let licenseDocument = req.body.licenseDocument || null;
    if (req.files) {
      if (req.files.cnicFront && req.files.cnicFront[0]) {
        cnic_front = `/uploads/cnic/${req.files.cnicFront[0].filename}`;
      }
      if (req.files.cnicBack && req.files.cnicBack[0]) {
        cnic_back = `/uploads/cnic/${req.files.cnicBack[0].filename}`;
      }
      if (req.files.licenseDocument && req.files.licenseDocument[0]) {
        licenseDocument = `/uploads/license/${req.files.licenseDocument[0].filename}`;
      }
    }

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required'
      });
    }

    // If user is a broker, require agency info and license
    if (role === 'broker') {
      if (!agencyName || !licenseNumber) {
        return res.status(400).json({ success: false, message: 'Agency name and license number are required for brokers' });
      }
      if (!licenseDocument) {
        return res.status(400).json({ success: false, message: 'License document upload is required for brokers' });
      }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email }).lean();
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate OTP
    const otp = generateOTP(6);
    const otpExpires = Date.now() + (10 * 60 * 1000); // 10 minutes

    // Create user document
    const userDoc = await User.create({
      name,
      email,
      phone: phone || null,
      password: hashedPassword,
      role: role || 'buyer',
      cnic_front: cnic_front || null,
      cnic_back: cnic_back || null,
      agencyName: agencyName || null,
      licenseNumber: licenseNumber || null,
      licenseDocument: licenseDocument || null,
      emailOTP: otp,
      otpExpires: otpExpires,
      verificationStatus: (role === 'broker' || role === 'seller') ? 'pending' : 'unverified'
    });

    // Send OTP Email (don't await to avoid delaying response, but handle errors internally)
    const text = `Your verification OTP is ${otp}. It will expire in 10 minutes.`;
    sendEmail(userDoc.email, 'Email Verification OTP', text, `<p>${text}</p>`)
      .catch(err => console.error('Sign Up OTP Email Error:', err));

    // Generate token
    const token = generateToken(userDoc._id);

    const userResponse = {
      id: userDoc._id,
      name: userDoc.name,
      email: userDoc.email,
      phone: userDoc.phone,
      role: userDoc.role,
      verified: userDoc.verified,
      created_at: userDoc.created_at
    };

    return res.status(201).json({ success: true, message: 'Account created successfully', token, user: userResponse });

  } catch (error) {
    console.error('Sign Up Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error creating account',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Sign In
exports.signin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Check user status
    if (user.status === 'blocked') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been suspended. Please contact support for assistance.'
      });
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Generate token
    const token = generateToken(user._id);

    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      verified: user.verified,
      created_at: user.created_at
    };

    return res.status(200).json({ success: true, message: 'Sign in successful', token, user: userData });

  } catch (error) {
    console.error('Sign In Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error signing in',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Generate simple numeric OTP
function generateOTP(length = 6) {
  let otp = '';
  for (let i = 0; i < length; i++) otp += Math.floor(Math.random() * 10);
  return otp;
}

// Send OTP for email verification or password reset
exports.sendOtp = async (req, res) => {
  try {
    const { email, purpose } = req.body; // purpose: 'verify' | 'reset'
    if (!email) return res.status(400).json({ success: false, message: 'Email is required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const otp = generateOTP(6);
    user.emailOTP = otp;
    user.otpExpires = Date.now() + (10 * 60 * 1000); // 10 minutes
    await user.save();

    const subject = purpose === 'reset' ? 'Password Reset OTP' : 'Email Verification OTP';
    const text = `Your OTP is ${otp}. It will expire in 10 minutes.`;

    await sendEmail(user.email, subject, text, `<p>${text}</p>`).catch(err => console.error('Email send error', err));

    return res.status(200).json({ success: true, message: 'OTP sent to email' });
  } catch (error) {
    console.error('Send OTP Error:', error);
    return res.status(500).json({ success: false, message: 'Error sending OTP' });
  }
};

// Verify OTP (email verification)
exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ success: false, message: 'Email and OTP are required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (!user.emailOTP || !user.otpExpires || Date.now() > user.otpExpires) {
      return res.status(400).json({ success: false, message: 'OTP expired or not set' });
    }

    if (user.emailOTP !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }

    user.verified = true;
    user.emailOTP = undefined;
    user.otpExpires = undefined;
    await user.save();

    return res.status(200).json({ success: true, message: 'Email verified successfully' });
  } catch (error) {
    console.error('Verify OTP Error:', error);
    return res.status(500).json({ success: false, message: 'Error verifying OTP' });
  }
};

// Forgot password -> send OTP (reuse sendOtp with purpose reset)
exports.forgotPassword = async (req, res) => {
  req.body.purpose = 'reset';
  return exports.sendOtp(req, res);
};

// Reset password using OTP
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) return res.status(400).json({ success: false, message: 'Email, OTP and newPassword are required' });

    if (newPassword.length < 6) return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (!user.emailOTP || !user.otpExpires || Date.now() > user.otpExpires) {
      return res.status(400).json({ success: false, message: 'OTP expired or not set' });
    }

    if (user.emailOTP !== otp) return res.status(400).json({ success: false, message: 'Invalid OTP' });

    user.password = await bcrypt.hash(newPassword, 10);
    user.emailOTP = undefined;
    user.otpExpires = undefined;
    await user.save();

    return res.status(200).json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset Password Error:', error);
    return res.status(500).json({ success: false, message: 'Error resetting password' });
  }
};

// Resend email verification OTP
exports.resendVerification = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email is required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (user.verified) return res.status(400).json({ success: false, message: 'Email already verified' });

    req.body.purpose = 'verify';
    return exports.sendOtp(req, res);
  } catch (error) {
    console.error('Resend Verification Error:', error);
    return res.status(500).json({ success: false, message: 'Error resending verification OTP' });
  }
};

// Get authenticated user data
exports.getUser = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const user = await User.findById(userId).lean();
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Exclude sensitive fields
    const { password, emailOTP, otpExpires, __v, ...safeUser } = user;
    // normalize id
    safeUser.id = safeUser._id;
    delete safeUser._id;

    return res.status(200).json({ success: true, user: safeUser });
  } catch (error) {
    console.error('Get User Error:', error);
    return res.status(500).json({ success: false, message: 'Error fetching user data' });
  }
};

// Update user notification settings
exports.updateSettings = async (req, res) => {
  try {
    const userId = req.userId;
    const { email, push, chat } = req.body;

    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Update settings only if provided in request body
    if (typeof email === 'boolean') user.notificationSettings.email = email;
    if (typeof push === 'boolean') user.notificationSettings.push = push;
    if (typeof chat === 'boolean') user.notificationSettings.chat = chat;

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Settings updated successfully',
      settings: user.notificationSettings
    });
  } catch (error) {
    console.error('Update Settings Error:', error);
    return res.status(500).json({ success: false, message: 'Error updating settings' });
  }
};

// Update verification status (Admin only)
exports.updateVerificationStatus = async (req, res) => {
  try {
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
