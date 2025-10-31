import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { StudySession } from '@prisma/client';

interface AuthRequest extends Request {
  user?: any;
}

interface PaginationParams{
  page?:string;
  limit?:string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  mode?: string;
  isActive?: string;
  startDate?: string;
  endDate?: string;
}

interface PaginatedResponse<T>{
  data: T[];
  pagination:{
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  }
}

export const createStudySession = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user.id;
    const { mode, subject, duration } = req.body;

    if (!userId) {
      res.status(401).json({ success: false, error: 'User not authenticated' });
      return;
    }

    const session = await prisma.studySession.create({
      data:{
      userId,
      mode,
      subject,
      startTime: new Date().toISOString(),
      duration: Number(duration),
      isActive: true
      }
    });

    res.status(201).json({
      success: true,
      data: session,
      message: 'Study session started successfully'
    });
  } catch (error: any) {
    console.error('Create study session error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err: any) => err.message);
      res.status(400).json({
        success: false,
        error: errors.join(', ')
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

export const getStudySessions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user.id;
    const { 
      page = 1, 
      limit = 20, 
      sortBy = 'createdAt', 
      sortOrder = 'desc',
      mode,
      isActive,
      startDate,
      endDate
    } = req.query as PaginationParams;

    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    const filter: any = { userId };


    // Apply filters
    if (mode) {
      filter.mode = mode;
    }
    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }
    if (startDate || endDate) {
      filter.startTime = {};
      if (startDate) filter.startTime.gte = new Date(startDate);
      if (endDate) filter.startTime.lte = new Date(endDate);
    }
    const orderBy: any = {[sortBy as string]: sortOrder as 'asc' | 'desc'};

    const [sessions, total] = await prisma.$transaction([
      prisma.studySession.findMany({
        where: filter,
        orderBy,
        skip,
        take: limitNum, 
      }),
      prisma.studySession.count({ where: filter }), 
    ]);

    const totalPages = Math.ceil(total / Number(limit));

    const response: PaginatedResponse<StudySession> = {
      data: sessions as StudySession[],
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages
      }
    };

    res.status(200).json({
      success: true,
      data: response
    });
  } catch (error: any) {
    console.error('Get study sessions error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

export const getStudySessionById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    if(!userId){
      res.status(400).json({success: false, error: 'User not authenticated'})
      return;
    }
    const session = await prisma.studySession.findFirst({ where:{id: id, userId } as any});
    
    if (!session) {
      res.status(404).json({
        success: false,
        error: 'Study session not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: session
    });
  } catch (error: any) {
    console.error('Get study session by id error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

export const endStudySession = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    if (!id) {
      res.status(400).json({ success: false, error: 'Study session ID is missing' });
      return;
  }

    const session = await prisma.studySession.findFirst({ 
      where:{
        id,
        userId,
        isActive: true},
      select: {id: true, startTime: true, userId: true} });
    
    if (!session) {
      res.status(404).json({
        success: false,
        error: 'Active study session not found'
      });
      return;
    }
    
    const endTime = new Date();
    const startTime = new Date(session.startTime as string);
    const durationInMinutes = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60));

    // 2. Atualiza a sessão
     await prisma.studySession.update({
      where: { id: session.id as string } as any,
      data: {
          endTime: endTime.toISOString(),
          isActive: false,
          duration: durationInMinutes,
      }
  });

    res.status(200).json({
      success: true,
      data: session,
      message: 'Study session ended successfully'
    });
  } catch (error: any) {
    console.error('End study session error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

export const updateStudySession = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const updates = req.body;

    const session = await prisma.studySession.update({
       where:{
        id, 
        userId
      } as any,
    data: {
      ...updates,
      startTime:updates.startTime ? new Date(updates.startTime) : updates.startTime,
      endTime: updates.endTime ? new Date(updates.endTime) : updates.endTime,
      duration: updates.duration ? Number(updates.duration) : updates.duration,
    },
  });
    
    if (!session) {
      res.status(404).json({
        success: false,
        error: 'Study session not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: session,
      message: 'Study session updated successfully'
    });
  } catch (error: any) {
    console.error('Update study session error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err: any) => err.message);
      res.status(400).json({
        success: false,
        error: errors.join(', ')
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

export const deleteStudySession = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const session = await prisma.studySession.delete({ 
      where:{
        id,
        userId,
       } as any
  });
    
    if (!session) {
      res.status(404).json({
        success: false,
        error: 'Study session not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Study session deleted successfully'
    });
  } catch (error: any) {
    console.error('Delete study session error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

export const getStudyStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user.id;
    const { period = 'all' } = req.query;
    
    if (!userId) {
      res.status(401).json({ success: false, error: 'User not authenticated' });
      return;
    }

    let dateFilter: any = {};
    const today = new Date();
    
    if (period === 'today') {
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
      dateFilter = { gte: startOfDay, lt: endOfDay };
    } else if (period === 'week') {
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 7);
      dateFilter = { gte: startOfWeek, lt: endOfWeek };
    } else if (period === 'month') {
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
      dateFilter = { gte: startOfMonth, lt: endOfMonth };
    }

    const filter = { 
      userId, 
      ...(Object.keys(dateFilter).length > 0 && { startTime: dateFilter })
    };

    const totalSessions = await prisma.studySession.count({ where: filter });
    
    const totalTimeAgg = await prisma.studySession.aggregate({
        _sum: { duration: true },
        where: filter,
    });
    
    const sessionsByModeAgg = await prisma.studySession.groupBy({
        by: ['mode'],
        _sum: { duration: true },
        _count: { mode: true },
        where: filter,
    });
    
    const sessionsByMode = sessionsByModeAgg.map(item => ({
        _id: item.mode, 
        count: item._count.mode,
        totalDuration: item._sum.duration || 0,
    }));

    const totalDuration = totalTimeAgg._sum.duration || 0;
    const averageSessionDuration = totalSessions > 0 ? Math.round(totalDuration / totalSessions) : 0;

    res.status(200).json({
      success: true,
      data: {
        totalSessions,
        totalDuration,
        averageSessionDuration,
        sessionsByMode,
        period
      }
    });
  } catch (error: any) {
    console.error('Get study stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};