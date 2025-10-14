import mongoose, { Document, Schema } from 'mongoose';

export interface IAchievement extends Document {
  userId: mongoose.Types.ObjectId;
  badgeId: mongoose.Types.ObjectId;
  unlockedAt: Date;
  pointsEarned: number;
}

const achievementSchema = new Schema<IAchievement>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  badgeId: {
    type: Schema.Types.ObjectId,
    ref: 'Badge',
    required: true
  },
  unlockedAt: {
    type: Date,
    default: Date.now
  },
  pointsEarned: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes
achievementSchema.index({ userId: 1, badgeId: 1 }, { unique: true });
achievementSchema.index({ userId: 1, unlockedAt: -1 });
achievementSchema.index({ badgeId: 1 });
achievementSchema.index({ unlockedAt: -1 });

// Virtual for badge details
achievementSchema.virtual('badge', {
  ref: 'Badge',
  localField: 'badgeId',
  foreignField: '_id',
  justOne: true
});

// Virtual for user details
achievementSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true
});

// Method to get achievement with populated badge
achievementSchema.methods.withBadge = function() {
  return this.populate('badge');
};

// Method to get achievement with populated user
achievementSchema.methods.withUser = function() {
  return this.populate('user', 'username email');
};

// Static method to get user achievements
achievementSchema.statics.getUserAchievements = function(userId: string) {
  return this.find({ userId }).populate('badge').sort({ unlockedAt: -1 });
};

// Static method to get recent achievements
achievementSchema.statics.getRecentAchievements = function(limit: number = 10) {
  return this.find().populate('badge').populate('user', 'username').sort({ unlockedAt: -1 }).limit(limit);
};

// Static method to check if user has achievement
achievementSchema.statics.hasAchievement = function(userId: string, badgeId: string) {
  return this.exists({ userId, badgeId });
};

// Static method to get achievement count by user
achievementSchema.statics.getUserAchievementCount = function(userId: string) {
  return this.countDocuments({ userId });
};

// Static method to get total points earned by user
achievementSchema.statics.getUserTotalPoints = function(userId: string) {
  return this.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
    { $group: { _id: null, totalPoints: { $sum: '$pointsEarned' } } }
  ]);
};

export default mongoose.model<IAchievement>('Achievement', achievementSchema); 