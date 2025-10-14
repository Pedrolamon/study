import { Request, Response } from 'express';
import { TaskModel } from '../models/Task';
import type { Task, PaginationParams, PaginatedResponse } from '../types';
import { GamificationService } from '../services/gamificationService';

interface AuthRequest extends Request {
  user?: any;
}

export const createTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user._id;
    const { title, description, priority, dueDate } = req.body;

    const task = new TaskModel({
      userId,
      title,
      description,
      priority: priority || 'medium',
      dueDate,
      completed: false
    });

    await task.save();

    res.status(201).json({
      success: true,
      data: task,
      message: 'Task created successfully'
    });
  } catch (error: any) {
    console.error('Create task error:', error);
    
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

export const getTasks = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user._id;
    const { 
      page = 1, 
      limit = 20, 
      sortBy = 'createdAt', 
      sortOrder = 'desc',
      completed,
      priority,
      dueDate
    } = req.query;

    const filter: any = { userId };

    // Apply filters
    if (completed !== undefined) {
      filter.completed = completed === 'true';
    }
    if (priority) {
      filter.priority = priority;
    }
    if (dueDate) {
      filter.dueDate = dueDate;
    }

    const skip = (Number(page) - 1) * Number(limit);
    const sort: any = { [sortBy as string]: sortOrder === 'desc' ? -1 : 1 };

    const [tasks, total] = await Promise.all([
      TaskModel.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      TaskModel.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(total / Number(limit));

    const response: PaginatedResponse<Task> = {
      data: tasks,
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

    const task = await TaskModel.findOne({ _id: id, userId });
    
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
    const userId = req.user._id;
    const { id } = req.params;
    const updates = req.body;

    const task = await TaskModel.findOne({ _id: id, userId });
    
    if (!task) {
      res.status(404).json({
        success: false,
        error: 'Task not found'
      });
      return;
    }

    // Update fields
    Object.assign(task, updates);
    await task.save();

    res.status(200).json({
      success: true,
      data: task,
      message: 'Task updated successfully'
    });
  } catch (error: any) {
    console.error('Update task error:', error);
    
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

export const deleteTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const task = await TaskModel.findOneAndDelete({ _id: id, userId });
    
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

    const task = await TaskModel.findOne({ _id: id, userId });
    
    if (!task) {
      res.status(404).json({
        success: false,
        error: 'Task not found'
      });
      return;
    }

    const wasCompleted = task.completed;
    task.completed = !task.completed;
    
    // Check if task is being completed and if it's on time
    if (task.completed && !wasCompleted) {
      const now = new Date();
      const dueDate = new Date(task.dueDate);
      task.completedOnTime = now <= dueDate;
    }
    
    await task.save();

    // Award points for task completion
    if (task.completed && !wasCompleted) {
      await GamificationService.awardTaskPoints(userId, task);
    }

    res.status(200).json({
      success: true,
      data: task,
      message: `Task ${task.completed ? 'completed' : 'uncompleted'} successfully`
    });
  } catch (error: any) {
    console.error('Toggle task completion error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

export const getTaskStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user._id;

    const [total, completed, overdue] = await Promise.all([
      TaskModel.countDocuments({ userId }),
      TaskModel.countDocuments({ userId, completed: true }),
      TaskModel.countDocuments({
        userId,
        completed: false,
        dueDate: { $lt: new Date().toISOString().split('T')[0] }
      })
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