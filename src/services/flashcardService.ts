import api from './api';

export interface Flashcard {
  _id?: string;
  userId: string;
  front: string;
  back: string;
  subject: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags?: string[];
  nextReview?: string;
  reviewCount: number;
  correctCount: number;
  easeFactor: number;
  interval: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateFlashcardData {
  front: string;
  back: string;
  subject: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  tags?: string[];
}

export interface ReviewData {
  flashcardId: string;
  isCorrect: boolean;
  timeSpent?: number;
}

class FlashcardService {
  // Get all flashcards for the user
  async getFlashcards(subject?: string, tags?: string[]): Promise<Flashcard[]> {
    const params = new URLSearchParams();
    if (subject) params.append('subject', subject);
    if (tags && tags.length > 0) params.append('tags', tags.join(','));

    const response = await api.get(`/api/advanced-features/flashcards?${params}`);
    return response.data;
  }

  // Create a new flashcard
  async createFlashcard(data: CreateFlashcardData): Promise<Flashcard> {
    const response = await api.post('/api/advanced-features/flashcards', data);
    return response.data;
  }

  // Update an existing flashcard
  async updateFlashcard(id: string, data: Partial<CreateFlashcardData>): Promise<Flashcard> {
    const response = await api.put(`/api/advanced-features/flashcards/${id}`, data);
    return response.data;
  }

  // Delete a flashcard
  async deleteFlashcard(id: string): Promise<void> {
    await api.delete(`/api/advanced-features/flashcards/${id}`);
  }

  // Review a flashcard (old method - keeping for compatibility)
  async reviewFlashcard(id: string, isCorrect: boolean): Promise<Flashcard> {
    const response = await api.post('/api/advanced-features/reviews/submit', {
      flashcardId: id,
      responseQuality: isCorrect ? 4 : 1, // Convert boolean to SM-2 quality
      timeSpent: 5000 // Default 5 seconds
    });
    return response.data;
  }

  // Get flashcards due for review
  async getDueReviews(limit: number = 20): Promise<Flashcard[]> {
    const response = await api.get(`/api/advanced-features/reviews/due?limit=${limit}`);
    return response.data;
  }

  // Submit a review with SM-2 algorithm
  async submitReview(data: { flashcardId: string; responseQuality: number; timeSpent: number }): Promise<any> {
    const response = await api.post('/api/advanced-features/reviews/submit', data);
    return response.data;
  }

  // Get review statistics
  async getReviewStats(): Promise<{
    totalCards: number;
    dueToday: number;
    reviewedToday: number;
    averageEaseFactor: number;
    studyStreak: any;
  }> {
    const response = await api.get('/api/advanced-features/reviews/stats');
    return response.data;
  }

  // Helper functions
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

  calculateRetentionRate(cards: Flashcard[]): number {
    if (cards.length === 0) return 0;
    const reviewedCards = cards.filter(card => card.reviewCount > 0);
    if (reviewedCards.length === 0) return 0;

    const totalCorrect = reviewedCards.reduce((sum, card) => sum + card.correctCount, 0);
    const totalReviews = reviewedCards.reduce((sum, card) => sum + card.reviewCount, 0);

    return Math.round((totalCorrect / totalReviews) * 100);
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

  getDifficultyColor(difficulty: string): string {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  getDifficultyText(difficulty: string): string {
    switch (difficulty) {
      case 'easy': return 'Fácil';
      case 'medium': return 'Médio';
      case 'hard': return 'Difícil';
      default: return difficulty;
    }
  }

  // SM-2 Algorithm implementation (for frontend calculations)
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

  // Get cards by subject
  async getCardsBySubject(subject: string): Promise<Flashcard[]> {
    return this.getFlashcards(subject);
  }

  // Get cards by difficulty
  async getCardsByDifficulty(difficulty: 'easy' | 'medium' | 'hard'): Promise<Flashcard[]> {
    const allCards = await this.getFlashcards();
    return allCards.filter(card => card.difficulty === difficulty);
  }

  // Search flashcards
  async searchFlashcards(query: string): Promise<Flashcard[]> {
    const allCards = await this.getFlashcards();
    const lowerQuery = query.toLowerCase();

    return allCards.filter(card =>
      card.front.toLowerCase().includes(lowerQuery) ||
      card.back.toLowerCase().includes(lowerQuery) ||
      card.subject.toLowerCase().includes(lowerQuery) ||
      (card.tags && card.tags.some(tag => tag.toLowerCase().includes(lowerQuery)))
    );
  }

  // Get learning progress
  async getLearningProgress(): Promise<{
    totalCards: number;
    learnedCards: number;
    dueCards: number;
    retentionRate: number;
    averageEaseFactor: number;
  }> {
    const [allCards, stats] = await Promise.all([
      this.getFlashcards(),
      this.getReviewStats()
    ]);

    const learnedCards = allCards.filter(card => card.reviewCount > 0).length;
    const dueCards = allCards.filter(card => {
      if (!card.nextReview) return true;
      return new Date(card.nextReview) <= new Date();
    }).length;

    return {
      totalCards: allCards.length,
      learnedCards,
      dueCards,
      retentionRate: this.calculateRetentionRate(allCards),
      averageEaseFactor: stats.averageEaseFactor
    };
  }
}

export default new FlashcardService();
