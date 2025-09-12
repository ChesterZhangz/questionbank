// 错误类型定义
export interface AppError {
  code: number;
  message: string;
  details?: string;
  timestamp: Date;
  userAgent?: string;
  url?: string;
}

// 翻译函数类型
export type TranslationFunction = (key: string, params?: Record<string, any>) => string;

// 错误代码映射
export const ERROR_CODES = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
  NOT_FOUND_ERROR: 'NOT_FOUND_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const;

// 获取错误消息（支持翻译）
export const getErrorMessage = (code: keyof typeof ERROR_CODES, t?: TranslationFunction): string => {
  if (t) {
    return t(`utils.errorHandler.messages.${code}`);
  }
  
  // 默认中文消息
  const defaultMessages = {
    [ERROR_CODES.NETWORK_ERROR]: '网络连接错误，请检查网络设置',
    [ERROR_CODES.VALIDATION_ERROR]: '输入数据验证失败，请检查输入内容',
    [ERROR_CODES.AUTHENTICATION_ERROR]: '身份验证失败，请重新登录',
    [ERROR_CODES.AUTHORIZATION_ERROR]: '权限不足，无法访问此资源',
    [ERROR_CODES.NOT_FOUND_ERROR]: '请求的资源不存在',
    [ERROR_CODES.SERVER_ERROR]: '服务器内部错误，请稍后重试',
    [ERROR_CODES.UNKNOWN_ERROR]: '发生未知错误，请稍后重试',
  };
  
  return defaultMessages[code];
};

// 创建错误对象
export const createError = (
  code: keyof typeof ERROR_CODES,
  message?: string,
  details?: string,
  t?: TranslationFunction
): AppError => ({
  code: getErrorCode(code),
  message: message || getErrorMessage(code, t),
  details,
  timestamp: new Date(),
  userAgent: navigator.userAgent,
  url: window.location.href,
});

// 获取HTTP状态码
export const getErrorCode = (errorType: keyof typeof ERROR_CODES): number => {
  const codeMap: Record<keyof typeof ERROR_CODES, number> = {
    [ERROR_CODES.NETWORK_ERROR]: 0,
    [ERROR_CODES.VALIDATION_ERROR]: 400,
    [ERROR_CODES.AUTHENTICATION_ERROR]: 401,
    [ERROR_CODES.AUTHORIZATION_ERROR]: 403,
    [ERROR_CODES.NOT_FOUND_ERROR]: 404,
    [ERROR_CODES.SERVER_ERROR]: 500,
    [ERROR_CODES.UNKNOWN_ERROR]: 500,
  };
  return codeMap[errorType];
};

// 处理API错误
export const handleApiError = (error: any, t?: TranslationFunction): AppError => {
  if (error.response) {
    // 服务器响应了错误状态码
    const status = error.response.status;
    const data = error.response.data;
    
    switch (status) {
      case 400:
        return createError(ERROR_CODES.VALIDATION_ERROR, data?.message, undefined, t);
      case 401:
        return createError(ERROR_CODES.AUTHENTICATION_ERROR, data?.message, undefined, t);
      case 403:
        return createError(ERROR_CODES.AUTHORIZATION_ERROR, data?.message, undefined, t);
      case 404:
        return createError(ERROR_CODES.NOT_FOUND_ERROR, data?.message, undefined, t);
      case 500:
        return createError(ERROR_CODES.SERVER_ERROR, data?.message, undefined, t);
      default:
        return createError(ERROR_CODES.UNKNOWN_ERROR, data?.message, undefined, t);
    }
  } else if (error.request) {
    // 请求已发出但没有收到响应
    const timeoutMessage = t ? t('utils.errorHandler.messages.networkTimeout') : '网络连接超时';
    return createError(ERROR_CODES.NETWORK_ERROR, timeoutMessage, undefined, t);
  } else {
    // 请求设置时发生错误
    return createError(ERROR_CODES.UNKNOWN_ERROR, error.message, undefined, t);
  }
};

// 记录错误到控制台
export const logError = (error: AppError | Error): void => {
  console.error('Application Error:', {
    ...error,
    timestamp: error instanceof Error ? new Date() : error.timestamp,
  });
};

// 发送错误报告到服务器（可选）
export const reportError = async (_error: AppError): Promise<void> => {
  try {
    // 这里可以发送错误报告到服务器
    // await api.post('/error-reports', _error);
  } catch (reportError) {
    console.error('Failed to report error:', reportError);
  }
};

// 全局错误处理器
export const setupGlobalErrorHandler = (t?: TranslationFunction): void => {
  // 处理未捕获的Promise错误
  window.addEventListener('unhandledrejection', (event) => {
    event.preventDefault();
    const unhandledPromiseMessage = t ? t('utils.errorHandler.messages.unhandledPromiseError') : '未处理的Promise错误';
    const error = createError(ERROR_CODES.UNKNOWN_ERROR, unhandledPromiseMessage, undefined, t);
    logError(error);
    reportError(error);
  });

  // 处理全局JavaScript错误
  window.addEventListener('error', (event) => {
    event.preventDefault();
    const jsErrorMessage = t ? t('utils.errorHandler.messages.javaScriptError') : 'JavaScript错误';
    const error = createError(ERROR_CODES.UNKNOWN_ERROR, event.error?.message || jsErrorMessage, undefined, t);
    logError(error);
    reportError(error);
  });
};

// 格式化错误消息用于显示
export const formatErrorMessage = (error: AppError | Error): string => {
  if (error instanceof Error) {
    return error.message;
  }
  return error.message;
};

// 检查是否为网络错误
export const isNetworkError = (error: any): boolean => {
  return !error.response && error.request;
};

// 检查是否为服务器错误
export const isServerError = (error: any): boolean => {
  return error.response && error.response.status >= 500;
};

// 检查是否为客户端错误
export const isClientError = (error: any): boolean => {
  return error.response && error.response.status >= 400 && error.response.status < 500;
}; 