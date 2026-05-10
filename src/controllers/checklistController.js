import { supabaseAdmin } from '../config/supabase.js';

export async function addChecklistItem(req, res, next) {
  try {
    const { tripId } = req.params;
    const { task, category } = req.body;
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

    // Validation
    if (!task || !task.trim()) {
      return res.status(400).json({
        success: false,
        error: { message: 'Task is required', code: 'MISSING_TASK' }
      });
    }

    // Create checklist item
    const { data: item, error } = await supabaseAdmin
      .from('checklist_items')
      .insert({
        trip_id: tripId,
        task: task.trim(),
        category,
        is_completed: false
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      success: true,
      data: item
    });
  } catch (error) {
    next(error);
  }
}

export async function getChecklistItems(req, res, next) {
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

    // Get checklist items
    const { data: items, error } = await supabaseAdmin
      .from('checklist_items')
      .select('*')
      .eq('trip_id', tripId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    res.json({
      success: true,
      data: items
    });
  } catch (error) {
    next(error);
  }
}

export async function updateChecklistItem(req, res, next) {
  try {
    const { id } = req.params;
    const { task, category, is_completed } = req.body;
    const userId = req.user.id;

    // Verify ownership
    const { data: item, error: fetchError } = await supabaseAdmin
      .from('checklist_items')
      .select('trip_id, trips!inner(user_id)')
      .eq('id', id)
      .single();

    if (fetchError || !item) {
      return res.status(404).json({
        success: false,
        error: { message: 'Checklist item not found', code: 'NOT_FOUND' }
      });
    }

    if (item.trips.user_id !== userId) {
      return res.status(403).json({
        success: false,
        error: { message: 'You do not have permission to modify this item', code: 'FORBIDDEN' }
      });
    }

    // Update checklist item
    const updateData = {};
    if (task !== undefined) updateData.task = task.trim();
    if (category !== undefined) updateData.category = category;
    if (is_completed !== undefined) updateData.is_completed = is_completed;

    const { data: updated, error } = await supabaseAdmin
      .from('checklist_items')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({
      success: true,
      data: updated
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteChecklistItem(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Verify ownership
    const { data: item, error: fetchError } = await supabaseAdmin
      .from('checklist_items')
      .select('trip_id, trips!inner(user_id)')
      .eq('id', id)
      .single();

    if (fetchError || !item) {
      return res.status(404).json({
        success: false,
        error: { message: 'Checklist item not found', code: 'NOT_FOUND' }
      });
    }

    if (item.trips.user_id !== userId) {
      return res.status(403).json({
        success: false,
        error: { message: 'You do not have permission to delete this item', code: 'FORBIDDEN' }
      });
    }

    // Delete checklist item
    const { error } = await supabaseAdmin
      .from('checklist_items')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({
      success: true,
      message: 'Checklist item deleted successfully'
    });
  } catch (error) {
    next(error);
  }
}
