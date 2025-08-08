const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        error: 'Access denied. No token provided.',
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Verify user still exists and is active
      const user = await User.findById(decoded.id).select('_id isActive isGuest');
      if (!user || !user.isActive) {
        return res.status(401).json({
          error: 'Invalid token. User not found or inactive.',
        });
      }

      req.user = {
        id: decoded.id,
        isGuest: user.isGuest,
      };
      
      next();
    } catch (jwtError) {
      return res.status(401).json({
        error: 'Invalid token.',
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({
      error: 'Authentication failed',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
};

// Optional auth middleware - doesn't fail if no token provided
const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return next();
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      const user = await User.findById(decoded.id).select('_id isActive isGuest');
      if (user && user.isActive) {
        req.user = {
          id: decoded.id,
          isGuest: user.isGuest,
        };
      }
    } catch (jwtError) {
      // Continue without auth if token is invalid
    }

    next();
  } catch (error) {
    console.error('Optional auth middleware error:', error);
    next();
  }
};

module.exports = {
  auth,
  optionalAuth,
};
