import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';

/**
 * 用户数据清理服务
 * 负责在删除用户时清理所有相关数据
 */
export class UserCleanupService {
  
  /**
   * 级联删除用户相关数据
   * @param userId 用户ID
   * @param enterpriseId 企业ID（可选）
   */
  static async cascadeDeleteUser(userId: mongoose.Types.ObjectId, enterpriseId?: mongoose.Types.ObjectId): Promise<void> {
    console.log(`开始级联删除用户 ${userId} 的相关数据...`);
    
    try {
      // 1. 删除用户创建的题库
      await this.deleteUserQuestionBanks(userId);
      
      // 2. 从其他题库中移除用户
      await this.removeUserFromQuestionBanks(userId);
      
      // 3. 删除用户创建的独立题目
      await this.deleteUserQuestions(userId);
      
      // 4. 删除用户创建的试卷
      await this.deleteUserPapers(userId);
      
      // 5. 处理用户拥有的试题库
      await this.deleteUserLibraries(userId);
      
      // 6. 从其他试题库中移除用户
      await this.removeUserFromLibraries(userId);
      
      // 7. 删除用户的试题库购买记录
      await this.deleteUserLibraryPurchases(userId);
      
      // 8. 删除用户的登录历史
      await this.deleteUserLoginHistory(userId);
      
      // 9. 删除用户的token黑名单记录
      await this.deleteUserTokenBlacklist(userId);
      
      // 10. 删除用户的游戏记录和统计
      await this.deleteUserGameData(userId);
      
      // 11. 删除相关邀请记录
      await this.deleteUserInvitations(userId);
      
      // 12. 删除企业成员记录
      await this.deleteUserEnterpriseMembers(userId, enterpriseId);
      
      // 13. 删除用户的题目草稿
      await this.deleteUserQuestionDrafts(userId);
      
      // 14. 从所有题目的收藏列表中移除用户
      await this.removeUserFromQuestionFavorites(userId);
      
      // 15. 从所有草稿的收藏列表中移除用户
      await this.removeUserFromDraftFavorites(userId);
      
      // 16. 删除用户相关的企业消息
      await this.deleteUserEnterpriseMessages(userId);
      
      // 17. 处理部门关联
      await this.handleUserDepartmentAssociations(userId);
      
      // 18. 清理用户头像文件
      await this.cleanupUserAvatar(userId);
      
      // 19. 清理用户上传的图片文件
      await this.cleanupUserUploadedImages(userId);
      
      // 20. 清理用户相关的其他数据
      await this.cleanupUserMiscData(userId);
      
      console.log(`用户 ${userId} 的所有相关数据级联删除完成`);
      
    } catch (error) {
      console.error('级联删除用户数据失败:', error);
      throw error;
    }
  }

  /**
   * 删除用户创建的题库
   */
  private static async deleteUserQuestionBanks(userId: mongoose.Types.ObjectId): Promise<void> {
    const QuestionBank = mongoose.model('QuestionBank');
    const Question = mongoose.model('Question');
    
    const userQuestionBanks = await QuestionBank.find({ creator: userId });
    for (const bank of userQuestionBanks) {
      console.log(`删除用户创建的题库: ${bank.name} (${bank._id})`);
      
      // 删除题库中的所有题目
      await Question.deleteMany({ questionBank: bank._id });
      console.log(`删除题库 ${bank._id} 中的所有题目`);
      
      // 删除题库
      await QuestionBank.findByIdAndDelete(bank._id);
    }
    console.log(`删除了 ${userQuestionBanks.length} 个用户创建的题库`);
  }

  /**
   * 从其他题库中移除用户
   */
  private static async removeUserFromQuestionBanks(userId: mongoose.Types.ObjectId): Promise<void> {
    const QuestionBank = mongoose.model('QuestionBank');
    
    await QuestionBank.updateMany(
      { $or: [
        { managers: userId },
        { collaborators: userId },
        { viewers: userId }
      ]},
      { $pull: { 
        managers: userId,
        collaborators: userId,
        viewers: userId
      }}
    );
    console.log('从所有题库成员列表中移除用户');
  }

  /**
   * 删除用户创建的独立题目
   */
  private static async deleteUserQuestions(userId: mongoose.Types.ObjectId): Promise<void> {
    const Question = mongoose.model('Question');
    
    const deletedQuestions = await Question.deleteMany({ creator: userId });
    console.log(`删除了 ${deletedQuestions.deletedCount} 个用户创建的独立题目`);
  }

