import mongoose, { Document, Schema } from 'mongoose';

export interface IEnterpriseMember extends Document {
  userId: mongoose.Types.ObjectId; // 用户ID
  enterpriseId: mongoose.Types.ObjectId; // 企业ID
  role: 'superAdmin' | 'admin' | 'member'; // 企业内角色
  departmentId?: mongoose.Types.ObjectId; // 所属部门ID
  position?: string; // 职位
  joinDate: Date; // 加入企业时间
  status: 'active' | 'inactive' | 'pending'; // 成员状态
  permissions: string[]; // 权限列表
  createdAt: Date;
  updatedAt: Date;
}

const enterpriseMemberSchema = new Schema<IEnterpriseMember>({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, '用户ID是必需的']
  },
  enterpriseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Enterprise',
    required: [true, '企业ID是必需的']
  },
  role: {
    type: String,
    enum: ['superAdmin', 'admin', 'member'],
    default: 'member',
    required: [true, '企业角色是必需的']
  },
  departmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department'
  },
  position: {
    type: String,
    trim: true,
    maxlength: [100, '职位不能超过100个字符']
  },
  joinDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending'],
    default: 'active'
  },
  permissions: [{
    type: String,
    enum: [
      'manage_members',      // 管理成员
      'manage_departments',  // 管理部门
      'manage_messages',     // 管理消息
      'view_statistics',     // 查看统计
      'invite_users',        // 邀请用户
      'remove_users',        // 移除用户
      'edit_enterprise',     // 编辑企业信息
      'manage_roles'         // 管理角色
    ]
  }]
}, {
  timestamps: true
});

// 复合唯一索引，确保一个用户在一个企业中只能有一个角色
enterpriseMemberSchema.index({ userId: 1, enterpriseId: 1 }, { unique: true });

// 根据角色自动设置权限
enterpriseMemberSchema.pre('save', function(next) {
  if (this.isNew || this.isModified('role')) {
    switch (this.role) {
      case 'superAdmin':
        this.permissions = [
          'manage_members',
          'manage_departments', 
          'manage_messages',
          'view_statistics',
          'invite_users',
          'remove_users',
          'edit_enterprise',
          'manage_roles'
        ];
        break;
      case 'admin':
        this.permissions = [
          'manage_members',
          'manage_departments',
          'manage_messages',
          'view_statistics',
          'invite_users'
        ];
        break;
      case 'member':
        this.permissions = [
          'view_statistics'
        ];
        break;
    }
  }
  next();
});

export default mongoose.model<IEnterpriseMember>('EnterpriseMember', enterpriseMemberSchema);
