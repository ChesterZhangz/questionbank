/**
 * 文档解析相关的统一类型定义
 */

// 基础题目接口
export interface BaseQuestion {
  _id: string;
  type: 'choice' | 'fill' | 'solution';
  content: {
    stem: string;
    options?: Array<{ text: string; isCorrect: boolean }>;
    answer?: string;
  };
  difficulty?: number;
  category?: string;
  tags?: string[];
  source: string;
  confidence?: number;
  createdAt: Date;
  updatedAt: Date;
}

// 解析后的题目接口
export interface ParsedQuestion extends BaseQuestion {
  coordinates?: Array<{ x: number; y: number }>;
  metadata?: {
    knowledgePoints?: string[];
    pageNumber?: number;
    lineNumber?: number;
  };
}

// 文档解析结果接口
export interface DocumentParseResult {
  questions: ParsedQuestion[];
  pages: number;
  mathFormulas: number;
  images: number;
  tables: number;
  confidence: number;
  errors: Array<{
    id: string;
    type: 'parsing' | 'format' | 'content' | 'ai';
    message: string;
    line?: number;
    questionIndex?: number;
    severity: 'error' | 'warning' | 'info';
  }>;
  warnings: Array<{
    id: string;
    type: 'format' | 'content' | 'quality';
    message: string;
    suggestion: string;
    questionIndex?: number;
  }>;
}

// 区域定义接口
export interface Area {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  pageNumber: number;
  label?: string;
}

// 文件类型枚举
export type FileType = 'word' | 'pdf' | 'latex' | 'image' | 'unknown';

// OCR识别结果接口
export interface OCRResult {
  text: string;
  confidence: number;
  coordinates: Array<{ x: number; y: number }>;
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

// AI处理结果接口
export interface AIProcessResult {
  success: boolean;
  questions: ParsedQuestion[];
  processingTime: number;
  confidence: number;
  errors: string[];
}

// 自动处理结果接口
export interface AutoProcessResult {
  success: boolean;
  questions: ParsedQuestion[];
  statistics: {
    totalPages: number;
    totalQuestions: number;
    processingTime: number;
    confidence: number;
  };
  errors: string[];
}

// 文档解析请求接口
export interface DocumentParseRequest {
  file: Express.Multer.File;
  areas?: Area[];
  fileType?: FileType;
  options?: {
    enableOCR?: boolean;
    enableAI?: boolean;
    confidence?: number;
  };
}

// 文档解析响应接口
export interface DocumentParseResponse {
  success: boolean;
  questions: ParsedQuestion[];
  metadata: {
    pages: number;
    mathFormulas: number;
    images: number;
    tables: number;
    confidence: number;
  };
  errors: Array<{
    id: string;
    type: string;
    message: string;
    severity: string;
  }>;
  warnings: Array<{
    id: string;
    type: string;
    message: string;
    suggestion: string;
  }>;
  message: string;
} 