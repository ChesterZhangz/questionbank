import mongoose, { Schema, Document } from 'mongoose';

export type LibraryRole = 'owner' | 'admin' | 'collaborator' | 'viewer';
export type LibraryStatus = 'published' | 'internal' | 'draft';

export interface ILibraryMember {
  user: mongoose.Types.ObjectId;
  role: LibraryRole;
  joinedAt: Date;
}

export interface ILibrary extends Document {
  name: string;
  description?: string;
  avatar?: string;
  tags: string[];
  price: number; // 售价（元）
  status: LibraryStatus;
  owner: mongoose.Types.ObjectId;
  members: ILibraryMember[];
  questions: mongoose.Types.ObjectId[];
  papers: mongoose.Types.ObjectId[];
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const memberSchema = new Schema<ILibraryMember>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  role: { type: String, enum: ['owner', 'admin', 'collaborator', 'viewer'], required: true },
  joinedAt: { type: Date, default: Date.now }
}, { _id: false });

const librarySchema = new Schema<ILibrary>({
  name: { type: String, required: true, trim: true },
  description: { type: String },
  avatar: { type: String },
  tags: [{ type: String, trim: true }],
  price: { type: Number, min: 0, default: 0 },
  status: { type: String, enum: ['published', 'internal', 'draft'], default: 'draft' },
  owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  members: { type: [memberSchema], default: [] },
  questions: { type: [Schema.Types.ObjectId], ref: 'Question', default: [] },
  papers: { type: [Schema.Types.ObjectId], ref: 'Paper', default: [] },
  publishedAt: { type: Date }
}, { timestamps: true });

// 复合索引：用户权限查询优化
librarySchema.index({ owner: 1, createdAt: -1 });
librarySchema.index({ 'members.user': 1, createdAt: -1 });

// 状态和价格索引
librarySchema.index({ status: 1 });
librarySchema.index({ price: 1 });

// 标签索引
librarySchema.index({ tags: 1 });

// 文本搜索索引（用于名称和描述）
librarySchema.index({ name: 'text', description: 'text' });

export const Library = mongoose.model<ILibrary>('Library', librarySchema);


