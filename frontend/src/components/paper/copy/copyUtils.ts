import type { Paper, Question, CopyConfig } from './types';

// 默认复制配置
export const defaultCopyConfig: CopyConfig = {
  mode: 'mareate',
  addVspace: true,
  vspaceAmount: {
    choice: '\\vspace{3cm}',
    fill: '\\vspace{3cm}',
    solution: '\\vspace{5cm}',
    default: '\\vspace{3cm}'
  },
  copyMethod: 'clipboard',
  selectiveCopy: {
    enabled: false,
    selectedQuestions: [],
    showDifficulty: true,
    showSource: true
  },
  normalConfig: {
    addDocumentEnvironment: false,
    paperSize: 'A4',
    customGeometry: ''
  }
};

// 获取难度文本
export const getDifficultyText = (difficulty: number): string => {
  switch (difficulty) {
    case 1: return '非常简单';
    case 2: return '简单';
    case 3: return '中等';
    case 4: return '困难';
    case 5: return '非常困难';
    default: return '未知';
  }
};

// 获取题目类型的vspace
export const getVspaceForType = (type: string, config: CopyConfig): string => {
  if (!config.addVspace) return '';
  
  switch (type) {
    case 'choice':
    case 'multiple-choice':
      return config.vspaceAmount.choice;
    case 'fill':
      return config.vspaceAmount.fill;
    case 'solution':
      return config.vspaceAmount.solution;
    default:
      return config.vspaceAmount.default;
  }
};

// 获取难度标记
const getDifficultyMark = (difficulty: number, source?: string): string => {
  const sourceText = source ? `[${source}]` : '';
  
  switch (difficulty) {
    case 1:
      return `\\vs${sourceText}`;
    case 2:
      return `\\bs${sourceText}`;
    case 3:
      return `\\mi${sourceText}`;
    case 4:
      return `\\di${sourceText}`;
    case 5:
      return `\\vd${sourceText}`;
    default:
      return `\\mi${sourceText}`; // 默认为中等
  }
};

// 转换答案内容为LaTeX
const convertAnswerToLaTeX = (question: Question): string => {
  let answerLatex = '';
  
  if (question.type === 'choice' || question.type === 'multiple-choice') {
    // 选择题：优先显示详细解答，其次显示简单答案
    if (question.content.solution && question.content.solution.trim()) {
      // 有详细解答，显示详细解答
      answerLatex = question.content.solution;
    } else {
      // 没有详细解答，显示选项答案
      if (question.content.options && question.content.options.length > 0) {
        const correctOptions = question.content.options
          .map((option, index) => option.isCorrect ? String.fromCharCode(65 + index) : null)
          .filter(Boolean);
        answerLatex = `答案：${correctOptions.join('、')}`;
      } else if (question.content.answer) {
        answerLatex = `答案：${question.content.answer}`;
      }
    }
  } else if (question.type === 'fill') {
    // 填空题：优先显示详细解答，其次显示填空答案
    if (question.content.solution && question.content.solution.trim()) {
      // 有详细解答，显示详细解答
      answerLatex = question.content.solution;
    } else {
      // 没有详细解答，显示填空答案
      if (question.content.fillAnswers && question.content.fillAnswers.length > 0) {
        answerLatex = `答案：${question.content.fillAnswers.join('；')}`;
      } else if (question.content.answer) {
        answerLatex = `答案：${question.content.answer}`;
      }
    }
  } else if (question.type === 'solution') {
    // 解答题：优先显示详细解答，其次显示子问题答案
    if (question.content.solution && question.content.solution.trim()) {
      // 有详细解答，显示详细解答
      answerLatex = question.content.solution;
    } else if (question.content.solutionAnswers && question.content.solutionAnswers.length > 0) {
      // 没有详细解答，显示子问题答案
      answerLatex = question.content.solutionAnswers
        .map((answer: string) => {
          // 检查是否包含\subp标记
          if (answer.includes('\\subp')) {
            // 将\subp转换为subproblem环境
            let processedAnswer = answer.replace(/\\subp/g, '\\begin{subproblem}\\item');
            processedAnswer = processedAnswer.replace(/(\\begin\{subproblem\}\\item[^}]*?)(?=\\begin\{subproblem\}|$)/g, '$1\\end{subproblem}');
            return processedAnswer;
          } else if (answer.includes('\\subsubp')) {
            // 将\subsubp转换为subsubproblem环境
            let processedAnswer = answer.replace(/\\subsubp/g, '\\begin{subsubproblem}\\item');
            processedAnswer = processedAnswer.replace(/(\\begin\{subsubproblem\}\\item[^}]*?)(?=\\begin\{subsubproblem\}|$)/g, '$1\\end{subsubproblem}');
            return processedAnswer;
          } else {
            return answer;
          }
        })
        .join('\n\n');
    } else if (question.content.answer) {
      // 最后显示基础答案
      answerLatex = `答案：${question.content.answer}`;
    }
  }
  
  return answerLatex;
};

