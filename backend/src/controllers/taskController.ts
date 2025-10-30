import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { Task } from '@prisma/client';
import { GamificationService } from '../services/gamificationService';

interface AuthRequest extends Request {
  user?: any;
}

interface PaginationParams {
  page?: string;
  limit?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  completed?: string;
  priority?: string;
  dueDate?: string;
}

interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const createTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user.id;
    if (!userId) {
      res.status(401).json({ success: false, error: 'User not authenticated' });
      return;
    }
    const { title, description, priority, dueDate } = req.body;

    const task = await prisma.task.create({
      data:{
      userId,
      title,
      description,
      priority: priority || 'MEDIUM',
      dueDate: dueDate ? new Date(dueDate) : null,
      completed: false
      }as any
    }); 

    res.status(201).json({
      success: true,
      data: task,
      message: 'Task created successfully'
    });
  } catch (error: any) {
    console.error('Create task error:', error);
    
    if (error.code === 'P2002' && error.meta?.target.includes('title')) {
      res.status(400).json({
        success: false,
        error: 'Task with this title already exists'
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

export const getTasks = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user._id;

    if (!userId) {
      res.status(401).json({ success: false, error: 'User not authenticated' });
      return;
    }
    const { 
      page = 1, 
      limit = 20, 
      sortBy = 'createdAt', 
      sortOrder = 'desc',
      completed,
      priority,
      dueDate
    } = req.query as PaginationParams;

    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    const filter: any = { userId };

    // Apply filters
    if (completed !== undefined) {
      filter.completed = completed === 'true';
    }
    if (priority) {
      filter.priority = priority.toUpperCase();
    }
    if (dueDate) {
      const startOfDay = new Date(dueDate);
      startOfDay.setUTCHours(0, 0, 0, 0); 
      const endOfDay = new Date(dueDate);
      endOfDay.setUTCHours(23, 59, 59, 999);
      
      filter.dueDate = {
        gte: startOfDay,
        lte: endOfDay,
      };
    }

    const orderBy: any = { [sortBy as string]: sortOrder as 'asc' | 'desc' };

    const [tasks, total] = await prisma.$transaction([
      prisma.task.findMany({
        where: filter,
        orderBy,
        skip,
        take: limitNum,
      }),
      prisma.task.count({ where: filter }), // total usa o mesmo filtro
    ]);

    const totalPages = Math.ceil(total / Number(limit));

    const response: PaginatedResponse<Task> = {
      data: tasks,
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
    console.error('Get tasks error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

export const getTaskById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    if (!userId) {
      res.status(401).json({ success: false, error: 'User not authenticated' });
      return;
    }

    const task = await prisma.task.findUnique({ 
      where: { 
        id, 
        userId,
      } as any // Pode precisar de 'as any' se o 'id' não for o único @id
    });

    if (!task) {
      res.status(404).json({
        success: false,
        error: 'Task not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: task
    });
  } catch (error: any) {
    console.error('Get task by id error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

export const updateTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    const updates = req.body;

    const updatedTask = await prisma.task.update({
      where: {
        id,
        userId, 
      } as any,
      data: {
        ...updates,
        dueDate: updates.dueDate ? new Date(updates.dueDate) : updates.dueDate,
        priority: updates.priority ? updates.priority.toUpperCase() : updates.priority,
      },
    });

    res.status(200).json({
      success: true,
      data: updatedTask,
      message: 'Task updated successfully',
    });
  } catch (error: any) {
    console.error('Update task error:', error);

    if (error.code === 'P2025') {
      res.status(404).json({
        success: false,
        error: 'Task not found or does not belong to user',
      });
      return;
    }
    
    if (error.code === 'P2000' || error.code === 'P2005') {
      res.status(400).json({
        success: false,
        error: 'Invalid data format provided for update',
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
};

export const deleteTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    if (!userId) {
      res.status(401).json({ success: false, error: 'User not authenticated' });
      return;
    }

    const task = await prisma.task.delete({
      where: { 
        id, 
        userId,
      } as any 
    });
    
    if (!task) {
      res.status(404).json({
        success: false,
        error: 'Task not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error: any) {
    console.error('Delete task error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

export const toggleTaskCompletion = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const task = await prisma.task.findUnique({ 
      where: { 
        id, 
        userId,
      } as any
    });
    
    if (!task) {
      res.status(404).json({
        success: false,
        error: 'Task not found'
      });
      return;
    }
    const wasCompleted = task.completed;
    const newCompletedStatus = !task.completed;
    
    const now = new Date();
    let completedOnTime = task.completedOnTime;

    if (newCompletedStatus && !wasCompleted) {
      const dueDate = task.dueDate;
      completedOnTime = dueDate ? (now <= dueDate) : true; 
    } else if (!newCompletedStatus && wasCompleted) {
      completedOnTime = null; 
    }
    
    const updatedTask = await prisma.task.update({
      where: { id: task.id },
      data: {
        completed: newCompletedStatus,
        completedOnTime: completedOnTime,
      }
    });

    if (updatedTask.completed && !wasCompleted) {
      await GamificationService.awardTaskPoints(userId, updatedTask);
    }

    res.status(200).json({
      success: true,
      data: updatedTask,
      message: `Task ${updatedTask.completed ? 'completed' : 'uncompleted'} successfully`,
    });
  } catch (error: any) {
    console.error('Toggle task completion error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
};

export const getTaskStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user._id;
    if (!userId) {
      res.status(401).json({ success: false, error: 'User not authenticated' });
      return;
    }

    const now = new Date();
    now.setUTCHours(0, 0, 0, 0);

    const [total, completed, overdue] = await prisma.$transaction([
      prisma.task.count({ where: { userId } }),
      prisma.task.count({ where: { userId, completed: true } }),
      prisma.task.count({
        where: {
          userId,
          completed: false,
          dueDate: {
            lt: now, 
          },
        },
      }),
    ]);

    const pending = total - completed;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    res.status(200).json({
      success: true,
      data: {
        total,
        completed,
        pending,
        overdue,
        completionRate
      }
    });
  } catch (error: any) {
    console.error('Get task stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}; 