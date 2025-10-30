import { Router } from 'express';
import {
  getFlashcards,
  createFlashcard,
  updateFlashcard,
  deleteFlashcard,
  getDueReviews,
  submitReview,
  getReviewStats,
} from '../controllers/advancedFeaturesController';
import { auth } from '../middleware/auth';

const router = Router();

// Apply authentication middleware to all routes
router.use(auth);

// Flashcard Management
router.get('/flashcards', getFlashcards);
router.post('/flashcards', createFlashcard);
router.put('/flashcards/:id', updateFlashcard);
router.delete('/flashcards/:id', deleteFlashcard);

// Spaced Repetition
router.get('/reviews/due', getDueReviews);
router.post('/reviews/submit', submitReview);
router.get('/reviews/stats', getReviewStats);

export default router;
