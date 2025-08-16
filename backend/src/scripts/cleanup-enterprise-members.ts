import mongoose from 'mongoose';
import { User } from '../models/User';
import { Enterprise } from '../models/Enterprise';
import EnterpriseMember from '../models/EnterpriseMember';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

async function cleanupEnterpriseMembers() {
  try {
    // 连接数据库
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/question-bank');
    console.log('数据库连接成功');

    console.log('\n=== 开始清理孤立的企业成员记录 ===');

    // 1. 查找所有孤立的成员记录
    const allMembers = await EnterpriseMember.find({});
    const orphanedMembers = [];

    for (const member of allMembers) {
      const user = await User.findById(member.userId);
      const enterprise = await Enterprise.findById(member.enterpriseId);
      
      if (!user || !enterprise) {
        orphanedMembers.push({
          member,
          reason: !user ? '用户不存在' : '企业不存在'
        });
      }
    }

    if (orphanedMembers.length === 0) {
      console.log('✅ 没有发现孤立的成员记录，系统状态良好');
      return;
    }

    console.log(`⚠️  发现 ${orphanedMembers.length} 个孤立的成员记录，开始清理...`);

    // 2. 删除孤立的成员记录
    let deletedCount = 0;
    for (const { member } of orphanedMembers) {
      try {
        await EnterpriseMember.findByIdAndDelete(member._id);
        console.log(`✓ 已删除孤立成员记录: ${member._id} (用户: ${member.userId}, 企业: ${member.enterpriseId})`);
        deletedCount++;
      } catch (error) {
        console.error(`✗ 删除成员记录失败: ${member._id}`, error);
      }
    }

    console.log(`\n清理完成！共删除了 ${deletedCount} 个孤立的成员记录`);

    // 3. 生成清理报告
    console.log('\n=== 清理报告 ===');
    console.log(`清理时间: ${new Date().toLocaleString()}`);
    console.log(`发现孤立记录: ${orphanedMembers.length} 条`);
    console.log(`成功清理: ${deletedCount} 条`);
    console.log(`清理失败: ${orphanedMembers.length - deletedCount} 条`);

    // 4. 检查剩余数据一致性
    console.log('\n=== 数据一致性检查 ===');
    const enterprises = await Enterprise.find({});
    
    for (const enterprise of enterprises) {
      const memberCount = await EnterpriseMember.countDocuments({ 
        enterpriseId: enterprise._id 
      });
      
      const userCount = await User.countDocuments({ 
        enterpriseId: enterprise._id 
      });
      
      const status = memberCount === userCount ? '✅ 一致' : '⚠️ 不一致';
      console.log(`${enterprise.name}: 成员记录 ${memberCount} | 实际用户 ${userCount} | ${status}`);
    }

  } catch (error) {
    console.error('清理过程中发生错误:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n数据库连接已关闭');
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  cleanupEnterpriseMembers();
}

// 导出函数供其他模块使用
export { cleanupEnterpriseMembers };
