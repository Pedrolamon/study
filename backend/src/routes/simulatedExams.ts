import { Router } from 'express';
import {
  getExams,
  getExam,
  createExam,
  updateExam,
  deleteExam,
  submitExamResult,
  getExamResults,
  getExamResult,
  getExamStats,
  getExamsBySubject
} from '../controllers/simulatedExamController';
import { auth } from '../middleware/auth';

const router = Router();

// Apply authentication middleware to all routes
router.use(auth);

// Exam CRUD routes
router.get('/', getExams);
router.get('/stats', getExamStats);
router.post('/', createExam);

// Routes with exam ID
router.get('/:id', getExam);
router.put('/:id', updateExam);
router.delete('/:id', deleteExam);

// Exam result routes
router.post('/:id/submit', submitExamResult);
router.get('/:id/results', getExamResults);
router.get('/results/:id', getExamResult);

// Subject-based routes
router.get('/subject/:subject', getExamsBySubject);

export default router;
