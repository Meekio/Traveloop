import axios from 'axios';
import { config } from '../config/env.js';

export async function searchActivities(latitude, longitude, category = 'tourist_attraction') {
  if (!config.apis.googlePlaces) {
    // Fallback: return mock data structure
    return {
      results: [],
      message: 'Google Places API key not configured. Please add GOOGLE_PLACES_API_KEY to .env'
    };
  }

  try {
    // Map category to Google Places types
    const typeMap = {
      'restaurants': 'restaurant',
      'attractions': 'tourist_attraction',
      'hotels': 'lodging',
      'entertainment': 'night_club',
      'shopping': 'shopping_mall'
    };

    const placeType = typeMap[category] || 'tourist_attraction';

    // Using Google Places Nearby Search API
    const response = await axios.get('https://maps.googleapis.com/maps/api/place/nearbysearch/json', {
      params: {
        location: `${latitude},${longitude}`,
        radius: 5000, // 5km radius
        type: placeType,
        key: config.apis.googlePlaces
      },
      timeout: 5000
    });

    if (response.data.status !== 'OK' && response.data.status !== 'ZERO_RESULTS') {
      throw new Error(`Google Places API error: ${response.data.status}`);
    }

    const activities = response.data.results.slice(0, 20).map(place => ({
      name: place.name,
      description: place.vicinity,
      category: category,
      location: place.vicinity,
      latitude: place.geometry.location.lat,
      longitude: place.geometry.location.lng,
      rating: place.rating || 0,
      price_level: place.price_level || 0,
      photo_reference: place.photos ? place.photos[0].photo_reference : null,
      place_id: place.place_id
    }));

    return {
      results: activities,
      count: activities.length
    };
  } catch (error) {
    console.error('Activity search error:', error.message);
    throw new Error('Activity search service unavailable');
  }
}

// Alternative: Foursquare API (if Google Places not available)
export async function searchActivitiesFoursquare(latitude, longitude, category = 'sights') {
  // Foursquare implementation would go here
  // For now, return empty results
  return {
    results: [],
    message: 'Foursquare API not implemented yet'
  };
}
