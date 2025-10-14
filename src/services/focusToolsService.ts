import api from './api';

export interface BlockedSite {
  _id?: string;
  url: string;
  domain: string;
  category: 'social' | 'entertainment' | 'news' | 'shopping' | 'gaming' | 'other';
  isActive: boolean;
  blockLevel: 'strict' | 'moderate' | 'lenient';
  customSchedule?: {
    daysOfWeek: number[];
    startTime: string;
    endTime: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface FocusSession {
  _id?: string;
  userId: string;
  name: string;
  description?: string;
  duration: number;
  startTime: string;
  endTime?: string;
  actualDuration?: number;
  blockedSites: string[];
  isActive: boolean;
  status: 'scheduled' | 'active' | 'completed' | 'cancelled';
  interruptions: {
    timestamp: string;
    site?: string;
    type: 'blocked_site' | 'manual_pause' | 'system_interrupt';
    duration: number;
  }[];
  productivity: {
    focusScore: number;
    sitesBlocked: number;
    timeSaved: number;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface FocusProfile {
  _id?: string;
  userId: string;
  name: string;
  description?: string;
  defaultDuration: number;
  blockedSites: string[];
  isDefault: boolean;
  settings: {
    allowBreaks: boolean;
    breakDuration: number;
    breakFrequency: number;
    showMotivationalMessages: boolean;
    strictMode: boolean;
    allowWhitelist: boolean;
  };
  statistics: {
    totalSessions: number;
    totalFocusTime: number;
    averageProductivity: number;
    mostProductiveDay: string;
    favoriteSites: string[];
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateBlockedSiteData {
  url: string;
  domain: string;
  category?: 'social' | 'entertainment' | 'news' | 'shopping' | 'gaming' | 'other';
  blockLevel?: 'strict' | 'moderate' | 'lenient';
  customSchedule?: {
    daysOfWeek: number[];
    startTime: string;
    endTime: string;
  };
}

export interface CreateFocusSessionData {
  name: string;
  description?: string;
  duration: number;
  blockedSites?: string[];
  profileId?: string;
}

export interface CreateFocusProfileData {
  name: string;
  description?: string;
  defaultDuration: number;
  blockedSites?: string[];
  settings?: {
    allowBreaks?: boolean;
    breakDuration?: number;
    breakFrequency?: number;
    showMotivationalMessages?: boolean;
    strictMode?: boolean;
    allowWhitelist?: boolean;
  };
}

export interface FocusAnalytics {
  summary: {
    totalFocusTime: number;
    totalSessions: number;
    averageProductivity: number;
    period: string;
  };
  dailyData: {
    date: string;
    totalFocusTime: number;
    sessionsCompleted: number;
    sitesBlocked: number;
    distractionsPrevented: number;
    productivityScore: number;
    topDistractions: {
      site: string;
      count: number;
    }[];
    focusPatterns: {
      hour: number;
      averageFocusTime: number;
    }[];
  }[];
}

class FocusToolsService {
  // Blocked Sites Management
  async getBlockedSites(): Promise<BlockedSite[]> {
    const response = await api.get('/api/focus-tools/blocked-sites');
    return response.data;
  }

  async addBlockedSite(data: CreateBlockedSiteData): Promise<BlockedSite> {
    const response = await api.post('/api/focus-tools/blocked-sites', data);
    return response.data;
  }

  async updateBlockedSite(id: string, data: Partial<CreateBlockedSiteData>): Promise<BlockedSite> {
    const response = await api.put(`/api/focus-tools/blocked-sites/${id}`, data);
    return response.data;
  }

  async deleteBlockedSite(id: string): Promise<void> {
    await api.delete(`/api/focus-tools/blocked-sites/${id}`);
  }

  async initializeDefaultBlockedSites(): Promise<{ message: string; sites: BlockedSite[] }> {
    const response = await api.post('/api/focus-tools/blocked-sites/initialize-default');
    return response.data;
  }

  // Focus Sessions Management
  async createFocusSession(data: CreateFocusSessionData): Promise<FocusSession> {
    const response = await api.post('/api/focus-tools/sessions', data);
    return response.data;
  }

  async startFocusSession(id: string): Promise<FocusSession> {
    const response = await api.put(`/api/focus-tools/sessions/${id}/start`);
    return response.data;
  }

  async endFocusSession(id: string, actualDuration?: number, notes?: string): Promise<FocusSession> {
    const response = await api.put(`/api/focus-tools/sessions/${id}/end`, {
      actualDuration,
      notes
    });
    return response.data;
  }

  async getFocusSessions(status?: string, limit?: number): Promise<FocusSession[]> {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (limit) params.append('limit', limit.toString());

    const response = await api.get(`/api/focus-tools/sessions?${params}`);
    return response.data;
  }

  async getActiveFocusSession(): Promise<FocusSession | null> {
    try {
      const response = await api.get('/api/focus-tools/sessions/active');
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  // Focus Profiles Management
  async createFocusProfile(data: CreateFocusProfileData): Promise<FocusProfile> {
    const response = await api.post('/api/focus-tools/profiles', data);
    return response.data;
  }

  async getFocusProfiles(): Promise<FocusProfile[]> {
    const response = await api.get('/api/focus-tools/profiles');
    return response.data;
  }

  // Distraction Logging
  async logDistraction(
    site: string,
    action: 'blocked' | 'allowed' | 'whitelisted',
    context: 'focus_session' | 'always_block' | 'scheduled_block',
    sessionId?: string,
    userAgent?: string,
    ipAddress?: string
  ): Promise<void> {
    await api.post('/api/focus-tools/distractions', {
      site,
      action,
      context,
      sessionId,
      userAgent,
      ipAddress
    });
  }

  // Analytics
  async getFocusAnalytics(days: number = 30): Promise<FocusAnalytics> {
    const response = await api.get(`/api/focus-tools/analytics?days=${days}`);
    return response.data;
  }

  // Utility Methods
  async checkSiteBlockStatus(url: string, sessionId?: string): Promise<{
    shouldBlock: boolean;
    context: string;
    site?: BlockedSite;
  }> {
    const params = new URLSearchParams({ url });
    if (sessionId) params.append('sessionId', sessionId);

    const response = await api.get(`/api/focus-tools/check-site?${params}`);
    return response.data;
  }

  // Helper functions for frontend
  calculateSessionProgress(session: FocusSession): number {
    if (session.status === 'completed') return 100;
    if (session.status !== 'active') return 0;

    const elapsed = Date.now() - new Date(session.startTime).getTime();
    const total = session.duration * 60 * 1000; // Convert minutes to milliseconds
    return Math.min(Math.round((elapsed / total) * 100), 100);
  }

  getTimeRemaining(session: FocusSession): number {
    if (session.status !== 'active') return 0;

    const elapsed = Date.now() - new Date(session.startTime).getTime();
    const total = session.duration * 60 * 1000;
    return Math.max(0, Math.round((total - elapsed) / 1000)); // Return seconds remaining
  }

  formatTimeRemaining(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }

  getProductivityColor(score: number): string {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  }

  getProductivityLabel(score: number): string {
    if (score >= 80) return 'Excelente';
    if (score >= 60) return 'Bom';
    if (score >= 40) return 'Regular';
    return 'Precisa Melhorar';
  }

  getCategoryIcon(category: string): string {
    switch (category) {
      case 'social': return 'facebook';
      case 'entertainment': return 'youtube';
      case 'news': return 'newspaper';
      case 'shopping': return 'shopping-bag';
      case 'gaming': return 'gamepad-2';
      default: return 'globe';
    }
  }

  getCategoryColor(category: string): string {
    switch (category) {
      case 'social': return 'bg-blue-100 text-blue-800';
      case 'entertainment': return 'bg-red-100 text-red-800';
      case 'news': return 'bg-yellow-100 text-yellow-800';
      case 'shopping': return 'bg-green-100 text-green-800';
      case 'gaming': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  // Default blocked sites suggestions
  getDefaultBlockedSites(): CreateBlockedSiteData[] {
    return [
      { url: 'facebook.com', domain: 'facebook.com', category: 'social', blockLevel: 'moderate' },
      { url: 'instagram.com', domain: 'instagram.com', category: 'social', blockLevel: 'moderate' },
      { url: 'twitter.com', domain: 'twitter.com', category: 'social', blockLevel: 'moderate' },
      { url: 'tiktok.com', domain: 'tiktok.com', category: 'social', blockLevel: 'moderate' },
      { url: 'youtube.com', domain: 'youtube.com', category: 'entertainment', blockLevel: 'moderate' },
      { url: 'netflix.com', domain: 'netflix.com', category: 'entertainment', blockLevel: 'moderate' },
      { url: 'twitch.tv', domain: 'twitch.tv', category: 'entertainment', blockLevel: 'moderate' },
      { url: 'reddit.com', domain: 'reddit.com', category: 'social', blockLevel: 'moderate' },
      { url: 'amazon.com', domain: 'amazon.com', category: 'shopping', blockLevel: 'moderate' },
      { url: 'ebay.com', domain: 'ebay.com', category: 'shopping', blockLevel: 'moderate' }
    ];
  }

  // Motivational messages
  getMotivationalMessage(): string {
    const messages = [
      "Continue focado! Você está no caminho certo.",
      "Cada minuto de foco é uma vitória conquistada.",
      "Sua dedicação hoje constrói o seu futuro.",
      "Mantenha o ritmo! Você está indo muito bem.",
      "Foco é a chave para o sucesso. Continue assim!",
      "Você é capaz de grandes conquistas. Mantenha-se concentrado!",
      "Cada distração evitada é uma batalha vencida.",
      "Seu esforço hoje será recompensado amanhã."
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  }
}

export default new FocusToolsService();
