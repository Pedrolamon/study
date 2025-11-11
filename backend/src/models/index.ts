 Re-export do Prisma client para uso nos modelos
export { prisma } from '../config/database';

// Re-export dos tipos do Prisma
export type {
  User,
  StudySession,
  Flashcard,
  Task,
  Notification,
  StudyMaterial,
  SimulatedExam,
  Appointment,
  Reminder,
  Achievement,
  UserPoints,
  Badge,
  BlockedSite,
  AppSettings,
  StudyReport,
  FocusTools,
  SpacedRepetition,
  SessionMode,
  Difficulty,
  Priority,
  NotificationType,
  RecurrenceType,
  ReminderType,
  BadgeCategory,
  Theme,
  ReportPeriod
} from '@prisma/client';

// Funções auxiliares para os modelos
import { prisma } from '../config/database';

// User Model Helpers
export const UserModel = {
  async create(data: any) {
    return await prisma.user.create({ data });
  },
  
  async findById(id: string) {
    return await prisma.user.findUnique({ where: { id } });
  },
  
  async findByEmail(email: string) {
    return await prisma.user.findUnique({ where: { email } });
  },
  
  async update(id: string, data: any) {
    return await prisma.user.update({ where: { id }, data });
  },
  
  async delete(id: string) {
    return await prisma.user.delete({ where: { id } });
  },
  
  async findMany(options?: any) {
    return await prisma.user.findMany(options);
  }
};

// StudySession Model Helpers
export const StudySessionModel = {
  async create(data: any) {
    return await prisma.studySession.create({ data });
  },
  
  async findById(id: string) {
    return await prisma.studySession.findUnique({ where: { id } });
  },
  
  async findByUserId(userId: string, options?: any) {
    return await prisma.studySession.findMany({
      where: { userId },
      ...options
    });
  },
  
  async update(id: string, data: any) {
    return await prisma.studySession.update({ where: { id }, data });
  },
  
  async delete(id: string) {
    return await prisma.studySession.delete({ where: { id } });
  }
};

// Flashcard Model Helpers
export const FlashcardModel = {
  async create(data: any) {
    return await prisma.flashcard.create({ data });
  },
  
  async findById(id: string) {
    return await prisma.flashcard.findUnique({ where: { id } });
  },
  
  async findByUserId(userId: string, options?: any) {
    return await prisma.flashcard.findMany({
      where: { userId },
      ...options
    });
  },
  
  async update(id: string, data: any) {
    return await prisma.flashcard.update({ where: { id }, data });
  },
  
  async delete(id: string) {
    return await prisma.flashcard.delete({ where: { id } });
  },
  
  async findReadyForReview(userId: string) {
    return await prisma.flashcard.findMany({
      where: {
        userId,
        isActive: true,
        OR: [
          { nextReview: null },
          { nextReview: { lte: new Date() } }
        ]
      }
    });
  }
};

// Task Model Helpers
export const TaskModel = {
  async create(data: any) {
    return await prisma.task.create({ data });
  },
  
  async findById(id: string) {
    return await prisma.task.findUnique({ where: { id } });
  },
  
  async findByUserId(userId: string, options?: any) {
    return await prisma.task.findMany({
      where: { userId },
      ...options
    });
  },
  
  async update(id: string, data: any) {
    return await prisma.task.update({ where: { id }, data });
  },
  
  async delete(id: string) {
    return await prisma.task.delete({ where: { id } });
  },
  
  async findOverdue(userId: string) {
    const today = new Date().toISOString();
    return await prisma.task.findMany({
      where: {
        userId,
        completed: false,
        dueDate: { lt: today }
      }
    });
  }
};

// Notification Model Helpers
export const NotificationModel = {
  async create(data: any) {
    return await prisma.notification.create({ data });
  },
  
  async findById(id: string) {
    return await prisma.notification.findUnique({ where: { id } });
  },
  
  async findByUserId(userId: string, options?: any) {
    return await prisma.notification.findMany({
      where: { userId },
      ...options
    });
  },
  
  async update(id: string, data: any) {
    return await prisma.notification.update({ where: { id }, data });
  },
  
  async delete(id: string) {
    return await prisma.notification.delete({ where: { id } });
  },
  
  async markAsRead(id: string) {
    return await prisma.notification.update({
      where: { id },
      data: { isRead: true }
    });
  }
};

// StudyMaterial Model Helpers
export const StudyMaterialModel = {
  async create(data: any) {
    return await prisma.studyMaterial.create({ data });
  },
  
  async findById(id: string) {
    return await prisma.studyMaterial.findUnique({ where: { id } });
  },
  
  async findByUserId(userId: string, options?: any) {
    return await prisma.studyMaterial.findMany({
      where: { userId },
      ...options
    });
  },
  
  async update(id: string, data: any) {
    return await prisma.studyMaterial.update({ where: { id }, data });
  },
  
  async delete(id: string) {
    return await prisma.studyMaterial.delete({ where: { id } });
  },
  
  async incrementDownloadCount(id: string) {
    return await prisma.studyMaterial.update({
      where: { id },
      data: { downloadCount: { increment: 1 } }
    });
  }
};

// SimulatedExam Model Helpers
export const SimulatedExamModel = {
  async create(data: any) {
    return await prisma.simulatedExam.create({ data });
  },
  
  async findById(id: string) {
    return await prisma.simulatedExam.findUnique({ where: { id } });
  },
  
  async findByUserId(userId: string, options?: any) {
    return await prisma.simulatedExam.findMany({
      where: { userId },
      ...options
    });
  },
  
  async update(id: string, data: any) {
    return await prisma.simulatedExam.update({ where: { id }, data });
  },
  
  async delete(id: string) {
    return await prisma.simulatedExam.delete({ where: { id } });
  }
};

