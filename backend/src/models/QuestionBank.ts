import mongoose, { Schema, Document } from 'mongoose';

export interface IQuestionBank extends Document {
  bid: string; // 题库唯一标识
  name: string; // 题库名称
  description?: string; // 题库描述
  cover?: string; // 题库封面
  creator: mongoose.Types.ObjectId; // 创建者
  managers: mongoose.Types.ObjectId[]; // 管理者列表
  collaborators: mongoose.Types.ObjectId[]; // 协作者列表
  viewers?: mongoose.Types.ObjectId[]; // 查看者列表
  isPublic: boolean; // 是否公开
  allowCollaboration: boolean; // 是否允许协作
  maxQuestions: number; // 最大题目数
  questionCount: number; // 当前题目数
  lastUpdated: Date; // 最后更新时间
  tags: string[]; // 标签
  category?: string; // 分类
  emailSuffix: string; // 企业邮箱后缀
  status: 'active' | 'archived' | 'deleted'; // 状态
  // 高级设置
  exportTemplate?: 'default' | 'simple' | 'detailed' | 'custom'; // 导出模板
  cardColor?: string; // 自定义卡片颜色
  createdAt: Date;
  updatedAt: Date;
}

const questionBankSchema = new Schema<IQuestionBank>({
  bid: {
    type: String,
    required: true,
    unique: true,
    default: () => `QB${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  cover: {
    type: String  // 恢复为字符串类型
  },
  creator: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  managers: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  collaborators: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  viewers: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  isPublic: {
    type: Boolean,
    default: false
  },
  allowCollaboration: {
    type: Boolean,
    default: true
  },
  maxQuestions: {
    type: Number,
    default: 1000
  },
  questionCount: {
    type: Number,
    default: 0
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  tags: [{
    type: String,
    trim: true
  }],
  category: {
    type: String,
    trim: true
  },
  emailSuffix: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'archived', 'deleted'],
    default: 'active'
  },
  // 高级设置
  exportTemplate: {
    type: String,
    enum: ['default', 'simple', 'detailed', 'custom'],
    default: 'default'
  },
  cardColor: {
    type: String,
    trim: true,
    maxlength: 7 // 例如 #123456 或 #abc123
  }
}, {
  timestamps: true
});

// 索引
questionBankSchema.index({ creator: 1 });
questionBankSchema.index({ emailSuffix: 1 });
questionBankSchema.index({ status: 1 });
questionBankSchema.index({ tags: 1 });
questionBankSchema.index({ category: 1 });

// 虚拟字段：总成员数
questionBankSchema.virtual('totalMembers').get(function() {
  const managersCount = this.managers ? this.managers.length : 0;
  const collaboratorsCount = this.collaborators ? this.collaborators.length : 0;
  const viewersCount = this.viewers ? this.viewers.length : 0;
  return 1 + managersCount + collaboratorsCount + viewersCount;
});

// 确保虚拟字段在JSON序列化时包含
questionBankSchema.set('toJSON', { virtuals: true });
questionBankSchema.set('toObject', { virtuals: true });

// 中间件：当题库状态变为deleted时，自动删除相关题目
questionBankSchema.pre('save', async function(next) {
  // 处理cover字段：如果是对象，转换为分类字符串（去掉emoji）
  if (this.cover && typeof this.cover === 'object') {
    console.log(`[题库模型] 检测到对象类型的cover字段，正在转换为字符串: ${JSON.stringify(this.cover)}`);
    // 如果是对象格式，将其转换为分类名称（不包含emoji）
    this.cover = this.category || '数学'; // 使用分类作为封面，或默认为数学
  }

  // 检查状态是否从其他状态变为deleted
  if (this.isModified('status') && this.status === 'deleted') {
    try {
      const Question = mongoose.model('Question');
      
      // 删除该题库下的所有题目
      const deleteResult = await Question.deleteMany({
        $or: [
          { questionBank: this._id },
          { bid: this.bid }
        ]
      });
      
      console.log(`[题库模型中间件] 题库 ${this.bid} 状态变为deleted，自动删除了 ${deleteResult.deletedCount} 道题目`);
      
      // 重置题目数量
      this.questionCount = 0;
    } catch (error) {
      console.error('[题库模型中间件] 删除题目失败:', error);
      // 不阻止保存操作，但记录错误
    }
  }
  
  next();
});

export default mongoose.model<IQuestionBank>('QuestionBank', questionBankSchema); 