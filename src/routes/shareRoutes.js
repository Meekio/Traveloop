import express from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  createShareLink,
  getSharedTrip,
  deactivateShareLink
} from '../controllers/shareController.js';

const router = express.Router();

// Create and deactivate share links require authentication
router.post('/trips/:id/share', authenticate, createShareLink);
router.delete('/trips/:id/share', authenticate, deactivateShareLink);

// Public endpoint - no authentication required
router.get('/shared/:shareToken', getSharedTrip);

export default router;
