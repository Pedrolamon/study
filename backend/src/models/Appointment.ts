/*import mongoose, { Document, Schema } from 'mongoose';
import type { Appointment } from '../types';

export interface AppointmentDocument extends Omit<Appointment, 'id' | '_id'>, Document {}

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

const appointmentSchema = new Schema<AppointmentDocument>({
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
  date: {
    type: String,
    required: true,
    validate: {
      validator: function(v: string) {
        const date = new Date(v);
        return !isNaN(date.getTime());
      },
      message: 'Invalid date format'
    }
  },
  startTime: {
    type: String,
    required: true,
    validate: {
      validator: function(v: string) {
        const time = new Date(`2000-01-01T${v}`);
        return !isNaN(time.getTime());
      },
      message: 'Invalid time format'
    }
  },
  endTime: {
    type: String,
    required: true,
    validate: {
      validator: function(v: string) {
        const time = new Date(`2000-01-01T${v}`);
        return !isNaN(time.getTime());
      },
      message: 'Invalid time format'
    }
  },
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurrenceType: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'yearly'],
    required: function() {
      return this.isRecurring;
    }
  },
  recurrenceEndDate: {
    type: String,
    validate: {
      validator: function(v: string) {
        if (!v) return true;
        const date = new Date(v);
        return !isNaN(date.getTime());
      },
      message: 'Invalid recurrence end date format'
    }
  },
  reminders: {
    type: [reminderSchema],
    default: []
  }
}, {
  timestamps: true
});

// Indexes for better query performance
appointmentSchema.index({ userId: 1, date: 1 });
appointmentSchema.index({ userId: 1, startTime: 1 });
appointmentSchema.index({ userId: 1, isRecurring: 1 });
appointmentSchema.index({ userId: 1, createdAt: -1 });

// Virtual for appointment duration
appointmentSchema.virtual('duration').get(function() {
  const start = new Date(`2000-01-01T${this.startTime}`);
  const end = new Date(`2000-01-01T${this.endTime}`);
  return (end.getTime() - start.getTime()) / (1000 * 60); // in minutes
});

// Virtual for appointment status
appointmentSchema.virtual('isPast').get(function() {
  const now = new Date();
  const appointmentDate = new Date(`${this.date}T${this.endTime}`);
  return appointmentDate < now;
});

// Ensure virtuals are included in JSON output
appointmentSchema.set('toJSON', { virtuals: true });

export const AppointmentModel = mongoose.model<AppointmentDocument>('Appointment', appointmentSchema); */