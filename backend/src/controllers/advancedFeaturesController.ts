import { Request, Response } from 'express';
import {
  FlashcardModel,
  ReviewSessionModel,
  StudyStreakModel,
  WidgetModel,
  OfflineQueueModel,
  CachedDataModel
} from '../models/SpacedRepetition';
import type {
  Flashcard,
  ReviewSession,
  StudyStreak,
  Widget,
  OfflineQueue,
  CachedData
} from '../models/SpacedRepetition';

interface AuthRequest extends Request {
  user?: any;
}

// SM-2 Spaced Repetition Algorithm Implementation
class SpacedRepetitionAlgorithm {
  static calculateNextReview(
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

  static getDueCards(userId: string, limit: number = 20): Promise<any[]> {
    const now = new Date();
    return ReviewSessionModel.find({
      userId,
      nextReviewDate: { $lte: now }
    })
    .populate('flashcardId')
    .sort({ nextReviewDate: 1 })
    .limit(limit)
    .lean();
  }

  static getReviewStats(userId: string): Promise<any> {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    return Promise.all([
      // Total flashcards
      FlashcardModel.countDocuments({ userId }),

      // Due today
      ReviewSessionModel.countDocuments({
        userId,
        nextReviewDate: { $lte: now }
      }),

      // Reviewed today
      ReviewSessionModel.countDocuments({
        userId,
        lastReviewed: { $gte: today }
      }),

      // Average ease factor
      ReviewSessionModel.aggregate([
        { $match: { userId } },
        { $group: { _id: null, avgEase: { $avg: '$easeFactor' } } }
      ])
    ]);
  }
}

// Study Streak Management
class StudyStreakManager {
  static async updateStreak(userId: string, studyDate: Date = new Date()): Promise<StudyStreak> {
    const today = new Date(studyDate.getFullYear(), studyDate.getMonth(), studyDate.getDate());

    let streak = await StudyStreakModel.findOne({ userId });

    if (!streak) {
      streak = new StudyStreakModel({
        userId,
        currentStreak: 1,
        longestStreak: 1,
        lastStudyDate: today,
        totalStudyDays: 1,
        studyDaysThisWeek: 1,
        studyDaysThisMonth: 1
      });
    } else {
      const lastStudy = new Date(streak.lastStudyDate);
      const daysDiff = Math.floor((today.getTime() - lastStudy.getTime()) / (1000 * 60 * 60 * 24));

      if (daysDiff === 1) {
        // Consecutive day
        streak.currentStreak++;
        streak.longestStreak = Math.max(streak.longestStreak, streak.currentStreak);
      } else if (daysDiff > 1) {
        // Streak broken
        streak.currentStreak = 1;
      }
      // If daysDiff === 0, already studied today, no change

      streak.lastStudyDate = today;
      streak.totalStudyDays++;

      // Update weekly/monthly counters
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay());
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

      streak.studyDaysThisWeek = await this.countStudyDaysInRange(userId, weekStart, today);
      streak.studyDaysThisMonth = await this.countStudyDaysInRange(userId, monthStart, today);
    }

    await streak.save();
    return streak;
  }

  private static async countStudyDaysInRange(userId: string, startDate: Date, endDate: Date): Promise<number> {
    const streaks = await StudyStreakModel.find({
      userId,
      lastStudyDate: { $gte: startDate, $lte: endDate }
    });

    return streaks.length;
  }
}

