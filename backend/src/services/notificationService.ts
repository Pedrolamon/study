import { NotificationModel } from '../models/Notification';
import { UserModel } from '../models/User';
import nodemailer from 'nodemailer';
import type { Notification } from '../types';

// Configuração do transporter de email
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false, // true para 465, false para outras portas
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

export class NotificationService {
  // Criar notificação
  static async createNotification(notificationData: Omit<Notification, '_id' | 'createdAt' | 'updatedAt'>): Promise<Notification> {
    const notification = new NotificationModel(notificationData);
    return await notification.save();
  }

  // Criar notificação agendada
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

  // Buscar notificações do usuário
  static async getUserNotifications(
    userId: string,
    page: number = 1,
    limit: number = 20,
    isRead?: boolean
  ) {
    const skip = (page - 1) * limit;
    const query: any = { userId };
    
    if (isRead !== undefined) {
      query.isRead = isRead;
    }

    const [notifications, total] = await Promise.all([
      NotificationModel.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      NotificationModel.countDocuments(query)
    ]);

    return {
      notifications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  // Marcar notificação como lida
  static async markAsRead(notificationId: string, userId: string): Promise<void> {
    await NotificationModel.findOneAndUpdate(
      { _id: notificationId, userId },
      { isRead: true }
    );
  }

  // Marcar todas as notificações como lidas
  static async markAllAsRead(userId: string): Promise<void> {
    await NotificationModel.updateMany(
      { userId, isRead: false },
      { isRead: true }
    );
  }

  // Deletar notificação
  static async deleteNotification(notificationId: string, userId: string): Promise<void> {
    await NotificationModel.findOneAndDelete({ _id: notificationId, userId });
  }

  // Enviar notificação por email
  static async sendEmailNotification(
    userId: string,
    title: string,
    message: string
  ): Promise<boolean> {
    try {
      const user = await UserModel.findById(userId);
      if (!user || !user.email) {
        return false;
      }

      const transporter = createTransporter();
      
      const mailOptions = {
        from: process.env.SMTP_USER,
        to: user.email,
        subject: `Study App - ${title}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Study App</h2>
            <h3>${title}</h3>
            <p>${message}</p>
            <hr>
            <p style="color: #666; font-size: 12px;">
              Esta é uma notificação automática do Study App.
            </p>
          </div>
        `
      };

      await transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('Erro ao enviar email:', error);
      return false;
    }
  }

  // Processar notificações agendadas
  static async processScheduledNotifications(): Promise<void> {
    try {
      const now = new Date();
      const scheduledNotifications = await NotificationModel.find({
        scheduledFor: { $lte: now },
        isEmailSent: false
      });

      for (const notification of scheduledNotifications) {
        // Enviar email
        const emailSent = await this.sendEmailNotification(
          notification.userId.toString(),
          notification.title,
          notification.message
        );

        if (emailSent) {
          await notification.markAsEmailSent();
        }
      }
    } catch (error) {
      console.error('Erro ao processar notificações agendadas:', error);
    }
  }

  // Criar notificação de tarefa
  static async createTaskNotification(
    userId: string,
    taskTitle: string,
    action: 'created' | 'completed' | 'overdue'
  ): Promise<void> {
    const messages = {
      created: `Nova tarefa criada: ${taskTitle}`,
      completed: `Tarefa concluída: ${taskTitle}`,
      overdue: `Tarefa em atraso: ${taskTitle}`
    };

    await this.createNotification({
      userId,
      title: 'Tarefa',
      message: messages[action],
      type: 'task',
      isRead: false,
      isEmailSent: false
    });
  }

  // Criar notificação de sessão de estudo
  static async createStudyNotification(
    userId: string,
    duration: number,
    subject?: string
  ): Promise<void> {
    const hours = Math.floor(duration / 3600);
    const minutes = Math.floor((duration % 3600) / 60);
    const timeStr = hours > 0 ? `${hours}h ${minutes}min` : `${minutes}min`;

    await this.createNotification({
      userId,
      title: 'Sessão de Estudo',
      message: `Sessão concluída: ${timeStr}${subject ? ` - ${subject}` : ''}`,
      type: 'study',
      isRead: false,
      isEmailSent: false
    });
  }

  // Criar notificação de conquista
  static async createAchievementNotification(
    userId: string,
    achievement: string
  ): Promise<void> {
    await this.createNotification({
      userId,
      title: 'Conquista Desbloqueada! 🎉',
      message: achievement,
      type: 'achievement',
      isRead: false,
      isEmailSent: false
    });
  }

  // Obter estatísticas de notificações
  static async getNotificationStats(userId: string) {
    const [total, unread, byType] = await Promise.all([
      NotificationModel.countDocuments({ userId }),
      NotificationModel.countDocuments({ userId, isRead: false }),
      NotificationModel.aggregate([
        { $match: { userId: userId } },
        { $group: { _id: '$type', count: { $sum: 1 } } }
      ])
    ]);

    return {
      total,
      unread,
      byType: byType.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {} as Record<string, number>)
    };
  }
} 