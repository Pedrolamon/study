import { Request, Response } from 'express';
import { NotificationService } from '../services/notificationService';
import { ApiResponse } from '../types';

export const getNotifications = async (req: Request, res: Response<ApiResponse>) => {
  
  try {
    const userId = req.user!.id;

    const {page: pageQuery, limit: limitQuery, isRead: isReadQuery } = req.query as { 
      page?: string, 
      limit?: string, 
      isRead?: string 
  };

    const page = parseInt(pageQuery as string) || 1;
    const limit = parseInt(limitQuery as string) || 20;
    const isRead = isReadQuery !== undefined ? isReadQuery === 'true' : undefined;

    const result = await NotificationService.getUserNotifications(userId, page, limit, isRead);

    res.json({
      success: true,
      data: result,
      message: 'Notificações recuperadas com sucesso'
    });
  } catch (error) {
    console.error('Erro ao buscar notificações:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

export const markAsRead = async (req: Request, res: Response<ApiResponse>) => {
  try {
    const userId = req.user!.id;
    const { notificationId } = req.params;

    await NotificationService.markAsRead(notificationId, userId);

    res.json({
      success: true,
      message: 'Notificação marcada como lida'
    });
  } catch (error) {
    console.error('Erro ao marcar notificação como lida:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

export const markAllAsRead = async (req: Request, res: Response<ApiResponse>) => {
  try {
    const userId = req.user!.id;

    await NotificationService.markAllAsRead(userId);

    res.json({
      success: true,
      message: 'Todas as notificações foram marcadas como lidas'
    });
  } catch (error) {
    console.error('Erro ao marcar todas as notificações como lidas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

export const deleteNotification = async (req: Request, res: Response<ApiResponse>) => {
  try {
    const userId = req.user!.id;
    const { notificationId } = req.params;

    await NotificationService.deleteNotification(notificationId, userId);

    res.json({
      success: true,
      message: 'Notificação deletada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao deletar notificação:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

export const getNotificationStats = async (req: Request, res: Response<ApiResponse>) => {
  try {
    const userId = req.user!.id;

    const stats = await NotificationService.getNotificationStats(userId);

    res.json({
      success: true,
      data: stats,
      message: 'Estatísticas de notificações recuperadas'
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas de notificações:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

export const createScheduledNotification = async (req: Request, res: Response<ApiResponse>) => {
  try {
    const userId = req.user!.id;
    const { title, message, type, scheduledFor } = req.body;

    if (!title || !message || !type || !scheduledFor) {
      return res.status(400).json({
        success: false,
        message: 'Todos os campos são obrigatórios'
      });
    }

    const scheduledDate = new Date(scheduledFor);
    if (isNaN(scheduledDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Data de agendamento inválida'
      });
    }

    const notification = await NotificationService.createScheduledNotification(
      userId,
      title,
      message,
      type,
      scheduledDate
    );

    res.status(201).json({
      success: true,
      data: notification,
      message: 'Notificação agendada criada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao criar notificação agendada:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
}; 