import nodemailer from 'nodemailer';
import crypto from 'crypto';
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

export interface EmailVerificationData {
  email: string;
  name: string;
  token: string;
}

export interface InvitationEmailData {
  email: string;
  role: string;
  libraryName: string;
  inviterName: string;
  acceptUrl: string;
}

export interface QuestionBankInvitationEmailData {
  email: string;
  role: string;
  questionBankName: string;
  inviterName: string;
  acceptUrl: string;
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
      
      const mailOptions = {
        from: `"Mareate题库系统" <${process.env.QQ_EMAIL_USER}>`,
        to: data.email,
        subject: 'Mareate题库系统 - 邮箱验证',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="margin: 0; font-size: 24px;">Mareate题库系统</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">企业内部数学题库管理平台</p>
            </div>
            
            <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
              <h2 style="color: #333; margin-bottom: 20px;">您好，${data.name}！</h2>
              
              <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
                感谢您注册Mareate题库系统.为了确保您的账户安全，请点击下面的按钮验证您的邮箱地址：
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${verificationUrl}" 
                   style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                          color: white; 
                          padding: 15px 30px; 
                          text-decoration: none; 
                          border-radius: 25px; 
                          display: inline-block; 
                          font-weight: bold;
                          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);">
                  验证邮箱地址
                </a>
              </div>
              
              <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
                如果按钮无法点击，请复制以下链接到浏览器地址栏：
              </p>
              
              <div style="background: #e9ecef; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
                <a href="${verificationUrl}" style="color: #667eea; word-break: break-all;">
                  ${verificationUrl}
                </a>
              </div>
              
              <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
                <strong>注意：</strong>此验证链接将在24小时后失效.如果您没有注册Mareate题库系统，请忽略此邮件.
              </p>
              
              <hr style="border: none; border-top: 1px solid #dee2e6; margin: 30px 0;">
              
              <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">
                此邮件由系统自动发送，请勿回复.<br>
                如有问题请联系管理员：admin@viquard.com
              </p>
            </div>
          </div>
        `
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
  async sendWelcomeEmail(email: string, name: string): Promise<boolean> {
    try {
      const mailOptions = {
        from: `"Mareate题库系统" <${process.env.QQ_EMAIL_USER}>`,
        to: email,
        subject: 'Mareate题库系统 - 欢迎加入！',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="margin: 0; font-size: 24px;">欢迎加入Mareate题库系统！</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">您的邮箱验证已成功</p>
            </div>
            
            <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
              <h2 style="color: #333; margin-bottom: 20px;">您好，${name}！</h2>
              
              <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
                恭喜您成功完成邮箱验证！现在您可以开始使用Mareate题库系统的所有功能了.
              </p>
              
              <div style="background: #d4edda; border: 1px solid #c3e6cb; color: #155724; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
                <strong>验证成功</strong><br>
                您的账户已激活，可以正常使用所有功能.
              </div>
              
              <h3 style="color: #333; margin-bottom: 15px;">您可以：</h3>
              <ul style="color: #666; line-height: 1.8;">
                <li style="margin-bottom: 8px;"><span style="color: #28a745; font-weight: bold;">●</span> 浏览和搜索数学题目</li>
                <li style="margin-bottom: 8px;"><span style="color: #28a745; font-weight: bold;">●</span> 创建新的题目</li>
                <li style="margin-bottom: 8px;"><span style="color: #28a745; font-weight: bold;">●</span> 查看统计数据</li>
                <li style="margin-bottom: 8px;"><span style="color: #28a745; font-weight: bold;">●</span> 管理个人信息</li>
              </ul>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.FRONTEND_URL}" 
                   style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); 
                          color: white; 
                          padding: 15px 30px; 
                          text-decoration: none; 
                          border-radius: 25px; 
                          display: inline-block; 
                          font-weight: bold;
                          box-shadow: 0 4px 15px rgba(40, 167, 69, 0.4);">
                  开始使用系统
                </a>
              </div>
              
              <hr style="border: none; border-top: 1px solid #dee2e6; margin: 30px 0;">
              
              <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">
                如有任何问题，请联系管理员：admin@viquard.com
              </p>
            </div>
          </div>
        `
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
      const roleText = {
        'viewer': '查看者',
        'editor': '编辑者', 
        'admin': '管理员',
        'owner': '所有者'
      }[data.role] || data.role;

