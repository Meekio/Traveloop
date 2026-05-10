import express from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  addNote,
  getNotes,
  updateNote,
  deleteNote
} from '../controllers/noteController.js';

const router = express.Router();

// All note routes require authentication
router.use(authenticate);

router.post('/trips/:tripId/notes', addNote);
router.get('/trips/:tripId/notes', getNotes);
router.put('/notes/:id', updateNote);
router.delete('/notes/:id', deleteNote);

export default router;
