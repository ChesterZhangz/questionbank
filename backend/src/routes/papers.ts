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

const router = express.Router();

// 创建草稿
router.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const owner = (req as any).user._id;
    const { libraryId, ...paperData } = req.body;

    // 如果指定了试卷集，检查权限
    if (libraryId) {
      // 这里需要检查用户是否有权限在该试卷集中创建试卷
      // 暂时跳过，后续可以添加专门的权限检查
    }

    const paper = await createDraft({ ...paperData, owner, libraryId });
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
    const { search, category, type, status, sortBy, sortOrder, page, limit } = req.query;
    const userId = (req as any).user._id;

    // 构建查询条件
    const query: any = {};

    // 搜索条件
    if (search && typeof search === 'string') {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } }
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

    // 构建排序条件
    const sort: any = {};
    sort[sortBy as string] = sortOrder === 'asc' ? 1 : -1;

    // 执行查询
    const papers = await Paper.find(query)
      .populate('owner', 'username avatar')
      .sort(sort)
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    // 获取总数
    const total = await Paper.countDocuments(query);

    // 为每个试卷添加用户角色信息（这里简化处理，实际应该根据权限系统确定）
    const papersWithRoles = papers.map(paper => ({
      ...paper.toObject(),
      userRole: paper.owner._id.toString() === userId.toString() ? 'creator' : 'viewer'
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
router.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { name, type, paperBankId, description, tags, subtitle, date } = req.body;
    const userId = (req as any).user._id;

    // 验证必填字段
    if (!name || !type || !paperBankId) {
      return res.status(400).json({ 
        success: false, 
        error: '缺少必填字段：试卷名称、类型或试卷集ID' 
      });
    }

    // 验证试卷类型
    if (!['lecture', 'practice', 'test'].includes(type)) {
      return res.status(400).json({ 
        success: false, 
        error: '无效的试卷类型' 
      });
    }

    // 检查试卷集是否存在且用户有权限
    const paperBank = await PaperBank.findOne({
      _id: paperBankId,
      $or: [
        { ownerId: userId },
        { 'members.userId': userId, 'members.role': { $in: ['owner', 'manager', 'collaborator'] } }
      ]
    });

    if (!paperBank) {
      return res.status(403).json({ 
        success: false, 
        error: '试卷集不存在或您没有权限在此试卷集中创建试卷' 
      });
    }

    // 创建试卷数据
    const paperData: any = {
      name,
      type,
      libraryId: paperBankId,
      owner: userId,
      status: 'draft',
      totalScore: 0,
      version: 1,
      sections: [],
      bank: (paperBank as any).bankId || new mongoose.Types.ObjectId(), // 使用试卷集的题库ID
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // 添加可选字段
    if (description) paperData.description = description;
    if (tags && Array.isArray(tags)) paperData.tags = tags;

    // 讲义特有字段
    if (type === 'lecture') {
      if (subtitle) paperData.subtitle = subtitle;
      if (date) paperData.date = new Date(date);
    }

    const paper = new Paper(paperData);
    await paper.save();

    // 更新试卷集的试卷数量
    await PaperBank.findByIdAndUpdate(paperBankId, {
      $inc: { paperCount: 1 }
    });

    return res.status(201).json({
      success: true,
      data: paper
    });
  } catch (error) {
    console.error('创建试卷失败:', error);
    return res.status(500).json({ success: false, error: '创建试卷失败' });
  }
});

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

