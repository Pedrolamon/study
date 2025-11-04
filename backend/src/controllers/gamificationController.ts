import { Request, Response } from 'express';
import { GamificationService } from '../services/gamificationService';
import { asyncHandler } from '../middleware/errorHandler';

export class GamificationController {
  // Get user gamification stats
  static getUserStats = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const stats = await GamificationService.getUserStats(userId);
    
    res.status(200).json({
      success: true,
      data: stats
    });
  });

  // Get leaderboard
  static getLeaderboard = asyncHandler(async (req: Request, res: Response) => {
    const limit = parseInt(req.query.limit as string) || 50;
    const leaderboard = await GamificationService.getLeaderboard(limit);
    
    res.status(200).json({
      success: true,
      data: leaderboard
    });
  });

  // Get top users by level
  static getTopByLevel = asyncHandler(async (req: Request, res: Response) => {
    const limit = parseInt(req.query.limit as string) || 10;
    const topUsers = await GamificationService.getTopByLevel(limit);
    
    res.status(200).json({
      success: true,
      data: topUsers
    });
  });

  // Get recent achievements
  static getRecentAchievements = asyncHandler(async (req: Request, res: Response) => {
    const limit = parseInt(req.query.limit as string) || 10;
    const achievements = await GamificationService.getRecentAchievements(limit);
    
    res.status(200).json({
      success: true,
      data: achievements
    });
  });

  // Get badge progress for user
  static getBadgeProgress = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const badges = await GamificationService.getBadgeProgress(userId);
    
    res.status(200).json({
      success: true,
      data: badges
    });
  });

  // Get user achievements
  static getUserAchievements = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const stats = await GamificationService.getUserStats(userId);
    
    res.status(200).json({
      success: true,
      data: {
        achievements: stats.achievements,
        totalAchievements: stats.achievements.length
      }
    });
  });

  // Get user points history
  static getPointsHistory = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const stats = await GamificationService.getUserStats(userId);
    
    res.status(200).json({
      success: true,
      data: {
        history: stats.recentHistory,
        pointsBySource: stats.pointsBySource
      }
    });
  });

  // Get user rank
  static getUserRank = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const stats = await GamificationService.getUserStats(userId);
    
    res.status(200).json({
      success: true,
      data: {
        rank: stats.rank,
        totalUsers: stats.totalUsers,
        level: stats.userPoints?.level || 1,
        totalPoints: stats.userPoints?.totalPoints || 0
      }
    });
  });

  // Get gamification dashboard data
  static getDashboardData = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const stats = await GamificationService.getUserStats(userId);
    const recentAchievements = await GamificationService.getRecentAchievements(5);
    const leaderboard = await GamificationService.getLeaderboard(10);
    
    res.status(200).json({
      success: true,
      data: {
        userStats: {
          level: stats.userPoints?.level || 1,
          experience: stats.userPoints?.experience || 0,
          experienceToNextLevel: stats.userPoints?.experienceToNextLevel || 100,
          totalPoints: stats.userPoints?.totalPoints || 0,
          rank: stats.rank,
          totalUsers: stats.totalUsers,
          levelProgress: stats.levelProgress,
          achievements: stats.achievements.length,
          badges: stats.badges.filter((b: any) => b.isUnlocked).length
        },
        recentAchievements,
        leaderboard,
        nextBadges: stats.badges
          .filter((b: any) => !b.isUnlocked)
          .sort((a: any, b: any) => b.progress.percentage - a.progress.percentage)
          .slice(0, 5)
      }
    });
  });

  // Initialize default badges (admin only)
  static initializeBadges = asyncHandler(async (req: Request, res: Response) => {
    await GamificationService.initializeDefaultBadges();
    
    res.status(200).json({
      success: true,
      message: 'Default badges initialized successfully'
    });
  });

  // Get gamification configuration
  static getConfiguration = asyncHandler(async (req: Request, res: Response) => {
    const config = {
      pointsConfig: {
        task_completed: 10,
        task_completed_on_time: 15,
        study_session_30min: 20,
        study_session_60min: 40,
        flashcard_reviewed: 5,
        material_uploaded: 15,
        badge_unlocked: 50,
        streak_3_days: 30,
        streak_7_days: 100,
        streak_30_days: 500,
        perfect_session: 25
      },
      levelConfig: {
        baseExperience: 100,
        experienceMultiplier: 1.2
      }
    };
    
    res.status(200).json({
      success: true,
      data: config
    });
  });
} 