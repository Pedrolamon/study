/*import mongoose, { Document, Schema } from 'mongoose';
import type { Notification } from '../types';

export interface NotificationDocument extends Notification, Document {}

const notificationSchema = new Schema<NotificationDocument>({
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
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  message: { 
    type: String, 
    required: true, 
    trim: true,
    maxlength: [500, 'Message cannot be more than 500 characters']
  },
  type: { 
    type: String, 
    required: true, 
    enum: ['task', 'study', 'exam', 'reminder', 'achievement', 'system'],
    default: 'system'
  },
  isRead: { 
    type: Boolean, 
    default: false,
    index: true 
  },
  isEmailSent: { 
    type: Boolean, 
    default: false 
  },
  scheduledFor: { 
    type: Date,
    index: true 
  },
  sentAt: { 
    type: Date 
  }
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
notificationSchema.index({ userId: 1, isRead: 1 });
notificationSchema.index({ userId: 1, type: 1 });
notificationSchema.index({ scheduledFor: 1, isEmailSent: 1 });

// Método para marcar como lida
notificationSchema.methods.markAsRead = function(): Promise<void> {
  this.isRead = true;
  return this.save();
};

// Método para marcar como enviada por email
notificationSchema.methods.markAsEmailSent = function(): Promise<void> {
  this.isEmailSent = true;
  this.sentAt = new Date();
  return this.save();
};

export const NotificationModel = mongoose.model<NotificationDocument>('Notification', notificationSchema); */