// 获取纸张尺寸的geometry配置
export const getGeometryConfig = (paperSize: string, customGeometry?: string): string => {
  if (paperSize === 'custom' && customGeometry) {
    return customGeometry;
  }
  
  switch (paperSize) {
    case 'A4':
      return 'paperwidth=21cm,paperheight=29.7cm,top=2.4cm,bottom=2.6cm,right=2cm,left=2cm';
    case 'B5':
      return 'paperwidth=18.2cm,paperheight=25.7cm,top=2.4cm,bottom=2.6cm,right=2cm,left=2cm';
    default:
      return 'paperwidth=21cm,paperheight=29.7cm,top=2.4cm,bottom=2.6cm,right=2cm,left=2cm';
  }
};

// 生成LaTeX文档环境
export const generateDocumentEnvironment = (config: CopyConfig): string => {
  if (config.mode !== 'normal' || !config.normalConfig?.addDocumentEnvironment) {
    return '';
  }
  
  const geometryConfig = getGeometryConfig(
    config.normalConfig.paperSize,
    config.normalConfig.customGeometry
  );
  
  // 如果是Overleaf模式，使用完整的配置
  if (config.copyMethod === 'overleaf') {
    return `\\documentclass{article}
\\usepackage{setspace}
\\usepackage{ctex}
\\usepackage{xeCJK} 			% 写中文要用到
\\usepackage{zhnumber} 		% 可以把题号变为中文
\\usepackage{graphicx} 		% 插入图片
\\usepackage{hyperref} 		% 插入链接
\\usepackage{amsmath} 		% 数学符号
\\usepackage{booktabs} 		% 表格样式
\\usepackage{fancyhdr} 
\\usepackage{enumitem}
\\usepackage{soul}
\\usepackage{underscore}
\\usepackage{ulem}
\\usepackage{amssymb}
\\usepackage{tikz}
\\usepackage{xcolor}
\\usepackage{pgfplots}
\\usepackage{float}          %设置图片浮动位置的宏包
\\usepackage{subfigure}      %插入多图时用子图显示的宏包
\\usepackage{fancyhdr}       % 导入fancyhdr包
\\usepackage{lastpage}
\\usepackage{xcolor}
\\usepackage{lastpage}  % 引入 lastpage 包
\\usepackage{framed} 
\\usepackage[thicklines]{cancel}
\\setlength{\\parindent}{4em}
\\usetikzlibrary{arrows}
\\usetikzlibrary{calc}
\\addtolength{\\parskip}{5pt}
\\usepackage[${geometryConfig}]{geometry}

\\usepackage{tasks}
\\settasks{label={\\Alph*. }}

\\begin{document}

`;
  }
  
  // 常规模式使用简化配置
  return `\\documentclass{article}
\\usepackage{amsmath}
\\usepackage{setspace}
\\usepackage{ctex}
\\usepackage{xeCJK}
\\usepackage{zhnumber}
\\usepackage{graphicx}
\\usepackage[hidelinks]{hyperref}
\\usepackage{booktabs}
\\usepackage{enumitem}
\\usepackage{soul}
\\usepackage{ulem}
\\usepackage{amssymb}
\\usepackage{tikz}
\\usepackage{xcolor}
\\usepackage{pgfplots}
\\usepackage{float}
\\usepackage{subfigure}
\\usepackage{fancyhdr}
\\usepackage{lastpage}
\\usepackage{framed}
\\usepackage[thicklines]{cancel}
\\usepackage{tasks}
\\usepackage{underscore}
\\usepackage{multicol}
\\usepackage[${geometryConfig}]{geometry}

\\usepackage{tasks}
\\settasks{label={\\Alph*. }}

\\begin{document}

`;
};

// 生成LaTeX文档结束
export const generateDocumentEnd = (config: CopyConfig): string => {
  if (config.mode !== 'normal' || !config.normalConfig?.addDocumentEnvironment) {
    return '';
  }
  
  return `\\end{document}`;
};

