import Badge from '../models/Badge';
import Achievement from '../models/Achievement';
import UserPoints from '../models/UserPoints';
import { UserModel as User } from '../models/User';
import Task from '../models/Task';
import StudySession from '../models/StudySession';
import Flashcard from '../models/Flashcard';
import StudyMaterial from '../models/StudyMaterial';
import { NotificationService } from './notificationService';

export class GamificationService {
  // Points configuration
  private static readonly POINTS_CONFIG = {
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
  };

  // Add points to user
  static async addPoints(userId: string, points: number, reason: string, source: string): Promise<void> {
    try {
      const userPoints = await UserPoints.getOrCreateUserPoints(userId);
      await userPoints.addPoints(points, reason, source);
      
      // Check for achievements
      await this.checkAchievements(userId);
      
      // Send notification for significant points
      if (points >= 50) {
        await NotificationService.createNotification({
          userId,
          title: 'Pontos Ganhos!',
          message: `Você ganhou ${points} pontos por: ${reason}`,
          type: 'achievement'
        });
      }
    } catch (error) {
      console.error('Error adding points:', error);
      throw error;
    }
  }

  // Award points for task completion
  static async awardTaskPoints(userId: string, task: any): Promise<void> {
    const points = task.completedOnTime ? 
      this.POINTS_CONFIG.task_completed_on_time : 
      this.POINTS_CONFIG.task_completed;
    
    const reason = task.completedOnTime ? 
      'Tarefa concluída no prazo' : 
      'Tarefa concluída';
    
    await this.addPoints(userId, points, reason, 'task');
  }

  // Award points for study session
  static async awardStudyPoints(userId: string, session: any): Promise<void> {
    if (!session.endTime || !session.startTime) return;
    
    const durationMinutes = Math.floor(
      (session.endTime.getTime() - session.startTime.getTime()) / (1000 * 60)
    );
    
    let points = 0;
    let reason = '';
    
    if (durationMinutes >= 60) {
      points = this.POINTS_CONFIG.study_session_60min;
      reason = 'Sessão de estudo de 60+ minutos';
    } else if (durationMinutes >= 30) {
      points = this.POINTS_CONFIG.study_session_30min;
      reason = 'Sessão de estudo de 30+ minutos';
    }
    
    if (points > 0) {
      await this.addPoints(userId, points, reason, 'study');
    }
    
    // Check for perfect session (25+ minutes focused)
    if (durationMinutes >= 25) {
      await this.addPoints(userId, this.POINTS_CONFIG.perfect_session, 'Sessão perfeita', 'study');
    }
  }

  // Award points for flashcard review
  static async awardFlashcardPoints(userId: string, flashcard: any): Promise<void> {
    await this.addPoints(userId, this.POINTS_CONFIG.flashcard_reviewed, 'Flashcard revisado', 'flashcard');
  }

  // Award points for material upload
  static async awardMaterialPoints(userId: string, material: any): Promise<void> {
    await this.addPoints(userId, this.POINTS_CONFIG.material_uploaded, 'Material de estudo enviado', 'material');
  }

  // Check and award streak points
  static async checkStreakPoints(userId: string): Promise<void> {
    const user = await User.findById(userId);
    if (!user || !user.studyStreak) return;
    
    const streak = user.studyStreak;
    let points = 0;
    let reason = '';
    
    if (streak >= 30) {
      points = this.POINTS_CONFIG.streak_30_days;
      reason = 'Sequência de 30 dias de estudo!';
    } else if (streak >= 7) {
      points = this.POINTS_CONFIG.streak_7_days;
      reason = 'Sequência de 7 dias de estudo!';
    } else if (streak >= 3) {
      points = this.POINTS_CONFIG.streak_3_days;
      reason = 'Sequência de 3 dias de estudo!';
    }
    
    if (points > 0) {
      await this.addPoints(userId, points, reason, 'streak');
    }
  }

  // Check for achievements
  static async checkAchievements(userId: string): Promise<void> {
    try {
      const badges = await Badge.getActiveBadges();
      
      for (const badge of badges) {
        // Check if user already has this achievement
        const hasAchievement = await Achievement.hasAchievement(userId, badge._id.toString());
        if (hasAchievement) continue;
        
        // Check if user meets requirements
        const progress = await badge.getUserProgress(userId);
        
        if (progress.percentage >= 100) {
          await this.unlockAchievement(userId, badge);
        }
      }
    } catch (error) {
      console.error('Error checking achievements:', error);
    }
  }

  // Unlock achievement
  static async unlockAchievement(userId: string, badge: any): Promise<void> {
    try {
      // Create achievement record
      const achievement = new Achievement({
        userId,
        badgeId: badge._id,
        pointsEarned: badge.pointsReward
      });
      await achievement.save();
      
      // Award badge points
      await this.addPoints(userId, badge.pointsReward, `Badge desbloqueado: ${badge.name}`, 'badge');
      
      // Send notification
      await NotificationService.createNotification({
        userId,
        title: 'Badge Desbloqueado!',
        message: `Parabéns! Você desbloqueou o badge "${badge.name}"`,
        type: 'achievement'
      });
      
      console.log(`Achievement unlocked: ${badge.name} for user ${userId}`);
    } catch (error) {
      console.error('Error unlocking achievement:', error);
    }
  }

