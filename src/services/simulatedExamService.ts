import api from './api';

export interface Question {
  _id: string;
  text: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
  subject: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface SimulatedExam {
  _id: string;
  title: string;
  description?: string;
  subject: string;
  questions: Question[];
  duration: number; // em minutos
  totalQuestions: number;
  passingScore: number; // porcentagem
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExamResult {
  _id: string;
  examId: string;
  userId: string;
  answers: { questionId: string; selectedAnswer: number }[];
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  timeSpent: number; // em minutos
  completedAt: string;
  createdAt: string;
}

export interface CreateExamData {
  title: string;
  description?: string;
  subject: string;
  duration: number;
  passingScore: number;
}

export interface ExamStats {
  totalExams: number;
  completedExams: number;
  averageScore: number;
  bestScore: number;
  totalTimeSpent: number;
  subjects: { name: string; count: number; averageScore: number }[];
}

class SimulatedExamService {
  async getExams(): Promise<SimulatedExam[]> {
    const response = await api.get('/api/simulated-exams');
    return response.data;
  }

  async getExam(id: string): Promise<SimulatedExam> {
    const response = await api.get(`/api/simulated-exams/${id}`);
    return response.data;
  }

  async createExam(data: CreateExamData): Promise<SimulatedExam> {
    const response = await api.post('/api/simulated-exams', data);
    return response.data;
  }

  async updateExam(id: string, data: Partial<SimulatedExam>): Promise<SimulatedExam> {
    const response = await api.put(`/api/simulated-exams/${id}`, data);
    return response.data;
  }

  async deleteExam(id: string): Promise<void> {
    await api.delete(`/api/simulated-exams/${id}`);
  }

  async submitExamResult(examId: string, answers: { questionId: string; selectedAnswer: number }[]): Promise<ExamResult> {
    const response = await api.post(`/api/simulated-exams/${examId}/submit`, { answers });
    return response.data;
  }

  async getExamResults(): Promise<ExamResult[]> {
    const response = await api.get('/api/simulated-exams/results');
    return response.data;
  }

  async getExamResult(id: string): Promise<ExamResult> {
    const response = await api.get(`/api/simulated-exams/results/${id}`);
    return response.data;
  }

  async getExamStats(): Promise<ExamStats> {
    const response = await api.get('/api/simulated-exams/stats');
    return response.data;
  }

  async getExamsBySubject(subject: string): Promise<SimulatedExam[]> {
    const response = await api.get(`/api/simulated-exams?subject=${subject}`);
    return response.data;
  }
}

export default new SimulatedExamService(); 