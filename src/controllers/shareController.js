import { supabaseAdmin } from '../config/supabase.js';
import { v4 as uuidv4 } from 'uuid';

export async function createShareLink(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Verify trip ownership
    const { data: trip, error: tripError } = await supabaseAdmin
      .from('trips')
      .select('user_id')
      .eq('id', id)
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
        error: { message: 'You do not have permission to share this trip', code: 'FORBIDDEN' }
      });
    }

    // Check if share link already exists
    const { data: existingShare } = await supabaseAdmin
      .from('shared_trips')
      .select('*')
      .eq('trip_id', id)
      .eq('is_active', true)
      .single();

    if (existingShare) {
      return res.json({
        success: true,
        data: {
          share_token: existingShare.share_token,
          share_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/shared/${existingShare.share_token}`,
          created_at: existingShare.created_at,
          expires_at: existingShare.expires_at
        }
      });
    }

    // Generate unique share token
    const shareToken = uuidv4();

    // Create shared trip record
    const { data: sharedTrip, error } = await supabaseAdmin
      .from('shared_trips')
      .insert({
        trip_id: id,
        share_token: shareToken,
        is_active: true,
        expires_at: null // No expiration by default
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      success: true,
      data: {
        share_token: sharedTrip.share_token,
        share_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/shared/${sharedTrip.share_token}`,
        created_at: sharedTrip.created_at,
        expires_at: sharedTrip.expires_at
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function getSharedTrip(req, res, next) {
  try {
    const { shareToken } = req.params;

    // Find shared trip
    const { data: sharedTrip, error: shareError } = await supabaseAdmin
      .from('shared_trips')
      .select('trip_id, is_active, expires_at')
      .eq('share_token', shareToken)
      .single();

    if (shareError || !sharedTrip) {
      return res.status(404).json({
        success: false,
        error: { message: 'Shared trip not found', code: 'NOT_FOUND' }
      });
    }

    // Check if share is active
    if (!sharedTrip.is_active) {
      return res.status(403).json({
        success: false,
        error: { message: 'This trip is no longer shared', code: 'SHARE_INACTIVE' }
      });
    }

    // Check if expired
    if (sharedTrip.expires_at && new Date(sharedTrip.expires_at) < new Date()) {
      return res.status(403).json({
        success: false,
        error: { message: 'This share link has expired', code: 'SHARE_EXPIRED' }
      });
    }

    // Get trip data (excluding user personal info)
    const { data: trip, error: tripError } = await supabaseAdmin
      .from('trips')
      .select(`
        id,
        name,
        description,
        start_date,
        end_date,
        budget,
        cover_image,
        created_at,
        stops:stops(
          *,
          activities:activities(*)
        ),
        budget_items:budget_items(*),
        notes:notes(*),
        checklist_items:checklist_items(*)
      `)
      .eq('id', sharedTrip.trip_id)
      .single();

    if (tripError) throw tripError;

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
        total_budget: totalBudget,
        is_shared: true
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function deactivateShareLink(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Verify trip ownership
    const { data: trip, error: tripError } = await supabaseAdmin
      .from('trips')
      .select('user_id')
      .eq('id', id)
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

    // Deactivate all share links for this trip
    const { error } = await supabaseAdmin
      .from('shared_trips')
      .update({ is_active: false })
      .eq('trip_id', id);

    if (error) throw error;

    res.json({
      success: true,
      message: 'Share link deactivated successfully'
    });
  } catch (error) {
    next(error);
  }
}
