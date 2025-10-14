import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { auth } from '../middleware/auth';
import { handleValidationErrors } from '../middleware/errorHandler';
import {
  createFlashcard,
  getFlashcards,
  getFlashcardById,
  updateFlashcard,
  deleteFlashcard,
  reviewFlashcard,
  resetFlashcardReview,
  getFlashcardStats
} from '../controllers/flashcardController';

const router = Router();

// Todas as rotas requerem autenticação
router.use(auth);

// POST /api/flashcards - Criar flashcard
router.post('/', [
  body('question')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Pergunta deve ter entre 1 e 1000 caracteres'),
  body('answer')
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Resposta deve ter entre 1 e 2000 caracteres'),
  body('category')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Categoria deve ter entre 1 e 100 caracteres'),
  body('difficulty')
    .optional()
    .isIn(['easy', 'medium', 'hard'])
    .withMessage('Dificuldade deve ser easy, medium ou hard'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags deve ser um array'),
  handleValidationErrors
], createFlashcard);

// GET /api/flashcards - Listar flashcards
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Página deve ser um número inteiro positivo'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limite deve ser entre 1 e 100'),
  query('category').optional().trim().isLength({ min: 1 }).withMessage('Categoria não pode estar vazia'),
  query('difficulty').optional().isIn(['easy', 'medium', 'hard']).withMessage('Dificuldade deve ser easy, medium ou hard'),
  query('isActive').optional().isBoolean().withMessage('isActive deve ser true ou false'),
  query('readyForReview').optional().isBoolean().withMessage('readyForReview deve ser true ou false'),
  handleValidationErrors
], getFlashcards);

// GET /api/flashcards/stats - Estatísticas de flashcards
router.get('/stats', getFlashcardStats);

// GET /api/flashcards/:flashcardId - Buscar flashcard por ID
router.get('/:flashcardId', [
  param('flashcardId').isMongoId().withMessage('ID de flashcard inválido'),
  handleValidationErrors
], getFlashcardById);

// PUT /api/flashcards/:flashcardId - Atualizar flashcard
router.put('/:flashcardId', [
  param('flashcardId').isMongoId().withMessage('ID de flashcard inválido'),
  body('question')
    .optional()
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Pergunta deve ter entre 1 e 1000 caracteres'),
  body('answer')
    .optional()
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Resposta deve ter entre 1 e 2000 caracteres'),
  body('category')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Categoria deve ter entre 1 e 100 caracteres'),
  body('difficulty')
    .optional()
    .isIn(['easy', 'medium', 'hard'])
    .withMessage('Dificuldade deve ser easy, medium ou hard'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags deve ser um array'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive deve ser true ou false'),
  handleValidationErrors
], updateFlashcard);

// DELETE /api/flashcards/:flashcardId - Deletar flashcard
router.delete('/:flashcardId', [
  param('flashcardId').isMongoId().withMessage('ID de flashcard inválido'),
  handleValidationErrors
], deleteFlashcard);

// POST /api/flashcards/:flashcardId/review - Revisar flashcard
router.post('/:flashcardId/review', [
  param('flashcardId').isMongoId().withMessage('ID de flashcard inválido'),
  body('wasCorrect')
    .isBoolean()
    .withMessage('wasCorrect deve ser true ou false'),
  handleValidationErrors
], reviewFlashcard);

// POST /api/flashcards/:flashcardId/reset-review - Resetar revisão do flashcard
router.post('/:flashcardId/reset-review', [
  param('flashcardId').isMongoId().withMessage('ID de flashcard inválido'),
  handleValidationErrors
], resetFlashcardReview);

export default router; 