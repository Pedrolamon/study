import { TaskModel } from '../models/Task';
import { StudySessionModel } from '../models/StudySession';
import { FlashcardModel } from '../models/Flashcard';
import { NotificationModel } from '../models/Notification';
import { StudyMaterialModel } from '../models/StudyMaterial';
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subDays, subWeeks, subMonths } from 'date-fns';

export class ReportService {
  // Relatório geral do usuário
  static async getUserReport(userId: string, period: 'day' | 'week' | 'month' | 'year' = 'week') {
    const now = new Date();
    let startDate: Date;
    let endDate: Date;

    switch (period) {
      case 'day':
        startDate = startOfDay(now);
        endDate = endOfDay(now);
        break;
      case 'week':
        startDate = startOfWeek(now, { weekStartsOn: 1 });
        endDate = endOfWeek(now, { weekStartsOn: 1 });
        break;
      case 'month':
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
        break;
      default:
        startDate = startOfWeek(now, { weekStartsOn: 1 });
        endDate = endOfWeek(now, { weekStartsOn: 1 });
    }

    const [
      tasksCreated,
      tasksCompleted,
      studySessions,
      totalStudyTime,
      flashcardsReviewed,
      notificationsReceived
    ] = await Promise.all([
      TaskModel.countDocuments({ userId, createdAt: { $gte: startDate, $lte: endDate } }),
      TaskModel.countDocuments({ userId, completed: true, updatedAt: { $gte: startDate, $lte: endDate } }),
      StudySessionModel.countDocuments({ userId, endTime: { $gte: startDate, $lte: endDate } }),
      StudySessionModel.aggregate([
        { $match: { userId, endTime: { $gte: startDate, $lte: endDate } } },
        { $group: { _id: null, totalTime: { $sum: '$duration' } } }
      ]),
      FlashcardModel.countDocuments({ userId, lastReviewed: { $gte: startDate, $lte: endDate } }),
      NotificationModel.countDocuments({ userId, createdAt: { $gte: startDate, $lte: endDate } })
    ]);

    const totalStudyTimeHours = totalStudyTime[0]?.totalTime ? totalStudyTime[0].totalTime / 3600 : 0;

    return {
      period,
      startDate,
      endDate,
      tasks: {
        created: tasksCreated,
        completed: tasksCompleted,
        completionRate: tasksCreated > 0 ? (tasksCompleted / tasksCreated) * 100 : 0
      },
      study: {
        sessions: studySessions,
        totalTimeHours: Math.round(totalStudyTimeHours * 100) / 100,
        averageSessionTime: studySessions > 0 ? Math.round((totalStudyTimeHours / studySessions) * 100) / 100 : 0
      },
      flashcards: {
        reviewed: flashcardsReviewed
      },
      notifications: {
        received: notificationsReceived
      }
    };
  }

  // Relatório de progresso ao longo do tempo
  static async getProgressReport(userId: string, days: number = 30) {
    const endDate = new Date();
    const startDate = subDays(endDate, days);

    const dailyData = await StudySessionModel.aggregate([
      { $match: { userId, endTime: { $gte: startDate, $lte: endDate } } },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$endTime' }
          },
          studyTime: { $sum: '$duration' },
          sessions: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const taskData = await TaskModel.aggregate([
      { $match: { userId, updatedAt: { $gte: startDate, $lte: endDate } } },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$updatedAt' }
          },
          completed: {
            $sum: { $cond: ['$completed', 1, 0] }
          },
          created: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    return {
      period: `${days} days`,
      studyData: dailyData,
      taskData: taskData
    };
  }

  // Relatório de performance em flashcards
  static async getFlashcardReport(userId: string) {
    const [total, active, readyForReview, byDifficulty, byCategory, reviewStats] = await Promise.all([
      FlashcardModel.countDocuments({ userId }),
      FlashcardModel.countDocuments({ userId, isActive: true }),
      FlashcardModel.countDocuments({
        userId,
        $or: [
          { nextReview: { $exists: false } },
          { nextReview: { $lte: new Date() } }
        ]
      }),
      FlashcardModel.aggregate([
        { $match: { userId } },
        { $group: { _id: '$difficulty', count: { $sum: 1 } } }
      ]),
      FlashcardModel.aggregate([
        { $match: { userId } },
        { $group: { _id: '$category', count: { $sum: 1 } } }
      ]),
      FlashcardModel.aggregate([
        { $match: { userId } },
        {
          $group: {
            _id: null,
            totalReviews: { $sum: '$reviewCount' },
            avgReviews: { $avg: '$reviewCount' },
            maxReviews: { $max: '$reviewCount' }
          }
        }
      ])
    ]);

    return {
      total,
      active,
      readyForReview,
      byDifficulty: byDifficulty.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {} as Record<string, number>),
      byCategory: byCategory.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {} as Record<string, number>),
      reviewStats: reviewStats[0] || { totalReviews: 0, avgReviews: 0, maxReviews: 0 }
    };
  }

