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
          type: 'ACHIEVEMENT',
          isRead: false,
          isEmailSent: false,
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
        type: 'ACHIEVEMENT',
        isRead: false,
        isEmailSent: false
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
    let badge = await prisma.badge.findFirst({
        where: { name: badgeName }
    });

    if (!badge) {
        badge = await prisma.badge.create({
            data: {
                name: badgeName,
                description: `Badge: ${badgeName}`,
                icon: '🏆',
                category: 'ACHIEVEMENT',
                pointsReward: this.POINTS_CONFIG.badge_unlocked,
                requirements: {}
            }
        });
    }

    if (!badge) {
        console.error(`Não foi possível encontrar ou criar o badge com nome: ${badgeName}`);
        return;
    }
    
    const badgeId = badge.id; 

    const existingAchievement = await prisma.achievement.findFirst({
        where: {
            userId: userId,
            badgeId: badgeId, 
        }
    });

    if (!existingAchievement) {
        await prisma.achievement.create({
            data: {
                userId,
                badgeId: badgeId, 
                pointsEarned: this.POINTS_CONFIG.badge_unlocked 
            }
        });

        await this.addPoints(
            userId, 
            this.POINTS_CONFIG.badge_unlocked, 
            `Badge desbloqueado: ${badgeName}`, 
            'badge_unlock'
        );

        await NotificationService.createNotification({
            userId,
            title: 'Badge Desbloqueado!',
            message: `Parabéns! Você desbloqueou o badge: ${badgeName}`,
            type: 'ACHIEVEMENT',
            isRead: false,
            isEmailSent: false
        });
    }
}

