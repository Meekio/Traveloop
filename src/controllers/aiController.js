import { supabaseAdmin } from '../config/supabase.js';
import { generateItinerary, enrichItineraryWithRealData } from '../services/aiService.js';

export async function generateAIItinerary(req, res, next) {
  try {
    const { destination, days, budget, interests } = req.body;
    const userId = req.user.id;

    // Validation
    if (!destination || !destination.trim()) {
      return res.status(400).json({
        success: false,
        error: { message: 'Destination is required', code: 'MISSING_DESTINATION' }
      });
    }

    if (!days || days < 1 || days > 30) {
      return res.status(400).json({
        success: false,
        error: { message: 'Days must be between 1 and 30', code: 'INVALID_DAYS' }
      });
    }

    if (!budget || budget < 0) {
      return res.status(400).json({
        success: false,
        error: { message: 'Budget must be a positive number', code: 'INVALID_BUDGET' }
      });
    }

    const userInterests = Array.isArray(interests) ? interests : ['sightseeing', 'food', 'culture'];

    console.log(`Generating itinerary for ${destination}, ${days} days, $${budget}...`);

    // Step 1: Generate itinerary with AI
    const aiItinerary = await generateItinerary(destination, days, budget, userInterests);

    console.log('AI itinerary generated, enriching with real data...');

    // Step 2: Enrich with real data from external APIs
    const enrichedItinerary = await enrichItineraryWithRealData(aiItinerary);

    console.log('Itinerary enriched, creating trip in database...');

    // Step 3: Create trip in database
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + days - 1);

    const { data: trip, error: tripError } = await supabaseAdmin
      .from('trips')
      .insert({
        user_id: userId,
        name: `${destination} - ${days} Day Adventure`,
        description: `AI-generated itinerary for ${destination}`,
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
        budget: budget,
        preferences: { interests: userInterests }
      })
      .select()
      .single();

    if (tripError) throw tripError;

    // Step 4: Create stops (cities)
    const stops = [];
    let currentDate = new Date(startDate);

    for (const city of enrichedItinerary.cities) {
      const arrivalDate = new Date(currentDate);
      const departureDate = new Date(currentDate);
      departureDate.setDate(departureDate.getDate() + city.days - 1);

      const { data: stop, error: stopError } = await supabaseAdmin
        .from('stops')
        .insert({
          trip_id: trip.id,
          city_name: city.name,
          country: city.country,
          latitude: city.latitude,
          longitude: city.longitude,
          arrival_date: arrivalDate.toISOString().split('T')[0],
          departure_date: departureDate.toISOString().split('T')[0],
          order_index: stops.length
        })
        .select()
        .single();

      if (stopError) throw stopError;

      stops.push({ ...stop, cityData: city });
      currentDate = new Date(departureDate);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Step 5: Create activities
    for (const dayPlan of enrichedItinerary.daily_plan) {
      const stop = stops.find(s => s.city_name === dayPlan.city);
      if (!stop) continue;

      for (const activity of dayPlan.activities) {
        await supabaseAdmin
          .from('activities')
          .insert({
            stop_id: stop.id,
            name: activity.name,
            description: activity.description,
            category: activity.category,
            estimated_cost: activity.estimated_cost || 0,
            location: activity.location,
            latitude: activity.latitude,
            longitude: activity.longitude,
            rating: activity.rating
          });
      }
    }

    // Step 6: Create budget items
    if (enrichedItinerary.budget_breakdown) {
      for (const [category, amount] of Object.entries(enrichedItinerary.budget_breakdown)) {
        await supabaseAdmin
          .from('budget_items')
          .insert({
            trip_id: trip.id,
            category: category.charAt(0).toUpperCase() + category.slice(1),
            amount: amount,
            currency: 'USD',
            description: `Estimated ${category} costs`
          });
      }
    }

    // Step 7: Get complete trip data
    const { data: completeTrip } = await supabaseAdmin
      .from('trips')
      .select(`
        *,
        stops:stops(
          *,
          activities:activities(*)
        ),
        budget_items:budget_items(*)
      `)
      .eq('id', trip.id)
      .single();

    console.log('Trip created successfully!');

    res.status(201).json({
      success: true,
      message: 'AI itinerary generated successfully',
      data: {
        trip: completeTrip,
        ai_suggestions: enrichedItinerary
      }
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
