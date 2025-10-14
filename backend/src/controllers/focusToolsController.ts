import { Request, Response } from 'express';
import {
  BlockedSiteModel,
  FocusSessionModel,
  FocusProfileModel,
  DistractionLogModel,
  FocusAnalyticsModel
} from '../models/FocusTools';
import type {
  BlockedSite,
  FocusSession,
  FocusProfile,
  DistractionLog,
  FocusAnalytics
} from '../models/FocusTools';

interface AuthRequest extends Request {
  user?: any;
}

// Default blocked sites for new users
const DEFAULT_BLOCKED_SITES = [
  { url: 'facebook.com', domain: 'facebook.com', category: 'social' as const },
  { url: 'instagram.com', domain: 'instagram.com', category: 'social' as const },
  { url: 'twitter.com', domain: 'twitter.com', category: 'social' as const },
  { url: 'tiktok.com', domain: 'tiktok.com', category: 'social' as const },
  { url: 'youtube.com', domain: 'youtube.com', category: 'entertainment' as const },
  { url: 'netflix.com', domain: 'netflix.com', category: 'entertainment' as const },
  { url: 'twitch.tv', domain: 'twitch.tv', category: 'entertainment' as const },
  { url: 'reddit.com', domain: 'reddit.com', category: 'social' as const },
  { url: 'amazon.com', domain: 'amazon.com', category: 'shopping' as const },
  { url: 'ebay.com', domain: 'ebay.com', category: 'shopping' as const }
];

