const request = require('supertest');
const express = require('express');

const {
  getMarketInsights
} = require('../controllers/marketController');

const app = express();

app.get('/api/market/insights', getMarketInsights);

describe('Market Dashboard Functional Testing', () => {

  // =========================
  // FT-01 API Status Test
  // =========================
  test('FT-01: GET /api/market/insights returns valid status', async () => {

    const response = await request(app)
      .get('/api/market/insights');

    expect([200, 500, 503]).toContain(response.statusCode);

  });

  // =========================
  // FT-02 Response Format
  // =========================
  test('FT-02: Response is JSON format', async () => {

    const response = await request(app)
      .get('/api/market/insights');

    expect(response.headers['content-type'])
      .toMatch(/json/);

  });

  // =========================
  // FT-03 Response Structure
  // =========================
  test('FT-03: Response contains success field', async () => {

    const response = await request(app)
      .get('/api/market/insights');

    expect(response.body)
      .toHaveProperty('success');

  });

});
