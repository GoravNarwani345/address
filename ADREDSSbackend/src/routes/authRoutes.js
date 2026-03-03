const express = require('express');
const { signup, signin, sendOtp, verifyOtp, forgotPassword, resetPassword, resendVerification, getUser, updateSettings, updateProfile, changePassword } = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// Sign Up (accept CNIC front and back images)
router.post('/signup', upload.fields([
	{ name: 'cnicFront', maxCount: 1 },
	{ name: 'cnicBack', maxCount: 1 }
	,
	{ name: 'licenseDocument', maxCount: 1 }
]), signup);

// Sign In
router.post('/signin', signin);

// Send OTP (email verification or password reset)
router.post('/send-otp', sendOtp);

// Verify OTP (email verification)
router.post('/verify-otp', verifyOtp);

// Forgot password -> send OTP
router.post('/forgot-password', forgotPassword);

// Reset password using OTP
router.post('/reset-password', resetPassword);

// Resend email verification OTP
router.post('/resend-verification', resendVerification);

// Update notification settings
router.put('/settings', verifyToken, updateSettings);

// Update user profile (name, phone, avatar)
router.put('/profile', verifyToken, upload.single('avatar'), updateProfile);

// Change password
router.put('/change-password', verifyToken, changePassword);

// Get authenticated user data
router.get('/user', verifyToken, getUser);

module.exports = router;