// 转换单个题目为LaTeX
// 处理题目中的图片和TikZ代码
const processQuestionMedia = (question: Question): string => {
  let mediaContent = '';
  
  // 合并图片和TikZ代码，按order排序
  const mediaItems = [
    ...(question.images || []).map(item => ({ type: 'image' as const, data: item })),
    ...(question.tikzCodes || []).map(item => ({ type: 'tikz' as const, data: item }))
  ].sort((a, b) => {
    const orderA = a.data.order || 0;
    const orderB = b.data.order || 0;
    return orderA - orderB;
  });
  
  // 根据媒体数量调整布局
  const mediaCount = mediaItems.length;
  
  if (mediaCount === 0) {
    return mediaContent;
  }
  
  if (mediaCount === 1) {
    // 1张图片：放在最右侧
    const item = mediaItems[0];
    if (item.type === 'image') {
      const image = item.data;
      mediaContent += `\n\\begin{flushright}\n`;
      mediaContent += `\\includegraphics[width=0.4\\textwidth]{${image.url}}\n`;
      mediaContent += `\\end{flushright}\n`;
    } else if (item.type === 'tikz') {
      const tikz = item.data;
      mediaContent += `\n\\begin{flushright}\n`;
      mediaContent += `\\begin{tikzpicture}[scale=0.8]\n`;
      mediaContent += `${tikz.code}\n`;
      mediaContent += `\\end{tikzpicture}\n`;
      mediaContent += `\\end{flushright}\n`;
    }
  } else if (mediaCount >= 2 && mediaCount <= 3) {
    // 2-3张图片：放在同一行居中
    mediaContent += `\n\\begin{center}\n`;
    
    mediaItems.forEach((item, index) => {
      if (item.type === 'image') {
        const image = item.data;
        mediaContent += `\\includegraphics[width=0.3\\textwidth]{${image.url}}`;
        if (index < mediaItems.length - 1) {
          mediaContent += `\\quad`; // 添加间距
        }
      } else if (item.type === 'tikz') {
        const tikz = item.data;
        mediaContent += `\\begin{tikzpicture}[scale=0.6]\n`;
        mediaContent += `${tikz.code}\n`;
        mediaContent += `\\end{tikzpicture}`;
        if (index < mediaItems.length - 1) {
          mediaContent += `\\quad`; // 添加间距
        }
      }
    });
    
    mediaContent += `\n\\end{center}\n`;
  } else {
    // 超过3张图片：使用原来的居中布局
    mediaItems.forEach((item) => {
      if (item.type === 'image') {
        const image = item.data;
        mediaContent += `\n\\begin{center}\n`;
        mediaContent += `\\includegraphics[width=0.8\\textwidth]{${image.url}}\n`;
        mediaContent += `\\end{center}\n`;
      } else if (item.type === 'tikz') {
        const tikz = item.data;
        mediaContent += `\n\\begin{center}\n`;
        mediaContent += `\\begin{tikzpicture}\n`;
        mediaContent += `${tikz.code}\n`;
        mediaContent += `\\end{tikzpicture}\n`;
        mediaContent += `\\end{center}\n`;
      }
    });
  }
  
  return mediaContent;
};

export const convertQuestionToLaTeX = (question: Question, config: CopyConfig): string => {
  let latex = '';
  
  // 处理题目内容
  let content = question.content.stem || '';
  
  if (config.mode === 'mareate') {
    // Mareate模式：使用problem环境
    if (question.type === 'choice' || question.type === 'multiple-choice') {
      // 选择题：将\choice转换为\dotfill （\qquad \qquad）
      content = content.replace(/\\choice/g, '\\dotfill （\\qquad \\qquad）');
      
      // 添加难度标记（放在\item开头）
      const difficultyMark = getDifficultyMark(question.difficulty || 3, question.source);
      latex += `\\item ${difficultyMark}${content}\n`;
      
      // 添加图片和TikZ
      latex += processQuestionMedia(question);
      
      // 添加选项
      if (question.content.options && question.content.options.length > 0) {
        latex += `\\begin{tasks}(4)\n`;
        
        question.content.options.forEach((option) => {
          latex += `  \\task ${option.text}\n`;
        });
        
        latex += `\\end{tasks}\n`;
      }
    } else if (question.type === 'fill') {
      // 填空题：将\fill转换为LaTeX原生下划线
      content = content.replace(/\\fill/g, '\\underline{\\hspace{3cm}}');
      // 添加难度标记（放在\item开头）
      const difficultyMark = getDifficultyMark(question.difficulty || 3, question.source);
      latex += `\\item ${difficultyMark}${content}\n`;
      
      // 添加图片和TikZ
      latex += processQuestionMedia(question);
    } else if (question.type === 'solution') {
      // 解答题：处理\subp和\subsubp标记
      // 先处理\subsubp（小小问）
      content = content.replace(/\\subsubp/g, '\\begin{subsubproblem}\\item');
      
      // 再处理\subp（小问）
      content = content.replace(/\\subp/g, '\\begin{subproblem}\\item');
      
      // 处理环境闭合 - 先处理subsubproblem
      content = content.replace(/(\\begin\{subsubproblem\}\\item[^}]*?)(?=\\begin\{subsubproblem\}|\\begin\{subproblem\}|$)/g, '$1\\end{subsubproblem}');
      
      // 再处理subproblem
      content = content.replace(/(\\begin\{subproblem\}\\item[^}]*?)(?=\\begin\{subproblem\}|$)/g, '$1\\end{subproblem}');
      
      // 添加难度标记（放在\item开头）
      const difficultyMark = getDifficultyMark(question.difficulty || 3, question.source);
      latex += `\\item ${difficultyMark}${content}\n`;
      
      // 添加图片和TikZ
      latex += processQuestionMedia(question);
    } else {
      // 其他类型题目
      // 添加难度标记（放在\item开头）
      const difficultyMark = getDifficultyMark(question.difficulty || 3, question.source);
      latex += `\\item ${difficultyMark}${content}\n`;
      
      // 添加图片和TikZ
      latex += processQuestionMedia(question);
    }
    
    // 在Mareate模式下添加答案
    const answerContent = convertAnswerToLaTeX(question);
    if (answerContent) {
      latex += `\n\\begin{answer}\n${answerContent}\n\\end{answer}\n`;
    }
  } else {
    // 常规模式：使用enumerate环境
    if (question.type === 'choice' || question.type === 'multiple-choice') {
      // 选择题：将\choice转换为\dotfill （\qquad \qquad）
      content = content.replace(/\\choice/g, '\\dotfill （\\qquad \\qquad）');
      
      latex += `\\item ${content}\n`;
      
      // 添加图片和TikZ
      latex += processQuestionMedia(question);
      
      // 添加选项
      if (question.content.options && question.content.options.length > 0) {
        latex += `\\begin{tasks}(4)\n`;
        
        question.content.options.forEach((option) => {
          latex += `  \\task ${option.text}\n`;
        });
        
        latex += `\\end{tasks}\n`;
      }
    } else if (question.type === 'fill') {
      // 填空题：使用LaTeX自带下划线
      content = content.replace(/\\fill/g, '\\underline{\\hspace{3cm}}');
      latex += `\\item ${content}\n`;
      
      // 添加图片和TikZ
      latex += processQuestionMedia(question);
    } else if (question.type === 'solution') {
      // 解答题：使用enumerate环境
      // 先处理\subsubp（小小问）
      content = content.replace(/\\subsubp/g, '\\begin{enumerate}[label=\\roman*)]\\item');
      
      // 再处理\subp（小问）
      content = content.replace(/\\subp/g, '\\begin{enumerate}[label=(\\arabic*)]\\item');
      
      // 处理环境闭合 - 先处理subsubproblem
      content = content.replace(/(\\begin\{enumerate\}\[label=\\roman\*\)\]\\item[^}]*?)(?=\\begin\{enumerate\}\[label=\\roman\*\)\]|\\begin\{enumerate\}\[label=\(\\arabic\*\)\]|$)/g, '$1\\end{enumerate}');
      
      // 再处理subproblem
      content = content.replace(/(\\begin\{enumerate\}\[label=\(\\arabic\*\)\]\\item[^}]*?)(?=\\begin\{enumerate\}\[label=\(\\arabic\*\)\]|$)/g, '$1\\end{enumerate}');
      
      latex += `\\item ${content}\n`;
      
      // 添加图片和TikZ
      latex += processQuestionMedia(question);
    } else {
      // 其他类型题目
      latex += `\\item ${content}\n`;
      
      // 添加图片和TikZ
      latex += processQuestionMedia(question);
    }
  }
  
  // 添加vspace
  const vspace = getVspaceForType(question.type, config);
  if (vspace) {
    latex += `${vspace}\n`;
  }
  
  return latex;
};

