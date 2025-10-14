import api from './api';

export interface StudySession {
  _id: string;
  mode: 'pomodoro' | 'flowtime' | 'custom';
  subject?: string;
  startTime: string;
  endTime?: string;
  duration: number; // em minutos
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSessionData {
  mode: 'pomodoro' | 'flowtime' | 'custom';
  subject?: string;
}

export interface SessionStats {
  totalSessions: number;
  totalStudyTime: number; // em minutos
  averageSessionDuration: number;
  sessionsThisWeek: number;
  sessionsThisMonth: number;
  mostStudiedSubject?: string;
}

class StudySessionService {
  async getSessions(): Promise<StudySession[]> {
    const response = await api.get('/api/study-sessions');
    return response.data;
  }

  async getSession(id: string): Promise<StudySession> {
    const response = await api.get(`/api/study-sessions/${id}`);
    return response.data;
  }

  async createSession(data: CreateSessionData): Promise<StudySession> {
    const response = await api.post('/api/study-sessions', data);
    return response.data;
  }

  async endSession(id: string): Promise<StudySession> {
    const response = await api.patch(`/api/study-sessions/${id}/end`);
    return response.data;
  }

  async updateSession(id: string, data: Partial<StudySession>): Promise<StudySession> {
    const response = await api.put(`/api/study-sessions/${id}`, data);
    return response.data;
  }

  async deleteSession(id: string): Promise<void> {
    await api.delete(`/api/study-sessions/${id}`);
  }

  async getSessionStats(): Promise<SessionStats> {
    const response = await api.get('/api/study-sessions/stats');
    return response.data;
  }

  async getSessionsByDate(date: string): Promise<StudySession[]> {
    const response = await api.get(`/api/study-sessions?date=${date}`);
    return response.data;
  }

  async getSessionsBySubject(subject: string): Promise<StudySession[]> {
    const response = await api.get(`/api/study-sessions?subject=${subject}`);
    return response.data;
  }
}

export default new StudySessionService(); 