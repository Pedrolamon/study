/*import mongoose, { Document, Schema } from 'mongoose';

export interface BlockedSite {
  _id?: string;
  url: string;
  domain: string;
  category: 'social' | 'entertainment' | 'news' | 'shopping' | 'gaming' | 'other';
  isActive: boolean;
  blockLevel: 'strict' | 'moderate' | 'lenient'; // strict = always block, moderate = during focus sessions, lenient = custom schedule
  customSchedule?: {
    daysOfWeek: number[]; // 0-6, Sunday = 0
    startTime: string; // HH:MM format
    endTime: string; // HH:MM format
  };
  createdAt?: Date;
  updatedAt?: Date;
}

export interface FocusSession {
  _id?: string;
  userId: string;
  name: string;
  description?: string;
  duration: number; // minutes
  startTime: Date;
  endTime?: Date;
  actualDuration?: number; // actual time spent in focus mode
  blockedSites: string[]; // array of blocked site IDs
  isActive: boolean;
  status: 'scheduled' | 'active' | 'completed' | 'cancelled';
  interruptions: {
    timestamp: Date;
    site?: string;
    type: 'blocked_site' | 'manual_pause' | 'system_interrupt';
    duration: number; // seconds
  }[];
  productivity: {
    focusScore: number; // 0-100 based on interruptions and completion
    sitesBlocked: number;
    timeSaved: number; // estimated time saved from blocked distractions
  };
  createdAt?: Date;
  updatedAt?: Date;
}

export interface FocusProfile {
  _id?: string;
  userId: string;
  name: string;
  description?: string;
  defaultDuration: number; // minutes
  blockedSites: string[]; // default blocked sites for this profile
  isDefault: boolean;
  settings: {
    allowBreaks: boolean;
    breakDuration: number; // minutes
    breakFrequency: number; // minutes between breaks
    showMotivationalMessages: boolean;
    strictMode: boolean; // if true, no way to disable during session
    allowWhitelist: boolean;
  };
  statistics: {
    totalSessions: number;
    totalFocusTime: number; // minutes
    averageProductivity: number;
    mostProductiveDay: string;
    favoriteSites: string[]; // most frequently blocked sites
  };
  createdAt?: Date;
  updatedAt?: Date;
}

export interface DistractionLog {
  _id?: string;
  userId: string;
  sessionId?: string;
  site: string;
  timestamp: Date;
  action: 'blocked' | 'allowed' | 'whitelisted';
  context: 'focus_session' | 'always_block' | 'scheduled_block';
  userAgent?: string;
  ipAddress?: string;
}

export interface FocusAnalytics {
  userId: string;
  date: Date;
  totalFocusTime: number; // minutes
  sessionsCompleted: number;
  sitesBlocked: number;
  distractionsPrevented: number;
  productivityScore: number; // 0-100
  topDistractions: {
    site: string;
    count: number;
  }[];
  focusPatterns: {
    hour: number;
    averageFocusTime: number;
  }[];
}

export interface BlockedSiteDocument extends Omit<BlockedSite, '_id'>, Document {}
export interface FocusSessionDocument extends Omit<FocusSession, '_id'>, Document {}
export interface FocusProfileDocument extends Omit<FocusProfile, '_id'>, Document {}
export interface DistractionLogDocument extends Omit<DistractionLog, '_id'>, Document {}
export interface FocusAnalyticsDocument extends FocusAnalytics, Document {}

const blockedSiteSchema = new Schema<BlockedSiteDocument>({
  url: {
    type: String,
    required: true,
    trim: true
  },
  domain: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    enum: ['social', 'entertainment', 'news', 'shopping', 'gaming', 'other'],
    default: 'other'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  blockLevel: {
    type: String,
    enum: ['strict', 'moderate', 'lenient'],
    default: 'moderate'
  },
  customSchedule: {
    daysOfWeek: [{
      type: Number,
      min: 0,
      max: 6
    }],
    startTime: String,
    endTime: String
  }
}, {
  timestamps: true
});

const interruptionSchema = new Schema({
  timestamp: {
    type: Date,
    required: true
  },
  site: String,
  type: {
    type: String,
    enum: ['blocked_site', 'manual_pause', 'system_interrupt'],
    required: true
  },
  duration: {
    type: Number,
    required: true,
    min: 0
  }
}, { _id: true });

const productivitySchema = new Schema({
  focusScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  sitesBlocked: {
    type: Number,
    required: true,
    min: 0
  },
  timeSaved: {
    type: Number,
    required: true,
    min: 0
  }
}, { _id: false });

const focusSessionSchema = new Schema<FocusSessionDocument>({
  userId: {
    type: String,
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: String,
  duration: {
    type: Number,
    required: true,
    min: 1
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: Date,
  actualDuration: Number,
  blockedSites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BlockedSite'
  }],
  isActive: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['scheduled', 'active', 'completed', 'cancelled'],
    default: 'scheduled'
  },
  interruptions: [interruptionSchema],
  productivity: productivitySchema
}, {
  timestamps: true
});

const settingsSchema = new Schema({
  allowBreaks: {
    type: Boolean,
    default: true
  },
  breakDuration: {
    type: Number,
    default: 5,
    min: 1
  },
  breakFrequency: {
    type: Number,
    default: 25,
    min: 5
  },
  showMotivationalMessages: {
    type: Boolean,
    default: true
  },
  strictMode: {
    type: Boolean,
    default: false
  },
  allowWhitelist: {
    type: Boolean,
    default: true
  }
}, { _id: false });

const statisticsSchema = new Schema({
  totalSessions: {
    type: Number,
    default: 0
  },
  totalFocusTime: {
    type: Number,
    default: 0
  },
  averageProductivity: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  mostProductiveDay: String,
  favoriteSites: [String]
}, { _id: false });

const focusProfileSchema = new Schema<FocusProfileDocument>({
  userId: {
    type: String,
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: String,
  defaultDuration: {
    type: Number,
    required: true,
    min: 1
  },
  blockedSites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BlockedSite'
  }],
  isDefault: {
    type: Boolean,
    default: false
  },
  settings: {
    type: settingsSchema,
    default: {}
  },
  statistics: {
    type: statisticsSchema,
    default: {}
  }
}, {
  timestamps: true
});

const distractionLogSchema = new Schema<DistractionLogDocument>({
  userId: {
    type: String,
    required: true,
    index: true
  },
  sessionId: {
    type: String
  },
  site: {
    type: String,
    required: true,
    trim: true
  },
  timestamp: {
    type: Date,
    required: true,
    default: Date.now
  },
  action: {
    type: String,
    enum: ['blocked', 'allowed', 'whitelisted'],
    required: true
  },
  context: {
    type: String,
    enum: ['focus_session', 'always_block', 'scheduled_block'],
    required: true
  },
  userAgent: String,
  ipAddress: String
}, {
  timestamps: true
});

const focusAnalyticsSchema = new Schema<FocusAnalyticsDocument>({
  userId: {
    type: String,
    required: true,
    index: true
  },
  date: {
    type: Date,
    required: true,
    index: true
  },
  totalFocusTime: {
    type: Number,
    required: true,
    min: 0
  },
  sessionsCompleted: {
    type: Number,
    required: true,
    min: 0
  },
  sitesBlocked: {
    type: Number,
    required: true,
    min: 0
  },
  distractionsPrevented: {
    type: Number,
    required: true,
    min: 0
  },
  productivityScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  topDistractions: [{
    site: String,
    count: Number
  }],
  focusPatterns: [{
    hour: Number,
    averageFocusTime: Number
  }]
});

// Indexes for better query performance
blockedSiteSchema.index({ userId: 1, domain: 1 });
blockedSiteSchema.index({ userId: 1, isActive: 1 });
focusSessionSchema.index({ userId: 1, status: 1 });
focusSessionSchema.index({ userId: 1, startTime: -1 });
focusProfileSchema.index({ userId: 1, isDefault: 1 });
distractionLogSchema.index({ userId: 1, timestamp: -1 });
distractionLogSchema.index({ sessionId: 1 });
focusAnalyticsSchema.index({ userId: 1, date: -1 });

export const BlockedSiteModel = mongoose.model<BlockedSiteDocument>('BlockedSite', blockedSiteSchema);
export const FocusSessionModel = mongoose.model<FocusSessionDocument>('FocusSession', focusSessionSchema);
export const FocusProfileModel = mongoose.model<FocusProfileDocument>('FocusProfile', focusProfileSchema);
export const DistractionLogModel = mongoose.model<DistractionLogDocument>('DistractionLog', distractionLogSchema);
export const FocusAnalyticsModel = mongoose.model<FocusAnalyticsDocument>('FocusAnalytics', focusAnalyticsSchema);*/
