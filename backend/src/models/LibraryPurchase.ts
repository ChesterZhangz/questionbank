import mongoose, { Schema, Document } from 'mongoose';

export interface ILibraryPurchase extends Document {
  libraryId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  purchaseDate: Date;
  amount: number; // 购买金额
  paymentMethod?: string; // 支付方式
  transactionId?: string; // 交易ID
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  expiresAt?: Date; // 访问过期时间（如果有的话）
  createdAt: Date;
  updatedAt: Date;
}

const libraryPurchaseSchema = new Schema<ILibraryPurchase>({
  libraryId: { type: Schema.Types.ObjectId, ref: 'Library', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  purchaseDate: { type: Date, default: Date.now },
  amount: { type: Number, required: true, min: 0 },
  paymentMethod: { type: String },
  transactionId: { type: String },
  status: { type: String, enum: ['pending', 'completed', 'failed', 'refunded'], default: 'pending' },
  expiresAt: { type: Date }
}, { timestamps: true });

libraryPurchaseSchema.index({ libraryId: 1, userId: 1 }, { unique: true });
libraryPurchaseSchema.index({ userId: 1, purchaseDate: -1 });
libraryPurchaseSchema.index({ status: 1 });

export const LibraryPurchase = mongoose.model<ILibraryPurchase>('LibraryPurchase', libraryPurchaseSchema);