// Flashcard Management
export const getFlashcards = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { subject, tags, limit = 50 } = req.query;

    let query: any = { userId };
    if (subject) query.subject = subject;
    if (tags) query.tags = { $in: (tags as string).split(',') };

    const flashcards = await FlashcardModel.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit));

    res.json(flashcards);
  } catch (error) {
    console.error('Erro ao buscar flashcards:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

export const createFlashcard = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { question, answer, subject, difficulty, tags } = req.body;

    const flashcard = new FlashcardModel({
      userId,
      question,
      answer,
      subject,
      difficulty: difficulty || 'medium',
      tags: tags || []
    });

    await flashcard.save();

    // Create initial review session
    const reviewSession = new ReviewSessionModel({
      userId,
      flashcardId: flashcard._id,
      responseQuality: 3, // New card
      timeSpent: 0,
      previousInterval: 0,
      newInterval: 1,
      nextReviewDate: new Date(),
      easeFactor: 2.5,
      repetitionCount: 0,
      lastReviewed: new Date()
    });

    await reviewSession.save();

    res.status(201).json(flashcard);
  } catch (error) {
    console.error('Erro ao criar flashcard:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

export const updateFlashcard = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const updates = req.body;

    const flashcard = await FlashcardModel.findOneAndUpdate(
      { _id: id, userId },
      updates,
      { new: true }
    );

    if (!flashcard) {
      return res.status(404).json({ message: 'Flashcard não encontrado' });
    }

    res.json(flashcard);
  } catch (error) {
    console.error('Erro ao atualizar flashcard:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

export const deleteFlashcard = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const flashcard = await FlashcardModel.findOneAndDelete({ _id: id, userId });

    if (!flashcard) {
      return res.status(404).json({ message: 'Flashcard não encontrado' });
    }

    // Delete associated review sessions
    await ReviewSessionModel.deleteMany({ flashcardId: id, userId });

    res.json({ message: 'Flashcard excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir flashcard:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

// Spaced Repetition Review
export const getDueReviews = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { limit = 20 } = req.query;

    const dueCards = await SpacedRepetitionAlgorithm.getDueCards(userId, Number(limit));

    res.json(dueCards);
  } catch (error) {
    console.error('Erro ao buscar revisões pendentes:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

export const submitReview = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { flashcardId, responseQuality, timeSpent } = req.body;

    // Get current review session
    const currentReview = await ReviewSessionModel.findOne({
      userId,
      flashcardId
    }).sort({ lastReviewed: -1 });

    if (!currentReview) {
      return res.status(404).json({ message: 'Sessão de revisão não encontrada' });
    }

    // Calculate new interval using SM-2 algorithm
    const { newInterval, newEaseFactor, newRepetitionCount } = SpacedRepetitionAlgorithm.calculateNextReview(
      responseQuality,
      currentReview.newInterval,
      currentReview.repetitionCount,
      currentReview.easeFactor
    );

    // Update review session
    const nextReviewDate = new Date();
    nextReviewDate.setDate(nextReviewDate.getDate() + newInterval);

    const updatedReview = await ReviewSessionModel.findByIdAndUpdate(
      currentReview._id,
      {
        responseQuality,
        timeSpent,
        previousInterval: currentReview.newInterval,
        newInterval,
        nextReviewDate,
        easeFactor: newEaseFactor,
        repetitionCount: newRepetitionCount,
        lastReviewed: new Date()
      },
      { new: true }
    );

    // Update study streak
    await StudyStreakManager.updateStreak(userId);

    res.json(updatedReview);
  } catch (error) {
    console.error('Erro ao submeter revisão:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

export const getReviewStats = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    const [totalCards, dueToday, reviewedToday, easeStats] = await SpacedRepetitionAlgorithm.getReviewStats(userId);

    const stats = {
      totalCards,
      dueToday,
      reviewedToday,
      averageEaseFactor: easeStats[0]?.avgEase || 2.5,
      studyStreak: await StudyStreakModel.findOne({ userId }) || {
        currentStreak: 0,
        longestStreak: 0,
        totalStudyDays: 0
      }
    };

    res.json(stats);
  } catch (error) {
    console.error('Erro ao buscar estatísticas de revisão:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

// Widget Management
export const getWidgets = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    const widgets = await WidgetModel.find({ userId, isVisible: true })
      .sort({ 'position.y': 1, 'position.x': 1 });

    res.json(widgets);
  } catch (error) {
    console.error('Erro ao buscar widgets:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

export const createWidget = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { type, title, position, settings } = req.body;

    const widget = new WidgetModel({
      userId,
      type,
      title,
      position,
      settings: settings || {},
      isVisible: true
    });

    await widget.save();

    res.status(201).json(widget);
  } catch (error) {
    console.error('Erro ao criar widget:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

export const updateWidget = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const updates = req.body;

    const widget = await WidgetModel.findOneAndUpdate(
      { _id: id, userId },
      updates,
      { new: true }
    );

    if (!widget) {
      return res.status(404).json({ message: 'Widget não encontrado' });
    }

    res.json(widget);
  } catch (error) {
    console.error('Erro ao atualizar widget:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

export const deleteWidget = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const widget = await WidgetModel.findOneAndDelete({ _id: id, userId });

    if (!widget) {
      return res.status(404).json({ message: 'Widget não encontrado' });
    }

    res.json({ message: 'Widget excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir widget:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

// Offline Queue Management
export const addToOfflineQueue = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { action, data } = req.body;

    const queueItem = new OfflineQueueModel({
      userId,
      action,
      data,
      status: 'pending'
    });

    await queueItem.save();

    res.status(201).json(queueItem);
  } catch (error) {
    console.error('Erro ao adicionar à fila offline:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

export const getOfflineQueue = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    const queue = await OfflineQueueModel.find({
      userId,
      status: { $in: ['pending', 'failed'] }
    }).sort({ timestamp: 1 });

    res.json(queue);
  } catch (error) {
    console.error('Erro ao buscar fila offline:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

export const processOfflineQueue = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { itemId } = req.params;

    const item = await OfflineQueueModel.findOne({ _id: itemId, userId });

    if (!item) {
      return res.status(404).json({ message: 'Item da fila não encontrado' });
    }

    // Mark as processing
    item.status = 'processing';
    await item.save();

    try {
      // Process the action (this would be more complex in real implementation)
      // For now, just mark as completed
      item.status = 'completed';
      await item.save();

      res.json({ message: 'Item processado com sucesso', item });
    } catch (processError) {
      item.status = 'failed';
      item.error = (processError as Error).message;
      item.retryCount++;
      await item.save();

      res.status(500).json({ message: 'Erro ao processar item', error: item.error });
    }
  } catch (error) {
    console.error('Erro ao processar fila offline:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

// Cached Data Management
export const getCachedData = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { dataType } = req.params;

    const cached = await CachedDataModel.findOne({
      userId,
      dataType,
      isValid: true
    }).sort({ version: -1 });

    if (!cached) {
      return res.status(404).json({ message: 'Dados em cache não encontrados' });
    }

    res.json(cached);
  } catch (error) {
    console.error('Erro ao buscar dados em cache:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

export const updateCachedData = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { dataType } = req.params;
    const { data, expiresAt } = req.body;

    // Invalidate old cache
    await CachedDataModel.updateMany(
      { userId, dataType },
      { isValid: false }
    );

    // Create new cache entry
    const cached = new CachedDataModel({
      userId,
      dataType,
      data,
      lastSync: new Date(),
      version: Date.now(),
      isValid: true,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined
    });

    await cached.save();

    res.status(201).json(cached);
  } catch (error) {
    console.error('Erro ao atualizar cache:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

export const syncOfflineData = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { actions } = req.body;

    const results = [];

    for (const action of actions) {
      try {
        // Process each offline action
        // This would be more complex in a real implementation
        results.push({
          action: action.type,
          success: true,
          data: action.data
        });
      } catch (actionError) {
        results.push({
          action: action.type,
          success: false,
          error: (actionError as Error).message
        });
      }
    }

    res.json({
      message: 'Sincronização concluída',
      results,
      successCount: results.filter(r => r.success).length,
      totalCount: results.length
    });
  } catch (error) {
    console.error('Erro na sincronização offline:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

// Study Streak
export const getStudyStreak = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    let streak = await StudyStreakModel.findOne({ userId });

    if (!streak) {
      streak = await StudyStreakManager.updateStreak(userId);
    }

    res.json(streak);
  } catch (error) {
    console.error('Erro ao buscar sequência de estudo:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

export const updateStudyStreak = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { studyDate } = req.body;

    const streak = await StudyStreakManager.updateStreak(
      userId,
      studyDate ? new Date(studyDate) : new Date()
    );

    res.json(streak);
  } catch (error) {
    console.error('Erro ao atualizar sequência de estudo:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};