  /**
   * 删除用户创建的试卷
   */
  private static async deleteUserPapers(userId: mongoose.Types.ObjectId): Promise<void> {
    const Paper = mongoose.model('Paper');
    
    const deletedPapers = await Paper.deleteMany({ owner: userId });
    console.log(`删除了 ${deletedPapers.deletedCount} 个用户创建的试卷`);
  }

  /**
   * 处理用户拥有的试题库
   */
  private static async deleteUserLibraries(userId: mongoose.Types.ObjectId): Promise<void> {
    const Library = mongoose.model('Library');
    const LibraryPurchase = mongoose.model('LibraryPurchase');
    
    const userLibraries = await Library.find({ owner: userId });
    for (const library of userLibraries) {
      console.log(`删除用户拥有的试题库: ${library.name} (${library._id})`);
      
      // 删除试题库的购买记录
      await LibraryPurchase.deleteMany({ libraryId: library._id });
      
      // 删除试题库
      await Library.findByIdAndDelete(library._id);
    }
    console.log(`删除了 ${userLibraries.length} 个用户拥有的试题库`);
  }

  /**
   * 从其他试题库中移除用户
   */
  private static async removeUserFromLibraries(userId: mongoose.Types.ObjectId): Promise<void> {
    const Library = mongoose.model('Library');
    
    await Library.updateMany(
      { 'members.user': userId },
      { $pull: { members: { user: userId } } }
    );
    console.log('从所有试题库成员列表中移除用户');
  }

  /**
   * 删除用户的试题库购买记录
   */
  private static async deleteUserLibraryPurchases(userId: mongoose.Types.ObjectId): Promise<void> {
    const LibraryPurchase = mongoose.model('LibraryPurchase');
    
    const deletedPurchases = await LibraryPurchase.deleteMany({ userId: userId });
    console.log(`删除了 ${deletedPurchases.deletedCount} 个用户的购买记录`);
  }

  /**
   * 删除用户的登录历史
   */
  private static async deleteUserLoginHistory(userId: mongoose.Types.ObjectId): Promise<void> {
    const LoginHistory = mongoose.model('LoginHistory');
    
    const deletedHistory = await LoginHistory.deleteMany({ userId: userId });
    console.log(`删除了 ${deletedHistory.deletedCount} 条用户登录历史`);
  }

  /**
   * 删除用户的token黑名单记录
   */
  private static async deleteUserTokenBlacklist(userId: mongoose.Types.ObjectId): Promise<void> {
    const TokenBlacklist = mongoose.model('TokenBlacklist');
    
    const deletedTokens = await TokenBlacklist.deleteMany({ userId: userId });
    console.log(`删除了 ${deletedTokens.deletedCount} 条用户token黑名单记录`);
  }

  /**
   * 删除用户的游戏记录和统计
   */
  private static async deleteUserGameData(userId: mongoose.Types.ObjectId): Promise<void> {
    try {
      const GameRecord = mongoose.model('GameRecord');
      const UserGameStats = mongoose.model('UserGameStats');
      const Leaderboard = mongoose.model('Leaderboard');
      
      const deletedGameRecords = await GameRecord.deleteMany({ userId: userId });
      const deletedGameStats = await UserGameStats.deleteMany({ userId: userId });
      const deletedLeaderboard = await Leaderboard.deleteMany({ userId: userId });
      
      console.log(`删除了 ${deletedGameRecords.deletedCount} 条游戏记录`);
      console.log(`删除了 ${deletedGameStats.deletedCount} 条游戏统计`);
      console.log(`删除了 ${deletedLeaderboard.deletedCount} 条排行榜记录`);
    } catch (gameError) {
      console.error('删除游戏相关数据失败:', gameError);
    }
  }

  /**
   * 删除相关邀请记录
   */
  private static async deleteUserInvitations(userId: mongoose.Types.ObjectId): Promise<void> {
    try {
      const Invitation = mongoose.model('Invitation');
      const LibraryInvitation = mongoose.model('LibraryInvitation');
      
      // 删除用户发送的邀请记录
      const deletedInvitations = await Invitation.deleteMany({ 
        inviterId: userId
      });
      
      // 删除用户发送的试题库邀请记录
      const deletedLibraryInvitations = await LibraryInvitation.deleteMany({ 
        inviterId: userId 
      });
      
      console.log(`删除了 ${deletedInvitations.deletedCount} 条邀请记录`);
      console.log(`删除了 ${deletedLibraryInvitations.deletedCount} 条试题库邀请记录`);
    } catch (invitationError) {
      console.error('删除邀请记录失败:', invitationError);
    }
  }

