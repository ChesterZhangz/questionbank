import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import { authMiddleware } from '../middleware/auth';
import { 
  libraryMemberMiddleware, 
  requireLibraryRole, 
  checkPaperAccess, 
  checkPaperEditPermission, 
  checkPaperDeletePermission,
  LibraryRequest
} from '../middleware/libraryPermissions';
import PaperBank from '../models/PaperBank';
import { Paper } from '../models/Paper';
import { createDraft, updateDraft, getPaper, listPapers, publishPaper, deletePaper } from '../services/paper/paperService';

// 检查用户是否为试卷集所有者
async function checkPaperBankOwner(bankId: any, userId: any): Promise<boolean> {
  try {
    const bank = await PaperBank.findById(bankId);
    return !!(bank && bank.ownerId.toString() === userId.toString());
  } catch (err) {
    console.error('check paper bank owner failed:', err);
    return false;
  }
}

// 检查用户是否有试卷集管理权限（编辑者/管理者/所有者）
async function checkPaperBankManagementPermission(bankId: any, userId: any): Promise<boolean> {
  try {
    const PaperBankMember = require('../models/PaperBankMember').default;
    const membership = await PaperBankMember.findOne({
      paperBankId: bankId,
      userId: userId
    });
    
    const hasManagementRole = membership && ['owner', 'manager', 'collaborator'].includes(membership.role);
    
    
    return hasManagementRole;
  } catch (err) {
    console.error('check paper bank management permission failed:', err);
    return false;
  }
}

const router = express.Router();

// 创建草稿
router.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const owner = (req as any).user._id;
    const { libraryId, paperBankId, ...paperData } = req.body;

    // 确定使用哪个ID作为试卷集ID
    const bankId = paperBankId || libraryId;

    // 如果指定了试卷集，检查权限
    if (bankId) {
      // 这里需要检查用户是否有权限在该试卷集中创建试卷
      // 暂时跳过，后续可以添加专门的权限检查
    }

    const paper = await createDraft({ ...paperData, owner, libraryId: bankId, bank: bankId });
    return res.status(201).json({ success: true, data: paper });
  } catch (err) {
    console.error('create draft failed:', err);
    return res.status(500).json({ success: false, error: '创建草稿失败' });
  }
});

// 更新试卷基本信息（名称、状态等）
router.patch('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const paper = await Paper.findById(req.params.id);
    if (!paper) {
      return res.status(404).json({ success: false, error: '试卷不存在' });
    }

    const { name, status } = req.body;
    const updates: any = {};

    // 只允许更新特定字段
    if (name !== undefined && typeof name === 'string' && name.trim()) {
      updates.name = name.trim();
    }

    if (status !== undefined && ['draft', 'published', 'modified'].includes(status)) {
      updates.status = status;
      
      // 如果状态改为已发布，记录发布时间
      if (status === 'published') {
        updates.publishedAt = new Date();
      }
      
      // 如果状态改为已修改，记录修改时间和修改者
      if (status === 'modified') {
        updates.modifiedAt = new Date();
        updates.modifiedBy = (req as any).user._id;
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ success: false, error: '没有有效的更新内容' });
    }

    // 如果试卷属于试卷集，需要检查权限
    if (paper.libraryId) {
      // 这里可以添加权限检查逻辑
      // 暂时跳过，后续可以添加专门的权限检查
    }

    const updatedPaper = await Paper.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    return res.json({ success: true, data: updatedPaper });
  } catch (err) {
    console.error('update paper failed:', err);
    return res.status(500).json({ success: false, error: '更新试卷失败' });
  }
});

// 更新草稿
router.put('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const paper = await Paper.findById(req.params.id);
    if (!paper) {
      return res.status(404).json({ success: false, error: '试卷不存在' });
    }

    // 如果试卷属于试卷集，需要检查权限
    if (paper.libraryId) {
      // 这里可以添加权限检查逻辑
    }

    const updatedPaper = await updateDraft(req.params.id, req.body);
    if (!updatedPaper) {
      return res.status(404).json({ success: false, error: '试卷不存在' });
    }
    return res.json({ success: true, data: updatedPaper });
  } catch (err) {
    console.error('update draft failed:', err);
    return res.status(500).json({ success: false, error: '更新草稿失败' });
  }
});

