import mongoose, { Document, Schema } from 'mongoose';

export interface IPaperBankMember extends Document {
  paperBankId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  username: string;
  email: string;
  role: 'owner' | 'manager' | 'collaborator' | 'viewer';
  joinedAt: Date;
  lastActiveAt?: Date;
}

const paperBankMemberSchema = new Schema<IPaperBankMember>({
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
  username: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  role: {
    type: String,
    enum: ['owner', 'manager', 'collaborator', 'viewer'],
    default: 'viewer'
  },
  joinedAt: {
    type: Date,
    default: Date.now
  },
  lastActiveAt: {
    type: Date
  }
}, {
  timestamps: true
});

// 索引
paperBankMemberSchema.index({ paperBankId: 1, userId: 1 }, { unique: true });
paperBankMemberSchema.index({ paperBankId: 1 });
paperBankMemberSchema.index({ userId: 1 });
paperBankMemberSchema.index({ role: 1 });

// 更新最后活跃时间
paperBankMemberSchema.pre('save', function(next) {
  this.lastActiveAt = new Date();
  next();
});

export default mongoose.model<IPaperBankMember>('PaperBankMember', paperBankMemberSchema);
