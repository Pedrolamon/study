import * as nodemailer from 'nodemailer';
import prisma from '../lib/prisma';

interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'TASK' | 'STUDY' | 'EXAM' | 'REMINDER' | 'ACHIEVEMENT' | 'SYSTEM';
  isRead: boolean;
  isEmailSent: boolean;
  scheduledFor?: Date;
  sentAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Email configuration
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

export class NotificationService {
  static async createNotification(notificationData: Omit<Notification, 'id' | 'createdAt' | 'updatedAt'>): Promise<Notification> {
    const notification = await prisma.notification.create({
      data: notificationData
    });
    return notification as Notification;
  }

  // Create scheduled notification
  static async createScheduledNotification(
    userId: string,
    title: string,
    message: string,
    type: Notification['type'],
    scheduledFor: Date
  ): Promise<Notification> {
    return await this.createNotification({
      userId,
      title,
      message,
      type,
      isRead: false,
      isEmailSent: false,
      scheduledFor
    });
  }

  // Get user notifications
  static async getUserNotifications(userId: string, limit: number = 20, offset: number = 0, isRead?: boolean ) {
    const whereCondition: any = { userId };
    if (isRead !== undefined) {
      whereCondition.isRead = isRead;
    }
    return await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset
    });
  }

  // Get unread notifications
  static async getUnreadNotifications(userId: string) {
    return await prisma.notification.findMany({
      where: {
        userId,
        isRead: false
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  // Mark notification as read
  static async markAsRead(notificationId: string, userId: string): Promise<boolean> {
    const result = await prisma.notification.updateMany({
      where: {
        id: notificationId,
        userId
      },
      data: {
        isRead: true
      }
    });

    return result.count > 0;
  }

  // Mark all notifications as read
  static async markAllAsRead(userId: string): Promise<number> {
    const result = await prisma.notification.updateMany({
      where: {
        userId,
        isRead: false
      },
      data: {
        isRead: true
      }
    });

    return result.count;
  }

  // Delete notification
  static async deleteNotification(notificationId: string, userId: string): Promise<boolean> {
    const result = await prisma.notification.deleteMany({
      where: {
        id: notificationId,
        userId
      }
    });

    return result.count > 0;
  }

  // Send email notification
  static async sendEmailNotification(
    userId: string,
    title: string,
    message: string,
    email: string
  ): Promise<boolean> {
    try {
      const transporter = createTransporter();

      const mailOptions = {
        from: process.env.SMTP_USER, 
        to: email, 
        subject: title, 
        text: message, 
        html: `<p>${message}</p>` 
      };
  
      // 3. Enviar o e-mail
      await transporter.sendMail(mailOptions); 
  
      console.log(`Email enviado para ${email} com sucesso!`);

      // Mark notification as email sent
      await prisma.notification.updateMany({
        where: {
          userId,
          title,
          message
        },
        data: {
          isEmailSent: true,
          sentAt: new Date()
        }
      });

      return true;
    } catch (error) {
      console.error('Error sending email notification:', error);
      return false;
    }
  }

  // Process scheduled notifications
  static async processScheduledNotifications(): Promise<void> {
    const now = new Date();
    
    const scheduledNotifications = await prisma.notification.findMany({
      where: {
        scheduledFor: { lte: now },
        isEmailSent: false
      },
      include: {
        user: {
          select: {
            email: true
          }
        }
      }
    });

    for (const notification of scheduledNotifications) {
      // Send email if user has email
      if (notification.user?.email) {
        await this.sendEmailNotification(
          notification.userId,
          notification.title,
          notification.message,
          notification.user.email
        );
      }

      // Mark as sent
      await prisma.notification.update({
        where: { id: notification.id },
        data: {
          isEmailSent: true,
          sentAt: new Date()
        }
      });
    }
  }

  // Create task reminder
  static async createTaskReminder(
    userId: string,
    taskTitle: string,
    dueDate: string,
    reminderTime: string
  ): Promise<void> {
    const reminderDate = new Date(`${dueDate}T${reminderTime}`);
    
    await this.createScheduledNotification(
      userId,
      'Lembrete de Tarefa',
      `Sua tarefa "${taskTitle}" vence em breve!`,
      'TASK',
      reminderDate
    );
  }

  // Create study session reminder
  static async createStudyReminder(
    userId: string,
    subject: string,
    scheduledTime: Date
  ): Promise<void> {
    await this.createScheduledNotification(
      userId,
      'Hora de Estudar!',
      `É hora da sua sessão de estudo de ${subject}`,
      'STUDY',
      scheduledTime
    );
  }

  // Create exam reminder
  static async createExamReminder(
    userId: string,
    examName: string,
    examDate: Date
  ): Promise<void> {
    await this.createScheduledNotification(
      userId,
      'Lembrete de Exame',
      `Seu exame "${examName}" está chegando!`,
      'EXAM',
      examDate
    );
  }

  // Get notification statistics
  static async getNotificationStats(userId: string) {
    const [total, unread, byType] = await Promise.all([
      prisma.notification.count({ where: { userId } }),
      prisma.notification.count({ where: { userId, isRead: false } }),
      prisma.notification.groupBy({
                by: ['type'],
                where: { userId },
                _count: { type: true }
              })
            ]);

    return {
      total,
      unread,
      read: total - unread,
      byType: byType.reduce((acc, item) => {
        acc[item.type] = item._count.type;
        return acc;
      }, {} as Record<string, number>)
    };
  }
}