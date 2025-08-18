import katex from 'katex';
import 'katex/dist/katex.min.css';
import type { RenderConfig, LaTeXRenderResult } from '../types';
import { globalRenderCache } from '../cache/RenderCache';
import { globalErrorHandler } from '../utils/ErrorHandler';

export class LaTeXRenderer {
  private config: RenderConfig;

  constructor(config: Partial<RenderConfig> = {}) {
    this.config = {
      mode: 'full',
      features: {
        markdown: true,
        questionSyntax: true,
        autoNumbering: true,
        errorHandling: 'lenient'
      },
      styling: {
        fontSize: '1rem',
        lineHeight: '1.6',
        maxWidth: '100%'
      },
      cache: {
        enabled: true,
        maxSize: 200
      },
      ...config
    };
  }

  render(content: string): LaTeXRenderResult {
    // const startTime = performance.now();
    globalErrorHandler.clear();

    // 处理undefined或null的content
    if (!content) {
      return {
        html: '',
        error: undefined,
        warnings: [],
        metadata: {
          formulaCount: 0,
          questionSyntaxCount: 0,
          markdownElements: 0
        }
      };
    }

    // 检查缓存
    const cacheKey = this.generateCacheKey(content);
    if (this.config.cache.enabled) {
      const cached = globalRenderCache.get(cacheKey);
      if (cached) {
        return {
          html: cached,
          metadata: {
            formulaCount: 0,
            questionSyntaxCount: 0,
            markdownElements: 0
          }
        };
      }
    }

    let processedContent = content;

    // 根据模式选择渲染策略
    switch (this.config.mode) {
      case 'full':
        processedContent = this.renderFull(content);
        break;
      case 'lightweight':
        processedContent = this.renderLightweight(content);
        break;
      case 'preview':
        processedContent = this.renderPreview(content);
        break;
    }

    // 缓存结果
    if (this.config.cache.enabled) {
      globalRenderCache.set(cacheKey, processedContent);
    }

    return {
      html: processedContent,
      error: globalErrorHandler.hasErrors() ? '渲染过程中出现错误' : undefined,
      warnings: globalErrorHandler.getWarnings().map(w => w.message),
      metadata: {
        formulaCount: this.countFormulas(content),
        questionSyntaxCount: this.countQuestionSyntax(content),
        markdownElements: this.countMarkdownElements(content)
      }
    };
  }

  private renderFull(content: string): string {
    let processed = content;

    // 处理Markdown语法
    if (this.config.features.markdown) {
      processed = this.renderMarkdown(processed);
    }

    // 处理题目语法
    if (this.config.features.questionSyntax) {
      processed = this.renderQuestionSyntax(processed);
    }

    // 处理LaTeX公式
    processed = this.renderLaTeX(processed);

    return processed;
  }

  private renderLightweight(content: string): string {
    let processed = content;
    processed = this.renderBasicLaTeX(processed);
    processed = this.renderSimpleQuestionSyntax(processed);
    return processed;
  }

  private renderPreview(content: string): string {
    let processed = content;
    if (processed.length > 100) {
      processed = processed.substring(0, 100) + '...';
    }
    processed = this.renderBasicLaTeX(processed);
    processed = this.renderSimpleQuestionSyntax(processed);
    return processed;
  }

  private renderMarkdown(content: string): string {
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
      .replace(/~~(.*?)~~/g, '<del>$1</del>')
      .replace(/^### (.*$)/gm, '<h3>$1</h3>')
      .replace(/^## (.*$)/gm, '<h2>$1</h2>')
      .replace(/^# (.*$)/gm, '<h1>$1</h1>')
      .replace(/^- (.*$)/gm, '<li>$1</li>')
      .replace(/^(\d+)\. (.*$)/gm, '<li>$2</li>');
  }

  private renderQuestionSyntax(content: string): string {
    // 使用字符串分割和重组的方式，避免复杂的占位符机制
    let processed = content;
    
    // 处理 \choice
    processed = processed.replace(/\\choice\s*(\{[^}]*\})?/g, '<span class="choice-bracket">（&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;）</span>');
    
    // 处理 \fill
    processed = processed.replace(/\\fill\s*(\{[^}]*\})?/g, '<span class="fill-blank">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>');
    
    // 新的处理逻辑：同时处理\subp和\subsubp，保持正确的顺序和编号
    let subpCount = 0;
    let subsubpCount = 0;
    
    // 使用正则表达式找到所有的\subp和\subsubp位置
    const pattern = /(\\subp|\\subsubp)/g;
    const matches = [];
    let match;
    
    while ((match = pattern.exec(processed)) !== null) {
      matches.push({
        type: match[1],
        index: match.index,
        fullMatch: match[0]
      });
    }
    
    // 如果没有找到任何匹配，直接返回
    if (matches.length === 0) {
      return processed;
    }
    
    // 按顺序处理每个匹配项
    let result = '';
    let lastIndex = 0;
    
    for (let i = 0; i < matches.length; i++) {
      const currentMatch = matches[i];
      const nextMatch = matches[i + 1];
      
      // 添加当前匹配之前的内容
      result += processed.substring(lastIndex, currentMatch.index);
      
      // 获取当前命令到下一个命令之间的内容
      let contentEnd = nextMatch ? nextMatch.index : processed.length;
      let content = processed.substring(currentMatch.index + currentMatch.fullMatch.length, contentEnd);
      
      // 清理内容，移除可能的HTML标签
      const cleanContent = content.trim().replace(/<[^>]*>/g, '');
      
      if (currentMatch.type === '\\subp') {
        subpCount++;
        subsubpCount = 0; // 重置子小题计数
        result += `<div class="subproblem"><span class="subproblem-number">(${subpCount})</span> ${cleanContent}</div>`;
      } else if (currentMatch.type === '\\subsubp') {
        subsubpCount++;
        const romanNum = this.toRoman(subsubpCount);
        result += `<div class="subproblem subproblem-sub"><span class="subproblem-number">${romanNum}</span> ${cleanContent}</div>`;
      }
      
      lastIndex = contentEnd;
    }
    
    // 添加最后一部分内容
    result += processed.substring(lastIndex);
    
    processed = result;
    
    // 处理其他LaTeX命令
    processed = processed
      .replace(/\\textit\{([^}]*)\}/g, '<span class="latex-italic">$1</span>')
      .replace(/\\textbf\{([^}]*)\}/g, '<span class="latex-bold">$1</span>');

