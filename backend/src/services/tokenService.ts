import jwt from 'jsonwebtoken';
import { TokenBlacklist } from '../models/TokenBlacklist';

export interface TokenPayload {
  userId: string;
  iat: number;
  exp: number;
}

export class TokenService {
  /**
   * 生成JWT token
   */
  static generateToken(userId: string): string {
    return jwt.sign(
      { userId },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );
  }

  /**
   * 验证JWT token
   */
  static verifyToken(token: string): TokenPayload | null {
    try {
      return jwt.verify(token, process.env.JWT_SECRET!) as TokenPayload;
    } catch (error) {
      return null;
    }
  }

  /**
   * 检查token是否在黑名单中
   */
  static async isTokenBlacklisted(token: string): Promise<boolean> {
    try {
      const blacklistedToken = await TokenBlacklist.findOne({ token });
      return !!blacklistedToken;
    } catch (error) {
      console.error('检查token黑名单失败:', error);
      return false;
    }
  }

  /**
   * 获取黑名单记录
   */
  static async getBlacklistRecord(token: string): Promise<any> {
    try {
      const blacklistedToken = await TokenBlacklist.findOne({ token });
      return blacklistedToken;
    } catch (error) {
      console.error('获取黑名单记录失败:', error);
      return null;
    }
  }

  /**
   * 将token加入黑名单
   */
  static async blacklistToken(
    token: string, 
    userId: string, 
    reason: 'password_change' | 'logout' | 'admin_revoke'
  ): Promise<void> {
    try {
      const payload = this.verifyToken(token);
      if (!payload) {
        throw new Error('Invalid token');
      }

      const expiresAt = new Date(payload.exp * 1000);

      await TokenBlacklist.create({
        token,
        userId,
        reason,
        expiresAt
      });

    } catch (error) {
      console.error('将token加入黑名单失败:', error);
      throw error;
    }
  }

  /**
   * 使用户的所有token失效（密码更改时使用）
   */
  static async invalidateAllUserTokens(userId: string): Promise<void> {
    try {
      // 注意：这里我们不能直接使所有token失效，因为JWT是无状态的
      // 我们只能在数据库中记录密码更改时间，然后在验证时检查
      // 这里我们创建一个特殊的黑名单记录来标记密码更改
      
      const passwordChangeToken = `password_change_${userId}_${Date.now()}`;
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7天后过期

      await TokenBlacklist.create({
        token: passwordChangeToken,
        userId,
        reason: 'password_change',
        expiresAt
      });

    } catch (error) {
      console.error('使用户所有token失效失败:', error);
      throw error;
    }
  }

  /**
   * 检查用户是否更改过密码（通过检查密码更改时间）
   */
  static async checkPasswordChangeTime(userId: string, tokenIssuedAt: number): Promise<boolean> {
    try {
      // 查找该用户最近的密码更改记录
      const passwordChangeRecord = await TokenBlacklist.findOne({
        userId,
        reason: 'password_change'
      }).sort({ createdAt: -1 });
      if (!passwordChangeRecord) {
        return false; // 没有密码更改记录
      }

      // 如果token的签发时间早于密码更改时间，则token无效
      const tokenIssuedDate = new Date(tokenIssuedAt * 1000);
      const result = passwordChangeRecord.createdAt > tokenIssuedDate;
      
      return result;
    } catch (error) {
      console.error('检查密码更改时间失败:', error);
      return false;
    }
  }

  /**
   * 清理过期的黑名单记录
   */
  static async cleanupExpiredBlacklist(): Promise<void> {
    try {
      const result = await TokenBlacklist.deleteMany({
        expiresAt: { $lt: new Date() }
      });
      
      if (result.deletedCount > 0) {
        console.log(`清理了 ${result.deletedCount} 条过期的黑名单记录`);
      }
    } catch (error) {
      console.error('清理过期黑名单记录失败:', error);
    }
  }
} 