import React, { useMemo } from 'react';

export interface HighlightRule {
  pattern: RegExp;
  className: string;
  priority: number;
}

export interface LaTeXHighlighterProps {
  content: string;
  className?: string;
  style?: React.CSSProperties;
}

// LaTeX语法高亮规则
const HIGHLIGHT_RULES: HighlightRule[] = [
  // 1. 注释 (最高优先级)
  {
    pattern: /%.*$/gm,
    className: 'latex-comment',
    priority: 100
  },
  
  // 2. 数学环境分隔符
  {
    pattern: /\$\$/g,
    className: 'latex-math-delimiter-block',
    priority: 90
  },
  {
    pattern: /\$/g,
    className: 'latex-math-delimiter-inline',
    priority: 89
  },
  
  // 3. 环境命令
  {
    pattern: /\\begin\{[^}]*\}/g,
    className: 'latex-environment-begin',
    priority: 85
  },
  {
    pattern: /\\end\{[^}]*\}/g,
    className: 'latex-environment-end',
    priority: 85
  },
  
  // 4. 题目语法命令 (高优先级)
  {
    pattern: /\\choice(?![a-zA-Z])/g,
    className: 'latex-question-choice',
    priority: 80
  },
  {
    pattern: /\\fill(?![a-zA-Z])/g,
    className: 'latex-question-fill',
    priority: 80
  },
  {
    pattern: /\\subp(?![a-zA-Z])/g,
    className: 'latex-question-subp',
    priority: 80
  },
  {
    pattern: /\\subsubp(?![a-zA-Z])/g,
    className: 'latex-question-subsubp',
    priority: 80
  },
  
  // 5. 数学函数命令
  {
    pattern: /\\(?:sin|cos|tan|cot|sec|csc|arcsin|arccos|arctan|sinh|cosh|tanh|log|ln|lg|exp)(?![a-zA-Z])/g,
    className: 'latex-math-function',
    priority: 75
  },
  
  // 6. 特殊数学符号
  {
    pattern: /\\(?:infty|partial|nabla|Delta|Omega|Gamma|Lambda|Phi|Psi|Theta|Xi|Pi|Sigma)(?![a-zA-Z])/g,
    className: 'latex-math-symbol-special',
    priority: 70
  },
  
  // 7. 希腊字母
  {
    pattern: /\\(?:alpha|beta|gamma|delta|epsilon|varepsilon|zeta|eta|theta|vartheta|iota|kappa|lambda|mu|nu|xi|pi|rho|sigma|tau|upsilon|phi|varphi|chi|psi|omega)(?![a-zA-Z])/g,
    className: 'latex-greek-letter',
    priority: 65
  },
  
  // 8. 积分、求和、极限
  {
    pattern: /\\(?:int|iint|iiint|oint|sum|prod|coprod|lim|limsup|liminf)(?![a-zA-Z])/g,
    className: 'latex-math-operator-big',
    priority: 65
  },
  
  // 9. 分数、根式
  {
    pattern: /\\(?:frac|dfrac|tfrac|sqrt|cbrt)(?=\s*\{)/g,
    className: 'latex-math-fraction',
    priority: 65
  },
  
  // 10. 字体命令
  {
    pattern: /\\(?:mathbf|mathit|mathrm|mathcal|mathscr|mathfrak|mathbb|textbf|textit|textrm|texttt|textsf)(?=\s*\{)/g,
    className: 'latex-font-command',
    priority: 60
  },
  
  // 11. 装饰命令
  {
    pattern: /\\(?:hat|bar|vec|dot|ddot|tilde|widetilde|widehat|overline|underline|overbrace|underbrace|overset|underset)(?=\s*\{)/g,
    className: 'latex-decoration',
    priority: 60
  },
  
  // 12. 括号和分隔符
  {
    pattern: /\\(?:left|right)(?:\(|\)|\[|\]|\{|\}|\||\\langle|\\rangle|\\lfloor|\\rfloor|\\lceil|\\rceil)/g,
    className: 'latex-delimiter',
    priority: 55
  },
  
  // 13. 关系符号
  {
    pattern: /\\(?:eq|neq|leq|geq|ll|gg|approx|equiv|sim|simeq|cong|propto|parallel|perp|in|notin|subset|subseteq|supset|supseteq|cup|cap|emptyset|varnothing)(?:\s|$|[^a-zA-Z])/g,
    className: 'latex-relation',
    priority: 50
  },
  
  // 14. 运算符号
  {
    pattern: /\\(?:times|div|pm|mp|cdot|ast|star|circ|bullet|oplus|ominus|otimes|oslash|odot|bigcirc|triangle|triangleup|triangledown|square|diamond|lozenge)(?:\s|$|[^a-zA-Z])/g,
    className: 'latex-operator',
    priority: 50
  },
  
  // 15. 箭头
  {
    pattern: /\\(?:rightarrow|leftarrow|leftrightarrow|Rightarrow|Leftarrow|Leftrightarrow|to|mapsto|uparrow|downarrow|updownarrow|Uparrow|Downarrow|Updownarrow|xrightarrow|xleftarrow|xleftrightarrow)(?:\s|$|[^a-zA-Z])/g,
    className: 'latex-arrow',
    priority: 50
  },
  
  // 16. 逻辑符号
  {
    pattern: /\\(?:forall|exists|nexists|therefore|because|implies|iff|land|lor|lnot|top|bot)(?:\s|$|[^a-zA-Z])/g,
    className: 'latex-logic',
    priority: 50
  },
  
  // 17. 一般LaTeX命令
  {
    pattern: /\\[a-zA-Z]+/g,
    className: 'latex-command',
    priority: 30
  },
  
  // 18. 大括号内容
  {
    pattern: /\{[^}]*\}/g,
    className: 'latex-braces-content',
    priority: 25
  },
  
  // 19. 方括号内容 (可选参数)
  {
    pattern: /\[[^\]]*\]/g,
    className: 'latex-optional-param',
    priority: 25
  },
  
  // 20. 数字
  {
    pattern: /\b\d+(?:\.\d+)?\b/g,
    className: 'latex-number',
    priority: 20
  },
  
  // 21. 数学环境内的英文字母和中文
  {
    pattern: /\$\$[^$]*\$\$|\$[^$]*\$/g,
    className: 'latex-math-content',
    priority: 90
  },
  
  // 22. 基本运算符
  {
    pattern: /[+\-=<>]/g,
    className: 'latex-basic-operator',
    priority: 15
  },
  
  // 23. 特殊字符
  {
    pattern: /[&_^~]/g,
    className: 'latex-special-char',
    priority: 10
  }
];

