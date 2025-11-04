const axios = require('axios');

// Try multiple common env names for the key
const API_KEY = process.env.WEATHER_API_KEY || process.env.OPENWEATHER_API_KEY || process.env.WEATHER_KEY;

// Helper to call OpenWeatherMap Current Weather API
const buildUrlByCity = (city) => `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&appid=${API_KEY}`;
const buildUrlByCoords = (lat, lon) => `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`;

exports.getWeather = async (req, res) => {
  try {
    if (!API_KEY) return res.status(500).json({ message: 'Weather API key not configured on server' });

    const { city, lat, lon } = req.query;

    let url;
    if (lat && lon) {
      url = buildUrlByCoords(lat, lon);
    } else if (city) {
      url = buildUrlByCity(city);
    } else {
      return res.status(400).json({ message: 'Provide either city or lat+lon query parameters' });
    }

    console.debug('[weatherController] fetching URL:', url);
    const resp = await axios.get(url);
    const d = resp.data;
    console.debug('[weatherController] upstream status:', resp.status);

    const out = {
      city: d.name,
      coord: d.coord,
      temp: d.main.temp,
      feels_like: d.main.feels_like,
      condition: d.weather?.[0]?.main || d.weather?.[0]?.description,
      description: d.weather?.[0]?.description,
      humidity: d.main.humidity,
      wind: { speed: d.wind.speed, deg: d.wind.deg },
      raw: d,
    };

    res.json(out);
  } catch (err) {
    console.error('[weatherController] error calling upstream:', err?.response?.data || err.message);
    const status = err.response?.status || 500;
    const message = err.response?.data?.message || err.response?.data || err.message;
    res.status(status).json({ message });
  }
};

// City suggestions via OpenWeatherMap Geocoding API
exports.getCitySuggestions = async (req, res) => {
  try {
    const q = req.query.q;
    if (!q) return res.status(400).json({ message: 'q parameter is required' });
    if (!API_KEY) return res.status(500).json({ message: 'Weather API key not configured on server' });

    const url = `http://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(q)}&limit=6&appid=${API_KEY}`;
    console.debug('[weatherController] geocoding URL:', url);
    const resp = await axios.get(url);
    const data = resp.data || [];

    // map to useful shape and restrict to Pakistan (country code 'PK')
    const out = (data || [])
      .filter(item => item.country === 'PK')
      .map(item => ({ name: item.name, lat: item.lat, lon: item.lon, country: item.country, state: item.state }));
    res.json(out);
  } catch (err) {
    console.error('[weatherController] geocoding error:', err?.response?.data || err.message);
    const status = err.response?.status || 500;
    const message = err.response?.data?.message || err.response?.data || err.message;
    res.status(status).json({ message });
  }
};

