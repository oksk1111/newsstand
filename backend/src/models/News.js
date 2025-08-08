const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200,
  },
  summary: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500,
  },
  content: {
    type: String,
    trim: true,
  },
  url: {
    type: String,
    required: true,
    unique: true,
  },
  imageUrl: {
    type: String,
    default: null,
  },
  source: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: String,
    required: true,
    enum: ['technology', 'business', 'sports', 'entertainment', 'health', 'science', 'politics', 'general'],
    default: 'general',
  },
  publishedAt: {
    type: Date,
    required: true,
  },
  relevanceScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  tags: [{
    type: String,
    trim: true,
  }],
  sentiment: {
    type: String,
    enum: ['positive', 'negative', 'neutral'],
    default: 'neutral',
  },
}, {
  timestamps: true,
  indexes: [
    { publishedAt: -1 },
    { category: 1 },
    { relevanceScore: -1 },
    { isActive: 1 },
    { source: 1 },
  ],
});

// Index for full-text search
newsSchema.index({
  title: 'text',
  summary: 'text',
  tags: 'text',
});

// Static method to get trending news
newsSchema.statics.getTrending = function(limit = 10, category = null) {
  const query = { isActive: true };
  if (category && category !== 'all') {
    query.category = category;
  }
  
  return this.find(query)
    .sort({ relevanceScore: -1, publishedAt: -1 })
    .limit(limit)
    .select('-content -__v');
};

// Static method to get latest news
newsSchema.statics.getLatest = function(limit = 10, category = null) {
  const query = { isActive: true };
  if (category && category !== 'all') {
    query.category = category;
  }
  
  return this.find(query)
    .sort({ publishedAt: -1 })
    .limit(limit)
    .select('-content -__v');
};

// Method to increment relevance score
newsSchema.methods.incrementRelevance = function(points = 1) {
  this.relevanceScore = Math.min(this.relevanceScore + points, 100);
  return this.save();
};

module.exports = mongoose.model('News', newsSchema);