// 高亮处理函数
const highlightLaTeX = (content: string): string => {
  if (!content) return '';
  
  // 首先找出所有数学环境
  const mathEnvironments: Array<{start: number, end: number, content: string}> = [];
  const mathRegex = /\$\$[^$]*\$\$|\$[^$]*\$/g;
  let mathMatch;
  
  while ((mathMatch = mathRegex.exec(content)) !== null) {
    mathEnvironments.push({
      start: mathMatch.index,
      end: mathMatch.index + mathMatch[0].length,
      content: mathMatch[0]
    });
  }
  
  // 创建标记数组，用于跟踪每个字符的高亮状态
  const tokens: Array<{
    char: string;
    className: string;
    priority: number;
    inMathEnv: boolean;
  }> = content.split('').map((char, index) => ({
    char,
    className: '',
    priority: 0,
    inMathEnv: mathEnvironments.some(env => index >= env.start && index < env.end)
  }));
  
  // 应用所有高亮规则（排除数学内容规则）
  HIGHLIGHT_RULES.filter(rule => rule.className !== 'latex-math-content').forEach(rule => {
    let match;
    const regex = new RegExp(rule.pattern.source, rule.pattern.flags);
    
    while ((match = regex.exec(content)) !== null) {
      const start = match.index;
      const end = start + match[0].length;
      
      // 只有当新规则优先级更高时才应用
      for (let i = start; i < end && i < tokens.length; i++) {
        if (tokens[i] && rule.priority > tokens[i].priority) {
          tokens[i].className = rule.className;
          tokens[i].priority = rule.priority;
        }
      }
      
      // 防止无限循环
      if (!match[0]) break;
    }
  });
  
  // 专门处理数学环境内的英文和中文
  mathEnvironments.forEach(env => {
    const mathContent = env.content;
    
    // 在数学环境内查找英文字母（支持多字符），但排除已经被LaTeX命令高亮的部分
    const englishRegex = /[a-zA-Z]+/g;
    let englishMatch;
    while ((englishMatch = englishRegex.exec(mathContent)) !== null) {
      const globalStart = env.start + englishMatch.index;
      const globalEnd = globalStart + englishMatch[0].length;
      
      // 检查这个英文片段是否已经被更高优先级的规则（如LaTeX命令）处理过
      let shouldHighlight = true;
      for (let i = globalStart; i < globalEnd && i < tokens.length; i++) {
        if (tokens[i] && tokens[i].priority >= 30) { // 如果已经被LaTeX命令等规则处理过
          shouldHighlight = false;
          break;
        }
      }
      
      // 只有当这部分没有被LaTeX命令处理时，才作为变量高亮
      if (shouldHighlight) {
        for (let i = globalStart; i < globalEnd && i < tokens.length; i++) {
          if (tokens[i] && 85 > tokens[i].priority) {
            tokens[i].className = 'latex-math-variable';
            tokens[i].priority = 85;
          }
        }
      }
    }
    
    // 在数学环境内查找中文
    const chineseRegex = /[\u4e00-\u9fff]+/g;
    let chineseMatch;
    while ((chineseMatch = chineseRegex.exec(mathContent)) !== null) {
      const globalStart = env.start + chineseMatch.index;
      const globalEnd = globalStart + chineseMatch[0].length;
      
      for (let i = globalStart; i < globalEnd && i < tokens.length; i++) {
        if (tokens[i] && 85 > tokens[i].priority) { // 高优先级
          tokens[i].className = 'latex-math-chinese';
          tokens[i].priority = 85;
        }
      }
    }
    
    // 在数学环境内查找数字，但排除已经被LaTeX命令高亮的部分
    const numberRegex = /\d+(?:\.\d+)?/g;
    let numberMatch;
    while ((numberMatch = numberRegex.exec(mathContent)) !== null) {
      const globalStart = env.start + numberMatch.index;
      const globalEnd = globalStart + numberMatch[0].length;
      
      // 检查这个数字片段是否已经被更高优先级的规则处理过
      let shouldHighlight = true;
      for (let i = globalStart; i < globalEnd && i < tokens.length; i++) {
        if (tokens[i] && tokens[i].priority >= 30) { // 如果已经被LaTeX命令等规则处理过
          shouldHighlight = false;
          break;
        }
      }
      
      // 只有当这部分没有被LaTeX命令处理时，才作为数字高亮
      if (shouldHighlight) {
        for (let i = globalStart; i < globalEnd && i < tokens.length; i++) {
          if (tokens[i] && 85 > tokens[i].priority) {
            tokens[i].className = 'latex-math-number';
            tokens[i].priority = 85;
          }
        }
      }
    }
  });
  
  // 构建HTML字符串
  let result = '';
  let currentClass = '';
  let currentSpan = '';
  
  tokens.forEach((token, index) => {
    if (token.className !== currentClass) {
      // 关闭当前span
      if (currentSpan) {
        if (currentClass) {
          result += `<span class="${currentClass}">${currentSpan}</span>`;
        } else {
          result += `<span class="latex-text">${currentSpan}</span>`;
        }
      }
      
      // 开始新的span
      currentClass = token.className;
      currentSpan = token.char;
    } else {
      currentSpan += token.char;
    }
    
    // 处理最后一个token
    if (index === tokens.length - 1) {
      if (currentSpan) {
        if (currentClass) {
          result += `<span class="${currentClass}">${currentSpan}</span>`;
        } else {
          result += `<span class="latex-text">${currentSpan}</span>`;
        }
      }
    }
  });
  
  // 验证输出长度是否与输入一致（去除HTML标签）
  const textOnly = result.replace(/<[^>]*>/g, '');
  if (textOnly.length !== content.length) {
    console.warn('LaTeX highlighter length mismatch:', {
      input: content.length,
      output: textOnly.length,
      content: content.substring(0, 50) + '...'
    });
  }
  
  return result;
};

const LaTeXHighlighter: React.FC<LaTeXHighlighterProps> = ({
  content,
  className = '',
  style = {}
}) => {
  const highlightedContent = useMemo(() => {
    return highlightLaTeX(content);
  }, [content]);
  
  return (
    <div
      className={`latex-highlighter ${className}`}
      style={style}
      dangerouslySetInnerHTML={{ __html: highlightedContent }}
    />
  );
};

export default LaTeXHighlighter;