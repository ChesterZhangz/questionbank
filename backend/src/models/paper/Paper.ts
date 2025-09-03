// 试卷数据模型
import mongoose, { Document, Schema } from 'mongoose';

export interface IPaper extends Document {
  name: string;
  type: 'lecture' | 'exercise' | 'exam';
  content: string;
  // 更多字段...
}

const paperSchema = new Schema<IPaper>({
  // 模型定义
});

export const Paper = mongoose.model<IPaper>('Paper', paperSchema);
