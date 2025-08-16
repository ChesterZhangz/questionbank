import mongoose from 'mongoose';
import dotenv from 'dotenv';
import EnterpriseMember from '../models/EnterpriseMember';

dotenv.config();

async function fixAdminPermissions() {
  try {
    // 连接数据库
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/mareate';
    await mongoose.connect(mongoUri);
    console.log('✅ 数据库连接成功');

    // 查找所有admin用户
    const adminMembers = await EnterpriseMember.find({ role: 'admin' });
    console.log(`📊 找到 ${adminMembers.length} 个admin用户`);

    let fixedCount = 0;

    for (const member of adminMembers) {
      // 检查权限是否完整
      const requiredPermissions = [
        'manage_members',
        'manage_departments',
        'manage_messages',
        'view_statistics',
        'invite_users'
      ];

      const missingPermissions = requiredPermissions.filter(
        perm => !member.permissions?.includes(perm)
      );

      if (missingPermissions.length > 0) {
        console.log(`🔧 修复用户 ${member.userId} 的权限`);
        console.log(`   缺少权限: ${missingPermissions.join(', ')}`);
        
        // 更新权限
        await EnterpriseMember.findByIdAndUpdate(
          member._id,
          { permissions: requiredPermissions },
          { new: true }
        );

        fixedCount++;
        console.log(`✅ 权限修复成功: ${requiredPermissions.join(', ')}`);
      } else {
        console.log(`✅ 用户 ${member.userId} 权限完整`);
      }
      console.log('---');
    }

    console.log(`\n📋 修复总结:`);
    console.log(`✅ 成功修复: ${fixedCount} 个admin用户`);

    // 验证修复结果
    const adminMembersAfterFix = await EnterpriseMember.find({ role: 'admin' });
    const adminWithFullPermissions = adminMembersAfterFix.filter(m => {
      const requiredPermissions = [
        'manage_members',
        'manage_departments',
        'manage_messages',
        'view_statistics',
        'invite_users'
      ];
      return requiredPermissions.every(perm => m.permissions?.includes(perm));
    });

    console.log(`\n🔍 验证结果:`);
    console.log(`权限完整的admin: ${adminWithFullPermissions.length}/${adminMembersAfterFix.length}`);

    if (adminWithFullPermissions.length === adminMembersAfterFix.length) {
      console.log('🎉 所有admin用户权限修复完成！');
    } else {
      console.log('⚠️  仍有部分admin用户权限未修复');
    }

  } catch (error) {
    console.error('❌ 脚本执行失败:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 数据库连接已关闭');
  }
}

// 运行脚本
fixAdminPermissions();
