const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const { isConnected, memoryStore } = require('../config/database');
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

        if (isConnected()) {
            // MongoDB 연결시 기존 로직
            const User = require('../models/User');

            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({
                    error: 'User already exists with this email',
                });
            }

            const user = new User({
                email,
                password,
                profile: { name },
                isGuest: false,
            });

            await user.save();
            const token = generateToken(user._id);

            res.status(201).json({
                success: true,
                data: {
                    user: {
                        id: user._id,
                        email: user.email,
                        name: user.profile.name,
                        isGuest: user.isGuest,
                    },
                    token,
                },
                message: 'User registered successfully',
            });
        } else {
            // 개발 모드: 메모리 저장소 사용
            console.log('📝 Registering user in memory store');

            if (memoryStore.users.has(email)) {
                return res.status(400).json({
                    error: 'User already exists with this email',
                });
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            const userId = uuidv4();
            const user = {
                _id: userId,
                email,
                password: hashedPassword,
                profile: { name: name || 'User' },
                isGuest: false,
                preferences: {
                    categories: ['technology', 'science'],
                    language: 'ko'
                },
                createdAt: new Date(),
                updatedAt: new Date()
            };

            memoryStore.users.set(email, user);
            console.log(`✅ User registered: ${email}`);

            const token = generateToken(userId);

            res.status(201).json({
                success: true,
                data: {
                    user: {
                        id: userId,
                        email: user.email,
                        name: user.profile.name,
                        isGuest: user.isGuest,
                    },
                    token,
                },
                message: 'User registered successfully',
            });
        }
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
    body('password').notEmpty().withMessage('Password is required'),
], handleValidationErrors, async (req, res) => {
    try {
        const { email, password } = req.body;

        if (isConnected()) {
            // MongoDB 연결시 기존 로직
            const User = require('../models/User');

            const user = await User.findOne({ email }).select('+password');
            if (!user || !(await user.comparePassword(password))) {
                return res.status(401).json({
                    error: 'Invalid email or password',
                });
            }

            const token = generateToken(user._id);

            res.json({
                success: true,
                data: {
                    user: {
                        id: user._id,
                        email: user.email,
                        name: user.profile.name,
                        isGuest: user.isGuest,
                    },
                    token,
                },
                message: 'Login successful',
            });
        } else {
            // 개발 모드: 메모리 저장소 사용
            console.log('🔐 Logging in user from memory store');

            const user = memoryStore.users.get(email);
            if (!user) {
                return res.status(401).json({
                    error: 'Invalid email or password',
                });
            }

            const isValidPassword = await bcrypt.compare(password, user.password);
            if (!isValidPassword) {
                return res.status(401).json({
                    error: 'Invalid email or password',
                });
            }

            const token = generateToken(user._id);

            res.json({
                success: true,
                data: {
                    user: {
                        id: user._id,
                        email: user.email,
                        name: user.profile.name,
                        isGuest: user.isGuest,
                    },
                    token,
                },
                message: 'Login successful',
            });
        }
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
        const guestId = uuidv4();

        if (isConnected()) {
            // MongoDB 연결시 기존 로직
            const User = require('../models/User');

            const guestUser = new User({
                guestId,
                isGuest: true,
                preferences: {
                    categories: ['general'],
                    language: 'en',
                },
            });

            await guestUser.save();
            const token = generateToken(guestUser._id);

            res.json({
                success: true,
                data: {
                    user: {
                        id: guestUser._id,
                        guestId: guestUser.guestId,
                        isGuest: true,
                    },
                    token,
                },
                message: 'Guest session created',
            });
        } else {
            // 개발 모드: 메모리 저장소 사용
            console.log('👤 Creating guest session in memory store');

            const userId = uuidv4();
            const guestUser = {
                _id: userId,
                guestId,
                isGuest: true,
                preferences: {
                    categories: ['general'],
                    language: 'en',
                },
                createdAt: new Date(),
                updatedAt: new Date()
            };

            memoryStore.users.set(`guest_${guestId}`, guestUser);
            const token = generateToken(userId);

            res.json({
                success: true,
                data: {
                    user: {
                        id: userId,
                        guestId,
                        isGuest: true,
                    },
                    token,
                },
                message: 'Guest session created',
            });
        }
    } catch (error) {
        console.error('Guest session error:', error);
        res.status(500).json({
            error: 'Failed to create guest session',
            message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
        });
    }
});

module.exports = router;