// Blocked Sites Management
export const getBlockedSites = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const blockedSites = await BlockedSiteModel.find({ userId, isActive: true })
      .sort({ category: 1, domain: 1 });

    res.json(blockedSites);
  } catch (error) {
    console.error('Erro ao buscar sites bloqueados:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

export const addBlockedSite = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { url, domain, category, blockLevel, customSchedule } = req.body;

    // Validate required fields
    if (!url || !domain) {
      return res.status(400).json({ message: 'URL e domínio são obrigatórios' });
    }

    // Check if site already exists
    const existingSite = await BlockedSiteModel.findOne({ userId, domain });
    if (existingSite) {
      return res.status(400).json({ message: 'Este site já está bloqueado' });
    }

    const blockedSite = new BlockedSiteModel({
      url,
      domain,
      category: category || 'other',
      blockLevel: blockLevel || 'moderate',
      customSchedule,
      userId,
      isActive: true
    });

    await blockedSite.save();

    res.status(201).json(blockedSite);
  } catch (error) {
    console.error('Erro ao adicionar site bloqueado:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

export const updateBlockedSite = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const updates = req.body;

    const site = await BlockedSiteModel.findOneAndUpdate(
      { _id: id, userId },
      updates,
      { new: true }
    );

    if (!site) {
      return res.status(404).json({ message: 'Site bloqueado não encontrado' });
    }

    res.json(site);
  } catch (error) {
    console.error('Erro ao atualizar site bloqueado:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

export const deleteBlockedSite = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const site = await BlockedSiteModel.findOneAndUpdate(
      { _id: id, userId },
      { isActive: false },
      { new: true }
    );

    if (!site) {
      return res.status(404).json({ message: 'Site bloqueado não encontrado' });
    }

    res.json({ message: 'Site removido da lista de bloqueio' });
  } catch (error) {
    console.error('Erro ao remover site bloqueado:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

export const initializeDefaultBlockedSites = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    // Check if user already has blocked sites
    const existingSites = await BlockedSiteModel.countDocuments({ userId });
    if (existingSites > 0) {
      return res.status(400).json({ message: 'Usuário já possui sites bloqueados configurados' });
    }

    // Create default blocked sites
    const defaultSites = DEFAULT_BLOCKED_SITES.map(site => ({
      ...site,
      userId,
      isActive: true,
      blockLevel: 'moderate' as const
    }));

    const createdSites = await BlockedSiteModel.insertMany(defaultSites);

    res.status(201).json({
      message: 'Sites padrão bloqueados configurados com sucesso',
      sites: createdSites
    });
  } catch (error) {
    console.error('Erro ao inicializar sites bloqueados padrão:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

// Focus Sessions Management
export const createFocusSession = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { name, description, duration, blockedSites, profileId } = req.body;

    // Validate required fields
    if (!name || !duration) {
      return res.status(400).json({ message: 'Nome e duração são obrigatórios' });
    }

    let sessionBlockedSites: string[] = [];

    if (profileId) {
      // Use profile's blocked sites
      const profile = await FocusProfileModel.findOne({ _id: profileId, userId });
      if (profile) {
        sessionBlockedSites = profile.blockedSites;
      }
    } else if (blockedSites && Array.isArray(blockedSites)) {
      sessionBlockedSites = blockedSites;
    } else {
      // Use user's default blocked sites
      const userSites = await BlockedSiteModel.find({ userId, isActive: true });
      sessionBlockedSites = userSites.map(site => site._id!.toString());
    }

    const session = new FocusSessionModel({
      userId,
      name,
      description,
      duration,
      startTime: new Date(),
      blockedSites: sessionBlockedSites,
      isActive: false,
      status: 'scheduled',
      interruptions: [],
      productivity: {
        focusScore: 0,
        sitesBlocked: sessionBlockedSites.length,
        timeSaved: 0
      }
    });

    await session.save();

    res.status(201).json(session);
  } catch (error) {
    console.error('Erro ao criar sessão de foco:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

export const startFocusSession = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const session = await FocusSessionModel.findOne({ _id: id, userId });
    if (!session) {
      return res.status(404).json({ message: 'Sessão de foco não encontrada' });
    }

    if (session.status !== 'scheduled') {
      return res.status(400).json({ message: 'Sessão já foi iniciada ou cancelada' });
    }

    // Check if user has another active session
    const activeSession = await FocusSessionModel.findOne({
      userId,
      status: 'active',
      _id: { $ne: id }
    });

    if (activeSession) {
      return res.status(400).json({ message: 'Já existe uma sessão ativa' });
    }

    session.status = 'active';
    session.isActive = true;
    session.startTime = new Date();

    await session.save();

    res.json(session);
  } catch (error) {
    console.error('Erro ao iniciar sessão de foco:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

export const endFocusSession = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const { actualDuration, notes } = req.body;

    const session = await FocusSessionModel.findOne({ _id: id, userId });
    if (!session) {
      return res.status(404).json({ message: 'Sessão de foco não encontrada' });
    }

    if (session.status !== 'active') {
      return res.status(400).json({ message: 'Sessão não está ativa' });
    }

    const endTime = new Date();
    const duration = actualDuration || Math.floor((endTime.getTime() - session.startTime.getTime()) / (1000 * 60));

    // Calculate productivity score
    const interruptionsCount = session.interruptions.length;
    const completionRate = Math.min(duration / session.duration, 1);
    const focusScore = Math.max(0, Math.round((completionRate * 100) - (interruptionsCount * 5)));

    session.status = 'completed';
    session.isActive = false;
    session.endTime = endTime;
    session.actualDuration = duration;
    session.productivity.focusScore = focusScore;
    session.productivity.timeSaved = Math.round(duration * 0.3); // Estimate 30% time saved from blocked distractions

    if (notes) {
      session.interruptions.push({
        timestamp: endTime,
        type: 'manual_pause',
        duration: 0
      });
    }

    await session.save();

    // Update user analytics
    await updateFocusAnalytics(userId, session);

    res.json(session);
  } catch (error) {
    console.error('Erro ao finalizar sessão de foco:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

export const getFocusSessions = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { status, limit = 20 } = req.query;

    let query: any = { userId };
    if (status) {
      query.status = status;
    }

    const sessions = await FocusSessionModel.find(query)
      .populate('blockedSites', 'domain category')
      .sort({ startTime: -1 })
      .limit(Number(limit));

    res.json(sessions);
  } catch (error) {
    console.error('Erro ao buscar sessões de foco:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

export const getActiveFocusSession = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    const session = await FocusSessionModel.findOne({
      userId,
      status: 'active'
    }).populate('blockedSites', 'domain category url');

    if (!session) {
      return res.status(404).json({ message: 'Nenhuma sessão ativa encontrada' });
    }

    res.json(session);
  } catch (error) {
    console.error('Erro ao buscar sessão ativa:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

// Focus Profiles Management
export const createFocusProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { name, description, defaultDuration, blockedSites, settings } = req.body;

    const profile = new FocusProfileModel({
      userId,
      name,
      description,
      defaultDuration,
      blockedSites: blockedSites || [],
      settings: settings || {},
      isDefault: false,
      statistics: {
        totalSessions: 0,
        totalFocusTime: 0,
        averageProductivity: 0,
        favoriteSites: []
      }
    });

    await profile.save();

    res.status(201).json(profile);
  } catch (error) {
    console.error('Erro ao criar perfil de foco:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

export const getFocusProfiles = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const profiles = await FocusProfileModel.find({ userId })
      .populate('blockedSites', 'domain category')
      .sort({ isDefault: -1, createdAt: -1 });

    res.json(profiles);
  } catch (error) {
    console.error('Erro ao buscar perfis de foco:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

// Distraction Logging
export const logDistraction = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { site, action, context, sessionId, userAgent, ipAddress } = req.body;

    const log = new DistractionLogModel({
      userId,
      sessionId,
      site,
      action,
      context,
      userAgent,
      ipAddress
    });

    await log.save();

    // If this is a blocked site during active session, log interruption
    if (action === 'blocked' && context === 'focus_session' && sessionId) {
      await FocusSessionModel.findByIdAndUpdate(sessionId, {
        $push: {
          interruptions: {
            timestamp: new Date(),
            site,
            type: 'blocked_site',
            duration: 0
          }
        }
      });
    }

    res.status(201).json(log);
  } catch (error) {
    console.error('Erro ao registrar distração:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

// Analytics
export const getFocusAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { days = 30 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - Number(days));

    const analytics = await FocusAnalyticsModel.find({
      userId,
      date: { $gte: startDate }
    }).sort({ date: -1 });

    // Calculate summary statistics
    const totalFocusTime = analytics.reduce((sum, day) => sum + day.totalFocusTime, 0);
    const totalSessions = analytics.reduce((sum, day) => sum + day.sessionsCompleted, 0);
    const averageProductivity = analytics.length > 0
      ? Math.round(analytics.reduce((sum, day) => sum + day.productivityScore, 0) / analytics.length)
      : 0;

    res.json({
      summary: {
        totalFocusTime,
        totalSessions,
        averageProductivity,
        period: `${days} days`
      },
      dailyData: analytics
    });
  } catch (error) {
    console.error('Erro ao buscar analytics de foco:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

// Helper function to update daily analytics
async function updateFocusAnalytics(userId: string, session: any) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let analytics = await FocusAnalyticsModel.findOne({ userId, date: today });

    if (!analytics) {
      analytics = new FocusAnalyticsModel({
        userId,
        date: today,
        totalFocusTime: 0,
        sessionsCompleted: 0,
        sitesBlocked: 0,
        distractionsPrevented: 0,
        productivityScore: 0,
        topDistractions: [],
        focusPatterns: []
      });
    }

    analytics.totalFocusTime += session.actualDuration || 0;
    analytics.sessionsCompleted += 1;
    analytics.sitesBlocked += session.productivity.sitesBlocked;
    analytics.distractionsPrevented += session.interruptions.filter((i: any) => i.type === 'blocked_site').length;

    // Recalculate productivity score
    const allSessions = await FocusSessionModel.find({
      userId,
      status: 'completed',
      startTime: { $gte: today }
    });

    if (allSessions.length > 0) {
      analytics.productivityScore = Math.round(
        allSessions.reduce((sum, s) => sum + s.productivity.focusScore, 0) / allSessions.length
      );
    }

    await analytics.save();
  } catch (error) {
    console.error('Erro ao atualizar analytics:', error);
  }
}

// Check if site should be blocked
export const checkSiteBlockStatus = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { url, sessionId } = req.query;

    if (!url) {
      return res.status(400).json({ message: 'URL é obrigatória' });
    }

    const domain = new URL(url as string).hostname;

    // Check if site is in user's blocked list
    const blockedSite = await BlockedSiteModel.findOne({
      userId,
      domain,
      isActive: true
    });

    if (!blockedSite) {
      return res.json({ shouldBlock: false });
    }

    // Check if there's an active focus session
    let shouldBlock = false;
    let context = 'always_block';

    if (sessionId) {
      const session = await FocusSessionModel.findOne({
        _id: sessionId,
        userId,
        status: 'active'
      });

      if (session && session.blockedSites.includes(blockedSite._id!)) {
        shouldBlock = true;
        context = 'focus_session';
      }
    } else if (blockedSite.blockLevel === 'strict') {
      shouldBlock = true;
    } else if (blockedSite.blockLevel === 'moderate') {
      // Check if user has active session
      const activeSession = await FocusSessionModel.findOne({
        userId,
        status: 'active'
      });

      if (activeSession) {
        shouldBlock = true;
        context = 'focus_session';
      }
    } else if (blockedSite.blockLevel === 'lenient' && blockedSite.customSchedule) {
      // Check custom schedule
      const now = new Date();
      const currentDay = now.getDay();
      const currentTime = now.toTimeString().slice(0, 5);

      if (blockedSite.customSchedule.daysOfWeek.includes(currentDay)) {
        if (currentTime >= blockedSite.customSchedule.startTime &&
            currentTime <= blockedSite.customSchedule.endTime) {
          shouldBlock = true;
          context = 'scheduled_block';
        }
      }
    }

    res.json({
      shouldBlock,
      context,
      site: blockedSite
    });
  } catch (error) {
    console.error('Erro ao verificar status de bloqueio:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};
