import { Request, Response } from 'express';
import { EditalModel, StudyPlanModel, PerformanceMetricsModel } from '../models/StudyPlan';
import { ExamResultModel } from '../models/SimulatedExam';
import type { Edital, StudyPlan, EditalTopic, StudySessionPlan, PerformanceMetrics } from '../models/StudyPlan';

interface AuthRequest extends Request {
  user?: any;
}

// Study Plan Generation Algorithm
class StudyPlanGenerator {
  static generateStudyPlan(edital: Edital, userId: string, dailyHours: number): StudyPlan {
    const startDate = new Date();
    const endDate = new Date(edital.examDate);
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

    // Calculate total hours needed
    const totalHours = edital.topics.reduce((sum, topic) => sum + topic.estimatedHours, 0);

    // Sort topics by priority (weight * difficulty multiplier)
    const prioritizedTopics = this.prioritizeTopics(edital.topics);

    // Generate study sessions
    const sessions = this.generateSessions(prioritizedTopics, startDate, totalDays, dailyHours);

    return {
      title: `Plano de Estudos - ${edital.title}`,
      description: `Plano gerado automaticamente para ${edital.examType}`,
      editalId: edital._id!,
      userId,
      startDate,
      endDate,
      totalHours,
      dailyHours,
      sessions,
      isActive: true,
      progress: 0,
      lastUpdated: new Date()
    };
  }

  private static prioritizeTopics(topics: EditalTopic[]): EditalTopic[] {
    return topics.sort((a, b) => {
      const priorityA = a.weight * this.getDifficultyMultiplier(a.difficulty);
      const priorityB = b.weight * this.getDifficultyMultiplier(b.difficulty);
      return priorityB - priorityA; // Higher priority first
    });
  }

  private static getDifficultyMultiplier(difficulty: string): number {
    switch (difficulty) {
      case 'easy': return 1;
      case 'medium': return 1.5;
      case 'hard': return 2;
      default: return 1;
    }
  }

