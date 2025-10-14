import express from 'express';
import { body, query } from 'express-validator';
import { GamificationController } from '../controllers/gamificationController';
import { auth } from '../middleware/auth';
import { validateRequest } from '../middleware/validateRequest';

const router = express.Router();

// Apply auth middleware to all routes
router.use(auth);

// Get user gamification stats
router.get('/stats', GamificationController.getUserStats);

// Get leaderboard
router.get('/leaderboard', [
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
], validateRequest, GamificationController.getLeaderboard);

// Get top users by level
router.get('/top-level', [
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50')
], validateRequest, GamificationController.getTopByLevel);

// Get recent achievements
router.get('/recent-achievements', [
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50')
], validateRequest, GamificationController.getRecentAchievements);

// Get badge progress for user
router.get('/badges', GamificationController.getBadgeProgress);

// Get user achievements
router.get('/achievements', GamificationController.getUserAchievements);

// Get user points history
router.get('/points-history', GamificationController.getPointsHistory);

// Get user rank
router.get('/rank', GamificationController.getUserRank);

// Get gamification dashboard data
router.get('/dashboard', GamificationController.getDashboardData);

// Get gamification configuration
router.get('/config', GamificationController.getConfiguration);

// Initialize default badges (admin only)
router.post('/init-badges', GamificationController.initializeBadges);

export default router; 