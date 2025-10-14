import { format, addDays, addWeeks, addMonths, addYears, isSameDay, isBefore } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { v4 as uuidv4 } from 'uuid';

// Date and time formatting
export const formatDate = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'dd/MM/yyyy', { locale: ptBR });
};

export const formatTime = (time: string): string => {
  return time.substring(0, 5); // Remove seconds if present
};

export const formatDateTime = (date: string | Date, time: string): string => {
  const dateStr = formatDate(date);
  const timeStr = formatTime(time);
  return `${dateStr} às ${timeStr}`;
};

export const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours > 0) {
    return `${hours}h ${mins}min`;
  }
  return `${mins}min`;
};

// Date calculations
export const getNextOccurrence = (
  startDate: string,
  recurrenceType: 'daily' | 'weekly' | 'monthly' | 'yearly',
  currentDate: Date = new Date()
): Date => {
  const start = new Date(startDate);
  let nextDate = start;

  while (isBefore(nextDate, currentDate) || isSameDay(nextDate, currentDate)) {
    switch (recurrenceType) {
      case 'daily':
        nextDate = addDays(nextDate, 1);
        break;
      case 'weekly':
        nextDate = addWeeks(nextDate, 1);
        break;
      case 'monthly':
        nextDate = addMonths(nextDate, 1);
        break;
      case 'yearly':
        nextDate = addYears(nextDate, 1);
        break;
    }
  }

  return nextDate;
};

// Time calculations
export const calculateTimeRemaining = (targetDate: string): {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
} => {
  const now = new Date();
  const target = new Date(targetDate);
  const diff = target.getTime() - now.getTime();

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return { days, hours, minutes, seconds };
};

// Percentage calculations
export const calculatePercentage = (current: number, total: number): number => {
  if (total === 0) return 0;
  return Math.round((current / total) * 100);
};

export const calculateScore = (correct: number, total: number): number => {
  if (total === 0) return 0;
  return Math.round((correct / total) * 100);
};

// Experience and level calculations
export const calculateExperienceToNextLevel = (level: number): number => {
  return level * 100; // Simple formula: each level requires level * 100 XP
};

export const calculateLevel = (experience: number): number => {
  return Math.floor(experience / 100) + 1;
};

// ID generation
export const generateId = (): string => {
  return uuidv4();
};

// Priority colors
export const getPriorityColor = (priority: 'low' | 'medium' | 'high'): string => {
  switch (priority) {
    case 'low':
      return '#10b981'; // green
    case 'medium':
      return '#f59e0b'; // yellow
    case 'high':
      return '#ef4444'; // red
    default:
      return '#6b7280'; // gray
  }
};

// Subject colors (for charts and UI)
export const getSubjectColor = (subject: string): string => {
  const colors = [
    '#3b82f6', // blue
    '#ef4444', // red
    '#10b981', // green
    '#f59e0b', // yellow
    '#8b5cf6', // purple
    '#06b6d4', // cyan
    '#f97316', // orange
    '#ec4899', // pink
    '#84cc16', // lime
    '#6366f1', // indigo
  ];

  // Simple hash function to get consistent color for same subject
  let hash = 0;
  for (let i = 0; i < subject.length; i++) {
    const char = subject.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }

  return colors[Math.abs(hash) % colors.length];
};

// Validation helpers
export const isValidTime = (time: string): boolean => {
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(time);
};

export const isValidDate = (date: string): boolean => {
  const dateObj = new Date(date);
  return !isNaN(dateObj.getTime());
};

// Notification helpers
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission === 'denied') {
    return false;
  }

  const permission = await Notification.requestPermission();
  return permission === 'granted';
};

export const sendNotification = (title: string, options?: NotificationOptions): void => {
  if (Notification.permission === 'granted') {
    new Notification(title, options);
  }
};

// Sound helpers
export const playNotificationSound = (): void => {
  // Create a simple beep sound using Web Audio API
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.frequency.value = 800;
  oscillator.type = 'sine';

  gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.5);
};
