const axios = require('axios');
const OpenAI = require('openai');
const News = require('../models/News');

class NewsAggregator {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    this.newsApiKey = process.env.NEWS_API_KEY;
    this.newsdataApiKey = process.env.NEWSDATA_API_KEY;
  }

  // Fetch news from News API
  async fetchFromNewsAPI(category = 'general', country = 'us') {
    try {
      if (!this.newsApiKey) {
        console.log('News API key not configured');
        return [];
      }

      const response = await axios.get('https://newsapi.org/v2/top-headlines', {
        params: {
          apiKey: this.newsApiKey,
          category,
          country,
          pageSize: 20,
        },
        timeout: 10000,
      });

      return response.data.articles || [];
    } catch (error) {
      console.error('Error fetching from News API:', error.message);
      return [];
    }
  }

  // Fetch news from NewsData API
  async fetchFromNewsDataAPI(category = 'top') {
    try {
      if (!this.newsdataApiKey) {
        console.log('NewsData API key not configured');
        return [];
      }

      const response = await axios.get('https://newsdata.io/api/1/news', {
        params: {
          apikey: this.newsdataApiKey,
          category,
          language: 'en',
          size: 20,
        },
        timeout: 10000,
      });

      return response.data.results || [];
    } catch (error) {
      console.error('Error fetching from NewsData API:', error.message);
      return [];
    }
  }

  // Summarize article content using OpenAI
  async summarizeContent(title, content) {
    try {
      if (!this.openai.apiKey) {
        console.log('OpenAI API key not configured, using title as summary');
        return title.length > 150 ? title.substring(0, 147) + '...' : title;
      }

      const text = content || title;
      if (text.length < 100) {
        return text;
      }

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a news summarizer. Create a concise 1-2 sentence summary (max 150 characters) of the news article. Focus on the key facts and main point.',
          },
          {
            role: 'user',
            content: `Summarize this news article: ${text}`,
          },
        ],
        max_tokens: 100,
        temperature: 0.3,
      });

      const summary = completion.choices[0]?.message?.content?.trim();
      return summary || title.substring(0, 150);
    } catch (error) {
      console.error('Error summarizing content:', error.message);
      return title.length > 150 ? title.substring(0, 147) + '...' : title;
    }
  }

  // Calculate relevance score based on various factors
  calculateRelevanceScore(article, publishedAt) {
    let score = 50; // Base score

    // Recency score (0-25 points)
    const hoursOld = (Date.now() - publishedAt.getTime()) / (1000 * 60 * 60);
    if (hoursOld < 1) score += 25;
    else if (hoursOld < 6) score += 20;
    else if (hoursOld < 24) score += 15;
    else if (hoursOld < 72) score += 10;
    else score += 5;

    // Content quality score (0-25 points)
    const hasImage = article.urlToImage || article.image_url;
    const hasContent = article.content || article.description;
    const titleLength = article.title?.length || 0;

    if (hasImage) score += 8;
    if (hasContent && hasContent.length > 200) score += 10;
    if (titleLength > 30 && titleLength < 100) score += 7;

    return Math.min(score, 100);
  }

  // Normalize article data from different sources
  normalizeArticle(article, source) {
    const publishedAt = new Date(article.publishedAt || article.pubDate);
    
    return {
      title: article.title,
      content: article.content || article.description || '',
      url: article.url || article.link,
      imageUrl: article.urlToImage || article.image_url || null,
      source: article.source?.name || source,
      publishedAt,
      relevanceScore: this.calculateRelevanceScore(article, publishedAt),
    };
  }

  // Determine article category
  categorizeArticle(title, content) {
    const text = `${title} ${content}`.toLowerCase();
    
    const categories = {
      technology: ['tech', 'ai', 'software', 'computer', 'digital', 'cyber', 'startup', 'app'],
      business: ['business', 'economy', 'market', 'financial', 'investment', 'company', 'corporate'],
      sports: ['sport', 'football', 'basketball', 'soccer', 'olympic', 'championship', 'athlete'],
      entertainment: ['movie', 'music', 'celebrity', 'hollywood', 'entertainment', 'film', 'tv'],
      health: ['health', 'medical', 'doctor', 'hospital', 'medicine', 'virus', 'disease'],
      science: ['science', 'research', 'study', 'scientist', 'discovery', 'climate', 'space'],
      politics: ['politics', 'government', 'election', 'president', 'minister', 'policy', 'law'],
    };

    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => text.includes(keyword))) {
        return category;
      }
    }

    return 'general';
  }

  // Aggregate news from all sources
  async aggregateNews() {
    console.log('🔄 Starting news aggregation...');
    
    try {
      const categories = ['general', 'technology', 'business', 'sports', 'entertainment', 'health', 'science'];
      const allArticles = [];

      // Fetch from multiple sources
      for (const category of categories) {
        const [newsApiArticles, newsdataArticles] = await Promise.all([
          this.fetchFromNewsAPI(category),
          this.fetchFromNewsDataAPI(category),
        ]);

        // Normalize articles
        const normalizedNewsApi = newsApiArticles.map(article => 
          this.normalizeArticle(article, 'NewsAPI')
        );
        const normalizedNewsData = newsdataArticles.map(article => 
          this.normalizeArticle(article, 'NewsData')
        );

        allArticles.push(...normalizedNewsApi, ...normalizedNewsData);
      }

      console.log(`📰 Fetched ${allArticles.length} articles`);

      // Remove duplicates based on URL
      const uniqueArticles = allArticles.filter((article, index, self) =>
        index === self.findIndex(a => a.url === article.url)
      );

      console.log(`🔄 Processing ${uniqueArticles.length} unique articles`);

      // Process and save articles
      const savedArticles = [];
      for (const article of uniqueArticles) {
        try {
          // Check if article already exists
          const existingArticle = await News.findOne({ url: article.url });
          if (existingArticle) {
            continue;
          }

          // Generate summary
          const summary = await this.summarizeContent(article.title, article.content);
          
          // Determine category
          const category = this.categorizeArticle(article.title, article.content);

          // Create news document
          const newsDoc = new News({
            ...article,
            summary,
            category,
          });

          await newsDoc.save();
          savedArticles.push(newsDoc);
        } catch (error) {
          console.error(`Error processing article: ${article.title}`, error.message);
        }
      }

      console.log(`✅ Successfully saved ${savedArticles.length} new articles`);
      
      // Clean up old articles (keep last 7 days)
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      await News.deleteMany({ publishedAt: { $lt: weekAgo } });
      
      return savedArticles;
    } catch (error) {
      console.error('❌ Error in news aggregation:', error);
      throw error;
    }
  }
}

module.exports = NewsAggregator;
