import mongoose from 'mongoose';
import dotenv from 'dotenv';
import EnterpriseMember from '../models/EnterpriseMember';
import { User } from '../models/User';
import { Enterprise } from '../models/Enterprise';

dotenv.config();

async function fixEnterprisePermissions() {
  try {
    // 连接数据库
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/mareate';
    await mongoose.connect(mongoUri);
    console.log('✅ 数据库连接成功');

    // 查找所有企业成员
    const members = await EnterpriseMember.find({});
    console.log(`📊 找到 ${members.length} 个企业成员记录`);

    let fixedCount = 0;
    let errorCount = 0;

    for (const member of members) {
      try {
        // 检查权限是否为空或未定义
        if (!member.permissions || member.permissions.length === 0) {
          console.log(`🔧 修复用户 ${member.userId} 的权限 (角色: ${member.role})`);
          
          // 根据角色重新设置权限
          let permissions: string[] = [];
          switch (member.role) {
            case 'superAdmin':
              permissions = [
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
              permissions = [
                'manage_members',
                'manage_departments',
                'manage_messages',
                'view_statistics',
                'invite_users'
              ];
              break;
            case 'member':
              permissions = [
                'view_statistics'
              ];
              break;
            default:
              permissions = ['view_statistics'];
          }

          // 更新权限
          await EnterpriseMember.findByIdAndUpdate(
            member._id,
            { permissions },
            { new: true }
          );

          fixedCount++;
          console.log(`✅ 权限修复成功: ${permissions.join(', ')}`);
        } else {
          console.log(`✅ 用户 ${member.userId} 权限正常: ${member.permissions.join(', ')}`);
        }
      } catch (error) {
        console.error(`❌ 修复用户 ${member.userId} 权限失败:`, error);
        errorCount++;
      }
    }

    console.log('\n📋 修复总结:');
    console.log(`✅ 成功修复: ${fixedCount} 个用户`);
    console.log(`❌ 修复失败: ${errorCount} 个用户`);
    console.log(`📊 总检查: ${members.length} 个用户`);

    // 验证修复结果
    const membersAfterFix = await EnterpriseMember.find({});
    const membersWithPermissions = membersAfterFix.filter(m => m.permissions && m.permissions.length > 0);
    
    console.log(`\n🔍 验证结果:`);
    console.log(`有权限的用户: ${membersWithPermissions.length}/${membersAfterFix.length}`);

    if (membersWithPermissions.length === membersAfterFix.length) {
      console.log('🎉 所有用户权限修复完成！');
    } else {
      console.log('⚠️  仍有部分用户权限未修复');
    }

  } catch (error) {
    console.error('❌ 脚本执行失败:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 数据库连接已关闭');
  }
}

// 运行脚本
fixEnterprisePermissions();
