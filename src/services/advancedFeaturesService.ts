import api from './api';

export interface Flashcard {
  _id?: string;
  userId: string;
  question: string;
  answer: string;
  subject: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ReviewSession {
  _id?: string;
  userId: string;
  flashcardId: string;
  responseQuality: number;
  timeSpent: number;
  previousInterval: number;
  newInterval: number;
  nextReviewDate: string;
  easeFactor: number;
  repetitionCount: number;
  lastReviewed: string;
  createdAt?: string;
}

export interface StudyStreak {
  _id?: string;
  userId: string;
  currentStreak: number;
  longestStreak: number;
  lastStudyDate: string;
  totalStudyDays: number;
  studyDaysThisWeek: number;
  studyDaysThisMonth: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Widget {
  _id?: string;
  userId: string;
  type: 'study_progress' | 'upcoming_reviews' | 'focus_session' | 'study_streak' | 'performance_chart' | 'quick_actions';
  title: string;
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
    minWidth: number;
    minHeight: number;
  };
  settings: {
    refreshInterval?: number;
    showDetails?: boolean;
    compactView?: boolean;
    customColors?: {
      primary?: string;
      secondary?: string;
      accent?: string;
    };
  };
  isVisible: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ReviewStats {
  totalCards: number;
  dueToday: number;
  reviewedToday: number;
  averageEaseFactor: number;
  studyStreak: StudyStreak;
}

export interface CreateFlashcardData {
  question: string;
  answer: string;
  subject: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  tags?: string[];
}

export interface SubmitReviewData {
  flashcardId: string;
  responseQuality: number; // 0-5
  timeSpent: number; // seconds
}

export interface CreateWidgetData {
  type: Widget['type'];
  title: string;
  position: Widget['position'];
  settings?: Widget['settings'];
}

export interface OfflineQueueItem {
  _id?: string;
  userId: string;
  action: string;
  data: any;
  timestamp: string;
  retryCount: number;
  maxRetries: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CachedData {
  _id?: string;
  userId: string;
  dataType: 'flashcards' | 'study_sessions' | 'tasks' | 'performance' | 'study_plans';
  data: any;
  lastSync: string;
  version: number;
  isValid: boolean;
  expiresAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

class AdvancedFeaturesService {
  // Flashcard Management
  async getFlashcards(subject?: string, tags?: string[], limit?: number): Promise<Flashcard[]> {
    const params = new URLSearchParams();
    if (subject) params.append('subject', subject);
    if (tags) params.append('tags', tags.join(','));
    if (limit) params.append('limit', limit.toString());

    const response = await api.get(`/api/advanced-features/flashcards?${params}`);
    return response.data;
  }

  async createFlashcard(data: CreateFlashcardData): Promise<Flashcard> {
    const response = await api.post('/api/advanced-features/flashcards', data);
    return response.data;
  }

  async updateFlashcard(id: string, data: Partial<CreateFlashcardData>): Promise<Flashcard> {
    const response = await api.put(`/api/advanced-features/flashcards/${id}`, data);
    return response.data;
  }

  async deleteFlashcard(id: string): Promise<void> {
    await api.delete(`/api/advanced-features/flashcards/${id}`);
  }

  // Spaced Repetition
  async getDueReviews(limit: number = 20): Promise<any[]> {
    const response = await api.get(`/api/advanced-features/reviews/due?limit=${limit}`);
    return response.data;
  }

  async submitReview(data: SubmitReviewData): Promise<ReviewSession> {
    const response = await api.post('/api/advanced-features/reviews/submit', data);
    return response.data;
  }

  async getReviewStats(): Promise<ReviewStats> {
    const response = await api.get('/api/advanced-features/reviews/stats');
    return response.data;
  }

  // SM-2 Algorithm Implementation (Frontend)
  calculateNextReview(
    responseQuality: number,
    previousInterval: number,
    repetitionCount: number,
    easeFactor: number
  ): {
    newInterval: number;
    newEaseFactor: number;
    newRepetitionCount: number;
  } {
    let newInterval: number;
    let newEaseFactor = easeFactor;
    let newRepetitionCount = repetitionCount;

    // Update ease factor based on response quality
    if (responseQuality >= 3) {
      // Correct response
      if (newRepetitionCount === 0) {
        newInterval = 1;
      } else if (newRepetitionCount === 1) {
        newInterval = 6;
      } else {
        newInterval = Math.round(previousInterval * easeFactor);
      }
      newRepetitionCount++;
    } else {
      // Incorrect response
      newRepetitionCount = 0;
      newInterval = 1;
    }

    // Adjust ease factor
    newEaseFactor = easeFactor + (0.1 - (5 - responseQuality) * (0.08 + (5 - responseQuality) * 0.02));
    newEaseFactor = Math.max(1.3, newEaseFactor); // Minimum ease factor

    return {
      newInterval,
      newEaseFactor,
      newRepetitionCount
    };
  }

  // Widget Management
  async getWidgets(): Promise<Widget[]> {
    const response = await api.get('/api/advanced-features/widgets');
    return response.data;
  }

  async createWidget(data: CreateWidgetData): Promise<Widget> {
    const response = await api.post('/api/advanced-features/widgets', data);
    return response.data;
  }

  async updateWidget(id: string, data: Partial<CreateWidgetData>): Promise<Widget> {
    const response = await api.put(`/api/advanced-features/widgets/${id}`, data);
    return response.data;
  }

  async deleteWidget(id: string): Promise<void> {
    await api.delete(`/api/advanced-features/widgets/${id}`);
  }

  // Offline Support
  async addToOfflineQueue(action: string, data: any): Promise<OfflineQueueItem> {
    const response = await api.post('/api/advanced-features/offline/queue', {
      action,
      data
    });
    return response.data;
  }

  async getOfflineQueue(): Promise<OfflineQueueItem[]> {
    const response = await api.get('/api/advanced-features/offline/queue');
    return response.data;
  }

  async processOfflineQueueItem(itemId: string): Promise<{ message: string; item: OfflineQueueItem }> {
    const response = await api.put(`/api/advanced-features/offline/queue/${itemId}/process`);
    return response.data;
  }

  async syncOfflineData(actions: any[]): Promise<{
    message: string;
    results: any[];
    successCount: number;
    totalCount: number;
  }> {
    const response = await api.post('/api/advanced-features/offline/sync', { actions });
    return response.data;
  }

  // Cached Data Management
  async getCachedData(dataType: CachedData['dataType']): Promise<CachedData | null> {
    try {
      const response = await api.get(`/api/advanced-features/cache/${dataType}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  async updateCachedData(
    dataType: CachedData['dataType'],
    data: any,
    expiresAt?: string
  ): Promise<CachedData> {
    const response = await api.put(`/api/advanced-features/cache/${dataType}`, {
      data,
      expiresAt
    });
    return response.data;
  }

  // Study Streak
  async getStudyStreak(): Promise<StudyStreak> {
    const response = await api.get('/api/advanced-features/streak');
    return response.data;
  }

  async updateStudyStreak(studyDate?: string): Promise<StudyStreak> {
    const response = await api.put('/api/advanced-features/streak', { studyDate });
    return response.data;
  }

  // Helper Functions
  getReviewQualityLabel(quality: number): string {
    switch (quality) {
      case 0: return 'Completo blackout';
      case 1: return 'Incorreto, mas lembrou';
      case 2: return 'Incorreto, mas fácil';
      case 3: return 'Correto com dificuldade';
      case 4: return 'Correto após hesitação';
      case 5: return 'Perfeito';
      default: return 'Desconhecido';
    }
  }

  getReviewQualityColor(quality: number): string {
    if (quality >= 4) return 'text-green-600';
    if (quality >= 3) return 'text-yellow-600';
    return 'text-red-600';
  }

  calculateRetentionRate(stats: ReviewStats): number {
    if (stats.totalCards === 0) return 0;
    const retained = stats.totalCards - stats.dueToday;
    return Math.round((retained / stats.totalCards) * 100);
  }

  getNextReviewDate(interval: number): Date {
    const date = new Date();
    date.setDate(date.getDate() + interval);
    return date;
  }

  formatInterval(days: number): string {
    if (days < 1) return 'Hoje';
    if (days === 1) return 'Amanhã';
    if (days < 7) return `${days} dias`;
    if (days < 30) return `${Math.round(days / 7)} semanas`;
    if (days < 365) return `${Math.round(days / 30)} meses`;
    return `${Math.round(days / 365)} anos`;
  }

  // Widget Data Helpers
  async getWidgetData(widgetType: Widget['type']): Promise<any> {
    switch (widgetType) {
      case 'study_progress':
        return this.getStudyProgressData();
      case 'upcoming_reviews':
        return this.getUpcomingReviewsData();
      case 'focus_session':
        return this.getFocusSessionData();
      case 'study_streak':
        return this.getStudyStreakData();
      case 'performance_chart':
        return this.getPerformanceChartData();
      case 'quick_actions':
        return this.getQuickActionsData();
      default:
        return null;
    }
  }

  private async getStudyProgressData(): Promise<any> {
    const stats = await this.getReviewStats();
    return {
      totalCards: stats.totalCards,
      dueToday: stats.dueToday,
      reviewedToday: stats.reviewedToday,
      retentionRate: this.calculateRetentionRate(stats)
    };
  }

  private async getUpcomingReviewsData(): Promise<any> {
    const dueCards = await this.getDueReviews(5);
    return {
      dueCards: dueCards.map(card => ({
        id: card._id,
        question: card.flashcardId?.question || 'Loading...',
        subject: card.flashcardId?.subject || '',
        nextReview: card.nextReviewDate
      }))
    };
  }

  private async getFocusSessionData(): Promise<any> {
    // This would integrate with focus tools service
    return {
      activeSession: null,
      todaySessions: 0,
      totalFocusTime: 0
    };
  }

  private async getStudyStreakData(): Promise<any> {
    const streak = await this.getStudyStreak();
    return {
      currentStreak: streak.currentStreak,
      longestStreak: streak.longestStreak,
      totalStudyDays: streak.totalStudyDays
    };
  }

  private async getPerformanceChartData(): Promise<any> {
    // This would fetch performance data over time
    return {
      labels: [],
      data: []
    };
  }

  private getQuickActionsData(): any {
    return {
      actions: [
        { id: 'new_flashcard', label: 'Novo Flashcard', icon: 'plus' },
        { id: 'start_review', label: 'Iniciar Revisão', icon: 'book-open' },
        { id: 'focus_session', label: 'Sessão de Foco', icon: 'target' },
        { id: 'study_plan', label: 'Plano de Estudos', icon: 'calendar' }
      ]
    };
  }

  // Offline Storage Helpers
  saveToLocalStorage(key: string, data: any): void {
    try {
      localStorage.setItem(`study_app_${key}`, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }

  getFromLocalStorage(key: string): any {
    try {
      const data = localStorage.getItem(`study_app_${key}`);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return null;
    }
  }

  removeFromLocalStorage(key: string): void {
    try {
      localStorage.removeItem(`study_app_${key}`);
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
  }

  // Cache Management
  async cacheData(dataType: CachedData['dataType'], data: any, ttlMinutes: number = 60): Promise<void> {
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + ttlMinutes);

    try {
      await this.updateCachedData(dataType, data, expiresAt.toISOString());
    } catch (error) {
      // Fallback to localStorage if API fails
      this.saveToLocalStorage(`cache_${dataType}`, {
        data,
        expiresAt: expiresAt.toISOString(),
        timestamp: new Date().toISOString()
      });
    }
  }

  async getCachedDataWithFallback(dataType: CachedData['dataType']): Promise<any> {
    try {
      // Try API first
      const cached = await this.getCachedData(dataType);
      if (cached && cached.isValid) {
        return cached.data;
      }
    } catch (error) {
      // Fallback to localStorage
      const localData = this.getFromLocalStorage(`cache_${dataType}`);
      if (localData) {
        const expiresAt = new Date(localData.expiresAt);
        if (expiresAt > new Date()) {
          return localData.data;
        } else {
          // Expired, remove it
          this.removeFromLocalStorage(`cache_${dataType}`);
        }
      }
    }
    return null;
  }
}

export default new AdvancedFeaturesService();
