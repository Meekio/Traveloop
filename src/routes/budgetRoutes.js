import express from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  addBudgetItem,
  getBudgetSummary,
  updateBudgetItem,
  deleteBudgetItem
} from '../controllers/budgetController.js';

const router = express.Router();

// All budget routes require authentication
router.use(authenticate);

router.post('/trips/:tripId/budget', addBudgetItem);
router.get('/trips/:tripId/budget', getBudgetSummary);
router.put('/budget/:id', updateBudgetItem);
router.delete('/budget/:id', deleteBudgetItem);

export default router;
