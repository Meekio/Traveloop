import express from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  addActivity,
  getActivities,
  updateActivity,
  deleteActivity
} from '../controllers/activityController.js';

const router = express.Router();

// All activity routes require authentication
router.use(authenticate);

router.post('/stops/:stopId/activities', addActivity);
router.get('/stops/:stopId/activities', getActivities);
router.put('/activities/:id', updateActivity);
router.delete('/activities/:id', deleteActivity);

export default router;
