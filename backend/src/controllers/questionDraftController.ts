import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import QuestionDraft from '../models/QuestionDraft';
import { IQuestionDraft } from '../models/QuestionDraft';

// 获取用户的所有草稿
export const getUserDrafts = async (req: AuthRequest, res: Response): Promise<Response | void> => {
  try {
    console.log('🔍 getUserDrafts 被调用');
    console.log('🔍 req.user:', req.user);
    console.log('🔍 req.headers:', req.headers);
    
    const userId = req.user?.id;
    console.log('🔍 userId:', userId);
    
    if (!userId) {
      console.log('❌ 用户ID缺失，返回401');
      return res.status(401).json({ success: false, message: '未授权访问' });
    }

    const { page = 1, limit = 10, search, tags, sortBy = 'updatedAt', sortOrder = 'desc' } = req.query;

    // 构建查询条件
    const query: any = { creator: userId };
    
    if (search) {
      query.$text = { $search: search as string };
    }
    
    if (tags && Array.isArray(tags)) {
      query.tags = { $in: tags };
    }

    // 构建排序条件
    const sort: any = {};
    sort[sortBy as string] = sortOrder === 'desc' ? -1 : 1;

    const skip = (Number(page) - 1) * Number(limit);
    
    console.log('🔍 查询条件:', query);
    console.log('🔍 排序条件:', sort);
    console.log('🔍 分页参数:', { skip, limit: Number(limit) });
    
    const drafts = await QuestionDraft.find(query)
      .sort(sort)
      .skip(skip)
      .limit(Number(limit))
      .populate('creator', 'name email');
    
    console.log('🔍 查询到的草稿数量:', drafts.length);
    console.log('🔍 草稿数据:', drafts);

    const total = await QuestionDraft.countDocuments(query);
    console.log('🔍 总草稿数量:', total);

    res.json({
      success: true,
      data: {
        drafts,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    console.error('获取草稿列表失败:', error);
    res.status(500).json({ success: false, message: '获取草稿列表失败' });
  }
};

// 获取单个草稿详情
export const getDraftById = async (req: AuthRequest, res: Response): Promise<Response | void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: '未授权访问' });
    }

    const draft = await QuestionDraft.findOne({ _id: id, creator: userId })
      .populate('creator', 'name email');

    if (!draft) {
      return res.status(404).json({ success: false, message: '草稿不存在' });
    }

    res.json({
      success: true,
      data: draft
    });
  } catch (error) {
    console.error('获取草稿详情失败:', error);
    res.status(500).json({ success: false, message: '获取草稿详情失败' });
  }
};

// 创建新草稿
export const createDraft = async (req: AuthRequest, res: Response): Promise<Response | void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: '未授权访问' });
    }

    const { name, description, questions, documentInfo, tags, isPublic = false } = req.body;

    if (!name || !questions || !Array.isArray(questions)) {
      return res.status(400).json({ success: false, message: '缺少必要参数' });
    }

    // 检查草稿名称是否重复
    const existingDraft = await QuestionDraft.findOne({ 
      creator: userId, 
      name: name.trim() 
    });

    if (existingDraft) {
      return res.status(400).json({ success: false, message: '草稿名称已存在' });
    }

    const draft = new QuestionDraft({
      name: name.trim(),
      description: description?.trim(),
      questions,
      documentInfo,
      creator: userId,
      tags: tags || [],
      isPublic
    });

    await draft.save();

    res.status(201).json({
      success: true,
      data: draft,
      message: '草稿创建成功'
    });
  } catch (error) {
    console.error('创建草稿失败:', error);
    res.status(500).json({ success: false, message: '创建草稿失败' });
  }
};

// 更新草稿
export const updateDraft = async (req: AuthRequest, res: Response): Promise<Response | void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const updates = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, message: '未授权访问' });
    }

    // 检查草稿是否存在且属于当前用户
    const existingDraft = await QuestionDraft.findOne({ _id: id, creator: userId });
    if (!existingDraft) {
      return res.status(404).json({ success: false, message: '草稿不存在' });
    }

    // 如果更新名称，检查是否与其他草稿重复
    if (updates.name && updates.name !== existingDraft.name) {
      const duplicateDraft = await QuestionDraft.findOne({ 
        creator: userId, 
        name: updates.name.trim(),
        _id: { $ne: id }
      });

      if (duplicateDraft) {
        return res.status(400).json({ success: false, message: '草稿名称已存在' });
      }
    }

    // 更新草稿
    const updatedDraft = await QuestionDraft.findByIdAndUpdate(
      id,
      { ...updates, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).populate('creator', 'name email');

    res.json({
      success: true,
      data: updatedDraft,
      message: '草稿更新成功'
    });
  } catch (error) {
    console.error('更新草稿失败:', error);
    res.status(500).json({ success: false, message: '更新草稿失败' });
  }
};

