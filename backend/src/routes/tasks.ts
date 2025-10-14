import { Router } from 'express';
import { body } from 'express-validator';
import { auth } from '../middleware/auth';
import {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  toggleTaskCompletion,
  getTaskStats
} from '../controllers/taskController';

const router = Router();

// Validation middleware
const createTaskValidation = [
  body('title')
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Description must be less than 1000 characters'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Priority must be low, medium, or high'),
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Due date must be a valid date')
];

const updateTaskValidation = [
  body('title')
    .optional()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Description must be less than 1000 characters'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Priority must be low, medium, or high'),
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Due date must be a valid date'),
  body('completed')
    .optional()
    .isBoolean()
    .withMessage('Completed must be a boolean')
];

// Apply auth middleware to all routes
router.use(auth);

// Routes
router.post('/', createTaskValidation, createTask);
router.get('/', getTasks);
router.get('/stats', getTaskStats);
router.get('/:id', getTaskById);
router.put('/:id', updateTaskValidation, updateTask);
router.delete('/:id', deleteTask);
router.patch('/:id/toggle', toggleTaskCompletion);

export default router; 