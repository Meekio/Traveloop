import express from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  createTrip,
  getTrips,
  getTripById,
  updateTrip,
  deleteTrip
} from '../controllers/tripController.js';

const router = express.Router();

// All trip routes require authentication
router.use(authenticate);

router.post('/', createTrip);
router.get('/', getTrips);
router.get('/:id', getTripById);
router.put('/:id', updateTrip);
router.delete('/:id', deleteTrip);

export default router;