// 获取我的试卷列表（包含所有有权限的试卷）
router.get('/my-papers', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { search, category, type, status, sortBy, sortOrder, page, limit, bank } = req.query;
    const userId = (req as any).user._id;

    // 获取用户有权限访问的试卷集ID
    const PaperBankMember = require('../models/PaperBankMember').default;
    const userMemberships = await PaperBankMember.find({ userId });
    const accessiblePaperBankIds = userMemberships.map((member: any) => member.paperBankId);
    
    // 构建查询条件
    const query: any = {
      $or: [
        { owner: userId }, // 用户创建的试卷
        { bank: { $in: accessiblePaperBankIds } } // 用户有权限访问的试卷集中的试卷
      ]
    };

    // 搜索条件
    if (search && typeof search === 'string') {
      query.$and = [
        query,
        {
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { subject: { $regex: search, $options: 'i' } }
          ]
        }
      ];
    }

    // 类型筛选
    if (type && typeof type === 'string') {
      query.type = type;
    }

    // 状态筛选
    if (status && typeof status === 'string') {
      query.status = status;
    }

    // 试卷集筛选
    if (bank && typeof bank === 'string') {
      query.bank = bank;
    }

    // 构建排序条件
    const sort: any = {};
    sort[sortBy as string] = sortOrder === 'asc' ? 1 : -1;

    // 执行查询
    const papers = await Paper.find(query)
      .populate('owner', 'name email')
      .populate('bank', 'name')
      .populate('sections.items.question', '_id')
      .sort(sort)
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    // 获取总数
    const total = await Paper.countDocuments(query);

    // 为每个试卷添加用户角色信息
    const papersWithRoles = await Promise.all(papers.map(async (paper) => {
      let userRole = 'viewer'; // 默认为查看者
      
      // 检查是否是试卷创建者
      if (paper.owner._id.toString() === userId.toString()) {
        userRole = 'creator';
      } else if (paper.bank) {
        // 检查用户在试卷集中的角色
        const PaperBankMember = require('../models/PaperBankMember').default;
        const membership = await PaperBankMember.findOne({
          paperBankId: paper.bank._id,
          userId: userId
        });
        
        if (membership) {
          userRole = membership.role;
        }
      }
      
      return {
        ...paper.toObject(),
        userRole
      };
    }));

    res.json({
      success: true,
      data: {
        papers: papersWithRoles,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / Number(limit))
        }
      }
    });
    return;
  } catch (error) {
    console.error('获取我的试卷失败:', error);
    res.status(500).json({ success: false, error: '获取我的试卷失败' });
    return;
  }
});

// 获取试卷列表
router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { status, keyword, page, limit, libraryId } = req.query as any;
    const owner = (req as any).user._id;

    // 如果指定了试卷集，需要检查权限
    if (libraryId) {
      // 这里可以添加权限检查逻辑
    }

    const data = await listPapers({ owner, status, keyword, page: Number(page) || 1, limit: Number(limit) || 20, libraryId: libraryId as string });
    return res.json({ success: true, data });
  } catch (err) {
    console.error('list papers failed:', err);
    return res.status(500).json({ success: false, error: '获取试卷列表失败' });
  }
});

// 获取试卷详情
router.get('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const paper = await getPaper(req.params.id);
    if (!paper) {
      return res.status(404).json({ success: false, error: '试卷不存在' });
    }

    // 如果试卷属于试卷集，需要检查权限
    if (paper.libraryId) {
      // 这里可以添加权限检查逻辑
    }

    return res.json({ success: true, data: paper });
  } catch (err) {
    console.error('get paper failed:', err);
    return res.status(500).json({ success: false, error: '获取试卷失败' });
  }
});

// 创建试卷

