import type { ErrorInfo } from '../types';

export class LaTeXErrorHandler {
  private errors: ErrorInfo[] = [];
  private warnings: ErrorInfo[] = [];

  addError(error: Omit<ErrorInfo, 'severity'>): void {
    this.errors.push({
      ...error,
      severity: 'error'
    });
  }

  addWarning(warning: Omit<ErrorInfo, 'severity'>): void {
    this.warnings.push({
      ...warning,
      severity: 'warning'
    });
  }

  addInfo(info: Omit<ErrorInfo, 'severity'>): void {
    this.warnings.push({
      ...info,
      severity: 'info'
    });
  }

  getErrors(): ErrorInfo[] {
    return [...this.errors];
  }

  getWarnings(): ErrorInfo[] {
    return [...this.warnings];
  }

  getAllIssues(): ErrorInfo[] {
    return [...this.errors, ...this.warnings];
  }

  clear(): void {
    this.errors = [];
    this.warnings = [];
  }

  hasErrors(): boolean {
    return this.errors.length > 0;
  }

  hasWarnings(): boolean {
    return this.warnings.length > 0;
  }

  getErrorCount(): number {
    return this.errors.length;
  }

  getWarningCount(): number {
    return this.warnings.length;
  }

  // LaTeX特定错误处理
  handleLaTeXError(latex: string, error: any, position?: number): string {
    const errorMessage = error.message || 'LaTeX渲染错误';
    this.addError({
      type: 'latex',
      message: errorMessage,
      content: latex,
      position
    });

    return `<span class="text-red-500 text-xs">LaTeX错误: ${latex}</span>`;
  }

  // Markdown特定错误处理
  handleMarkdownError(content: string, error: any, position?: number): string {
    const errorMessage = error.message || 'Markdown解析错误';
    this.addError({
      type: 'markdown',
      message: errorMessage,
      content,
      position
    });

    return content; // 返回原始内容
  }

  // 题目语法错误处理
  handleQuestionSyntaxError(syntax: string, error: any, position?: number): string {
    const errorMessage = error.message || '题目语法错误';
    this.addError({
      type: 'question-syntax',
      message: errorMessage,
      content: syntax,
      position
    });

    return `<span class="text-orange-500 text-xs">语法错误: ${syntax}</span>`;
  }
}

// 全局错误处理器实例
export const globalErrorHandler = new LaTeXErrorHandler(); 