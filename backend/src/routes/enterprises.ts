import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Enterprise } from '../models/Enterprise';
import { Department } from '../models/Department';
import { User } from '../models/User';
import { EnterpriseMessage } from '../models/EnterpriseMessage';
import { AuthRequest, authMiddleware } from '../middleware/auth';

const router = express.Router();

// 企业头像上传配置
const enterpriseAvatarUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadDir = path.join(process.cwd(), 'public', 'enterprise-avatars');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, 'enterprise-' + uniqueSuffix + path.extname(file.originalname));
    }
  }),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('只允许上传图片文件'));
    }
  }
});

// 获取所有企业（仅superadmin可访问）
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    // 检查权限
    if (req.user?.role !== 'superadmin') {
      return res.status(403).json({ success: false, error: '权限不足' });
    }

    const enterprises = await Enterprise.find()
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      enterprises: enterprises.map(enterprise => ({
        _id: enterprise._id,
        name: enterprise.name,
        emailSuffix: enterprise.emailSuffix,
        creditCode: enterprise.creditCode,
        avatar: enterprise.avatar,
        status: enterprise.status,
        maxMembers: enterprise.maxMembers,
        currentMembers: enterprise.currentMembers,
        createdAt: enterprise.createdAt,
        updatedAt: enterprise.updatedAt
      }))
    });
  } catch (error) {
    console.error('获取企业列表失败:', error);
    return res.status(500).json({ success: false, error: '获取企业列表失败' });
  }
});



// 创建新企业（仅superadmin可访问）
router.post('/', authMiddleware, [
  body('name').trim().isLength({ min: 1, max: 100 }).withMessage('企业名称不能为空且不能超过100个字符'),
  body('emailSuffix').trim().isLength({ min: 2 }).withMessage('企业邮箱后缀不能为空'),
  body('creditCode').trim().isLength({ min: 1, max: 50 }).withMessage('企业信用号不能为空且不能超过50个字符'),
  body('maxMembers').isInt({ min: 1, max: 10000 }).withMessage('最大成员数量必须在1-10000之间')
], async (req: AuthRequest, res: Response) => {
  try {
    // 检查权限
    if (req.user?.role !== 'superadmin') {
      return res.status(403).json({ success: false, error: '权限不足' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        error: '输入验证失败',
        details: errors.array() 
      });
    }

    const { name, emailSuffix, creditCode, maxMembers, description, address, phone, website, industry, size } = req.body;

    // 检查邮箱后缀是否已存在
    const existingEnterprise = await Enterprise.findOne({ emailSuffix });
    if (existingEnterprise) {
      return res.status(400).json({ success: false, error: '该企业邮箱后缀已存在' });
    }

    // 检查信用号是否已存在
    const existingCreditCode = await Enterprise.findOne({ creditCode });
    if (existingCreditCode) {
      return res.status(400).json({ success: false, error: '该企业信用号已存在' });
    }

    // 创建企业（不设置管理员，等待用户注册后分配）
    const enterprise = new Enterprise({
      name,
      emailSuffix,
      creditCode,
      maxMembers,

      description,
      address,
      phone,
      website,
      industry,
      size: size || 'medium',
      status: 'active'
    });

    await enterprise.save();

    return res.status(201).json({
      success: true,
      message: '企业创建成功',
      enterprise: {
        _id: enterprise._id,
        name: enterprise.name,
        emailSuffix: enterprise.emailSuffix,
        creditCode: enterprise.creditCode,
        status: enterprise.status,
        maxMembers: enterprise.maxMembers,
        currentMembers: enterprise.currentMembers,

      }
    });
  } catch (error) {
    console.error('创建企业失败:', error);
    return res.status(500).json({ success: false, error: '创建企业失败' });
  }
});

// 获取企业详情（仅superadmin可访问）
router.get('/:enterpriseId', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    // 检查权限
    if (req.user?.role !== 'superadmin') {
      return res.status(403).json({ success: false, error: '权限不足' });
    }

    const enterprise = await Enterprise.findById(req.params.enterpriseId)
      .populate('departments', 'name code description');

    if (!enterprise) {
      return res.status(404).json({ success: false, error: '企业不存在' });
    }

    // 获取企业成员列表
    const members = await User.find({ enterpriseId: enterprise._id })
      .select('name email enterpriseName role lastLogin createdAt');

    return res.json({
      success: true,
      enterprise: {
        _id: enterprise._id,
        name: enterprise.name,
        emailSuffix: enterprise.emailSuffix,
        creditCode: enterprise.creditCode,
        avatar: enterprise.avatar,
        description: enterprise.description,
        address: enterprise.address,
        phone: enterprise.phone,
        website: enterprise.website,
        industry: enterprise.industry,
        size: enterprise.size,
        status: enterprise.status,
        maxMembers: enterprise.maxMembers,
        currentMembers: enterprise.currentMembers,
        departments: enterprise.departments,
        members: members,
        createdAt: enterprise.createdAt,
        updatedAt: enterprise.updatedAt
      }
    });
  } catch (error) {
    console.error('获取企业详情失败:', error);
    return res.status(500).json({ success: false, error: '获取企业详情失败' });
  }
});

