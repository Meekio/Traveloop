import axios from 'axios';
import { config } from '../config/env.js';

// Simple in-memory cache
const cache = new Map();
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export async function searchCities(query) {
  // Check cache
  const cacheKey = `city:${query.toLowerCase()}`;
  const cached = cache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  try {
    // Using GeoDB Cities API (free alternative via RapidAPI)
    // Alternative: Teleport API (no key needed)
    
    if (config.apis.geodb) {
      // GeoDB API
      const response = await axios.get('https://wft-geo-db.p.rapidapi.com/v1/geo/cities', {
        params: {
          namePrefix: query,
          limit: 10,
          sort: '-population'
        },
        headers: {
          'X-RapidAPI-Key': config.apis.geodb,
          'X-RapidAPI-Host': 'wft-geo-db.p.rapidapi.com'
        },
        timeout: 5000
      });

      const cities = response.data.data.map(city => ({
        name: city.name,
        country: city.country,
        latitude: city.latitude,
        longitude: city.longitude,
        population: city.population
      }));

      // Cache the result
      cache.set(cacheKey, { data: cities, timestamp: Date.now() });
      return cities;
    } else {
      // Fallback to Teleport API (no key needed, but limited data)
      const response = await axios.get(`https://api.teleport.org/api/cities/`, {
        params: {
          search: query,
          limit: 10
        },
        timeout: 5000
      });

      const cities = await Promise.all(
        response.data._embedded['city:search-results'].slice(0, 10).map(async (result) => {
          try {
            const cityUrl = result._links['city:item'].href;
            const cityDetails = await axios.get(cityUrl, { timeout: 3000 });
            const location = cityDetails.data.location.latlon;
            
            return {
              name: result.matching_full_name.split(',')[0],
              country: result.matching_full_name.split(',').pop().trim(),
              latitude: location.latitude,
              longitude: location.longitude,
              population: cityDetails.data.population || 0
            };
          } catch (error) {
            // If details fail, return basic info
            return {
              name: result.matching_full_name.split(',')[0],
              country: result.matching_full_name.split(',').pop().trim(),
              latitude: null,
              longitude: null,
              population: 0
            };
          }
        })
      );

      // Cache the result
      cache.set(cacheKey, { data: cities, timestamp: Date.now() });
      return cities;
    }
  } catch (error) {
    console.error('City search error:', error.message);
    throw new Error('City search service unavailable');
  }
}
