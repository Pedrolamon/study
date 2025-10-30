/*import mongoose, { Document, Schema } from 'mongoose';

export interface IBadge extends Document {
  name: string;
  description: string;
  icon: string;
  category: 'study' | 'achievement' | 'social' | 'special';
  pointsReward: number;
  requirements: {
    type: 'tasks_completed' | 'study_time' | 'flashcards_reviewed' | 'materials_uploaded' | 'streak_days' | 'perfect_sessions';
    value: number;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const badgeSchema = new Schema<IBadge>({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  icon: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['study', 'achievement', 'social', 'special'],
    default: 'achievement'
  },
  pointsReward: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  requirements: {
    type: {
      type: String,
      required: true,
      enum: ['tasks_completed', 'study_time', 'flashcards_reviewed', 'materials_uploaded', 'streak_days', 'perfect_sessions']
    },
    value: {
      type: Number,
      required: true,
      min: 1
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes
badgeSchema.index({ category: 1, isActive: 1 });
badgeSchema.index({ 'requirements.type': 1 });
badgeSchema.index({ pointsReward: -1 });

// Virtual for formatted name
badgeSchema.virtual('displayName').get(function() {
  return `${this.name} (${this.pointsReward} pontos)`;
});

// Method to check if user has unlocked this badge
badgeSchema.methods.isUnlockedByUser = async function(userId: string): Promise<boolean> {
  const Achievement = mongoose.model('Achievement');
  const achievement = await Achievement.findOne({ userId, badgeId: this._id });
  return !!achievement;
};

// Method to get badge progress for a user
badgeSchema.methods.getUserProgress = async function(userId: string): Promise<{ current: number; required: number; percentage: number }> {
  const User = mongoose.model('User');
  const Task = mongoose.model('Task');
  const StudySession = mongoose.model('StudySession');
  const Flashcard = mongoose.model('Flashcard');
  const StudyMaterial = mongoose.model('StudyMaterial');
  
  let current = 0;
  const required = this.requirements.value;
  
  switch (this.requirements.type) {
    case 'tasks_completed':
      current = await Task.countDocuments({ userId, completed: true });
      break;
    case 'study_time':
      const sessions = await StudySession.find({ userId, endTime: { $exists: true } });
      current = sessions.reduce((total, session) => {
        const duration = session.endTime!.getTime() - session.startTime.getTime();
        return total + Math.floor(duration / (1000 * 60)); // Convert to minutes
      }, 0);
      break;
    case 'flashcards_reviewed':
      const flashcards = await Flashcard.find({ userId });
      current = flashcards.reduce((total, card) => total + (card.reviewCount || 0), 0);
      break;
    case 'materials_uploaded':
      current = await StudyMaterial.countDocuments({ userId });
      break;
    case 'streak_days':
      // Calculate study streak
      const user = await User.findById(userId);
      if (user && user.studyStreak) {
        current = user.studyStreak;
      }
      break;
    case 'perfect_sessions':
      const perfectSessions = await StudySession.countDocuments({
        userId,
        endTime: { $exists: true },
        duration: { $gte: 25 } // Sessions of 25+ minutes
      });
      current = perfectSessions;
      break;
  }
  
  const percentage = Math.min((current / required) * 100, 100);
  
  return { current, required, percentage };
};

// Static method to get all active badges
badgeSchema.statics.getActiveBadges = function() {
  return this.find({ isActive: true }).sort({ category: 1, pointsReward: 1 });
};

// Static method to get badges by category
badgeSchema.statics.getBadgesByCategory = function(category: string) {
  return this.find({ category, isActive: true }).sort({ pointsReward: 1 });
};

export default mongoose.model<IBadge>('Badge', badgeSchema); */