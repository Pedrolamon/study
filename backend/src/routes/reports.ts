import { Router } from 'express';
import { query } from 'express-validator';
import { auth } from '../middleware/auth';
import { handleValidationErrors } from '../middleware/errorHandler';
import {
  getUserReport,
  getProgressReport,
  getFlashcardReport,
  getStudyMaterialReport,
  getNotificationReport,
  getComparativeReport,
  getDashboardData
} from '../controllers/reportController';

const router = Router();

// Todas as rotas requerem autenticação
router.use(auth);

// GET /api/reports/user - Relatório geral do usuário
router.get('/user', [
  query('period')
    .optional()
    .isIn(['day', 'week', 'month', 'year'])
    .withMessage('Período deve ser day, week, month ou year'),
  handleValidationErrors
], getUserReport);

// GET /api/reports/progress - Relatório de progresso ao longo do tempo
router.get('/progress', [
  query('days')
    .optional()
    .isInt({ min: 1, max: 365 })
    .withMessage('Dias deve ser um número entre 1 e 365'),
  handleValidationErrors
], getProgressReport);

// GET /api/reports/flashcards - Relatório de flashcards
router.get('/flashcards', getFlashcardReport);

// GET /api/reports/materials - Relatório de materiais de estudo
router.get('/materials', getStudyMaterialReport);

// GET /api/reports/notifications - Relatório de notificações
router.get('/notifications', getNotificationReport);

// GET /api/reports/comparative - Relatório comparativo
router.get('/comparative', getComparativeReport);

// GET /api/reports/dashboard - Dados do dashboard
router.get('/dashboard', getDashboardData);

export default router; 