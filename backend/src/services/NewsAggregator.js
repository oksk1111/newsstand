class NewsAggregator {
  constructor() {
    console.log('NewsAggregator initialized');
  }
  
  async aggregateNews() {
    console.log('Aggregating sample news...');
    return [
      {
        id: '1',
        title: 'Sample News Article',
        content: 'This is sample content for development',
        category: 'general',
        publishedAt: new Date(),
        source: 'Sample Source'
      }
    ];
  }
}

module.exports = NewsAggregator;
