import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { auth } from '../middleware/auth';
import { handleValidationErrors } from '../middleware/errorHandler';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getNotificationStats,
  createScheduledNotification
} from '../controllers/notificationController';

const router = Router();

// Todas as rotas requerem autenticação
router.use(auth);

// GET /api/notifications - Listar notificações
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Página deve ser um número inteiro positivo'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limite deve ser entre 1 e 100'),
  query('isRead').optional().isBoolean().withMessage('isRead deve ser true ou false'),
  handleValidationErrors
], getNotifications);

// GET /api/notifications/stats - Estatísticas de notificações
router.get('/stats', getNotificationStats);

// PATCH /api/notifications/:notificationId/read - Marcar como lida
router.patch('/:notificationId/read', [
  param('notificationId').isMongoId().withMessage('ID de notificação inválido'),
  handleValidationErrors
], markAsRead);

// PATCH /api/notifications/read-all - Marcar todas como lidas
router.patch('/read-all', markAllAsRead);

// DELETE /api/notifications/:notificationId - Deletar notificação
router.delete('/:notificationId', [
  param('notificationId').isMongoId().withMessage('ID de notificação inválido'),
  handleValidationErrors
], deleteNotification);

// POST /api/notifications/scheduled - Criar notificação agendada
router.post('/scheduled', [
  body('title')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Título deve ter entre 1 e 100 caracteres'),
  body('message')
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Mensagem deve ter entre 1 e 500 caracteres'),
  body('type')
    .isIn(['task', 'study', 'exam', 'reminder', 'achievement', 'system'])
    .withMessage('Tipo deve ser task, study, exam, reminder, achievement ou system'),
  body('scheduledFor')
    .isISO8601()
    .withMessage('Data de agendamento deve ser uma data válida'),
  handleValidationErrors
], createScheduledNotification);

export default router; 