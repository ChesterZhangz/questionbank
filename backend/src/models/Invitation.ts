import mongoose, { Schema, Document } from 'mongoose';

export interface IInvitation extends Document {
  type: 'library' | 'questionBank';
  libraryId?: mongoose.Types.ObjectId;
  questionBankId?: mongoose.Types.ObjectId;
  email: string;
  role: 'owner' | 'admin' | 'editor' | 'viewer' | 'manager' | 'collaborator';
  inviterId: mongoose.Types.ObjectId;
  status: 'pending' | 'accepted' | 'expired';
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const invitationSchema = new Schema<IInvitation>({
  type: {
    type: String,
    enum: ['library', 'questionBank'],
    required: true
  },
  libraryId: {
    type: Schema.Types.ObjectId,
    ref: 'Library'
  },
  questionBankId: {
    type: Schema.Types.ObjectId,
    ref: 'QuestionBank'
  },
  email: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['owner', 'admin', 'editor', 'viewer', 'manager', 'collaborator'],
    default: 'viewer'
  },
  inviterId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'expired'],
    default: 'pending'
  },
  expiresAt: {
    type: Date,
    required: true
  }
}, {
  timestamps: true
});

// 创建复合索引，确保同一邮箱在同一库中只能有一个待处理的邀请
invitationSchema.index({ libraryId: 1, email: 1, status: 1 }, { unique: true, sparse: true });
invitationSchema.index({ questionBankId: 1, email: 1, status: 1 }, { unique: true, sparse: true });

// 自动过期处理
invitationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Invitation = mongoose.model<IInvitation>('Invitation', invitationSchema);
