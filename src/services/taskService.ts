import api from './api';

export interface Task {
  _id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskData {
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
}

export interface UpdateTaskData {
  title?: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
  dueDate?: string;
}

export interface TaskStats {
  total: number;
  completed: number;
  pending: number;
  overdue: number;
}

class TaskService {
  async getTasks(): Promise<Task[]> {
    const response = await api.get('/api/tasks');
    return response.data;
  }

  async getTask(id: string): Promise<Task> {
    const response = await api.get(`/api/tasks/${id}`);
    return response.data;
  }

  async createTask(data: CreateTaskData): Promise<Task> {
    const response = await api.post('/api/tasks', data);
    return response.data;
  }

  async updateTask(id: string, data: UpdateTaskData): Promise<Task> {
    const response = await api.put(`/api/tasks/${id}`, data);
    return response.data;
  }

  async deleteTask(id: string): Promise<void> {
    await api.delete(`/api/tasks/${id}`);
  }

  async toggleTaskCompletion(id: string): Promise<Task> {
    const response = await api.patch(`/api/tasks/${id}/toggle`);
    return response.data;
  }

  async getTaskStats(): Promise<TaskStats> {
    const response = await api.get('/api/tasks/stats');
    return response.data;
  }

  async getTasksByDate(date: string): Promise<Task[]> {
    const response = await api.get(`/api/tasks?date=${date}`);
    return response.data;
  }

  async getOverdueTasks(): Promise<Task[]> {
    const response = await api.get('/api/tasks?overdue=true');
    return response.data;
  }
}

export default new TaskService(); 