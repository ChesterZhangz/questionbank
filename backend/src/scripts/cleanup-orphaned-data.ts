#!/usr/bin/env node

/**
 * 孤立数据清理脚本
 * 用于清理所有引用不存在用户的数据
 * 
 * 使用方法:
 * npm run cleanup-orphaned-data
 * 或
 * ts-node src/scripts/cleanup-orphaned-data.ts
 */

import mongoose from 'mongoose';
import { User } from '../models/User';
import { config } from '../config';

// 清理孤立数据的函数 (从 users.ts 复制)
async function cleanupOrphanedData() {
  console.log('开始清理孤立数据...');
  const cleanupReport = {
    questionBanksProcessed: 0,
    questionBanksDeleted: 0,
    questionsDeleted: 0,
    papersDeleted: 0,
    librariesProcessed: 0,
    librariesDeleted: 0,
    libraryPurchasesDeleted: 0,
    loginHistoryDeleted: 0,
    tokenBlacklistDeleted: 0,
    gameRecordsDeleted: 0,
    gameStatsDeleted: 0,
    leaderboardDeleted: 0,
    invitationsDeleted: 0,
    libraryInvitationsDeleted: 0,
    enterpriseMembersDeleted: 0,
    membersRemovedFromQuestionBanks: 0,
    membersRemovedFromLibraries: 0
  };

  try {
    // 获取所有存在的用户ID
    const existingUsers = await User.find({}).select('_id');
    const existingUserIds = existingUsers.map(user => (user._id as mongoose.Types.ObjectId).toString());
    console.log(`当前系统中有 ${existingUserIds.length} 个用户`);

    // 1. 清理题库相关数据
    console.log('清理题库相关数据...');
    const QuestionBank = require('../models/QuestionBank').default;
    
    // 删除创建者不存在的题库
    const orphanedQuestionBanks = await QuestionBank.find({
      creator: { $nin: existingUsers.map(u => u._id) }
    });
    
    for (const bank of orphanedQuestionBanks) {
      console.log(`删除孤立题库: ${bank.name} (创建者已不存在)`);
      
      // 删除题库中的所有题目
      const Question = require('../models/Question').default;
      const deletedQuestions = await Question.deleteMany({ questionBank: bank._id });
      cleanupReport.questionsDeleted += deletedQuestions.deletedCount || 0;
      
      await QuestionBank.findByIdAndDelete(bank._id);
      cleanupReport.questionBanksDeleted++;
    }
    
    // 从现有题库中移除不存在的用户
    const questionBanksToUpdate = await QuestionBank.find({
      $or: [
        { managers: { $nin: existingUsers.map(u => u._id) } },
        { collaborators: { $nin: existingUsers.map(u => u._id) } },
        { viewers: { $nin: existingUsers.map(u => u._id) } }
      ]
    });
    
    for (const bank of questionBanksToUpdate) {
      const originalManagersCount = bank.managers ? bank.managers.length : 0;
      const originalCollaboratorsCount = bank.collaborators ? bank.collaborators.length : 0;
      const originalViewersCount = bank.viewers ? bank.viewers.length : 0;
      
      // 过滤掉不存在的用户
      bank.managers = bank.managers ? bank.managers.filter((id: any) => 
        existingUserIds.includes(id.toString())
      ) : [];
      bank.collaborators = bank.collaborators ? bank.collaborators.filter((id: any) => 
        existingUserIds.includes(id.toString())
      ) : [];
      bank.viewers = bank.viewers ? bank.viewers.filter((id: any) => 
        existingUserIds.includes(id.toString())
      ) : [];
      
      const removedCount = (originalManagersCount + originalCollaboratorsCount + originalViewersCount) - 
                          (bank.managers.length + bank.collaborators.length + bank.viewers.length);
      
      if (removedCount > 0) {
        await bank.save();
        cleanupReport.membersRemovedFromQuestionBanks += removedCount;
        console.log(`从题库 ${bank.name} 中移除了 ${removedCount} 个不存在的用户`);
      }
      cleanupReport.questionBanksProcessed++;
    }

    // 2. 删除创建者不存在的独立题目
    console.log('清理独立题目...');
    const Question = require('../models/Question').default;
    const orphanedQuestions = await Question.deleteMany({
      creator: { $nin: existingUsers.map(u => u._id) }
    });
    cleanupReport.questionsDeleted += orphanedQuestions.deletedCount || 0;

    // 3. 删除拥有者不存在的试卷
    console.log('清理试卷...');
    const Paper = require('../models/Paper').default;
    const orphanedPapers = await Paper.deleteMany({
      owner: { $nin: existingUsers.map(u => u._id) }
    });
    cleanupReport.papersDeleted = orphanedPapers.deletedCount || 0;

    // 4. 清理试题库相关数据
    console.log('清理试题库相关数据...');
    const Library = require('../models/Library').default;
    
    // 删除拥有者不存在的试题库
    const orphanedLibraries = await Library.find({
      owner: { $nin: existingUsers.map(u => u._id) }
    });
    
    for (const library of orphanedLibraries) {
      console.log(`删除孤立试题库: ${library.name} (拥有者已不存在)`);
      
      // 删除相关购买记录
      const LibraryPurchase = require('../models/LibraryPurchase').default;
      await LibraryPurchase.deleteMany({ libraryId: library._id });
      
      await Library.findByIdAndDelete(library._id);
      cleanupReport.librariesDeleted++;
    }
    
    // 从现有试题库中移除不存在的用户
    const librariesToUpdate = await Library.find({
      'members.user': { $nin: existingUsers.map(u => u._id) }
    });
    
    for (const library of librariesToUpdate) {
      const originalMembersCount = library.members ? library.members.length : 0;
      
      library.members = library.members ? library.members.filter((member: any) => 
        existingUserIds.includes(member.user.toString())
      ) : [];
      
      const removedCount = originalMembersCount - library.members.length;
      
      if (removedCount > 0) {
        await library.save();
        cleanupReport.membersRemovedFromLibraries += removedCount;
        console.log(`从试题库 ${library.name} 中移除了 ${removedCount} 个不存在的用户`);
      }
      cleanupReport.librariesProcessed++;
    }

    // 5. 删除用户不存在的购买记录
    console.log('清理购买记录...');
    const LibraryPurchase = require('../models/LibraryPurchase').default;
    const orphanedPurchases = await LibraryPurchase.deleteMany({
      userId: { $nin: existingUsers.map(u => u._id) }
    });
    cleanupReport.libraryPurchasesDeleted = orphanedPurchases.deletedCount || 0;

    // 6. 删除用户不存在的登录历史
    console.log('清理登录历史...');
    const LoginHistory = require('../models/LoginHistory').default;
    const orphanedHistory = await LoginHistory.deleteMany({
      userId: { $nin: existingUsers.map(u => u._id) }
    });
    cleanupReport.loginHistoryDeleted = orphanedHistory.deletedCount || 0;

    // 7. 删除用户不存在的token黑名单
    console.log('清理token黑名单...');
    const TokenBlacklist = require('../models/TokenBlacklist').default;
    const orphanedTokens = await TokenBlacklist.deleteMany({
      userId: { $nin: existingUsers.map(u => u._id) }
    });
    cleanupReport.tokenBlacklistDeleted = orphanedTokens.deletedCount || 0;

    // 8. 清理游戏相关数据
    console.log('清理游戏数据...');
    try {
      const GameRecord = require('../models/Game').GameRecord;
      const UserGameStats = require('../models/Game').UserGameStats;
      const Leaderboard = require('../models/Game').Leaderboard;
      
      const orphanedGameRecords = await GameRecord.deleteMany({
        userId: { $nin: existingUsers.map(u => u._id) }
      });
      const orphanedGameStats = await UserGameStats.deleteMany({
        userId: { $nin: existingUsers.map(u => u._id) }
      });
      const orphanedLeaderboard = await Leaderboard.deleteMany({
        userId: { $nin: existingUsers.map(u => u._id) }
      });
      
      cleanupReport.gameRecordsDeleted = orphanedGameRecords.deletedCount || 0;
      cleanupReport.gameStatsDeleted = orphanedGameStats.deletedCount || 0;
      cleanupReport.leaderboardDeleted = orphanedLeaderboard.deletedCount || 0;
    } catch (gameError) {
      console.error('清理游戏数据失败:', gameError);
    }

    // 9. 清理邀请记录
    console.log('清理邀请记录...');
    try {
      const Invitation = require('../models/Invitation').default;
      const LibraryInvitation = require('../models/LibraryInvitation').default;
      
      const orphanedInvitations = await Invitation.deleteMany({
        inviterId: { $nin: existingUsers.map(u => u._id) }
      });
      const orphanedLibraryInvitations = await LibraryInvitation.deleteMany({
        inviterId: { $nin: existingUsers.map(u => u._id) }
      });
      
      cleanupReport.invitationsDeleted = orphanedInvitations.deletedCount || 0;
      cleanupReport.libraryInvitationsDeleted = orphanedLibraryInvitations.deletedCount || 0;
    } catch (invitationError) {
      console.error('清理邀请记录失败:', invitationError);
    }

    // 10. 清理企业成员记录
    console.log('清理企业成员记录...');
    try {
      const EnterpriseMember = require('../models/EnterpriseMember').default;
      const orphanedEnterpriseMembers = await EnterpriseMember.deleteMany({
        userId: { $nin: existingUsers.map(u => u._id) }
      });
      cleanupReport.enterpriseMembersDeleted = orphanedEnterpriseMembers.deletedCount || 0;
    } catch (enterpriseError) {
      console.error('清理企业成员记录失败:', enterpriseError);
    }

    console.log('孤立数据清理完成!');
    console.log('清理报告:', cleanupReport);
    
    return cleanupReport;
    
  } catch (error) {
    console.error('清理孤立数据失败:', error);
    throw error;
  }
}

