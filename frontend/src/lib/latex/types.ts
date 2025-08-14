// LaTeX渲染系统类型定义

export interface RenderConfig {
  mode: 'full' | 'lightweight' | 'preview';
  features: {
    markdown: boolean;
    questionSyntax: boolean;
    autoNumbering: boolean;
    errorHandling: 'strict' | 'lenient';
  };
  styling: {
    fontSize: string;
    lineHeight: string;
    maxWidth: string;
  };
  cache: {
    enabled: boolean;
    maxSize: number;
  };
}

export interface LaTeXRenderResult {
  html: string;
  error?: string;
  warnings?: string[];
  metadata?: {
    formulaCount: number;
    questionSyntaxCount: number;
    markdownElements: number;
  };
}

export interface SymbolDefinition {
  latex: string;
  name: string;
  description?: string;
  category: string;
  icon?: string;
}

export interface SymbolCategory {
  name: string;
  icon?: string;
  symbols: SymbolDefinition[];
}

export interface QuestionSyntaxConfig {
  choice: {
    enabled: boolean;
    style: string;
  };
  fill: {
    enabled: boolean;
    style: string;
  };
  subp: {
    enabled: boolean;
    numbering: 'arabic' | 'roman' | 'alpha';
    style: string;
  };
  subsubp: {
    enabled: boolean;
    numbering: 'roman' | 'alpha' | 'arabic';
    style: string;
  };
}

export interface MarkdownConfig {
  enabled: boolean;
  features: {
    bold: boolean;
    italic: boolean;
    code: boolean;
    strikethrough: boolean;
    headings: boolean;
    lists: boolean;
    links: boolean;
  };
}

export interface ErrorInfo {
  type: 'latex' | 'markdown' | 'question-syntax';
  message: string;
  position?: number;
  content?: string;
  severity: 'error' | 'warning' | 'info';
}

export interface CacheEntry {
  key: string;
  value: string;
  timestamp: number;
  size: number;
}

export interface RenderStats {
  renderTime: number;
  cacheHit: boolean;
  errorCount: number;
  warningCount: number;
} 