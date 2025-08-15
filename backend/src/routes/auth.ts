import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import mongoose from 'mongoose';
import { User } from '../models/User';
import { Question } from '../models/Question';
import { LoginHistory } from '../models/LoginHistory';
import { AuthRequest, authMiddleware } from '../middleware/auth';
import { emailService } from '../services/emailService';
import { parseUserAgent } from '../utils/userAgentParser';
import { TokenService } from '../services/tokenService';
import crypto from 'crypto';

const router = express.Router();

// 注册
router.post('/register', [
  body('email')
    .isEmail()
    .withMessage('请输入有效的邮箱地址'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('密码至少6位'),
  body('name')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('姓名不能为空且不能超过50个字符')
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, name } = req.body;

    // 检查邮箱是否已存在
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: '邮箱已被注册' });
    }

    // 从邮箱地址中提取后缀
    const emailSuffix = '@' + email.split('@')[1];
    
    // 检查企业邮箱后缀是否被允许
    const Enterprise = require('../models/Enterprise').Enterprise;
    const enterprise = await Enterprise.findOne({ 
      emailSuffix: emailSuffix,
      status: 'active'
    });
    
    if (!enterprise) {
      return res.status(400).json({ error: '该企业邮箱后缀暂不支持注册，请联系管理员' });
    }
    
    // 动态计算企业当前成员数量
    const currentMemberCount = await User.countDocuments({
      email: { $regex: emailSuffix.replace('@', '@'), $options: 'i' }
    });
    
    // 检查企业是否还有注册名额
    if (currentMemberCount >= enterprise.maxMembers) {
      return res.status(400).json({ error: '该企业注册名额已满，请联系企业管理员' });
    }

    // 检查是否是该企业的第一个用户（将成为超级管理员）
    const isFirstUser = currentMemberCount === 0;
    let userRole = 'student'; // 默认角色

    // 生成邮箱验证令牌
    const verificationToken = emailService.generateVerificationToken();
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24小时后过期

    // 创建用户（未验证状态）
    const user = new User({
      email,
      password,
      name,
      enterpriseName: enterprise.name, // 设置企业名称
      role: userRole, // 根据情况设置网站角色
      isEmailVerified: false,
      emailVerificationToken: verificationToken,
      emailVerificationExpires: verificationExpires,
      isActive: true,
      emailSuffix: emailSuffix, // 动态设置邮箱后缀
      enterpriseId: enterprise._id // 自动分配到企业
    });

    await user.save();

    // 创建企业成员记录
    const EnterpriseMember = require('../models/EnterpriseMember').default;
    const enterpriseMember = new EnterpriseMember({
      userId: user._id,
      enterpriseId: enterprise._id,
      role: isFirstUser ? 'superAdmin' : 'member', // 第一个用户成为企业超级管理员
      status: 'active'
    });
    await enterpriseMember.save();

    // 不再需要更新企业成员数量，因为现在是动态计算的

    // 发送验证邮件
    const emailSent = await emailService.sendVerificationEmail({
      email,
      name,
      token: verificationToken
    });

    if (!emailSent) {
      // 如果邮件发送失败，删除用户
      await User.findByIdAndDelete(user._id);
      return res.status(500).json({ error: '邮件发送失败，请稍后重试' });
    }

    return res.status(201).json({
      success: true,
      message: '注册成功，请查收邮箱验证邮件',
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        enterpriseName: user.enterpriseName,
        enterpriseId: user.enterpriseId,
        avatar: user.avatar,
        nickname: user.nickname,
        bio: user.bio,
        phone: user.phone,
        location: user.location,
        website: user.website,
        birthday: user.birthday,
        gender: user.gender,
        interests: user.interests,
        skills: user.skills,
        education: user.education,
        occupation: user.occupation,
        company: user.company,
        position: user.position,
        socialLinks: user.socialLinks,
        preferences: user.preferences,
        isEmailVerified: user.isEmailVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    console.error('注册失败:', error);
    return res.status(500).json({ error: '注册失败' });
  }
});

