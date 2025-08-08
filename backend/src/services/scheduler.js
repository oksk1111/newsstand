const cron = require('node-cron');
const NewsAggregator = require('./NewsAggregator');

// NewsAggregator 인스턴스 생성
const aggregator = new NewsAggregator();

// Schedule news aggregation every 30 minutes
const startNewsAggregation = () => {
  console.log('📅 Starting news aggregation scheduler...');

  // For development: scheduler is disabled to avoid background API calls
  // To enable automatic news aggregation, uncomment the following:

  // aggregator.aggregateNews().catch(console.error);
  // cron.schedule('*/30 * * * *', async () => {
  //   console.log('🔄 Running scheduled news aggregation...');
  //   try {
  //     await aggregator.aggregateNews();
  //   } catch (error) {
  //     console.error('❌ Scheduled aggregation failed:', error);
  //   }
  // });

  console.log('✅ News aggregation scheduler initialized (manual mode for development)');
  console.log('💡 To trigger news aggregation, call the /api/news endpoint');
};

// Export both the function and aggregator instance
module.exports = {
  startNewsAggregation,
  aggregator,
};
