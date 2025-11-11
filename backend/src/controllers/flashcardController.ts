import { Request, Response } from 'express';
import { PrismaClient, Flashcard as PrismaFlashcard } from '@prisma/client';
import { ApiResponse, PaginatedResponse, FlashcardQuery, Flashcard} from '../types';
import { GamificationService } from '../services/gamificationService';

const prisma = new PrismaClient();

const getUserId = (req: Request): string => req.user!.id;

export const createFlashcard = async (req: Request, res: Response<ApiResponse>) => {
  try {
    const userId = getUserId(req);
    const { question, answer, category, difficulty, tags } = req.body;

    const newFlashcard = await prisma.flashcard.create({
      data: {
      userId,
      question,
      answer,
      category,
      difficulty: difficulty || 'medium',
      tags: tags || []
  }});

    res.status(201).json({
      success: true,
      data: newFlashcard as unknown as Flashcard,
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
    const where: any = { userId };

    if (category) where.category = category;
    if (difficulty) where.difficulty = difficulty;
    if (isActive !== undefined) where.isActive = isActive;
    if (readyForReview) {
      where.$or = [
        { nextReview: null },
        { nextReview: { lte: new Date() } }
      ];
    }

    const [flashcards, total] = await prisma.$transaction([
      prisma.flashcard.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.flashcard.count({ where })
    ]);

    const result: PaginatedResponse<Flashcard> = {
      data: flashcards as unknown as Flashcard[],
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
    const userId = getUserId(req);
    const { flashcardId } = req.params;

    const flashcard = await prisma.flashcard.findFirst({ where:{id: flashcardId as string, userId }});

    if (!flashcard) {
      return res.status(404).json({
        success: false,
        message: 'Flashcard não encontrado'
      });
    }

    res.json({
      success: true,
      data: flashcard as unknown as Flashcard,
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
    const userId = getUserId(req);
    const { flashcardId } = req.params;
    const { question, answer, category, difficulty, tags, isActive } = req.body;

    const flashcard = await prisma.flashcard.findFirst({ where:{id: flashcardId as string, userId }});

    if (!flashcard) {
      return res.status(404).json({
        success: false,
        message: 'Flashcard não encontrado'
      });
    }
   const updateData: Partial<PrismaFlashcard> = {}
    if (question !== undefined) updateData.question = question;
    if (answer !== undefined) updateData.answer = answer;
    if (category !== undefined) updateData.category = category;
    if (difficulty !== undefined) updateData.difficulty = difficulty;
    if (tags !== undefined) updateData.tags = tags;
    if (isActive !== undefined) updateData.isActive = isActive;

    const updatedFlashcard = await prisma.flashcard.update({
      where: { id: flashcardId as string, userId },
      data: updateData
    });

    res.json({
      success: true,
      data: updatedFlashcard as unknown as Flashcard,
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
    const userId = getUserId(req);
    const { flashcardId } = req.params;

    const flashcard = await prisma.flashcard.delete({ where: {id: flashcardId as string, userId }});

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
    const userId = getUserId(req);
    const { flashcardId } = req.params;
    const { wasCorrect } = req.body;

    if (typeof wasCorrect !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'wasCorrect deve ser true ou false'
      });
    }

    const flashcard = await prisma.flashcard.findFirst({where: {id: flashcardId as string, userId }});

    if (!flashcard) {
      return res.status(404).json({
        success: false,
        message: 'Flashcard não encontrado'
      });
    }


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

    const existingFlashcard = await prisma.flashcard.findFirst({ where:{id: flashcardId as string, userId }});

    if (!existingFlashcard) {
      return res.status(404).json({
          success: false,
          message: 'Flashcard não encontrado',
      });
  }
  const resetData = {
      nextReview: null, 
      reviewCount: 0,
      interval: 0,
      easinessFactor: 2.5,
  };

  const updatedFlashcard = await prisma.flashcard.update({
      where: { id: flashcardId as string },
      data: resetData
  });

    res.json({
      success: true,
      data: updatedFlashcard as unknown as Flashcard,
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
      prisma.flashcard.count({ where:{userId} }),
      prisma.flashcard.count({ where:{userId, isActive: true} }),
      prisma.flashcard.count({
        where:{
        userId,
        OR: [
          { nextReview: null },
          { nextReview: { lte: new Date() } }
        ]
  }}),
      prisma.flashcard.groupBy({
        by: ['difficulty'],
        where: { userId },
        _count: { id: true },
  }),
  prisma.flashcard.groupBy({
    by: ['category'],
    where: { userId },
    _count: { id: true },
  }),
]);

    const stats = {
      total,
      active,
      readyForReview,
      byDifficulty: byDifficulty.reduce((acc, item) => {
        acc[item.difficulty] = item._count.id;
        return acc;
      }, {} as Record<string, number>),
      byCategory: byCategory.reduce((acc, item) => {
        acc[item.category] = item._count.id;
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