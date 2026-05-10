import express from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  searchCitiesController,
  getWeatherController,
  searchActivitiesController
} from '../controllers/searchController.js';

const router = express.Router();

// All search routes require authentication
router.use(authenticate);

router.get('/search/cities', searchCitiesController);
router.get('/weather', getWeatherController);
router.get('/search/activities', searchActivitiesController);

export default router;
