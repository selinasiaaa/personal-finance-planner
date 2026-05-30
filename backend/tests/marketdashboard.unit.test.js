const {
  buildRiskSub,
  buildRecommendations,
  normalizeMarketData
} = require('../controllers/marketController');

describe('Market Dashboard Unit Testing', () => {

  // =========================
  // UT-26 buildRiskSub
  // =========================
  describe('UT-26: buildRiskSub()', () => {

    test('returns correct message for low risk', () => {
      expect(buildRiskSub('Low'))
        .toBe('Use a conservative stance');
    });

    test('returns correct message for moderate risk', () => {
      expect(buildRiskSub('Moderate'))
        .toBe('Monitor volatility');
    });

    test('returns correct message for high risk', () => {
      expect(buildRiskSub('High'))
        .toBe('Tighten risk controls');
    });

    test('returns empty string for invalid risk', () => {
      expect(buildRiskSub('Unknown'))
        .toBe('');
    });

  });

  // =========================
  // UT-27 buildRecommendations
  // =========================
  describe('UT-27: buildRecommendations()', () => {

    test('creates bullish recommendation', () => {

      const summary = {
        trendDirection: 'bullish',
        topPerformer: 'Technology',
        riskLevel: 'low'
      };

      const news = [
        { title: 'Market is rising' }
      ];

      const result = buildRecommendations(summary, news);

      expect(result[0].title)
        .toBe('Ride the Trend');

    });

    test('creates bearish recommendation', () => {

      const summary = {
        trendDirection: 'bearish',
        topPerformer: 'Finance',
        riskLevel: 'high'
      };

      const news = [
        { title: 'Stocks falling' }
      ];

      const result = buildRecommendations(summary, news);

      expect(result[0].title)
        .toBe('Protect Capital');

    });

  });

  // =========================
  // UT-28 normalizeMarketData
  // =========================
  describe('UT-28: normalizeMarketData()', () => {

    test('returns normalized market data', () => {

      const input = {
        summary: {
          trend: '+100 pts',
          trendDirection: 'bullish',
          topPerformer: 'Technology',
          performanceReading: '+5%',
          riskLevel: 'Low'
        },

        news: [
          { title: 'Tech stocks rally' }
        ]
      };

      const result = normalizeMarketData(input);

      expect(result.trend)
        .toBe('+100 pts');

      expect(result.trendDirection)
        .toBe('bullish');

      expect(result.topPerformer)
        .toBe('Technology');

      expect(result.riskLevel)
        .toBe('Low');

      expect(Array.isArray(result.news))
        .toBe(true);

    });

  });

});
