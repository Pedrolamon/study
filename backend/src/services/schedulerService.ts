import cron from 'node-cron';
import { NotificationService } from './notificationService';
import { GamificationService } from './gamificationService';
import { TaskModel } from '../models/Task';
import { StudySessionModel } from '../models/StudySession';
import { NotificationModel } from '../models/Notification';
import { UserModel } from '../models/User';

export class SchedulerService {
  private static isInitialized = false;

  // Inicializar todos os agendamentos
  static initializeSchedulers() {
    if (this.isInitialized) {
      console.log('Schedulers já foram inicializados');
      return;
    }

    console.log('🚀 Inicializando agendadores...');

    // Processar notificações agendadas a cada 5 minutos
    this.scheduleNotificationProcessing();

    // Verificar tarefas em atraso diariamente às 9h
    this.scheduleOverdueTaskCheck();

    // Verificar sessões de estudo ativas a cada hora
    this.scheduleActiveSessionCheck();

    // Verificar pontos de sequência diariamente
    this.scheduleStreakCheck();

    // Limpeza de dados antigos semanalmente
    this.scheduleDataCleanup();

    this.isInitialized = true;
    console.log('✅ Agendadores inicializados com sucesso');
  }

  // Agendar processamento de notificações
  private static scheduleNotificationProcessing() {
    // Executar a cada 5 minutos
    cron.schedule('*/5 * * * *', async () => {
      try {
        console.log('📧 Processando notificações agendadas...');
        await NotificationService.processScheduledNotifications();
      } catch (error) {
        console.error('❌ Erro ao processar notificações agendadas:', error);
      }
    });
  }

  // Agendar verificação de tarefas em atraso
  private static scheduleOverdueTaskCheck() {
    // Executar diariamente às 9h
    cron.schedule('0 9 * * *', async () => {
      try {
        console.log('⏰ Verificando tarefas em atraso...');
        await this.checkOverdueTasks();
      } catch (error) {
        console.error('❌ Erro ao verificar tarefas em atraso:', error);
      }
    });
  }

  // Agendar verificação de sessões ativas
  private static scheduleActiveSessionCheck() {
    // Executar a cada hora
    cron.schedule('0 * * * *', async () => {
      try {
        console.log('⏱️ Verificando sessões de estudo ativas...');
        await this.checkActiveSessions();
      } catch (error) {
        console.error('❌ Erro ao verificar sessões ativas:', error);
      }
    });
  }

  // Agendar verificação de pontos de sequência
  private static scheduleStreakCheck() {
    // Executar diariamente às 8h
    cron.schedule('0 8 * * *', async () => {
      try {
        console.log('🔥 Verificando pontos de sequência...');
        await this.checkStreakPoints();
      } catch (error) {
        console.error('❌ Erro ao verificar pontos de sequência:', error);
      }
    });
  }

  // Agendar limpeza de dados antigos
  private static scheduleDataCleanup() {
    // Executar semanalmente no domingo às 2h
    cron.schedule('0 2 * * 0', async () => {
      try {
        console.log('🧹 Executando limpeza de dados antigos...');
        await this.cleanupOldData();
      } catch (error) {
        console.error('❌ Erro ao limpar dados antigos:', error);
      }
    });
  }

  // Verificar tarefas em atraso
  private static async checkOverdueTasks() {
    try {
      const overdueTasks = await TaskModel.find({
        completed: false,
        dueDate: { $lt: new Date() }
      }).populate('userId', 'email name');

      for (const task of overdueTasks) {
        // Criar notificação para tarefa em atraso
        await NotificationService.createTaskNotification(
          task.userId.toString(),
          task.title,
          'overdue'
        );

        // Enviar email se configurado
        if (process.env.NOTIFICATION_EMAIL_ENABLED === 'true') {
          await NotificationService.sendEmailNotification(
            task.userId.toString(),
            'Tarefa em Atraso',
            `A tarefa "${task.title}" está em atraso desde ${task.dueDate.toLocaleDateString()}.`
          );
        }
      }

      console.log(`📋 ${overdueTasks.length} tarefas em atraso processadas`);
    } catch (error) {
      console.error('Erro ao verificar tarefas em atraso:', error);
    }
  }

