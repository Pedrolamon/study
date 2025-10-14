import mongoose, { Document, Schema } from 'mongoose';

export interface EditalTopic {
  _id?: string;
  name: string;
  description?: string;
  weight: number; // peso no edital (0-100)
  estimatedHours: number; // horas estimadas para estudo
  difficulty: 'easy' | 'medium' | 'hard';
  prerequisites?: string[]; // tópicos pré-requisitos
  subject: string;
  subtopics?: string[];
}

export interface Edital {
  _id?: string;
  title: string;
  description?: string;
  examType: string; // tipo de concurso
  organization: string; // órgão responsável
  examDate: Date;
  totalTopics: number;
  topics: EditalTopic[];
  userId: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface StudySessionPlan {
  _id?: string;
  topicId: string;
  topicName: string;
  subject: string;
  scheduledDate: Date;
  duration: number; // minutos
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'completed' | 'postponed';
  actualDuration?: number;
  notes?: string;
  performance?: number; // 0-100, based on related exam results
}

export interface StudyPlan {
  _id?: string;
  title: string;
  description?: string;
  editalId: string;
  userId: string;
  startDate: Date;
  endDate: Date;
  totalHours: number;
  dailyHours: number;
  sessions: StudySessionPlan[];
  isActive: boolean;
  progress: number; // 0-100
  lastUpdated: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PerformanceMetrics {
  topicId: string;
  averageScore: number;
  totalAttempts: number;
  timeSpent: number;
  lastStudied: Date;
  mastery: 'low' | 'medium' | 'high'; // based on performance
}

export interface EditalDocument extends Omit<Edital, '_id'>, Document {}
export interface StudyPlanDocument extends Omit<StudyPlan, '_id'>, Document {}
export interface PerformanceMetricsDocument extends PerformanceMetrics, Document {}

const editalTopicSchema = new Schema<EditalTopic>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  weight: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  estimatedHours: {
    type: Number,
    required: true,
    min: 0
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  prerequisites: [{
    type: String,
    trim: true
  }],
  subject: {
    type: String,
    required: true,
    trim: true
  },
  subtopics: [{
    type: String,
    trim: true
  }]
}, { _id: true });

const editalSchema = new Schema<EditalDocument>({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  examType: {
    type: String,
    required: true,
    trim: true
  },
  organization: {
    type: String,
    required: true,
    trim: true
  },
  examDate: {
    type: Date,
    required: true
  },
  totalTopics: {
    type: Number,
    required: true,
    min: 1
  },
  topics: [editalTopicSchema],
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

const studySessionPlanSchema = new Schema<StudySessionPlan>({
  topicId: {
    type: String,
    required: true
  },
  topicName: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  scheduledDate: {
    type: Date,
    required: true
  },
  duration: {
    type: Number,
    required: true,
    min: 15
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'postponed'],
    default: 'pending'
  },
  actualDuration: {
    type: Number,
    min: 0
  },
  notes: {
    type: String,
    trim: true
  },
  performance: {
    type: Number,
    min: 0,
    max: 100
  }
}, { _id: true });

const studyPlanSchema = new Schema<StudyPlanDocument>({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  editalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Edital',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  totalHours: {
    type: Number,
    required: true,
    min: 1
  },
  dailyHours: {
    type: Number,
    required: true,
    min: 1
  },
  sessions: [studySessionPlanSchema],
  isActive: {
    type: Boolean,
    default: true
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const performanceMetricsSchema = new Schema<PerformanceMetricsDocument>({
  topicId: {
    type: String,
    required: true,
    index: true
  },
  averageScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  totalAttempts: {
    type: Number,
    required: true,
    min: 0
  },
  timeSpent: {
    type: Number,
    required: true,
    min: 0
  },
  lastStudied: {
    type: Date,
    required: true
  },
  mastery: {
    type: String,
    enum: ['low', 'medium', 'high'],
    required: true
  }
});

// Indexes for better query performance
editalSchema.index({ userId: 1, examDate: 1 });
editalSchema.index({ userId: 1, isActive: 1 });
studyPlanSchema.index({ userId: 1, isActive: 1 });
studyPlanSchema.index({ userId: 1, startDate: 1, endDate: 1 });
performanceMetricsSchema.index({ topicId: 1 });

export const EditalModel = mongoose.model<EditalDocument>('Edital', editalSchema);
export const StudyPlanModel = mongoose.model<StudyPlanDocument>('StudyPlan', studyPlanSchema);
export const PerformanceMetricsModel = mongoose.model<PerformanceMetricsDocument>('PerformanceMetrics', performanceMetricsSchema);
