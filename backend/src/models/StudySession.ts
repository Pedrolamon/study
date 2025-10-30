/*import mongoose, { Document, Schema } from 'mongoose';
import type { StudySession } from '../types';

export interface StudySessionDocument extends StudySession, Document {}

const studySessionSchema = new Schema<StudySessionDocument>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  mode: {
    type: String,
    enum: ['pomodoro', 'flowtime', 'custom'],
    required: true
  },
  subject: {
    type: String,
    trim: true
  },
  startTime: {
    type: String,
    required: true,
    validate: {
      validator: function(v: string) {
        const date = new Date(v);
        return !isNaN(date.getTime());
      },
      message: 'Invalid start time format'
    }
  },
  endTime: {
    type: String,
    validate: {
      validator: function(v: string) {
        if (!v) return true;
        const date = new Date(v);
        return !isNaN(date.getTime());
      },
      message: 'Invalid end time format'
    }
  },
  duration: {
    type: Number,
    required: true,
    min: [1, 'Duration must be at least 1 minute']
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for better query performance
studySessionSchema.index({ userId: 1, createdAt: -1 });
studySessionSchema.index({ userId: 1, mode: 1 });
studySessionSchema.index({ userId: 1, isActive: 1 });
studySessionSchema.index({ userId: 1, startTime: -1 });

// Virtual for session status
studySessionSchema.virtual('isCompleted').get(function() {
  return !!this.endTime;
});

// Virtual for session duration in hours
studySessionSchema.virtual('durationHours').get(function() {
  return this.duration / 60;
});

// Ensure virtuals are included in JSON output
studySessionSchema.set('toJSON', { virtuals: true });

export const StudySessionModel = mongoose.model<StudySessionDocument>('StudySession', studySessionSchema); */