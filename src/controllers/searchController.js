import { searchCities } from '../services/cityService.js';
import { getWeather } from '../services/weatherService.js';
import { searchActivities } from '../services/activityService.js';

export async function searchCitiesController(req, res, next) {
  try {
    const { q } = req.query;

    if (!q || !q.trim()) {
      return res.status(400).json({
        success: false,
        error: { message: 'Search query is required', code: 'MISSING_QUERY' }
      });
    }

    const cities = await searchCities(q.trim());

    res.json({
      success: true,
      data: cities,
      count: cities.length
    });
  } catch (error) {
    if (error.message.includes('unavailable')) {
      return res.status(503).json({
        success: false,
        error: { message: error.message, code: 'SERVICE_UNAVAILABLE' }
      });
    }
    next(error);
  }
}

export async function getWeatherController(req, res, next) {
  try {
    const { lat, lon, date } = req.query;

    if (!lat || !lon) {
      return res.status(400).json({
        success: false,
        error: { message: 'Latitude and longitude are required', code: 'MISSING_COORDINATES' }
      });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lon);

    if (isNaN(latitude) || isNaN(longitude)) {
      return res.status(400).json({
        success: false,
        error: { message: 'Invalid coordinates', code: 'INVALID_COORDINATES' }
      });
    }

    const weather = await getWeather(latitude, longitude, date);

    res.json({
      success: true,
      data: weather
    });
  } catch (error) {
    if (error.message.includes('unavailable') || error.message.includes('not configured')) {
      return res.status(503).json({
        success: false,
        error: { message: error.message, code: 'SERVICE_UNAVAILABLE' }
      });
    }
    next(error);
  }
}

export async function searchActivitiesController(req, res, next) {
  try {
    const { lat, lon, category } = req.query;

    if (!lat || !lon) {
      return res.status(400).json({
        success: false,
        error: { message: 'Latitude and longitude are required', code: 'MISSING_COORDINATES' }
      });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lon);

    if (isNaN(latitude) || isNaN(longitude)) {
      return res.status(400).json({
        success: false,
        error: { message: 'Invalid coordinates', code: 'INVALID_COORDINATES' }
      });
    }

    const validCategories = ['restaurants', 'attractions', 'hotels', 'entertainment', 'shopping'];
    const searchCategory = category && validCategories.includes(category) ? category : 'attractions';

    const activities = await searchActivities(latitude, longitude, searchCategory);

    res.json({
      success: true,
      data: activities.results,
      count: activities.count || activities.results.length,
      message: activities.message
    });
  } catch (error) {
    if (error.message.includes('unavailable')) {
      return res.status(503).json({
        success: false,
        error: { message: error.message, code: 'SERVICE_UNAVAILABLE' }
      });
    }
    next(error);
  }
}
