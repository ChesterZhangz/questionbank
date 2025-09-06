import mongoose, { Document, Schema } from 'mongoose';

export interface IPaperBankReview extends Document {
  paperBankId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  rating: number; // 1-5星评分
  comment: string; // 评价内容
  isAnonymous: boolean; // 是否匿名评价
  helpfulCount: number; // 有用评价数
  createdAt: Date;
  updatedAt: Date;
}

const paperBankReviewSchema = new Schema<IPaperBankReview>({
  paperBankId: {
    type: Schema.Types.ObjectId,
    ref: 'PaperBank',
    required: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true,
    maxlength: 1000
  },
  isAnonymous: {
    type: Boolean,
    default: false
  },
  helpfulCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// 复合索引：确保每个用户对每个试卷集只能评价一次
paperBankReviewSchema.index({ paperBankId: 1, userId: 1 }, { unique: true });

// 索引：按试卷集和创建时间排序
paperBankReviewSchema.index({ paperBankId: 1, createdAt: -1 });

// 索引：按评分排序
paperBankReviewSchema.index({ paperBankId: 1, rating: -1 });

export const PaperBankReview = mongoose.model<IPaperBankReview>('PaperBankReview', paperBankReviewSchema);
