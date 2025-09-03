// 试卷模板数据模型
import mongoose, { Document, Schema } from 'mongoose';

export interface IPaperTemplate extends Document {
  name: string;
  type: 'lecture' | 'exercise' | 'exam';
  structure: any;
  // 更多字段...
}

const paperTemplateSchema = new Schema<IPaperTemplate>({
  // 模型定义
});

export const PaperTemplate = mongoose.model<IPaperTemplate>('PaperTemplate', paperTemplateSchema);
