import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let error = { ...err };
  error.message = err.message;

  // Mongoose 重复键错误
  if (err.name === 'MongoError' && (err as any).code === 11000) {
    const message = '数据已存在';
    error = { message, statusCode: 400 } as AppError;
  }

  // Mongoose 验证错误
  if (err.name === 'ValidationError') {
    const message = Object.values((err as any).errors).map((val: any) => val.message).join(', ');
    error = { message, statusCode: 400 } as AppError;
  }

  // Mongoose 无效ID错误
  if (err.name === 'CastError') {
    const message = '无效的资源ID';
    error = { message, statusCode: 400 } as AppError;
  }

  // JWT错误
  if (err.name === 'JsonWebTokenError') {
    const message = '无效的令牌';
    error = { message, statusCode: 401 } as AppError;
  }

  // JWT过期错误
  if (err.name === 'TokenExpiredError') {
    const message = '令牌已过期';
    error = { message, statusCode: 401 } as AppError;
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || '服务器内部错误',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
}; 