  private static generateSessions(
    topics: EditalTopic[],
    startDate: Date,
    totalDays: number,
    dailyHours: number
  ): StudySessionPlan[] {
    const sessions: StudySessionPlan[] = [];
    const dailyMinutes = dailyHours * 60;
    let currentDate = new Date(startDate);
    let topicIndex = 0;

    for (let day = 0; day < totalDays; day++) {
      let remainingMinutes = dailyMinutes;

      // Skip weekends if configured (optional)
      if (currentDate.getDay() === 0 || currentDate.getDay() === 6) {
        currentDate.setDate(currentDate.getDate() + 1);
        continue;
      }

      while (remainingMinutes > 0 && topicIndex < topics.length) {
        const topic = topics[topicIndex];
        const sessionDuration = Math.min(remainingMinutes, 90); // Max 90 minutes per session

        sessions.push({
          topicId: topic._id || `topic_${topicIndex}`,
          topicName: topic.name,
          subject: topic.subject,
          scheduledDate: new Date(currentDate),
          duration: sessionDuration,
          priority: this.calculatePriority(topic),
          status: 'pending'
        });

        remainingMinutes -= sessionDuration;

        // Move to next topic if this one is complete
        if (remainingMinutes <= 0) {
          topicIndex++;
        }
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return sessions;
  }

  private static calculatePriority(topic: EditalTopic): 'low' | 'medium' | 'high' {
    const score = topic.weight * this.getDifficultyMultiplier(topic.difficulty);
    if (score >= 150) return 'high';
    if (score >= 75) return 'medium';
    return 'low';
  }

  static adaptStudyPlan(plan: StudyPlan, performanceMetrics: PerformanceMetrics[]): StudyPlan {
    const adaptedSessions = plan.sessions.map(session => {
      const metrics = performanceMetrics.find(m => m.topicId === session.topicId);

      if (metrics) {
        // Adjust based on performance
        if (metrics.mastery === 'low') {
          // Increase time for struggling topics
          session.duration = Math.min(session.duration * 1.5, 120);
          session.priority = 'high';
        } else if (metrics.mastery === 'high') {
          // Reduce time for mastered topics
          session.duration = Math.max(session.duration * 0.8, 30);
        }
      }

      return session;
    });

    return {
      ...plan,
      sessions: adaptedSessions,
      lastUpdated: new Date()
    };
  }
}

// Controller Functions
export const createEdital = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { title, description, examType, organization, examDate, topics } = req.body;

    // Validate required fields
    if (!title || !examType || !organization || !examDate || !topics || !Array.isArray(topics)) {
      return res.status(400).json({ message: 'Campos obrigatórios não preenchidos' });
    }

    // Validate topics
    for (const topic of topics) {
      if (!topic.name || !topic.subject || topic.weight === undefined || topic.estimatedHours === undefined) {
        return res.status(400).json({ message: 'Tópico inválido: nome, disciplina, peso e horas são obrigatórios' });
      }
    }

    const edital = new EditalModel({
      title,
      description,
      examType,
      organization,
      examDate: new Date(examDate),
      totalTopics: topics.length,
      topics,
      userId,
      isActive: true
    });

    await edital.save();

    res.status(201).json(edital);
  } catch (error) {
    console.error('Erro ao criar edital:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

export const getEditais = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const editais = await EditalModel.find({ userId, isActive: true })
      .sort({ examDate: 1 });

    res.json(editais);
  } catch (error) {
    console.error('Erro ao buscar editais:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

export const getEdital = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const edital = await EditalModel.findOne({ _id: id, userId });
    if (!edital) {
      return res.status(404).json({ message: 'Edital não encontrado' });
    }

    res.json(edital);
  } catch (error) {
    console.error('Erro ao buscar edital:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

export const generateStudyPlan = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { editalId, dailyHours = 4 } = req.body;

    if (!editalId) {
      return res.status(400).json({ message: 'ID do edital é obrigatório' });
    }

    // Get the edital
    const edital = await EditalModel.findOne({ _id: editalId, userId });
    if (!edital) {
      return res.status(404).json({ message: 'Edital não encontrado' });
    }

    // Check if user already has an active plan for this edital
    const existingPlan = await StudyPlanModel.findOne({
      editalId,
      userId,
      isActive: true
    });

    if (existingPlan) {
      return res.status(400).json({ message: 'Já existe um plano ativo para este edital' });
    }

    // Generate the study plan
    const studyPlan = StudyPlanGenerator.generateStudyPlan(edital, userId, dailyHours);

    const plan = new StudyPlanModel(studyPlan);
    await plan.save();

    res.status(201).json(plan);
  } catch (error) {
    console.error('Erro ao gerar plano de estudos:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

export const getStudyPlans = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const plans = await StudyPlanModel.find({ userId })
      .populate('editalId', 'title examType organization examDate')
      .sort({ createdAt: -1 });

    res.json(plans);
  } catch (error) {
    console.error('Erro ao buscar planos de estudo:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

export const getStudyPlan = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const plan = await StudyPlanModel.findOne({ _id: id, userId })
      .populate('editalId', 'title examType organization examDate topics');

    if (!plan) {
      return res.status(404).json({ message: 'Plano de estudo não encontrado' });
    }

    res.json(plan);
  } catch (error) {
    console.error('Erro ao buscar plano de estudo:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

export const updateSessionStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { planId, sessionId } = req.params;
    const userId = req.user?.id;
    const { status, actualDuration, notes, performance } = req.body;

    const plan = await StudyPlanModel.findOne({ _id: planId, userId });
    if (!plan) {
      return res.status(404).json({ message: 'Plano de estudo não encontrado' });
    }

    // Find and update the session
    const session = plan.sessions.find(s => s._id?.toString() === sessionId);
    if (!session) {
      return res.status(404).json({ message: 'Sessão não encontrada' });
    }

    session.status = status || session.status;
    if (actualDuration !== undefined) session.actualDuration = actualDuration;
    if (notes !== undefined) session.notes = notes;
    if (performance !== undefined) session.performance = performance;

    // Update plan progress
    const completedSessions = plan.sessions.filter(s => s.status === 'completed').length;
    plan.progress = Math.round((completedSessions / plan.sessions.length) * 100);
    plan.lastUpdated = new Date();

    await plan.save();

    res.json(plan);
  } catch (error) {
    console.error('Erro ao atualizar sessão:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

export const adaptStudyPlan = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const plan = await StudyPlanModel.findOne({ _id: id, userId })
      .populate('editalId');

    if (!plan) {
      return res.status(404).json({ message: 'Plano de estudo não encontrado' });
    }

    // Get performance metrics for adaptation
    const performanceMetrics = await getPerformanceMetrics(userId);

    // Adapt the plan based on performance
    const adaptedPlan = StudyPlanGenerator.adaptStudyPlan(plan, performanceMetrics);

    // Update the plan in database
    await StudyPlanModel.findByIdAndUpdate(id, {
      sessions: adaptedPlan.sessions,
      lastUpdated: new Date()
    });

    res.json(adaptedPlan);
  } catch (error) {
    console.error('Erro ao adaptar plano de estudo:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

export const getPerformanceMetrics = async (userId: string): Promise<PerformanceMetrics[]> => {
  try {
    // Get exam results and calculate performance metrics
    const examResults = await ExamResultModel.find({ userId })
      .populate('examId', 'questions');

    const metrics: { [topicId: string]: PerformanceMetrics } = {};

    examResults.forEach(result => {
      if (result.examId && result.examId.questions) {
        result.examId.questions.forEach((question: any, index: number) => {
          const topicId = question.subject || `topic_${index}`;
          const userAnswer = result.answers.find(a => a.questionId === question._id);
          const isCorrect = userAnswer ? userAnswer.selectedAnswer === question.correctAnswer : false;

          if (!metrics[topicId]) {
            metrics[topicId] = {
              topicId,
              averageScore: 0,
              totalAttempts: 0,
              timeSpent: 0,
              lastStudied: result.completedAt,
              mastery: 'low'
            };
          }

          metrics[topicId].totalAttempts++;
          metrics[topicId].timeSpent += result.timeSpent / result.examId.questions.length;

          if (isCorrect) {
            metrics[topicId].averageScore += 100;
          }
        });
      }
    });

    // Calculate final metrics
    Object.values(metrics).forEach(metric => {
      if (metric.totalAttempts > 0) {
        metric.averageScore = Math.round(metric.averageScore / metric.totalAttempts);

        if (metric.averageScore >= 80) metric.mastery = 'high';
        else if (metric.averageScore >= 60) metric.mastery = 'medium';
        else metric.mastery = 'low';
      }
    });

    return Object.values(metrics);
  } catch (error) {
    console.error('Erro ao calcular métricas de performance:', error);
    return [];
  }
};

export const getUpcomingSessions = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { days = 7 } = req.query;

    const endDate = new Date();
    endDate.setDate(endDate.getDate() + Number(days));

    const plans = await StudyPlanModel.find({
      userId,
      isActive: true,
      'sessions.scheduledDate': {
        $gte: new Date(),
        $lte: endDate
      }
    });

    const upcomingSessions: StudySessionPlan[] = [];

    plans.forEach(plan => {
      plan.sessions.forEach(session => {
        if (session.scheduledDate >= new Date() &&
            session.scheduledDate <= endDate &&
            session.status === 'pending') {
          upcomingSessions.push(session);
        }
      });
    });

    // Sort by date
    upcomingSessions.sort((a, b) => a.scheduledDate.getTime() - b.scheduledDate.getTime());

    res.json(upcomingSessions.slice(0, 20)); // Return max 20 sessions
  } catch (error) {
    console.error('Erro ao buscar próximas sessões:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};
