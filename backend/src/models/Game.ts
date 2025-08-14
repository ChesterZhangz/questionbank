import mongoose, { Document, Schema } from 'mongoose';

// 游戏记录接口
export interface IGameRecord extends Document {
  userId: mongoose.Types.ObjectId;
  gameType: 'math' | 'memory' | 'puzzle' | 'reaction';
  score: number;
  difficulty?: string;
  settings?: {
    timeLimit: number;
    gridSize?: number;
    difficulty?: string;
  };
  gameData?: {
    moves?: number;
    timeUsed?: number;
    accuracy?: number;
    bestTime?: number;
    averageTime?: number;
    rounds?: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

// 排行榜接口
export interface ILeaderboard extends Document {
  gameType: 'math' | 'memory' | 'puzzle' | 'reaction';
  userId: mongoose.Types.ObjectId;
  username: string;
  score: number;
  rank: number;
  difficulty?: string;
  settings?: {
    timeLimit: number;
    gridSize?: number;
    difficulty?: string;
  };
  gameData?: {
    moves?: number;
    timeUsed?: number;
    accuracy?: number;
    bestTime?: number;
    averageTime?: number;
    rounds?: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

// 用户游戏统计接口
export interface IUserGameStats extends Document {
  userId: mongoose.Types.ObjectId;
  username: string;
  totalGames: number;
  totalScore: number;
  averageScore: number;
  bestScores: {
    math: number;
    memory: number;
    puzzle: number;
    reaction: number;
  };
  gameCounts: {
    math: number;
    memory: number;
    puzzle: number;
    reaction: number;
  };
  dailyGameCount: number;
  lastGameDate: Date;
  isGameDisabled: boolean;
  gameDisabledUntil?: Date;
  achievements: string[];
  lastPlayed: Date;
  createdAt: Date;
  updatedAt: Date;
}

// 游戏记录模型
const GameRecordSchema = new Schema<IGameRecord>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  gameType: {
    type: String,
    enum: ['math', 'memory', 'puzzle', 'reaction'],
    required: true
  },
  score: {
    type: Number,
    required: true,
    min: 0
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  settings: {
    timeLimit: {
      type: Number,
      default: 60
    },
    gridSize: {
      type: Number,
      min: 3,
      max: 6
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard']
    }
  },
  gameData: {
    moves: Number,
    timeUsed: Number,
    accuracy: Number,
    bestTime: Number,
    averageTime: Number,
    rounds: Number
  }
}, {
  timestamps: true
});

// 排行榜模型
const LeaderboardSchema = new Schema<ILeaderboard>({
  gameType: {
    type: String,
    enum: ['math', 'memory', 'puzzle', 'reaction'],
    required: true,
    index: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  username: {
    type: String,
    required: true
  },
  score: {
    type: Number,
    required: true,
    min: 0
  },
  rank: {
    type: Number,
    required: true,
    min: 1
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  settings: {
    timeLimit: {
      type: Number,
      default: 60
    },
    gridSize: {
      type: Number,
      min: 3,
      max: 6
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard']
    }
  },
  gameData: {
    moves: Number,
    timeUsed: Number,
    accuracy: Number,
    bestTime: Number,
    averageTime: Number,
    rounds: Number
  }
}, {
  timestamps: true
});

// 用户游戏统计模型
const UserGameStatsSchema = new Schema<IUserGameStats>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },
  username: {
    type: String,
    required: true
  },
  totalGames: {
    type: Number,
    default: 0,
    min: 0
  },
  totalScore: {
    type: Number,
    default: 0,
    min: 0
  },
  averageScore: {
    type: Number,
    default: 0,
    min: 0
  },
  bestScores: {
    math: {
      type: Number,
      default: 0,
      min: 0
    },
    memory: {
      type: Number,
      default: 0,
      min: 0
    },
    puzzle: {
      type: Number,
      default: 0,
      min: 0
    },
    reaction: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  gameCounts: {
    math: {
      type: Number,
      default: 0,
      min: 0
    },
    memory: {
      type: Number,
      default: 0,
      min: 0
    },
    puzzle: {
      type: Number,
      default: 0,
      min: 0
    },
    reaction: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  dailyGameCount: {
    type: Number,
    default: 0,
    min: 0
  },
  lastGameDate: {
    type: Date,
    default: Date.now
  },
  isGameDisabled: {
    type: Boolean,
    default: false
  },
  gameDisabledUntil: {
    type: Date
  },
  achievements: [{
    type: String
  }],
  lastPlayed: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// 创建复合索引
GameRecordSchema.index({ userId: 1, gameType: 1, createdAt: -1 });
GameRecordSchema.index({ gameType: 1, score: -1, createdAt: -1 });
LeaderboardSchema.index({ gameType: 1, score: -1 });
LeaderboardSchema.index({ gameType: 1, userId: 1 }, { unique: true });

// 导出模型
export const GameRecord = mongoose.model<IGameRecord>('GameRecord', GameRecordSchema);
export const Leaderboard = mongoose.model<ILeaderboard>('Leaderboard', LeaderboardSchema);
export const UserGameStats = mongoose.model<IUserGameStats>('UserGameStats', UserGameStatsSchema); 