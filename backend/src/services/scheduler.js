const cron = require('node-cron');
const NewsAggregator = require('./NewsAggregator');

const aggregator = new NewsAggregator();

// Schedule news aggregation every 30 minutes
const startNewsAggregation = () => {
  console.log('📅 Starting news aggregation scheduler...');
  
  // Run immediately on startup
  aggregator.aggregateNews().catch(console.error);
  
  // Schedule every 30 minutes
  cron.schedule('*/30 * * * *', async () => {
    console.log('🔄 Running scheduled news aggregation...');
    try {
      await aggregator.aggregateNews();
    } catch (error) {
      console.error('❌ Scheduled aggregation failed:', error);
    }
  });
  
  console.log('✅ News aggregation scheduler started');
};

module.exports = {
  startNewsAggregation,
  aggregator,
};
