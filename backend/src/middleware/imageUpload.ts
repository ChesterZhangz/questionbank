import multer from 'multer';
import { Request, Response, NextFunction } from 'express';

// 配置multer用于内存存储
const storage = multer.memoryStorage();

// 文件过滤器
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // 检查文件类型
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
  
  console.log('文件上传检查:', {
    filename: file.originalname,
    mimetype: file.mimetype,
    size: file.size,
    buffer: file.buffer ? `Buffer(${file.buffer.length} bytes)` : 'undefined'
  });
  
  if (allowedTypes.includes(file.mimetype)) {
    console.log('✅ 文件类型验证通过');
    cb(null, true);
  } else {
    console.log('❌ 文件类型被拒绝:', file.mimetype);
    cb(null, false);
  }
};

// 创建multer实例
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB限制
    files: 5 // 最多5个文件
  }
});

// 单个图片上传中间件
export const uploadSingleImage = upload.single('image');

// 多个图片上传中间件
export const uploadMultipleImages = upload.array('images', 5);

// 错误处理中间件
export const handleUploadError = (error: any, req: Request, res: Response, next: NextFunction) => {
  if (error instanceof multer.MulterError) {
    switch (error.code) {
      case 'LIMIT_FILE_SIZE':
        return res.status(400).json({
          success: false,
          error: '文件大小超过限制（最大5MB）'
        });
      case 'LIMIT_FILE_COUNT':
        return res.status(400).json({
          success: false,
          error: '文件数量超过限制（最多5个）'
        });
      case 'LIMIT_UNEXPECTED_FILE':
        return res.status(400).json({
          success: false,
          error: '意外的文件字段'
        });
      default:
        return res.status(400).json({
          success: false,
          error: `文件上传错误: ${error.message}`
        });
    }
  }

  if (error.message) {
    return res.status(400).json({
      success: false,
      error: error.message
    });
  }

  // 确保所有代码路径都有返回值
  return next(error);
};
