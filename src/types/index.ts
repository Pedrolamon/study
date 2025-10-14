export interface Appointment {
  id: string;
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
  id: string;
  type: 'same-day' | 'hours-before';
  hoursBefore?: number;
  time?: string;
  isActive: boolean;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SimulatedExam {
  id: string;
  name: string;
  date: string;
  subject: string;
  correctAnswers: number;
  totalQuestions: number;
  duration?: number; // in minutes
  createdAt: string;
}

export interface StudySession {
  id: string;
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
  id: string;
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
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: string;
  isUnlocked: boolean;
}

export interface UserStats {
  totalStudyTime: number; // in minutes
  totalSessions: number;
  totalTasksCompleted: number;
  totalExamsTaken: number;
  averageScore: number;
  currentStreak: number;
  level: number;
  experience: number;
  experienceToNextLevel: number;
}

export interface BlockedSite {
  id: string;
  url: string;
  name: string;
  isActive: boolean;
  createdAt: string;
}

export interface AppSettings {
  examDate?: string;
  notifications: boolean;
  soundEnabled: boolean;
  theme: 'light' | 'dark' | 'auto';
  timerSettings: TimerSettings;
} 