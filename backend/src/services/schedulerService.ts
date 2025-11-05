import cron from 'node-cron';
import { NotificationService } from './notificationService';
import { GamificationService } from './gamificationService';
import { prisma } from '../models';

export class SchedulerService {
  private static isInitialized = false;

  // Initialize all schedulers
  static initializeSchedulers() {
    if (this.isInitialized) {
      console.log('Schedulers already initialized');
      return;
    }

    console.log('🚀 Initializing schedulers...');

    // Process scheduled notifications every 5 minutes
    this.scheduleNotificationProcessing();

    // Check overdue tasks daily at 9 AM
    this.scheduleOverdueTaskCheck();

    // Check active study sessions every hour
    this.scheduleActiveSessionCheck();

    // Check streak points daily
    this.scheduleStreakCheck();

    // Data cleanup weekly
    this.scheduleDataCleanup();

    this.isInitialized = true;
    console.log('✅ Schedulers initialized successfully');
  }

  // Schedule notification processing
  private static scheduleNotificationProcessing() {
    // Run every 5 minutes
    cron.schedule('*/5 * * * *', async () => {
      try {
        await NotificationService.processScheduledNotifications();
        console.log('📧 Processed scheduled notifications');
      } catch (error) {
        console.error('Error processing scheduled notifications:', error);
      }
    });
  }

  // Schedule overdue task check
  private static scheduleOverdueTaskCheck() {
    // Run daily at 9 AM
    cron.schedule('0 9 * * *', async () => {
      try {
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0)
        
        const overdueTasks = await prisma.task.findMany({
          where: {
            completed: false,
            dueDate: { lt: startOfToday }
          },
          include: {
            user: true
          }
        });

        for (const task of overdueTasks) {
          await NotificationService.createNotification({
            userId: task.userId,
            title: 'Tarefa em Atraso',
            message: `Sua tarefa "${task.title}" está em atraso!`,
            type: 'TASK',
            isRead: false,
            isEmailSent: false
          });
        }

        console.log(`📋 Checked ${overdueTasks.length} overdue tasks`);
      } catch (error) {
        console.error('Error checking overdue tasks:', error);
      }
    });
  }

  // Schedule active session check
  private static scheduleActiveSessionCheck() {
    // Run every hour
    cron.schedule('0 * * * *', async () => {
      try {
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        
        const longSessions = await prisma.studySession.findMany({
          where: {
            isActive: true,
            startTime: { lte: oneHourAgo }
          },
          include: {
            user: true
          }
        });

        for (const session of longSessions) {
          await NotificationService.createNotification({
            userId: session.userId,
            title: 'Sessão Longa Detectada',
            message: `Você está estudando há mais de 1 hora. Que tal uma pausa?`,
            type: 'STUDY',
            isRead: false,
            isEmailSent: false
          });
        }

        console.log(`⏰ Checked ${longSessions.length} long study sessions`);
      } catch (error) {
        console.error('Error checking active sessions:', error);
      }
    });
  }

  // Schedule streak check
  private static scheduleStreakCheck() {
    // Run daily at midnight
    cron.schedule('0 0 * * *', async () => {
      try {
        const users = await prisma.user.findMany({
          where: { isActive: true }
        });

        for (const user of users) {
          // Check if user studied yesterday
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          yesterday.setHours(0, 0, 0, 0);
          
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          const studySessions = await prisma.studySession.findMany({
            where: {
              userId: user.id,
              endTime: {
                gte: yesterday,
                lt: today
              }
            }
          });

          if (studySessions.length > 0) {
            // User studied yesterday, check streak
            const userPoints = await prisma.userPoints.findUnique({
              where: { userId: user.id }
            });

            if (userPoints) {
              // Update streak logic here
              // This would need to be implemented based on your streak logic
              await GamificationService.checkStreakPoints(user.id, userPoints.level);
            }
          }
        }

        console.log('🔥 Checked study streaks for all users');
      } catch (error) {
        console.error('Error checking streaks:', error);
      }
    });
  }

  // Schedule data cleanup
  private static scheduleDataCleanup() {
    // Run weekly on Sunday at 2 AM
    cron.schedule('0 2 * * 0', async () => {
      try {
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        // Clean up old notifications
        const deletedNotifications = await prisma.notification.deleteMany({
          where: {
            createdAt: { lt: sixMonthsAgo },
            isRead: true
          }
        });

        // Clean up old study sessions
        const deletedSessions = await prisma.studySession.deleteMany({
          where: {
            endTime: { lt: sixMonthsAgo }
          }
        });

        console.log(`🧹 Cleaned up ${deletedNotifications.count} old notifications and ${deletedSessions.count} old study sessions`);
      } catch (error) {
        console.error('Error during data cleanup:', error);
      }
    });
  }

  // Manual notification processing (for testing)
  static async processNotificationsNow(): Promise<void> {
    await NotificationService.processScheduledNotifications();
  }

  // Manual overdue task check (for testing)
  static async checkOverdueTasksNow(): Promise<void> {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    
    const overdueTasks = await prisma.task.findMany({
      where: {
        completed: false,
        dueDate: { lt: startOfToday }
      }
    });

    console.log(`Found ${overdueTasks.length} overdue tasks`);
    return;
  }

  // Get scheduler status
  static getStatus() {
    return {
      initialized: this.isInitialized,
      schedulers: [
        'notification_processing',
        'overdue_task_check',
        'active_session_check',
        'streak_check',
        'data_cleanup'
      ]
    };
  }
}