// 转换整个试卷为LaTeX
export const convertPaperToLaTeX = (paper: Paper, config: CopyConfig = defaultCopyConfig): string => {
  let latex = '';
  
  if (config.mode === 'mareate') {
    // Mareate模式：添加完整的文档环境
    latex += generateMareateDocumentEnvironment(config, paper.name);
  } else {
    // 常规模式：添加文档环境（仅启用时）
    latex += generateDocumentEnvironment(config);
  }
  
  paper.sections.forEach((section) => {
    if (section.items.length > 0) {
      if (config.mode === 'mareate') {
        // Mareate模式：使用problem环境
        latex += `\\begin{problem}[${section.title}]\n`;
        
        section.items.forEach((item) => {
          latex += convertQuestionToLaTeX(item.question, config);
        });
        
        latex += `\\end{problem}\n\n`;
      } else {
        // 常规模式：使用enumerate环境
        latex += `\\section{${section.title}}\n\n`;
        latex += `\\begin{enumerate}[label=\\textbf{\\arabic*}.]\n`;
        
        section.items.forEach((item) => {
          latex += convertQuestionToLaTeX(item.question, config);
        });
        
        latex += `\\end{enumerate}\n\n`;
      }
    }
  });
  
  if (config.mode === 'mareate') {
    // Mareate模式：添加文档结束
    latex += generateMareateDocumentEnd(config);
  } else {
    // 常规模式：添加文档结束（仅启用时）
    latex += generateDocumentEnd(config);
  }
  
  return latex;
};

// 复制到剪贴板
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('复制失败:', err);
    return false;
  }
};

// 生成Mareate模式的完整LaTeX文档环境
export const generateMareateDocumentEnvironment = (config: CopyConfig, paperTitle?: string): string => {
  if (config.mode !== 'mareate') {
    return '';
  }

  return `% ========================================
% Mareate LaTeX 练习卷
% 项目名称: ${paperTitle ? paperTitle.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_') : 'Mareate_Exercise'}
% ========================================

\\documentclass[UTF8,10pt]{article}

% 引入problemlab配置
\\input{problemlab}

\\title{\\textbf{${paperTitle || '综合复习练习'}}}
\\author{Department of Admin}
\\date{\\today}
\\cfoot{\\ 第 \\thepage 页(共 \\pageref{LastPage} 页)} 
\\lfoot{\\textbf{2025年MMS秋季讲义}} 
\\rfoot{\\textbf{Mareate 保留版权}} 

\\showanswers

\\begin{document}

\\textit{Course 2025}

\\vspace{8cm}

\\begin{center}

\\huge 

    \\textbf{2025MMS课程·课程讲义}

\\normalsize 

    本文件的课后习题会涉及题目出处，未提及习题出处的题目为原创题. 

    \\vspace{10.5cm}
\\end{center}

\\begin{flushleft}
    \\large 
    
    \\textbf{本练习题禁止外传，仅给参与课程的人提供. }

    \\textbf{@ 2025 Mareate}

    \\textit{编号：02-001}
\\end{flushleft}

\\newpage 

\\setcounter{page}{1}
\\maketitle 
\\pagestyle{fancy}
\\thispagestyle{fancy}
\\renewcommand{\\headrulewidth}{0pt}

`;
};