// 主函数
async function main() {
  try {
    console.log('🧹 Mareate 孤立数据清理脚本');
    console.log('================================');
    
    // 连接数据库
    console.log('连接数据库...');
    await mongoose.connect(config.mongoURI);
    console.log('数据库连接成功');
    
    // 执行清理
    const report = await cleanupOrphanedData();
    
    // 显示最终报告
    console.log('\n================================');
    console.log('🎉 清理完成! 最终报告:');
    console.log('================================');
    console.log(`删除的题库: ${report.questionBanksDeleted}`);
    console.log(`处理的题库: ${report.questionBanksProcessed}`);
    console.log(`删除的题目: ${report.questionsDeleted}`);
    console.log(`删除的试卷: ${report.papersDeleted}`);
    console.log(`删除的试题库: ${report.librariesDeleted}`);
    console.log(`处理的试题库: ${report.librariesProcessed}`);
    console.log(`删除的购买记录: ${report.libraryPurchasesDeleted}`);
    console.log(`删除的登录历史: ${report.loginHistoryDeleted}`);
    console.log(`删除的token记录: ${report.tokenBlacklistDeleted}`);
    console.log(`删除的游戏记录: ${report.gameRecordsDeleted}`);
    console.log(`删除的游戏统计: ${report.gameStatsDeleted}`);
    console.log(`删除的排行榜记录: ${report.leaderboardDeleted}`);
    console.log(`删除的邀请记录: ${report.invitationsDeleted}`);
    console.log(`删除的试题库邀请: ${report.libraryInvitationsDeleted}`);
    console.log(`删除的企业成员记录: ${report.enterpriseMembersDeleted}`);
    console.log(`从题库移除的成员: ${report.membersRemovedFromQuestionBanks}`);
    console.log(`从试题库移除的成员: ${report.membersRemovedFromLibraries}`);
    console.log('================================');
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ 脚本执行失败:', error);
    process.exit(1);
  } finally {
    // 断开数据库连接
    await mongoose.disconnect();
    console.log('数据库连接已断开');
  }
}

// 检查是否直接运行此脚本
if (require.main === module) {
  main();
}

export { cleanupOrphanedData };