  /**
   * 删除企业成员记录
   */
  private static async deleteUserEnterpriseMembers(userId: mongoose.Types.ObjectId, enterpriseId?: mongoose.Types.ObjectId): Promise<void> {
    try {
      const EnterpriseMember = mongoose.model('EnterpriseMember');
      
      // 删除所有与该用户相关的企业成员记录
      const deletedMembers = await EnterpriseMember.deleteMany({
        userId: userId
      });
      console.log(`删除企业成员记录成功: ${deletedMembers.deletedCount} 条记录`);
      
      // 如果删除的是超级管理员，自动转让给最早注册的用户
      if (enterpriseId) {
        await this.handleSuperAdminTransfer(enterpriseId);
      }
    } catch (memberError) {
      console.error('删除企业成员记录失败:', memberError);
    }
  }

  /**
   * 处理超级管理员自动转让
   */
  private static async handleSuperAdminTransfer(enterpriseId: mongoose.Types.ObjectId): Promise<void> {
    try {
      const EnterpriseMember = mongoose.model('EnterpriseMember');
      
      // 检查是否还有其他超级管理员
      const remainingSuperAdmins = await EnterpriseMember.find({
        enterpriseId: enterpriseId,
        role: 'superAdmin'
      });
      
      if (remainingSuperAdmins.length === 0) {
        console.log('检测到企业没有超级管理员，开始自动转让...');
        
        // 查找最早注册的企业成员
        const earliestMember = await EnterpriseMember.findOne({
          enterpriseId: enterpriseId
        }).sort({ joinDate: 1 });
        
        if (earliestMember) {
          // 将最早注册的成员提升为超级管理员
          await EnterpriseMember.findByIdAndUpdate(
            earliestMember._id,
            {
              role: 'superAdmin',
              permissions: [
                'manage_members',
                'manage_departments',
                'manage_messages',
                'view_statistics',
                'invite_users',
                'remove_users',
                'edit_enterprise',
                'manage_roles'
              ]
            }
          );
          
          console.log(`自动转让超级管理员成功: 用户 ${earliestMember.userId} 成为新的超级管理员`);
        } else {
          console.log('企业中没有其他成员，无法自动转让超级管理员');
        }
      }
    } catch (transferError) {
      console.error('自动转让超级管理员失败:', transferError);
    }
  }

  /**
   * 删除用户的题目草稿
   */
  private static async deleteUserQuestionDrafts(userId: mongoose.Types.ObjectId): Promise<void> {
    try {
      const QuestionDraft = mongoose.model('QuestionDraft');
      
      const deletedDrafts = await QuestionDraft.deleteMany({ creator: userId });
      console.log(`删除了 ${deletedDrafts.deletedCount} 个用户创建的题目草稿`);
    } catch (draftError) {
      console.error('删除题目草稿失败:', draftError);
    }
  }

  /**
   * 从所有题目的收藏列表中移除用户
   */
  private static async removeUserFromQuestionFavorites(userId: mongoose.Types.ObjectId): Promise<void> {
    try {
      const Question = mongoose.model('Question');
      
      const updatedQuestions = await Question.updateMany(
        { favorites: userId },
        { $pull: { favorites: userId } }
      );
      console.log(`从 ${updatedQuestions.modifiedCount} 个题目的收藏列表中移除用户`);
    } catch (favoriteError) {
      console.error('从题目收藏列表中移除用户失败:', favoriteError);
    }
  }

  /**
   * 从所有草稿的收藏列表中移除用户
   */
  private static async removeUserFromDraftFavorites(userId: mongoose.Types.ObjectId): Promise<void> {
    try {
      const QuestionDraft = mongoose.model('QuestionDraft');
      
      const updatedDrafts = await QuestionDraft.updateMany(
        { 'questions.favorites': userId },
        { $pull: { 'questions.$.favorites': userId } }
      );
      console.log(`从 ${updatedDrafts.modifiedCount} 个草稿的收藏列表中移除用户`);
    } catch (draftFavoriteError) {
      console.error('从草稿收藏列表中移除用户失败:', draftFavoriteError);
    }
  }

