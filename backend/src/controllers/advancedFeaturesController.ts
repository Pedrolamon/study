import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

interface AuthRequest extends Request {
  user?: any;
}

const prisma = new PrismaClient();

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

  static async getDueCards(userId: string, limit: number = 20) {
    const now = new Date();
    return await prisma.spacedRepetition.findMany({
      where: {
        userId,
        nextReview: { lte: now }
      },
      include: {
        flashcard: true
      },
      orderBy: { nextReview: 'asc' },
      take: limit
    });
  }

  static async getReviewStats(userId: string) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const [totalCardsCount, dueToday, reviewedToday, avgEase] = await Promise.all([
      prisma.flashcard.count({ where: { userId } }),
      prisma.spacedRepetition.count({
        where: {
          userId,
          nextReview: { lte: now }
        }
      }),
      prisma.spacedRepetition.count({
        where: {
          userId,
          lastReviewed: { gte: today }
        }
      }),
      prisma.spacedRepetition.aggregate({
        where: { userId },
        _avg: { easeFactor: true }
      }).then(result => result._avg.easeFactor || 2.5)
    ]);

    return {
      totalCards: totalCardsCount,
      dueToday,
      reviewedToday,
      averageEaseFactor: avgEase
    };
  }
}

// Flashcard Management
export const getFlashcards = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { category, tags, limit = 50 } = req.query;

    let whereClause: any = { userId };
    if (category) whereClause.category = category;
    if (tags) whereClause.tags = { has: (tags as string).split(',') };

    const flashcards = await prisma.flashcard.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: Number(limit)
    });

    res.json(flashcards);
  } catch (error) {
    console.error('Erro ao buscar flashcards:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

export const createFlashcard = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { question, answer, category, difficulty, tags } = req.body;

    const flashcard = await prisma.flashcard.create({
      data: {
        userId,
        question,
        answer,
        category,
        difficulty: difficulty || 'MEDIUM',
        tags: tags || []
      }
    });

    // Create initial spaced repetition entry
    await prisma.spacedRepetition.create({
      data: {
        userId,
        flashcardId: flashcard.id,
        interval: 1,
        repetitions: 0,
        easeFactor: 2.5,
        nextReview: new Date()
      }
    });

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

    if (!id || !userId) {
      return res.status(400).json({ message: 'ID ou usuário inválido' });
    }

    const flashcard = await prisma.flashcard.updateMany({
      where: { id, userId },
      data: updates
    });

    if (flashcard.count === 0) {
      return res.status(404).json({ message: 'Flashcard não encontrado' });
    }

    const updatedFlashcard = await prisma.flashcard.findUnique({
      where: { id }
    });

    res.json(updatedFlashcard);
  } catch (error) {
    console.error('Erro ao atualizar flashcard:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

export const deleteFlashcard = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!id || !userId) {
      return res.status(400).json({ message: 'ID ou usuário inválido' });
    }

    const flashcard = await prisma.flashcard.deleteMany({
      where: { id, userId }
    });

    if (flashcard.count === 0) {
      return res.status(404).json({ message: 'Flashcard não encontrado' });
    }

    // Delete associated spaced repetition entries
    await prisma.spacedRepetition.deleteMany({
      where: { flashcardId: id, userId }
    });

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

    const currentReview = await prisma.spacedRepetition.findFirst({
      where: {
        userId,
        flashcardId
      },
      orderBy: { lastReviewed: 'desc' }
    });

    if (!currentReview) {
      return res.status(404).json({ message: 'Sessão de revisão não encontrada' });
    }

    // Calculate new interval using SM-2 algorithm
    const { newInterval, newEaseFactor, newRepetitionCount } = SpacedRepetitionAlgorithm.calculateNextReview(
      responseQuality,
      currentReview.interval,
      currentReview.repetitions,
      currentReview.easeFactor
    );

    // Update review session
    const nextReviewDate = new Date();
    nextReviewDate.setDate(nextReviewDate.getDate() + newInterval);

    const updatedReview = await prisma.spacedRepetition.update({
      where: { id: currentReview.id },
      data: {
        interval: newInterval,
        repetitions: newRepetitionCount,
        easeFactor: newEaseFactor,
        nextReview: nextReviewDate,
        lastReviewed: new Date()
      }
    });

    res.json(updatedReview);
  } catch (error) {
    console.error('Erro ao submeter revisão:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

export const getReviewStats = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    const stats = await SpacedRepetitionAlgorithm.getReviewStats(userId);

    res.json(stats);
  } catch (error) {
    console.error('Erro ao buscar estatísticas de revisão:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};