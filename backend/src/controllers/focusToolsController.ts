import { Request, Response } from 'express';
import { prisma } from '../models';

interface AuthRequest extends Request {
  user?: any;
}

// Default blocked sites for new users
const DEFAULT_BLOCKED_SITES = [
  { url: 'facebook.com', name: 'Facebook', category: 'social' },
  { url: 'instagram.com', name: 'Instagram', category: 'social' },
  { url: 'twitter.com', name: 'Twitter', category: 'social' },
  { url: 'tiktok.com', name: 'TikTok', category: 'social' },
  { url: 'youtube.com', name: 'YouTube', category: 'entertainment' },
  { url: 'netflix.com', name: 'Netflix', category: 'entertainment' },
  { url: 'twitch.tv', name: 'Twitch', category: 'entertainment' },
  { url: 'reddit.com', name: 'Reddit', category: 'social' },
  { url: 'amazon.com', name: 'Amazon', category: 'shopping' },
  { url: 'ebay.com', name: 'eBay', category: 'shopping' }
];

// Blocked Sites Management
export const getBlockedSites = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const blockedSites = await prisma.blockedSite.findMany({ 
      where: { userId, isActive: true },
      orderBy: [{ category: 'asc' }, { name: 'asc' }]
    });

    res.json(blockedSites);
  } catch (error) {
    console.error('Erro ao buscar sites bloqueados:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

export const addBlockedSite = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { url, name, category } = req.body;

    // Validate required fields
    if (!url || !name) {
      return res.status(400).json({ message: 'URL e nome são obrigatórios' });
    }

    // Check if site already exists
    const existingSite = await prisma.blockedSite.findFirst({ 
      where: { userId, url } 
    });
    if (existingSite) {
      return res.status(400).json({ message: 'Este site já está bloqueado' });
    }

    const blockedSite = await prisma.blockedSite.create({
      data: {
        url,
        name,
        category: category || 'other',
        userId,
        isActive: true
      }
    });

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

    if (!id) {
      return res.status(400).json({ message: 'ID é obrigatório' });
    }

    const site = await prisma.blockedSite.updateMany({
      where: { id, userId },
      data: updates
    });

    if (site.count === 0) {
      return res.status(404).json({ message: 'Site bloqueado não encontrado' });
    }

    const updatedSite = await prisma.blockedSite.findUnique({
      where: { id }
    });

    res.json(updatedSite);
  } catch (error) {
    console.error('Erro ao atualizar site bloqueado:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

export const deleteBlockedSite = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!id) {
      return res.status(400).json({ message: 'ID é obrigatório' });
    }

    const site = await prisma.blockedSite.updateMany({
      where: { id, userId },
      data: { isActive: false }
    });

    if (site.count === 0) {
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
    const existingSites = await prisma.blockedSite.count({ 
      where: { userId } 
    });
    if (existingSites > 0) {
      return res.status(400).json({ message: 'Usuário já possui sites bloqueados configurados' });
    }

    // Create default blocked sites
    const defaultSites = DEFAULT_BLOCKED_SITES.map(site => ({
      url: site.url,
      name: site.name,
      category: site.category,
      userId,
      isActive: true
    }));

    const createdSites = await prisma.blockedSite.createMany({
      data: defaultSites
    });

    res.status(201).json({
      message: 'Sites padrão bloqueados configurados com sucesso',
      count: createdSites.count
    });
  } catch (error) {
    console.error('Erro ao inicializar sites bloqueados padrão:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

// Focus Tools Management
export const getFocusTools = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    
    const focusTools = await prisma.focusTools.findUnique({
      where: { userId }
    });

    if (!focusTools) {
      // Create default focus tools if none exist
      const defaultFocusTools = await prisma.focusTools.create({
        data: {
          userId,
          settings: {
            pomodoroEnabled: true,
            breakReminders: true,
            focusMode: 'moderate'
          }
        }
      });
      return res.json(defaultFocusTools);
    }

    res.json(focusTools);
  } catch (error) {
    console.error('Erro ao buscar ferramentas de foco:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

export const updateFocusTools = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { settings } = req.body;

    const focusTools = await prisma.focusTools.upsert({
      where: { userId },
      update: { settings },
      create: {
        userId,
        settings: settings || {}
      }
    });

    res.json(focusTools);
  } catch (error) {
    console.error('Erro ao atualizar ferramentas de foco:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

// Check if site should be blocked
export const checkSiteBlockStatus = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { url } = req.query;

    if (!url) {
      return res.status(400).json({ message: 'URL é obrigatória' });
    }

    // Check if site is in user's blocked list
    const blockedSite = await prisma.blockedSite.findFirst({
      where: {
        userId,
        url: url as string,
        isActive: true
      }
    });

    if (!blockedSite) {
      return res.json({ shouldBlock: false });
    }

    res.json({
      shouldBlock: true,
      site: blockedSite
    });
  } catch (error) {
    console.error('Erro ao verificar status de bloqueio:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};