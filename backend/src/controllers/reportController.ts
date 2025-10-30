/*import { Request, Response } from 'express';
import { ReportService } from '../services/reportService';
import { ApiResponse } from '../types';

export const getUserReport = async (req: Request, res: Response<ApiResponse>) => {
  try {
    const userId = req.user!.id;
    const period = (req.query.period as 'day' | 'week' | 'month' | 'year') || 'week';

    const report = await ReportService.getUserReport(userId, period);

    res.json({
      success: true,
      data: report,
      message: 'Relatório gerado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao gerar relatório:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

export const getProgressReport = async (req: Request, res: Response<ApiResponse>) => {
  try {
    const userId = req.user!.id;
    const days = parseInt(req.query.days as string) || 30;

    if (days < 1 || days > 365) {
      return res.status(400).json({
        success: false,
        message: 'Período deve ser entre 1 e 365 dias'
      });
    }

    const report = await ReportService.getProgressReport(userId, days);

    res.json({
      success: true,
      data: report,
      message: 'Relatório de progresso gerado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao gerar relatório de progresso:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

export const getFlashcardReport = async (req: Request, res: Response<ApiResponse>) => {
  try {
    const userId = req.user!.id;

    const report = await ReportService.getFlashcardReport(userId);

    res.json({
      success: true,
      data: report,
      message: 'Relatório de flashcards gerado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao gerar relatório de flashcards:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

export const getStudyMaterialReport = async (req: Request, res: Response<ApiResponse>) => {
  try {
    const userId = req.user!.id;

    const report = await ReportService.getStudyMaterialReport(userId);

    res.json({
      success: true,
      data: report,
      message: 'Relatório de materiais de estudo gerado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao gerar relatório de materiais:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

export const getNotificationReport = async (req: Request, res: Response<ApiResponse>) => {
  try {
    const userId = req.user!.id;

    const report = await ReportService.getNotificationReport(userId);

    res.json({
      success: true,
      data: report,
      message: 'Relatório de notificações gerado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao gerar relatório de notificações:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

export const getComparativeReport = async (req: Request, res: Response<ApiResponse>) => {
  try {
    const userId = req.user!.id;

    const report = await ReportService.getComparativeReport(userId);

    res.json({
      success: true,
      data: report,
      message: 'Relatório comparativo gerado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao gerar relatório comparativo:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

export const getDashboardData = async (req: Request, res: Response<ApiResponse>) => {
  try {
    const userId = req.user!.id;

    // Buscar dados para dashboard em paralelo
    const [userReport, flashcardReport, materialReport, notificationReport] = await Promise.all([
      ReportService.getUserReport(userId, 'week'),
      ReportService.getFlashcardReport(userId),
      ReportService.getStudyMaterialReport(userId),
      ReportService.getNotificationReport(userId)
    ]);

    const dashboardData = {
      overview: userReport,
      flashcards: flashcardReport,
      materials: materialReport,
      notifications: notificationReport
    };

    res.json({
      success: true,
      data: dashboardData,
      message: 'Dados do dashboard recuperados com sucesso'
    });
  } catch (error) {
    console.error('Erro ao buscar dados do dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
}; */