  // Verificar sessões de estudo ativas
  private static async checkActiveSessions() {
    try {
      const activeSessions = await StudySessionModel.find({
        isActive: true,
        startTime: { $lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Sessões com mais de 24h
      }).populate('userId', 'email name');

      for (const session of activeSessions) {
        // Finalizar sessões muito antigas
        session.isActive = false;
        session.endTime = new Date();
        session.duration = Math.floor((session.endTime.getTime() - session.startTime.getTime()) / 1000);
        await session.save();

        // Criar notificação
        await NotificationService.createStudyNotification(
          session.userId.toString(),
          session.duration,
          session.subject
        );
      }

      console.log(`⏱️ ${activeSessions.length} sessões antigas finalizadas`);
    } catch (error) {
      console.error('Erro ao verificar sessões ativas:', error);
    }
  }

  // Verificar pontos de sequência
  private static async checkStreakPoints() {
    try {
      const users = await UserModel.find({ studyStreak: { $gt: 0 } });
      
      for (const user of users) {
        await GamificationService.checkStreakPoints(user._id.toString());
      }
      
      console.log(`🔥 Verificação de sequência concluída para ${users.length} usuários`);
    } catch (error) {
      console.error('❌ Erro ao verificar pontos de sequência:', error);
    }
  }

  // Limpeza de dados antigos
  private static async cleanupOldData() {
    try {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const sixMonthsAgo = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000);

      // Limpar notificações antigas (mais de 30 dias)
      const deletedNotifications = await NotificationModel.deleteMany({
        createdAt: { $lt: thirtyDaysAgo },
        isRead: true
      });

      // Limpar sessões de estudo antigas (mais de 6 meses)
      const deletedSessions = await StudySessionModel.deleteMany({
        endTime: { $lt: sixMonthsAgo }
      });

      console.log(`🧹 Limpeza concluída: ${deletedNotifications.deletedCount} notificações, ${deletedSessions.deletedCount} sessões`);
    } catch (error) {
      console.error('Erro ao limpar dados antigos:', error);
    }
  }

  // Agendar notificação personalizada
  static async scheduleCustomNotification(
    userId: string,
    title: string,
    message: string,
    type: 'task' | 'study' | 'exam' | 'reminder' | 'achievement' | 'system',
    scheduledFor: Date
  ) {
    try {
      await NotificationService.createScheduledNotification(
        userId,
        title,
        message,
        type,
        scheduledFor
      );
      console.log(`📅 Notificação agendada para ${scheduledFor}`);
    } catch (error) {
      console.error('Erro ao agendar notificação:', error);
      throw error;
    }
  }

  // Agendar lembretes de tarefas
  static async scheduleTaskReminders(userId: string, taskId: string, taskTitle: string, dueDate: Date) {
    try {
      // Lembrete 1 dia antes
      const oneDayBefore = new Date(dueDate.getTime() - 24 * 60 * 60 * 1000);
      if (oneDayBefore > new Date()) {
        await this.scheduleCustomNotification(
          userId,
          'Lembrete de Tarefa',
          `A tarefa "${taskTitle}" vence amanhã.`,
          'task',
          oneDayBefore
        );
      }

      // Lembrete 1 hora antes
      const oneHourBefore = new Date(dueDate.getTime() - 60 * 60 * 1000);
      if (oneHourBefore > new Date()) {
        await this.scheduleCustomNotification(
          userId,
          'Tarefa Vencendo',
          `A tarefa "${taskTitle}" vence em 1 hora.`,
          'task',
          oneHourBefore
        );
      }
    } catch (error) {
      console.error('Erro ao agendar lembretes de tarefa:', error);
    }
  }

  // Parar todos os agendamentos
  static stopAllSchedulers() {
    console.log('🛑 Parando todos os agendadores...');
    cron.getTasks().forEach(task => task.stop());
    this.isInitialized = false;
    console.log('✅ Agendadores parados');
  }
} 