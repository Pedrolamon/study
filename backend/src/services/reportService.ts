import { prisma } from '../models';
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subDays } from 'date-fns';

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
      prisma.task.count({
        where: {
          userId,
          createdAt: { gte: startDate, lte: endDate }
        }
      }),
      prisma.task.count({
        where: {
          userId,
          completed: true,
          updatedAt: { gte: startDate, lte: endDate }
        }
      }),
      prisma.studySession.count({
        where: {
          userId,
          endTime: { gte: startDate, lte: endDate }
        }
      }),
      prisma.studySession.aggregate({
        where: {
          userId,
          endTime: { gte: startDate, lte: endDate }
        },
        _sum: { duration: true }
      }),
      prisma.flashcard.count({
        where: {
          userId,
          lastReviewed: { gte: startDate, lte: endDate }
        }
      }),
      prisma.notification.count({
        where: {
          userId,
          createdAt: { gte: startDate, lte: endDate }
        }
      })
    ]);

    const totalStudyTimeHours = totalStudyTime._sum.duration ? totalStudyTime._sum.duration / 60 : 0;

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

    const dailyData = [];
    
    for (let i = 0; i < days; i++) {
      const date = subDays(endDate, i);
      const dayStart = startOfDay(date);
      const dayEnd = endOfDay(date);

      const [tasksCompleted, studyTime, flashcardsReviewed] = await Promise.all([
        prisma.task.count({
          where: {
            userId,
            completed: true,
            updatedAt: { gte: dayStart, lte: dayEnd }
          }
        }),
        prisma.studySession.aggregate({
          where: {
            userId,
            endTime: { gte: dayStart, lte: dayEnd }
          },
          _sum: { duration: true }
        }),
        prisma.flashcard.count({
          where: {
            userId,
            lastReviewed: { gte: dayStart, lte: dayEnd }
          }
        })
      ]);

      dailyData.push({
        date: dayStart,
        tasksCompleted,
        studyTimeMinutes: studyTime._sum.duration || 0,
        flashcardsReviewed
      });
    }

    return {
      period: `${days} days`,
      startDate,
      endDate,
      dailyData: dailyData.reverse()
    };
  }

  // Assuming 'prisma' is imported from '../models'
