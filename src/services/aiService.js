import axios from 'axios';
import { config } from '../config/env.js';
import { searchCities } from './cityService.js';
import { searchActivities } from './activityService.js';

export async function generateItinerary(destination, days, budget, interests) {
  if (!config.apis.gemini) {
    throw new Error('Gemini API key not configured');
  }

  try {
    // Create structured prompt for Gemini
    const prompt = `You are a travel planning expert. Create a detailed ${days}-day itinerary for ${destination} with a budget of $${budget}.

User interests: ${interests.join(', ')}

Please provide a structured response in the following JSON format:
{
  "cities": [
    {
      "name": "City Name",
      "country": "Country",
      "days": 3,
      "description": "Why visit this city"
    }
  ],
  "daily_plan": [
    {
      "day": 1,
      "city": "City Name",
      "activities": [
        {
          "name": "Activity Name",
          "description": "Brief description",
          "category": "attractions|restaurants|hotels|entertainment|shopping",
          "estimated_cost": 50,
          "time_of_day": "morning|afternoon|evening"
        }
      ]
    }
  ],
  "budget_breakdown": {
    "accommodation": 1000,
    "food": 500,
    "activities": 300,
    "transport": 200
  }
}

Important:
- Keep costs realistic and within the $${budget} budget
- Suggest ${days} days worth of activities
- Include a mix of free and paid activities
- Consider the user's interests: ${interests.join(', ')}
- Provide specific activity names, not generic descriptions`;

    // Call Gemini API (using Gemini 2.5 Flash)
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${config.apis.gemini}`,
      {
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      },
      {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );

    // Extract the generated text
    const generatedText = response.data.candidates[0].content.parts[0].text;
    
    // Parse JSON from the response (Gemini might wrap it in markdown)
    let itineraryData;
    try {
      // Try to extract JSON from markdown code blocks
      const jsonMatch = generatedText.match(/```json\n([\s\S]*?)\n```/) || 
                       generatedText.match(/```\n([\s\S]*?)\n```/) ||
                       [null, generatedText];
      
      itineraryData = JSON.parse(jsonMatch[1] || generatedText);
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', generatedText);
      throw new Error('Failed to parse AI response. Please try again.');
    }

    return itineraryData;
  } catch (error) {
    console.error('Gemini API error:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
    throw new Error('AI service unavailable');
  }
}

export async function enrichItineraryWithRealData(itineraryData) {
  // Enrich cities with real coordinates
  const enrichedCities = await Promise.all(
    itineraryData.cities.map(async (city) => {
      try {
        const cityResults = await searchCities(city.name);
        if (cityResults.length > 0) {
          const realCity = cityResults[0];
          return {
            ...city,
            latitude: realCity.latitude,
            longitude: realCity.longitude,
            country: realCity.country || city.country
          };
        }
        return city;
      } catch (error) {
        console.error(`Failed to enrich city ${city.name}:`, error.message);
        return city;
      }
    })
  );

  // Enrich activities with real data (sample a few to avoid rate limits)
  const enrichedDailyPlan = await Promise.all(
    itineraryData.daily_plan.map(async (day) => {
      // Find the city for this day
      const city = enrichedCities.find(c => c.name === day.city);
      
      if (!city || !city.latitude || !city.longitude) {
        return day;
      }

      // Enrich first 2 activities per day to avoid rate limits
      const enrichedActivities = await Promise.all(
        day.activities.slice(0, 2).map(async (activity) => {
          try {
            const results = await searchActivities(
              city.latitude,
              city.longitude,
              activity.category
            );
            
            if (results.results && results.results.length > 0) {
              const realActivity = results.results[0];
              return {
                ...activity,
                location: realActivity.location || activity.location,
                latitude: realActivity.latitude,
                longitude: realActivity.longitude,
                rating: realActivity.rating
              };
            }
            return activity;
          } catch (error) {
            console.error(`Failed to enrich activity ${activity.name}:`, error.message);
            return activity;
          }
        })
      );

      return {
        ...day,
        activities: [
          ...enrichedActivities,
          ...day.activities.slice(2) // Keep remaining activities as-is
        ]
      };
    })
  );

  return {
    ...itineraryData,
    cities: enrichedCities,
    daily_plan: enrichedDailyPlan
  };
}
