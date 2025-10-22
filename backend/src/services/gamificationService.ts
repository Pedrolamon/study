import { prisma } from '../models';
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
      const userPoints = await this.getOrCreateUserPoints(userId);
      await this.updateUserPoints(userId, points, reason, source);
      
      // Check for achievements
      await this.checkAchievements(userId);
      
      // Send notification for significant points
      if (points >= 50) {
        await NotificationService.createNotification({
          userId,
          title: 'Pontos Ganhos!',
          message: `Você ganhou ${points} pontos por: ${reason}`,
          type: 'ACHIEVEMENT'
        });
      }
    } catch (error) {
      console.error('Error adding points:', error);
      throw error;
    }
  }

  // Award points for task completion
  static async awardTaskPoints(userId: string, task: any): Promise<void> {
    const points = task.completedOnTime
      ? this.POINTS_CONFIG.task_completed_on_time
      : this.POINTS_CONFIG.task_completed;
    
    await this.addPoints(userId, points, 'Tarefa concluída', 'task_completion');
  }

  // Award points for study session
  static async awardStudySessionPoints(userId: string, session: any): Promise<void> {
    const duration = session.duration || 0;
    let points = 0;
    let reason = '';

    if (duration >= 60) {
      points = this.POINTS_CONFIG.study_session_60min;
      reason = 'Sessão de estudo de 60+ minutos';
    } else if (duration >= 30) {
      points = this.POINTS_CONFIG.study_session_30min;
      reason = 'Sessão de estudo de 30+ minutos';
    }

    if (points > 0) {
      await this.addPoints(userId, points, reason, 'study_session');
    }
  }

  // Award points for flashcard review
  static async awardFlashcardPoints(userId: string): Promise<void> {
    await this.addPoints(
      userId,
      this.POINTS_CONFIG.flashcard_reviewed,
      'Flashcard revisado',
      'flashcard_review'
    );
  }

  // Award points for material upload
  static async awardMaterialPoints(userId: string): Promise<void> {
    await this.addPoints(
      userId,
      this.POINTS_CONFIG.material_uploaded,
      'Material de estudo enviado',
      'material_upload'
    );
  }

  // Check and award streak points
  static async checkStreakPoints(userId: string, streak: number): Promise<void> {
    let points = 0;
    let reason = '';

    if (streak >= 30) {
      points = this.POINTS_CONFIG.streak_30_days;
      reason = 'Sequência de 30 dias!';
    } else if (streak >= 7) {
      points = this.POINTS_CONFIG.streak_7_days;
      reason = 'Sequência de 7 dias!';
    } else if (streak >= 3) {
      points = this.POINTS_CONFIG.streak_3_days;
      reason = 'Sequência de 3 dias!';
    }

    if (points > 0) {
      await this.addPoints(userId, points, reason, 'streak');
    }
  }

  // Get or create user points
  private static async getOrCreateUserPoints(userId: string) {
    let userPoints = await prisma.userPoints.findUnique({
      where: { userId }
    });

    if (!userPoints) {
      userPoints = await prisma.userPoints.create({
        data: {
          userId,
          totalPoints: 0,
          level: 1,
          experience: 0,
          experienceToNextLevel: 100,
          pointsHistory: []
        }
      });
    }

    return userPoints;
  }

  // Update user points
  private static async updateUserPoints(userId: string, points: number, reason: string, source: string) {
    const userPoints = await this.getOrCreateUserPoints(userId);
    
    const newTotalPoints = userPoints.totalPoints + points;
    const newExperience = userPoints.experience + points;
    
    // Calculate new level
    let newLevel = userPoints.level;
    let newExperienceToNextLevel = userPoints.experienceToNextLevel;
    let remainingExperience = newExperience;
    
    while (remainingExperience >= newExperienceToNextLevel) {
      newLevel++;
      remainingExperience -= newExperienceToNextLevel;
      newExperienceToNextLevel = Math.floor(newExperienceToNextLevel * 1.2);
    }

    const pointsEntry = {
      date: new Date().toISOString(),
      points,
      reason,
      source
    };

    await prisma.userPoints.update({
      where: { userId },
      data: {
        totalPoints: newTotalPoints,
        level: newLevel,
        experience: remainingExperience,
        experienceToNextLevel: newExperienceToNextLevel,
        pointsHistory: {
          push: pointsEntry
        }
      }
    });

    // Check for level up
    if (newLevel > userPoints.level) {
      await NotificationService.createNotification({
        userId,
        title: 'Level Up!',
        message: `Parabéns! Você subiu para o nível ${newLevel}!`,
        type: 'ACHIEVEMENT'
      });
    }
  }

  // Check for achievements
  private static async checkAchievements(userId: string): Promise<void> {
    const userPoints = await this.getOrCreateUserPoints(userId);
    
    // Check for point-based achievements
    const pointAchievements = [
      { threshold: 100, badge: 'first_100_points' },
      { threshold: 500, badge: 'dedicated_student' },
      { threshold: 1000, badge: 'study_master' },
      { threshold: 5000, badge: 'study_legend' }
    ];

    for (const achievement of pointAchievements) {
      if (userPoints.totalPoints >= achievement.threshold) {
        await this.unlockBadge(userId, achievement.badge);
      }
    }

    // Check for level-based achievements
    const levelAchievements = [
      { level: 5, badge: 'rising_star' },
      { level: 10, badge: 'knowledge_seeker' },
      { level: 20, badge: 'study_champion' },
      { level: 50, badge: 'study_legend' }
    ];

    for (const achievement of levelAchievements) {
      if (userPoints.level >= achievement.level) {
        await this.unlockBadge(userId, achievement.badge);
      }
    }
  }

  // Unlock badge
  private static async unlockBadge(userId: string, badgeName: string): Promise<void> {
    // Check if badge already exists
    const existingBadge = await prisma.badge.findFirst({
      where: { name: badgeName }
    });

    if (!existingBadge) {
      // Create badge if it doesn't exist
      await prisma.badge.create({
        data: {
          name: badgeName,
          description: `Badge: ${badgeName}`,
          icon: '🏆',
          category: 'ACHIEVEMENT',
          pointsReward: 50,
          requirements: {}
        }
      });
    }

    // Check if user already has this achievement
    const existingAchievement = await prisma.achievement.findFirst({
      where: {
        userId,
        badge: { name: badgeName }
      }
    });

    if (!existingAchievement) {
      // Create achievement
      await prisma.achievement.create({
        data: {
          userId,
          badgeId: existingBadge?.id || '',
          pointsEarned: 50
        }
      });

      // Award points for badge
      await this.addPoints(userId, this.POINTS_CONFIG.badge_unlocked, `Badge desbloqueado: ${badgeName}`, 'badge_unlock');

      // Send notification
      await NotificationService.createNotification({
        userId,
        title: 'Badge Desbloqueado!',
        message: `Parabéns! Você desbloqueou o badge: ${badgeName}`,
        type: 'ACHIEVEMENT'
      });
    }
  }

  // Get user statistics
  static async getUserStats(userId: string) {
    const userPoints = await this.getOrCreateUserPoints(userId);
    
    const [achievements, badges] = await Promise.all([
      prisma.achievement.findMany({
        where: { userId },
        include: { badge: true }
      }),
      prisma.badge.findMany()
    ]);

    return {
      userPoints,
      achievements,
      totalBadges: badges.length,
      unlockedBadges: achievements.length,
      completionRate: badges.length > 0 ? (achievements.length / badges.length) * 100 : 0
    };
  }
}