import mongoose, { Document, Schema } from 'mongoose';
import type { Task } from '../types';

export interface TaskDocument extends Task, Document {}

const reminderSchema = new Schema({
  type: {
    type: String,
    enum: ['same-day', 'hours-before'],
    required: true
  },
  hoursBefore: {
    type: Number,
    min: 0
  },
  time: String,
  isActive: {
    type: Boolean,
    default: true
  }
}, { _id: true });

const taskSchema = new Schema<TaskDocument>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
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
  completed: {
    type: Boolean,
    default: false
  },
  completedOnTime: {
    type: Boolean,
    default: null
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  dueDate: {
    type: String,
    validate: {
      validator: function(v: string) {
        if (!v) return true;
        const date = new Date(v);
        return !isNaN(date.getTime());
      },
      message: 'Invalid date format'
    }
  }
}, {
  timestamps: true
});

// Indexes for better query performance
taskSchema.index({ userId: 1, completed: 1 });
taskSchema.index({ userId: 1, dueDate: 1 });
taskSchema.index({ userId: 1, priority: 1 });
taskSchema.index({ userId: 1, createdAt: -1 });

// Virtual for overdue status
taskSchema.virtual('isOverdue').get(function() {
  if (!this.dueDate || this.completed) return false;
  const today = new Date().toISOString().split('T')[0];
  return this.dueDate < today;
});

// Ensure virtuals are included in JSON output
taskSchema.set('toJSON', { virtuals: true });

export const TaskModel = mongoose.model<TaskDocument>('Task', taskSchema); 