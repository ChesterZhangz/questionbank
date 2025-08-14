import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import rateLimit from 'express-rate-limit';
import fs from 'fs';
import path from 'path';

// 路由导入
import authRoutes from './routes/auth';
import questionRoutes from './routes/questions';
import userRoutes from './routes/users';
import questionBankRoutes from './routes/questionBanks';
import ocrRoutes from './routes/ocr';
import mathpixRoutes from './routes/mathpix';
import optimizedMathpixRoutes from './routes/optimizedMathpix';
import questionAnalysisRoutes from './routes/questionAnalysis';
import documentParserRoutes from './routes/document-parser';
import dashboardRoutes from './routes/dashboard';
import searchRoutes from './routes/search';

import similarityRoutes from './routes/similarity';
import gameRoutes from './routes/games';
import paperRoutes from './routes/papers';
import libraryRoutes from './routes/libraries';
import libraryPurchaseRoutes from './routes/libraryPurchases';

// 企业相关路由
import enterpriseRoutes from './routes/enterprises';
import myEnterpriseRoutes from './routes/myEnterprise';

// 中间件导入
import { errorHandler } from './middleware/errorHandler';
import { authMiddleware } from './middleware/auth';

// 加载环境变量
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// 安全中间件 - 禁用所有安全头
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: false,
  crossOriginOpenerPolicy: false,
  originAgentCluster: false,
  hsts: false, // 禁用 Strict-Transport-Security
  referrerPolicy: false,
  frameguard: false,
  dnsPrefetchControl: false,
  ieNoOpen: false,
  noSniff: false,
  xssFilter: false,
  permittedCrossDomainPolicies: false,
  hidePoweredBy: false
}));
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    'http://www.mareate.com',
    'https://www.mareate.com',
    'http://43.160.253.32',
    'https://43.160.253.32'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// 限流中间件 - 开发环境禁用
if (process.env.NODE_ENV === 'production') {
  const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15分钟
    max: 1000, // 限制每个IP 15分钟内最多1000个请求
    message: '请求过于频繁，请稍后再试'
  });

  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15分钟
    max: 50, // 限制每个IP 15分钟内最多50个认证请求
    message: '登录尝试过于频繁，请稍后再试'
  });

  // 应用限流
  app.use('/api/auth', authLimiter);
  app.use('/api/', generalLimiter);
} else {
  console.log('🔓 开发环境：限流已禁用');
}

// 日志中间件
app.use(morgan('combined'));

// 解析JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// 静态文件服务
app.use('/uploads', express.static('uploads'));
app.use('/api/avatars', express.static('public/avatars', {
  setHeaders: (res, path) => {
    res.set('Cache-Control', 'public, max-age=31536000');
  }
}));
app.use('/temp/images', express.static('temp/images', {
  setHeaders: (res, path) => {
    const origin = res.req.headers.origin;
    const allowedOrigins = [
      process.env.FRONTEND_URL || 'http://localhost:5173',
      'http://www.mareate.com',
      'https://www.mareate.com',
      'http://43.160.253.32',
      'https://43.160.253.32'
    ];
    
    if (origin && allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  }
}));

// 前端静态文件服务 - 仅在生产环境提供
if (process.env.NODE_ENV === 'production') {
  app.use('/frontend/dist', express.static(path.join(process.cwd(), '..', 'frontend/dist')));

  // SPA 路由处理 - 对于前端路由，返回 index.html
  const spaRoutes = [
    '/login', '/dashboard', '/question-banks', '/questions', 
    '/settings', '/users', '/paper-generation', 
    '/question-management', '/', '/index.html'
  ];

  spaRoutes.forEach(route => {
    app.get(route, (req, res) => {
      res.sendFile(path.join(process.cwd(), '..', 'frontend/dist/index.html'));
    });
  });

  // 静态文件服务 - 放在最后，作为后备
  app.use(express.static(path.join(process.cwd(), '..', 'frontend/dist'), {
    index: 'index.html',
    fallthrough: true
  }));
} else {
  console.log('🔧 开发环境：前端由 Vite 开发服务器提供');
}

// 健康检查
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV 
  });
});