// Adicionar ao GamificationService (Prisma)
static async getLeaderboard(limit: number = 50): Promise<any[]> {
  try {
      const leaderboard = await prisma.userPoints.findMany({
          orderBy: {
              totalPoints: 'desc', // Ordena pelo total de pontos
          },
          take: limit, // Limita o número de resultados
          include: {
              user: { // Inclui o modelo User para obter o username
                  select: {
                      username: true
                  }
              }
          }
      });

      // Mapeia para o formato de resposta, adicionando o rank
      return leaderboard.map((entry, index) => ({
          rank: index + 1,
          userId: entry.userId,
          // Assume que o relacionamento 'user' está definido e que 'username' é o campo
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

// Adicionar ao GamificationService (Prisma)
static async getTopByLevel(limit: number = 10): Promise<any[]> {
  try {
      const topUsers = await prisma.userPoints.findMany({
          orderBy: [
              { level: 'desc' }, // Nível mais alto primeiro
              { experience: 'desc' } // Experiência mais alta (como desempate)
          ],
          take: limit,
          include: {
              user: {
                  select: {
                      username: true
                  }
              }
          }
      });

      // Mapeia para o formato de resposta, adicionando o rank
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

// Adicionar ao GamificationService (Prisma)
static async getRecentAchievements(limit: number = 10): Promise<any[]> {
  try {
      const achievements = await prisma.achievement.findMany({
          orderBy: {
              unlockedAt: 'desc', // Assumindo que 'unlockedAt' é o campo de data de criação/desbloqueio
          },
          take: limit,
          include: {
              user: { // Inclui o User para o nome
                  select: {
                      username: true
                  }
              },
              badge: { // Inclui o Badge para nome e ícone
                  select: {
                      name: true,
                      icon: true
                  }
              }
          }
      });

      // Mapeia para o formato de resposta
      return achievements.map(achievement => ({
          id: achievement.id, // Assumindo 'id' no modelo Prisma
          userId: achievement.userId,
          username: achievement.user?.username || 'Usuário',
          badgeName: achievement.badge?.name || 'Badge',
          badgeIcon: achievement.badge?.icon || '',
          pointsEarned: achievement.pointsEarned,
          unlockedAt: achievement.unlockedAt // Campo de data/hora
      }));
  } catch (error) {
      console.error('Error getting recent achievements:', error);
      throw error;
  }
}

// Adicionar ao GamificationService (Prisma)
static async getBadgeProgress(userId: string): Promise<any[]> {
  try {
      const badges = await prisma.badge.findMany({
          // Assumindo que você tem um campo 'isActive' ou algo similar para badges ativos
          // where: { isActive: true } 
      });

      // 1. Obter todos os dados do usuário necessários para calcular o progresso
      // ATENÇÃO: É necessário substituir pelos seus próprios métodos de obtenção de dados do usuário.
      const [
          tasksCompletedCount,
          studyTimeTotalMinutes,
          flashcardsReviewedCount,
          materialsUploadedCount,
          perfectSessionsCount,
          hasStreak, // Fictício
          userAchievements
      ] = await Promise.all([
          // Exemplo: Contar tarefas completadas. Você precisará implementar esta query no seu Task model.
          prisma.task.count({ where: { userId, isCompleted: true } }), 
          // Exemplo: Somar duração de sessões de estudo. Você precisará implementar esta query no seu StudySession model.
          prisma.studySession.aggregate({
              where: { userId },
              _sum: { duration: true } // Assumindo 'duration' em minutos
          }).then(agg => agg._sum.duration || 0),
          // Exemplo: Contar revisões de flashcards.
          prisma.flashcardReview.count({ where: { userId } }), // Modelo Fictício: FlashcardReview
          // Exemplo: Contar materiais enviados.
          prisma.studyMaterial.count({ where: { userId } }),
          // Exemplo: Contar sessões perfeitas (você pode ter um campo para isso no StudySession)
          prisma.studySession.count({ where: { userId, isPerfect: true } }),
          // Exemplo: Verificar se há uma streak. (A streak real deve vir do modelo User)
          prisma.user.findUnique({ where: { id: userId }, select: { studyStreak: true } })
              .then(user => user?.studyStreak || 0),
          // Obter as conquistas do usuário
          prisma.achievement.findMany({ where: { userId } })
      ]);

      const unlockedBadgeIds = new Set(userAchievements.map(a => a.badgeId));
      
      const progressResults = badges.map((badge) => {
          const isUnlocked = unlockedBadgeIds.has(badge.id);

          // 2. Simular a lógica de progresso (getUserProgress)
          let currentProgress = 0;
          let requiredValue = badge.requirements.value || 0; // 'requirements' é um Json
          let requirementType = badge.requirements.type;

          if (isUnlocked) {
              currentProgress = requiredValue;
          } else {
              switch (requirementType) {
                  case 'tasks_completed':
                      currentProgress = tasksCompletedCount;
                      break;
                  case 'study_time':
                      currentProgress = studyTimeTotalMinutes;
                      break;
                  case 'flashcards_reviewed':
                      currentProgress = flashcardsReviewedCount;
                      break;
                  case 'materials_uploaded':
                      currentProgress = materialsUploadedCount;
                      break;
                  case 'perfect_sessions':
                      currentProgress = perfectSessionsCount;
                      break;
                  case 'streak_days':
                      currentProgress = hasStreak;
                      break;
                  default:
                      currentProgress = 0;
              }
          }
          
          // 3. Calcular a porcentagem
          const percentage = requiredValue > 0 
              ? Math.min(100, Math.floor((currentProgress / requiredValue) * 100)) 
              : (isUnlocked ? 100 : 0);
          
          return {
              id: badge.id,
              name: badge.name,
              description: badge.description,
              icon: badge.icon,
              category: badge.category,
              pointsReward: badge.pointsReward,
              isUnlocked,
              progress: {
                  current: currentProgress,
                  required: requiredValue,
                  percentage: percentage
              }
          };
      });

      return progressResults;
  } catch (error) {
      console.error('Error getting badge progress:', error);
      throw error;
  }
}

// Adicionar ao GamificationService (Prisma)
static async initializeDefaultBadges(): Promise<void> {
  try {
      const defaultBadges = [
          {
              name: 'Primeiro Passo',
              description: 'Complete sua primeira tarefa',
              icon: '🎯',
              category: 'ACHIEVEMENT', // Usando maiúsculas como no código Prisma original
              pointsReward: 50,
              requirements: { type: 'tasks_completed', value: 1 }
          },
          {
              name: 'Estudioso',
              description: 'Complete 10 tarefas',
              icon: '📚',
              category: 'STUDY',
              pointsReward: 100,
              requirements: { type: 'tasks_completed', value: 10 }
          },
          {
              name: 'Mestre',
              description: 'Complete 50 tarefas',
              icon: '👑',
              category: 'ACHIEVEMENT',
              pointsReward: 500,
              requirements: { type: 'tasks_completed', value: 50 }
          },
          {
              name: 'Focado',
              description: 'Estude por 30 minutos',
              icon: '⏰',
              category: 'STUDY',
              pointsReward: 75,
              requirements: { type: 'study_time', value: 30 }
          },
          {
              name: 'Maratonista',
              description: 'Estude por 2 horas',
              icon: '🏃',
              category: 'STUDY',
              pointsReward: 200,
              requirements: { type: 'study_time', value: 120 }
          },
          {
              name: 'Flashcard Master',
              description: 'Revise 50 flashcards',
              icon: '🗂️',
              category: 'STUDY',
              pointsReward: 150,
              requirements: { type: 'flashcards_reviewed', value: 50 }
          },
          {
              name: 'Organizador',
              description: 'Faça upload de 5 materiais',
              icon: '📁',
              category: 'ACHIEVEMENT',
              pointsReward: 100,
              requirements: { type: 'materials_uploaded', value: 5 }
          },
          {
              name: 'Consistente',
              description: 'Mantenha uma sequência de 7 dias',
              icon: '🔥',
              category: 'SOCIAL',
              pointsReward: 300,
              requirements: { type: 'streak_days', value: 7 }
          },
          {
              name: 'Perfeccionista',
              description: 'Complete 10 sessões perfeitas',
              icon: '⭐',
              category: 'SPECIAL',
              pointsReward: 400,
              requirements: { type: 'perfect_sessions', value: 10 }
          }
      ];
      
      for (const badgeData of defaultBadges) {
          // Verifica se o badge já existe
          const existingBadge = await prisma.badge.findUnique({
              where: { name: badgeData.name } 
          });

          if (!existingBadge) {
              // Cria o badge se não existir
              await prisma.badge.create({ data: badgeData as any });
          }
      }
      
      console.log('Default badges initialized');
  } catch (error) {
      console.error('Error initializing default badges:', error);
  }
}

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