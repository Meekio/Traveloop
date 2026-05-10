import { supabaseAdmin } from '../config/supabase.js';

export async function createTrip(req, res, next) {
  try {
    const { name, description, start_date, end_date, budget, preferences, cover_image } = req.body;
    const userId = req.user.id;

    // Validation
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Trip name is required',
          code: 'MISSING_NAME'
        }
      });
    }

    if (!start_date || !end_date) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Start date and end date are required',
          code: 'MISSING_DATES'
        }
      });
    }

    // Validate dates
    const startDate = new Date(start_date);
    const endDate = new Date(end_date);

    if (startDate > endDate) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Start date must be before or equal to end date',
          code: 'INVALID_DATES'
        }
      });
    }

    // Create trip
    const { data: trip, error } = await supabaseAdmin
      .from('trips')
      .insert({
        user_id: userId,
        name: name.trim(),
        description,
        start_date,
        end_date,
        budget,
        preferences,
        cover_image
      })
      .select()
      .single();

    if (error) throw error;

    // Calculate trip metadata
    const durationDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;

    res.status(201).json({
      success: true,
      data: {
        ...trip,
        duration_days: durationDays,
        stop_count: 0,
        total_budget: budget || 0
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function getTrips(req, res, next) {
  try {
    const userId = req.user.id;

    const { data: trips, error } = await supabaseAdmin
      .from('trips')
      .select(`
        *,
        stops:stops(count),
        budget_items:budget_items(amount)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Calculate metadata for each trip
    const tripsWithMetadata = trips.map(trip => {
      const startDate = new Date(trip.start_date);
      const endDate = new Date(trip.end_date);
      const durationDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
      const stopCount = trip.stops[0]?.count || 0;
      const totalBudget = trip.budget_items.reduce((sum, item) => sum + parseFloat(item.amount), 0);

      return {
        ...trip,
        duration_days: durationDays,
        stop_count: stopCount,
        total_budget: totalBudget,
        stops: undefined,
        budget_items: undefined
      };
    });

    res.json({
      success: true,
      data: tripsWithMetadata
    });
  } catch (error) {
    next(error);
  }
}

export async function getTripById(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const { data: trip, error } = await supabaseAdmin
      .from('trips')
      .select(`
        *,
        stops:stops(
          *,
          activities:activities(*)
        ),
        budget_items:budget_items(*),
        notes:notes(*),
        checklist_items:checklist_items(*)
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          error: {
            message: 'Trip not found',
            code: 'NOT_FOUND'
          }
        });
      }
      throw error;
    }

    // Check ownership
    if (trip.user_id !== userId) {
      return res.status(403).json({
        success: false,
        error: {
          message: 'You do not have permission to access this trip',
          code: 'FORBIDDEN'
        }
      });
    }

    // Calculate metadata
    const startDate = new Date(trip.start_date);
    const endDate = new Date(trip.end_date);
    const durationDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
    const totalBudget = trip.budget_items.reduce((sum, item) => sum + parseFloat(item.amount), 0);

    // Sort stops by order_index
    trip.stops.sort((a, b) => a.order_index - b.order_index);

    res.json({
      success: true,
      data: {
        ...trip,
        duration_days: durationDays,
        stop_count: trip.stops.length,
        total_budget: totalBudget
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function updateTrip(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { name, description, start_date, end_date, budget, preferences, cover_image } = req.body;

    // Check ownership first
    const { data: existingTrip, error: fetchError } = await supabaseAdmin
      .from('trips')
      .select('user_id')
      .eq('id', id)
      .single();

    if (fetchError || !existingTrip) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Trip not found',
          code: 'NOT_FOUND'
        }
      });
    }

    if (existingTrip.user_id !== userId) {
      return res.status(403).json({
        success: false,
        error: {
          message: 'You do not have permission to update this trip',
          code: 'FORBIDDEN'
        }
      });
    }

    // Validate dates if provided
    if (start_date && end_date) {
      const startDate = new Date(start_date);
      const endDate = new Date(end_date);

      if (startDate > endDate) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Start date must be before or equal to end date',
            code: 'INVALID_DATES'
          }
        });
      }
    }

    // Update trip
    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description;
    if (start_date !== undefined) updateData.start_date = start_date;
    if (end_date !== undefined) updateData.end_date = end_date;
    if (budget !== undefined) updateData.budget = budget;
    if (preferences !== undefined) updateData.preferences = preferences;
    if (cover_image !== undefined) updateData.cover_image = cover_image;

    const { data: trip, error } = await supabaseAdmin
      .from('trips')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({
      success: true,
      data: trip
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteTrip(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check ownership first
    const { data: existingTrip, error: fetchError } = await supabaseAdmin
      .from('trips')
      .select('user_id')
      .eq('id', id)
      .single();

    if (fetchError || !existingTrip) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Trip not found',
          code: 'NOT_FOUND'
        }
      });
    }

    if (existingTrip.user_id !== userId) {
      return res.status(403).json({
        success: false,
        error: {
          message: 'You do not have permission to delete this trip',
          code: 'FORBIDDEN'
        }
      });
    }

    // Delete trip (cascade will handle related records)
    const { error } = await supabaseAdmin
      .from('trips')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({
      success: true,
      message: 'Trip deleted successfully'
    });
  } catch (error) {
    next(error);
  }
}