// 图片代理路由 - 解决CORS问题
app.get('/api/images/:imageId', (req, res) => {
  const imageId = req.params.imageId;
  const imagePath = path.join(process.cwd(), 'temp', 'images', imageId);
  
  if (fs.existsSync(imagePath)) {
    const origin = req.headers.origin;
    const allowedOrigins = [
      process.env.FRONTEND_URL || 'http://localhost:5173',
      'http://www.mareate.com',
      'https://www.mareate.com',
      'http://43.160.253.32',
      'https://43.160.253.32'
    ];
    
    if (origin && allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    }
    
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.sendFile(imagePath);
  } else {
    res.status(404).json({ error: '图片不存在' });
  }
});

// API路由
app.use('/api/auth', authRoutes);
app.use('/api/question-banks', questionBankRoutes); // 题库路由
app.use('/api/questions', authMiddleware, questionRoutes); // 题目路由独立注册
app.use('/api/users', authMiddleware, userRoutes);
app.use('/api/ocr', ocrRoutes); // OCR路由 - 暂时移除认证进行测试
app.use('/api/mathpix', mathpixRoutes); // Mathpix API路由
app.use('/api/mathpix-optimized', optimizedMathpixRoutes); // 优化版Mathpix API路由
app.use('/api/question-analysis', authMiddleware, questionAnalysisRoutes); // 题目分析路由
app.use('/api/document-parser', documentParserRoutes); // 文档解析路由

app.use('/api/similarity', authMiddleware, similarityRoutes); // 相似度检测路由
app.use('/api/dashboard', authMiddleware, dashboardRoutes); // 仪表板路由
app.use('/api/search', searchRoutes); // 搜索路由
app.use('/api/games', gameRoutes); // 游戏路由
app.use('/api/papers', authMiddleware, paperRoutes); // 组卷路由
app.use('/api/libraries', authMiddleware, libraryRoutes); // 试题库路由
app.use('/api/library-purchases', authMiddleware, libraryPurchaseRoutes); // 试卷库购买路由

// 企业相关路由
app.use('/api/enterprises', authMiddleware, enterpriseRoutes); // 企业管理路由（仅superadmin）
app.use('/api/my-enterprise', authMiddleware, myEnterpriseRoutes); // 我的企业路由

// 404处理
app.use('*', (req, res) => {
  // 如果是API请求，返回JSON错误
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: '接口不存在' });
  }
  
  // 如果是前端路由，返回index.html让前端处理
  if (process.env.NODE_ENV === 'production') {
    return res.sendFile(path.join(process.cwd(), '..', 'frontend/dist/index.html'));
  }
  
  // 开发环境返回404
  res.status(404).json({ error: '页面不存在' });
});

// 错误处理中间件
app.use(errorHandler);

// 数据库连接
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    if (!mongoURI) {
      throw new Error('MongoDB URI未配置');
    }
    
    await mongoose.connect(mongoURI);
    console.log('✅ MongoDB连接成功');
  } catch (error) {
    console.error('❌ MongoDB连接失败:', error);
    process.exit(1);
  }
};

// 启动服务器
const startServer = async () => {
  await connectDB();
  
  app.listen(PORT, () => {
    const serverURL = process.env.NODE_ENV === 'production' 
      ? `http://${process.env.FRONTEND_URL?.replace(/^https?:\/\//, '') || '43.160.253.32'}`
      : `http://localhost:${PORT}`;
    
    console.log(`🚀 服务器运行在 ${serverURL}`);
    console.log(`📊 健康检查: ${serverURL}/health`);
  });
};

// 优雅关闭
process.on('SIGTERM', () => {
  console.log('收到SIGTERM信号，正在关闭服务器...');
  mongoose.connection.close();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('收到SIGINT信号，正在关闭服务器...');
  mongoose.connection.close();
  process.exit(0);
});

startServer().catch(console.error); 