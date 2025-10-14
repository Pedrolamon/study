import api from './api';

export interface EditalTopic {
  _id?: string;
  name: string;
  description?: string;
  weight: number;
  estimatedHours: number;
  difficulty: 'easy' | 'medium' | 'hard';
  prerequisites?: string[];
  subject: string;
  subtopics?: string[];
}

export interface Edital {
  _id?: string;
  title: string;
  description?: string;
  examType: string;
  organization: string;
  examDate: string;
  totalTopics: number;
  topics: EditalTopic[];
  userId: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface StudySessionPlan {
  _id?: string;
  topicId: string;
  topicName: string;
  subject: string;
  scheduledDate: string;
  duration: number;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'completed' | 'postponed';
  actualDuration?: number;
  notes?: string;
  performance?: number;
}

export interface StudyPlan {
  _id?: string;
  title: string;
  description?: string;
  editalId: string;
  userId: string;
  startDate: string;
  endDate: string;
  totalHours: number;
  dailyHours: number;
  sessions: StudySessionPlan[];
  isActive: boolean;
  progress: number;
  lastUpdated: string;
  createdAt?: string;
  updatedAt?: string;
  edital?: {
    _id: string;
    title: string;
    examType: string;
    organization: string;
    examDate: string;
  };
}

export interface CreateEditalData {
  title: string;
  description?: string;
  examType: string;
  organization: string;
  examDate: string;
  topics: EditalTopic[];
}

export interface GeneratePlanData {
  editalId: string;
  dailyHours?: number;
}

export interface UpdateSessionData {
  status?: 'pending' | 'completed' | 'postponed';
  actualDuration?: number;
  notes?: string;
  performance?: number;
}

class StudyPlanService {
  // Edital management
  async createEdital(data: CreateEditalData): Promise<Edital> {
    const response = await api.post('/api/study-plans/editais', data);
    return response.data;
  }

  async getEditais(): Promise<Edital[]> {
    const response = await api.get('/api/study-plans/editais');
    return response.data;
  }

  async getEdital(id: string): Promise<Edital> {
    const response = await api.get(`/api/study-plans/editais/${id}`);
    return response.data;
  }

  // Study plan management
  async generateStudyPlan(data: GeneratePlanData): Promise<StudyPlan> {
    const response = await api.post('/api/study-plans/generate', data);
    return response.data;
  }

  async getStudyPlans(): Promise<StudyPlan[]> {
    const response = await api.get('/api/study-plans');
    return response.data;
  }

  async getStudyPlan(id: string): Promise<StudyPlan> {
    const response = await api.get(`/api/study-plans/${id}`);
    return response.data;
  }

  async updateSessionStatus(
    planId: string,
    sessionId: string,
    data: UpdateSessionData
  ): Promise<StudyPlan> {
    const response = await api.put(`/api/study-plans/${planId}/sessions/${sessionId}`, data);
    return response.data;
  }

  async adaptStudyPlan(planId: string): Promise<StudyPlan> {
    const response = await api.post(`/api/study-plans/${planId}/adapt`);
    return response.data;
  }

  // Utility functions
  async getUpcomingSessions(days: number = 7): Promise<StudySessionPlan[]> {
    const response = await api.get(`/api/study-plans/sessions/upcoming?days=${days}`);
    return response.data;
  }

  // Helper functions for frontend
  calculatePlanProgress(sessions: StudySessionPlan[]): number {
    if (sessions.length === 0) return 0;
    const completedSessions = sessions.filter(s => s.status === 'completed').length;
    return Math.round((completedSessions / sessions.length) * 100);
  }

  getSessionsByDate(sessions: StudySessionPlan[], date: Date): StudySessionPlan[] {
    const targetDate = date.toISOString().split('T')[0];
    return sessions.filter(session => {
      const sessionDate = new Date(session.scheduledDate).toISOString().split('T')[0];
      return sessionDate === targetDate;
    });
  }

  getSessionsByPriority(sessions: StudySessionPlan[], priority: 'low' | 'medium' | 'high'): StudySessionPlan[] {
    return sessions.filter(session => session.priority === priority);
  }

  getOverdueSessions(sessions: StudySessionPlan[]): StudySessionPlan[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return sessions.filter(session => {
      const sessionDate = new Date(session.scheduledDate);
      sessionDate.setHours(0, 0, 0, 0);
      return sessionDate < today && session.status === 'pending';
    });
  }

  getUpcomingSessionsInRange(sessions: StudySessionPlan[], days: number = 7): StudySessionPlan[] {
    const today = new Date();
    const endDate = new Date(today);
    endDate.setDate(today.getDate() + days);

    return sessions.filter(session => {
      const sessionDate = new Date(session.scheduledDate);
      return sessionDate >= today && sessionDate <= endDate && session.status === 'pending';
    }).sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime());
  }

  // Performance analysis helpers
  analyzeTopicPerformance(sessions: StudySessionPlan[]): {
    topicId: string;
    totalSessions: number;
    completedSessions: number;
    averagePerformance: number;
    completionRate: number;
  }[] {
    const topicStats: { [topicId: string]: StudySessionPlan[] } = {};

    // Group sessions by topic
    sessions.forEach(session => {
      if (!topicStats[session.topicId]) {
        topicStats[session.topicId] = [];
      }
      topicStats[session.topicId].push(session);
    });

    // Calculate statistics for each topic
    return Object.entries(topicStats).map(([topicId, topicSessions]) => {
      const completedSessions = topicSessions.filter(s => s.status === 'completed');
      const totalPerformance = completedSessions.reduce((sum, s) => sum + (s.performance || 0), 0);
      const averagePerformance = completedSessions.length > 0
        ? Math.round(totalPerformance / completedSessions.length)
        : 0;

      return {
        topicId,
        totalSessions: topicSessions.length,
        completedSessions: completedSessions.length,
        averagePerformance,
        completionRate: Math.round((completedSessions.length / topicSessions.length) * 100)
      };
    });
  }

  // Study streak calculation
  calculateStudyStreak(sessions: StudySessionPlan[]): number {
    const completedSessions = sessions
      .filter(s => s.status === 'completed')
      .sort((a, b) => new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime());

    if (completedSessions.length === 0) return 0;

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if studied today
    const todaySession = completedSessions.find(session => {
      const sessionDate = new Date(session.scheduledDate);
      sessionDate.setHours(0, 0, 0, 0);
      return sessionDate.getTime() === today.getTime();
    });

    if (!todaySession) return 0;

    // Count consecutive days
    let currentDate = new Date(today);
    for (const session of completedSessions) {
      const sessionDate = new Date(session.scheduledDate);
      sessionDate.setHours(0, 0, 0, 0);

      if (sessionDate.getTime() === currentDate.getTime()) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else if (sessionDate.getTime() < currentDate.getTime()) {
        // Gap in streak
        break;
      }
    }

    return streak;
  }
}

export default new StudyPlanService();
