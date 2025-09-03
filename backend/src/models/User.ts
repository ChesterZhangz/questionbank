import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  email: string;
  password: string;
  name: string;
  role: 'superadmin' | 'admin' | 'teacher' | 'student';
  enterpriseName?: string; // 企业名称（用于显示，对应企业表中的name）
  preferences?: {
    theme?: 'light' | 'dark' | 'auto';
    language?: 'zh-CN' | 'en-US';
    timezone?: string;
    notifications?: {
      email?: boolean;
      push?: boolean;
      sms?: boolean;
    };
  };
  isActive: boolean;
  isEmailVerified: boolean;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  lastLogin?: Date;
  emailSuffix: string; // 企业邮箱后缀
  enterpriseId?: mongoose.Types.ObjectId; // 所属企业ID（新字段）
  // 社交功能
  followers?: mongoose.Types.ObjectId[]; // 粉丝列表
  following?: mongoose.Types.ObjectId[]; // 关注列表
  favorites?: mongoose.Types.ObjectId[]; // 收藏的题目
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>({
  email: {
    type: String,
    required: [true, '邮箱是必需的'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, '密码是必需的'],
    minlength: [6, '密码至少6位']
  },
  name: {
    type: String,
    required: [true, '姓名是必需的'],
    trim: true,
    maxlength: [50, '姓名不能超过50个字符']
  },
  role: {
    type: String,
    enum: ['superadmin', 'admin', 'teacher', 'student'],
    default: 'student'
  },
  enterpriseName: {
    type: String,
    trim: true
  },
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'auto'
    },
    language: {
      type: String,
      enum: ['zh-CN', 'en-US'],
      default: 'zh-CN'
    },
    timezone: {
      type: String,
      default: 'Asia/Shanghai'
    },
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      push: {
        type: Boolean,
        default: true
      },
      sms: {
        type: Boolean,
        default: false
      }
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: {
    type: String
  },
  emailVerificationExpires: {
    type: Date
  },
  passwordResetToken: {
    type: String
  },
  passwordResetExpires: {
    type: Date
  },
  lastLogin: {
    type: Date
  },
  emailSuffix: {
    type: String,
    required: false,
    default: '@viquard.com'
  },
  
  // 企业相关字段
  enterpriseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Enterprise'
  },
  
  // 社交功能
  followers: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }], // 粉丝列表
  following: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }], // 关注列表
  favorites: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Question' 
  }] // 收藏的题目
}, {
  timestamps: true
});

// 密码加密中间件
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// 密码比较方法
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// 索引（email已有unique约束，不需要重复索引）
userSchema.index({ role: 1 });
userSchema.index({ emailVerificationToken: 1 });
userSchema.index({ passwordResetToken: 1 });
userSchema.index({ enterpriseId: 1 });
userSchema.index({ emailSuffix: 1 });

export const User = mongoose.model<IUser>('User', userSchema); 