// 生成Mareate模式的文档结束
export const generateMareateDocumentEnd = (config: CopyConfig): string => {
  if (config.mode !== 'mareate') {
    return '';
  }

  return `\\end{document}`;
};


// 生成Overleaf项目URL（使用POST方法避免URL过长）
export const generateOverleafUrl = (): string => {
  // 直接返回Overleaf的docs页面，内容将通过POST方法提交
  return 'https://www.overleaf.com/docs';
};

// 生成problemlab.tex文件内容
const generateProblemlabTex = (): string => {
  return `% problemlab.tex
% 自定义问题环境包

% 加载所有必需的包
\\usepackage[paperwidth=21cm,paperheight=29.7cm,top=2.4cm,bottom=2.6cm,right=2cm,left=2cm]{geometry}
\\usepackage{amsmath}
\\usepackage{setspace}
\\usepackage{ctex}
\\usepackage{xeCJK}
\\usepackage{zhnumber}
\\usepackage{graphicx}
\\usepackage[hidelinks]{hyperref}
\\usepackage{booktabs}
\\usepackage{enumitem}
\\usepackage{soul}
\\usepackage{ulem}
\\usepackage{amssymb}
\\usepackage{tikz}
\\usepackage{xcolor}
\\usepackage{pgfplots}
\\usepackage{float}
\\usepackage{subfigure}
\\usepackage{fancyhdr}
\\usepackage{lastpage}
\\usepackage{framed}
\\usepackage[thicklines]{cancel}
\\usepackage{tasks}
\\usepackage{underscore}
\\usepackage{multicol}
\\usepackage{environ} % 用于高级环境控制

% 设置段落格式
\\setlength{\\parindent}{4em}
\\addtolength{\\parskip}{5pt}

% 加载TikZ库
\\usetikzlibrary{arrows}
\\usetikzlibrary{calc}
\\usetikzlibrary{positioning} % 用于答案框定位

% 自定义颜色
\\definecolor{myyellow}{RGB}{232, 193, 28}
\\definecolor{myblue}{RGB}{87, 169, 203}
\\definecolor{myred}{RGB}{193, 73, 73}
\\definecolor{main}{rgb}{0.011765, 0.37647, 0.4470588}
\\definecolor{exercisecolor}{named}{main} % 使用main颜色作为习题颜色

% ================ 精炼配色方案 ================
% 主色调（精致蓝绿色系）
\\definecolor{main}{RGB}{0, 96, 110} % 更柔和的深蓝绿
\\definecolor{lightmain}{RGB}{220, 240, 240} % 极浅蓝绿 - 接近白色
\\definecolor{mediummain}{RGB}{160, 215, 215} % 中等蓝绿 - 更柔和
\\definecolor{darkmain}{RGB}{0, 70, 80} % 深蓝绿 - 降低饱和度

% 辅助色（低饱和度协调色）
\\definecolor{accent1}{RGB}{240, 190, 80} % 柔金色（用于基础）
\\definecolor{accent2}{RGB}{170, 140, 200} % 灰紫色（用于中等）
\\definecolor{accent3}{RGB}{210, 100, 90} % 陶土红（用于困难）

% 答案相关颜色
\\definecolor{answerbg}{RGB}{245, 255, 250} % 答案背景色（浅绿）
\\definecolor{answerborder}{RGB}{100, 200, 150} % 答案边框色（柔绿）
\\definecolor{answertext}{RGB}{20, 80, 60} % 答案文字色（深绿）

% 环境颜色定义
\\definecolor{exercisecolor}{named}{main}

% ================ 五级难度标记设计 ================
% 非常简单 - 无边框浅绿背景
\\newcommand{\\vs}[1][]{%
  \\tikz[baseline=(X.base)]\\node[fill=green!10, 
    inner xsep=6pt, inner ysep=2pt, rounded corners=3pt, 
    font=\\bfseries\\small\\sffamily\\color{darkmain}] (X) {非常简单%
    \\if\\relax\\detokenize{#1}\\relax\\else~{\\color{main!80}\\textbullet}~#1\\fi};%
}

% 简单 - 无边框柔金背景
\\newcommand{\\bs}[1][]{%
  \\tikz[baseline=(X.base)]\\node[fill=accent1!15, 
    inner xsep=6pt, inner ysep=2pt, rounded corners=3pt, 
    font=\\bfseries\\small\\sffamily\\color{darkmain}] (X) {简单%
    \\if\\relax\\detokenize{#1}\\relax\\else~{\\color{main!80}\\textbullet}~#1\\fi};%
}

% 中等 - 无边框灰紫背景
\\newcommand{\\mi}[1][]{%
  \\tikz[baseline=(X.base)]\\node[fill=accent2!15, 
    inner xsep=6pt, inner ysep=2pt, rounded corners=3pt, 
    font=\\bfseries\\small\\sffamily\\color{darkmain}] (X) {中等%
    \\if\\relax\\detokenize{#1}\\relax\\else~{\\color{main!80}\\textbullet}~#1\\fi};%
}

% 困难 - 无边框陶土红背景
\\newcommand{\\di}[1][]{%
  \\tikz[baseline=(X.base)]\\node[fill=accent3!15, 
    inner xsep=6pt, inner ysep=2pt, rounded corners=3pt, 
    font=\\bfseries\\small\\sffamily\\color{darkmain}] (X) {困难%
    \\if\\relax\\detokenize{#1}\\relax\\else~{\\color{main!80}\\textbullet}~#1\\fi};%
}

% 非常困难 - 无边框深红背景
\\newcommand{\\vd}[1][]{%
  \\tikz[baseline=(X.base)]\\node[fill=red!15, 
    inner xsep=6pt, inner ysep=2pt, rounded corners=3pt, 
    font=\\bfseries\\small\\sffamily\\color{darkmain}] (X) {非常困难%
    \\if\\relax\\detokenize{#1}\\relax\\else~{\\color{main!80}\\textbullet}~#1\\fi};%
}

% ================ 答案显示控制 ================
\\newif\\ifshowanswers
\\showanswersfalse % 默认隐藏答案

% 用户命令：显示答案
\\newcommand{\\showanswers}{\\showanswerstrue}
% 用户命令：隐藏答案
\\newcommand{\\hideanswers}{\\showanswersfalse}

% ================ 协调配色答案环境设计 ================
\\usepackage{mdframed} % 支持跨页的分割框
\\usepackage{fontawesome5} % 使用图标

% 重新定义答案相关颜色（与主蓝绿色调协调）
\\definecolor{answerbg}{RGB}{240, 248, 255} % 极浅蓝背景
\\definecolor{answerborder}{RGB}{70, 140, 180} % 蓝灰色边框
\\definecolor{answertitlebg}{RGB}{0, 96, 110} % 主色调深蓝绿
\\definecolor{answertext}{RGB}{30, 60, 70} % 深蓝灰文字

% 答案框样式
\\mdfdefinestyle{answerstyle}{%
    linewidth=0.5pt,
    linecolor=answerborder,
    backgroundcolor=answerbg,
    roundcorner=8pt,
    innerleftmargin=12pt,
    innerrightmargin=12pt,
    innertopmargin=8pt,
    innerbottommargin=12pt,
    skipabove=10pt,
    skipbelow=10pt,
    frametitle={},
    frametitleaboveskip=0pt,
    frametitlebelowskip=0pt,
    frametitlerule=true,
    frametitlerulewidth=1.2pt,
    frametitlerulecolor=answertitlebg,
    frametitlebackgroundcolor=answertitlebg,
    frametitlefont=\\bfseries\\color{white}\\small\\sffamily,
    frametitlealignment=\\raggedright,
    shadow=false,
    shadowcolor=gray!10,
    leftmargin=0pt,
    rightmargin=0pt
}

% 答案环境
\\NewEnviron{answer}[1][]{%
  \\ifshowanswers%
    \\begin{mdframed}[style=answerstyle, frametitle={\\faLightbulb\\  解答}]
      \\if\\relax\\detokenize{#1}\\relax\\else%
        \\quad\\textcolor{answertitlebg!80!white}{\\textbf{【#1】}}%
      \\fi%
      \\par\\vspace{5pt}
      \\BODY
      \\par\\vspace{3pt}
      \\hfill\\small\\color{answerborder}\\faCheckCircle\\ 解答完成
    \\end{mdframed}
  \\fi%
}

% 行距设置
\\setstretch{1.5}

% 题目计数器
\\newcounter{questionnum}
\\setcounter{questionnum}{0}
\\newcommand{\\chinesequestionnum}{\\chinese{questionnum}}

% 问题环境计数器
\\newcounter{problemcounter}
\\newcounter{subproblemcounter}[problemcounter]
\\newcounter{subsubproblemcounter}[subproblemcounter]

% 自动分栏判断变量
\\newlength{\\itemwd}
\\newif\\ifmulticol

% 下划线命令
\\newcommand{\\underlines}{{\\color{mediummain}\\underline{\\hspace{7em}}}}

% 设置tasks环境样式
\\settasks{label={\\Alph*. }}

% ================== 主要环境定义 ==================
% Problem 环境 - 增加左边距和序号缩进
\\newenvironment{problem}[1][]{%
  \\refstepcounter{problemcounter}%
  {\\bfseries\\Large\\color{exercisecolor}%
  题目~\\theproblemcounter%
  \\if\\relax\\detokenize{#1}\\relax\\else~：#1\\fi}%
  \\quad%
  \\vspace{2mm}%
  \\begin{enumerate}[leftmargin=65pt,
    label={\\colorbox{exercisecolor!15}{\\makebox[2.2em][c]{\\color{exercisecolor}\\textbf{\\arabic*.}}}},
    itemsep=0.8ex,
    parsep=0pt,
    labelsep=0.8em,
    topsep=0.5ex
  ]
}{%
  \\end{enumerate}%
  \\par\\vspace{3mm}%
}

% Subproblem 环境（自动分栏）
\\newenvironment{subproblem}{%
  \\refstepcounter{subproblemcounter}%
  \\vspace{0.8ex}%
  \\setbox0=\\vbox\\bgroup
  \\begin{enumerate}[
    label={\\colorbox{exercisecolor!8}{\\makebox[1.8em][c]{\\color{exercisecolor}\\textbf{(\\alph*)}}}},
    itemsep=0.6ex,
    parsep=0pt,
    labelsep=0.8em
  ]
}{%
  \\end{enumerate}%
  \\egroup
  \\setlength{\\itemwd}{\\wd0}%
  \\ifdim\\itemwd<0.3\\linewidth
    \\begin{multicols}{3}%
    \\unvbox0
    \\end{multicols}%
  \\else
    \\unvbox0
  \\fi
  \\vspace{0.8ex}%
}

% Subsubproblem 环境（三级问题）
\\newenvironment{subsubproblem}{%
  \\refstepcounter{subsubproblemcounter}%
  \\vspace{0.5ex}%
  \\begin{enumerate}[
    label={\\colorbox{exercisecolor!5}{\\makebox[1.5em][c]{\\color{exercisecolor!80}\\textbf{\\roman*.}}}},
    leftmargin=3.5em,   % 更大的左边距
    itemsep=0.4ex,
    parsep=0pt,
    labelsep=0.8em
  ]
}{%
  \\end{enumerate}%
  \\vspace{0.5ex}%
}

% 保留原有的question环境
\\newenvironment{question}[1]{%
  \\stepcounter{questionnum}%
  \\par\\bigskip%
  {\\Large \\textbf{\\color{orange} 题目\\chinesequestionnum：#1}}\\par%
  \\medskip%
}{\\par\\bigskip}

% ================ 答题区域命令 ================
% 答题框样式
\\mdfdefinestyle{answerboxstyle}{%
    linewidth=0.7pt,
    linecolor=gray!60,
    backgroundcolor=white,
    roundcorner=4pt,
    innerleftmargin=10pt,
    innerrightmargin=10pt,
    innertopmargin=12pt,    % 顶部额外空间
    innerbottommargin=8pt,
    skipabove=8pt,
    skipbelow=8pt,
    frametitle={},
    frametitleaboveskip=0pt,
    frametitlebelowskip=0pt,
    frametitlerule=false,
    shadow=false,
    leftmargin=0pt,
    rightmargin=0pt,
    splitbottomskip=0pt,    % 防止跨页时底部留白
    splittopskip=0pt,       % 防止跨页时顶部留白
    nobreak=true,           % 禁止跨页
    needspace=2\\baselineskip % 确保有足够空间，否则换页
}

% 答题区域命令
\\newcommand{\\answerarea}[1]{%
  \\ifshowanswers\\else%
    \\par\\vspace{1em}% 与上方内容增加垂直间距
    \\begin{mdframed}[style=answerboxstyle]
      \\setlength{\\parindent}{0pt}%
      % 第一行有额外空间
      \\vspace*{1.5em}%
      \\textcolor{gray!40}{\\rule{\\linewidth}{0.5pt}}%
      \\par\\vspace{1.2em}% 行间间距
      
      % 其余行
      \\ifnum#1>1
        \\foreach \\n in {2,...,#1} {%
          \\textcolor{gray!40}{\\rule{\\linewidth}{0.5pt}}%
          \\par\\vspace{1.2em}%
        }%
      \\fi
    \\end{mdframed}%
    \\par\\vspace{1em}% 与下方内容增加垂直间距
  \\fi%
}

% 页眉页脚设置
\\pagestyle{fancy}
\\fancyhf{}
\\fancyhead[R]{\\small 2025 Viquard}
\\renewcommand{\\headrulewidth}{0.4pt}
\\renewcommand{\\footrulewidth}{0pt}
`;
};

