import express from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  addStop,
  getStops,
  reorderStops,
  updateStop,
  deleteStop
} from '../controllers/stopController.js';

const router = express.Router();

// All stop routes require authentication
router.use(authenticate);

router.post('/trips/:tripId/stops', addStop);
router.get('/trips/:tripId/stops', getStops);
router.put('/trips/:tripId/stops/reorder', reorderStops);
router.put('/stops/:id', updateStop);
router.delete('/stops/:id', deleteStop);

export default router;