// 删除草稿
export const deleteDraft = async (req: AuthRequest, res: Response): Promise<Response | void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: '未授权访问' });
    }

    const draft = await QuestionDraft.findOneAndDelete({ _id: id, creator: userId });

    if (!draft) {
      return res.status(404).json({ success: false, message: '草稿不存在' });
    }

    res.json({
      success: true,
      message: '草稿删除成功'
    });
  } catch (error) {
    console.error('删除草稿失败:', error);
    res.status(500).json({ success: false, message: '删除草稿失败' });
  }
};

// 批量删除草稿
export const batchDeleteDrafts = async (req: AuthRequest, res: Response): Promise<Response | void> => {
  try {
    const { ids } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: '未授权访问' });
    }

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: '请选择要删除的草稿' });
    }

    const result = await QuestionDraft.deleteMany({
      _id: { $in: ids },
      creator: userId
    });

    res.json({
      success: true,
      data: { deletedCount: result.deletedCount },
      message: `成功删除 ${result.deletedCount} 个草稿`
    });
  } catch (error) {
    console.error('批量删除草稿失败:', error);
    res.status(500).json({ success: false, message: '批量删除草稿失败' });
  }
};

// 复制草稿
export const duplicateDraft = async (req: AuthRequest, res: Response): Promise<Response | void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: '未授权访问' });
    }

    const originalDraft = await QuestionDraft.findOne({ _id: id, creator: userId });
    if (!originalDraft) {
      return res.status(404).json({ success: false, message: '草稿不存在' });
    }

    // 生成新的草稿名称
    let newName = `${originalDraft.name} (副本)`;
    let counter = 1;
    
    while (await QuestionDraft.findOne({ creator: userId, name: newName })) {
      newName = `${originalDraft.name} (副本 ${counter})`;
      counter++;
    }

    const newDraft = new QuestionDraft({
      ...originalDraft.toObject(),
      _id: undefined,
      name: newName,
      creator: userId,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await newDraft.save();

    res.status(201).json({
      success: true,
      data: newDraft,
      message: '草稿复制成功'
    });
  } catch (error) {
    console.error('复制草稿失败:', error);
    res.status(500).json({ success: false, message: '复制草稿失败' });
  }
};

// 获取公开草稿列表
export const getPublicDrafts = async (req: AuthRequest, res: Response): Promise<Response | void> => {
  try {
    const { page = 1, limit = 10, search, tags, sortBy = 'updatedAt', sortOrder = 'desc' } = req.query;

    // 构建查询条件
    const query: any = { isPublic: true };
    
    if (search) {
      query.$text = { $search: search as string };
    }
    
    if (tags && Array.isArray(tags)) {
      query.tags = { $in: tags };
    }

    // 构建排序条件
    const sort: any = {};
    sort[sortBy as string] = sortOrder === 'desc' ? -1 : 1;

    const skip = (Number(page) - 1) * Number(limit);
    
    const drafts = await QuestionDraft.find(query)
      .sort(sort)
      .skip(skip)
      .limit(Number(limit))
      .populate('creator', 'name email')
      .select('-questions'); // 不返回题目内容，只返回基本信息

    const total = await QuestionDraft.countDocuments(query);

    res.json({
      success: true,
      data: {
        drafts,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    console.error('获取公开草稿列表失败:', error);
    res.status(500).json({ success: false, message: '获取公开草稿列表失败' });
  }
};

// 获取公开草稿详情
export const getPublicDraftById = async (req: AuthRequest, res: Response): Promise<Response | void> => {
  try {
    const { id } = req.params;

    const draft = await QuestionDraft.findOne({ _id: id, isPublic: true })
      .populate('creator', 'name email');

    if (!draft) {
      return res.status(404).json({ success: false, message: '草稿不存在或未公开' });
    }

    res.json({
      success: true,
      data: draft
    });
  } catch (error) {
    console.error('获取公开草稿详情失败:', error);
    res.status(500).json({ success: false, message: '获取公开草稿详情失败' });
  }
};
