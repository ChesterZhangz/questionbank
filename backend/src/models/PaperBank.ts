import mongoose, { Document, Schema } from 'mongoose';

export interface IPaperBank extends Document {
  name: string;
  description: string;
  avatar?: string;
  status: 'draft' | 'published';
  ownerId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  category: string;
  subcategory?: string;
  price?: number; // 价格
  memberCount: number;
  paperCount: number;
  rating: number;
  purchaseCount: number;
  customTags: string[]; // 用户自定义标签
}

const paperBankSchema = new Schema<IPaperBank>({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  avatar: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'draft'
  },
  ownerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  publishedAt: {
    type: Date
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  subcategory: {
    type: String,
    trim: true
  },
  price: {
    type: Number,
    min: 0,
    default: 0
  },
  memberCount: {
    type: Number,
    min: 0,
    default: 0
  },
  paperCount: {
    type: Number,
    min: 0,
    default: 0
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  purchaseCount: {
    type: Number,
    min: 0,
    default: 0
  },
  customTags: [{
    type: String,
    trim: true,
    maxlength: 30
  }]
}, {
  timestamps: true
});

// 索引
paperBankSchema.index({ ownerId: 1 });
paperBankSchema.index({ status: 1 });
paperBankSchema.index({ category: 1 });
paperBankSchema.index({ subcategory: 1 });
paperBankSchema.index({ customTags: 1 });
paperBankSchema.index({ createdAt: -1 });

// 发布时自动设置publishedAt
paperBankSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  next();
});

export default mongoose.model<IPaperBank>('PaperBank', paperBankSchema);
