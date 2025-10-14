import mongoose, { Document, Schema } from 'mongoose';

export interface Flashcard {
  _id?: string;
  userId: string;
  question: string;
  answer: string;
  subject: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ReviewSession {
  _id?: string;
  userId: string;
  flashcardId: string;
  responseQuality: number; // 0-5 scale (SM-2 algorithm)
  timeSpent: number; // seconds
  previousInterval: number; // days
  newInterval: number; // days
  nextReviewDate: Date;
  easeFactor: number; // SM-2 ease factor
  repetitionCount: number;
  lastReviewed: Date;
  createdAt?: Date;
}

export interface StudyStreak {
  _id?: string;
  userId: string;
  currentStreak: number;
  longestStreak: number;
  lastStudyDate: Date;
  totalStudyDays: number;
  studyDaysThisWeek: number;
  studyDaysThisMonth: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Widget {
  _id?: string;
  userId: string;
  type: 'study_progress' | 'upcoming_reviews' | 'focus_session' | 'study_streak' | 'performance_chart' | 'quick_actions';
  title: string;
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
    minWidth: number;
    minHeight: number;
  };
  settings: {
    refreshInterval?: number; // minutes
    showDetails?: boolean;
    compactView?: boolean;
    customColors?: {
      primary?: string;
      secondary?: string;
      accent?: string;
    };
  };
  isVisible: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface OfflineQueue {
  _id?: string;
  userId: string;
  action: string;
  data: any;
  timestamp: Date;
  retryCount: number;
  maxRetries: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CachedData {
  _id?: string;
  userId: string;
  dataType: 'flashcards' | 'study_sessions' | 'tasks' | 'performance' | 'study_plans';
  data: any;
  lastSync: Date;
  version: number;
  isValid: boolean;
  expiresAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface FlashcardDocument extends Omit<Flashcard, '_id'>, Document {}
export interface ReviewSessionDocument extends Omit<ReviewSession, '_id'>, Document {}
export interface StudyStreakDocument extends Omit<StudyStreak, '_id'>, Document {}
export interface WidgetDocument extends Omit<Widget, '_id'>, Document {}
export interface OfflineQueueDocument extends Omit<OfflineQueue, '_id'>, Document {}
export interface CachedDataDocument extends Omit<CachedData, '_id'>, Document {}

const flashcardSchema = new Schema<FlashcardDocument>({
  userId: {
    type: String,
    required: true,
    index: true
  },
  question: {
    type: String,
    required: true,
    trim: true
  },
  answer: {
    type: String,
    required: true,
    trim: true
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  tags: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

const reviewSessionSchema = new Schema<ReviewSessionDocument>({
  userId: {
    type: String,
    required: true,
    index: true
  },
  flashcardId: {
    type: String,
    required: true,
    index: true
  },
  responseQuality: {
    type: Number,
    required: true,
    min: 0,
    max: 5
  },
  timeSpent: {
    type: Number,
    required: true,
    min: 0
  },
  previousInterval: {
    type: Number,
    required: true,
    min: 0
  },
  newInterval: {
    type: Number,
    required: true,
    min: 1
  },
  nextReviewDate: {
    type: Date,
    required: true,
    index: true
  },
  easeFactor: {
    type: Number,
    required: true,
    min: 1.3,
    default: 2.5
  },
  repetitionCount: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  lastReviewed: {
    type: Date,
    required: true
  }
}, {
  timestamps: true
});

const studyStreakSchema = new Schema<StudyStreakDocument>({
  userId: {
    type: String,
    required: true,
    index: true,
    unique: true
  },
  currentStreak: {
    type: Number,
    default: 0,
    min: 0
  },
  longestStreak: {
    type: Number,
    default: 0,
    min: 0
  },
  lastStudyDate: {
    type: Date,
    default: null
  },
  totalStudyDays: {
    type: Number,
    default: 0,
    min: 0
  },
  studyDaysThisWeek: {
    type: Number,
    default: 0,
    min: 0
  },
  studyDaysThisMonth: {
    type: Number,
    default: 0,
    min: 0
  }
}, {
  timestamps: true
});

const widgetSchema = new Schema<WidgetDocument>({
  userId: {
    type: String,
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['study_progress', 'upcoming_reviews', 'focus_session', 'study_streak', 'performance_chart', 'quick_actions'],
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  position: {
    x: { type: Number, required: true, min: 0 },
    y: { type: Number, required: true, min: 0 },
    width: { type: Number, required: true, min: 1 },
    height: { type: Number, required: true, min: 1 },
    minWidth: { type: Number, required: true, min: 1 },
    minHeight: { type: Number, required: true, min: 1 }
  },
  settings: {
    refreshInterval: { type: Number, min: 1, default: 5 },
    showDetails: { type: Boolean, default: true },
    compactView: { type: Boolean, default: false },
    customColors: {
      primary: String,
      secondary: String,
      accent: String
    }
  },
  isVisible: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

const offlineQueueSchema = new Schema<OfflineQueueDocument>({
  userId: {
    type: String,
    required: true,
    index: true
  },
  action: {
    type: String,
    required: true
  },
  data: {
    type: Schema.Types.Mixed,
    required: true
  },
  timestamp: {
    type: Date,
    required: true,
    default: Date.now
  },
  retryCount: {
    type: Number,
    default: 0,
    min: 0
  },
  maxRetries: {
    type: Number,
    default: 3,
    min: 1
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending',
    index: true
  },
  error: String
}, {
  timestamps: true
});

const cachedDataSchema = new Schema<CachedDataDocument>({
  userId: {
    type: String,
    required: true,
    index: true
  },
  dataType: {
    type: String,
    enum: ['flashcards', 'study_sessions', 'tasks', 'performance', 'study_plans'],
    required: true
  },
  data: {
    type: Schema.Types.Mixed,
    required: true
  },
  lastSync: {
    type: Date,
    required: true,
    default: Date.now
  },
  version: {
    type: Number,
    required: true,
    default: 1,
    min: 1
  },
  isValid: {
    type: Boolean,
    default: true
  },
  expiresAt: Date
}, {
  timestamps: true
});

// Indexes for better query performance
flashcardSchema.index({ userId: 1, subject: 1 });
flashcardSchema.index({ userId: 1, tags: 1 });
flashcardSchema.index({ userId: 1, createdAt: -1 });
reviewSessionSchema.index({ userId: 1, nextReviewDate: 1 });
reviewSessionSchema.index({ userId: 1, flashcardId: 1 });
reviewSessionSchema.index({ userId: 1, lastReviewed: -1 });
widgetSchema.index({ userId: 1, type: 1 });
offlineQueueSchema.index({ userId: 1, status: 1, timestamp: 1 });
cachedDataSchema.index({ userId: 1, dataType: 1, lastSync: -1 });

export const FlashcardModel = mongoose.model<FlashcardDocument>('Flashcard', flashcardSchema);
export const ReviewSessionModel = mongoose.model<ReviewSessionDocument>('ReviewSession', reviewSessionSchema);
export const StudyStreakModel = mongoose.model<StudyStreakDocument>('StudyStreak', studyStreakSchema);
export const WidgetModel = mongoose.model<WidgetDocument>('Widget', widgetSchema);
export const OfflineQueueModel = mongoose.model<OfflineQueueDocument>('OfflineQueue', offlineQueueSchema);
export const CachedDataModel = mongoose.model<CachedDataDocument>('CachedData', cachedDataSchema);
