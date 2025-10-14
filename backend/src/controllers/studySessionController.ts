import { Request, Response } from 'express';
import { StudySessionModel } from '../models/StudySession';
import type { StudySession, PaginationParams, PaginatedResponse } from '../types';
import { GamificationService } from '../services/gamificationService';

interface AuthRequest extends Request {
  user?: any;
}

export const createStudySession = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user._id;
    const { mode, subject, duration } = req.body;

    const session = new StudySessionModel({
      userId,
      mode,
      subject,
      startTime: new Date().toISOString(),
      duration,
      isActive: true
    });

    await session.save();

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
    const userId = req.user._id;
    const { 
      page = 1, 
      limit = 20, 
      sortBy = 'createdAt', 
      sortOrder = 'desc',
      mode,
      isActive,
      startDate,
      endDate
    } = req.query;

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
      if (startDate) filter.startTime.$gte = startDate;
      if (endDate) filter.startTime.$lte = endDate;
    }

    const skip = (Number(page) - 1) * Number(limit);
    const sort: any = { [sortBy as string]: sortOrder === 'desc' ? -1 : 1 };

    const [sessions, total] = await Promise.all([
      StudySessionModel.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      StudySessionModel.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(total / Number(limit));

    const response: PaginatedResponse<StudySession> = {
      data: sessions,
      pagination: {
        page: Number(page),
        limit: Number(limit),
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
    const userId = req.user._id;
    const { id } = req.params;

    const session = await StudySessionModel.findOne({ _id: id, userId });
    
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
    const userId = req.user._id;
    const { id } = req.params;

    const session = await StudySessionModel.findOne({ _id: id, userId, isActive: true });
    
    if (!session) {
      res.status(404).json({
        success: false,
        error: 'Active study session not found'
      });
      return;
    }

    session.endTime = new Date().toISOString();
    session.isActive = false;
    
    // Calculate actual duration
    const startTime = new Date(session.startTime);
    const endTime = new Date(session.endTime);
    session.duration = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60)); // in minutes

    await session.save();

    // Award points for study session
    await GamificationService.awardStudyPoints(userId, session);

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
    const userId = req.user._id;
    const { id } = req.params;
    const updates = req.body;

    const session = await StudySessionModel.findOne({ _id: id, userId });
    
    if (!session) {
      res.status(404).json({
        success: false,
        error: 'Study session not found'
      });
      return;
    }

    // Update fields
    Object.assign(session, updates);
    await session.save();

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
    const userId = req.user._id;
    const { id } = req.params;

    const session = await StudySessionModel.findOneAndDelete({ _id: id, userId });
    
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
    const userId = req.user._id;
    const { period = 'all' } = req.query;

    let dateFilter: any = {};
    
    if (period === 'today') {
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
      dateFilter = {
        startTime: {
          $gte: startOfDay.toISOString(),
          $lt: endOfDay.toISOString()
        }
      };
    } else if (period === 'week') {
      const today = new Date();
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 7);
      dateFilter = {
        startTime: {
          $gte: startOfWeek.toISOString(),
          $lt: endOfWeek.toISOString()
        }
      };
    } else if (period === 'month') {
      const today = new Date();
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
      dateFilter = {
        startTime: {
          $gte: startOfMonth.toISOString(),
          $lt: endOfMonth.toISOString()
        }
      };
    }

    const filter = { userId, ...dateFilter };

    const [totalSessions, totalTime, sessionsByMode] = await Promise.all([
      StudySessionModel.countDocuments(filter),
      StudySessionModel.aggregate([
        { $match: filter },
        { $group: { _id: null, totalDuration: { $sum: '$duration' } } }
      ]),
      StudySessionModel.aggregate([
        { $match: filter },
        { $group: { _id: '$mode', count: { $sum: 1 }, totalDuration: { $sum: '$duration' } } }
      ])
    ]);

    const totalDuration = totalTime[0]?.totalDuration || 0;
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