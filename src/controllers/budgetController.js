import { supabaseAdmin } from '../config/supabase.js';

export async function addBudgetItem(req, res, next) {
  try {
    const { tripId } = req.params;
    const { category, amount, currency, description } = req.body;
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
    if (!category || !category.trim()) {
      return res.status(400).json({
        success: false,
        error: { message: 'Category is required', code: 'MISSING_CATEGORY' }
      });
    }

    if (amount === undefined || amount < 0) {
      return res.status(400).json({
        success: false,
        error: { message: 'Amount must be a non-negative number', code: 'INVALID_AMOUNT' }
      });
    }

    // Validate decimal places
    if (!/^\d+(\.\d{1,2})?$/.test(amount.toString())) {
      return res.status(400).json({
        success: false,
        error: { message: 'Amount can have maximum 2 decimal places', code: 'INVALID_DECIMAL' }
      });
    }

    // Create budget item
    const { data: budgetItem, error } = await supabaseAdmin
      .from('budget_items')
      .insert({
        trip_id: tripId,
        category: category.trim(),
        amount: parseFloat(amount),
        currency: currency || 'USD',
        description
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      success: true,
      data: budgetItem
    });
  } catch (error) {
    next(error);
  }
}

export async function getBudgetSummary(req, res, next) {
  try {
    const { tripId } = req.params;
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
        error: { message: 'You do not have permission to access this trip', code: 'FORBIDDEN' }
      });
    }

    // Get budget items
    const { data: budgetItems, error: budgetError } = await supabaseAdmin
      .from('budget_items')
      .select('*')
      .eq('trip_id', tripId);

    if (budgetError) throw budgetError;

    // Get activity costs
    const { data: activities, error: activityError } = await supabaseAdmin
      .from('activities')
      .select('estimated_cost, stops!inner(trip_id)')
      .eq('stops.trip_id', tripId);

    if (activityError) throw activityError;

    // Calculate totals
    const budgetTotal = budgetItems.reduce((sum, item) => sum + parseFloat(item.amount), 0);
    const activityTotal = activities.reduce((sum, activity) => sum + parseFloat(activity.estimated_cost || 0), 0);
    const totalCost = budgetTotal + activityTotal;

    // Calculate by category
    const byCategory = {};
    budgetItems.forEach(item => {
      const cat = item.category;
      byCategory[cat] = (byCategory[cat] || 0) + parseFloat(item.amount);
    });

    // Add activities as a category
    if (activityTotal > 0) {
      byCategory['Activities'] = activityTotal;
    }

    // Calculate cost per day
    const startDate = new Date(trip.start_date);
    const endDate = new Date(trip.end_date);
    const durationDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
    const costPerDay = totalCost / durationDays;

    res.json({
      success: true,
      data: {
        total_cost: totalCost,
        budget_items_total: budgetTotal,
        activities_total: activityTotal,
        by_category: byCategory,
        cost_per_day: costPerDay,
        duration_days: durationDays,
        items: budgetItems
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function updateBudgetItem(req, res, next) {
  try {
    const { id } = req.params;
    const { category, amount, currency, description } = req.body;
    const userId = req.user.id;

    // Verify ownership
    const { data: budgetItem, error: fetchError } = await supabaseAdmin
      .from('budget_items')
      .select('trip_id, trips!inner(user_id)')
      .eq('id', id)
      .single();

    if (fetchError || !budgetItem) {
      return res.status(404).json({
        success: false,
        error: { message: 'Budget item not found', code: 'NOT_FOUND' }
      });
    }

    if (budgetItem.trips.user_id !== userId) {
      return res.status(403).json({
        success: false,
        error: { message: 'You do not have permission to modify this budget item', code: 'FORBIDDEN' }
      });
    }

    // Validate amount if provided
    if (amount !== undefined && amount < 0) {
      return res.status(400).json({
        success: false,
        error: { message: 'Amount must be a non-negative number', code: 'INVALID_AMOUNT' }
      });
    }

    // Update budget item
    const updateData = {};
    if (category !== undefined) updateData.category = category.trim();
    if (amount !== undefined) updateData.amount = parseFloat(amount);
    if (currency !== undefined) updateData.currency = currency;
    if (description !== undefined) updateData.description = description;

    const { data: updated, error } = await supabaseAdmin
      .from('budget_items')
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

export async function deleteBudgetItem(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Verify ownership
    const { data: budgetItem, error: fetchError } = await supabaseAdmin
      .from('budget_items')
      .select('trip_id, trips!inner(user_id)')
      .eq('id', id)
      .single();

    if (fetchError || !budgetItem) {
      return res.status(404).json({
        success: false,
        error: { message: 'Budget item not found', code: 'NOT_FOUND' }
      });
    }

    if (budgetItem.trips.user_id !== userId) {
      return res.status(403).json({
        success: false,
        error: { message: 'You do not have permission to delete this budget item', code: 'FORBIDDEN' }
      });
    }

    // Delete budget item
    const { error } = await supabaseAdmin
      .from('budget_items')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({
      success: true,
      message: 'Budget item deleted successfully'
    });
  } catch (error) {
    next(error);
  }
}