// 生成简化的主LaTeX文档（Mareate模式）
const generateMareateMainDocument = (paper: Paper, config: CopyConfig): string => {
  let latex = '';
  
  // 添加文档环境
  latex += generateMareateDocumentEnvironment(config, paper.name);
  
  paper.sections.forEach((section) => {
    if (section.items.length > 0) {
      // Mareate模式：使用problem环境
      latex += `\\begin{problem}[${section.title}]\n`;
      
      section.items.forEach((item) => {
        latex += convertQuestionToLaTeX(item.question, config);
      });
      
      latex += `\\end{problem}\n\n`;
    }
  });
  
  // 添加文档结束
  latex += generateMareateDocumentEnd(config);
  
  return latex;
};

// 打开Overleaf项目
export const openInOverleaf = (paper: Paper, config: CopyConfig = defaultCopyConfig): void => {
  if (config.mode === 'mareate') {
    // Mareate模式：使用多个文件的方式
    const mainContent = generateMareateMainDocument(paper, config);
    const problemlabContent = generateProblemlabTex();
    
    // 创建隐藏的表单来POST数据到Overleaf
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = 'https://www.overleaf.com/docs';
    form.target = '_blank';
    
    // 添加主文件
    const mainInput = document.createElement('input');
    mainInput.type = 'hidden';
    mainInput.name = 'snip_uri[]';
    mainInput.value = `data:application/x-tex;base64,${btoa(unescape(encodeURIComponent(mainContent)))}`;
    form.appendChild(mainInput);
    
    // 添加problemlab.tex文件
    const problemlabInput = document.createElement('input');
    problemlabInput.type = 'hidden';
    problemlabInput.name = 'snip_uri[]';
    problemlabInput.value = `data:application/x-tex;base64,${btoa(unescape(encodeURIComponent(problemlabContent)))}`;
    form.appendChild(problemlabInput);
    
    // 添加文件名
    const mainNameInput = document.createElement('input');
    mainNameInput.type = 'hidden';
    mainNameInput.name = 'snip_name[]';
    mainNameInput.value = 'main.tex';
    form.appendChild(mainNameInput);
    
    const problemlabNameInput = document.createElement('input');
    problemlabNameInput.type = 'hidden';
    problemlabNameInput.name = 'snip_name[]';
    problemlabNameInput.value = 'problemlab.tex';
    form.appendChild(problemlabNameInput);
    
    // 添加引擎参数
    const engineInput = document.createElement('input');
    engineInput.type = 'hidden';
    engineInput.name = 'engine';
    engineInput.value = 'xelatex';
    form.appendChild(engineInput);
    
    // 添加到页面并提交
    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
  } else {
    // 常规模式：使用单个文件
    const latexContent = convertPaperToLaTeX(paper, config);
    
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = 'https://www.overleaf.com/docs';
    form.target = '_blank';
    
    const snipInput = document.createElement('input');
    snipInput.type = 'hidden';
    snipInput.name = 'snip';
    snipInput.value = latexContent;
    form.appendChild(snipInput);
    
    const engineInput = document.createElement('input');
    engineInput.type = 'hidden';
    engineInput.name = 'engine';
    engineInput.value = 'xelatex';
    form.appendChild(engineInput);
    
    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
  }
};

