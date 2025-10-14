import mongoose, { Document, Schema } from 'mongoose';
import type { Flashcard } from '../types';

export interface FlashcardDocument extends Flashcard, Document {}

const flashcardSchema = new Schema<FlashcardDocument>({
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true 
  },
  question: { 
    type: String, 
    required: true, 
    trim: true,
    maxlength: [1000, 'Question cannot be more than 1000 characters']
  },
  answer: { 
    type: String, 
    required: true, 
    trim: true,
    maxlength: [2000, 'Answer cannot be more than 2000 characters']
  },
  category: { 
    type: String, 
    required: true, 
    trim: true,
    maxlength: [100, 'Category cannot be more than 100 characters']
  },
  difficulty: { 
    type: String, 
    required: true, 
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  lastReviewed: { 
    type: Date 
  },
  nextReview: { 
    type: Date,
    index: true 
  },
  reviewCount: { 
    type: Number, 
    default: 0,
    min: [0, 'Review count cannot be negative']
  },
  isActive: { 
    type: Boolean, 
    default: true,
    index: true 
  },
  tags: [{ 
    type: String, 
    trim: true 
  }]
}, { 
  timestamps: true,
  toJSON: { 
    transform: (doc, ret) => {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// Índices para performance
flashcardSchema.index({ userId: 1, category: 1 });
flashcardSchema.index({ userId: 1, difficulty: 1 });
flashcardSchema.index({ userId: 1, isActive: 1 });
flashcardSchema.index({ userId: 1, nextReview: 1 });

// Virtual para calcular se está pronto para revisão
flashcardSchema.virtual('isReadyForReview').get(function() {
  if (!this.nextReview) return true;
  return new Date() >= this.nextReview;
});

// Método para calcular próxima revisão baseado no algoritmo de repetição espaçada
flashcardSchema.methods.calculateNextReview = function(wasCorrect: boolean): void {
  const now = new Date();
  this.lastReviewed = now;
  this.reviewCount += 1;

  // Algoritmo de repetição espaçada simples
  let daysToAdd = 1; // Primeira revisão: 1 dia
  
  if (this.reviewCount > 1) {
    if (wasCorrect) {
      // Se acertou, aumenta o intervalo
      daysToAdd = Math.min(Math.pow(2, this.reviewCount - 1), 30); // Máximo 30 dias
    } else {
      // Se errou, volta para 1 dia
      daysToAdd = 1;
      this.reviewCount = Math.max(1, this.reviewCount - 1);
    }
  }

  const nextReview = new Date(now);
  nextReview.setDate(nextReview.getDate() + daysToAdd);
  this.nextReview = nextReview;
};

// Método para resetar revisão
flashcardSchema.methods.resetReview = function(): void {
  this.reviewCount = 0;
  this.lastReviewed = undefined;
  this.nextReview = undefined;
};

export const FlashcardModel = mongoose.model<FlashcardDocument>('Flashcard', flashcardSchema); 