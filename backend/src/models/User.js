const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    sparse: true, // Allow null for guest users
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    minlength: 6,
  },
  isGuest: {
    type: Boolean,
    default: false,
  },
  guestId: {
    type: String,
    unique: true,
    sparse: true,
  },
  profile: {
    name: {
      type: String,
      trim: true,
      maxlength: 50,
    },
    avatar: {
      type: String,
      default: null,
    },
  },
  preferences: {
    categories: [{
      type: String,
      enum: ['technology', 'business', 'sports', 'entertainment', 'health', 'science', 'politics', 'general'],
    }],
    language: {
      type: String,
      default: 'en',
      enum: ['en', 'ko', 'es', 'fr', 'de', 'ja'],
    },
    theme: {
      type: String,
      default: 'light',
      enum: ['light', 'dark', 'auto'],
    },
    notifications: {
      enabled: {
        type: Boolean,
        default: true,
      },
      frequency: {
        type: String,
        default: 'daily',
        enum: ['realtime', 'hourly', 'daily', 'weekly'],
      },
    },
  },
  interactions: [{
    newsId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'News',
      required: true,
    },
    action: {
      type: String,
      required: true,
      enum: ['view', 'click', 'share', 'like', 'bookmark'],
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  }],
  lastActive: {
    type: Date,
    default: Date.now,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ guestId: 1 });
userSchema.index({ 'interactions.newsId': 1 });
userSchema.index({ lastActive: -1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) {
    return false;
  }
  return bcrypt.compare(candidatePassword, this.password);
};

// Update last active timestamp
userSchema.methods.updateLastActive = function() {
  this.lastActive = new Date();
  return this.save();
};

// Add interaction
userSchema.methods.addInteraction = function(newsId, action) {
  const interaction = {
    newsId,
    action,
    timestamp: new Date(),
  };
  
  this.interactions.push(interaction);
  
  // Keep only last 1000 interactions
  if (this.interactions.length > 1000) {
    this.interactions = this.interactions.slice(-1000);
  }
  
  return this.save();
};

// Get user's preferred categories based on interactions
userSchema.methods.getPreferredCategories = async function() {
  const News = mongoose.model('News');
  
  // Get categories from recent interactions
  const recentInteractions = this.interactions
    .filter(interaction => 
      ['view', 'click', 'like'].includes(interaction.action) &&
      Date.now() - interaction.timestamp.getTime() < 30 * 24 * 60 * 60 * 1000 // Last 30 days
    )
    .slice(-100); // Last 100 interactions
  
  if (recentInteractions.length === 0) {
    return this.preferences.categories || ['general'];
  }
  
  const newsIds = recentInteractions.map(i => i.newsId);
  const newsArticles = await News.find({ _id: { $in: newsIds } }).select('category');
  
  const categoryCount = {};
  newsArticles.forEach(article => {
    categoryCount[article.category] = (categoryCount[article.category] || 0) + 1;
  });
  
  // Return top 3 categories
  return Object.entries(categoryCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)
    .map(([category]) => category);
};

module.exports = mongoose.model('User', userSchema);