// 发布试卷
router.post('/:id/publish', authMiddleware, async (req: Request, res: Response) => {
  try {
    const paper = await Paper.findById(req.params.id);
    if (!paper) {
      return res.status(404).json({ success: false, error: '试卷不存在' });
    }

    // 如果试卷属于试卷集，需要检查权限
    if (paper.libraryId) {
      // 这里可以添加权限检查逻辑
    }

    const publishedPaper = await publishPaper(req.params.id);
    if (!publishedPaper) {
      return res.status(404).json({ success: false, error: '试卷不存在' });
    }
    return res.json({ success: true, data: publishedPaper });
  } catch (err) {
    console.error('publish paper failed:', err);
    return res.status(500).json({ success: false, error: '发布试卷失败' });
  }
});

// 删除试卷
router.delete('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const paper = await Paper.findById(req.params.id);
    if (!paper) {
      return res.status(404).json({ success: false, error: '试卷不存在' });
    }

    // 如果试卷属于试卷集，检查删除权限
    if (paper.libraryId) {
      // 这里可以添加权限检查逻辑
    }

    const success = await deletePaper(req.params.id);
    if (!success) return res.status(404).json({ success: false, error: '试卷不存在' });
    return res.json({ success: true, message: '删除成功' });
  } catch (err) {
    console.error('delete paper failed:', err);
    return res.status(500).json({ success: false, error: '删除试卷失败' });
  }
});

// 更新Overleaf编辑链接
router.patch('/:id/overleaf-link', authMiddleware, async (req: Request, res: Response) => {
  try {
    const paper = await Paper.findById(req.params.id);
    if (!paper) {
      return res.status(404).json({ success: false, error: '试卷不存在' });
    }

    const userId = (req as any).user._id;
    const { overleafEditLink } = req.body;


    // 检查权限：
    // 1. 试卷创建者可以添加/编辑/删除链接
    // 2. 试卷集管理权限者（编辑者/管理者/所有者）可以添加链接
    // 3. 只有添加链接的人和试卷集所有者可以编辑/删除链接
    const isPaperOwner = paper.owner.toString() === userId.toString();
    const hasBankManagementPermission = paper.bank ? await checkPaperBankManagementPermission(paper.bank, userId) : false;
    const isBankOwner = paper.bank ? await checkPaperBankOwner(paper.bank, userId) : false;
    const isLinkAddedBy = paper.overleafLinkAddedBy && paper.overleafLinkAddedBy.toString() === userId.toString();
    
    // 可以添加链接的条件
    const canAddLink = isPaperOwner || hasBankManagementPermission;
    // 可以编辑/删除链接的条件
    const canEditLink = isPaperOwner || isBankOwner || isLinkAddedBy;
    
    // 如果是要添加链接，检查canAddLink；如果是要编辑/删除，检查canEditLink
    const canEdit = overleafEditLink ? canAddLink : canEditLink;


    if (!canEdit) {
      return res.status(403).json({ success: false, error: '无权限更新Overleaf链接' });
    }

    // 更新Overleaf链接信息
    const updateData: any = {
      overleafEditLink: overleafEditLink || null,
      updatedAt: new Date()
    };

    if (overleafEditLink) {
      updateData.overleafLinkAddedBy = userId;
      updateData.overleafLinkAddedAt = new Date();
    } else {
      // 如果清空链接，也清空添加者信息
      updateData.overleafLinkAddedBy = null;
      updateData.overleafLinkAddedAt = null;
    }

    const updatedPaper = await Paper.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('owner', 'name email username')
     .populate('overleafLinkAddedBy', 'name email username')
     .populate('bank', 'name owner');

    return res.json({ 
      success: true, 
      data: updatedPaper,
      message: overleafEditLink ? 'Overleaf链接更新成功' : 'Overleaf链接已清除'
    });
  } catch (err) {
    console.error('update overleaf link failed:', err);
    return res.status(500).json({ success: false, error: '更新Overleaf链接失败' });
  }
});

