/*import mongoose, { Document, Schema } from 'mongoose';

export interface Question {
  _id?: string;
  text: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
  subject: string;
  difficulty: 'easy' | 'medium' | 'hard';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface SimulatedExam {
  _id?: string;
  title: string;
  description?: string;
  subject: string;
  questions: Question[];
  duration: number; // em minutos
  totalQuestions: number;
  passingScore: number; // porcentagem
  userId: string;
  isPublic?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ExamResult {
  _id?: string;
  examId: string;
  userId: string;
  answers: { questionId: string; selectedAnswer: number }[];
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  timeSpent: number; // em minutos
  completedAt: Date;
  createdAt?: Date;
}

export interface SimulatedExamDocument extends Omit<SimulatedExam, '_id'>, Document {}
export interface QuestionDocument extends Omit<Question, '_id'>, Document {}
export interface ExamResultDocument extends Omit<ExamResult, '_id'>, Document {}

const questionSchema = new Schema<QuestionDocument>({
  text: {
    type: String,
    required: true,
    trim: true
  },
  options: [{
    type: String,
    required: true,
    trim: true
  }],
  correctAnswer: {
    type: Number,
    required: true,
    min: 0
  },
  explanation: {
    type: String,
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
  }
}, {
  timestamps: true
});

const simulatedExamSchema = new Schema<SimulatedExamDocument>({
  title: {
    type: String,
    required: true,
    trim: true,
    minlength: [1, 'Title cannot be empty']
  },
  description: {
    type: String,
    trim: true
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  questions: [questionSchema],
  duration: {
    type: Number,
    required: true,
    min: 1
  },
  totalQuestions: {
    type: Number,
    required: true,
    min: 1
  },
  passingScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  isPublic: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

const examResultSchema = new Schema<ExamResultDocument>({
  examId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SimulatedExam',
    required: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  answers: [{
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    selectedAnswer: {
      type: Number,
      required: true,
      min: 0
    }
  }],
  score: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  correctAnswers: {
    type: Number,
    required: true,
    min: 0
  },
  totalQuestions: {
    type: Number,
    required: true,
    min: 1
  },
  timeSpent: {
    type: Number,
    required: true,
    min: 0
  },
  completedAt: {
    type: Date,
    required: true
  }
}, {
  timestamps: true
});

// Indexes for better query performance
simulatedExamSchema.index({ userId: 1, subject: 1 });
simulatedExamSchema.index({ userId: 1, createdAt: -1 });
simulatedExamSchema.index({ isPublic: 1 });
examResultSchema.index({ userId: 1, examId: 1 });
examResultSchema.index({ userId: 1, completedAt: -1 });

export const SimulatedExamModel = mongoose.model<SimulatedExamDocument>('SimulatedExam', simulatedExamSchema);
export const QuestionModel = mongoose.model<QuestionDocument>('Question', questionSchema);
export const ExamResultModel = mongoose.model<ExamResultDocument>('ExamResult', examResultSchema);*/
