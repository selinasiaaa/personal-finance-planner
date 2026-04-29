const mongoose = require('mongoose');

const marketDataSchema = new mongoose.Schema({
  summary: {
    trend: String,
    topPerformer: String,
    performanceReading: String,
    riskLevel: String,
  },
  globalView: {
    indexTrend: String,
    indexValue: String,
    topGlobalSector: String,
    vix: String,
    riskLevel: String,
    lastUpdated: Date,
    dataSource: String,
  },
  news: [{
    title: String,
    source: String,
    timeLabel: String,
    link: String
  }],
  charts: {
    sp500Trend: [{
      month: String,
      price: Number,
    }],
    sectorPerformance: [{
      sector: String,
      performance: Number,
    }],
  },
  lastFetched: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('MarketData', marketDataSchema);