// 修改试卷状态为已修改
router.patch('/:id/modify', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { markPaperAsModified } = await import('../services/paper/paperService');
    const currentUser = (req as any).user._id;
    
    const paper = await markPaperAsModified(req.params.id, currentUser);
    if (!paper) {
      return res.status(404).json({ success: false, error: '试卷不存在' });
    }
    
    return res.json({ success: true, data: paper });
  } catch (err) {
    console.error('modify paper failed:', err);
    return res.status(500).json({ success: false, error: err instanceof Error ? err.message : '标记修改失败' });
  }
});

// 试卷集内的试卷管理路由
// 在试卷集内创建试卷
router.post('/library/:libraryId', authMiddleware, libraryMemberMiddleware, requireLibraryRole('owner', 'admin', 'collaborator'), async (req: LibraryRequest, res: Response) => {
  try {
    const owner = (req as any).user._id;
    const libraryId = req.params.libraryId;
    const paperData = req.body;

    const paper = await createDraft({ ...paperData, owner, libraryId });
    return res.status(201).json({ success: true, data: paper });
  } catch (err) {
    console.error('create paper in library failed:', err);
    return res.status(500).json({ success: false, error: '在试卷集中创建试卷失败' });
  }
});

// 获取试卷集内的试卷列表
router.get('/library/:libraryId', authMiddleware, libraryMemberMiddleware, async (req: LibraryRequest, res: Response) => {
  try {
    const { status, keyword, page, limit } = req.query as any;
    const libraryId = req.params.libraryId;
    const { userRole } = req;

    // 如果是查看者，只能看到已发布或已修改的试卷
    let effectiveStatus = status;
    if (!status && userRole === 'viewer') {
      effectiveStatus = ['published', 'modified'];
    }

    const data = await listPapers({ 
      libraryId, 
      status: effectiveStatus, 
      keyword, 
      page: Number(page) || 1, 
      limit: Number(limit) || 20 
    });
    
    return res.json({ success: true, data });
  } catch (err) {
    console.error('list papers in library failed:', err);
    return res.status(500).json({ success: false, error: '获取试卷集试卷列表失败' });
  }
});

// 在试卷集内更新试卷
router.put('/library/:libraryId/:paperId', authMiddleware, libraryMemberMiddleware, async (req: LibraryRequest, res: Response) => {
  try {
    const { paperId } = req.params;
    const { userRole } = req;
    
    const paper = await Paper.findById(paperId);
    if (!paper) {
      return res.status(404).json({ success: false, error: '试卷不存在' });
    }

    // 检查编辑权限
    if (!checkPaperEditPermission(paper.owner.toString(), (req as any).user._id, userRole!)) {
      return res.status(403).json({ success: false, error: '没有编辑权限' });
    }

    const updatedPaper = await updateDraft(paperId, req.body);
    if (!updatedPaper) {
      return res.status(404).json({ success: false, error: '试卷不存在' });
    }
    
    return res.json({ success: true, data: updatedPaper });
  } catch (err) {
    console.error('update paper in library failed:', err);
    return res.status(500).json({ success: false, error: '更新试卷失败' });
  }
});

// 在试卷集内删除试卷
router.delete('/library/:libraryId/:paperId', authMiddleware, libraryMemberMiddleware, async (req: LibraryRequest, res: Response) => {
  try {
    const { paperId } = req.params;
    const { userRole } = req;
    
    const paper = await Paper.findById(paperId);
    if (!paper) {
      return res.status(404).json({ success: false, error: '试卷不存在' });
    }

    // 检查删除权限
    if (!checkPaperDeletePermission(paper.owner.toString(), (req as any).user._id, userRole!)) {
      return res.status(403).json({ success: false, error: '没有删除权限' });
    }

    const success = await deletePaper(paperId);
    if (!success) return res.status(404).json({ success: false, error: '试卷不存在' });
    
    return res.json({ success: true, message: '删除成功' });
  } catch (err) {
    console.error('delete paper in library failed:', err);
    return res.status(500).json({ success: false, error: '删除试卷失败' });
  }
});

export default router;

