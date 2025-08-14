/**
 * 统一错误处理工具
 * 提供标准化的错误处理函数
 */

export interface ApiError {
  message: string;
  code?: string;
  details?: any;
  statusCode?: number;
}

/**
 * 创建标准化的API错误
 */
export function createApiError(message: string, code?: string, details?: any, statusCode?: number): ApiError {
  return {
    message,
    code,
    details,
    statusCode
  };
}

/**
 * 处理文档解析错误
 */
export function handleDocumentParseError(error: any, operation: string): ApiError {
  console.error(`${operation} 失败:`, error);
  
  if (error.code === 'ENOENT') {
    return createApiError('文件不存在或无法访问', 'FILE_NOT_FOUND', error, 404);
  }
  
  if (error.code === 'EACCES') {
    return createApiError('文件访问权限不足', 'FILE_ACCESS_DENIED', error, 403);
  }
  
  if (error.message?.includes('Invalid file format')) {
    return createApiError('不支持的文件格式', 'INVALID_FILE_FORMAT', error, 400);
  }
  
  if (error.message?.includes('File too large')) {
    return createApiError('文件大小超出限制', 'FILE_TOO_LARGE', error, 413);
  }
  
  return createApiError(
    `${operation}失败: ${error.message || '未知错误'}`,
    'DOCUMENT_PARSE_ERROR',
    error,
    500
  );
}

/**
 * 处理OCR服务错误
 */
export function handleOCRError(error: any): ApiError {
  console.error('OCR服务错误:', error);
  
  if (error.code === 'UNAUTHORIZED') {
    return createApiError('OCR服务认证失败，请检查API密钥配置', 'OCR_AUTH_ERROR', error, 401);
  }
  
  if (error.code === 'QUOTA_EXCEEDED') {
    return createApiError('OCR服务配额已用完', 'OCR_QUOTA_EXCEEDED', error, 429);
  }
  
  if (error.message?.includes('Invalid image')) {
    return createApiError('图片格式无效或损坏', 'INVALID_IMAGE', error, 400);
  }
  
  return createApiError(
    `OCR识别失败: ${error.message || '未知错误'}`,
    'OCR_ERROR',
    error,
    500
  );
}

/**
 * 处理AI服务错误
 */
export function handleAIError(error: any, service: string): ApiError {
  console.error(`${service} AI服务错误:`, error);
  
  if (error.code === 'API_KEY_INVALID') {
    return createApiError(`${service} API密钥无效`, 'AI_AUTH_ERROR', error, 401);
  }
  
  if (error.code === 'RATE_LIMIT_EXCEEDED') {
    return createApiError(`${service} 请求频率超限`, 'AI_RATE_LIMIT', error, 429);
  }
  
  if (error.code === 'QUOTA_EXCEEDED') {
    return createApiError(`${service} 服务配额已用完`, 'AI_QUOTA_EXCEEDED', error, 429);
  }
  
  return createApiError(
    `${service} AI服务失败: ${error.message || '未知错误'}`,
    'AI_SERVICE_ERROR',
    error,
    500
  );
}

/**
 * 处理数据库错误
 */
export function handleDatabaseError(error: any, operation: string): ApiError {
  console.error(`数据库${operation}错误:`, error);
  
  if (error.code === 11000) {
    return createApiError('数据已存在，无法重复创建', 'DUPLICATE_DATA', error, 409);
  }
  
  if (error.name === 'ValidationError') {
    return createApiError('数据验证失败', 'VALIDATION_ERROR', error, 400);
  }
  
  if (error.name === 'CastError') {
    return createApiError('数据类型错误', 'TYPE_ERROR', error, 400);
  }
  
  return createApiError(
    `数据库${operation}失败: ${error.message || '未知错误'}`,
    'DATABASE_ERROR',
    error,
    500
  );
}

/**
 * 统一错误响应格式
 */
export function sendErrorResponse(res: any, error: ApiError) {
  const statusCode = error.statusCode || 500;
  
  res.status(statusCode).json({
    success: false,
    message: error.message,
    code: error.code,
    details: error.details,
    timestamp: new Date().toISOString()
  });
}

/**
 * 异步错误包装器
 */
export function asyncErrorHandler(fn: Function) {
  return async (req: any, res: any, next: any) => {
    try {
      await fn(req, res, next);
    } catch (error: any) {
      const apiError = handleDocumentParseError(error, '请求处理');
      sendErrorResponse(res, apiError);
    }
  };
} 