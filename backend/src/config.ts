import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 5000,
  mongoURI: process.env.MONGO_URI || 'mongodb://localhost:27017/mareate',
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
  
  // 前端URL配置
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  
  // 腾讯云配置
  tencentCloud: {
    secretId: process.env.TENCENT_CLOUD_SECRET_ID || 'error',
    secretKey: process.env.TENCENT_CLOUD_SECRET_KEY || 'error',
    region: 'ap-beijing',
  },
  
  // DeepSeek API配置
  deepSeek: {
    apiKey: process.env.DEEPSEEK_API_KEY || '',
    baseURL: 'https://api.deepseek.com/v1',
  },
  
  // 邮件配置
  email: {
    host: process.env.EMAIL_HOST || 'smtp.qq.com',
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: process.env.EMAIL_SECURE === 'true',
    user: process.env.EMAIL_USER || '',
    pass: process.env.EMAIL_PASS || '',
  },
  
  // 文件上传配置
  upload: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'application/msword'],
    uploadDir: 'uploads/',
  },
}; 