  // Relatório de materiais de estudo
  static async getStudyMaterialReport(userId: string) {
    const [total, publicCount, totalSize, byCategory, byMimeType, downloadStats] = await Promise.all([
      StudyMaterialModel.countDocuments({ userId }),
      StudyMaterialModel.countDocuments({ userId, isPublic: true }),
      StudyMaterialModel.aggregate([
        { $match: { userId } },
        { $group: { _id: null, totalSize: { $sum: '$fileSize' } } }
      ]),
      StudyMaterialModel.aggregate([
        { $match: { userId } },
        { $group: { _id: '$category', count: { $sum: 1 } } }
      ]),
      StudyMaterialModel.aggregate([
        { $match: { userId } },
        { $group: { _id: '$mimeType', count: { $sum: 1 } } }
      ]),
      StudyMaterialModel.aggregate([
        { $match: { userId } },
        {
          $group: {
            _id: null,
            totalDownloads: { $sum: '$downloadCount' },
            avgDownloads: { $avg: '$downloadCount' },
            maxDownloads: { $max: '$downloadCount' }
          }
        }
      ])
    ]);

    return {
      total,
      publicCount,
      totalSizeMB: Math.round((totalSize[0]?.totalSize || 0) / (1024 * 1024) * 100) / 100,
      byCategory: byCategory.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {} as Record<string, number>),
      byMimeType: byMimeType.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {} as Record<string, number>),
      downloadStats: downloadStats[0] || { totalDownloads: 0, avgDownloads: 0, maxDownloads: 0 }
    };
  }

  // Relatório de notificações
  static async getNotificationReport(userId: string) {
    const [total, unread, byType, recentActivity] = await Promise.all([
      NotificationModel.countDocuments({ userId }),
      NotificationModel.countDocuments({ userId, isRead: false }),
      NotificationModel.aggregate([
        { $match: { userId } },
        { $group: { _id: '$type', count: { $sum: 1 } } }
      ]),
      NotificationModel.find({ userId })
        .sort({ createdAt: -1 })
        .limit(10)
        .lean()
    ]);

    return {
      total,
      unread,
      byType: byType.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {} as Record<string, number>),
      recentActivity
    };
  }

  // Relatório comparativo (semana atual vs semana anterior)
  static async getComparativeReport(userId: string) {
    const now = new Date();
    const currentWeekStart = startOfWeek(now, { weekStartsOn: 1 });
    const currentWeekEnd = endOfWeek(now, { weekStartsOn: 1 });
    const lastWeekStart = subWeeks(currentWeekStart, 1);
    const lastWeekEnd = subWeeks(currentWeekEnd, 1);

    const [currentWeek, lastWeek] = await Promise.all([
      this.getUserReport(userId, 'week'),
      this.getUserReportForPeriod(userId, lastWeekStart, lastWeekEnd)
    ]);

    return {
      currentWeek,
      lastWeek,
      comparison: {
        studyTimeChange: this.calculatePercentageChange(
          currentWeek.study.totalTimeHours,
          lastWeek.study.totalTimeHours
        ),
        taskCompletionChange: this.calculatePercentageChange(
          currentWeek.tasks.completionRate,
          lastWeek.tasks.completionRate
        ),
        sessionsChange: this.calculatePercentageChange(
          currentWeek.study.sessions,
          lastWeek.study.sessions
        )
      }
    };
  }

  // Método auxiliar para calcular mudança percentual
  private static calculatePercentageChange(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  }

  // Método auxiliar para relatório de período específico
  private static async getUserReportForPeriod(userId: string, startDate: Date, endDate: Date) {
    const [
      tasksCreated,
      tasksCompleted,
      studySessions,
      totalStudyTime
    ] = await Promise.all([
      TaskModel.countDocuments({ userId, createdAt: { $gte: startDate, $lte: endDate } }),
      TaskModel.countDocuments({ userId, completed: true, updatedAt: { $gte: startDate, $lte: endDate } }),
      StudySessionModel.countDocuments({ userId, endTime: { $gte: startDate, $lte: endDate } }),
      StudySessionModel.aggregate([
        { $match: { userId, endTime: { $gte: startDate, $lte: endDate } } },
        { $group: { _id: null, totalTime: { $sum: '$duration' } } }
      ])
    ]);

    const totalStudyTimeHours = totalStudyTime[0]?.totalTime ? totalStudyTime[0].totalTime / 3600 : 0;

    return {
      tasks: {
        created: tasksCreated,
        completed: tasksCompleted,
        completionRate: tasksCreated > 0 ? (tasksCompleted / tasksCreated) * 100 : 0
      },
      study: {
        sessions: studySessions,
        totalTimeHours: Math.round(totalStudyTimeHours * 100) / 100,
        averageSessionTime: studySessions > 0 ? Math.round((totalStudyTimeHours / studySessions) * 100) / 100 : 0
      }
    };
  }
} 