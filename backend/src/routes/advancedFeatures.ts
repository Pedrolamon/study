import { Router } from 'express';
import {
  getFlashcards,
  createFlashcard,
  updateFlashcard,
  deleteFlashcard,
  getDueReviews,
  submitReview,
  getReviewStats,
  getWidgets,
  createWidget,
  updateWidget,
  deleteWidget,
  addToOfflineQueue,
  getOfflineQueue,
  processOfflineQueue,
  getCachedData,
  updateCachedData,
  syncOfflineData,
  getStudyStreak,
  updateStudyStreak
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

// Widget Management
router.get('/widgets', getWidgets);
router.post('/widgets', createWidget);
router.put('/widgets/:id', updateWidget);
router.delete('/widgets/:id', deleteWidget);

// Offline Support
router.post('/offline/queue', addToOfflineQueue);
router.get('/offline/queue', getOfflineQueue);
router.put('/offline/queue/:itemId/process', processOfflineQueue);
router.post('/offline/sync', syncOfflineData);

// Cached Data
router.get('/cache/:dataType', getCachedData);
router.put('/cache/:dataType', updateCachedData);

// Study Streak
router.get('/streak', getStudyStreak);
router.put('/streak', updateStudyStreak);

export default router;
