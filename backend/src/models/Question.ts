import mongoose, { Document, Schema } from 'mongoose';

// 图片接口
export interface IQuestionImage {
  id: string;           // 图片唯一标识
  bid: string;          // 图片所属题库ID
  order: number;        // 图片显示顺序
  format: string;       // 图片格式(jpg, png, gif等)
  uploadedAt: Date;     // 上传时间
  uploadedBy: string;   // 上传者ID
  filename: string;     // 原始文件名
  url: string;          // 图片访问URL
}

// TikZ代码接口
export interface ITikZCode {
  id: string;           // 图代码唯一标识
  bid: string;          // 图代码所属题库ID
  code: string;         // TikZ代码内容
  order: number;        // 显示顺序
  format: string;       // 输出格式(svg, png等)
  createdAt: Date;      // 创建时间
  createdBy: string;    // 创建者ID
}

export interface IQuestion extends Document {
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
  category?: string; // 小题型（最多三个，用逗号分隔）
  tags?: string[]; // 知识点标签（最多五个）
  difficulty: number;
  source?: string; // 题目出处
  creator: mongoose.Types.ObjectId;
  questionBank: mongoose.Types.ObjectId; // 题库引用
  status: 'draft' | 'published' | 'archived';
  embedding?: number[];
  isPublic: boolean;
  usageCount: number;
  lastUsed?: Date;
  views?: number; // 浏览量
  favorites?: mongoose.Types.ObjectId[]; // 收藏用户列表
  // 新增字段
  images?: IQuestionImage[];      // 图片数组
  tikzCodes?: ITikZCode[];       // TikZ图代码数组
  createdAt: Date;
  updatedAt: Date;
}

const questionSchema = new Schema<IQuestion>({
  qid: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: function(qid: string) {
        return /^MT-[A-Z]{3}-\d{8}-[A-Z0-9]{4}$/.test(qid);
      },
      message: '题目ID格式不正确'
    }
  },
  bid: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['choice', 'multiple-choice', 'fill', 'solution'],
    required: true
  },
  content: {
    stem: {
      type: String,
      required: [true, '题目内容是必需的'],
      trim: true
    },
    options: [{
      text: {
        type: String,
        required: true,
        trim: true
      },
      isCorrect: {
        type: Boolean,
        default: false
      }
    }],
    answer: {
      type: String,
      required: true,
      trim: true
    },
    fillAnswers: [String],
    solutionAnswers: [String],
    solution: {
      type: String,
      trim: true
    }
  },
  category: {
    type: String,
    trim: true,
    validate: {
      validator: function(category: string) {
        if (!category || typeof category !== 'string') return true;
        const categories = category.split(',').filter(c => c.trim());
        return categories.length <= 3;
      },
      message: '小题型最多只能选择三个'
    }
  },
  tags: [{
    type: String,
    trim: true,
    validate: {
      validator: function(tags: string[]) {
        return tags.length <= 5;
      },
      message: '知识点标签最多只能选择五个'
    }
  }],
  difficulty: {
    type: Number,
    required: true,
    min: [1, '难度最小为1'],
    max: [5, '难度最大为5']
  },
  source: {
    type: String,
    trim: true
  },
  creator: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  questionBank: {
    type: Schema.Types.ObjectId,
    ref: 'QuestionBank',
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  embedding: {
    type: [Number],
    sparse: true
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  usageCount: {
    type: Number,
    default: 0
  },
  lastUsed: {
    type: Date
  },
  views: {
    type: Number,
    default: 0,
    min: [0, '浏览量不能为负数']
  },
  favorites: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  // 图片数组
  images: {
    type: [{
      id: {
        type: String,
        required: true
      },
      bid: {
        type: String,
        required: true
      },
      order: {
        type: Number,
        required: true,
        default: 0
      },
      format: {
        type: String,
        required: true,
        enum: ['jpg', 'jpeg', 'png', 'gif']
      },
      uploadedAt: {
        type: Date,
        default: Date.now
      },
      uploadedBy: {
        type: String,
        required: true
      },
      filename: {
        type: String,
        required: true
      },
      url: {
        type: String,
        required: true
      }
    }],
    default: []
  },
  // TikZ代码数组
  tikzCodes: {
    type: [{
      id: {
        type: String,
        required: true
      },
      bid: {
        type: String,
        required: true
      },
      code: {
        type: String,
        required: true
      },
      order: {
        type: Number,
        required: true,
        default: 0
      },
      format: {
        type: String,
        required: true,
        enum: ['svg', 'png'],
        default: 'svg'
      },
      createdAt: {
        type: Date,
        default: Date.now
      },
      createdBy: {
        type: String,
        required: true
      },
      preview: {
        type: String
      }
    }],
    default: []
  }
}, {
  timestamps: true
});

// 生成题目ID的静态方法
questionSchema.statics.generateQID = function(type: string): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  const typeCode = type.toUpperCase().substring(0, 3);
  return `MT-${typeCode}-${date}-${random}`;
};

// 索引（qid已有unique约束，不需要重复索引）
questionSchema.index({ bid: 1 });
questionSchema.index({ type: 1 });
questionSchema.index({ difficulty: 1 });
questionSchema.index({ category: 1 });
questionSchema.index({ tags: 1 });
questionSchema.index({ creator: 1 });
questionSchema.index({ questionBank: 1 });
questionSchema.index({ status: 1 });
questionSchema.index({ isPublic: 1 });
questionSchema.index({ views: -1 }); // 浏览量降序索引
questionSchema.index({ favorites: 1 }); // 收藏索引

// 复合索引优化查询性能
questionSchema.index({ bid: 1, type: 1, difficulty: 1 }); // 常用筛选组合
questionSchema.index({ bid: 1, status: 1, createdAt: -1 }); // 题库内按状态和时间排序
questionSchema.index({ type: 1, difficulty: 1, createdAt: -1 }); // 按类型和难度排序
questionSchema.index({ tags: 1, type: 1 }); // 标签和类型组合查询
questionSchema.index({ createdAt: -1 }); // 时间排序优化
questionSchema.index({ updatedAt: -1 }); // 更新时间排序优化
// 向量索引（需要MongoDB Atlas支持）
// questionSchema.index({ embedding: 'vector' }, {
//   name: 'question_similarity',
//   type: 'vector',
//   vectorOptions: {
//     dimensions: 256,
//     similarity: 'cosine'
//   }
// });

// 文本搜索索引
questionSchema.index({
  'content.stem': 'text',
  category: 'text',
  tags: 'text'
});

// 图片和TikZ代码索引（分别创建，避免并行数组索引问题）
questionSchema.index({ 'images.id': 1 }); // 图片ID索引
questionSchema.index({ 'tikzCodes.id': 1 }); // TikZ代码ID索引
questionSchema.index({ 'images.bid': 1 }); // 图片题库索引
questionSchema.index({ 'tikzCodes.bid': 1 }); // TikZ代码题库索引
questionSchema.index({ 'images.order': 1 }); // 图片顺序索引
questionSchema.index({ 'tikzCodes.order': 1 }); // TikZ代码顺序索引

export const Question = mongoose.model<IQuestion>('Question', questionSchema); 