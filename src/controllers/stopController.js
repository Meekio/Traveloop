import { supabaseAdmin } from '../config/supabase.js';

export async function addStop(req, res, next) {
  try {
    const { tripId } = req.params;
    const { city_name, country, latitude, longitude, arrival_date, departure_date, order_index } = req.body;
    const userId = req.user.id;

    // Verify trip ownership
    const { data: trip, error: tripError } = await supabaseAdmin
      .from('trips')
      .select('user_id, start_date, end_date')
      .eq('id', tripId)
      .single();

    if (tripError || !trip) {
      return res.status(404).json({
        success: false,
        error: { message: 'Trip not found', code: 'NOT_FOUND' }
      });
    }

    if (trip.user_id !== userId) {
      return res.status(403).json({
        success: false,
        error: { message: 'You do not have permission to modify this trip', code: 'FORBIDDEN' }
      });
    }

    // Validation
    if (!city_name || !city_name.trim()) {
      return res.status(400).json({
        success: false,
        error: { message: 'City name is required', code: 'MISSING_CITY_NAME' }
      });
    }

    if (!arrival_date || !departure_date) {
      return res.status(400).json({
        success: false,
        error: { message: 'Arrival and departure dates are required', code: 'MISSING_DATES' }
      });
    }

    // Validate dates within trip range
    const arrivalDate = new Date(arrival_date);
    const departureDate = new Date(departure_date);
    const tripStart = new Date(trip.start_date);
    const tripEnd = new Date(trip.end_date);

    if (arrivalDate < tripStart) {
      return res.status(400).json({
        success: false,
        error: { message: 'Arrival date must be within trip dates', code: 'INVALID_ARRIVAL_DATE' }
      });
    }

    if (departureDate > tripEnd) {
      return res.status(400).json({
        success: false,
        error: { message: 'Departure date must be within trip dates', code: 'INVALID_DEPARTURE_DATE' }
      });
    }

    // Check for duplicate city
    const { data: existingStop } = await supabaseAdmin
      .from('stops')
      .select('id')
      .eq('trip_id', tripId)
      .ilike('city_name', city_name.trim())
      .single();

    if (existingStop) {
      return res.status(400).json({
        success: false,
        error: { message: 'This city is already in your itinerary', code: 'DUPLICATE_CITY' }
      });
    }

    // Get next order_index if not provided
    let finalOrderIndex = order_index;
    if (finalOrderIndex === undefined) {
      const { data: stops } = await supabaseAdmin
        .from('stops')
        .select('order_index')
        .eq('trip_id', tripId)
        .order('order_index', { ascending: false })
        .limit(1);

      finalOrderIndex = stops && stops.length > 0 ? stops[0].order_index + 1 : 0;
    }

    // Create stop
    const { data: stop, error } = await supabaseAdmin
      .from('stops')
      .insert({
        trip_id: tripId,
        city_name: city_name.trim(),
        country: country || '',
        latitude,
        longitude,
        arrival_date,
        departure_date,
        order_index: finalOrderIndex
      })
      .select()
      .single();

    if (error) throw error;

    // Calculate days at stop
    const daysAtStop = Math.ceil((departureDate - arrivalDate) / (1000 * 60 * 60 * 24)) + 1;

    res.status(201).json({
      success: true,
      data: {
        ...stop,
        days_at_stop: daysAtStop
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function getStops(req, res, next) {
  try {
    const { tripId } = req.params;
    const userId = req.user.id;

    // Verify trip ownership
    const { data: trip, error: tripError } = await supabaseAdmin
      .from('trips')
      .select('user_id')
      .eq('id', tripId)
      .single();

    if (tripError || !trip) {
      return res.status(404).json({
        success: false,
        error: { message: 'Trip not found', code: 'NOT_FOUND' }
      });
    }

    if (trip.user_id !== userId) {
      return res.status(403).json({
        success: false,
        error: { message: 'You do not have permission to access this trip', code: 'FORBIDDEN' }
      });
    }

    // Get stops
    const { data: stops, error } = await supabaseAdmin
      .from('stops')
      .select('*, activities:activities(count)')
      .eq('trip_id', tripId)
      .order('order_index', { ascending: true });

    if (error) throw error;

    // Calculate days at each stop
    const stopsWithMetadata = stops.map(stop => {
      const arrivalDate = new Date(stop.arrival_date);
      const departureDate = new Date(stop.departure_date);
      const daysAtStop = Math.ceil((departureDate - arrivalDate) / (1000 * 60 * 60 * 24)) + 1;
      const activityCount = stop.activities[0]?.count || 0;

      return {
        ...stop,
        days_at_stop: daysAtStop,
        activity_count: activityCount,
        activities: undefined
      };
    });

    res.json({
      success: true,
      data: stopsWithMetadata
    });
  } catch (error) {
    next(error);
  }
}

export async function reorderStops(req, res, next) {
  try {
    const { tripId } = req.params;
    const { stops } = req.body; // Array of { id, order_index }
    const userId = req.user.id;

    // Verify trip ownership
    const { data: trip, error: tripError } = await supabaseAdmin
      .from('trips')
      .select('user_id')
      .eq('id', tripId)
      .single();

    if (tripError || !trip) {
      return res.status(404).json({
        success: false,
        error: { message: 'Trip not found', code: 'NOT_FOUND' }
      });
    }

    if (trip.user_id !== userId) {
      return res.status(403).json({
        success: false,
        error: { message: 'You do not have permission to modify this trip', code: 'FORBIDDEN' }
      });
    }

    // Update each stop's order_index
    const updatePromises = stops.map(stop =>
      supabaseAdmin
        .from('stops')
        .update({ order_index: stop.order_index })
        .eq('id', stop.id)
        .eq('trip_id', tripId)
    );

    await Promise.all(updatePromises);

    res.json({
      success: true,
      message: 'Stops reordered successfully'
    });
  } catch (error) {
    next(error);
  }
}

export async function updateStop(req, res, next) {
  try {
    const { id } = req.params;
    const { city_name, country, latitude, longitude, arrival_date, departure_date } = req.body;
    const userId = req.user.id;

    // Verify ownership
    const { data: stop, error: fetchError } = await supabaseAdmin
      .from('stops')
      .select('trip_id, trips!inner(user_id)')
      .eq('id', id)
      .single();

    if (fetchError || !stop) {
      return res.status(404).json({
        success: false,
        error: { message: 'Stop not found', code: 'NOT_FOUND' }
      });
    }

    if (stop.trips.user_id !== userId) {
      return res.status(403).json({
        success: false,
        error: { message: 'You do not have permission to modify this stop', code: 'FORBIDDEN' }
      });
    }

    // Update stop
    const updateData = {};
    if (city_name !== undefined) updateData.city_name = city_name.trim();
    if (country !== undefined) updateData.country = country;
    if (latitude !== undefined) updateData.latitude = latitude;
    if (longitude !== undefined) updateData.longitude = longitude;
    if (arrival_date !== undefined) updateData.arrival_date = arrival_date;
    if (departure_date !== undefined) updateData.departure_date = departure_date;

    const { data: updatedStop, error } = await supabaseAdmin
      .from('stops')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({
      success: true,
      data: updatedStop
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteStop(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Verify ownership
    const { data: stop, error: fetchError } = await supabaseAdmin
      .from('stops')
      .select('trip_id, trips!inner(user_id)')
      .eq('id', id)
      .single();

    if (fetchError || !stop) {
      return res.status(404).json({
        success: false,
        error: { message: 'Stop not found', code: 'NOT_FOUND' }
      });
    }

    if (stop.trips.user_id !== userId) {
      return res.status(403).json({
        success: false,
        error: { message: 'You do not have permission to delete this stop', code: 'FORBIDDEN' }
      });
    }

    // Delete stop (cascade will handle activities)
    const { error } = await supabaseAdmin
      .from('stops')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({
      success: true,
      message: 'Stop deleted successfully'
    });
  } catch (error) {
    next(error);
  }
}