// 生成选择性复制的LaTeX内容
export const generateSelectiveCopyLaTeX = (
  questions: Question[],
  config: { showDifficulty: boolean; showSource: boolean; showAnswer: boolean }
): string => {
  let latex = '';
  
  questions.forEach((question, index) => {
    // 添加题目编号
    latex += `\\item `;
    
    // 添加难度标签和出处（如果启用）
    if (config.showDifficulty && question.difficulty) {
      const source = config.showSource && question.source ? question.source : undefined;
      const difficultyMark = getDifficultyMark(question.difficulty, source);
      latex += `${difficultyMark} `;
    } else if (config.showSource && question.source) {
      latex += `[${question.source}] `;
    }
    
    // 处理题目内容
    let questionContent = question.content.stem;
    
    // 处理选择题的选项
    if (question.type === 'choice' && question.content.options) {
      // 替换\choice为\dotfill
      questionContent = questionContent.replace(/\\choice/g, '\\dotfill （\\qquad \\qquad）');
      
      // 添加选项
      questionContent += '\n\\begin{tasks}(4)\n';
      question.content.options.forEach(option => {
        questionContent += `\\task ${option.text}\n`;
      });
      questionContent += '\\end{tasks}';
    }
    
    // 处理填空题
    if (question.type === 'fill') {
      // 替换\underlines为\underline
      questionContent = questionContent.replace(/\\underlines/g, '\\underline{\\hspace{3cm}}');
    }
    
    // 处理解答题的小问
    if (question.type === 'solution') {
      // 替换\subp为\begin{enumerate}[label=(\arabic*)]
      questionContent = questionContent.replace(/\\subp/g, '\\begin{enumerate}[label=(\\arabic*)]\n\\item');
      questionContent = questionContent.replace(/\\subsubp/g, '\\begin{enumerate}[label=\\roman*)]\n\\item');
      
      // 处理结束标签
      questionContent = questionContent.replace(/\\end{subp}/g, '\\end{enumerate}');
      questionContent = questionContent.replace(/\\end{subsubp}/g, '\\end{enumerate}');
    }
    
    // 处理图片和TikZ
    const mediaContent = processQuestionMedia(question);
    questionContent += mediaContent;
    
    latex += questionContent;
    
    // 添加答案（如果启用）
    if (config.showAnswer && question.content.solution) {
      latex += '\n\n\\begin{answer}\n';
      let solutionContent = question.content.solution;
      
      // 处理解答题中的子问题
      if (question.type === 'solution') {
        solutionContent = solutionContent.replace(/\\subp/g, '\\begin{subproblem}\n\\item');
        solutionContent = solutionContent.replace(/\\subsubp/g, '\\begin{subsubproblem}\n\\item');
        solutionContent = solutionContent.replace(/\\end{subp}/g, '\\end{subproblem}');
        solutionContent = solutionContent.replace(/\\end{subsubp}/g, '\\end{subsubproblem}');
      }
      
      latex += solutionContent;
      latex += '\n\\end{answer}';
    }
    
    // 添加换行（除了最后一道题）
    if (index < questions.length - 1) {
      latex += '\n\n';
    }
  });
  
  return latex;
};