// 更新企业信息（仅superadmin可访问）
router.put('/:enterpriseId', authMiddleware, [
  body('name').optional().trim().isLength({ min: 1, max: 100 }).withMessage('企业名称不能为空且不能超过100个字符'),
  body('maxMembers').optional().isInt({ min: 1, max: 10000 }).withMessage('最大成员数量必须在1-10000之间'),
  body('status').optional().isIn(['active', 'inactive', 'pending']).withMessage('无效的企业状态')
], async (req: AuthRequest, res: Response) => {
  try {
    // 检查权限
    if (req.user?.role !== 'superadmin') {
      return res.status(403).json({ success: false, error: '权限不足' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        error: '输入验证失败',
        details: errors.array() 
      });
    }

    const { name, maxMembers, status, description, address, phone, website, industry, size } = req.body;

    const enterprise = await Enterprise.findByIdAndUpdate(
      req.params.enterpriseId,
      {
        name,
        maxMembers,
        status,
        description,
        address,
        phone,
        website,
        industry,
        size
      },
      { new: true, runValidators: true }
    );

    if (!enterprise) {
      return res.status(404).json({ success: false, error: '企业不存在' });
    }

    return res.json({
      success: true,
      message: '企业信息更新成功',
      enterprise: {
        _id: enterprise._id,
        name: enterprise.name,
        emailSuffix: enterprise.emailSuffix,
        creditCode: enterprise.creditCode,
        status: enterprise.status,
        maxMembers: enterprise.maxMembers,
        currentMembers: enterprise.currentMembers,

      }
    });
  } catch (error) {
    console.error('更新企业信息失败:', error);
    return res.status(500).json({ success: false, error: '更新企业信息失败' });
  }
});

// 上传企业头像（仅superadmin可访问）
router.post('/:enterpriseId/avatar', authMiddleware, enterpriseAvatarUpload.single('avatar'), async (req: AuthRequest, res: Response) => {
  try {
    // 检查权限
    if (req.user?.role !== 'superadmin') {
      return res.status(403).json({ success: false, error: '权限不足' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, error: '请选择要上传的头像文件' });
    }

    const enterprise = await Enterprise.findById(req.params.enterpriseId);
    if (!enterprise) {
      return res.status(404).json({ success: false, error: '企业不存在' });
    }

    // 删除旧头像文件
    if (enterprise.avatar && enterprise.avatar.startsWith('/enterprise-avatars/')) {
      const oldAvatarPath = path.join(process.cwd(), 'public', enterprise.avatar);
      if (fs.existsSync(oldAvatarPath)) {
        fs.unlinkSync(oldAvatarPath);
      }
    }

    // 更新企业头像
    const avatarUrl = '/enterprise-avatars/' + req.file.filename;
    enterprise.avatar = avatarUrl;
    await enterprise.save();

    return res.json({
      success: true,
      message: '企业头像上传成功',
      avatarUrl: avatarUrl
    });
  } catch (error) {
    console.error('上传企业头像失败:', error);
    return res.status(500).json({ success: false, error: '上传企业头像失败' });
  }
});

// 删除企业（仅superadmin可访问）
router.delete('/:enterpriseId', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    // 检查权限
    if (req.user?.role !== 'superadmin') {
      return res.status(403).json({ success: false, error: '权限不足' });
    }

    const enterprise = await Enterprise.findById(req.params.enterpriseId);
    if (!enterprise) {
      return res.status(404).json({ success: false, error: '企业不存在' });
    }

    // 检查是否有成员
    const memberCount = await User.countDocuments({ enterpriseId: enterprise._id });
    if (memberCount > 0) {
      return res.status(400).json({ success: false, error: '企业还有成员，无法删除' });
    }

    // 删除企业
    await Enterprise.findByIdAndDelete(req.params.enterpriseId);

    return res.json({
      success: true,
      message: '企业删除成功'
    });
  } catch (error) {
    console.error('删除企业失败:', error);
    return res.status(500).json({ success: false, error: '删除企业失败' });
  }
});

export default router;
