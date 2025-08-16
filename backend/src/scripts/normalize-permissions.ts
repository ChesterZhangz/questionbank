import mongoose from 'mongoose';
import dotenv from 'dotenv';
import EnterpriseMember from '../models/EnterpriseMember';

dotenv.config();

async function normalizePermissions() {
  try {
    // 连接数据库
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/mareate';
    await mongoose.connect(mongoUri);
    console.log('✅ 数据库连接成功');

    // 权限名称映射
    const permissionMapping: { [key: string]: string } = {
      'send_messages': 'manage_messages',
      'manage_enterprise': 'edit_enterprise'
    };

    // 查找所有企业成员
    const members = await EnterpriseMember.find({});
    console.log(`📊 找到 ${members.length} 个企业成员记录`);

    let normalizedCount = 0;

    for (const member of members) {
      if (!member.permissions || member.permissions.length === 0) continue;

      let hasChanges = false;
      const newPermissions = [...member.permissions];

      // 检查并替换权限名称
      for (let i = 0; i < newPermissions.length; i++) {
        const oldPermission = newPermissions[i];
        if (permissionMapping[oldPermission]) {
          newPermissions[i] = permissionMapping[oldPermission];
          hasChanges = true;
          console.log(`🔄 用户 ${member.userId}: ${oldPermission} -> ${permissionMapping[oldPermission]}`);
        }
      }

      // 如果有变化，更新数据库
      if (hasChanges) {
        await EnterpriseMember.findByIdAndUpdate(
          member._id,
          { permissions: newPermissions },
          { new: true }
        );
        normalizedCount++;
        console.log(`✅ 权限标准化完成: ${newPermissions.join(', ')}`);
      }
    }

    console.log(`\n📋 标准化总结:`);
    console.log(`✅ 成功标准化: ${normalizedCount} 个用户`);

    // 验证结果
    const membersAfterNormalize = await EnterpriseMember.find({});
    const membersWithInvalidPermissions = membersAfterNormalize.filter(m => 
      m.permissions?.some(perm => 
        !['manage_members', 'manage_departments', 'manage_messages', 'view_statistics', 
          'invite_users', 'remove_users', 'edit_enterprise', 'manage_roles'].includes(perm)
      )
    );

    if (membersWithInvalidPermissions.length === 0) {
      console.log('🎉 所有权限名称已标准化！');
    } else {
      console.log(`⚠️  仍有 ${membersWithInvalidPermissions.length} 个用户存在无效权限名称`);
    }

  } catch (error) {
    console.error('❌ 脚本执行失败:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 数据库连接已关闭');
  }
}

// 运行脚本
normalizePermissions();
