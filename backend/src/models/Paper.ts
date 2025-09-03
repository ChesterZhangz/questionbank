import mongoose, { Document, Schema } from 'mongoose';

export type QuestionType = 'choice' | 'multiple-choice' | 'fill' | 'solution' | 'truefalse' | 'material';

export interface IQuestionSnapshot {
  stem: string;
  options?: string[];
  answer?: string | string[];
  analysis?: string;
  difficulty?: number;
  type: QuestionType;
  tags?: string[];
  source?: string;
}

export interface IQuestionItem {
  question: mongoose.Types.ObjectId; // 引用原题 _id
  qid?: string; // 业务ID（便于调试）
  score: number;
  manualLines?: number; // Practice: 手动设置的答题区行数（优先于智能计算）
  snapshot?: IQuestionSnapshot; // 发布时生成
}

export interface ISection {
  title: string;
  instruction?: string;
  items: IQuestionItem[];
}

export interface IPaper extends Document {
  name: string;
  type: 'practice' | 'test';
  subject?: string;
  grade?: string;
  timeLimit?: number;
  totalScore: number;
  bank: mongoose.Types.ObjectId; // QuestionBank
  owner: mongoose.Types.ObjectId; // User
  libraryId?: mongoose.Types.ObjectId; // Library（试题库，可选，后续可改为必填）
  status: 'draft' | 'published' | 'modified';
  sections: ISection[];
  // 自定义考生注意信息
  examInstructions?: {
    examDuration?: number; // 考试时长（分钟）
    answerUploadTime?: number; // 答案上传时间（分钟）
    calculatorPolicy?: string; // 计算器使用政策
    answerFormat?: string; // 答案格式要求
    specialNotes?: string[]; // 特殊注意事项
  };
  version: number;
  publishedAt?: Date;
  modifiedAt?: Date;
  modifiedBy?: mongoose.Types.ObjectId; // 修改者
  createdAt: Date;
  updatedAt: Date;
}

const questionSnapshotSchema = new Schema<IQuestionSnapshot>({
  stem: { type: String, required: true },
  options: [{ type: String }],
  answer: { type: Schema.Types.Mixed },
  analysis: { type: String },
  difficulty: { type: Number, min: 1, max: 5 },
  type: { type: String, enum: ['choice', 'multiple-choice', 'fill', 'solution'], required: true },
  tags: [{ type: String }]
}, { _id: false });

const questionItemSchema = new Schema<IQuestionItem>({
  question: { type: Schema.Types.ObjectId, ref: 'Question', required: true },
  qid: { type: String },
  score: { type: Number, required: true, min: 0 },
  manualLines: { type: Number, min: 3, max: 30 },
  snapshot: { type: questionSnapshotSchema, required: false }
}, { _id: false });

const sectionSchema = new Schema<ISection>({
  title: { type: String, required: true },
  instruction: { type: String },
  items: { type: [questionItemSchema], default: [] }
}, { _id: false });

const examInstructionsSchema = new Schema({
  examDuration: { type: Number, min: 0 },
  answerUploadTime: { type: Number, min: 0 },
  calculatorPolicy: { type: String },
  answerFormat: { type: String },
  specialNotes: [{ type: String }]
}, { _id: false });

const paperSchema = new Schema<IPaper>({
  name: { type: String, required: true, trim: true },
  type: { type: String, enum: ['practice', 'test'], required: true },
  subject: { type: String, trim: true },
  grade: { type: String, trim: true },
  timeLimit: { type: Number, min: 0 },
  totalScore: { type: Number, required: true, min: 0 },
  bank: { type: Schema.Types.ObjectId, ref: 'QuestionBank', required: true },
  owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  libraryId: { type: Schema.Types.ObjectId, ref: 'Library' },
  status: { type: String, enum: ['draft', 'published', 'modified'], default: 'draft' },
  sections: { type: [sectionSchema], default: [] },
  examInstructions: { type: examInstructionsSchema },
  version: { type: Number, default: 1 },
  publishedAt: { type: Date },
  modifiedAt: { type: Date },
  modifiedBy: { type: Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

paperSchema.index({ owner: 1, createdAt: -1 });
paperSchema.index({ bank: 1 });
paperSchema.index({ libraryId: 1 });
paperSchema.index({ status: 1 });
paperSchema.index({ name: 'text', subject: 'text', grade: 'text' });
// 添加复合索引优化试卷集查询
paperSchema.index({ libraryId: 1, status: 1 });
paperSchema.index({ libraryId: 1, createdAt: -1 });
paperSchema.index({ libraryId: 1, status: 1, createdAt: -1 });

export const Paper = mongoose.model<IPaper>('Paper', paperSchema);