// 获取允许注册的企业邮箱后缀
router.get('/allowed-enterprises', async (req: Request, res: Response) => {
  try {
    const Enterprise = require('../models/Enterprise').Enterprise;
    const enterprises = await Enterprise.find({ 
      status: 'active' 
    }).select('name emailSuffix maxMembers');
    
    // 动态计算每个企业的实际成员数量和可用名额
    const enterprisesWithActualMembers = await Promise.all(
      enterprises.map(async (enterprise: any) => {
        try {
          // 统计邮箱尾缀相同的用户数量
          const actualMemberCount = await User.countDocuments({
            email: { $regex: enterprise.emailSuffix.replace('@', '@'), $options: 'i' }
          });

          return {
            name: enterprise.name,
            emailSuffix: enterprise.emailSuffix,
            currentMembers: actualMemberCount,
            maxMembers: enterprise.maxMembers,
            availableSlots: Math.max(0, enterprise.maxMembers - actualMemberCount)
          };
        } catch (error) {
          console.error(`计算企业 ${enterprise.name} 成员数量失败:`, error);
          return {
            name: enterprise.name,
            emailSuffix: enterprise.emailSuffix,
            currentMembers: 0,
            maxMembers: enterprise.maxMembers,
            availableSlots: enterprise.maxMembers
          };
        }
      })
    );
    
    return res.json({
      success: true,
      enterprises: enterprisesWithActualMembers
    });
  } catch (error) {
    console.error('获取允许注册的企业失败:', error);
    return res.status(500).json({ error: '获取企业信息失败' });
  }
});

// 邮箱验证
router.get('/verify-email', async (req: Request, res: Response) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ error: '验证令牌无效' });
    }

    // 查找用户
    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({ error: '验证令牌无效或已过期' });
    }

    // 更新用户状态
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    // 发送欢迎邮件
    await emailService.sendWelcomeEmail(user.email, user.name);

    return res.json({
      success: true,
      message: '邮箱验证成功！',
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        enterpriseName: user.enterpriseName,
        enterpriseId: user.enterpriseId,
        avatar: user.avatar,
        nickname: user.nickname,
        bio: user.bio,
        phone: user.phone,
        location: user.location,
        website: user.website,
        birthday: user.birthday,
        gender: user.gender,
        interests: user.interests,
        skills: user.skills,
        education: user.education,
        occupation: user.occupation,
        company: user.company,
        position: user.position,
        socialLinks: user.socialLinks,
        preferences: user.preferences,
        isEmailVerified: user.isEmailVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    console.error('邮箱验证失败:', error);
    return res.status(500).json({ error: '邮箱验证失败' });
  }
});

// 重新发送验证邮件
router.post('/resend-verification', [
  body('email').isEmail().withMessage('请输入有效的邮箱地址')
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ error: '邮箱已验证' });
    }

    // 生成新的验证令牌
    const verificationToken = emailService.generateVerificationToken();
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    user.emailVerificationToken = verificationToken;
    user.emailVerificationExpires = verificationExpires;
    await user.save();

    // 发送验证邮件
    const emailSent = await emailService.sendVerificationEmail({
      email: user.email,
      name: user.name,
      token: verificationToken
    });

    if (!emailSent) {
      return res.status(500).json({ error: '邮件发送失败，请稍后重试' });
    }

    return res.json({
      success: true,
      message: '验证邮件已重新发送'
    });
  } catch (error) {
    console.error('重新发送验证邮件失败:', error);
    return res.status(500).json({ error: '重新发送验证邮件失败' });
  }
});

