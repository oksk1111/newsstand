const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const User = require('../models/User');
const auth = require('../middleware/auth').auth;

const router = express.Router();

// Validation middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array(),
    });
  }
  next();
};

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

// POST /api/auth/register - Register new user
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('name').optional().trim().isLength({ min: 1, max: 50 }),
], handleValidationErrors, async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        error: 'User already exists with this email',
      });
    }

    // Create new user
    const user = new User({
      email,
      password,
      profile: { name },
      isGuest: false,
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.profile.name,
        isGuest: false,
        preferences: user.preferences,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      error: 'Registration failed',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
});

// POST /api/auth/login - Login user
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
], handleValidationErrors, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email, isActive: true });
    if (!user) {
      return res.status(401).json({
        error: 'Invalid credentials',
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Invalid credentials',
      });
    }

    // Update last active
    await user.updateLastActive();

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.profile.name,
        isGuest: false,
        preferences: user.preferences,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Login failed',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
});

// POST /api/auth/guest - Create guest session
router.post('/guest', async (req, res) => {
  try {
    // Generate unique guest ID
    const guestId = uuidv4();

    // Create guest user
    const user = new User({
      isGuest: true,
      guestId,
      preferences: {
        categories: ['general'],
        language: 'en',
        theme: 'light',
      },
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Guest session created',
      token,
      user: {
        id: user._id,
        guestId: user.guestId,
        isGuest: true,
        preferences: user.preferences,
      },
    });
  } catch (error) {
    console.error('Guest session error:', error);
    res.status(500).json({
      error: 'Failed to create guest session',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
});

// POST /api/auth/guest/convert - Convert guest to registered user
router.post('/guest/convert', [
  auth,
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('name').optional().trim().isLength({ min: 1, max: 50 }),
], handleValidationErrors, async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Get current user
    const user = await User.findById(req.user.id);
    if (!user || !user.isGuest) {
      return res.status(400).json({
        error: 'Invalid guest session',
      });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        error: 'User already exists with this email',
      });
    }

    // Convert guest to registered user
    user.email = email;
    user.password = password;
    user.profile.name = name;
    user.isGuest = false;
    user.guestId = undefined;

    await user.save();

    res.json({
      success: true,
      message: 'Guest account converted successfully',
      user: {
        id: user._id,
        email: user.email,
        name: user.profile.name,
        isGuest: false,
        preferences: user.preferences,
      },
    });
  } catch (error) {
    console.error('Guest conversion error:', error);
    res.status(500).json({
      error: 'Failed to convert guest account',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
});

// GET /api/auth/me - Get current user
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password -interactions');
    if (!user) {
      return res.status(404).json({
        error: 'User not found',
      });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        name: user.profile.name,
        avatar: user.profile.avatar,
        isGuest: user.isGuest,
        guestId: user.guestId,
        preferences: user.preferences,
        lastActive: user.lastActive,
      },
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      error: 'Failed to get user information',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
});

// POST /api/auth/refresh - Refresh token
router.post('/refresh', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || !user.isActive) {
      return res.status(401).json({
        error: 'Invalid session',
      });
    }

    // Update last active
    await user.updateLastActive();

    // Generate new token
    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({
      error: 'Failed to refresh token',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
});

// POST /api/auth/logout - Logout (for completeness, mainly handled client-side)
router.post('/logout', auth, async (req, res) => {
  try {
    // Update last active
    const user = await User.findById(req.user.id);
    if (user) {
      await user.updateLastActive();
    }

    res.json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      error: 'Logout failed',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
});

module.exports = router;
