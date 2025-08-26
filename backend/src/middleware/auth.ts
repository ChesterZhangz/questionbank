import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { TokenService } from '../services/tokenService';

export interface AuthRequest extends Request {
  user?: any;
}

export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    // 只在开发环境下输出详细日志
    if (process.env.NODE_ENV === 'development') {
      console.log('🔐 认证中间件被调用');
      console.log('🔐 Authorization header:', req.header('Authorization'));
      console.log('🔐 提取的token:', token ? `${token.substring(0, 10)}...` : 'undefined');
    }

    if (!token) {
      return res.status(401).json({ error: '访问被拒绝，没有提供令牌' });
    }

    // 验证JWT token
    const decoded = TokenService.verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ error: '令牌无效' });
    }

    // 检查token是否在黑名单中
    const isBlacklisted = await TokenService.isTokenBlacklisted(token);
    if (isBlacklisted) {
      // 获取黑名单记录的原因
      const blacklistRecord = await TokenService.getBlacklistRecord(token);
      if (blacklistRecord?.reason === 'logout') {
        return res.status(401).json({ error: '会话已过期，请重新登录' });
      } else if (blacklistRecord?.reason === 'password_change') {
        return res.status(401).json({ error: '密码已更改，请重新登录' });
      } else {
        return res.status(401).json({ error: '令牌已失效，请重新登录' });
      }
    }

    // 只有在token不在黑名单中时，才检查密码更改时间
    const passwordChangedAfterToken = await TokenService.checkPasswordChangeTime(
      decoded.userId, 
      decoded.iat
    );
    if (passwordChangedAfterToken) {
      return res.status(401).json({ error: '密码已更改，请重新登录' });
    }

    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return res.status(401).json({ error: '用户不存在' });
    }

    // 检查用户是否属于某个企业（通过enterpriseId字段）
    if (!user.enterpriseId) {
      console.log('❌ 用户没有enterpriseId:', user.email);
      return res.status(403).json({ error: '仅限企业人员访问' });
    }

    req.user = user;
    return next();
  } catch (error) {
    console.error('认证中间件错误:', error);
    // 确保返回JSON格式的错误响应
    return res.status(401).json({ 
      success: false,
      error: '令牌无效',
      details: error instanceof Error ? error.message : '未知错误'
    });
  }
};

// 企业邮箱验证中间件
export const enterpriseOnly = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const user = req.user;

  if (!user || !user.enterpriseId) {
    return res.status(403).json({
      error: '仅限企业人员访问'
    });
  }
  return next();
}; 