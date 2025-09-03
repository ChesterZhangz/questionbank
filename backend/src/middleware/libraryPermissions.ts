import { Request, Response, NextFunction } from 'express';
import { Library, ILibrary } from '../models/Library';
import { LibraryPurchase } from '../models/LibraryPurchase';
import mongoose from 'mongoose';

export interface LibraryRequest extends Request {
  library?: ILibrary;
  userRole?: 'owner' | 'admin' | 'collaborator' | 'viewer';
}

// 检查用户是否是试卷集成员
export const libraryMemberMiddleware = async (req: LibraryRequest, res: Response, next: NextFunction) => {
  try {
    const libraryId = req.params.id;
    const userId = (req as any).user._id;

    if (!mongoose.Types.ObjectId.isValid(libraryId)) {
      return res.status(400).json({ success: false, error: '无效的试卷集ID' });
    }

    // 使用 lean() 提高性能，只返回普通对象
    const library = await Library.findById(libraryId).lean();
    if (!library) {
      return res.status(404).json({ success: false, error: '试卷集不存在' });
    }

    // 检查用户是否是试卷集成员
    const member = library.members.find(m => m.user.toString() === userId.toString());
    
    if (member) {
      // 用户是直接成员
      req.library = library;
      req.userRole = member.role;
      return next();
    }

    // 检查用户是否购买了试卷集
    if (library.status === 'published') {
      const purchase = await LibraryPurchase.findOne({
        libraryId: library._id,
        userId: userId,
        status: 'completed'
      }).lean();

      if (purchase) {
        // 用户购买了试卷集，自动添加为查看者
        if (!library.members.some(m => m.user.toString() === userId.toString())) {
          // 重新获取完整的 library 文档用于修改
          const fullLibrary = await Library.findById(libraryId);
          if (fullLibrary) {
            fullLibrary.members.push({
              user: userId,
              role: 'viewer',
              joinedAt: new Date()
            });
            await fullLibrary.save();
            // 更新 req.library 为完整文档
            req.library = fullLibrary;
          }
        } else {
          req.library = library;
        }
        
        req.userRole = 'viewer';
        return next();
      }
    }

    // 检查用户是否是试卷集所有者
    if (library.owner.toString() === userId.toString()) {
      req.library = library;
      req.userRole = 'owner';
      return next();
    }

    return res.status(403).json({ success: false, error: '您没有访问此试卷集的权限' });
  } catch (error) {
    console.error('libraryMemberMiddleware error:', error);
    return res.status(500).json({ success: false, error: '权限检查失败' });
  }
};

// 检查用户是否具有指定角色
export const requireLibraryRole = (...roles: ('owner' | 'admin' | 'collaborator' | 'viewer')[]) => {
  return (req: LibraryRequest, res: Response, next: NextFunction): void => {
    if (!req.userRole || !roles.includes(req.userRole)) {
      res.status(403).json({ 
        success: false, 
        error: `需要以下角色之一: ${roles.join(', ')}` 
      });
      return;
    }
    next();
  };
};

// 检查试卷集状态访问权限
export const checkLibraryStatusAccess = (req: LibraryRequest, res: Response, next: NextFunction): void => {
  if (!req.library) {
    res.status(500).json({ success: false, error: '试卷集信息缺失' });
    return;
  }

  // 查看者不能访问草稿状态的试卷集
  if (req.userRole === 'viewer' && req.library.status === 'draft') {
    res.status(403).json({ success: false, error: '草稿状态的试卷集对查看者不可见' });
    return;
  }

  next();
};

// 检查试卷访问权限
export const checkPaperAccess = (paperStatus: string, userRole: string): boolean => {
  // 查看者只能看到已发布或已修改的试卷
  if (userRole === 'viewer') {
    return paperStatus === 'published' || paperStatus === 'modified';
  }
  
  // 其他角色可以看到所有状态的试卷
  return true;
};

// 检查试卷编辑权限
export const checkPaperEditPermission = (paperOwner: string, currentUserId: string, userRole: string): boolean => {
  // 所有者和管理者可以编辑任何试卷
  if (userRole === 'owner' || userRole === 'admin') {
    return true;
  }
  
  // 协作者只能编辑自己创建的试卷
  if (userRole === 'collaborator') {
    return paperOwner === currentUserId;
  }
  
  return false;
};

// 检查试卷删除权限
export const checkPaperDeletePermission = (paperOwner: string, currentUserId: string, userRole: string): boolean => {
  // 所有者和管理者可以删除任何试卷
  if (userRole === 'owner' || userRole === 'admin') {
    return true;
  }
  
  // 协作者只能删除自己创建的试卷
  if (userRole === 'collaborator') {
    return paperOwner === currentUserId;
  }
  
  return false;
};

// 检查成员管理权限
export const checkMemberManagementPermission = (userRole: string): boolean => {
  return userRole === 'owner' || userRole === 'admin';
};

// 检查试卷集编辑权限
export const checkLibraryEditPermission = (userRole: string): boolean => {
  return userRole === 'owner';
};

// 检查试卷集发布权限
export const checkLibraryPublishPermission = (userRole: string): boolean => {
  return userRole === 'owner';
};

// 检查试卷集购买权限
export const checkLibraryPurchasePermission = (library: ILibrary, userId: string): boolean => {
  // 只有已发布的试卷集才能购买
  if (library.status !== 'published') {
    return false;
  }
  
  // 检查用户是否已经是成员
  const isMember = library.members.some(m => m.user.toString() === userId);
  if (isMember) {
    return false;
  }
  
  // 检查用户是否是所有者
  if (library.owner.toString() === userId) {
    return false;
  }
  
  return true;
};
