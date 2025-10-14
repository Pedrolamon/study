import { useState, useEffect, useCallback } from 'react';
import type { Task } from '../types';
import { storageService } from '../services/storage';
import { generateId } from '../utils/helpers';

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  // Load tasks from storage
  useEffect(() => {
    const loadTasks = () => {
      const stored = storageService.getTasks();
      setTasks(stored);
      setLoading(false);
    };

    loadTasks();
  }, []);

  // Add new task
  const addTask = useCallback((taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTask: Task = {
      ...taskData,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updatedTasks = [...tasks, newTask];
    setTasks(updatedTasks);
    storageService.saveTasks(updatedTasks);
  }, [tasks]);

  // Update task
  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    const updatedTasks = tasks.map(task => 
      task.id === id 
        ? { ...task, ...updates, updatedAt: new Date().toISOString() }
        : task
    );
    
    setTasks(updatedTasks);
    storageService.saveTasks(updatedTasks);
  }, [tasks]);

  // Delete task
  const deleteTask = useCallback((id: string) => {
    const updatedTasks = tasks.filter(task => task.id !== id);
    setTasks(updatedTasks);
    storageService.saveTasks(updatedTasks);
  }, [tasks]);

  // Toggle task completion
  const toggleTaskCompletion = useCallback((id: string) => {
    const updatedTasks = tasks.map(task => 
      task.id === id 
        ? { ...task, completed: !task.completed, updatedAt: new Date().toISOString() }
        : task
    );
    
    setTasks(updatedTasks);
    storageService.saveTasks(updatedTasks);
  }, [tasks]);

  // Get tasks for a specific date
  const getTasksForDate = useCallback((date: string) => {
    return tasks.filter(task => {
      if (!task.dueDate) return false;
      return task.dueDate === date;
    });
  }, [tasks]);

  // Get tasks by priority
  const getTasksByPriority = useCallback((priority: 'low' | 'medium' | 'high') => {
    return tasks.filter(task => task.priority === priority);
  }, [tasks]);

  // Get completed tasks
  const getCompletedTasks = useCallback(() => {
    return tasks.filter(task => task.completed);
  }, [tasks]);

  // Get pending tasks
  const getPendingTasks = useCallback(() => {
    return tasks.filter(task => !task.completed);
  }, [tasks]);

  // Get overdue tasks
  const getOverdueTasks = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    return tasks.filter(task => 
      !task.completed && 
      task.dueDate && 
      task.dueDate < today
    );
  }, [tasks]);

  // Get today's tasks
  const getTodayTasks = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    return getTasksForDate(today);
  }, [tasks, getTasksForDate]);

  // Get tasks for this week
  const getThisWeekTasks = useCallback(() => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    
    const endOfWeek = new Date(today);
    endOfWeek.setDate(today.getDate() + (6 - today.getDay()));
    
    return tasks.filter(task => {
      if (!task.dueDate) return false;
      const taskDate = new Date(task.dueDate);
      return taskDate >= startOfWeek && taskDate <= endOfWeek;
    });
  }, [tasks]);

  // Get tasks for this month
  const getThisMonthTasks = useCallback(() => {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    return tasks.filter(task => {
      if (!task.dueDate) return false;
      const taskDate = new Date(task.dueDate);
      return taskDate >= startOfMonth && taskDate <= endOfMonth;
    });
  }, [tasks]);

  // Get task statistics
  const getTaskStats = useCallback(() => {
    const total = tasks.length;
    const completed = tasks.filter(task => task.completed).length;
    const pending = total - completed;
    const overdue = getOverdueTasks().length;
    
    return {
      total,
      completed,
      pending,
      overdue,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  }, [tasks, getOverdueTasks]);

  return {
    tasks,
    loading,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskCompletion,
    getTasksForDate,
    getTasksByPriority,
    getCompletedTasks,
    getPendingTasks,
    getOverdueTasks,
    getTodayTasks,
    getThisWeekTasks,
    getThisMonthTasks,
    getTaskStats,
  };
}; 