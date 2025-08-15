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
import { config } from './config';

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
    config.frontendUrl,
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

// 添加请求路径日志
app.use((req, res, next) => {
  if (req.path.startsWith('/assets/') || req.path.startsWith('/auth/')) {
    console.log(`📁 请求路径: ${req.method} ${req.path}`);
  }
  next();
});

// 修复代理信任设置 - 解决X-Forwarded-For警告
app.set('trust proxy', true);

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
      config.frontendUrl,
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

// 前端静态资源服务 - 生产环境
if (process.env.NODE_ENV === 'production') {
  console.log('🚀 生产环境：配置前端静态资源服务');
  
  // 静态资源服务 - 必须放在API路由之前
  app.use(express.static(path.join(process.cwd(), '..', 'frontend/dist'), {
    setHeaders: (res, filePath) => {
      // 设置正确的MIME类型
      if (filePath.endsWith('.js')) {
        res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
      } else if (filePath.endsWith('.css')) {
        res.setHeader('Content-Type', 'text/css; charset=utf-8');
      } else if (filePath.endsWith('.woff')) {
        res.setHeader('Content-Type', 'font/woff');
      } else if (filePath.endsWith('.woff2')) {
        res.setHeader('Content-Type', 'font/woff2');
      } else if (filePath.endsWith('.ttf')) {
        res.setHeader('Content-Type', 'font/ttf');
      } else if (filePath.endsWith('.png')) {
        res.setHeader('Content-Type', 'image/png');
      } else if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) {
        res.setHeader('Content-Type', 'image/jpeg');
      } else if (filePath.endsWith('.gif')) {
        res.setHeader('Content-Type', 'image/gif');
      } else if (filePath.endsWith('.svg')) {
        res.setHeader('Content-Type', 'image/svg+xml');
      }
      
      // 设置缓存头
      if (filePath.endsWith('.js') || filePath.endsWith('.css')) {
        res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1年缓存
      }
    }
  }));

  // 修复SPA路由的静态资源问题 - 统一处理所有 /path/assets/ 路径
  app.use('/:path/assets/:filename', (req, res, next) => {
    const { path: routePath, filename } = req.params;
    
    // 记录请求日志
    console.log(`📁 SPA静态资源请求: ${req.method} ${req.path} -> 重定向到 /assets/${filename}`);
    
    // 直接重定向到根assets目录
    const assetPath = path.join(process.cwd(), '..', 'frontend/dist/assets', filename);
    
    if (fs.existsSync(assetPath)) {
      // 设置正确的MIME类型
      if (filename.endsWith('.js')) {
        res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
      } else if (filename.endsWith('.css')) {
        res.setHeader('Content-Type', 'text/css; charset=utf-8');
      } else if (filename.endsWith('.woff')) {
        res.setHeader('Content-Type', 'font/woff');
      } else if (filename.endsWith('.woff2')) {
        res.setHeader('Content-Type', 'font/woff2');
      } else if (filename.endsWith('.ttf')) {
        res.setHeader('Content-Type', 'font/ttf');
      } else if (filename.endsWith('.png')) {
        res.setHeader('Content-Type', 'image/png');
      } else if (filename.endsWith('.jpg') || filename.endsWith('.jpeg')) {
        res.setHeader('Content-Type', 'image/jpeg');
      } else if (filename.endsWith('.gif')) {
        res.setHeader('Content-Type', 'image/gif');
      } else if (filename.endsWith('.svg')) {
        res.setHeader('Content-Type', 'image/svg+xml');
      }
      
      // 设置缓存头
      if (filename.endsWith('.js') || filename.endsWith('.css')) {
        res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1年缓存
      }
      
      res.sendFile(assetPath);
    } else {
      console.log(`❌ 静态资源不存在: ${assetPath}`);
      next();
    }
  });

  // 专门处理SPA路由 - 确保 /auth/* 等路径能正确访问
  app.use(['/auth', '/login', '/register', '/dashboard', '/question-banks', '/questions', '/settings', '/users', '/paper-generation', '/question-management'], (req, res, next) => {
    console.log(`🔄 SPA路由处理: ${req.path}`);
    
    // 如果是静态资源请求，跳过
    if (req.path.includes('/assets/')) {
      return next();
    }
    
    // 对于SPA路由，返回index.html
    const indexPath = path.join(process.cwd(), '..', 'frontend/dist/index.html');
    if (fs.existsSync(indexPath)) {
      console.log(`📄 返回SPA index.html: ${req.path}`);
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.sendFile(indexPath);
    }
    
    next();
  });
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

// 健康检查端点
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// 调试端点 - 检查静态资源路径
app.get('/debug/static', (req, res) => {
  const staticPath = path.join(process.cwd(), '..', 'frontend/dist');
  const indexPath = path.join(staticPath, 'index.html');
  const jsPath = path.join(staticPath, 'assets');
  
  res.json({
    staticPath,
    indexPath: fs.existsSync(indexPath),
    jsPath: fs.existsSync(jsPath),
    jsFiles: fs.existsSync(jsPath) ? fs.readdirSync(jsPath).filter(f => f.endsWith('.js')).slice(0, 5) : [],
    cssFiles: fs.existsSync(jsPath) ? fs.readdirSync(jsPath).filter(f => f.endsWith('.css')).slice(0, 5) : [],
    cwd: process.cwd(),
    env: process.env.NODE_ENV
  });
});

// 调试端点 - 测试SPA路由的静态资源访问
app.get('/debug/spa-assets/:filename', (req, res) => {
  const { filename } = req.params;
  const assetPath = path.join(process.cwd(), '..', 'frontend/dist/assets', filename);
  
  res.json({
    requestedFile: filename,
    assetPath,
    exists: fs.existsSync(assetPath),
    fileSize: fs.existsSync(assetPath) ? fs.statSync(assetPath).size : 0,
    cwd: process.cwd(),
    env: process.env.NODE_ENV
  });
});

// 404处理 - 前端路由回退
app.use('*', (req, res) => {
  // 如果是API请求，返回JSON错误
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: '接口不存在' });
  }
  
  // 生产环境：所有非API请求都返回前端index.html
  if (process.env.NODE_ENV === 'production') {
    const indexPath = path.join(process.cwd(), '..', 'frontend/dist/index.html');
    if (fs.existsSync(indexPath)) {
      console.log(`🔄 SPA路由回退: ${req.path} -> index.html (${indexPath})`);
      
      // 设置正确的Content-Type
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.sendFile(indexPath);
    } else {
      console.log(`❌ 前端文件不存在: ${indexPath}`);
      return res.status(404).json({ 
        error: '前端文件不存在，请先构建前端项目',
        path: indexPath,
        cwd: process.cwd()
      });
    }
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
  // 验证配置
  config.validateConfig();
  
  await connectDB();
  
  app.listen(PORT, () => {
    const serverURL = process.env.NODE_ENV === 'production' 
      ? `http://${config.frontendUrl.replace(/^https?:\/\//, '')}`
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