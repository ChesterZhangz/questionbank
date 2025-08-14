import mongoose, { Document, Schema } from 'mongoose';

export interface IEnterpriseMessage extends Document {
  enterprise: mongoose.Types.ObjectId; // 所属企业
  sender: mongoose.Types.ObjectId; // 发送者
  content: string; // 消息内容
  type: 'general' | 'announcement' | 'department' | 'mention' | 'reply'; // 消息类型
  recipients: mongoose.Types.ObjectId[]; // 接收者（可以是用户或部门）
  mentionedUsers: mongoose.Types.ObjectId[]; // @提及的用户
  mentionedDepartments: mongoose.Types.ObjectId[]; // @提及的部门
  isPinned: boolean; // 是否置顶
  isRead: mongoose.Types.ObjectId[]; // 已读用户列表
  attachments?: string[]; // 附件列表
  // 回复相关字段
  replyTo?: mongoose.Types.ObjectId; // 回复的消息ID
  replyChain?: mongoose.Types.ObjectId[]; // 回复链（用于显示完整的对话）
  createdAt: Date;
  updatedAt: Date;
}

const enterpriseMessageSchema = new Schema<IEnterpriseMessage>({
  enterprise: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Enterprise',
    required: [true, '所属企业是必需的']
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, '发送者是必需的']
  },
  content: {
    type: String,
    required: [true, '消息内容是必需的'],
    trim: true,
    maxlength: [2000, '消息内容不能超过2000个字符']
  },
  type: {
    type: String,
    enum: ['general', 'announcement', 'department', 'mention', 'reply'],
    default: 'general'
  },
  recipients: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  mentionedUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  mentionedDepartments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department'
  }],
  isPinned: {
    type: Boolean,
    default: false
  },
  isRead: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  attachments: [{
    type: String
  }],
  // 回复相关字段
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EnterpriseMessage'
  },
  replyChain: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EnterpriseMessage'
  }]
}, {
  timestamps: true
});

// 索引
enterpriseMessageSchema.index({ enterprise: 1, createdAt: -1 });
enterpriseMessageSchema.index({ enterprise: 1, type: 1 });
enterpriseMessageSchema.index({ enterprise: 1, sender: 1 });
enterpriseMessageSchema.index({ enterprise: 1, isPinned: 1 });
enterpriseMessageSchema.index({ mentionedUsers: 1 });
enterpriseMessageSchema.index({ mentionedDepartments: 1 });
// 回复相关索引
enterpriseMessageSchema.index({ replyTo: 1 });
enterpriseMessageSchema.index({ replyChain: 1 });

export const EnterpriseMessage = mongoose.model<IEnterpriseMessage>('EnterpriseMessage', enterpriseMessageSchema);
