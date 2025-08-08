const express = require('express');
const { body, query, validationResult } = require('express-validator');
const News = require('../models/News');
const User = require('../models/User');
const { auth, optionalAuth } = require('../middleware/auth');

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

// GET /api/news - Get news feed
router.get('/', [
  query('category').optional().isIn(['technology', 'business', 'sports', 'entertainment', 'health', 'science', 'politics', 'general', 'all']),
  query('limit').optional().isInt({ min: 1, max: 50 }),
  query('offset').optional().isInt({ min: 0 }),
  query('sort').optional().isIn(['latest', 'trending']),
], optionalAuth, handleValidationErrors, async (req, res) => {
  try {
    const {
      category = 'all',
      limit = 10,
      offset = 0,
      sort = 'trending',
    } = req.query;

    let news;
    if (sort === 'latest') {
      news = await News.getLatest(parseInt(limit), category);
    } else {
      news = await News.getTrending(parseInt(limit), category);
    }

    // Skip offset items
    const paginatedNews = news.slice(parseInt(offset));

    // Track view interactions for authenticated users
    if (req.user && !req.user.isGuest) {
      const newsIds = paginatedNews.map(article => article._id);
      const user = await User.findById(req.user.id);
      
      if (user) {
        // Add view interactions (bulk operation would be better for production)
        for (const newsId of newsIds.slice(0, 5)) { // Track first 5 viewed
          await user.addInteraction(newsId, 'view');
        }
      }
    }

    res.json({
      success: true,
      data: paginatedNews,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: news.length,
      },
      metadata: {
        category,
        sort,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Error fetching news:', error);
    res.status(500).json({
      error: 'Failed to fetch news',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
});

// GET /api/news/personalized - Get personalized news feed (requires auth)
router.get('/personalized', auth, async (req, res) => {
  try {
    const {
      limit = 10,
      offset = 0,
    } = req.query;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        error: 'User not found',
      });
    }

    // Get user's preferred categories
    const preferredCategories = await user.getPreferredCategories();
    
    // Fetch news from preferred categories
    const query = {
      isActive: true,
      category: { $in: preferredCategories },
    };

    const news = await News.find(query)
      .sort({ relevanceScore: -1, publishedAt: -1 })
      .skip(parseInt(offset))
      .limit(parseInt(limit))
      .select('-content -__v');

    // If not enough personalized news, fill with trending
    if (news.length < limit) {
      const remainingLimit = limit - news.length;
      const trendingNews = await News.getTrending(remainingLimit);
      
      // Add trending news that's not already in the personalized list
      const existingIds = new Set(news.map(n => n._id.toString()));
      const additionalNews = trendingNews.filter(n => !existingIds.has(n._id.toString()));
      
      news.push(...additionalNews);
    }

    res.json({
      success: true,
      data: news,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
      },
      metadata: {
        personalized: true,
        preferredCategories,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Error fetching personalized news:', error);
    res.status(500).json({
      error: 'Failed to fetch personalized news',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
});

// GET /api/news/:id - Get single news article
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const news = await News.findById(id);
    if (!news || !news.isActive) {
      return res.status(404).json({
        error: 'News article not found',
      });
    }

    // Increment relevance score
    await news.incrementRelevance(1);

    // Track click interaction for authenticated users
    if (req.user && !req.user.isGuest) {
      const user = await User.findById(req.user.id);
      if (user) {
        await user.addInteraction(news._id, 'click');
      }
    }

    res.json({
      success: true,
      data: news,
    });
  } catch (error) {
    console.error('Error fetching news article:', error);
    res.status(500).json({
      error: 'Failed to fetch news article',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
});

// POST /api/news/:id/interact - Record user interaction
router.post('/:id/interact', [
  auth,
  body('action').isIn(['view', 'click', 'share', 'like', 'bookmark']),
], handleValidationErrors, async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body;

    const news = await News.findById(id);
    if (!news || !news.isActive) {
      return res.status(404).json({
        error: 'News article not found',
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        error: 'User not found',
      });
    }

    // Add interaction
    await user.addInteraction(news._id, action);

    // Increment relevance for certain actions
    if (['click', 'like', 'share'].includes(action)) {
      await news.incrementRelevance(action === 'like' ? 3 : 2);
    }

    res.json({
      success: true,
      message: 'Interaction recorded',
    });
  } catch (error) {
    console.error('Error recording interaction:', error);
    res.status(500).json({
      error: 'Failed to record interaction',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
});

// GET /api/news/categories/stats - Get category statistics
router.get('/categories/stats', async (req, res) => {
  try {
    const stats = await News.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          avgRelevance: { $avg: '$relevanceScore' },
          latestArticle: { $max: '$publishedAt' },
        },
      },
      { $sort: { count: -1 } },
    ]);

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Error fetching category stats:', error);
    res.status(500).json({
      error: 'Failed to fetch category statistics',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
});

// GET /api/news/search - Search news articles
router.get('/search', [
  query('q').notEmpty().trim().isLength({ min: 2, max: 100 }),
  query('limit').optional().isInt({ min: 1, max: 50 }),
  query('category').optional().isIn(['technology', 'business', 'sports', 'entertainment', 'health', 'science', 'politics', 'general']),
], handleValidationErrors, async (req, res) => {
  try {
    const {
      q: searchQuery,
      limit = 10,
      category,
    } = req.query;

    const query = {
      isActive: true,
      $text: { $search: searchQuery },
    };

    if (category) {
      query.category = category;
    }

    const news = await News.find(query, { score: { $meta: 'textScore' } })
      .sort({ score: { $meta: 'textScore' }, publishedAt: -1 })
      .limit(parseInt(limit))
      .select('-content -__v');

    res.json({
      success: true,
      data: news,
      metadata: {
        query: searchQuery,
        category,
        count: news.length,
      },
    });
  } catch (error) {
    console.error('Error searching news:', error);
    res.status(500).json({
      error: 'Failed to search news',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
});

module.exports = router;
