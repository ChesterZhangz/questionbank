import nodemailer from 'nodemailer';
import crypto from 'crypto';
import path from 'path';
import { config } from '../config';

// 创建邮件传输器函数 - 每次调用时重新创建
const createTransporter = () => {
  return nodemailer.createTransport({
    host: 'smtp.exmail.qq.com', // 企业邮箱SMTP服务器
    port: 465, // SSL端口
    secure: true, // 使用SSL
    auth: {
      user: process.env.QQ_EMAIL_USER,
      pass: process.env.QQ_EMAIL_PASS
    }
  });
};

// 通用邮件模板 - 支持深色/浅色模式和中英文切换
const createEmailTemplate = (params: {
  title: { zh: string; en: string };
  subtitle: { zh: string; en: string };
  greeting: { zh: string; en: string };
  content: { zh: string; en: string };
  buttonText: { zh: string; en: string };
  buttonUrl: string;
  footerText: { zh: string; en: string };
  color: string; // 主题颜色
  lang: 'zh' | 'en'; // 语言选择
}) => {
  const { title, subtitle, greeting, content, buttonText, buttonUrl, footerText, color, lang } = params;
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <!-- 标题栏 - 适应深色/浅色模式 -->
      <div style="background: ${color}; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <img src="cid:mareate-logo" alt="Mareate" style="max-height: 60px; margin-bottom: 15px;" />
        <h1 style="margin: 0; font-size: 24px; font-weight: 600;">${lang === 'zh' ? title.zh : title.en}</h1>
        <p style="margin: 10px 0 0 0; opacity: 0.9;">${lang === 'zh' ? subtitle.zh : subtitle.en}</p>
      </div>
      
      <!-- 内容区 - 适应深色/浅色模式 -->
      <div style="background-color: #ffffff; color: #333333; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 5px 15px rgba(0,0,0,0.1); border: 1px solid #e0e0e0;">
        <!-- 问候语 -->
        <h2 style="color: #333333; margin-bottom: 20px;">${lang === 'zh' ? greeting.zh : greeting.en}</h2>
        
        <!-- 主要内容 -->
        <div style="color: #555555; line-height: 1.6; margin-bottom: 25px;">
          ${lang === 'zh' ? content.zh : content.en}
        </div>
        
        <!-- 按钮 -->
        <div style="text-align: center; margin: 30px 0;">
          <a href="${buttonUrl}" 
             style="background: ${color}; 
                    color: white; 
                    padding: 15px 30px; 
                    text-decoration: none; 
                    border-radius: 8px; 
                    display: inline-block; 
                    font-weight: bold;
                    font-size: 16px;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.2);">
            ${lang === 'zh' ? buttonText.zh : buttonText.en}
          </a>
        </div>
        
        <!-- 页脚 -->
        <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
        
        <p style="color: #999999; font-size: 12px; text-align: center; margin: 0;">
          ${lang === 'zh' ? footerText.zh : footerText.en}
        </p>
      </div>
      
      <!-- 深色模式兼容 -->
      <div style="display: none; max-height: 0; overflow: hidden;">
        <!--[if mso]>
        <div style="background-color: #333333; color: #ffffff;">
          <div style="display: none; mso-hide: all;">
        <![endif]-->
      </div>
    </div>
  `;
};

export interface EmailVerificationData {
  email: string;
  name: string;
  token: string;
  lang?: 'zh' | 'en';
}

export interface InvitationEmailData {
  email: string;
  role: string;
  libraryName: string;
  inviterName: string;
  acceptUrl: string;
  lang?: 'zh' | 'en';
}

export interface QuestionBankInvitationEmailData {
  email: string;
  role: string;
  questionBankName: string;
  inviterName: string;
  acceptUrl: string;
  lang?: 'zh' | 'en';
}

export const emailService = {
  // 生成验证令牌
  generateVerificationToken(): string {
    return crypto.randomBytes(32).toString('hex');
  },

  // 发送验证邮件
  async sendVerificationEmail(data: EmailVerificationData): Promise<boolean> {
    try {
      const verificationUrl = `${config.frontendUrl}/auth/verify-email?token=${data.token}`;
      const lang = data.lang || 'zh';
      
      // 调试信息
      console.log('📧 发送验证邮件:');
      console.log(`  - 收件人: ${data.email}`);
      console.log(`  - 验证链接: ${verificationUrl}`);
      console.log(`  - 配置的frontendUrl: ${config.frontendUrl}`);
      console.log(`  - 环境变量FRONTEND_URL: ${process.env.FRONTEND_URL}`);
      
      const emailTemplate = createEmailTemplate({
        title: {
          zh: 'Mareate题库系统',
          en: 'Mareate Question Bank System'
        },
        subtitle: {
          zh: '邮箱验证',
          en: 'Email Verification'
        },
        greeting: {
          zh: `您好，${data.name}！`,
          en: `Hello, ${data.name}!`
        },
        content: {
          zh: `
            <p>感谢您注册Mareate题库系统。为了确保您的账户安全，请点击下面的按钮验证您的邮箱地址。</p>
            <p><strong>注意：</strong>此验证链接将在24小时后失效。如果您没有注册Mareate题库系统，请忽略此邮件。</p>
          `,
          en: `
            <p>Thank you for registering with the Mareate Question Bank System. To ensure your account security, please click the button below to verify your email address.</p>
            <p><strong>Note:</strong> This verification link will expire in 24 hours. If you did not register for the Mareate Question Bank System, please ignore this email.</p>
          `
        },
        buttonText: {
          zh: '验证邮箱地址',
          en: 'Verify Email Address'
        },
        buttonUrl: verificationUrl,
        footerText: {
          zh: '此邮件由系统自动发送，请勿回复。<br>如有问题请联系管理员：admin@viquard.com',
          en: 'This email was sent automatically by the system. Please do not reply.<br>If you have any questions, please contact the administrator: admin@viquard.com'
        },
        color: '#0066cc',
        lang
      });

      const mailOptions = {
        from: `"Mareate题库系统" <${process.env.QQ_EMAIL_USER}>`,
        to: data.email,
        subject: lang === 'zh' ? 'Mareate题库系统 - 邮箱验证' : 'Mareate Question Bank System - Email Verification',
        html: emailTemplate,
        attachments: [
          {
            filename: 'Mareate.png',
            path: path.join(__dirname, '../../public/Mareate.png'),
            cid: 'mareate-logo' // 内联图片ID，与HTML中的cid:mareate-logo对应
          }
        ]
      };

      const transporter = createTransporter();
      await transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('发送验证邮件失败:', error);
      return false;
    }
  },

  // 发送欢迎邮件
  async sendWelcomeEmail(email: string, name: string, lang: 'zh' | 'en' = 'zh'): Promise<boolean> {
    try {
      const emailTemplate = createEmailTemplate({
        title: {
          zh: '欢迎加入Mareate题库系统！',
          en: 'Welcome to Mareate Question Bank System!'
        },
        subtitle: {
          zh: '您的邮箱验证已成功',
          en: 'Your email verification is successful'
        },
        greeting: {
          zh: `您好，${name}！`,
          en: `Hello, ${name}!`
        },
        content: {
          zh: `
            <p>恭喜您成功完成邮箱验证！现在您可以开始使用Mareate题库系统的所有功能了。</p>
            <div style="background: #d4edda; border: 1px solid #c3e6cb; color: #155724; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
              <strong>验证成功</strong><br>
              您的账户已激活，可以正常使用所有功能。
            </div>
            <h3 style="color: #333; margin-bottom: 15px;">您可以：</h3>
            <ul style="color: #666; line-height: 1.8;">
              <li style="margin-bottom: 8px;">浏览和搜索数学题目</li>
              <li style="margin-bottom: 8px;">创建新的题目</li>
              <li style="margin-bottom: 8px;">查看统计数据</li>
              <li style="margin-bottom: 8px;">管理个人信息</li>
            </ul>
          `,
          en: `
            <p>Congratulations on successfully completing email verification! You can now start using all the features of the Mareate Question Bank System.</p>
            <div style="background: #d4edda; border: 1px solid #c3e6cb; color: #155724; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
              <strong>Verification Successful</strong><br>
              Your account has been activated and you can now use all features.
            </div>
            <h3 style="color: #333; margin-bottom: 15px;">You can:</h3>
            <ul style="color: #666; line-height: 1.8;">
              <li style="margin-bottom: 8px;">Browse and search math questions</li>
              <li style="margin-bottom: 8px;">Create new questions</li>
              <li style="margin-bottom: 8px;">View statistics</li>
              <li style="margin-bottom: 8px;">Manage personal information</li>
            </ul>
          `
        },
        buttonText: {
          zh: '开始使用系统',
          en: 'Start Using the System'
        },
        buttonUrl: `${process.env.FRONTEND_URL}`,
        footerText: {
          zh: '如有任何问题，请联系管理员：admin@viquard.com',
          en: 'If you have any questions, please contact the administrator: admin@viquard.com'
        },
        color: '#28a745',
        lang
      });

      const mailOptions = {
        from: `"Mareate题库系统" <${process.env.QQ_EMAIL_USER}>`,
        to: email,
        subject: lang === 'zh' ? 'Mareate题库系统 - 欢迎加入！' : 'Mareate Question Bank System - Welcome!',
        html: emailTemplate,
        attachments: [
          {
            filename: 'Mareate.png',
            path: path.join(__dirname, '../../public/Mareate.png'),
            cid: 'mareate-logo'
          }
        ]
      };

      const transporter = createTransporter();
      await transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('发送欢迎邮件失败:', error);
      return false;
    }
  },

  // 发送邀请邮件
  async sendInvitationEmail(data: InvitationEmailData): Promise<boolean> {
    try {
      const lang = data.lang || 'zh';
      const roleText = {
        'viewer': lang === 'zh' ? '查看者' : 'Viewer',
        'editor': lang === 'zh' ? '编辑者' : 'Editor', 
        'admin': lang === 'zh' ? '管理员' : 'Admin',
        'owner': lang === 'zh' ? '所有者' : 'Owner'
      }[data.role] || data.role;

      const rolePermissions = {
        'viewer': {
          zh: '<li>查看试卷库中的所有内容</li>',
          en: '<li>View all content in the paper library</li>'
        },
        'editor': {
          zh: '<li>编辑和创建试卷</li><li>查看试卷库中的所有内容</li>',
          en: '<li>Edit and create papers</li><li>View all content in the paper library</li>'
        },
        'admin': {
          zh: '<li>管理试卷库成员</li><li>编辑和创建试卷</li><li>查看试卷库中的所有内容</li>',
          en: '<li>Manage paper library members</li><li>Edit and create papers</li><li>View all content in the paper library</li>'
        },
        'owner': {
          zh: '<li>完全控制试卷库</li><li>管理试卷库成员</li><li>编辑和创建试卷</li><li>查看试卷库中的所有内容</li>',
          en: '<li>Full control of the paper library</li><li>Manage paper library members</li><li>Edit and create papers</li><li>View all content in the paper library</li>'
        }
      };

      const emailTemplate = createEmailTemplate({
        title: {
          zh: '试卷库邀请',
          en: 'Paper Library Invitation'
        },
        subtitle: {
          zh: '您收到了来自Mareate题库系统的合作邀请',
          en: 'You have received a collaboration invitation from the Mareate Question Bank System'
        },
        greeting: {
          zh: '您好！',
          en: 'Hello!'
        },
        content: {
          zh: `
            <p><strong>${data.inviterName}</strong> 邀请您加入试卷库 <strong>"${data.libraryName}"</strong>，并担任 <strong>${roleText}</strong> 角色。</p>
            
            <div style="background: #e3f2fd; border: 1px solid #bbdefb; color: #1565c0; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
              <h3 style="margin: 0 0 15px 0; color: #1565c0;">邀请详情</h3>
              <div style="margin-bottom: 10px;">
                <span style="font-weight: bold;">试卷库名称：</span>
                <span>${data.libraryName}</span>
              </div>
              <div style="margin-bottom: 10px;">
                <span style="font-weight: bold;">邀请角色：</span>
                <span style="color: #1976d2; font-weight: bold;">${roleText}</span>
              </div>
              <div>
                <span style="font-weight: bold;">邀请人：</span>
                <span>${data.inviterName}</span>
              </div>
            </div>
            
            <p>作为 <strong>${roleText}</strong>，您将拥有以下权限：</p>
            
            <ul style="color: #666; line-height: 1.8; margin-bottom: 25px; padding-left: 20px;">
              ${rolePermissions[data.role as keyof typeof rolePermissions]?.zh || ''}
            </ul>
          `,
          en: `
            <p><strong>${data.inviterName}</strong> invites you to join the paper library <strong>"${data.libraryName}"</strong> as a <strong>${roleText}</strong>.</p>
            
            <div style="background: #e3f2fd; border: 1px solid #bbdefb; color: #1565c0; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
              <h3 style="margin: 0 0 15px 0; color: #1565c0;">Invitation Details</h3>
              <div style="margin-bottom: 10px;">
                <span style="font-weight: bold;">Paper Library Name:</span>
                <span>${data.libraryName}</span>
              </div>
              <div style="margin-bottom: 10px;">
                <span style="font-weight: bold;">Invited Role:</span>
                <span style="color: #1976d2; font-weight: bold;">${roleText}</span>
              </div>
              <div>
                <span style="font-weight: bold;">Inviter:</span>
                <span>${data.inviterName}</span>
              </div>
            </div>
            
            <p>As a <strong>${roleText}</strong>, you will have the following permissions:</p>
            
            <ul style="color: #666; line-height: 1.8; margin-bottom: 25px; padding-left: 20px;">
              ${rolePermissions[data.role as keyof typeof rolePermissions]?.en || ''}
            </ul>
          `
        },
        buttonText: {
          zh: '接受邀请',
          en: 'Accept Invitation'
        },
        buttonUrl: data.acceptUrl,
        footerText: {
          zh: '此邮件由系统自动发送，请勿回复。<br>如有问题请联系管理员：admin@viquard.com',
          en: 'This email was sent automatically by the system. Please do not reply.<br>If you have any questions, please contact the administrator: admin@viquard.com'
        },
        color: '#0066cc',
        lang
      });

      const mailOptions = {
        from: `"Mareate题库系统" <${process.env.QQ_EMAIL_USER}>`,
        to: data.email,
        subject: lang === 'zh' 
          ? `Mareate题库系统 - 邀请加入试卷库：${data.libraryName}` 
          : `Mareate Question Bank System - Invitation to Paper Library: ${data.libraryName}`,
        html: emailTemplate,
        attachments: [
          {
            filename: 'Mareate.png',
            path: path.join(__dirname, '../../public/Mareate.png'),
            cid: 'mareate-logo'
          }
        ]
      };

      const transporter = createTransporter();
      await transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('发送邀请邮件失败:', error);
      return false;
    }
  },

  // 发送题库邀请邮件
  async sendQuestionBankInvitationEmail(data: QuestionBankInvitationEmailData): Promise<boolean> {
    try {
      const lang = data.lang || 'zh';
      const roleText = {
        'manager': lang === 'zh' ? '管理者' : 'Manager',
        'collaborator': lang === 'zh' ? '协作者' : 'Collaborator',
        'viewer': lang === 'zh' ? '查看者' : 'Viewer'
      }[data.role] || data.role;

      const rolePermissions = {
        'manager': {
          zh: '<li>管理题库成员</li><li>编辑和创建题目</li><li>查看题库中的所有内容</li>',
          en: '<li>Manage question bank members</li><li>Edit and create questions</li><li>View all content in the question bank</li>'
        },
        'collaborator': {
          zh: '<li>编辑和创建题目</li><li>查看题库中的所有内容</li>',
          en: '<li>Edit and create questions</li><li>View all content in the question bank</li>'
        },
        'viewer': {
          zh: '<li>查看题库中的所有内容</li>',
          en: '<li>View all content in the question bank</li>'
        }
      };

      const emailTemplate = createEmailTemplate({
        title: {
          zh: '题库邀请',
          en: 'Question Bank Invitation'
        },
        subtitle: {
          zh: '您收到了来自Mareate题库系统的合作邀请',
          en: 'You have received a collaboration invitation from the Mareate Question Bank System'
        },
        greeting: {
          zh: '您好！',
          en: 'Hello!'
        },
        content: {
          zh: `
            <p><strong>${data.inviterName}</strong> 邀请您加入题库 <strong>"${data.questionBankName}"</strong>，并担任 <strong>${roleText}</strong> 角色。</p>
            
            <div style="background: #e3f2fd; border: 1px solid #bbdefb; color: #1565c0; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
              <h3 style="margin: 0 0 15px 0; color: #1565c0;">邀请详情</h3>
              <div style="margin-bottom: 10px;">
                <span style="font-weight: bold;">题库名称：</span>
                <span>${data.questionBankName}</span>
              </div>
              <div style="margin-bottom: 10px;">
                <span style="font-weight: bold;">邀请角色：</span>
                <span style="color: #1976d2; font-weight: bold;">${roleText}</span>
              </div>
              <div>
                <span style="font-weight: bold;">邀请人：</span>
                <span>${data.inviterName}</span>
              </div>
            </div>
            
            <p>作为 <strong>${roleText}</strong>，您将拥有以下权限：</p>
            
            <ul style="color: #666; line-height: 1.8; margin-bottom: 25px; padding-left: 20px;">
              ${rolePermissions[data.role as keyof typeof rolePermissions]?.zh || ''}
            </ul>
          `,
          en: `
            <p><strong>${data.inviterName}</strong> invites you to join the question bank <strong>"${data.questionBankName}"</strong> as a <strong>${roleText}</strong>.</p>
            
            <div style="background: #e3f2fd; border: 1px solid #bbdefb; color: #1565c0; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
              <h3 style="margin: 0 0 15px 0; color: #1565c0;">Invitation Details</h3>
              <div style="margin-bottom: 10px;">
                <span style="font-weight: bold;">Question Bank Name:</span>
                <span>${data.questionBankName}</span>
              </div>
              <div style="margin-bottom: 10px;">
                <span style="font-weight: bold;">Invited Role:</span>
                <span style="color: #1976d2; font-weight: bold;">${roleText}</span>
              </div>
              <div>
                <span style="font-weight: bold;">Inviter:</span>
                <span>${data.inviterName}</span>
              </div>
            </div>
            
            <p>As a <strong>${roleText}</strong>, you will have the following permissions:</p>
            
            <ul style="color: #666; line-height: 1.8; margin-bottom: 25px; padding-left: 20px;">
              ${rolePermissions[data.role as keyof typeof rolePermissions]?.en || ''}
            </ul>
          `
        },
        buttonText: {
          zh: '接受邀请',
          en: 'Accept Invitation'
        },
        buttonUrl: data.acceptUrl,
        footerText: {
          zh: '此邮件由系统自动发送，请勿回复。<br>如有问题请联系管理员：admin@viquard.com',
          en: 'This email was sent automatically by the system. Please do not reply.<br>If you have any questions, please contact the administrator: admin@viquard.com'
        },
        color: '#0066cc',
        lang
      });

      const mailOptions = {
        from: `"Mareate题库系统" <${process.env.QQ_EMAIL_USER}>`,
        to: data.email,
        subject: lang === 'zh' 
          ? `Mareate题库系统 - 邀请加入题库：${data.questionBankName}` 
          : `Mareate Question Bank System - Invitation to Question Bank: ${data.questionBankName}`,
        html: emailTemplate,
        attachments: [
          {
            filename: 'Mareate.png',
            path: path.join(__dirname, '../../public/Mareate.png'),
            cid: 'mareate-logo'
          }
        ]
      };

      const transporter = createTransporter();
      await transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('发送题库邀请邮件失败:', error);
      return false;
    }
  },

  // 发送密码重置邮件
  async sendPasswordResetEmail(email: string, name: string, resetUrl: string, lang: 'zh' | 'en' = 'zh'): Promise<boolean> {
    try {
      const emailTemplate = createEmailTemplate({
        title: {
          zh: '重置密码',
          en: 'Reset Password'
        },
        subtitle: {
          zh: 'Mareate题库系统',
          en: 'Mareate Question Bank System'
        },
        greeting: {
          zh: `亲爱的 ${name}，`,
          en: `Dear ${name},`
        },
        content: {
          zh: `
            <p>我们收到了您重置密码的请求。请点击下面的按钮来重置您的密码：</p>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #ffc107; margin: 30px 0;">
              <p style="color: #856404; margin: 0; font-size: 14px; line-height: 1.5;">
                <strong>重要提醒：</strong><br>
                • 此重置链接将在 <strong>24小时</strong> 后失效<br>
                • 如果您没有请求重置密码，请忽略此邮件<br>
                • 为了您的账户安全，请不要与他人分享此链接
              </p>
            </div>
          `,
          en: `
            <p>We received a request to reset your password. Please click the button below to reset your password:</p>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #ffc107; margin: 30px 0;">
              <p style="color: #856404; margin: 0; font-size: 14px; line-height: 1.5;">
                <strong>Important Reminder:</strong><br>
                • This reset link will expire in <strong>24 hours</strong><br>
                • If you did not request a password reset, please ignore this email<br>
                • For your account security, please do not share this link with anyone
              </p>
            </div>
          `
        },
        buttonText: {
          zh: '重置密码',
          en: 'Reset Password'
        },
        buttonUrl: resetUrl,
        footerText: {
          zh: '此邮件由系统自动发送，请勿回复。<br>如有问题请联系管理员：admin@viquard.com',
          en: 'This email was sent automatically by the system. Please do not reply.<br>If you have any questions, please contact the administrator: admin@viquard.com'
        },
        color: '#0066cc',
        lang
      });

      const mailOptions = {
        from: `"Mareate题库系统" <${process.env.QQ_EMAIL_USER}>`,
        to: email,
        subject: lang === 'zh' ? '重置您的密码 - Mareate题库系统' : 'Reset Your Password - Mareate Question Bank System',
        html: emailTemplate,
        attachments: [
          {
            filename: 'Mareate.png',
            path: path.join(__dirname, '../../public/Mareate.png'),
            cid: 'mareate-logo'
          }
        ]
      };

      const transporter = createTransporter();
      await transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('发送密码重置邮件失败:', error);
      return false;
    }
  },

  // 发送成员添加通知邮件
  async sendMemberAddedEmail(data: {
    email: string;
    name: string;
    role: string;
    questionBankName: string;
    inviterName: string;
    questionBankUrl: string;
    lang?: 'zh' | 'en';
  }): Promise<boolean> {
    try {
      const lang = data.lang || 'zh';
      const roleText = data.role === 'manager' 
        ? (lang === 'zh' ? '管理者' : 'Manager') 
        : (data.role === 'collaborator' 
          ? (lang === 'zh' ? '协作者' : 'Collaborator')
          : (lang === 'zh' ? '查看者' : 'Viewer'));
      
      const emailTemplate = createEmailTemplate({
        title: {
          zh: '欢迎加入题库',
          en: 'Welcome to Question Bank'
        },
        subtitle: {
          zh: 'Mareate题库系统',
          en: 'Mareate Question Bank System'
        },
        greeting: {
          zh: `亲爱的 ${data.name}，`,
          en: `Dear ${data.name},`
        },
        content: {
          zh: `
            <p>恭喜！您已被 <strong>${data.inviterName}</strong> 添加到题库 <strong>"${data.questionBankName}"</strong>，您的角色是 <strong>${roleText}</strong>。</p>
            
            <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; border-left: 4px solid #10b981; margin: 30px 0;">
              <p style="color: #166534; margin: 0; font-size: 14px; line-height: 1.5;">
                <strong>您现在可以：</strong><br>
                ${data.role === 'manager' 
                  ? '• 查看和编辑题库中的所有题目<br>• 管理题库设置和成员<br>• 导入和导出题目<br>• 生成试卷和统计分析' 
                  : data.role === 'collaborator'
                  ? '• 查看题库中的所有题目<br>• 添加和编辑题目<br>• 参与题目讨论和协作<br>• 使用题目搜索和筛选功能'
                  : '• 查看题库中的所有题目<br>• 使用题目搜索和筛选功能<br>• 查看题目详细信息'
                }
              </p>
            </div>
          `,
          en: `
            <p>Congratulations! You have been added to the question bank <strong>"${data.questionBankName}"</strong> by <strong>${data.inviterName}</strong> as a <strong>${roleText}</strong>.</p>
            
            <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; border-left: 4px solid #10b981; margin: 30px 0;">
              <p style="color: #166534; margin: 0; font-size: 14px; line-height: 1.5;">
                <strong>You can now:</strong><br>
                ${data.role === 'manager' 
                  ? '• View and edit all questions in the question bank<br>• Manage question bank settings and members<br>• Import and export questions<br>• Generate papers and statistical analysis' 
                  : data.role === 'collaborator'
                  ? '• View all questions in the question bank<br>• Add and edit questions<br>• Participate in question discussions and collaboration<br>• Use question search and filtering features'
                  : '• View all questions in the question bank<br>• Use question search and filtering features<br>• View detailed question information'
                }
              </p>
            </div>
          `
        },
        buttonText: {
          zh: '立即访问题库',
          en: 'Access Question Bank Now'
        },
        buttonUrl: data.questionBankUrl,
        footerText: {
          zh: '此邮件由系统自动发送，请勿回复。<br>如有问题请联系管理员：admin@viquard.com',
          en: 'This email was sent automatically by the system. Please do not reply.<br>If you have any questions, please contact the administrator: admin@viquard.com'
        },
        color: '#10b981',
        lang
      });

      const mailOptions = {
        from: `"Mareate题库系统" <${process.env.QQ_EMAIL_USER}>`,
        to: data.email,
        subject: lang === 'zh' 
          ? `您已被添加到题库"${data.questionBankName}" - Mareate题库系统` 
          : `You have been added to question bank "${data.questionBankName}" - Mareate Question Bank System`,
        html: emailTemplate,
        attachments: [
          {
            filename: 'Mareate.png',
            path: path.join(__dirname, '../../public/Mareate.png'),
            cid: 'mareate-logo'
          }
        ]
      };

      const transporter = createTransporter();
      await transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('发送成员添加邮件失败:', error);
      return false;
    }
  },

  // 发送成员移除通知邮件
  async sendMemberRemovedEmail(data: {
    email: string;
    name: string;
    questionBankName: string;
    removerName: string;
    lang?: 'zh' | 'en';
  }): Promise<boolean> {
    try {
      const lang = data.lang || 'zh';
      
      const emailTemplate = createEmailTemplate({
        title: {
          zh: '题库访问变更',
          en: 'Question Bank Access Change'
        },
        subtitle: {
          zh: 'Mareate题库系统',
          en: 'Mareate Question Bank System'
        },
        greeting: {
          zh: `亲爱的 ${data.name}，`,
          en: `Dear ${data.name},`
        },
        content: {
          zh: `
            <p>我们通知您，您已被 <strong>${data.removerName}</strong> 从题库 <strong>"${data.questionBankName}"</strong> 中移除。</p>
            
            <div style="background: #fef3cd; padding: 20px; border-radius: 8px; border-left: 4px solid #f97316; margin: 30px 0;">
              <p style="color: #92400e; margin: 0; font-size: 14px; line-height: 1.5;">
                <strong>重要提醒：</strong><br>
                • 您将无法再访问该题库的内容<br>
                • 您之前的贡献和数据将被保留<br>
                • 如有疑问，请联系题库管理员<br>
                • 如需重新加入，请联系题库创建者
              </p>
            </div>
            
            <p>感谢您之前对题库的贡献，祝您工作顺利！</p>
          `,
          en: `
            <p>We are notifying you that you have been removed from the question bank <strong>"${data.questionBankName}"</strong> by <strong>${data.removerName}</strong>.</p>
            
            <div style="background: #fef3cd; padding: 20px; border-radius: 8px; border-left: 4px solid #f97316; margin: 30px 0;">
              <p style="color: #92400e; margin: 0; font-size: 14px; line-height: 1.5;">
                <strong>Important Notice:</strong><br>
                • You will no longer be able to access the contents of this question bank<br>
                • Your previous contributions and data will be preserved<br>
                • If you have any questions, please contact the question bank administrator<br>
                • To rejoin, please contact the question bank creator
              </p>
            </div>
            
            <p>Thank you for your previous contributions to the question bank. We wish you all the best!</p>
          `
        },
        buttonText: {
          zh: '返回主页',
          en: 'Return to Homepage'
        },
        buttonUrl: `${process.env.FRONTEND_URL}`,
        footerText: {
          zh: '此邮件由系统自动发送，请勿回复。<br>如有问题请联系管理员：admin@viquard.com',
          en: 'This email was sent automatically by the system. Please do not reply.<br>If you have any questions, please contact the administrator: admin@viquard.com'
        },
        color: '#f97316',
        lang
      });

      const mailOptions = {
        from: `"Mareate题库系统" <${process.env.QQ_EMAIL_USER}>`,
        to: data.email,
        subject: lang === 'zh' 
          ? `您已被移出题库"${data.questionBankName}" - Mareate题库系统` 
          : `You have been removed from question bank "${data.questionBankName}" - Mareate Question Bank System`,
        html: emailTemplate,
        attachments: [
          {
            filename: 'Mareate.png',
            path: path.join(__dirname, '../../public/Mareate.png'),
            cid: 'mareate-logo'
          }
        ]
      };

      const transporter = createTransporter();
      await transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('发送成员移除邮件失败:', error);
      return false;
    }
  }
};