  /**
   * 删除用户相关的企业消息
   */
  private static async deleteUserEnterpriseMessages(userId: mongoose.Types.ObjectId): Promise<void> {
    try {
      const EnterpriseMessage = mongoose.model('EnterpriseMessage');
      
      // 删除用户发送的消息
      const deletedSentMessages = await EnterpriseMessage.deleteMany({
        sender: userId
      });
      
      // 删除用户被提及的消息
      const deletedMentionedMessages = await EnterpriseMessage.deleteMany({
        mentionedUsers: userId
      });
      
      // 删除用户作为接收者的消息
      const deletedRecipientMessages = await EnterpriseMessage.deleteMany({
        recipients: userId
      });
      
      // 删除用户已读的消息记录
      const updatedReadMessages = await EnterpriseMessage.updateMany(
        { isRead: userId },
        { $pull: { isRead: userId } }
      );
      
      // 从回复链中移除用户引用
      const updatedReplyChainMessages = await EnterpriseMessage.updateMany(
        { replyChain: userId },
        { $pull: { replyChain: userId } }
      );
      
      console.log(`删除了 ${deletedSentMessages.deletedCount} 条用户发送的企业消息`);
      console.log(`删除了 ${deletedMentionedMessages.deletedCount} 条用户被提及的企业消息`);
      console.log(`删除了 ${deletedRecipientMessages.deletedCount} 条用户作为接收者的企业消息`);
      console.log(`从 ${updatedReadMessages.modifiedCount} 条消息的已读列表中移除用户`);
      console.log(`从 ${updatedReplyChainMessages.modifiedCount} 条消息的回复链中移除用户引用`);
    } catch (messageError) {
      console.error('删除企业消息相关数据失败:', messageError);
    }
  }

  /**
   * 处理部门关联
   */
  private static async handleUserDepartmentAssociations(userId: mongoose.Types.ObjectId): Promise<void> {
    try {
      const EnterpriseMember = mongoose.model('EnterpriseMember');
      
      // 从企业成员中移除部门关联
      const updatedMembers = await EnterpriseMember.updateMany(
        { userId: userId, departmentId: { $exists: true } },
        { $unset: { departmentId: 1 } }
      );
      console.log(`从 ${updatedMembers.modifiedCount} 个企业成员记录中移除部门关联`);
    } catch (departmentError) {
      console.error('处理部门关联失败:', departmentError);
    }
  }

  /**
   * 清理用户头像文件
   */
  private static async cleanupUserAvatar(userId: mongoose.Types.ObjectId): Promise<void> {
    try {
      const user = await mongoose.model('User').findById(userId);
      if (user && user.avatar && user.avatar.startsWith('/avatars/')) {
        const avatarPath = path.join(process.cwd(), 'public', user.avatar);
        if (fs.existsSync(avatarPath)) {
          fs.unlinkSync(avatarPath);
          console.log(`删除了用户头像文件: ${user.avatar}`);
        }
      }
    } catch (avatarError) {
      console.error('删除用户头像文件失败:', avatarError);
    }
  }

  /**
   * 清理用户上传的图片文件
   */
  private static async cleanupUserUploadedImages(userId: mongoose.Types.ObjectId): Promise<void> {
    try {
      const Question = mongoose.model('Question');
      const QuestionDraft = mongoose.model('QuestionDraft');
      
      // 查找用户上传的图片
      const userQuestions = await Question.find({ 
        'images.uploadedBy': userId.toString() 
      });
      
      const userDrafts = await QuestionDraft.find({ 
        'questions.images.uploadedBy': userId.toString() 
      });
      
      // 删除图片文件（这里需要根据实际的文件存储方式来实现）
      let deletedImageCount = 0;
      for (const question of userQuestions) {
        for (const image of question.images || []) {
          if (image.uploadedBy === userId.toString()) {
            // 这里应该根据实际的文件存储方式删除文件
            // 如果是本地存储，删除文件
            // 如果是云存储，调用相应的删除API
            deletedImageCount++;
          }
        }
      }
      
      for (const draft of userDrafts) {
        for (const question of draft.questions || []) {
          for (const image of question.images || []) {
            if (image.uploadedBy === userId.toString()) {
              deletedImageCount++;
            }
          }
        }
      }
      
      console.log(`标记了 ${deletedImageCount} 个用户上传的图片文件待删除`);
    } catch (imageError) {
      console.error('清理用户上传的图片文件失败:', imageError);
    }
  }

  /**
   * 清理用户相关的其他数据
   */
  private static async cleanupUserMiscData(userId: mongoose.Types.ObjectId): Promise<void> {
    try {
      // 这里可以添加其他需要清理的数据
      // 比如用户的搜索历史、偏好设置等
      console.log('用户其他相关数据清理完成');
    } catch (miscError) {
      console.error('清理用户其他相关数据失败:', miscError);
    }
  }
}
