/*import { Request, Response } from 'express';
import { prisma } from '../models';

interface AuthRequest extends Request {
  user?: any;
}

// Study Plan Generation Algorithm
class StudyPlanGenerator {
  static generateStudyPlan(edital: any, userId: string, dailyHours: number) {
    const startDate = new Date();
    const endDate = new Date(edital.examDate);
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

    // Calculate total hours needed
    const totalHours = edital.topics.reduce((sum: number, topic: any) => sum + topic.estimatedHours, 0);

    // Sort topics by priority (weight * difficulty multiplier)
    const prioritizedTopics = this.prioritizeTopics(edital.topics);

    // Generate study sessions
    const sessions = this.generateSessions(prioritizedTopics, startDate, totalDays, dailyHours);

    return {
      title: `Plano de Estudos - ${edital.title}`,
      description: `Plano gerado automaticamente para ${edital.examType}`,
      editalId: edital.id,
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

  private static prioritizeTopics(topics: any[]) {
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
    topics: any[],
    startDate: Date,
    totalDays: number,
    dailyHours: number
  ) {
    const sessions: any[] = [];
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
          topicId: topic.id || `topic_${topicIndex}`,
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

  private static calculatePriority(topic: any): 'low' | 'medium' | 'high' {
    const score = topic.weight * this.getDifficultyMultiplier(topic.difficulty);
    if (score >= 150) return 'high';
    if (score >= 75) return 'medium';
    return 'low';
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

    const edital = await prisma.edital.create({
      data: {
        title,
        description,
        examType,
        organization,
        examDate: new Date(examDate),
        totalTopics: topics.length,
        topics,
        userId,
        isActive: true
      }
    });

    res.status(201).json(edital);
  } catch (error) {
    console.error('Erro ao criar edital:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

export const getEditais = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const editais = await prisma.edital.findMany({
      where: { userId, isActive: true },
      orderBy: { examDate: 'asc' }
    });

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

    const edital = await prisma.edital.findFirst({
      where: { id, userId }
    });

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
    const edital = await prisma.edital.findFirst({
      where: { id: editalId, userId }
    });

    if (!edital) {
      return res.status(404).json({ message: 'Edital não encontrado' });
    }

    // Check if user already has an active plan for this edital
    const existingPlan = await prisma.studyPlan.findFirst({
      where: {
        editalId,
        userId,
        isActive: true
      }
    });

    if (existingPlan) {
      return res.status(400).json({ message: 'Já existe um plano ativo para este edital' });
    }

    // Generate the study plan
    const studyPlan = StudyPlanGenerator.generateStudyPlan(edital, userId, dailyHours);

    const plan = await prisma.studyPlan.create({
      data: studyPlan
    });

    res.status(201).json(plan);
  } catch (error) {
    console.error('Erro ao gerar plano de estudos:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

export const getStudyPlans = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const plans = await prisma.studyPlan.findMany({
      where: { userId },
      include: {
        edital: {
          select: {
            title: true,
            examType: true,
            organization: true,
            examDate: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

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

    const plan = await prisma.studyPlan.findFirst({
      where: { id, userId },
      include: {
        edital: {
          select: {
            title: true,
            examType: true,
            organization: true,
            examDate: true,
            topics: true
          }
        }
      }
    });

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

    const plan = await prisma.studyPlan.findFirst({
      where: { id: planId, userId }
    });

    if (!plan) {
      return res.status(404).json({ message: 'Plano de estudo não encontrado' });
    }

    // Update the session in the plan
    const updatedSessions = plan.sessions.map((session: any) => {
      if (session.id === sessionId) {
        return {
          ...session,
          status: status || session.status,
          actualDuration: actualDuration !== undefined ? actualDuration : session.actualDuration,
          notes: notes !== undefined ? notes : session.notes,
          performance: performance !== undefined ? performance : session.performance
        };
      }
      return session;
    });

    // Calculate progress
    const completedSessions = updatedSessions.filter((s: any) => s.status === 'completed').length;
    const progress = Math.round((completedSessions / updatedSessions.length) * 100);

    const updatedPlan = await prisma.studyPlan.update({
      where: { id: planId },
      data: {
        sessions: updatedSessions,
        progress,
        lastUpdated: new Date()
      }
    });

    res.json(updatedPlan);
  } catch (error) {
    console.error('Erro ao atualizar sessão:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

export const getUpcomingSessions = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { days = 7 } = req.query;

    const endDate = new Date();
    endDate.setDate(endDate.getDate() + Number(days));

    const plans = await prisma.studyPlan.findMany({
      where: {
        userId,
        isActive: true
      }
    });

    const upcomingSessions: any[] = [];

    plans.forEach(plan => {
      plan.sessions.forEach((session: any) => {
        const sessionDate = new Date(session.scheduledDate);
        if (sessionDate >= new Date() &&
            sessionDate <= endDate &&
            session.status === 'pending') {
          upcomingSessions.push({
            ...session,
            planId: plan.id,
            planTitle: plan.title
          });
        }
      });
    });

    // Sort by date
    upcomingSessions.sort((a, b) => 
      new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime()
    );

    res.json(upcomingSessions.slice(0, 20)); // Return max 20 sessions
  } catch (error) {
    console.error('Erro ao buscar próximas sessões:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};*/