// 登录
router.post('/login', [
  body('email').isEmail().withMessage('请输入有效的邮箱地址'),
  body('password').notEmpty().withMessage('密码不能为空')
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // 查找用户
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: '邮箱或密码错误' });
    }

    // 验证密码
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      // 记录失败的登录尝试
      const userAgent = req.headers['user-agent'] || 'Unknown';
      const { browser, os, device } = parseUserAgent(userAgent);
      const clientIP = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'] || 'Unknown';
      
      await LoginHistory.create({
        userId: user._id,
        timestamp: new Date(),
        ip: clientIP.toString().replace('::ffff:', ''),
        userAgent,
        device,
        browser,
        os,
        status: 'failed',
        failureReason: '密码错误'
      });
      
      return res.status(401).json({ error: '邮箱或密码错误' });
    }

    // 检查用户状态
    if (!user.isActive) {
      return res.status(403).json({ error: '账户已被禁用' });
    }

    // 检查邮箱验证状态
    if (!user.isEmailVerified) {
      return res.status(403).json({ 
        error: '请先验证邮箱',
        needsVerification: true,
        email: user.email
      });
    }

    // 更新最后登录时间
    user.lastLogin = new Date();
    await user.save();

    // 记录登录历史
    const userAgent = req.headers['user-agent'] || 'Unknown';
    const { browser, os, device } = parseUserAgent(userAgent);
    const clientIP = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'] || 'Unknown';
    
    await LoginHistory.create({
      userId: user._id,
      timestamp: new Date(),
      ip: clientIP.toString().replace('::ffff:', ''),
      userAgent,
      device,
      browser,
      os,
      status: 'success'
    });

    // 生成JWT令牌
    const token = TokenService.generateToken(user._id as string);

    return res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        enterpriseName: user.enterpriseName,
        enterpriseId: user.enterpriseId,
        avatar: user.avatar,
        nickname: user.nickname,
        bio: user.bio,
        phone: user.phone,
        location: user.location,
        website: user.website,
        birthday: user.birthday,
        gender: user.gender,
        interests: user.interests,
        skills: user.skills,
        education: user.education,
        occupation: user.occupation,
        company: user.company,
        position: user.position,
        socialLinks: user.socialLinks,
        preferences: user.preferences,
        lastLogin: user.lastLogin,
        isEmailVerified: user.isEmailVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    console.error('登录失败:', error);
    return res.status(500).json({ error: '登录失败' });
  }
});

// 获取当前用户信息
router.get('/me', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user?._id).select('-password');
    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }

    return res.json({
      success: true,
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        enterpriseName: user.enterpriseName,
        enterpriseId: user.enterpriseId,
        avatar: user.avatar,
        nickname: user.nickname,
        bio: user.bio,
        phone: user.phone,
        location: user.location,
        website: user.website,
        birthday: user.birthday,
        gender: user.gender,
        interests: user.interests,
        skills: user.skills,
        education: user.education,
        occupation: user.occupation,
        company: user.company,
        position: user.position,
        socialLinks: user.socialLinks,
        preferences: user.preferences,
        lastLogin: user.lastLogin,
        isEmailVerified: user.isEmailVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    console.error('获取用户信息失败:', error);
    return res.status(500).json({ error: '获取用户信息失败' });
  }
});

