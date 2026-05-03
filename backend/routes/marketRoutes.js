const express = require('express');
const router = express.Router();
const { getMarketInsights } = require('../controllers/marketController.js');

router.get('/', getMarketInsights);

module.exports = router;