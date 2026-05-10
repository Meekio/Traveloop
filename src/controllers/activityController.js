import { supabaseAdmin } from '../config/supabase.js';

export async function addActivity(req, res, next) {
  try {
    const { stopId } = req.params;
    const { name, description, category, estimated_cost, scheduled_time, location, latitude, longitude, rating } = req.body;
    const userId = req.user.id;

    // Verify ownership through stop -> trip
    const { data: stop, error: stopError } = await supabaseAdmin
      .from('stops')
      .select('trip_id, trips!inner(user_id)')
      .eq('id', stopId)
      .single();

    if (stopError || !stop) {
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

    // Validation
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        error: { message: 'Activity name is required', code: 'MISSING_NAME' }
      });
    }

    if (estimated_cost !== undefined && estimated_cost < 0) {
      return res.status(400).json({
        success: false,
        error: { message: 'Estimated cost cannot be negative', code: 'INVALID_COST' }
      });
    }

    // Create activity
    const { data: activity, error } = await supabaseAdmin
      .from('activities')
      .insert({
        stop_id: stopId,
        name: name.trim(),
        description,
        category,
        estimated_cost: estimated_cost || 0,
        scheduled_time,
        location,
        latitude,
        longitude,
        rating
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      success: true,
      data: activity
    });
  } catch (error) {
    next(error);
  }
}

export async function getActivities(req, res, next) {
  try {
    const { stopId } = req.params;
    const userId = req.user.id;

    // Verify ownership
    const { data: stop, error: stopError } = await supabaseAdmin
      .from('stops')
      .select('trip_id, trips!inner(user_id)')
      .eq('id', stopId)
      .single();

    if (stopError || !stop) {
      return res.status(404).json({
        success: false,
        error: { message: 'Stop not found', code: 'NOT_FOUND' }
      });
    }

    if (stop.trips.user_id !== userId) {
      return res.status(403).json({
        success: false,
        error: { message: 'You do not have permission to access this stop', code: 'FORBIDDEN' }
      });
    }

    // Get activities
    const { data: activities, error } = await supabaseAdmin
      .from('activities')
      .select('*')
      .eq('stop_id', stopId)
      .order('scheduled_time', { ascending: true, nullsFirst: false });

    if (error) throw error;

    res.json({
      success: true,
      data: activities
    });
  } catch (error) {
    next(error);
  }
}

export async function updateActivity(req, res, next) {
  try {
    const { id } = req.params;
    const { name, description, category, estimated_cost, scheduled_time, location, latitude, longitude, rating } = req.body;
    const userId = req.user.id;

    // Verify ownership
    const { data: activity, error: fetchError } = await supabaseAdmin
      .from('activities')
      .select('stop_id, stops!inner(trip_id, trips!inner(user_id))')
      .eq('id', id)
      .single();

    if (fetchError || !activity) {
      return res.status(404).json({
        success: false,
        error: { message: 'Activity not found', code: 'NOT_FOUND' }
      });
    }

    if (activity.stops.trips.user_id !== userId) {
      return res.status(403).json({
        success: false,
        error: { message: 'You do not have permission to modify this activity', code: 'FORBIDDEN' }
      });
    }

    // Validate cost if provided
    if (estimated_cost !== undefined && estimated_cost < 0) {
      return res.status(400).json({
        success: false,
        error: { message: 'Estimated cost cannot be negative', code: 'INVALID_COST' }
      });
    }

    // Update activity
    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description;
    if (category !== undefined) updateData.category = category;
    if (estimated_cost !== undefined) updateData.estimated_cost = estimated_cost;
    if (scheduled_time !== undefined) updateData.scheduled_time = scheduled_time;
    if (location !== undefined) updateData.location = location;
    if (latitude !== undefined) updateData.latitude = latitude;
    if (longitude !== undefined) updateData.longitude = longitude;
    if (rating !== undefined) updateData.rating = rating;

    const { data: updatedActivity, error } = await supabaseAdmin
      .from('activities')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({
      success: true,
      data: updatedActivity
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteActivity(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Verify ownership
    const { data: activity, error: fetchError } = await supabaseAdmin
      .from('activities')
      .select('stop_id, stops!inner(trip_id, trips!inner(user_id))')
      .eq('id', id)
      .single();

    if (fetchError || !activity) {
      return res.status(404).json({
        success: false,
        error: { message: 'Activity not found', code: 'NOT_FOUND' }
      });
    }

    if (activity.stops.trips.user_id !== userId) {
      return res.status(403).json({
        success: false,
        error: { message: 'You do not have permission to delete this activity', code: 'FORBIDDEN' }
      });
    }

    // Delete activity
    const { error } = await supabaseAdmin
      .from('activities')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({
      success: true,
      message: 'Activity deleted successfully'
    });
  } catch (error) {
    next(error);
  }
}