// 更新个人信息
router.put('/profile', authMiddleware, [
  body('name').optional().trim().isLength({ min: 1, max: 50 }).withMessage('姓名不能为空且不能超过50个字符'),
  body('enterpriseName').optional().trim().isLength({ max: 100 }).withMessage('企业名称不能超过100个字符'),
  body('avatar').optional().custom((value) => {
    if (value === undefined || value === null || value === '') return true;
    if (typeof value === 'string' && value.length > 0) return true;
    throw new Error('头像URL格式无效');
  }).withMessage('头像URL格式无效'),
  body('nickname').optional().trim().isLength({ max: 30 }).withMessage('昵称不能超过30个字符'),
  body('bio').optional().trim().isLength({ max: 200 }).withMessage('个人简介不能超过200个字符'),
  body('phone').optional().custom((value) => {
    if (value === undefined || value === null || value === '') return true;
    if (/^1[3-9]\d{9}$/.test(value)) return true;
    throw new Error('请输入有效的手机号码');
  }).withMessage('请输入有效的手机号码'),
  body('location').optional().trim().isLength({ max: 100 }).withMessage('所在地不能超过100个字符'),
  body('website').optional().custom((value) => {
    if (value === undefined || value === null || value === '') return true;
    if (value.startsWith('http://') || value.startsWith('https://')) {
      try {
        new URL(value);
        return true;
      } catch {
        throw new Error('请输入有效的网站地址');
      }
    }
    // 如果没有协议，添加https://
    try {
      new URL(`https://${value}`);
      return true;
    } catch {
      throw new Error('请输入有效的网站地址');
    }
  }).withMessage('请输入有效的网站地址'),
  body('birthday').optional().custom((value) => {
    if (value === undefined || value === null || value === '') return true;
    if (value === '') return true;
    const date = new Date(value);
    return !isNaN(date.getTime());
  }).withMessage('生日格式无效'),
  body('gender').optional().isIn(['male', 'female', 'other', 'prefer-not-to-say']).withMessage('性别选择无效'),
  body('interests').optional().custom((value) => {
    if (value === undefined || value === null || value === '') return true;
    if (Array.isArray(value)) return true;
    if (typeof value === 'string') return true;
    throw new Error('兴趣爱好格式无效');
  }).withMessage('兴趣爱好格式无效'),
  body('skills').optional().custom((value) => {
    if (value === undefined || value === null || value === '') return true;
    if (Array.isArray(value)) return true;
    if (typeof value === 'string') return true;
    throw new Error('技能标签格式无效');
  }).withMessage('技能标签格式无效'),
  body('education').optional().trim().isLength({ max: 50 }).withMessage('学历不能超过50个字符'),
  body('occupation').optional().trim().isLength({ max: 50 }).withMessage('职业不能超过50个字符'),
  body('company').optional().trim().isLength({ max: 100 }).withMessage('公司名称不能超过100个字符'),
  body('position').optional().trim().isLength({ max: 50 }).withMessage('职位不能超过50个字符'),
  body('socialLinks').optional().custom((value) => {
    if (value === undefined || value === null || value === '') return true;
    if (typeof value === 'object' && value !== null) return true;
    throw new Error('社交链接必须是对象');
  }).withMessage('社交链接必须是对象'),
  body('preferences').optional().custom((value) => {
    if (value === undefined || value === null || value === '') return true;
    if (typeof value === 'object' && value !== null) return true;
    throw new Error('偏好设置必须是对象');
  }).withMessage('偏好设置必须是对象')
], async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        error: '输入验证失败',
        details: errors.array() 
      });
    }

    const { 
      name, enterpriseName, avatar, nickname, bio, phone, location, website, 
      birthday, gender, interests, skills, education, occupation, 
      company, position, socialLinks, preferences 
    } = req.body;
    
    const updateData: any = {};

    if (name !== undefined) updateData.name = name;
    if (enterpriseName !== undefined) updateData.enterpriseName = enterpriseName;
    if (avatar !== undefined) updateData.avatar = avatar;
    if (nickname !== undefined) updateData.nickname = nickname;
    if (bio !== undefined) updateData.bio = bio;
    if (phone !== undefined) updateData.phone = phone;
    if (location !== undefined) updateData.location = location;
    if (website !== undefined) {
      if (website && !website.startsWith('http://') && !website.startsWith('https://')) {
        updateData.website = `https://${website}`;
      } else {
        updateData.website = website;
      }
    }
    if (birthday !== undefined) updateData.birthday = birthday;
    if (gender !== undefined) updateData.gender = gender;
    if (interests !== undefined) {
      if (typeof interests === 'string') {
        updateData.interests = interests.split(',').map(item => item.trim()).filter(item => item.length > 0);
      } else {
        updateData.interests = interests;
      }
    }
    if (skills !== undefined) {
      if (typeof skills === 'string') {
        updateData.skills = skills.split(',').map(item => item.trim()).filter(item => item.length > 0);
      } else {
        updateData.skills = skills;
      }
    }
    if (education !== undefined) updateData.education = education;
    if (occupation !== undefined) updateData.occupation = occupation;
    if (company !== undefined) updateData.company = company;
    if (position !== undefined) updateData.position = position;
    if (socialLinks !== undefined) updateData.socialLinks = socialLinks;
    if (preferences !== undefined) updateData.preferences = preferences;

    const user = await User.findByIdAndUpdate(
      req.user?._id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, error: '用户不存在' });
    }

    return res.json({
      success: true,
      message: '个人信息更新成功',
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        enterpriseName: user.enterpriseName,
        enterpriseId: user.enterpriseId,
        avatar: user.avatar,
        nickname: user.nickname,
        bio: user.bio,
        phone: user.phone,
        location: user.location,
        website: user.website,
        birthday: user.birthday,
        gender: user.gender,
        interests: user.interests,
        skills: user.skills,
        education: user.education,
        occupation: user.occupation,
        company: user.company,
        position: user.position,
        socialLinks: user.socialLinks,
        preferences: user.preferences,
        lastLogin: user.lastLogin,
        isEmailVerified: user.isEmailVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    console.error('更新个人信息失败:', error);
    return res.status(500).json({ success: false, error: '更新个人信息失败' });
  }
});

