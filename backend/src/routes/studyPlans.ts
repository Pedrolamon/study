import { Router } from 'express';
import {
  createEdital,
  getEditais,
  getEdital,
  generateStudyPlan,
  getStudyPlans,
  getStudyPlan,
  updateSessionStatus,
  adaptStudyPlan,
  getUpcomingSessions
} from '../controllers/studyPlanController';
import { auth } from '../middleware/auth';

const router = Router();

// Apply authentication middleware to all routes
router.use(auth);

// Edital routes
router.post('/editais', createEdital);
router.get('/editais', getEditais);
router.get('/editais/:id', getEdital);

// Study plan routes
router.post('/generate', generateStudyPlan);
router.get('/', getStudyPlans);
router.get('/:id', getStudyPlan);
router.put('/:planId/sessions/:sessionId', updateSessionStatus);
router.post('/:id/adapt', adaptStudyPlan);

// Utility routes
router.get('/sessions/upcoming', getUpcomingSessions);

export default router;
