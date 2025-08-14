import mongoose, { Document, Schema } from 'mongoose';

export interface IDepartment extends Document {
  name: string; // 部门名称
  code: string; // 部门编码
  description?: string; // 部门描述
  enterprise: mongoose.Types.ObjectId; // 所属企业
  parent?: mongoose.Types.ObjectId; // 父部门ID（支持多级部门）
  level: number; // 部门层级（1为顶级部门）
  path: string[]; // 部门路径（如 ['技术部', '前端组']）
  manager?: mongoose.Types.ObjectId; // 部门经理
  members: mongoose.Types.ObjectId[]; // 部门成员
  order: number; // 排序
  isActive: boolean; // 是否激活
  createdAt: Date;
  updatedAt: Date;
}

const departmentSchema = new Schema<IDepartment>({
  name: {
    type: String,
    required: [true, '部门名称是必需的'],
    trim: true,
    maxlength: [50, '部门名称不能超过50个字符']
  },
  code: {
    type: String,
    required: [true, '部门编码是必需的'],
    trim: true,
    maxlength: [20, '部门编码不能超过20个字符']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [200, '部门描述不能超过200个字符']
  },
  enterprise: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Enterprise',
    required: [true, '所属企业是必需的']
  },
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department'
  },
  level: {
    type: Number,
    default: 1,
    min: [1, '部门层级至少为1']
  },
  path: [{
    type: String,
    trim: true
  }],
  manager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  order: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// 复合索引
departmentSchema.index({ enterprise: 1, code: 1 }, { unique: true });
departmentSchema.index({ enterprise: 1, parent: 1 });
departmentSchema.index({ enterprise: 1, level: 1 });
departmentSchema.index({ enterprise: 1, order: 1 });

export const Department = mongoose.model<IDepartment>('Department', departmentSchema);