// 登出
router.post('/logout', async (req: AuthRequest, res: Response) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (token) {
      // 验证token但不要求用户存在（因为可能是密码更改后的失效token）
      const decoded = TokenService.verifyToken(token);
      if (decoded) {
        // 将当前token加入黑名单
        await TokenService.blacklistToken(token, decoded.userId, 'logout');
      }
    }

    return res.json({
      success: true,
      message: '登出成功'
    });
  } catch (error) {
    console.error('登出失败:', error);
    return res.status(500).json({ success: false, error: '登出失败' });
  }
});

// 忘记密码 - 发送重置邮件
router.post('/forgot-password', [
  body('email')
    .isEmail()
    .withMessage('请输入有效的邮箱地址')
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        message: errors.array()[0].msg
      });
    }

    const { email } = req.body;

    // 查找用户
    const user = await User.findOne({ email });
    
    // 检查用户是否存在
    if (!user) {
      return res.status(400).json({
        success: false,
        message: '该邮箱地址未注册，请检查邮箱地址或先注册账号'
      });
    }

    // 检查用户账号状态
    if (!user.isActive) {
      return res.status(400).json({
        success: false,
        message: '该账号已被禁用，无法重置密码'
      });
    }

    // 检查邮箱是否已验证
    if (!user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: '该邮箱尚未完成验证，请先验证邮箱后再重置密码'
      });
    }

    // 生成重置token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24小时后过期

    // 保存重置token到用户记录
    user.passwordResetToken = resetToken;
    user.passwordResetExpires = resetTokenExpiry;
    await user.save();

    // 发送重置邮件
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    
    await emailService.sendPasswordResetEmail(email, user.name, resetUrl);

    console.log(`密码重置邮件已发送给用户: ${email}`);

    return res.json({
      success: true,
      message: '重置密码邮件已发送，请查看您的邮箱'
    });

  } catch (error) {
    console.error('发送密码重置邮件失败:', error);
    return res.status(500).json({ 
      success: false, 
      message: '发送邮件失败，请稍后重试' 
    });
  }
});

// 重置密码
router.post('/reset-password', [
  body('token')
    .notEmpty()
    .withMessage('重置token不能为空'),
  body('password')
    .isLength({ min: 8, max: 20 })
    .withMessage('密码长度必须在8-20位之间')
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        message: errors.array()[0].msg
      });
    }

    const { token, password } = req.body;

    // 查找拥有该重置token且未过期的用户
    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: '重置链接无效或已过期'
      });
    }

    // 更新密码
    user.password = password; // User模型会自动加密密码
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    // 使所有现有token失效
    await TokenService.invalidateAllUserTokens((user._id as any).toString());

    console.log(`用户 ${user.email} 密码重置成功`);

    return res.json({
      success: true,
      message: '密码重置成功，请使用新密码登录'
    });

  } catch (error) {
    console.error('密码重置失败:', error);
    return res.status(500).json({ 
      success: false, 
      message: '密码重置失败，请稍后重试' 
    });
  }
});

// 修改密码
router.put('/change-password', authMiddleware, [
  body('currentPassword').notEmpty().withMessage('当前密码不能为空'),
  body('newPassword').isLength({ min: 6 }).withMessage('新密码至少6位')
], async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        error: '输入验证失败',
        details: errors.array() 
      });
    }

    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user?._id);

    if (!user) {
      return res.status(404).json({ success: false, error: '用户不存在' });
    }

    // 验证当前密码
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ success: false, error: '当前密码错误' });
    }

    // 更新密码
    user.password = newPassword;
    await user.save();

    // 使该用户的所有现有token失效
    await TokenService.invalidateAllUserTokens(user._id as string);

    return res.json({
      success: true,
      message: '密码修改成功，所有设备将需要重新登录'
    });
  } catch (error) {
    console.error('修改密码失败:', error);
    return res.status(500).json({ success: false, error: '修改密码失败' });
  }
});

// 导出用户数据
router.get('/export-data', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user?._id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, error: '用户不存在' });
    }

    // TODO: 实现数据导出功能
    // 这里可以导出用户的题库、题目、收藏等数据

    return res.json({
      success: true,
      message: '数据导出功能开发中',
      downloadUrl: null
    });
  } catch (error) {
    console.error('导出用户数据失败:', error);
    return res.status(500).json({ success: false, error: '导出用户数据失败' });
  }
});

