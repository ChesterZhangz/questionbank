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

    // 添加JavaScript代码来动态检测需要横向滚动的数学公式
    const scrollDetectionScript = `
      <script>
        (function() {
          function detectScrollableFormulas() {
            const katexElements = document.querySelectorAll('.latex-content .katex');
            katexElements.forEach(function(katex) {
              // 检查是否包含需要横向滚动的复杂元素
              const hasArray = katex.querySelector('.array');
              const hasMatrix = katex.querySelector('.matrix');
              const hasEqnarray = katex.querySelector('.eqnarray');
              const hasAlign = katex.querySelector('.align');
              const hasFrac = katex.querySelector('.frac');
              const hasSqrt = katex.querySelector('.sqrt');
              const hasSum = katex.querySelector('.sum');
              const hasInt = katex.querySelector('.int');
              const hasProd = katex.querySelector('.prod');
              const hasLim = katex.querySelector('.lim');
              const hasLargeOperator = katex.querySelector('.large-op');
              
              // 检查内容是否超出容器宽度（考虑一定的容差）
              const contentWidth = katex.scrollWidth;
              const containerWidth = katex.clientWidth;
              const needsScroll = hasArray || hasMatrix || hasEqnarray || hasAlign || 
                                hasFrac || hasSqrt || hasSum || hasInt || hasProd ||
                                hasLim || hasLargeOperator ||
                                (contentWidth > containerWidth + 10); // 10px容差
              
              if (needsScroll) {
                katex.classList.add('needs-scroll');
                // 为需要滚动的公式添加提示
                if (!katex.querySelector('.scroll-hint')) {
                  const hint = document.createElement('div');
                  hint.className = 'scroll-hint';
                  hint.style.cssText = 'position: absolute; top: -20px; right: 0; font-size: 10px; color: #666; pointer-events: none;';
                  hint.textContent = '← 可横向滚动';
                  katex.style.position = 'relative';
                  katex.appendChild(hint);
                }
              } else {
                katex.classList.remove('needs-scroll');
                // 移除滚动提示
                const hint = katex.querySelector('.scroll-hint');
                if (hint) {
                  hint.remove();
                }
              }
            });
          }
          
          // 页面加载完成后执行检测
          if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', detectScrollableFormulas);
          } else {
            detectScrollableFormulas();
          }
          
          // 监听DOM变化，动态检测新添加的数学公式
          const observer = new MutationObserver(function(mutations) {
            let shouldCheck = false;
            mutations.forEach(function(mutation) {
              if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                shouldCheck = true;
              }
            });
            if (shouldCheck) {
              setTimeout(detectScrollableFormulas, 100);
            }
          });
          
          observer.observe(document.body, {
            childList: true,
            subtree: true
          });
          
          // 监听窗口大小变化，重新检测
          window.addEventListener('resize', function() {
            setTimeout(detectScrollableFormulas, 100);
          });
        })();
      </script>
    `;

    // 在HTML末尾添加脚本
    processedContent += scrollDetectionScript;

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

    // 处理表格环境（必须在其他处理之前）
    const tablePlaceholders: string[] = [];
    processed = this.renderTablesWithPlaceholders(processed, tablePlaceholders);

    // 处理题目语法
    if (this.config.features.questionSyntax) {
      processed = this.renderQuestionSyntax(processed);
    }

    // 处理Markdown
    if (this.config.features.markdown) {
      processed = this.renderMarkdown(processed);
    }

    // 处理LaTeX公式
    processed = this.renderLaTeX(processed);

    // 恢复表格内容
    processed = this.restoreTablePlaceholders(processed, tablePlaceholders);

    return processed;
  }

  /**
   * 渲染表格并使用占位符替换
   */
  private renderTablesWithPlaceholders(content: string, placeholders: string[]): string {
    return content.replace(/\\begin\{tabular\}(\[[^\]]*\])?\{([^}]*)\}([\s\S]*?)\\end\{tabular\}/g, (_, options, columnSpec, tableContent) => {
      try {
        const tableHTML = this.parseTable(tableContent, columnSpec, options);
        const placeholder = `__TABLE_PLACEHOLDER_${placeholders.length}__`;
        placeholders.push(tableHTML);
        return placeholder;
      } catch (error) {
        console.error('表格解析错误:', error);
        return `<div class="latex-error">表格解析错误: ${error}</div>`;
      }
    });
  }

  /**
   * 恢复表格占位符
   */
  private restoreTablePlaceholders(content: string, placeholders: string[]): string {
    let processed = content;
    placeholders.forEach((placeholder, index) => {
      processed = processed.replace(`__TABLE_PLACEHOLDER_${index}__`, placeholder);
    });
    return processed;
  }

  private renderLightweight(content: string): string {
    let processed = content;
    // 处理表格环境（必须在其他处理之前）
    const tablePlaceholders: string[] = [];
    processed = this.renderTablesWithPlaceholders(processed, tablePlaceholders);
    processed = this.renderBasicLaTeX(processed);
    processed = this.renderSimpleQuestionSyntax(processed);
    // 恢复表格内容
    processed = this.restoreTablePlaceholders(processed, tablePlaceholders);
    return processed;
  }

  private renderPreview(content: string): string {
    let processed = content;
    if (processed.length > 100) {
      processed = processed.substring(0, 100) + '...';
    }
    // 处理表格环境（必须在其他处理之前）
    const tablePlaceholders: string[] = [];
    processed = this.renderTablesWithPlaceholders(processed, tablePlaceholders);
    processed = this.renderBasicLaTeX(processed);
    processed = this.renderSimpleQuestionSyntax(processed);
    // 恢复表格内容
    processed = this.restoreTablePlaceholders(processed, tablePlaceholders);
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
      
      // 清理内容，移除可能的HTML标签（但保留数学表达式中的< >符号）
      const cleanContent = content.trim();
      
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
        
        // 清理文本，移除可能的HTML标签（但保留数学表达式中的< >符号）
        const cleanText = text.trim();
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
        
        // 清理文本，移除可能的HTML标签（但保留数学表达式中的< >符号）
        const cleanText = text.trim();
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



  /**
   * 解析表格内容
   */
  private parseTable(tableContent: string, columnSpec: string, options?: string): string {
    
    // 解析列规格
    const columns = this.parseColumnSpec(columnSpec);
    
    // 解析表格行
    const rows = this.parseTableRows(tableContent);
    
    
    // 生成HTML表格
    return this.generateTableHTML(rows, columns, options);
  }

  /**
   * 解析列规格
   */
  private parseColumnSpec(columnSpec: string): Array<{ align: string; border: boolean }> {
    const columns: Array<{ align: string; border: boolean }> = [];
    
    for (let i = 0; i < columnSpec.length; i++) {
      const char = columnSpec[i];
      
      if (char === '|') {
        // 边框字符，不创建新列，但标记下一个列有左边框
        continue;
      }
      
      let align = 'left';
      let border = false;
      
      switch (char) {
        case 'l':
          align = 'left';
          break;
        case 'c':
          align = 'center';
          break;
        case 'r':
          align = 'right';
          break;
        default:
          align = 'left';
      }
      
      // 检查是否有左边框（前一个字符是|）
      if (i > 0 && columnSpec[i - 1] === '|') {
        border = true;
      }
      
      columns.push({ align, border });
    }
    
    // 检查最后一个字符是否是|，如果是，最后一个列有右边框
    if (columnSpec.endsWith('|') && columns.length > 0) {
      columns[columns.length - 1].border = true;
    }
    
    return columns;
  }

  /**
   * 解析表格行
   */
  private parseTableRows(tableContent: string): string[][] {
    const rows: string[][] = [];
    
    // 按行分割
    const lines = tableContent.split('\\\\');
    
    for (const line of lines) {
      if (!line.trim()) continue;
      
      // 按&分割单元格
      const cells = line.split('&').map(cell => cell.trim());
      if (cells.length > 0) {
        rows.push(cells);
      }
    }
    
    return rows;
  }

  /**
   * 生成HTML表格
   */
  private generateTableHTML(rows: string[][], columns: Array<{ align: string; border: boolean }>, options?: string): string {
    let tableClass = 'latex-table';
    let tableStyle = '';
    
    // 处理表格选项
    if (options) {
      if (options.includes('|')) {
        tableClass += ' latex-table-bordered';
      }
    }
    
    // 检查是否有边框
    const hasBorders = columns.some(col => col.border) || (options && options.includes('|'));
    if (hasBorders) {
      tableClass += ' latex-table-bordered';
      tableStyle = 'border-collapse: collapse; border: 1px solid #ccc;';
    }
    
    // 检查表格是否需要横向滚动
    const needsScroll = rows.some(row => row.length > 4) || columns.length > 4;
    
    let html = '';
    if (needsScroll) {
      html += '<div class="latex-table-container">';
    }
    
    html += `<table class="${tableClass}" style="${tableStyle}">`;
    
    // 生成表格内容
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      html += '<tr>';
      
      for (let j = 0; j < row.length; j++) {
        const cell = row[j];
        const column = columns[j] || { align: 'left', border: false };
        
        let cellStyle = `text-align: ${column.align};`;
        if (hasBorders) {
          cellStyle += ' border: 1px solid #ccc; padding: 8px;';
        } else {
          cellStyle += ' padding: 4px 8px;';
        }
        
        // 处理\hline
        let cellContent = cell.replace(/\\hline/g, '');
        
        // 处理\multirow和\multicolumn
        cellContent = this.processTableCommands(cellContent);
        
        html += `<td style="${cellStyle}">${cellContent}</td>`;
      }
      
      html += '</tr>';
    }
    
    html += '</table>';
    
    if (needsScroll) {
      html += '</div>';
    }
    
    return html;
  }

  /**
   * 处理表格特殊命令
   */
  private processTableCommands(content: string): string {
    // 处理\multirow
    content = content.replace(/\\multirow\{(\d+)\}\{([^}]*)\}\{([^}]*)\}/g, (_, __, ___, text) => {
      return `<span style="display: inline-block; vertical-align: middle;">${text}</span>`;
    });
    
    // 处理\multicolumn
    content = content.replace(/\\multicolumn\{(\d+)\}\{([^}]*)\}\{([^}]*)\}/g, (_, __, align, text) => {
      let alignStyle = 'text-align: left;';
      switch (align) {
        case 'c':
          alignStyle = 'text-align: center;';
          break;
        case 'r':
          alignStyle = 'text-align: right;';
          break;
      }
      return `<span style="${alignStyle}">${text}</span>`;
    });
    
    // 处理\hline（在单元格级别忽略）
    content = content.replace(/\\hline/g, '');
    
    // 处理表格中的数学公式
    content = this.renderTableMath(content);
    
    return content;
  }

  /**
   * 渲染表格中的数学公式
   */
  private renderTableMath(content: string): string {
    // 处理块级公式
    content = content.replace(/\$\$([\s\S]*?)\$\$/g, (_, latex) => {
      try {
        return katex.renderToString(latex, { 
          displayMode: true, 
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
        console.error('表格数学公式渲染错误:', error);
        return `<span class="text-red-500">数学公式错误</span>`;
      }
    });

    // 处理行内公式
    content = content.replace(/\$([^$]*?(?:\n[^$\n]*?)*?)\$/g, (_, latex) => {
      try {
        return katex.renderToString(latex, { 
          displayMode: false, 
          throwOnError: false,
          output: 'html',
          minRuleThickness: 0.04,
          maxSize: 14,
          maxExpand: 1000,
          macros: {
            "\\textit": "\\textit{#1}",
            "\\textbf": "\\textbf{#1}",
            "\\begin{pmatrix}": "\\begin{pmatrix}",
            "\\end{pmatrix}": "\\end{pmatrix}",
            "\\begin{bmatrix}": "\\begin{bmatrix}",
            "\\end{bmatrix}": "\\end{bmatrix}",
            "\\begin{vmatrix}": "\\begin{vmatrix}",
            "\\end{vmatrix}": "\\end{vmatrix}"
          }
        });
      } catch (error) {
        console.error('表格行内数学公式渲染错误:', error);
        return `<span class="text-red-500">数学公式错误</span>`;
      }
    });

    return content;
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