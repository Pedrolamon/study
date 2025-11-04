import { Request, Response } from 'express';

import { ApiResponse, PaginatedResponse, FlashcardQuery, Flashcard} from '../types';
import { GamificationService } from '../services/gamificationService';

export const createFlashcard = async (req: Request, res: Response<ApiResponse>) => {
  try {
    const userId = req.user!.id;
    const { question, answer, category, difficulty, tags } = req.body;

    const flashcard = new FlashcardModel({
      userId,
      question,
      answer,
      category,
      difficulty: difficulty || 'medium',
      tags: tags || []
    });

    await flashcard.save();

    res.status(201).json({
      success: true,
      data: flashcard,
      message: 'Flashcard criado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao criar flashcard:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

export const getFlashcards = async (req: Request<{}, {}, {}, FlashcardQuery>, res: Response<ApiResponse>) => {
  try {
    const userId = req.user!.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const category = req.query.category as string;
    const difficulty = req.query.difficulty as string;
    const isActive = req.query.isActive !== undefined ? req.query.isActive === 'true' : undefined;
    const readyForReview = req.query.readyForReview === 'true';

    const skip = (page - 1) * limit;
    const query: any = { userId };

    if (category) query.category = category;
    if (difficulty) query.difficulty = difficulty;
    if (isActive !== undefined) query.isActive = isActive;
    if (readyForReview) {
      query.$or = [
        { nextReview: { $exists: false } },
        { nextReview: { $lte: new Date() } }
      ];
    }

    const [flashcards, total] = await Promise.all([
      FlashcardModel.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      FlashcardModel.countDocuments(query)
    ]);

    const result: PaginatedResponse<Flashcard> = {
      data: flashcards,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };

    res.json({
      success: true,
      data: result,
      message: 'Flashcards recuperados com sucesso'
    });
  } catch (error) {
    console.error('Erro ao buscar flashcards:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

export const getFlashcardById = async (req: Request, res: Response<ApiResponse>) => {
  try {
    const userId = req.user!.id;
    const { flashcardId } = req.params;

    const flashcard = await FlashcardModel.findOne({ _id: flashcardId, userId });

    if (!flashcard) {
      return res.status(404).json({
        success: false,
        message: 'Flashcard não encontrado'
      });
    }

    res.json({
      success: true,
      data: flashcard,
      message: 'Flashcard recuperado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao buscar flashcard:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
  return;
};

export const updateFlashcard = async (req: Request, res: Response<ApiResponse>) => {
  try {
    const userId = req.user!.id;
    const { flashcardId } = req.params;
    const { question, answer, category, difficulty, tags, isActive } = req.body;

    const flashcard = await FlashcardModel.findOne({ _id: flashcardId, userId });

    if (!flashcard) {
      return res.status(404).json({
        success: false,
        message: 'Flashcard não encontrado'
      });
    }

    if (question !== undefined) flashcard.question = question;
    if (answer !== undefined) flashcard.answer = answer;
    if (category !== undefined) flashcard.category = category;
    if (difficulty !== undefined) flashcard.difficulty = difficulty;
    if (tags !== undefined) flashcard.tags = tags;
    if (isActive !== undefined) flashcard.isActive = isActive;

    await flashcard.save();

    res.json({
      success: true,
      data: flashcard,
      message: 'Flashcard atualizado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao atualizar flashcard:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
  return;
};

export const deleteFlashcard = async (req: Request, res: Response<ApiResponse>) => {
  try {
    const userId = req.user!.id;
    const { flashcardId } = req.params;

    const flashcard = await FlashcardModel.findOneAndDelete({ _id: flashcardId, userId });

    if (!flashcard) {
      return res.status(404).json({
        success: false,
        message: 'Flashcard não encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Flashcard deletado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao deletar flashcard:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
  return;
};

export const reviewFlashcard = async (req: Request, res: Response<ApiResponse>) => {
  try {
    const userId = req.user!.id;
    const { flashcardId } = req.params;
    const { wasCorrect } = req.body;

    if (typeof wasCorrect !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'wasCorrect deve ser true ou false'
      });
    }

    const flashcard = await FlashcardModel.findOne({ _id: flashcardId, userId });

    if (!flashcard) {
      return res.status(404).json({
        success: false,
        message: 'Flashcard não encontrado'
      });
    }

    flashcard.calculateNextReview(wasCorrect);
    await flashcard.save();

    // Award points for flashcard review
    await GamificationService.awardFlashcardPoints(userId, flashcard);

    res.json({
      success: true,
      data: flashcard,
      message: 'Flashcard revisado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao revisar flashcard:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
  return;
};

export const resetFlashcardReview = async (req: Request, res: Response<ApiResponse>) => {
  try {
    const userId = req.user!.id;
    const { flashcardId } = req.params;

    const flashcard = await FlashcardModel.findOne({ _id: flashcardId, userId });

    if (!flashcard) {
      return res.status(404).json({
        success: false,
        message: 'Flashcard não encontrado'
      });
    }

    flashcard.resetReview();
    await flashcard.save();

    res.json({
      success: true,
      data: flashcard,
      message: 'Revisão do flashcard resetada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao resetar revisão do flashcard:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
  return;
};

export const getFlashcardStats = async (req: Request, res: Response<ApiResponse>) => {
  try {
    const userId = req.user!.id;

    const [total, active, readyForReview, byDifficulty, byCategory] = await Promise.all([
      FlashcardModel.countDocuments({ userId }),
      FlashcardModel.countDocuments({ userId, isActive: true }),
      FlashcardModel.countDocuments({
        userId,
        $or: [
          { nextReview: { $exists: false } },
          { nextReview: { $lte: new Date() } }
        ]
      }),
      FlashcardModel.aggregate([
        { $match: { userId: userId } },
        { $group: { _id: '$difficulty', count: { $sum: 1 } } }
      ]),
      FlashcardModel.aggregate([
        { $match: { userId: userId } },
        { $group: { _id: '$category', count: { $sum: 1 } } }
      ])
    ]);

    const stats = {
      total,
      active,
      readyForReview,
      byDifficulty: byDifficulty.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {} as Record<string, number>),
      byCategory: byCategory.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {} as Record<string, number>)
    };

    res.json({
      success: true,
      data: stats,
      message: 'Estatísticas de flashcards recuperadas'
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas de flashcards:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};