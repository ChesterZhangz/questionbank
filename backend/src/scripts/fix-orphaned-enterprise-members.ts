import mongoose from 'mongoose';
import { User } from '../models/User';
import { Enterprise } from '../models/Enterprise';
import EnterpriseMember from '../models/EnterpriseMember';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

async function fixOrphanedEnterpriseMembers() {
  try {
    // 连接数据库
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/question-bank');
    console.log('数据库连接成功');

    console.log('\n=== 开始修复孤立的企业成员记录 ===');

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

    console.log(`找到 ${orphanedMembers.length} 个孤立的成员记录`);

    if (orphanedMembers.length === 0) {
      console.log('没有发现孤立的成员记录，无需修复');
      return;
    }

    // 2. 显示孤立的记录详情
    console.log('\n孤立的成员记录详情:');
    for (const { member, reason } of orphanedMembers) {
      console.log(`  - 成员ID: ${member._id}`);
      console.log(`    用户ID: ${member.userId}`);
      console.log(`    企业ID: ${member.enterpriseId}`);
      console.log(`    角色: ${member.role}`);
      console.log(`    原因: ${reason}`);
      console.log('');
    }

    // 3. 确认是否删除
    console.log('准备删除这些孤立的成员记录...');
    
    // 4. 删除孤立的成员记录
    let deletedCount = 0;
    for (const { member } of orphanedMembers) {
      try {
        await EnterpriseMember.findByIdAndDelete(member._id);
        console.log(`✓ 已删除孤立成员记录: ${member._id}`);
        deletedCount++;
      } catch (error) {
        console.error(`✗ 删除成员记录失败: ${member._id}`, error);
      }
    }

    console.log(`\n修复完成！共删除了 ${deletedCount} 个孤立的成员记录`);

    // 5. 验证修复结果
    console.log('\n=== 验证修复结果 ===');
    const remainingMembers = await EnterpriseMember.find({});
    const remainingOrphaned = [];

    for (const member of remainingMembers) {
      const user = await User.findById(member.userId);
      const enterprise = await Enterprise.findById(member.enterpriseId);
      
      if (!user || !enterprise) {
        remainingOrphaned.push(member);
      }
    }

    if (remainingOrphaned.length === 0) {
      console.log('✅ 所有孤立的成员记录已成功清理');
    } else {
      console.log(`⚠️  仍有 ${remainingOrphaned.length} 个孤立的成员记录`);
    }

    // 6. 检查企业成员数量统计
    console.log('\n=== 企业成员数量统计 ===');
    const enterprises = await Enterprise.find({});
    
    for (const enterprise of enterprises) {
      const memberCount = await EnterpriseMember.countDocuments({ 
        enterpriseId: enterprise._id 
      });
      
      const userCount = await User.countDocuments({ 
        enterpriseId: enterprise._id 
      });
      
      console.log(`企业: ${enterprise.name}`);
      console.log(`  企业成员记录数: ${memberCount}`);
      console.log(`  实际用户数: ${userCount}`);
      console.log(`  状态: ${memberCount === userCount ? '✅ 一致' : '⚠️ 不一致'}`);
      console.log('');
    }

  } catch (error) {
    console.error('修复过程中发生错误:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n数据库连接已关闭');
  }
}

// 运行修复
fixOrphanedEnterpriseMembers();
