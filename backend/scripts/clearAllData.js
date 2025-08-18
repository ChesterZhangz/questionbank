const mongoose = require('mongoose');
require('dotenv').config();

// 导入模型
const User = require('../dist/models/User').User;
const QuestionBank = require('../dist/models/QuestionBank').QuestionBank;
const Question = require('../dist/models/Question').Question;
const Paper = require('../dist/models/Paper').Paper;
const Library = require('../dist/models/Library').Library;
const LibraryPurchase = require('../dist/models/LibraryPurchase').LibraryPurchase;
const GameRecord = require('../dist/models/GameRecord').GameRecord;
const UserGameStats = require('../dist/models/UserGameStats').UserGameStats;
const Leaderboard = require('../dist/models/Leaderboard').Leaderboard;
const LoginHistory = require('../dist/models/LoginHistory').LoginHistory;
const TokenBlacklist = require('../dist/models/TokenBlacklist').TokenBlacklist;
const Enterprise = require('../dist/models/Enterprise').Enterprise;
const EnterpriseMember = require('../dist/models/EnterpriseMember').EnterpriseMember;

async function clearAllData() {
  try {
    console.log('🚀 开始连接数据库...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mareate_question_bank');
    console.log('✅ 数据库连接成功');

    // 1. 首先检查admin@viquard.com用户是否存在
    console.log('\n🔍 检查admin@viquard.com用户...');
    const adminUser = await User.findOne({ email: 'admin@viquard.com' });
    
    if (!adminUser) {
      console.log('❌ 未找到admin@viquard.com用户，请先创建该用户');
      await mongoose.disconnect();
      return;
    }
    
    console.log('✅ 找到admin@viquard.com用户:', adminUser._id);
    const adminUserId = adminUser._id;

    // 2. 获取所有非admin用户
    console.log('\n👥 获取所有非admin用户...');
    const nonAdminUsers = await User.find({ email: { $ne: 'admin@viquard.com' } });
    console.log(`📊 找到 ${nonAdminUsers.length} 个非admin用户`);

    if (nonAdminUsers.length === 0) {
      console.log('✅ 没有需要清理的用户数据');
      await mongoose.disconnect();
      return;
    }

    const nonAdminUserIds = nonAdminUsers.map(user => user._id);

    // 3. 开始清理数据
    console.log('\n🧹 开始清理数据...');

    // 3.1 删除题库（除了admin创建的）
    console.log('🗂️ 清理题库数据...');
    const deletedQuestionBanks = await QuestionBank.deleteMany({
      creator: { $in: nonAdminUserIds }
    });
    console.log(`✅ 删除了 ${deletedQuestionBanks.deletedCount} 个题库`);

    // 3.2 删除题目（除了admin创建的）
    console.log('📝 清理题目数据...');
    const deletedQuestions = await Question.deleteMany({
      creator: { $in: nonAdminUserIds }
    });
    console.log(`✅ 删除了 ${deletedQuestions.deletedCount} 个题目`);

    // 3.3 删除试卷（除了admin创建的）
    console.log('📄 清理试卷数据...');
    const deletedPapers = await Paper.deleteMany({
      owner: { $in: nonAdminUserIds }
    });
    console.log(`✅ 删除了 ${deletedPapers.deletedCount} 个试卷`);

    // 3.4 删除试题库（除了admin拥有的）
    console.log('📚 清理试题库数据...');
    const deletedLibraries = await Library.deleteMany({
      owner: { $in: nonAdminUserIds }
    });
    console.log(`✅ 删除了 ${deletedLibraries.deletedCount} 个试题库`);

    // 3.5 删除试题库购买记录
    console.log('💳 清理试题库购买记录...');
    const deletedLibraryPurchases = await LibraryPurchase.deleteMany({
      userId: { $in: nonAdminUserIds }
    });
    console.log(`✅ 删除了 ${deletedLibraryPurchases.deletedCount} 条购买记录`);

    // 3.6 删除游戏记录
    console.log('🎮 清理游戏记录...');
    const deletedGameRecords = await GameRecord.deleteMany({
      userId: { $in: nonAdminUserIds }
    });
    console.log(`✅ 删除了 ${deletedGameRecords.deletedCount} 条游戏记录`);

    // 3.7 删除游戏统计
    console.log('📊 清理游戏统计...');
    const deletedGameStats = await UserGameStats.deleteMany({
      userId: { $in: nonAdminUserIds }
    });
    console.log(`✅ 删除了 ${deletedGameStats.deletedCount} 条游戏统计`);

    // 3.8 删除排行榜记录
    console.log('🏆 清理排行榜记录...');
    const deletedLeaderboards = await Leaderboard.deleteMany({
      userId: { $in: nonAdminUserIds }
    });
    console.log(`✅ 删除了 ${deletedLeaderboards.deletedCount} 条排行榜记录`);

    // 3.9 删除登录历史
    console.log('📅 清理登录历史...');
    const deletedLoginHistory = await LoginHistory.deleteMany({
      userId: { $in: nonAdminUserIds }
    });
    console.log(`✅ 删除了 ${deletedLoginHistory.deletedCount} 条登录历史`);

    // 3.10 删除token黑名单
    console.log('🚫 清理token黑名单...');
    const deletedTokenBlacklist = await TokenBlacklist.deleteMany({
      userId: { $in: nonAdminUserIds }
    });
    console.log(`✅ 删除了 ${deletedTokenBlacklist.deletedCount} 条token黑名单记录`);

    // 3.11 删除企业成员记录
    console.log('🏢 清理企业成员记录...');
    const deletedEnterpriseMembers = await EnterpriseMember.deleteMany({
      userId: { $in: nonAdminUserIds }
    });
    console.log(`✅ 删除了 ${deletedEnterpriseMembers.deletedCount} 条企业成员记录`);

    // 3.12 清理空的企业
    console.log('🏢 清理空的企业...');
    const emptyEnterprises = await Enterprise.find({});
    for (const enterprise of emptyEnterprises) {
      const memberCount = await EnterpriseMember.countDocuments({ enterpriseId: enterprise._id });
      if (memberCount === 0) {
        await Enterprise.findByIdAndDelete(enterprise._id);
        console.log(`🗑️ 删除了空企业: ${enterprise.name}`);
      }
    }

    // 3.13 从所有题库中移除非admin用户
    console.log('👥 从题库中移除非admin用户...');
    const updateResult1 = await QuestionBank.updateMany(
      {},
      {
        $pull: {
          managers: { $in: nonAdminUserIds },
          collaborators: { $in: nonAdminUserIds },
          viewers: { $in: nonAdminUserIds }
        }
      }
    );
    console.log(`✅ 更新了 ${updateResult1.modifiedCount} 个题库的成员列表`);

    // 3.14 从所有试题库中移除非admin用户
    console.log('👥 从试题库中移除非admin用户...');
    const updateResult2 = await Library.updateMany(
      {},
      {
        $pull: {
          members: { user: { $in: nonAdminUserIds } }
        }
      }
    );
    console.log(`✅ 更新了 ${updateResult2.modifiedCount} 个试题库的成员列表`);

    // 4. 最后删除所有非admin用户
    console.log('\n👥 删除所有非admin用户...');
    const deletedUsers = await User.deleteMany({ email: { $ne: 'admin@viquard.com' } });
    console.log(`✅ 删除了 ${deletedUsers.deletedCount} 个用户`);

    // 5. 验证清理结果
    console.log('\n🔍 验证清理结果...');
    const finalUserCount = await User.countDocuments();
    const finalQuestionBankCount = await QuestionBank.countDocuments();
    const finalQuestionCount = await Question.countDocuments();
    const finalPaperCount = await Paper.countDocuments();
    const finalLibraryCount = await Library.countDocuments();

    console.log('\n📊 清理完成后的系统状态：');
    console.log('用户总数:', finalUserCount);
    console.log('题库总数:', finalQuestionBankCount);
    console.log('题目总数:', finalQuestionCount);
    console.log('试卷总数:', finalPaperCount);
    console.log('试题库总数:', finalLibraryCount);

    // 6. 确保admin用户权限完整
    console.log('\n🔐 确保admin用户权限完整...');
    const updatedAdminUser = await User.findByIdAndUpdate(
      adminUserId,
      {
        role: 'superadmin',
        isEmailVerified: true,
        isActive: true
      },
      { new: true }
    );
    console.log('✅ admin用户权限已更新:', updatedAdminUser.role);

    console.log('\n🎉 数据清理完成！');
    console.log('✅ 保留了admin@viquard.com用户');
    console.log('✅ 清除了所有其他用户和相关数据');
    console.log('✅ 系统已重置为干净状态');

  } catch (error) {
    console.error('❌ 数据清理失败:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 数据库连接已关闭');
  }
}

// 执行清理
clearAllData();
