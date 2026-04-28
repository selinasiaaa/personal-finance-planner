const mongoose = require('mongoose');

const marketDataSchema = new mongoose.Schema({
  summary: {
    trend: String,
    topPerformer: String,
    performanceReading: String,
    riskLevel: String,
  },
  news: [{
    title: String,
    source: String,
    timeLabel: String,
    link: String
  }],
  lastFetched: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('MarketData', marketDataSchema);