// 关注用户
router.post('/follow/:userId', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user?._id;

    if (currentUserId?.toString() === userId) {
      return res.status(400).json({ success: false, error: '不能关注自己' });
    }

    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return res.status(404).json({ success: false, error: '用户不存在' });
    }

    const currentUser = await User.findById(currentUserId);
    if (!currentUser) {
      return res.status(404).json({ success: false, error: '当前用户不存在' });
    }

    // 检查是否已经关注
    const isFollowing = currentUser.following?.includes(targetUser._id as any);
    
    if (isFollowing) {
      // 取消关注
      await User.findByIdAndUpdate(currentUserId, {
        $pull: { following: targetUser._id }
      });
      await User.findByIdAndUpdate(userId, {
        $pull: { followers: currentUserId }
      });
      
      return res.json({
        success: true,
        message: '取消关注成功',
        isFollowing: false
      });
    } else {
      // 关注
      await User.findByIdAndUpdate(currentUserId, {
        $addToSet: { following: targetUser._id }
      });
      await User.findByIdAndUpdate(userId, {
        $addToSet: { followers: currentUserId }
      });
      
      return res.json({
        success: true,
        message: '关注成功',
        isFollowing: true
      });
    }
  } catch (error) {
    console.error('关注操作失败:', error);
    return res.status(500).json({ success: false, error: '关注操作失败' });
  }
});

// 获取用户关注状态
router.get('/follow-status/:userId', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user?._id;

    const currentUser = await User.findById(currentUserId);
    if (!currentUser) {
      return res.status(404).json({ success: false, error: '当前用户不存在' });
    }

    const isFollowing = currentUser.following?.includes(userId as any);
    
    return res.json({
      success: true,
      isFollowing: !!isFollowing
    });
  } catch (error) {
    console.error('获取关注状态失败:', error);
    return res.status(500).json({ success: false, error: '获取关注状态失败' });
  }
});

// 获取用户的粉丝和关注列表
router.get('/social/:userId', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const { type = 'followers' } = req.query; // followers 或 following

    const user = await User.findById(userId)
      .populate(type === 'followers' ? 'followers' : 'following', 'name email avatar nickname bio')
      .select('followers following');

    if (!user) {
      return res.status(404).json({ success: false, error: '用户不存在' });
    }

    const list = type === 'followers' ? user.followers : user.following;
    
    return res.json({
      success: true,
      data: list || []
    });
  } catch (error) {
    console.error('获取社交列表失败:', error);
    return res.status(500).json({ success: false, error: '获取社交列表失败' });
  }
});

// 收藏题目
router.post('/favorites/:questionId', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { questionId } = req.params;
    const currentUserId = req.user?._id;

    const currentUser = await User.findById(currentUserId);
    if (!currentUser) {
      return res.status(404).json({ success: false, error: '用户不存在' });
    }

    // 首先根据qid查找题目，获取其ObjectId
    const question = await Question.findOne({ qid: questionId });
    if (!question) {
      return res.status(404).json({ success: false, error: '题目不存在' });
    }

    const questionObjectId = question._id as mongoose.Types.ObjectId;

    // 检查是否已经收藏
    const isFavorited = currentUser.favorites?.some(fav => fav.toString() === questionObjectId.toString());
    
    if (isFavorited) {
      // 取消收藏
      await User.findByIdAndUpdate(currentUserId, {
        $pull: { favorites: questionObjectId }
      });
      
      return res.json({
        success: true,
        message: '取消收藏成功',
        isFavorited: false
      });
    } else {
      // 收藏
      await User.findByIdAndUpdate(currentUserId, {
        $addToSet: { favorites: questionObjectId }
      });
      
      return res.json({
        success: true,
        message: '收藏成功',
        isFavorited: true
      });
    }
  } catch (error) {
    console.error('收藏操作失败:', error);
    return res.status(500).json({ success: false, error: '收藏操作失败' });
  }
});

