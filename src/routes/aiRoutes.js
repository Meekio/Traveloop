import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { generateAIItinerary } from '../controllers/aiController.js';

const router = express.Router();

// All AI routes require authentication
router.use(authenticate);

router.post('/trips/generate', generateAIItinerary);

export default router;
