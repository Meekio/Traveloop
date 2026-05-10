import axios from 'axios';
import { config } from '../config/env.js';

// Simple in-memory cache
const cache = new Map();
const CACHE_DURATION = 6 * 60 * 60 * 1000; // 6 hours

export async function getWeather(latitude, longitude, date) {
  // Check cache
  const cacheKey = `weather:${latitude},${longitude}:${date || 'current'}`;
  const cached = cache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  if (!config.apis.openweather) {
    throw new Error('OpenWeather API key not configured');
  }

  try {
    // Using OpenWeatherMap API
    const response = await axios.get('https://api.openweathermap.org/data/2.5/forecast', {
      params: {
        lat: latitude,
        lon: longitude,
        appid: config.apis.openweather,
        units: 'metric'
      },
      timeout: 3000
    });

    // Process forecast data
    const forecasts = response.data.list.slice(0, 56).map(item => ({ // 7 days * 8 (3-hour intervals)
      date: item.dt_txt.split(' ')[0],
      time: item.dt_txt.split(' ')[1],
      temperature: item.main.temp,
      feels_like: item.main.feels_like,
      conditions: item.weather[0].description,
      humidity: item.main.humidity,
      precipitation_probability: item.pop * 100,
      wind_speed: item.wind.speed
    }));

    // Group by date and get daily summary
    const dailyForecasts = {};
    forecasts.forEach(forecast => {
      if (!dailyForecasts[forecast.date]) {
        dailyForecasts[forecast.date] = {
          date: forecast.date,
          temperatures: [],
          conditions: [],
          humidity: [],
          precipitation_probability: []
        };
      }
      dailyForecasts[forecast.date].temperatures.push(forecast.temperature);
      dailyForecasts[forecast.date].conditions.push(forecast.conditions);
      dailyForecasts[forecast.date].humidity.push(forecast.humidity);
      dailyForecasts[forecast.date].precipitation_probability.push(forecast.precipitation_probability);
    });

    const dailySummary = Object.values(dailyForecasts).map(day => ({
      date: day.date,
      temperature_min: Math.min(...day.temperatures),
      temperature_max: Math.max(...day.temperatures),
      temperature_avg: day.temperatures.reduce((a, b) => a + b, 0) / day.temperatures.length,
      conditions: day.conditions[Math.floor(day.conditions.length / 2)], // midday conditions
      humidity: Math.round(day.humidity.reduce((a, b) => a + b, 0) / day.humidity.length),
      precipitation_probability: Math.max(...day.precipitation_probability)
    }));

    const weatherData = {
      location: {
        latitude,
        longitude
      },
      daily_forecasts: dailySummary,
      detailed_forecasts: forecasts
    };

    // Cache the result
    cache.set(cacheKey, { data: weatherData, timestamp: Date.now() });
    return weatherData;
  } catch (error) {
    console.error('Weather API error:', error.message);
    throw new Error('Weather service unavailable');
  }
}
