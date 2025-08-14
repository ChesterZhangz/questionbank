import mongoose, { Document, Schema } from 'mongoose';

export interface IEnterprise extends Document {
  name: string; // 企业名称
  emailSuffix: string; // 企业邮箱后缀（如 @viquard.com）
  creditCode: string; // 企业唯一信用号
  avatar?: string; // 企业头像
  description?: string; // 企业描述
  address?: string; // 企业地址
  phone?: string; // 企业电话
  website?: string; // 企业网站
  industry?: string; // 所属行业
  size?: 'small' | 'medium' | 'large' | 'enterprise'; // 企业规模
  status: 'active' | 'inactive' | 'pending'; // 企业状态
  maxMembers: number; // 最大成员数量
  currentMembers: number; // 当前成员数量
  departments: mongoose.Types.ObjectId[]; // 部门ID列表
  createdAt: Date;
  updatedAt: Date;
}

const enterpriseSchema = new Schema<IEnterprise>({
  name: {
    type: String,
    required: [true, '企业名称是必需的'],
    trim: true,
    maxlength: [100, '企业名称不能超过100个字符']
  },
  emailSuffix: {
    type: String,
    required: [true, '企业邮箱后缀是必需的'],
    unique: true,
    trim: true,
    validate: {
      validator: function(suffix: string) {
        return suffix.startsWith('@') && suffix.length > 1;
      },
      message: '企业邮箱后缀必须以@开头'
    }
  },
  creditCode: {
    type: String,
    required: [true, '企业信用号是必需的'],
    unique: true,
    trim: true,
    maxlength: [50, '企业信用号不能超过50个字符']
  },
  avatar: {
    type: String
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, '企业描述不能超过500个字符']
  },
  address: {
    type: String,
    trim: true,
    maxlength: [200, '企业地址不能超过200个字符']
  },
  phone: {
    type: String,
    trim: true,
    match: [/^[\d\-\+\(\)\s]+$/, '请输入有效的电话号码']
  },
  website: {
    type: String,
    trim: true,
    validate: {
      validator: function(website: string) {
        if (!website) return true; // 允许空值
        // 支持多种格式：http://, https://, www., 或直接域名
        const urlPattern = /^(https?:\/\/)?(www\.)?[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
        return urlPattern.test(website);
      },
      message: '请输入有效的网站地址（支持：http://example.com, https://example.com, www.example.com, example.com）'
    }
  },
  industry: {
    type: String,
    trim: true,
    maxlength: [50, '所属行业不能超过50个字符']
  },
  size: {
    type: String,
    enum: ['small', 'medium', 'large', 'enterprise'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending'],
    default: 'pending'
  },
  maxMembers: {
    type: Number,
    required: [true, '最大成员数量是必需的'],
    min: [1, '最大成员数量至少为1'],
    max: [10000, '最大成员数量不能超过10000']
  },
  currentMembers: {
    type: Number,
    default: 0,
    min: [0, '当前成员数量不能为负数']
  },
  departments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department'
  }]
}, {
  timestamps: true
});

// 索引
enterpriseSchema.index({ status: 1 });

export const Enterprise = mongoose.model<IEnterprise>('Enterprise', enterpriseSchema);
