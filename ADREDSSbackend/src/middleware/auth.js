const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    if (!process.env.JWT_SECRET) {
      console.error('FATAL: JWT_SECRET environment variable is not set');
      return res.status(500).json({ success: false, message: 'Server configuration error' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    
    const user = await User.findById(decoded.userId).select('role');
    if (user) req.userRole = user.role;
    
    next();

  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};

exports.optionalVerifyToken = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return next();

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    // If token is invalid, just proceed without userId
    next();
  }
};

exports.ensureVerified = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId).select('verified');
    if (!user || !user.verified) {
      return res.status(403).json({
        success: false,
        message: 'Email verification required to perform this action'
      });
    }
    next();
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error during verification check' });
  }
};
