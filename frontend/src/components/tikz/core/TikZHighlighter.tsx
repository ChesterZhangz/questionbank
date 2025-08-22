import React, { useMemo } from 'react';

export interface TikZHighlightRule {
  pattern: RegExp;
  className: string;
  priority: number;
}

export interface TikZHighlighterProps {
  content: string;
  className?: string;
  style?: React.CSSProperties;
}

// TikZ语法高亮规则
const TIKZ_HIGHLIGHT_RULES: TikZHighlightRule[] = [
  // 1. 注释 (最高优先级)
  {
    pattern: /%.*$/gm,
    className: 'tikz-comment',
    priority: 100
  },
  
  // 2. TikZ命令 (高优先级)
  {
    pattern: /\\(?:draw|fill|shade|path|clip|useasboundingbox)(?![a-zA-Z])/g,
    className: 'tikz-draw-command',
    priority: 95
  },
  
  // 3. 图形命令
  {
    pattern: /\\(?:circle|rectangle|ellipse|arc|parabola|sin|cos|plot)(?![a-zA-Z])/g,
    className: 'tikz-shape-command',
    priority: 90
  },
  
  // 4. 节点和坐标命令
  {
    pattern: /\\(?:node|coordinate|pic)(?![a-zA-Z])/g,
    className: 'tikz-node-command',
    priority: 90
  },
  
  // 5. 样式命令
  {
    pattern: /\\(?:color|fill|draw|line\s+width|line\s+cap|line\s+join|dash\s+pattern|opacity)(?![a-zA-Z])/g,
    className: 'tikz-style-command',
    priority: 85
  },
  
  // 6. 变换命令
  {
    pattern: /\\(?:scale|rotate|shift|translate|transform\s+shape)(?![a-zA-Z])/g,
    className: 'tikz-transform-command',
    priority: 85
  },
  
  // 7. 数学函数
  {
    pattern: /\\(?:sin|cos|tan|sqrt|exp|log|ln)(?![a-zA-Z])/g,
    className: 'tikz-math-function',
    priority: 80
  },
  
  // 8. 希腊字母
  {
    pattern: /\\(?:alpha|beta|gamma|delta|epsilon|theta|lambda|mu|pi|sigma|phi|omega)(?![a-zA-Z])/g,
    className: 'tikz-greek-letter',
    priority: 75
  },
  
  // 9. 数学符号
  {
    pattern: /\\(?:infty|partial|nabla|Delta|Omega|Gamma|Lambda|Phi|Psi|Theta|Xi|Pi|Sigma)(?![a-zA-Z])/g,
    className: 'tikz-math-symbol',
    priority: 70
  },
  
  // 10. 箭头样式
  {
    pattern: /->|<-|--|->>|<<-|->>|<<-|->|<-|--|->>|<<-|->>|<<-/g,
    className: 'tikz-arrow',
    priority: 65
  },
  
  // 11. 坐标系统
  {
    pattern: /\([^)]*\)/g,
    className: 'tikz-coordinate',
    priority: 60
  },
  
  // 12. 大括号内容
  {
    pattern: /\{[^}]*\}/g,
    className: 'tikz-braces-content',
    priority: 55
  },
  
  // 13. 方括号内容 (可选参数)
  {
    pattern: /\[[^\]]*\]/g,
    className: 'tikz-optional-param',
    priority: 50
  },
  
  // 14. 数字
  {
    pattern: /\b\d+(?:\.\d+)?\b/g,
    className: 'tikz-number',
    priority: 45
  },
  
  // 15. 基本运算符
  {
    pattern: /[+\-=<>]/g,
    className: 'tikz-basic-operator',
    priority: 40
  },
  
  // 16. 特殊字符
  {
    pattern: /[&_^~]/g,
    className: 'tikz-special-char',
    priority: 35
  },
  
  // 17. 一般TikZ命令
  {
    pattern: /\\[a-zA-Z]+/g,
    className: 'tikz-command',
    priority: 30
  }
];

// 高亮处理函数
const highlightTikZ = (content: string): string => {
  if (!content) return '';
  
  // 创建标记数组，用于跟踪每个字符的高亮状态
  const tokens: Array<{
    char: string;
    className: string;
    priority: number;
  }> = content.split('').map(char => ({
    char,
    className: '',
    priority: 0
  }));
  
  // 应用所有高亮规则
  TIKZ_HIGHLIGHT_RULES.forEach(rule => {
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
  
  // 构建HTML字符串
  let result = '';
  let currentClass = '';
  let currentSpan = '';
  
  tokens.forEach((token, index) => {
    // 处理制表符，转换为普通空格以保持换行行为一致
    if (token.char === '\t') {
      token.char = '    ';
    }
    
    if (token.className !== currentClass) {
      // 关闭当前span
      if (currentSpan) {
        // 转义HTML特殊字符，但保持普通空格不变
        const escapedSpan = currentSpan
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#39;');
        
        if (currentClass) {
          result += `<span class="${currentClass}">${escapedSpan}</span>`;
        } else {
          result += `<span class="tikz-text">${escapedSpan}</span>`;
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
        // 转义HTML特殊字符，但保持普通空格不变
        const escapedSpan = currentSpan
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#39;');
        
        if (currentClass) {
          result += `<span class="${currentClass}">${escapedSpan}</span>`;
        } else {
          result += `<span class="tikz-text">${escapedSpan}</span>`;
        }
      }
    }
  });
  
  return result;
};

const TikZHighlighter: React.FC<TikZHighlighterProps> = ({
  content,
  className = '',
  style = {}
}) => {
  const highlightedContent = useMemo(() => {
    return highlightTikZ(content);
  }, [content]);
  
  return (
    <div
      className={`tikz-highlighter ${className}`}
      style={style}
      dangerouslySetInnerHTML={{ __html: highlightedContent }}
    />
  );
};

export default TikZHighlighter;
