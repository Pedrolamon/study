import { Router } from 'express';
import { body } from 'express-validator';
import { auth } from '../middleware/auth';
import {
  createStudySession,
  getStudySessions,
  getStudySessionById,
  endStudySession,
  updateStudySession,
  deleteStudySession,
  getStudyStats
} from '../controllers/studySessionController';

const router = Router();

// Validation middleware
const createSessionValidation = [
  body('mode')
    .isIn(['pomodoro', 'flowtime', 'custom'])
    .withMessage('Mode must be pomodoro, flowtime, or custom'),
  body('subject')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Subject must be less than 200 characters'),
  body('duration')
    .isInt({ min: 1, max: 1440 })
    .withMessage('Duration must be between 1 and 1440 minutes')
];

const updateSessionValidation = [
  body('mode')
    .optional()
    .isIn(['pomodoro', 'flowtime', 'custom'])
    .withMessage('Mode must be pomodoro, flowtime, or custom'),
  body('subject')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Subject must be less than 200 characters'),
  body('duration')
    .optional()
    .isInt({ min: 1, max: 1440 })
    .withMessage('Duration must be between 1 and 1440 minutes'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean')
];

// Apply auth middleware to all routes
router.use(auth);

// Routes
router.post('/', createSessionValidation, createStudySession);
router.get('/', getStudySessions);
router.get('/stats', getStudyStats);
router.get('/:id', getStudySessionById);
router.put('/:id', updateSessionValidation, updateStudySession);
router.delete('/:id', deleteStudySession);
router.patch('/:id/end', endStudySession);

export default router; 