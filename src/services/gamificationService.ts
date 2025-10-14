import api from './api';

export interface Achievement {
  _id: string;
  name: string;
  description: string;
  icon: string;
  category: 'study' | 'tasks' | 'exams' | 'flashcards' | 'streak' | 'special';
  requirement: number;
  currentProgress: number;
  completed: boolean;
  completedAt?: string;
  points: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface Badge {
  _id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  unlocked: boolean;
  unlockedAt?: string;
  requirement: string;
}

export interface UserStats {
  level: number;
  experience: number;
  experienceToNextLevel: number;
  totalPoints: number;
  achievements: Achievement[];
  badges: Badge[];
  streak: number;
  longestStreak: number;
  totalStudyTime: number;
  totalTasksCompleted: number;
  totalExamsTaken: number;
  totalFlashcardsReviewed: number;
}

export interface LeaderboardEntry {
  userId: string;
  userName: string;
  level: number;
  experience: number;
  totalPoints: number;
  rank: number;
}

class GamificationService {
  async getUserStats(): Promise<UserStats> {
    const response = await api.get('/api/gamification/stats');
    return response.data;
  }

  async getAchievements(): Promise<Achievement[]> {
    const response = await api.get('/api/gamification/achievements');
    return response.data;
  }

  async getBadges(): Promise<Badge[]> {
    const response = await api.get('/api/gamification/badges');
    return response.data;
  }

  async getLeaderboard(): Promise<LeaderboardEntry[]> {
    const response = await api.get('/api/gamification/leaderboard');
    return response.data;
  }

  async claimReward(achievementId: string): Promise<Achievement> {
    const response = await api.post(`/api/gamification/achievements/${achievementId}/claim`);
    return response.data;
  }

  async getWeeklyProgress(): Promise<any> {
    const response = await api.get('/api/gamification/weekly-progress');
    return response.data;
  }

  async getMonthlyProgress(): Promise<any> {
    const response = await api.get('/api/gamification/monthly-progress');
    return response.data;
  }
}

export default new GamificationService(); 