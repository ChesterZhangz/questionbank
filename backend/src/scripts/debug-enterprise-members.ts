import mongoose from 'mongoose';
import { User } from '../models/User';
import { Enterprise } from '../models/Enterprise';
import EnterpriseMember from '../models/EnterpriseMember';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

async function debugEnterpriseMembers() {
  try {
    // 连接数据库
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/question-bank');
    console.log('数据库连接成功');

    // 1. 检查所有企业
    console.log('\n=== 企业信息 ===');
    const enterprises = await Enterprise.find({});
    console.log(`找到 ${enterprises.length} 个企业:`);
    
    for (const enterprise of enterprises) {
      console.log(`\n企业: ${enterprise.name} (${enterprise._id})`);
      console.log(`邮箱后缀: ${enterprise.emailSuffix}`);
      console.log(`最大成员数: ${enterprise.maxMembers}`);
      console.log(`状态: ${enterprise.status}`);
      
      // 2. 检查该企业的用户
      const users = await User.find({ enterpriseId: enterprise._id });
      console.log(`\n  用户数量: ${users.length}`);
      for (const user of users) {
        console.log(`    - ${user.name} (${user.email}) - 角色: ${user.role} - 验证: ${user.isEmailVerified}`);
      }
      
      // 3. 检查该企业的成员记录
      const members = await EnterpriseMember.find({ enterpriseId: enterprise._id });
      console.log(`\n  企业成员记录数量: ${members.length}`);
      for (const member of members) {
        const user = await User.findById(member.userId);
        if (user) {
          console.log(`    - ${user.name} (${user.email}) - 企业角色: ${member.role} - 状态: ${member.status}`);
        } else {
          console.log(`    - 用户不存在 (${member.userId}) - 企业角色: ${member.role} - 状态: ${member.status}`);
        }
      }
      
      // 4. 检查邮箱后缀匹配的用户
      const emailSuffix = enterprise.emailSuffix.replace('@', '@');
      const emailUsers = await User.find({
        email: { $regex: emailSuffix, $options: 'i' }
      });
      console.log(`\n  邮箱后缀匹配的用户数量: ${emailUsers.length}`);
      for (const user of emailUsers) {
        console.log(`    - ${user.name} (${user.email}) - 企业ID: ${user.enterpriseId || '无'} - 验证: ${user.isEmailVerified}`);
      }
      
      // 5. 检查不一致的情况
      const inconsistentUsers = emailUsers.filter(user => 
        !user.enterpriseId || user.enterpriseId.toString() !== (enterprise._id as any).toString()
      );
      if (inconsistentUsers.length > 0) {
        console.log(`\n  ⚠️  发现不一致的用户:`);
        for (const user of inconsistentUsers) {
          console.log(`    - ${user.name} (${user.email}) - 企业ID: ${user.enterpriseId || '无'}`);
        }
      }
      
      const orphanedMembers = members.filter(member => 
        !users.some(user => (user._id as any).toString() === member.userId.toString())
      );
      if (orphanedMembers.length > 0) {
        console.log(`\n  ⚠️  发现孤立的成员记录:`);
        for (const member of orphanedMembers) {
          console.log(`    - 成员ID: ${member._id} - 用户ID: ${member.userId} - 角色: ${member.role}`);
        }
      }
    }

    // 6. 检查所有用户的企业分配情况
    console.log('\n=== 用户企业分配情况 ===');
    const allUsers = await User.find({});
    const usersWithoutEnterprise = allUsers.filter(user => !user.enterpriseId);
    const usersWithEnterprise = allUsers.filter(user => user.enterpriseId);
    
    console.log(`总用户数: ${allUsers.length}`);
    console.log(`有企业ID的用户: ${usersWithEnterprise.length}`);
    console.log(`无企业ID的用户: ${usersWithoutEnterprise.length}`);
    
    if (usersWithoutEnterprise.length > 0) {
      console.log('\n无企业ID的用户:');
      for (const user of usersWithoutEnterprise) {
        console.log(`  - ${user.name} (${user.email}) - 角色: ${user.role} - 验证: ${user.isEmailVerified}`);
      }
    }

    // 7. 检查所有企业成员记录
    console.log('\n=== 企业成员记录情况 ===');
    const allMembers = await EnterpriseMember.find({});
    console.log(`总企业成员记录数: ${allMembers.length}`);
    
    const validMembers = allMembers.filter(async (member) => {
      const user = await User.findById(member.userId);
      const enterprise = await Enterprise.findById(member.enterpriseId);
      return user && enterprise;
    });
    
    console.log(`有效成员记录数: ${validMembers.length}`);
    console.log(`无效成员记录数: ${allMembers.length - validMembers.length}`);

  } catch (error) {
    console.error('调试过程中发生错误:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n数据库连接已关闭');
  }
}

// 运行调试
debugEnterpriseMembers();
