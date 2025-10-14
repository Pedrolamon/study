import api from './api';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'reminder';
  read: boolean;
  createdAt: string;
  actionUrl?: string;
  actionText?: string;
}

export interface NotificationSettings {
  studyReminders: boolean;
  taskDueDates: boolean;
  examReminders: boolean;
  flashcardReviews: boolean;
  achievementAlerts: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
  reminderTime: string; // HH:mm format
}

export interface NotificationPreferences {
  userId: string;
  settings: NotificationSettings;
  pushToken?: string;
  email: string;
}

class NotificationService {
  // Buscar notificações do usuário
  async getNotifications(): Promise<Notification[]> {
    try {
      const response = await api.get('/notifications');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar notificações:', error);
      return [];
    }
  }

  // Marcar notificação como lida
  async markAsRead(notificationId: string): Promise<void> {
    try {
      await api.patch(`/notifications/${notificationId}/read`);
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
    }
  }

  // Marcar todas as notificações como lidas
  async markAllAsRead(): Promise<void> {
    try {
      await api.patch('/notifications/read-all');
    } catch (error) {
      console.error('Erro ao marcar todas as notificações como lidas:', error);
    }
  }

  // Deletar notificação
  async deleteNotification(notificationId: string): Promise<void> {
    try {
      await api.delete(`/notifications/${notificationId}`);
    } catch (error) {
      console.error('Erro ao deletar notificação:', error);
    }
  }

  // Buscar configurações de notificação
  async getNotificationSettings(): Promise<NotificationSettings> {
    try {
      const response = await api.get('/notifications/settings');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar configurações de notificação:', error);
      return {
        studyReminders: true,
        taskDueDates: true,
        examReminders: true,
        flashcardReviews: true,
        achievementAlerts: true,
        emailNotifications: false,
        pushNotifications: false,
        reminderTime: '09:00'
      };
    }
  }

  // Atualizar configurações de notificação
  async updateNotificationSettings(settings: Partial<NotificationSettings>): Promise<void> {
    try {
      await api.put('/notifications/settings', settings);
    } catch (error) {
      console.error('Erro ao atualizar configurações de notificação:', error);
    }
  }

  // Registrar token para notificações push
  async registerPushToken(token: string): Promise<void> {
    try {
      await api.post('/notifications/push-token', { token });
    } catch (error) {
      console.error('Erro ao registrar token push:', error);
    }
  }

  // Solicitar permissão para notificações push
  async requestPushPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.log('Este navegador não suporta notificações push');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      console.log('Permissão para notificações foi negada');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch (error) {
      console.error('Erro ao solicitar permissão para notificações:', error);
      return false;
    }
  }

  // Enviar notificação local
  async sendLocalNotification(title: string, options?: NotificationOptions): Promise<void> {
    if (!('Notification' in window)) {
      return;
    }

    if (Notification.permission === 'granted') {
      new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        ...options
      });
    }
  }

  // Configurar lembretes de estudo
  async scheduleStudyReminder(time: string, message: string): Promise<void> {
    try {
      await api.post('/notifications/schedule', {
        type: 'study_reminder',
        time,
        message
      });
    } catch (error) {
      console.error('Erro ao agendar lembrete de estudo:', error);
    }
  }

  // Cancelar lembretes agendados
  async cancelScheduledReminders(): Promise<void> {
    try {
      await api.delete('/notifications/scheduled');
    } catch (error) {
      console.error('Erro ao cancelar lembretes agendados:', error);
    }
  }

  // Buscar estatísticas de notificações
  async getNotificationStats(): Promise<{
    total: number;
    unread: number;
    read: number;
    byType: Record<string, number>;
  }> {
    try {
      const response = await api.get('/notifications/stats');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar estatísticas de notificações:', error);
      return {
        total: 0,
        unread: 0,
        read: 0,
        byType: {}
      };
    }
  }
}

export default new NotificationService(); 