const express = require('express');
const { getWeather } = require('../controllers/weatherController');
const router = express.Router();

// Public weather proxy — server keeps API key secret
// GET /api/weather?city=Karachi
// GET /api/weather?lat=24.86&lon=67.01
router.get('/', getWeather);

// City suggestions for autocomplete
router.get('/search', require('../controllers/weatherController').getCitySuggestions);

module.exports = router;
