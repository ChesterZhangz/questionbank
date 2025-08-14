import mongoose, { Document, Schema } from 'mongoose';

export interface ILoginHistory extends Document {
  userId: mongoose.Types.ObjectId;
  timestamp: Date;
  ip: string;
  userAgent: string;
  device: string;
  browser: string;
  os: string;
  location?: string;
  status: 'success' | 'failed';
  failureReason?: string;
  createdAt: Date;
}

const loginHistorySchema = new Schema<ILoginHistory>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  ip: {
    type: String,
    required: true
  },
  userAgent: {
    type: String,
    required: true
  },
  device: {
    type: String,
    required: true
  },
  browser: {
    type: String,
    required: true
  },
  os: {
    type: String,
    required: true
  },
  location: {
    type: String
  },
  status: {
    type: String,
    enum: ['success', 'failed'],
    required: true
  },
  failureReason: {
    type: String
  }
}, {
  timestamps: true
});

// 索引
loginHistorySchema.index({ userId: 1, timestamp: -1 });
loginHistorySchema.index({ timestamp: -1 });

export const LoginHistory = mongoose.model<ILoginHistory>('LoginHistory', loginHistorySchema); 