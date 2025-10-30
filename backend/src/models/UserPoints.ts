/*import mongoose, { Document, Schema } from 'mongoose';

export interface IUserPoints extends Document {
  userId: mongoose.Types.ObjectId;
  totalPoints: number;
  level: number;
  experience: number;
  experienceToNextLevel: number;
  pointsHistory: {
    date: Date;
    points: number;
    reason: string;
    source: 'task' | 'study' | 'flashcard' | 'material' | 'badge' | 'streak';
  }[];
  lastUpdated: Date;
}

const userPointsSchema = new Schema<IUserPoints>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  totalPoints: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  level: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  },
  experience: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  experienceToNextLevel: {
    type: Number,
    required: true,
    min: 1,
    default: 100
  },
  pointsHistory: [{
    date: {
      type: Date,
      default: Date.now
    },
    points: {
      type: Number,
      required: true
    },
    reason: {
      type: String,
      required: true,
      trim: true
    },
    source: {
      type: String,
      required: true,
      enum: ['task', 'study', 'flashcard', 'material', 'badge', 'streak']
    }
  }],
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes
userPointsSchema.index({ userId: 1 });
userPointsSchema.index({ totalPoints: -1 });
userPointsSchema.index({ level: -1 });
userPointsSchema.index({ 'pointsHistory.date': -1 });

// Virtual for user details
userPointsSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true
});

// Method to add points and update level
userPointsSchema.methods.addPoints = function(points: number, reason: string, source: string) {
  this.totalPoints += points;
  this.experience += points;
  
  // Add to history
  this.pointsHistory.push({
    date: new Date(),
    points,
    reason,
    source: source as any
  });
  
  // Keep only last 100 entries
  if (this.pointsHistory.length > 100) {
    this.pointsHistory = this.pointsHistory.slice(-100);
  }
  
  // Check for level up
  while (this.experience >= this.experienceToNextLevel) {
    this.levelUp();
  }
  
  this.lastUpdated = new Date();
  return this.save();
};

// Method to level up
userPointsSchema.methods.levelUp = function() {
  this.level += 1;
  this.experience -= this.experienceToNextLevel;
  
  // Calculate next level experience (increasing difficulty)
  this.experienceToNextLevel = Math.floor(this.experienceToNextLevel * 1.2);
  
  return this;
};

// Method to get level progress percentage
userPointsSchema.methods.getLevelProgress = function(): number {
  return Math.min((this.experience / this.experienceToNextLevel) * 100, 100);
};

// Method to get recent points history
userPointsSchema.methods.getRecentHistory = function(limit: number = 10) {
  return this.pointsHistory
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, limit);
};

// Method to get points by source
userPointsSchema.methods.getPointsBySource = function() {
  const sourcePoints: { [key: string]: number } = {};
  
  this.pointsHistory.forEach(entry => {
    if (!sourcePoints[entry.source]) {
      sourcePoints[entry.source] = 0;
    }
    sourcePoints[entry.source] += entry.points;
  });
  
  return sourcePoints;
};

// Static method to get leaderboard
userPointsSchema.statics.getLeaderboard = function(limit: number = 50) {
  return this.find()
    .populate('user', 'username email')
    .sort({ totalPoints: -1, level: -1 })
    .limit(limit);
};

// Static method to get user rank
userPointsSchema.statics.getUserRank = function(userId: string) {
  return this.countDocuments({ totalPoints: { $gt: 0 } }) + 1;
};

// Static method to get top users by level
userPointsSchema.statics.getTopByLevel = function(limit: number = 10) {
  return this.find()
    .populate('user', 'username email')
    .sort({ level: -1, experience: -1 })
    .limit(limit);
};

// Static method to get user points with populated user
userPointsSchema.statics.getUserPoints = function(userId: string) {
  return this.findOne({ userId }).populate('user', 'username email');
};

// Static method to create or get user points
userPointsSchema.statics.getOrCreateUserPoints = async function(userId: string) {
  let userPoints = await this.findOne({ userId });
  
  if (!userPoints) {
    userPoints = new this({
      userId,
      totalPoints: 0,
      level: 1,
      experience: 0,
      experienceToNextLevel: 100,
      pointsHistory: []
    });
    await userPoints.save();
  }
  
  return userPoints;
};

export default mongoose.model<IUserPoints>('UserPoints', userPointsSchema); */