    return processed;
  }

  private renderSimpleQuestionSyntax(content: string): string {
    // 使用字符串分割和重组的方式，避免复杂的占位符机制
    let processed = content;
    
    // 处理 \choice
    processed = processed.replace(/\\choice\s*(\{[^}]*\})?/g, '<span class="choice-bracket">（&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;）</span>');
    
    // 处理 \fill
    processed = processed.replace(/\\fill\s*(\{[^}]*\})?/g, '<span class="fill-blank">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>');
    
    // 处理 \subp - 使用字符串分割和重组的方式
    // 这种方法可以正确处理包含数学公式的\subp内容
    let parts = processed.split('\\subp');
    if (parts.length > 1) {
      let newParts = [parts[0]]; // 第一部分保持不变
      
      for (let i = 1; i < parts.length; i++) {
        let part = parts[i];
        
        // 找到下一个\subp或\subsubp的位置
        let nextSubpIndex = part.indexOf('\\subp');
        let nextSubsubpIndex = part.indexOf('\\subsubp');
        let nextIndex = -1;
        
        if (nextSubpIndex !== -1 && nextSubsubpIndex !== -1) {
          nextIndex = Math.min(nextSubpIndex, nextSubsubpIndex);
        } else if (nextSubpIndex !== -1) {
          nextIndex = nextSubpIndex;
        } else if (nextSubsubpIndex !== -1) {
          nextIndex = nextSubsubpIndex;
        }
        
        let text, remaining;
        if (nextIndex !== -1) {
          text = part.substring(0, nextIndex);
          remaining = part.substring(nextIndex);
        } else {
          text = part;
          remaining = '';
        }
        
        // 清理文本，移除可能的HTML标签
        const cleanText = text.trim().replace(/<[^>]*>/g, '');
        const replacement = `<span class="subproblem"><span class="subproblem-number">(小题)</span> ${cleanText}</span>`;
        
        newParts.push(replacement + remaining);
      }
      
      processed = newParts.join('');
    }
    
    // 处理 \subsubp - 使用相同的方法
    parts = processed.split('\\subsubp');
    if (parts.length > 1) {
      let newParts = [parts[0]]; // 第一部分保持不变
      
      for (let i = 1; i < parts.length; i++) {
        let part = parts[i];
        
        // 找到下一个\subp或\subsubp的位置
        let nextSubpIndex = part.indexOf('\\subp');
        let nextSubsubpIndex = part.indexOf('\\subsubp');
        let nextIndex = -1;
        
        if (nextSubpIndex !== -1 && nextSubsubpIndex !== -1) {
          nextIndex = Math.min(nextSubpIndex, nextSubsubpIndex);
        } else if (nextSubpIndex !== -1) {
          nextIndex = nextSubpIndex;
        } else if (nextSubsubpIndex !== -1) {
          nextIndex = nextSubsubpIndex;
        }
        
        let text, remaining;
        if (nextIndex !== -1) {
          text = part.substring(0, nextIndex);
          remaining = part.substring(nextIndex);
        } else {
          text = part;
          remaining = '';
        }
        
        // 清理文本，移除可能的HTML标签
        const cleanText = text.trim().replace(/<[^>]*>/g, '');
        const replacement = `<span class="subproblem subproblem-sub"><span class="subproblem-number">(子小题)</span> ${cleanText}</span>`;
        
        newParts.push(replacement + remaining);
      }
      
      processed = newParts.join('');
    }
    
    // 处理其他LaTeX命令
    processed = processed
      .replace(/\\textit\{([^}]*)\}/g, '<span class="latex-italic">$1</span>')
      .replace(/\\textbf\{([^}]*)\}/g, '<span class="latex-bold">$1</span>');

    return processed;
  }

  private renderLaTeX(content: string): string {
    // 先处理块级公式
    let processed = content.replace(/\$\$([\s\S]*?)\$\$/g, (_, latex) => {
      try {
        return katex.renderToString(latex, { 
          displayMode: true, 
          throwOnError: false,
          output: 'html',
          minRuleThickness: 0.04,
          maxSize: 20,
          maxExpand: 1000,
          macros: {
            "\\subp": "\\textbf{(1)}",
            "\\subsubp": "\\textbf{i}",
            "\\textit": "\\textit{#1}",
            "\\textbf": "\\textbf{#1}"
          }
        });
      } catch (error) {
        return globalErrorHandler.handleLaTeXError(latex, error);
      }
    });

    // 再处理行内公式
    processed = processed.replace(/\$([^$]*?(?:\n[^$\n]*?)*?)\$/g, (_, latex) => {
      try {
        return katex.renderToString(latex, { 
          displayMode: false, 
          throwOnError: false,
          output: 'html',
          minRuleThickness: 0.04,
          maxSize: 16,
          maxExpand: 1000,
          macros: {
            "\\textit": "\\textit{#1}",
            "\\textbf": "\\textbf{#1}"
          }
        });
      } catch (error) {
        return globalErrorHandler.handleLaTeXError(latex, error);
      }
    });

    return processed;
  }

  private renderBasicLaTeX(content: string): string {
    let processed = content;
    
    // 处理块级公式
    processed = processed.replace(/\$\$([\s\S]*?)\$\$/g, (_, latex) => {
      try {
        return katex.renderToString(latex, { 
          displayMode: true, 
          throwOnError: false,
          output: 'html',
          minRuleThickness: 0.04,
          maxSize: 20,
          maxExpand: 1000,
          macros: {
            "\\subp": "\\textbf{(1)}",
            "\\subsubp": "\\textbf{i}",
            "\\textit": "\\textit{#1}",
            "\\textbf": "\\textbf{#1}"
          }
        });
      } catch (error) {
        return `<span class="text-red-500">LaTeX错误</span>`;
      }
    });
    
    // 处理行内公式
    processed = processed.replace(/\$([^$]*?(?:\n[^$\n]*?)*?)\$/g, (_, latex) => {
      try {
        return katex.renderToString(latex, { 
          displayMode: false, 
          throwOnError: false,
          output: 'html',
          minRuleThickness: 0.04,
          maxSize: 16,
          maxExpand: 1000,
          macros: {
            "\\choice": "\\text{（\\;\\quad\\;\\quad\\;\\quad\\;）}",
            "\\textit": "\\textit{#1}",
            "\\textbf": "\\textbf{#1}"
          }
        });
      } catch (error) {
        return `<span class="text-red-500">LaTeX错误</span>`;
      }
    });
    
    return processed;
  }

  private toRoman(num: number): string {
    const romanNumerals = [
      { value: 50, numeral: 'L' },
      { value: 40, numeral: 'XL' },
      { value: 10, numeral: 'X' },
      { value: 9, numeral: 'IX' },
      { value: 5, numeral: 'V' },
      { value: 4, numeral: 'IV' },
      { value: 1, numeral: 'I' }
    ];
    
    let result = '';
    let remaining = num;
    
    for (const { value, numeral } of romanNumerals) {
      while (remaining >= value) {
        result += numeral;
        remaining -= value;
      }
    }
    
    return result.toLowerCase();
  }

  private generateCacheKey(content: string): string {
    if (!content) {
      return `latex_${this.config.mode}_0_0`;
    }
    return `latex_${this.config.mode}_${content.length}_${this.hashCode(content)}`;
  }

  private hashCode(str: string): number {
    let hash = 0;
    if (!str || str.length === 0) return hash;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash;
  }

  private countFormulas(content: string): number {
    if (!content) return 0;
    const blockFormulas = (content.match(/\$\$([\s\S]*?)\$\$/g) || []).length;
    const inlineFormulas = (content.match(/\$([^$]*?(?:\n[^$\n]*?)*?)\$/g) || []).length;
    return blockFormulas + inlineFormulas;
  }

  private countQuestionSyntax(content: string): number {
    if (!content) return 0;
    const choiceCount = (content.match(/\\choice/g) || []).length;
    const fillCount = (content.match(/\\fill/g) || []).length;
    const subpCount = (content.match(/\\subp/g) || []).length;
    const subsubpCount = (content.match(/\\subsubp/g) || []).length;
    return choiceCount + fillCount + subpCount + subsubpCount;
  }

  private countMarkdownElements(content: string): number {
    if (!content) return 0;
    const boldCount = (content.match(/\*\*(.*?)\*\*/g) || []).length;
    const italicCount = (content.match(/\*(.*?)\*/g) || []).length;
    const codeCount = (content.match(/`(.*?)`/g) || []).length;
    const headingCount = (content.match(/^#{1,3} /gm) || []).length;
    return boldCount + italicCount + codeCount + headingCount;
  }
}

// 全局渲染器实例
export const globalLaTeXRenderer = new LaTeXRenderer(); 