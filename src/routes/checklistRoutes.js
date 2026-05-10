import express from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  addChecklistItem,
  getChecklistItems,
  updateChecklistItem,
  deleteChecklistItem
} from '../controllers/checklistController.js';

const router = express.Router();

// All checklist routes require authentication
router.use(authenticate);

router.post('/trips/:tripId/checklist', addChecklistItem);
router.get('/trips/:tripId/checklist', getChecklistItems);
router.put('/checklist/:id', updateChecklistItem);
router.delete('/checklist/:id', deleteChecklistItem);

export default router;
