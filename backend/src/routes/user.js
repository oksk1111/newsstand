const express = require('express');
const { body, validationResult } = require('express-validator');
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

// GET /api/user/preferences - Get user preferences
router.get('/preferences', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('preferences');
        if (!user) {
            return res.status(404).json({
                error: 'User not found',
            });
        }

        res.json({
            success: true,
            preferences: user.preferences,
        });
    } catch (error) {
        console.error('Error fetching preferences:', error);
        res.status(500).json({
            error: 'Failed to fetch preferences',
            message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
        });
    }
});

// PUT /api/user/preferences - Update user preferences
router.put('/preferences', [
    auth,
    body('categories').optional().isArray(),
    body('categories.*').optional().isIn(['technology', 'business', 'sports', 'entertainment', 'health', 'science', 'politics', 'general']),
    body('language').optional().isIn(['en', 'ko', 'es', 'fr', 'de', 'ja']),
    body('theme').optional().isIn(['light', 'dark', 'auto']),
    body('notifications.enabled').optional().isBoolean(),
    body('notifications.frequency').optional().isIn(['realtime', 'hourly', 'daily', 'weekly']),
], handleValidationErrors, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({
                error: 'User not found',
            });
        }

        const {
            categories,
            language,
            theme,
            notifications,
        } = req.body;

        // Update preferences
        if (categories !== undefined) {
            user.preferences.categories = categories;
        }
        if (language !== undefined) {
            user.preferences.language = language;
        }
        if (theme !== undefined) {
            user.preferences.theme = theme;
        }
        if (notifications !== undefined) {
            if (notifications.enabled !== undefined) {
                user.preferences.notifications.enabled = notifications.enabled;
            }
            if (notifications.frequency !== undefined) {
                user.preferences.notifications.frequency = notifications.frequency;
            }
        }

        await user.save();

        res.json({
            success: true,
            message: 'Preferences updated successfully',
            preferences: user.preferences,
        });
    } catch (error) {
        console.error('Error updating preferences:', error);
        res.status(500).json({
            error: 'Failed to update preferences',
            message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
        });
    }
});

// GET /api/user/profile - Get user profile
router.get('/profile', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password -interactions');
        if (!user) {
            return res.status(404).json({
                error: 'User not found',
            });
        }

        res.json({
            success: true,
            profile: {
                id: user._id,
                email: user.email,
                name: user.profile.name,
                avatar: user.profile.avatar,
                isGuest: user.isGuest,
                preferences: user.preferences,
                lastActive: user.lastActive,
                createdAt: user.createdAt,
            },
        });
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({
            error: 'Failed to fetch profile',
            message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
        });
    }
});

// PUT /api/user/profile - Update user profile
router.put('/profile', [
    auth,
    body('name').optional().trim().isLength({ min: 1, max: 50 }),
    body('avatar').optional().isURL(),
], handleValidationErrors, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({
                error: 'User not found',
            });
        }

        const { name, avatar } = req.body;

        // Update profile
        if (name !== undefined) {
            user.profile.name = name;
        }
        if (avatar !== undefined) {
            user.profile.avatar = avatar;
        }

        await user.save();

        res.json({
            success: true,
            message: 'Profile updated successfully',
            profile: {
                name: user.profile.name,
                avatar: user.profile.avatar,
            },
        });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({
            error: 'Failed to update profile',
            message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
        });
    }
});

// GET /api/user/interactions - Get user interaction history
router.get('/interactions', auth, async (req, res) => {
    try {
        const { limit = 50, offset = 0 } = req.query;

        const user = await User.findById(req.user.id)
            .select('interactions')
            .populate('interactions.newsId', 'title url publishedAt category');

        if (!user) {
            return res.status(404).json({
                error: 'User not found',
            });
        }

        // Sort interactions by timestamp (most recent first)
        const sortedInteractions = user.interactions
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(parseInt(offset), parseInt(offset) + parseInt(limit));

        res.json({
            success: true,
            data: sortedInteractions,
            pagination: {
                limit: parseInt(limit),
                offset: parseInt(offset),
                total: user.interactions.length,
            },
        });
    } catch (error) {
        console.error('Error fetching interactions:', error);
        res.status(500).json({
            error: 'Failed to fetch interactions',
            message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
        });
    }
});

// GET /api/user/stats - Get user statistics
router.get('/stats', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('interactions preferences createdAt');
        if (!user) {
            return res.status(404).json({
                error: 'User not found',
            });
        }

        // Calculate statistics
        const totalInteractions = user.interactions.length;
        const interactionsByAction = user.interactions.reduce((acc, interaction) => {
            acc[interaction.action] = (acc[interaction.action] || 0) + 1;
            return acc;
        }, {});

        // Recent activity (last 7 days)
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const recentInteractions = user.interactions.filter(
            interaction => interaction.timestamp >= weekAgo
        );

        // Preferred categories based on interactions
        const preferredCategories = await user.getPreferredCategories();

        res.json({
            success: true,
            stats: {
                totalInteractions,
                interactionsByAction,
                recentActivity: recentInteractions.length,
                preferredCategories,
                accountAge: Math.floor((Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24)),
                isGuest: user.isGuest,
            },
        });
    } catch (error) {
        console.error('Error fetching user stats:', error);
        res.status(500).json({
            error: 'Failed to fetch user statistics',
            message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
        });
    }
});

// DELETE /api/user/account - Delete user account
router.delete('/account', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({
                error: 'User not found',
            });
        }

        // Soft delete - mark as inactive instead of hard delete
        user.isActive = false;
        user.email = user.email ? `deleted_${Date.now()}_${user.email}` : undefined;
        await user.save();

        res.json({
            success: true,
            message: 'Account deleted successfully',
        });
    } catch (error) {
        console.error('Error deleting account:', error);
        res.status(500).json({
            error: 'Failed to delete account',
            message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
        });
    }
});

module.exports = router;