// Appointment Model Helpers
export const AppointmentModel = {
  async create(data: any) {
    return await prisma.appointment.create({ data });
  },
  
  async findById(id: string) {
    return await prisma.appointment.findUnique({ 
      where: { id },
      include: { reminders: true }
    });
  },
  
  async findByUserId(userId: string, options?: any) {
    return await prisma.appointment.findMany({
      where: { userId },
      include: { reminders: true },
      ...options
    });
  },
  
  async update(id: string, data: any) {
    return await prisma.appointment.update({ where: { id }, data });
  },
  
  async delete(id: string) {
    return await prisma.appointment.delete({ where: { id } });
  }
};

// Achievement Model Helpers
export const AchievementModel = {
  async create(data: any) {
    return await prisma.achievement.create({ data });
  },
  
  async findById(id: string) {
    return await prisma.achievement.findUnique({ where: { id } });
  },
  
  async findByUserId(userId: string, options?: any) {
    return await prisma.achievement.findMany({
      where: { userId },
      ...options
    });
  },
  
  async update(id: string, data: any) {
    return await prisma.achievement.update({ where: { id }, data });
  },
  
  async delete(id: string) {
    return await prisma.achievement.delete({ where: { id } });
  }
};

// UserPoints Model Helpers
export const UserPointsModel = {
  async create(data: any) {
    return await prisma.userPoints.create({ data });
  },
  
  async findByUserId(userId: string) {
    return await prisma.userPoints.findUnique({ where: { userId } });
  },
  
  async update(userId: string, data: any) {
    return await prisma.userPoints.update({ where: { userId }, data });
  },
  
  async addPoints(userId: string, points: number, reason: string, source: string) {
    const userPoints = await prisma.userPoints.findUnique({ where: { userId } });
    if (!userPoints) {
      throw new Error('User points not found');
    }
    
    const newTotalPoints = userPoints.totalPoints + points;
    let newExperience = userPoints.experience + points;
    
    // Calcular novo nível
    let newLevel = userPoints.level;
    let newExperienceToNextLevel = userPoints.experienceToNextLevel;
    
    while (newExperience >= newExperienceToNextLevel) {
      newLevel++;
      newExperience -= newExperienceToNextLevel;
      newExperienceToNextLevel = Math.floor(newExperienceToNextLevel * 1.2); // Aumenta a cada nível
    }
    
    return await prisma.userPoints.update({
      where: { userId },
      data: {
        totalPoints: newTotalPoints,
        level: newLevel,
        experience: newExperience,
        experienceToNextLevel: newExperienceToNextLevel,
        pointsHistory: {
          push: {
            date: new Date(),
            points,
            reason,
            source
          }
        }
      }
    });
  }
};

// Badge Model Helpers
export const BadgeModel = {
  async create(data: any) {
    return await prisma.badge.create({ data });
  },
  
  async findById(id: string) {
    return await prisma.badge.findUnique({ where: { id } });
  },
  
  async findByName(name: string) {
    return await prisma.badge.findFirst({ where: { name } });
  },
  
  async findMany(options?: any) {
    return await prisma.badge.findMany(options);
  },
  
  async update(id: string, data: any) {
    return await prisma.badge.update({ where: { id }, data });
  },
  
  async delete(id: string) {
    return await prisma.badge.delete({ where: { id } });
  }
};

// AppSettings Model Helpers
export const AppSettingsModel = {
  async create(data: any) {
    return await prisma.appSettings.create({ data });
  },
  
  async findByUserId(userId: string) {
    return await prisma.appSettings.findUnique({ where: { userId } });
  },
  
  async update(userId: string, data: any) {
    return await prisma.appSettings.update({ where: { userId }, data });
  },
  
  async upsert(userId: string, data: any) {
    return await prisma.appSettings.upsert({
      where: { userId },
      update: data,
      create: { userId, ...data }
    });
  }
};

// FocusTools Model Helpers
export const FocusToolsModel = {
  async create(data: any) {
    return await prisma.focusTools.create({ data });
  },
  
  async findByUserId(userId: string) {
    return await prisma.focusTools.findUnique({ where: { userId } });
  },
  
  async update(userId: string, data: any) {
    return await prisma.focusTools.update({ where: { userId }, data });
  },
  
  async upsert(userId: string, data: any) {
    return await prisma.focusTools.upsert({
      where: { userId },
      update: data,
      create: { userId, ...data }
    });
  }
};

// StudyReport Model Helpers
export const StudyReportModel = {
  async create(data: any) {
    return await prisma.studyReport.create({ data });
  },
  
  async findById(id: string) {
    return await prisma.studyReport.findUnique({ where: { id } });
  },
  
  async findByUserId(userId: string, options?: any) {
    return await prisma.studyReport.findMany({
      where: { userId },
      ...options
    });
  },
  
  async update(id: string, data: any) {
    return await prisma.studyReport.update({ where: { id }, data });
  },
  
  async delete(id: string) {
    return await prisma.studyReport.delete({ where: { id } });
  }
};

// SpacedRepetition Model Helpers
export const SpacedRepetitionModel = {
  async create(data: any) {
    return await prisma.spacedRepetition.create({ data });
  },
  
  async findById(id: string) {
    return await prisma.spacedRepetition.findUnique({ where: { id } });
  },
  
  async findByUserId(userId: string, options?: any) {
    return await prisma.spacedRepetition.findMany({
      where: { userId },
      ...options
    });
  },
  
  async update(id: string, data: any) {
    return await prisma.spacedRepetition.update({ where: { id }, data });
  },
  
  async delete(id: string) {
    return await prisma.spacedRepetition.delete({ where: { id } });
  }
};