// This replaces your original MongoDB/Mongoose function.
static async getFlashcardReport(userId: string) {
  const now = new Date();

  const [total, active, readyForReview, byDifficulty, byCategory, reviewStats] = await Promise.all([
      // 1. Total Count
      prisma.flashcard.count({ where: { userId } }),
      
      // 2. Active Count
      prisma.flashcard.count({ where: { userId, isActive: true } }),
      
      // 3. Ready For Review (nextReview is null OR nextReview <= now)
      prisma.flashcard.count({
          where: {
              userId,
              OR: [
                  { nextReview: null }, // Equivalent to $exists: false
                  { nextReview: { lte: now } }
              ]
          }
      }),

      // 4. Group by Difficulty (using groupBy)
      prisma.flashcard.groupBy({
          by: ['difficulty'],
          _count: { difficulty: true },
          where: { userId }
      }),

      // 5. Group by Category (using groupBy)
      prisma.flashcard.groupBy({
          by: ['category'],
          _count: { category: true },
          where: { userId }
      }),

      // 6. Review Stats (using aggregate)
      prisma.flashcard.aggregate({
          _sum: { reviewCount: true },
          _avg: { reviewCount: true },
          _max: { reviewCount: true },
          where: { userId }
      })
  ]);

  // Format the output to match the original structure
  const formattedByDifficulty = byDifficulty.map(d => ({ difficulty: d.difficulty, count: d._count.difficulty }));
  const formattedByCategory = byCategory.map(c => ({ category: c.category, count: c._count.category }));

  return {
      total,
      active,
      readyForReview,
      byDifficulty: formattedByDifficulty,
      byCategory: formattedByCategory,
      reviewStats: {
          totalReviews: reviewStats._sum.reviewCount || 0,
          avgReviews: reviewStats._avg.reviewCount || 0,
          maxReviews: reviewStats._max.reviewCount || 0,
      }
  };
}

  // Relatório de performance por matéria
  static async getSubjectPerformanceReport(userId: string, period: 'week' | 'month' | 'year' = 'month') {
    const now = new Date();
    let startDate: Date;
    let endDate: Date;

    switch (period) {
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
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
    }

    // Get study sessions by subject
    const studySessions = await prisma.studySession.findMany({
      where: {
        userId,
        endTime: { gte: startDate, lte: endDate }
      },
      select: {
        subject: true,
        duration: true
      }
    });

    // Get flashcards by category
    const flashcards = await prisma.flashcard.findMany({
      where: {
        userId,
        lastReviewed: { gte: startDate, lte: endDate }
      },
      select: {
        category: true
      }
    });

    // Group by subject/category
    const subjectStats: { [key: string]: { studyTime: number; flashcardsReviewed: number } } = {};

    studySessions.forEach(session => {
      const subject = session.subject || 'Outros';
      if (!subjectStats[subject]) {
        subjectStats[subject] = { studyTime: 0, flashcardsReviewed: 0 };
      }
      subjectStats[subject].studyTime += session.duration || 0;
    });

    flashcards.forEach(flashcard => {
      const category = flashcard.category || 'Outros';
      if (!subjectStats[category]) {
        subjectStats[category] = { studyTime: 0, flashcardsReviewed: 0 };
      }
      subjectStats[category].flashcardsReviewed += 1;
    });

    return {
      period,
      startDate,
      endDate,
      subjects: Object.entries(subjectStats).map(([subject, stats]) => ({
        subject,
        studyTimeMinutes: stats.studyTime,
        studyTimeHours: Math.round((stats.studyTime / 60) * 100) / 100,
        flashcardsReviewed: stats.flashcardsReviewed
      }))
    };
  }

  // Relatório de produtividade
  static async getProductivityReport(userId: string, days: number = 7) {
    const endDate = new Date();
    const startDate = subDays(endDate, days);

    const [tasks, studySessions, flashcards] = await Promise.all([
      prisma.task.findMany({
        where: {
          userId,
          createdAt: { gte: startDate, lte: endDate }
        },
        select: {
          completed: true,
          completedOnTime: true,
          createdAt: true,
          updatedAt: true
        }
      }),
      prisma.studySession.findMany({
        where: {
          userId,
          endTime: { gte: startDate, lte: endDate }
        },
        select: {
          duration: true,
          endTime: true
        }
      }),
      prisma.flashcard.findMany({
        where: {
          userId,
          lastReviewed: { gte: startDate, lte: endDate }
        },
        select: {
          lastReviewed: true
        }
      })
    ]);

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.completed).length;
    const onTimeTasks = tasks.filter(t => t.completed && t.completedOnTime).length;
    const totalStudyTime = studySessions.reduce((sum, session) => sum + (session.duration || 0), 0);
    const totalFlashcards = flashcards.length;

    return {
      period: `${days} days`,
      startDate,
      endDate,
      productivity: {
        taskCompletionRate: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
        onTimeCompletionRate: completedTasks > 0 ? (onTimeTasks / completedTasks) * 100 : 0,
        averageStudyTimePerDay: Math.round((totalStudyTime / days) * 100) / 100,
        flashcardsPerDay: Math.round((totalFlashcards / days) * 100) / 100
      },
      totals: {
        tasksCreated: totalTasks,
        tasksCompleted: completedTasks,
        tasksOnTime: onTimeTasks,
        studyTimeMinutes: totalStudyTime,
        studyTimeHours: Math.round((totalStudyTime / 60) * 100) / 100,
        flashcardsReviewed: totalFlashcards
      }
    };
  }
}