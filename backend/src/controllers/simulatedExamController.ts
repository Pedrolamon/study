import { Request, Response } from 'express';
import { SimulatedExamModel } from '../models';

interface AuthRequest extends Request {
  user?: any;
}

export const getExams = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { subject } = req.query;

    let whereClause: any = { userId };
    if (subject) {
      whereClause.subject = subject;
    }

    const exams = await SimulatedExamModel.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    res.json(exams);
  } catch (error) {
    console.error('Erro ao buscar simulados:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

export const getExam = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const exam = await SimulatedExamModel.findFirst({
      where: { id, userId },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    if (!exam) {
      return res.status(404).json({ message: 'Simulado não encontrado' });
    }

    res.json(exam);
  } catch (error) {
    console.error('Erro ao buscar simulado:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

export const createExam = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { name, date, subject, correctAnswers, totalQuestions, duration } = req.body;

    // Validate required fields
    if (!name || !date || !subject || correctAnswers === undefined || totalQuestions === undefined) {
      return res.status(400).json({ message: 'Campos obrigatórios não preenchidos' });
    }

    const examData = {
      name,
      date,
      subject,
      correctAnswers,
      totalQuestions,
      duration,
      userId
    };

    const exam = await SimulatedExamModel.create({
      data: examData
    });

    res.status(201).json(exam);
  } catch (error) {
    console.error('Erro ao criar simulado:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

export const updateExam = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const updates = req.body;

    // Remove fields that shouldn't be updated
    delete updates.id;
    delete updates.userId;
    delete updates.createdAt;

    const exam = await SimulatedExamModel.updateMany({
      where: { id, userId },
      data: updates
    });

    if (exam.count === 0) {
      return res.status(404).json({ message: 'Simulado não encontrado' });
    }

    const updatedExam = await SimulatedExamModel.findUnique({
      where: { id }
    });

    res.json(updatedExam);
  } catch (error) {
    console.error('Erro ao atualizar simulado:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

export const deleteExam = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const exam = await SimulatedExamModel.deleteMany({
      where: { id, userId }
    });

    if (exam.count === 0) {
      return res.status(404).json({ message: 'Simulado não encontrado' });
    }

    res.json({ message: 'Simulado excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir simulado:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

export const getExamStats = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    const results = await SimulatedExamModel.findMany({
      where: { userId }
    });

    if (results.length === 0) {
      return res.json({
        totalExams: 0,
        averageScore: 0,
        bestScore: 0,
        subjects: []
      });
    }

    const totalExams = results.length;
    const averageScore = Math.round(
      results.reduce((sum, r) => sum + (r.correctAnswers / r.totalQuestions * 100), 0) / results.length
    );
    const bestScore = Math.max(
      ...results.map(r => Math.round(r.correctAnswers / r.totalQuestions * 100))
    );

    // Group by subject
    const subjectStats = results.reduce((acc: any, exam) => {
      if (!acc[exam.subject]) {
        acc[exam.subject] = {
          count: 0,
          totalScore: 0
        };
      }
      acc[exam.subject].count++;
      acc[exam.subject].totalScore += exam.correctAnswers / exam.totalQuestions * 100;
      return acc;
    }, {});

    const subjects = Object.entries(subjectStats).map(([name, stats]: [string, any]) => ({
      name,
      count: stats.count,
      averageScore: Math.round(stats.totalScore / stats.count)
    }));

    res.json({
      totalExams,
      averageScore,
      bestScore,
      subjects
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

export const getExamsBySubject = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { subject } = req.params;

    const exams = await SimulatedExamModel.findMany({
      where: { userId, subject },
      orderBy: { createdAt: 'desc' }
    });

    res.json(exams);
  } catch (error) {
    console.error('Erro ao buscar simulados por disciplina:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};