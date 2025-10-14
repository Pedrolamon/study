import { Request, Response } from 'express';
import { SimulatedExamModel, ExamResultModel, QuestionModel } from '../models/SimulatedExam';
import { UserModel } from '../models/User';

interface AuthRequest extends Request {
  user?: any;
}

export const getExams = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { subject } = req.query;

    let query: any = { userId };
    if (subject) {
      query.subject = subject;
    }

    const exams = await SimulatedExamModel.find(query)
      .sort({ createdAt: -1 })
      .populate('userId', 'name email');

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

    const exam = await SimulatedExamModel.findOne({ _id: id, userId })
      .populate('userId', 'name email');

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
    const { title, description, subject, duration, passingScore, questions } = req.body;

    // Validate required fields
    if (!title || !subject || !duration || passingScore === undefined) {
      return res.status(400).json({ message: 'Campos obrigatórios não preenchidos' });
    }

    // Validate questions if provided
    if (questions && questions.length > 0) {
      for (const question of questions) {
        if (!question.text || !question.options || question.correctAnswer === undefined) {
          return res.status(400).json({ message: 'Questão inválida: texto, opções e resposta correta são obrigatórios' });
        }
        if (question.correctAnswer < 0 || question.correctAnswer >= question.options.length) {
          return res.status(400).json({ message: 'Resposta correta inválida' });
        }
      }
    }

    const examData = {
      title,
      description,
      subject,
      questions: questions || [],
      duration,
      totalQuestions: questions ? questions.length : 0,
      passingScore,
      userId
    };

    const exam = new SimulatedExamModel(examData);
    await exam.save();

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
    delete updates._id;
    delete updates.userId;
    delete updates.createdAt;

    const exam = await SimulatedExamModel.findOneAndUpdate(
      { _id: id, userId },
      updates,
      { new: true, runValidators: true }
    );

    if (!exam) {
      return res.status(404).json({ message: 'Simulado não encontrado' });
    }

    res.json(exam);
  } catch (error) {
    console.error('Erro ao atualizar simulado:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

export const deleteExam = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const exam = await SimulatedExamModel.findOneAndDelete({ _id: id, userId });

    if (!exam) {
      return res.status(404).json({ message: 'Simulado não encontrado' });
    }

    // Delete associated results
    await ExamResultModel.deleteMany({ examId: id });

    res.json({ message: 'Simulado excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir simulado:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

export const submitExamResult = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const { answers, timeSpent } = req.body;

    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ message: 'Respostas são obrigatórias' });
    }

    // Get the exam
    const exam = await SimulatedExamModel.findById(id);
    if (!exam) {
      return res.status(404).json({ message: 'Simulado não encontrado' });
    }

    // Calculate score
    let correctAnswers = 0;
    const validatedAnswers = [];

    for (const answer of answers) {
      const question = exam.questions.find(q => q._id?.toString() === answer.questionId);
      if (question) {
        const isCorrect = question.correctAnswer === answer.selectedAnswer;
        if (isCorrect) correctAnswers++;

        validatedAnswers.push({
          questionId: answer.questionId,
          selectedAnswer: answer.selectedAnswer,
          isCorrect
        });
      }
    }

    const score = exam.totalQuestions > 0 ? Math.round((correctAnswers / exam.totalQuestions) * 100) : 0;

    // Save result
    const result = new ExamResultModel({
      examId: id,
      userId,
      answers: validatedAnswers,
      score,
      correctAnswers,
      totalQuestions: exam.totalQuestions,
      timeSpent: timeSpent || 0,
      completedAt: new Date()
    });

    await result.save();

    // Update user stats if needed (gamification)
    // This could trigger achievements, update streaks, etc.

    res.status(201).json(result);
  } catch (error) {
    console.error('Erro ao submeter resultado:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

export const getExamResults = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    const results = await ExamResultModel.find({ userId })
      .populate('examId', 'title subject duration')
      .sort({ completedAt: -1 });

    res.json(results);
  } catch (error) {
    console.error('Erro ao buscar resultados:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

export const getExamResult = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const result = await ExamResultModel.findOne({ _id: id, userId })
      .populate('examId', 'title subject duration questions')
      .populate('userId', 'name email');

    if (!result) {
      return res.status(404).json({ message: 'Resultado não encontrado' });
    }

    res.json(result);
  } catch (error) {
    console.error('Erro ao buscar resultado:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

export const getExamStats = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    const results = await ExamResultModel.find({ userId });

    if (results.length === 0) {
      return res.json({
        totalExams: 0,
        completedExams: 0,
        averageScore: 0,
        bestScore: 0,
        totalTimeSpent: 0,
        subjects: []
      });
    }

    const totalExams = await SimulatedExamModel.countDocuments({ userId });
    const completedExams = results.length;
    const averageScore = Math.round(results.reduce((sum, r) => sum + r.score, 0) / results.length);
    const bestScore = Math.max(...results.map(r => r.score));
    const totalTimeSpent = results.reduce((sum, r) => sum + r.timeSpent, 0);

    // Group by subject
    const subjectStats = await SimulatedExamModel.aggregate([
      { $match: { userId: userId } },
      {
        $lookup: {
          from: 'examresults',
          localField: '_id',
          foreignField: 'examId',
          as: 'results'
        }
      },
      {
        $group: {
          _id: '$subject',
          count: { $sum: 1 },
          averageScore: { $avg: '$results.score' }
        }
      }
    ]);

    const subjects = subjectStats.map(stat => ({
      name: stat._id,
      count: stat.count,
      averageScore: Math.round(stat.averageScore || 0)
    }));

    res.json({
      totalExams,
      completedExams,
      averageScore,
      bestScore,
      totalTimeSpent,
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

    const exams = await SimulatedExamModel.find({ userId, subject })
      .sort({ createdAt: -1 });

    res.json(exams);
  } catch (error) {
    console.error('Erro ao buscar simulados por disciplina:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};
