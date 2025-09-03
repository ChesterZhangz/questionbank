import mongoose, { Document, Schema } from 'mongoose';

export interface IVCount extends Document {
  userId: mongoose.Types.ObjectId;
  balance: number;
  transactions: Array<{
    type: 'recharge' | 'purchase' | 'refund' | 'bonus' | 'deduction';
    amount: number;
    description: string;
    relatedId?: mongoose.Types.ObjectId; // 相关的购买记录ID
    createdAt: Date;
  }>;
  totalRecharged: number; // 总充值金额
  totalSpent: number; // 总消费金额
  lastRechargeDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const vCountSchema = new Schema<IVCount>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  balance: {
    type: Number,
    default: 0,
    min: 0
  },
  transactions: [{
    type: {
      type: String,
      enum: ['recharge', 'purchase', 'refund', 'bonus', 'deduction'],
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    relatedId: {
      type: Schema.Types.ObjectId,
      refPath: 'transactions.relatedModel'
    },
    relatedModel: {
      type: String,
      enum: ['QuestionBank', 'Paper', 'Library'],
      required: function() {
        return this.type === 'purchase' || this.type === 'refund';
      }
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  totalRecharged: {
    type: Number,
    default: 0,
    min: 0
  },
  totalSpent: {
    type: Number,
    default: 0,
    min: 0
  },
  lastRechargeDate: {
    type: Date
  }
}, {
  timestamps: true
});

// 索引
vCountSchema.index({ userId: 1 });
vCountSchema.index({ 'transactions.createdAt': -1 });

// 预保存钩子：确保余额不为负数
vCountSchema.pre('save', function(next) {
  if (this.balance < 0) {
    return next(new Error('余额不能为负数'));
  }
  next();
});

// 静态方法：获取或创建用户的VCount记录
vCountSchema.statics.getOrCreate = async function(userId: mongoose.Types.ObjectId) {
  let vCount = await this.findOne({ userId });
  if (!vCount) {
    vCount = new this({ userId, balance: 0 });
    await vCount.save();
  }
  return vCount;
};

// 实例方法：充值
vCountSchema.methods.recharge = async function(amount: number, description: string = '充值') {
  if (amount <= 0) {
    throw new Error('充值金额必须大于0');
  }
  
  this.balance += amount;
  this.totalRecharged += amount;
  this.lastRechargeDate = new Date();
  
  this.transactions.push({
    type: 'recharge',
    amount,
    description,
    createdAt: new Date()
  });
  
  return await this.save();
};

// 实例方法：消费
vCountSchema.methods.spend = async function(amount: number, description: string, relatedId?: mongoose.Types.ObjectId, relatedModel?: string) {
  if (amount <= 0) {
    throw new Error('消费金额必须大于0');
  }
  
  if (this.balance < amount) {
    throw new Error('余额不足');
  }
  
  this.balance -= amount;
  this.totalSpent += amount;
  
  this.transactions.push({
    type: 'purchase',
    amount: -amount, // 负数表示支出
    description,
    relatedId,
    relatedModel,
    createdAt: new Date()
  });
  
  return await this.save();
};

// 实例方法：退款
vCountSchema.methods.refund = async function(amount: number, description: string, relatedId?: mongoose.Types.ObjectId, relatedModel?: string) {
  if (amount <= 0) {
    throw new Error('退款金额必须大于0');
  }
  
  this.balance += amount;
  this.totalSpent -= amount; // 减少总消费
  
  this.transactions.push({
    type: 'refund',
    amount,
    description,
    relatedId,
    relatedModel,
    createdAt: new Date()
  });
  
  return await this.save();
};

// 实例方法：获取交易历史
vCountSchema.methods.getTransactionHistory = function(limit: number = 20, offset: number = 0) {
  return this.transactions
    .sort((a: any, b: any) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(offset, offset + limit);
};

export const VCount = mongoose.model<IVCount>('VCount', vCountSchema);
