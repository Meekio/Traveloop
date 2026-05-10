import { supabaseAdmin } from '../config/supabase.js';

export async function addNote(req, res, next) {
  try {
    const { tripId } = req.params;
    const { content } = req.body;
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
    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        error: { message: 'Note content is required', code: 'MISSING_CONTENT' }
      });
    }

    // Create note
    const { data: note, error } = await supabaseAdmin
      .from('notes')
      .insert({
        trip_id: tripId,
        content: content.trim()
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      success: true,
      data: note
    });
  } catch (error) {
    next(error);
  }
}

export async function getNotes(req, res, next) {
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

    // Get notes
    const { data: notes, error } = await supabaseAdmin
      .from('notes')
      .select('*')
      .eq('trip_id', tripId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({
      success: true,
      data: notes
    });
  } catch (error) {
    next(error);
  }
}

export async function updateNote(req, res, next) {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    // Verify ownership
    const { data: note, error: fetchError } = await supabaseAdmin
      .from('notes')
      .select('trip_id, trips!inner(user_id)')
      .eq('id', id)
      .single();

    if (fetchError || !note) {
      return res.status(404).json({
        success: false,
        error: { message: 'Note not found', code: 'NOT_FOUND' }
      });
    }

    if (note.trips.user_id !== userId) {
      return res.status(403).json({
        success: false,
        error: { message: 'You do not have permission to modify this note', code: 'FORBIDDEN' }
      });
    }

    // Validation
    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        error: { message: 'Note content is required', code: 'MISSING_CONTENT' }
      });
    }

    // Update note
    const { data: updated, error } = await supabaseAdmin
      .from('notes')
      .update({ content: content.trim() })
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

export async function deleteNote(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Verify ownership
    const { data: note, error: fetchError } = await supabaseAdmin
      .from('notes')
      .select('trip_id, trips!inner(user_id)')
      .eq('id', id)
      .single();

    if (fetchError || !note) {
      return res.status(404).json({
        success: false,
        error: { message: 'Note not found', code: 'NOT_FOUND' }
      });
    }

    if (note.trips.user_id !== userId) {
      return res.status(403).json({
        success: false,
        error: { message: 'You do not have permission to delete this note', code: 'FORBIDDEN' }
      });
    }

    // Delete note
    const { error } = await supabaseAdmin
      .from('notes')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({
      success: true,
      message: 'Note deleted successfully'
    });
  } catch (error) {
    next(error);
  }
}