  // Get user gamification stats
  static async getUserStats(userId: string): Promise<any> {
    try {
      const userPoints = await UserPoints.getUserPoints(userId);
      const achievements = await Achievement.getUserAchievements(userId);
      const badges = await Badge.getActiveBadges();
      
      // Get user's unlocked badges
      const unlockedBadges = await Promise.all(
        badges.map(async (badge) => {
          const isUnlocked = await badge.isUnlockedByUser(userId);
          const progress = await badge.getUserProgress(userId);
          
          return {
            ...badge.toObject(),
            isUnlocked,
            progress
          };
        })
      );
      
      // Calculate rank
      const rank = await UserPoints.getUserRank(userId);
      const totalUsers = await UserPoints.countDocuments();
      
      return {
        userPoints: userPoints?.toObject() || null,
        achievements: achievements.map(a => a.toObject()),
        badges: unlockedBadges,
        rank,
        totalUsers,
        levelProgress: userPoints?.getLevelProgress() || 0,
        pointsBySource: userPoints?.getPointsBySource() || {},
        recentHistory: userPoints?.getRecentHistory(10) || []
      };
    } catch (error) {
      console.error('Error getting user stats:', error);
      throw error;
    }
  }

  // Get leaderboard
  static async getLeaderboard(limit: number = 50): Promise<any[]> {
    try {
      const leaderboard = await UserPoints.getLeaderboard(limit);
      
      return leaderboard.map((entry, index) => ({
        rank: index + 1,
        userId: entry.userId,
        username: entry.user?.username || 'Usuário',
        totalPoints: entry.totalPoints,
        level: entry.level,
        experience: entry.experience,
        experienceToNextLevel: entry.experienceToNextLevel
      }));
    } catch (error) {
      console.error('Error getting leaderboard:', error);
      throw error;
    }
  }

  // Get top users by level
  static async getTopByLevel(limit: number = 10): Promise<any[]> {
    try {
      const topUsers = await UserPoints.getTopByLevel(limit);
      
      return topUsers.map((entry, index) => ({
        rank: index + 1,
        userId: entry.userId,
        username: entry.user?.username || 'Usuário',
        level: entry.level,
        experience: entry.experience,
        totalPoints: entry.totalPoints
      }));
    } catch (error) {
      console.error('Error getting top by level:', error);
      throw error;
    }
  }

  // Get recent achievements
  static async getRecentAchievements(limit: number = 10): Promise<any[]> {
    try {
      const achievements = await Achievement.getRecentAchievements(limit);
      
      return achievements.map(achievement => ({
        id: achievement._id,
        userId: achievement.userId,
        username: achievement.user?.username || 'Usuário',
        badgeName: achievement.badge?.name || 'Badge',
        badgeIcon: achievement.badge?.icon || '',
        pointsEarned: achievement.pointsEarned,
        unlockedAt: achievement.unlockedAt
      }));
    } catch (error) {
      console.error('Error getting recent achievements:', error);
      throw error;
    }
  }

  // Get badge progress for user
  static async getBadgeProgress(userId: string): Promise<any[]> {
    try {
      const badges = await Badge.getActiveBadges();
      
      const progress = await Promise.all(
        badges.map(async (badge) => {
          const isUnlocked = await badge.isUnlockedByUser(userId);
          const userProgress = await badge.getUserProgress(userId);
          
          return {
            id: badge._id,
            name: badge.name,
            description: badge.description,
            icon: badge.icon,
            category: badge.category,
            pointsReward: badge.pointsReward,
            isUnlocked,
            progress: userProgress
          };
        })
      );
      
      return progress;
    } catch (error) {
      console.error('Error getting badge progress:', error);
      throw error;
    }
  }

  // Initialize default badges
  static async initializeDefaultBadges(): Promise<void> {
    try {
      const defaultBadges = [
        {
          name: 'Primeiro Passo',
          description: 'Complete sua primeira tarefa',
          icon: '🎯',
          category: 'achievement',
          pointsReward: 50,
          requirements: { type: 'tasks_completed', value: 1 }
        },
        {
          name: 'Estudioso',
          description: 'Complete 10 tarefas',
          icon: '📚',
          category: 'study',
          pointsReward: 100,
          requirements: { type: 'tasks_completed', value: 10 }
        },
        {
          name: 'Mestre',
          description: 'Complete 50 tarefas',
          icon: '👑',
          category: 'achievement',
          pointsReward: 500,
          requirements: { type: 'tasks_completed', value: 50 }
        },
        {
          name: 'Focado',
          description: 'Estude por 30 minutos',
          icon: '⏰',
          category: 'study',
          pointsReward: 75,
          requirements: { type: 'study_time', value: 30 }
        },
        {
          name: 'Maratonista',
          description: 'Estude por 2 horas',
          icon: '🏃',
          category: 'study',
          pointsReward: 200,
          requirements: { type: 'study_time', value: 120 }
        },
        {
          name: 'Flashcard Master',
          description: 'Revise 50 flashcards',
          icon: '🗂️',
          category: 'study',
          pointsReward: 150,
          requirements: { type: 'flashcards_reviewed', value: 50 }
        },
        {
          name: 'Organizador',
          description: 'Faça upload de 5 materiais',
          icon: '📁',
          category: 'achievement',
          pointsReward: 100,
          requirements: { type: 'materials_uploaded', value: 5 }
        },
        {
          name: 'Consistente',
          description: 'Mantenha uma sequência de 7 dias',
          icon: '🔥',
          category: 'social',
          pointsReward: 300,
          requirements: { type: 'streak_days', value: 7 }
        },
        {
          name: 'Perfeccionista',
          description: 'Complete 10 sessões perfeitas',
          icon: '⭐',
          category: 'special',
          pointsReward: 400,
          requirements: { type: 'perfect_sessions', value: 10 }
        }
      ];
      
      for (const badgeData of defaultBadges) {
        const existingBadge = await Badge.findOne({ name: badgeData.name });
        if (!existingBadge) {
          const badge = new Badge(badgeData);
          await badge.save();
        }
      }
      
      console.log('Default badges initialized');
    } catch (error) {
      console.error('Error initializing default badges:', error);
    }
  }
}
