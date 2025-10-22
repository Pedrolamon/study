export interface Appointment {
  _id?: string;
  userId: string;
  title: string;
  description?: string;
  date: string;
  startTime: string;
  endTime: string;
  isRecurring: boolean;
  recurrenceType?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  recurrenceEndDate?: string;
  reminders: Reminder[];
  createdAt: string;
  updatedAt: string;
}

export interface Reminder {
  _id?: string;
  type: 'same-day' | 'hours-before';
  hoursBefore?: number;
  time?: string;
  isActive: boolean;
}

export interface Task {
  _id?: string;
  userId: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SimulatedExam {
  _id?: string;
  userId: string;
  name: string;
  date: string;
  subject: string;
  correctAnswers: number;
  totalQuestions: number;
  duration?: number; // in minutes
  createdAt: string;
}

export interface StudySession {
  _id?: string;
  userId: string;
  mode: 'pomodoro' | 'flowtime' | 'custom';
  subject?: string;
  startTime: string;
  endTime?: string;
  duration: number; // in minutes
  isActive: boolean;
  createdAt: string;
}

export interface TimerSettings {
  pomodoroWork: number; // in minutes
  pomodoroBreak: number; // in minutes
  pomodoroLongBreak: number; // in minutes
  pomodoroCycles: number;
  customWork: number; // in minutes
  customBreak: number; // in minutes
}

export interface Goal {
  _id?: string;
  userId: string;
  title: string;
  type: 'daily' | 'weekly' | 'monthly';
  target: number;
  unit: 'hours' | 'questions' | 'sessions';
  currentProgress: number;
  startDate: string;
  endDate?: string;
  isActive: boolean;
  createdAt: string;
}

export interface Achievement {
  _id?: string;
  userId: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: string;
  isUnlocked: boolean;
}

export interface UserStats {
  _id?: string;
  userId: string;
  totalStudyTime: number; // in minutes
  totalSessions: number;
  totalTasksCompleted: number;
  totalExamsTaken: number;
  averageScore: number;
  currentStreak: number;
  level: number;
  experience: number;
  experienceToNextLevel: number;
  updatedAt: string;
}

export interface BlockedSite {
  _id?: string;
  userId: string;
  url: string;
  name: string;
  isActive: boolean;
  createdAt: string;
}

export interface AppSettings {
  _id?: string;
  userId: string;
  examDate?: string;
  notifications: boolean;
  soundEnabled: boolean;
  theme: 'light' | 'dark' | 'auto';
  timerSettings: TimerSettings;
  updatedAt: string;
}

export interface User {
  _id?: string;
  email: string;
  password: string;
  name: string;
  avatar?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: Omit<User, 'password'>;
  token: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginationParams {
  page?: number | string;
  limit?: number | string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number | string;
    limit: number | string;
    total: number | string;
    totalPages: number;
  };
}
export interface FlashcardQuery extends PaginationParams {
  category?: string;
  difficulty?: string;
  isActive?: string;
  readyForReview?: string; 
}

export interface Notification {
  _id?: string;
  userId: string;
  title: string;
  message: string;
  type: 'task' | 'study' | 'exam' | 'reminder' | 'achievement' | 'system';
  isRead: boolean;
  isEmailSent: boolean;
  scheduledFor?: Date;
  sentAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Flashcard {
  _id?: string;
  userId: string;
  question: string;
  answer: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  lastReviewed?: Date;
  nextReview?: Date;
  reviewCount: number;
  isActive: boolean;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface StudyMaterial {
  _id?: string;
  userId: string;
  title: string;
  description: string;
  fileName: string;
  originalName: string;
  fileSize: number;
  mimeType: string;
  filePath: string;
  category: string;
  tags: string[];
  isPublic: boolean;
  downloadCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface StudyReport {
  _id?: string;
  userId: string;
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  startDate: Date;
  endDate: Date;
  totalStudyTime: number;
  totalSessions: number;
  averageSessionDuration: number;
  tasksCompleted: number;
  tasksCreated: number;
  flashcardsReviewed: number;
  examsTaken: number;
  averageScore: number;
  goalsAchieved: number;
  createdAt: Date;
}

// Gamification Interfaces
export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'study' | 'achievement' | 'social' | 'special';
  pointsReward: number;
  requirements: {
    type: 'tasks_completed' | 'study_time' | 'flashcards_reviewed' | 'materials_uploaded' | 'streak_days' | 'perfect_sessions';
    value: number;
  };
  isUnlocked: boolean;
  unlockedAt?: Date;
}

export interface Achievement {
  id: string;
  userId: string;
  badgeId: string;
  unlockedAt?: string;
  pointsEarned: number;
}

export interface UserPoints {
  userId: string;
  totalPoints: number;
  level: number;
  experience: number;
  experienceToNextLevel: number;
  pointsHistory: {
    date: Date;
    points: number;
    reason: string;
    source: 'task' | 'study' | 'flashcard' | 'material' | 'badge' | 'streak';
  }[];
  lastUpdated: Date;
}

export interface LeaderboardEntry {
  userId: string;
  username: string;
  totalPoints: number;
  level: number;
  rank: number;
  achievements: number;
  studyTime: number;
}

export interface GamificationStats {
  totalPoints: number;
  level: number;
  experience: number;
  experienceToNextLevel: number;
  achievements: number;
  badges: number;
  rank: number;
  totalUsers: number;
  recentAchievements: Achievement[];
  nextBadges: Badge[];
} 