// 获取用户收藏列表
router.get('/favorites', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const currentUserId = req.user?._id;

    // 首先获取用户的所有收藏题目ID
    const user = await User.findById(currentUserId).select('favorites');
    if (!user) {
      return res.status(404).json({ success: false, error: '用户不存在' });
    }

    const favoriteIds = user.favorites || [];
    const total = favoriteIds.length;
    
    // 计算分页
    const skip = (Number(page) - 1) * Number(limit);
    const paginatedIds = favoriteIds.slice(skip, skip + Number(limit));
    
    // 根据ID获取题目详情
    const Question = mongoose.model('Question');
    const favorites = await Question.find({
      _id: { $in: paginatedIds }
    })
    .populate('creator', 'name email')
    .populate('questionBank', 'name')
    .sort({ createdAt: -1 });
    
    return res.json({
      success: true,
      data: {
        favorites: favorites,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    console.error('获取收藏列表失败:', error);
    return res.status(500).json({ success: false, error: '获取收藏列表失败' });
  }
});

// 删除账户
router.delete('/account', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user?._id);
    if (!user) {
      return res.status(404).json({ success: false, error: '用户不存在' });
    }

    // 防止删除超级管理员
    if (user.role === 'superadmin') {
      return res.status(400).json({ success: false, error: '不能删除超级管理员账户' });
    }

    // TODO: 删除用户相关的所有数据（题库、题目等）
    await User.findByIdAndDelete(req.user?._id);

    return res.json({
      success: true,
      message: '账户删除成功'
    });
  } catch (error) {
    console.error('删除账户失败:', error);
    return res.status(500).json({ success: false, error: '删除账户失败' });
  }
});

// 头像上传配置
const avatarUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadDir = path.join(process.cwd(), 'public', 'avatars');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
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

// 头像上传
router.post('/upload-avatar', authMiddleware, avatarUpload.single('avatar'), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: '请选择要上传的头像文件' });
    }

    const user = await User.findById(req.user?._id);
    if (!user) {
      return res.status(404).json({ success: false, error: '用户不存在' });
    }

    // 删除旧头像文件
    if (user.avatar && user.avatar.startsWith('/avatars/')) {
      const oldAvatarPath = path.join(process.cwd(), 'public', user.avatar);
      if (fs.existsSync(oldAvatarPath)) {
        fs.unlinkSync(oldAvatarPath);
      }
    }

    // 更新用户头像
    const avatarUrl = '/avatars/' + req.file.filename;
    user.avatar = avatarUrl;
    await user.save();

    return res.json({
      success: true,
      message: '头像上传成功',
      avatarUrl: avatarUrl,
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        enterpriseName: user.enterpriseName,
        avatar: user.avatar,
        lastLogin: user.lastLogin,
        isEmailVerified: user.isEmailVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    console.error('头像上传失败:', error);
    return res.status(500).json({ success: false, error: '头像上传失败' });
  }
});

// 获取登录历史
router.get('/login-history', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    // 确保用户存在
    if (!req.user?._id) {
      return res.status(401).json({ success: false, error: '用户未认证' });
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    // 查询登录历史
    const history = await LoginHistory.find({ userId: req.user._id })
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // 获取总数
    const total = await LoginHistory.countDocuments({ userId: req.user._id });

    // 如果没有登录历史记录，创建一个基于当前登录的初始记录
    if (total === 0) {
      const userAgent = req.headers['user-agent'] || 'Unknown';
      const { browser, os, device } = parseUserAgent(userAgent);
      const clientIP = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'] || 'Unknown';
      
      await LoginHistory.create({
        userId: req.user._id,
        timestamp: new Date(),
        ip: clientIP.toString().replace('::ffff:', ''),
        userAgent,
        device,
        browser,
        os,
        status: 'success'
      });

      // 重新查询
      const newHistory = await LoginHistory.find({ userId: req.user._id })
        .sort({ timestamp: -1 })
        .lean();

      const formattedHistory = newHistory.map(record => ({
        id: record._id.toString(),
        timestamp: record.timestamp,
        ip: record.ip,
        location: record.location || '未知',
        device: `${record.browser} / ${record.os}`,
        status: record.status,
        failureReason: record.failureReason
      }));

      return res.json({
        success: true,
        data: {
          history: formattedHistory,
          pagination: {
            page: 1,
            limit: 1,
            total: 1,
            totalPages: 1
          }
        }
      });
    }

    // 格式化返回数据
    const formattedHistory = history.map(record => ({
      id: record._id.toString(),
      timestamp: record.timestamp,
      ip: record.ip,
      location: record.location || '未知',
      device: `${record.browser} / ${record.os}`,
      status: record.status,
      failureReason: record.failureReason
    }));

    return res.json({
      success: true,
      data: {
        history: formattedHistory,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('获取登录历史失败:', error);
    return res.status(500).json({ success: false, error: '获取登录历史失败' });
  }
});

export default router; 