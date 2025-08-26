import mongoose, { Schema, Document } from 'mongoose';

// 题目草稿接口
export interface IQuestionDraft extends Document {
  _id: string;
  name: string;
  description?: string;
  questions: Array<{
    _id: string;
    id?: string; // 本地ID，用于拖拽等操作
    qid: string;
    bid: string; // 所属题库ID
    type: 'choice' | 'multiple-choice' | 'fill' | 'solution';
    content: {
      stem: string;
      options?: Array<{
        text: string;
        isCorrect: boolean;
      }>;
      answer: string;
      fillAnswers?: string[];
      solutionAnswers?: string[];
      solution?: string;
    };
    category?: string[]; // 小题型（最多三个）
    tags?: string[]; // 知识点标签（最多五个）
    source?: string; // 题目出处
    creator: mongoose.Types.ObjectId; // 创建者ID
    questionBank: string; // 题库引用
    status: 'draft' | 'published' | 'archived';
    difficulty: number; // 1-5星难度
    views: number;
    favorites?: string[]; // 收藏用户ID列表
    images?: Array<{
      id: string;
      url: string;
      filename: string;
      order: number;
      bid?: string;
      format?: string;
      uploadedAt?: Date;
      uploadedBy?: string;
    }>;
    tikzCodes?: Array<{
      id: string;
      code: string;
      format: 'svg' | 'png';
      order: number;
      bid?: string;
      createdAt?: Date;
      createdBy?: string;
    }>;
    createdAt: string;
    updatedAt: string;
    relevanceScore?: number; // 相关度分数（0-1）
    isSelected?: boolean; // 是否被选中
    aiAnalysis?: {
      evaluation?: {
        overallScore: number;
        reasoning: string;
      };
      coreAbilities?: {
        logicalThinking: number;
        mathematicalIntuition: number;
        problemSolving: number;
        conceptualUnderstanding: number;
        computationalSkills: number;
        analyticalReasoning: number;
      };
      analysisTimestamp?: string;
      analysisVersion?: string;
    };
  }>;
  documentInfo?: {
    id: string;
    fileName: string;
    fileType: string;
    confidence?: number;
    processTime?: Date;
  };
  creator: mongoose.Types.ObjectId; // 创建者ID
  isPublic: boolean; // 是否公开
  tags: string[]; // 草稿标签
  createdAt: Date;
  updatedAt: Date;
}

// 题目草稿Schema
const QuestionDraftSchema = new Schema<IQuestionDraft>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  questions: [{
    _id: String,
    id: String,
    qid: String,
    bid: String,
    type: {
      type: String,
      enum: ['choice', 'multiple-choice', 'fill', 'solution'],
      required: true
    },
    content: {
      stem: {
        type: String,
        required: false,
        default: ''
      },
      options: [{
        text: String,
        isCorrect: Boolean
      }],
      answer: {
        type: String,
        required: false,
        default: ''
      },
      fillAnswers: [String],
      solutionAnswers: [String],
      solution: String
    },
    category: [String],
    tags: [String],
    source: String,
    creator: String,
    questionBank: String,
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft'
    },
    difficulty: {
      type: Number,
      min: 1,
      max: 5,
      default: 3
    },
    views: {
      type: Number,
      default: 0
    },
    favorites: [String],
    images: [{
      id: String,
      url: String,
      filename: String,
      order: Number,
      bid: String,
      format: String,
      uploadedAt: Date,
      uploadedBy: String
    }],
    tikzCodes: [{
      id: String,
      code: String,
      format: {
        type: String,
        enum: ['svg', 'png']
      },
      order: Number,
      bid: String,
      createdAt: Date,
      createdBy: String
    }],
    createdAt: String,
    updatedAt: String,
    relevanceScore: Number,
    isSelected: Boolean,
    aiAnalysis: {
      evaluation: {
        overallScore: Number,
        reasoning: String
      },
      coreAbilities: {
        logicalThinking: Number,
        mathematicalIntuition: Number,
        problemSolving: Number,
        conceptualUnderstanding: Number,
        computationalSkills: Number,
        analyticalReasoning: Number
      },
      analysisTimestamp: String,
      analysisVersion: String
    }
  }],
  documentInfo: {
    id: String,
    fileName: String,
    fileType: String,
    confidence: Number,
    processTime: Date
  },
  creator: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  tags: [String],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// 更新时间中间件
QuestionDraftSchema.pre('save', function(next) {
  (this as any).updatedAt = new Date();
  next();
});

// 索引
QuestionDraftSchema.index({ creator: 1, createdAt: -1 });
QuestionDraftSchema.index({ isPublic: 1, createdAt: -1 });
QuestionDraftSchema.index({ tags: 1 });
QuestionDraftSchema.index({ name: 'text', description: 'text' });

export default mongoose.model<IQuestionDraft>('QuestionDraft', QuestionDraftSchema);
