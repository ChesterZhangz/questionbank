import mongoose from 'mongoose';
import dotenv from 'dotenv';
import EnterpriseMember from '../models/EnterpriseMember';
import { User } from '../models/User';

dotenv.config();

async function checkUserPermissions() {
  try {
    // 连接数据库
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/mareate';
    await mongoose.connect(mongoUri);
    console.log('✅ 数据库连接成功');

    // 查找所有企业成员
    const members = await EnterpriseMember.find({});
    
    console.log(`📊 找到 ${members.length} 个企业成员记录\n`);

    for (const member of members) {
      console.log(`👤 用户ID: ${member.userId}`);
      console.log(`   角色: ${member.role}`);
      console.log(`   权限: ${member.permissions?.join(', ') || '无权限'}`);
      console.log(`   企业ID: ${member.enterpriseId}`);
      console.log(`   状态: ${member.status}`);
      console.log(`   加入时间: ${member.joinDate}`);
      console.log('---');
    }

    // 检查是否有权限问题的用户
    const membersWithoutManageDept = members.filter(m => 
      !m.permissions?.includes('manage_departments')
    );

    if (membersWithoutManageDept.length > 0) {
      console.log(`\n⚠️  以下用户没有 manage_departments 权限:`);
      membersWithoutManageDept.forEach(member => {
        console.log(`   - 用户ID: ${member.userId} - 角色: ${member.role}`);
      });
    } else {
      console.log('\n✅ 所有用户都有 manage_departments 权限');
    }

  } catch (error) {
    console.error('❌ 脚本执行失败:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 数据库连接已关闭');
  }
}

// 运行脚本
checkUserPermissions();