      const mailOptions = {
        from: `"Mareate题库系统" <${process.env.QQ_EMAIL_USER}>`,
        to: data.email,
        subject: `Mareate题库系统 - 邀请加入试卷库：${data.libraryName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="margin: 0; font-size: 24px;">试卷库邀请</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">您收到了来自Mareate题库系统的合作邀请</p>
            </div>
            
            <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
              <h2 style="color: #333; margin-bottom: 20px;">您好！</h2>
              
              <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
                <strong>${data.inviterName}</strong> 邀请您加入试卷库 <strong>"${data.libraryName}"</strong>，并担任 <strong>${roleText}</strong> 角色。
              </p>
              
              <div style="background: #e3f2fd; border: 1px solid #bbdefb; color: #1565c0; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
                <h3 style="margin: 0 0 15px 0; color: #1565c0;">邀请详情</h3>
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                  <span style="font-weight: bold;">试卷库名称：</span>
                  <span>${data.libraryName}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                  <span style="font-weight: bold;">邀请角色：</span>
                  <span style="color: #1976d2; font-weight: bold;">${roleText}</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span style="font-weight: bold;">邀请人：</span>
                  <span>${data.inviterName}</span>
                </div>
              </div>
              
              <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
                作为 <strong>${roleText}</strong>，您将拥有以下权限：
              </p>
              
              <ul style="color: #666; line-height: 1.8; margin-bottom: 25px; padding-left: 20px;">
                ${data.role === 'viewer' ? '<li style="margin-bottom: 8px;"><span style="color: #1565c0; font-weight: bold;">●</span> 查看试卷库中的所有内容</li>' : ''}
                ${data.role === 'editor' ? '<li style="margin-bottom: 8px;"><span style="color: #1565c0; font-weight: bold;">●</span> 编辑和创建试卷</li><li style="margin-bottom: 8px;"><span style="color: #1565c0; font-weight: bold;">●</span> 查看试卷库中的所有内容</li>' : ''}
                ${data.role === 'admin' ? '<li style="margin-bottom: 8px;"><span style="color: #1565c0; font-weight: bold;">●</span> 管理试卷库成员</li><li style="margin-bottom: 8px;"><span style="color: #1565c0; font-weight: bold;">●</span> 编辑和创建试卷</li><li style="margin-bottom: 8px;"><span style="color: #1565c0; font-weight: bold;">●</span> 查看试卷库中的所有内容</li>' : ''}
                ${data.role === 'owner' ? '<li style="margin-bottom: 8px;"><span style="color: #1565c0; font-weight: bold;">●</span> 完全控制试卷库</li><li style="margin-bottom: 8px;"><span style="color: #1565c0; font-weight: bold;">●</span> 管理试卷库成员</li><li style="margin-bottom: 8px;"><span style="color: #1565c0; font-weight: bold;">●</span> 编辑和创建试卷</li><li style="margin-bottom: 8px;"><span style="color: #1565c0; font-weight: bold;">●</span> 查看试卷库中的所有内容</li>' : ''}
              </ul>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${data.acceptUrl}" 
                   style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                          color: white; 
                          padding: 15px 30px; 
                          text-decoration: none; 
                          border-radius: 25px; 
                          display: inline-block; 
                          font-weight: bold;
                          font-size: 16px;
                          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);">
                  接受邀请
                </a>
              </div>
              
              <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
                如果按钮无法点击，请复制以下链接到浏览器地址栏：
              </p>
              
              <div style="background: #e9ecef; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
                <a href="${data.acceptUrl}" style="color: #667eea; word-break: break-all;">
                  ${data.acceptUrl}
                </a>
              </div>
              
              <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
                <strong>注意：</strong>此邀请链接长期有效。如果您不想接受邀请，请忽略此邮件。
              </p>
              
              <hr style="border: none; border-top: 1px solid #dee2e6; margin: 30px 0;">
              
              <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">
                此邮件由系统自动发送，请勿回复。<br>
                如有问题请联系管理员：admin@viquard.com
              </p>
            </div>
          </div>
        `
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
      const roleText = {
        'manager': '管理者',
        'collaborator': '协作者'
      }[data.role] || data.role;

      const mailOptions = {
        from: `"Mareate题库系统" <${process.env.QQ_EMAIL_USER}>`,
        to: data.email,
        subject: `Mareate题库系统 - 邀请加入题库：${data.questionBankName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="margin: 0; font-size: 24px;">题库邀请</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">您收到了来自Mareate题库系统的合作邀请</p>
            </div>
            
            <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
              <h2 style="color: #333; margin-bottom: 20px;">您好！</h2>
              
              <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
                <strong>${data.inviterName}</strong> 邀请您加入题库 <strong>"${data.questionBankName}"</strong>，并担任 <strong>${roleText}</strong> 角色。
              </p>
              
              <div style="background: #e3f2fd; border: 1px solid #bbdefb; color: #1565c0; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
                <h3 style="margin: 0 0 15px 0; color: #1565c0;">邀请详情</h3>
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                  <span style="font-weight: bold;">题库名称：</span>
                  <span>${data.questionBankName}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                  <span style="font-weight: bold;">邀请角色：</span>
                  <span style="color: #1976d2; font-weight: bold;">${roleText}</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span style="font-weight: bold;">邀请人：</span>
                  <span>${data.inviterName}</span>
                </div>
              </div>
              
              <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
                作为 <strong>${roleText}</strong>，您将拥有以下权限：
              </p>
              
              <ul style="color: #666; line-height: 1.8; margin-bottom: 25px; padding-left: 20px;">
                ${data.role === 'manager' ? '<li style="margin-bottom: 8px;"><span style="color: #1565c0; font-weight: bold;">●</span> 管理题库成员</li><li style="margin-bottom: 8px;"><span style="color: #1565c0; font-weight: bold;">●</span> 编辑和创建题目</li><li style="margin-bottom: 8px;"><span style="color: #1565c0; font-weight: bold;">●</span> 查看题库中的所有内容</li>' : ''}
                ${data.role === 'collaborator' ? '<li style="margin-bottom: 8px;"><span style="color: #1565c0; font-weight: bold;">●</span> 编辑和创建题目</li><li style="margin-bottom: 8px;"><span style="color: #1565c0; font-weight: bold;">●</span> 查看题库中的所有内容</li>' : ''}
              </ul>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${data.acceptUrl}" 
                   style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                          color: white; 
                          padding: 15px 30px; 
                          text-decoration: none; 
                          border-radius: 25px; 
                          display: inline-block; 
                          font-weight: bold;
                          font-size: 16px;
                          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);">
                  接受邀请
                </a>
              </div>
              
              <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
                如果按钮无法点击，请复制以下链接到浏览器地址栏：
              </p>
              
              <div style="background: #e9ecef; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
                <a href="${data.acceptUrl}" style="color: #667eea; word-break: break-all;">
                  ${data.acceptUrl}
                </a>
              </div>
              
              <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
                <strong>注意：</strong>此邀请链接长期有效。如果您不想接受邀请，请忽略此邮件。
              </p>
              
              <hr style="border: none; border-top: 1px solid #dee2e6; margin: 30px 0;">
              
              <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">
                此邮件由系统自动发送，请勿回复。<br>
                如有问题请联系管理员：admin@viquard.com
              </p>
            </div>
          </div>
        `
      };

      const transporter = createTransporter();
      await transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('发送题库邀请邮件失败:', error);
      return false;
    }
  }
}; 