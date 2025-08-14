import mongoose, { Schema, Document } from 'mongoose';

export interface ILibraryInvitation extends Document {
  libraryId: mongoose.Types.ObjectId;
  inviterId: mongoose.Types.ObjectId; // 邀请人ID
  inviteeEmail: string; // 被邀请人邮箱
  role: 'admin' | 'collaborator' | 'viewer';
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  token: string; // 邀请链接的token
  expiresAt: Date; // 邀请过期时间
  acceptedAt?: Date;
  declinedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const libraryInvitationSchema = new Schema<ILibraryInvitation>({
  libraryId: { type: Schema.Types.ObjectId, ref: 'Library', required: true },
  inviterId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  inviteeEmail: { type: String, required: true, trim: true, lowercase: true },
  role: { type: String, enum: ['admin', 'collaborator', 'viewer'], required: true },
  status: { type: String, enum: ['pending', 'accepted', 'declined', 'expired'], default: 'pending' },
  token: { type: String, required: true, unique: true },
  expiresAt: { type: Date, required: true },
  acceptedAt: { type: Date },
  declinedAt: { type: Date }
}, { timestamps: true });

libraryInvitationSchema.index({ libraryId: 1, inviteeEmail: 1 });
libraryInvitationSchema.index({ token: 1 }, { unique: true });
libraryInvitationSchema.index({ status: 1, expiresAt: 1 });

export const LibraryInvitation = mongoose.model<ILibraryInvitation>('LibraryInvitation', libraryInvitationSchema);
