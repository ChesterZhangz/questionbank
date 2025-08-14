
import type { Question } from '../../types';

export interface ScreenshotConfig {
  showAnswer: boolean;
  showSolution: boolean;
  showBankName: boolean;
  showQuestionNumber: boolean;
  showCreateTime: boolean;
  showSource: boolean;
  showTags: boolean;
  showDifficulty: boolean;
  showCategory: boolean;
  showKnowledgeTags: boolean;
  width: number;
  padding: number;
  fontFamily: string;
}

interface QuestionScreenshotToolProps {
  question: Question;
  bid: string;
  bankName?: string;
  config: ScreenshotConfig;
  onScreenshot: (canvas: HTMLCanvasElement) => void;
}

// 静态方法用于生成截图
export const generateScreenshot = async (props: QuestionScreenshotToolProps) => {
  const { question, bankName, config, onScreenshot } = props;
  
  const formatDate = (date: string | Date) => {
    const d = new Date(date);
    const now = new Date();
    
    // 重置时间为00:00:00，只比较日期
    const dDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const nowDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const diffTime = nowDate.getTime() - dDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return '今天';
    if (diffDays === 1) return '昨天';
    if (diffDays === 2) return '前天';
    if (diffDays > 0 && diffDays <= 7) return `${diffDays}天前`;
    if (diffDays > 0 && diffDays <= 30) return `${Math.floor(diffDays / 7)}周前`;
    if (diffDays > 0 && diffDays <= 365) return `${Math.floor(diffDays / 30)}个月前`;
    
    return d.toLocaleDateString('zh-CN', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit' 
    });
  };

  const getQuestionTypeText = (type: string) => {
    switch (type) {
      case 'choice': return '选择题';
      case 'multiple-choice': return '多选题';
      case 'fill': return '填空题';
      case 'solution': return '解答题';
      default: return '未知';
    }
  };

  const getQuestionTypeColor = (type: string) => {
    switch (type) {
      case 'choice': return '#3b82f6';
      case 'multiple-choice': return '#8b5cf6';
      case 'fill': return '#10b981';
      case 'solution': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const getDifficultyText = (difficulty: number) => {
    switch (difficulty) {
      case 1: return '简单';
      case 2: return '较易';
      case 3: return '中等';
      case 4: return '较难';
      case 5: return '困难';
      default: return '未知';
    }
  };

  const getDifficultyColor = (difficulty: number) => {
    switch (difficulty) {
      case 1: return '#10b981';
      case 2: return '#f59e0b';
      case 3: return '#f97316';
      case 4: return '#ef4444';
      case 5: return '#8b5cf6';
      default: return '#6b7280';
    }
  };

  const renderContentWithCache = (content: string) => {
    // 使用现有的LaTeX渲染库
    try {
      let processed = content;
      
      // 不在预处理阶段处理特殊标签，让KaTeX处理它们
      // 这样可以避免嵌套标签的问题
      
      // 处理块级公式
      processed = processed.replace(/\$\$([\s\S]*?)\$\$/g, (_, latex) => {
        return `<div class="latex-math-block" data-latex="${encodeURIComponent(latex)}">${latex}</div>`;
      });

      // 处理行内公式
      processed = processed.replace(/\$([^$]*?(?:\n[^$\n]*?)*?)\$/g, (_, latex) => {
        return `<span class="latex-math-inline" data-latex="${encodeURIComponent(latex)}">${latex}</span>`;
      });
      
      // 单独处理特殊标签（在LaTeX公式外部的）
      processed = processed.replace(/\\subp\{([^{}]*(?:\{[^{}]*\}[^{}]*)*)\}/g, (_, content) => {
        return `<span style="font-style: italic; font-weight: 600; color: #4b5563;">${content}</span>`;
      });
      
      processed = processed.replace(/\\fill\{([^{}]*(?:\{[^{}]*\}[^{}]*)*)\}/g, (_, content) => {
        return `<span style="text-decoration: underline; border-bottom: 1px dashed #6b7280; padding-bottom: 2px;">${content}</span>`;
      });
      
      processed = processed.replace(/\\choice\{([^{}]*(?:\{[^{}]*\}[^{}]*)*)\}/g, (_, content) => {
        return `<span style="font-weight: bold; background-color: #f3f4f6; padding: 0 4px; border-radius: 4px;">${content}</span>`;
      });

      return processed;
    } catch (error) {
      console.warn('LaTeX处理失败，使用原始内容:', error);
      return content;
    }
  };

      try {
      // 使用更高级的截图方案
      const html2canvas = (await import('html2canvas')).default;
      
      // 导入KaTeX库并等待字体加载完成
      try {
        // 动态导入KaTeX
        const katex = (await import('katex')).default;
        
        // 创建一个函数来处理LaTeX渲染
        const renderLaTeX = (container: HTMLElement): void => {
          // 查找所有标记的LaTeX元素
          const inlineElements = container.querySelectorAll('.latex-math-inline');
          const blockElements = container.querySelectorAll('.latex-math-block');
          
          // 定义通用的KaTeX配置
          const katexConfig = {
            throwOnError: false,
            output: "html" as const, // 使用类型断言
            trust: true as const, // 允许所有命令
            strict: false as const, // 不要严格模式
            macros: {
              // 定义特殊命令的宏
              "\\subp": "\\textit{\\textbf{#1}}",
              "\\fill": "\\underline{#1}",
              "\\choice": "\\textbf{#1}"
            }
          };
          
          // 渲染行内公式
          inlineElements.forEach((element: Element) => {
            try {
              const latex = decodeURIComponent(element.getAttribute('data-latex') || '');
              
              // 处理特殊的LaTeX命令
              let processedLatex = latex;
              // 修复常见的LaTeX命令问题
              processedLatex = processedLatex.replace(/\\mathbb\{([A-Z]+)\}/g, '\\mathbb{$1}');
              processedLatex = processedLatex.replace(/\\in(?!\w)/g, '\\in ');
              
              element.innerHTML = katex.renderToString(processedLatex, { 
                ...katexConfig,
                displayMode: false
              });
            } catch (error) {
              console.warn('行内LaTeX渲染失败:', error, element.getAttribute('data-latex'));
              // 失败时保留原始文本
              element.textContent = decodeURIComponent(element.getAttribute('data-latex') || '');
            }
          });
          
          // 渲染块级公式
          blockElements.forEach((element: Element) => {
            try {
              const latex = decodeURIComponent(element.getAttribute('data-latex') || '');
              
              // 处理特殊的LaTeX命令
              let processedLatex = latex;
              // 修复常见的LaTeX命令问题
              processedLatex = processedLatex.replace(/\\mathbb\{([A-Z]+)\}/g, '\\mathbb{$1}');
              processedLatex = processedLatex.replace(/\\in(?!\w)/g, '\\in ');
              
              element.innerHTML = katex.renderToString(processedLatex, { 
                ...katexConfig,
                displayMode: true
              });
            } catch (error) {
              console.warn('块级LaTeX渲染失败:', error, element.getAttribute('data-latex'));
              // 失败时保留原始文本
              element.textContent = decodeURIComponent(element.getAttribute('data-latex') || '');
            }
          });
        };
        
        // 保存renderLaTeX函数以便后续使用
        (window as any)._renderLaTeX = renderLaTeX;
        
        // 等待KaTeX字体加载完成
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        console.warn('KaTeX加载失败:', error);
      }
    
    // 创建截图容器
    const screenshotContainer = document.createElement('div');
    screenshotContainer.style.position = 'absolute';
    screenshotContainer.style.left = '-9999px';
    screenshotContainer.style.top = '0';
    screenshotContainer.style.width = `${config.width}px`;
    screenshotContainer.style.backgroundColor = '#ffffff';
    screenshotContainer.style.padding = `${config.padding}px`;
    screenshotContainer.style.borderRadius = '16px';
    screenshotContainer.style.boxShadow = '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)';
    screenshotContainer.style.fontFamily = config.fontFamily;
    screenshotContainer.style.border = '2px solid #f3f4f6';
    
    // 添加KaTeX CSS样式
    const katexCSS = document.createElement('style');
    katexCSS.textContent = `
      .katex { font: normal 1.21em KaTeX_Main, 'Times New Roman', serif; line-height: 1.2; text-indent: 0; text-rendering: auto; }
      .katex * { -ms-high-contrast-adjust: none !important; border-color: currentColor; }
      .katex .katex-html { display: inline-block; }
      .katex .katex-html > .newline { display: block; }
      .katex .base { position: relative; white-space: nowrap; width: min-content; }
      .katex .strut { display: inline-block; }
      .katex .textbf { font-weight: bold; }
      .katex .textit { font-style: italic; }
      .katex .text { font-family: KaTeX_Main; }
      .katex .mathnormal { font-family: KaTeX_Math; font-style: normal; }
      .katex .mathit { font-family: KaTeX_Math; font-style: italic; }
      .katex .mathrm { font-style: normal; }
      .katex .mathbf { font-family: KaTeX_Main; font-weight: bold; }
      .katex .boldsymbol { font-family: KaTeX_Math; font-weight: bold; font-style: italic; }
      .katex .amsrm { font-family: KaTeX_AMS; }
      .katex .mathbb, .katex .textbb { font-family: KaTeX_AMS; }
      .katex .mathcal { font-family: KaTeX_Caligraphic; }
      .katex .mathfrak, .katex .textfrak { font-family: KaTeX_Fraktur; }
      .katex .mathtt { font-family: KaTeX_Typewriter; }
      .katex .mathscr, .katex .textscr { font-family: KaTeX_Script; }
      .katex .mathsf, .katex .textsf { font-family: KaTeX_SansSerif; }
      .katex .mathboldsf, .katex .textboldsf { font-family: KaTeX_SansSerif; font-weight: bold; }
      .katex .mathitsf, .katex .textitsf { font-family: KaTeX_SansSerif; font-style: italic; }
      .katex .mainrm { font-family: KaTeX_Main; font-style: normal; }
      .katex .vlist-t { display: inline-table; table-layout: fixed; border-collapse: collapse; }
      .katex .vlist-r { display: table-row; }
      .katex .vlist { display: table-cell; vertical-align: bottom; position: relative; }
      .katex .vlist > span { display: block; height: 0; position: relative; }
      .katex .vlist > span > span { display: inline-block; }
      .katex .vlist > span > .pstrut { overflow: hidden; width: 0; }
      .katex .msupsub { text-align: left; }
      .katex .mfrac > span > span { text-align: center; }
      .katex .mfrac .frac-line { display: inline-block; width: 100%; border-bottom-style: solid; }
      .katex .hdashline, .katex .hline, .katex .mhline, .katex .rule { border-bottom-style: solid; display: inline-block; }
    `;
    screenshotContainer.appendChild(katexCSS);
    
    // 创建截图内容
    const screenshotContent = document.createElement('div');
    screenshotContent.style.width = '100%';
    screenshotContent.style.minHeight = '600px';
    screenshotContent.style.display = 'flex';
    screenshotContent.style.flexDirection = 'column';
    screenshotContent.style.gap = '24px';
    
    // 1. 头部信息区域
    if (config.showQuestionNumber || config.showCreateTime) {
      const headerSection = document.createElement('div');
      headerSection.style.display = 'flex';
      headerSection.style.justifyContent = 'space-between';
      headerSection.style.alignItems = 'flex-start';
      headerSection.style.marginBottom = '20px';
      
      if (config.showQuestionNumber) {
        const questionNumber = document.createElement('div');
        questionNumber.style.fontSize = '14px';
        questionNumber.style.color = '#6b7280';
        questionNumber.style.fontWeight = '500';
        questionNumber.style.fontFamily = config.fontFamily;
        questionNumber.textContent = `题目编号: ${question.qid}`;
        headerSection.appendChild(questionNumber);
      }
      
      if (config.showCreateTime) {
        const createTime = document.createElement('div');
        createTime.style.fontSize = '14px';
        createTime.style.color = '#6b7280';
        createTime.style.fontWeight = '500';
        createTime.style.fontFamily = config.fontFamily;
        createTime.textContent = `创建时间: ${formatDate(question.createdAt)}`;
        headerSection.appendChild(createTime);
      }
      
      screenshotContent.appendChild(headerSection);
    }
    
    // 2. 标签区域
    if (config.showTags || config.showDifficulty || config.showCategory || config.showKnowledgeTags) {
      const tagsSection = document.createElement('div');
      tagsSection.style.display = 'flex';
      tagsSection.style.flexWrap = 'wrap';
      tagsSection.style.gap = '8px';
      tagsSection.style.marginBottom = '20px';
      
    if (config.showTags) {
            const typeTag = document.createElement('div');
            typeTag.style.padding = '0';
            typeTag.style.borderRadius = '6px';
            typeTag.style.fontSize = '11px';
            typeTag.style.fontWeight = '700';
            typeTag.style.color = '#ffffff';
            typeTag.style.backgroundColor = getQuestionTypeColor(question.type);
            typeTag.style.fontFamily = config.fontFamily;
            typeTag.style.display = 'inline-flex';
            typeTag.style.alignItems = 'center';
            typeTag.style.justifyContent = 'center';
            typeTag.style.minWidth = '60px';
            typeTag.style.height = '24px';
            typeTag.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
            typeTag.style.border = '1px solid rgba(255, 255, 255, 0.2)';
            typeTag.style.textTransform = 'uppercase';
            typeTag.style.letterSpacing = '0.5px';
            typeTag.textContent = getQuestionTypeText(question.type);
            tagsSection.appendChild(typeTag);
          }
      
      if (config.showDifficulty) {
        const difficultyTag = document.createElement('div');
        difficultyTag.style.padding = '0';
        difficultyTag.style.borderRadius = '6px';
        difficultyTag.style.fontSize = '11px';
        difficultyTag.style.fontWeight = '700';
        difficultyTag.style.color = '#ffffff';
        difficultyTag.style.backgroundColor = getDifficultyColor(question.difficulty);
        difficultyTag.style.fontFamily = config.fontFamily;
        difficultyTag.style.display = 'inline-flex';
        difficultyTag.style.alignItems = 'center';
        difficultyTag.style.justifyContent = 'center';
        difficultyTag.style.minWidth = '50px';
        difficultyTag.style.height = '24px';
        difficultyTag.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
        difficultyTag.style.border = '1px solid rgba(255, 255, 255, 0.2)';
        difficultyTag.style.textTransform = 'uppercase';
        difficultyTag.style.letterSpacing = '0.5px';
        difficultyTag.textContent = getDifficultyText(question.difficulty);
        tagsSection.appendChild(difficultyTag);
      }
      
                if (config.showCategory && question.category && typeof question.category === 'string') {
            const categories = question.category.split(',').map(cat => cat.trim());
            categories.forEach(category => {
              if (category) {
                const categoryTag = document.createElement('div');
                categoryTag.style.padding = '0 10px';
                categoryTag.style.borderRadius = '4px';
                categoryTag.style.fontSize = '10px';
                categoryTag.style.fontWeight = '600';
                categoryTag.style.color = '#6b7280';
                categoryTag.style.backgroundColor = '#f9fafb';
                categoryTag.style.border = '1px solid #e5e7eb';
                categoryTag.style.fontFamily = config.fontFamily;
                categoryTag.style.display = 'inline-flex';
                categoryTag.style.alignItems = 'center';
                categoryTag.style.justifyContent = 'center';
                categoryTag.style.minWidth = '40px';
                categoryTag.style.height = '22px';
                categoryTag.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)';
                categoryTag.style.textTransform = 'uppercase';
                categoryTag.style.letterSpacing = '0.3px';
                categoryTag.textContent = category;
                tagsSection.appendChild(categoryTag);
              }
            });
          }
      
      if (config.showKnowledgeTags && question.tags && question.tags.length > 0) {
        question.tags.forEach(tag => {
          if (tag) {
            const tagElement = document.createElement('div');
            tagElement.style.padding = '0 8px';
            tagElement.style.borderRadius = '3px';
            tagElement.style.fontSize = '9px';
            tagElement.style.fontWeight = '600';
            tagElement.style.color = '#1e40af';
            tagElement.style.backgroundColor = '#eff6ff';
            tagElement.style.border = '1px solid #bfdbfe';
            tagElement.style.fontFamily = config.fontFamily;
            tagElement.style.display = 'inline-flex';
            tagElement.style.alignItems = 'center';
            tagElement.style.justifyContent = 'center';
            tagElement.style.minWidth = '30px';
            tagElement.style.height = '20px';
            tagElement.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)';
            tagElement.style.textTransform = 'uppercase';
            tagElement.style.letterSpacing = '0.2px';
            tagElement.textContent = tag;
            tagsSection.appendChild(tagElement);
          }
        });
      }
      
      screenshotContent.appendChild(tagsSection);
    }
    
    // 3. 题目内容区域
    const contentSection = document.createElement('div');
    contentSection.style.marginBottom = '24px';
    
    const stemTitle = document.createElement('h3');
    stemTitle.style.fontSize = '16px';
    stemTitle.style.fontWeight = '600';
    stemTitle.style.color = '#111827';
    stemTitle.style.marginBottom = '12px';
    stemTitle.style.fontFamily = config.fontFamily;
    stemTitle.textContent = '题目内容:';
    
    const stemContent = document.createElement('div');
    stemContent.style.fontSize = '15px';
    stemContent.style.lineHeight = '1.6';
    stemContent.style.color = '#374151';
    stemContent.style.backgroundColor = '#f9fafb';
    stemContent.style.padding = '16px';
    stemContent.style.borderRadius = '8px';
    stemContent.style.border = '1px solid #e5e7eb';
    stemContent.style.overflow = 'hidden';
    stemContent.style.wordWrap = 'break-word';
    stemContent.style.whiteSpace = 'pre-wrap';
    stemContent.style.fontFamily = config.fontFamily;
    stemContent.style.textAlign = 'left';
    stemContent.innerHTML = renderContentWithCache(question.content.stem);
    
    contentSection.appendChild(stemTitle);
    contentSection.appendChild(stemContent);
    screenshotContent.appendChild(contentSection);
    
    // 4. 选项区域
    if (question.content.options && question.content.options.length > 0) {
      const optionsSection = document.createElement('div');
      optionsSection.style.marginBottom = '24px';
      
      const optionsTitle = document.createElement('h4');
      optionsTitle.style.fontSize = '15px';
      optionsTitle.style.fontWeight = '600';
      optionsTitle.style.color = '#111827';
      optionsTitle.style.marginBottom = '12px';
      optionsTitle.style.fontFamily = config.fontFamily;
      optionsTitle.textContent = '选项:';
      
      const optionsList = document.createElement('div');
      optionsList.style.display = 'flex';
      optionsList.style.flexDirection = 'column';
      optionsList.style.gap = '8px';
      
      question.content.options.forEach((option, optionIndex) => {
        const optionItem = document.createElement('div');
        optionItem.style.display = 'flex';
        optionItem.style.alignItems = 'flex-start';
        optionItem.style.gap = '8px';
        optionItem.style.padding = '8px 12px';
        optionItem.style.backgroundColor = '#ffffff';
        optionItem.style.border = '1px solid #e5e7eb';
        optionItem.style.borderRadius = '6px';
        
        const optionLabel = document.createElement('span');
        optionLabel.style.fontWeight = '600';
        optionLabel.style.color = '#3b82f6';
        optionLabel.style.minWidth = '20px';
        optionLabel.textContent = String.fromCharCode(65 + optionIndex) + '.';
        
        const optionContent = document.createElement('span');
        optionContent.style.fontSize = '14px';
        optionContent.style.color = '#374151';
        optionContent.style.lineHeight = '1.5';
        optionContent.style.overflow = 'hidden';
        optionContent.style.wordWrap = 'break-word';
        optionContent.style.whiteSpace = 'pre-wrap';
        optionContent.style.fontFamily = config.fontFamily;
        optionContent.style.textAlign = 'left';
                  optionContent.innerHTML = renderContentWithCache(option.text);
        
        optionItem.appendChild(optionLabel);
        optionItem.appendChild(optionContent);
        optionsList.appendChild(optionItem);
      });
      
      optionsSection.appendChild(optionsTitle);
      optionsSection.appendChild(optionsList);
      screenshotContent.appendChild(optionsSection);
    }
    
    // 5. 答案区域
    if (config.showAnswer && question.content.answer) {
      const answerSection = document.createElement('div');
      answerSection.style.marginBottom = '24px';
      
      const answerTitle = document.createElement('h4');
      answerTitle.style.fontSize = '15px';
      answerTitle.style.fontWeight = '600';
      answerTitle.style.color = '#111827';
      answerTitle.style.marginBottom = '12px';
      answerTitle.style.fontFamily = config.fontFamily;
      answerTitle.textContent = '答案:';
      
      const answerContent = document.createElement('div');
      answerContent.style.fontSize = '14px';
      answerContent.style.lineHeight = '1.6';
      answerContent.style.color = '#059669';
      answerContent.style.backgroundColor = '#ecfdf5';
      answerContent.style.padding = '12px 16px';
      answerContent.style.borderRadius = '8px';
      answerContent.style.border = '1px solid #a7f3d0';
      answerContent.style.fontWeight = '500';
      answerContent.style.fontFamily = config.fontFamily;
      answerContent.innerHTML = renderContentWithCache(question.content.answer);
      
      answerSection.appendChild(answerTitle);
      answerSection.appendChild(answerContent);
      screenshotContent.appendChild(answerSection);
    }
    
    // 6. 解析区域
    if (config.showSolution && question.content.solution) {
      const solutionSection = document.createElement('div');
      solutionSection.style.marginBottom = '24px';
      
      const solutionTitle = document.createElement('h4');
      solutionTitle.style.fontSize = '15px';
      solutionTitle.style.fontWeight = '600';
      solutionTitle.style.color = '#111827';
      solutionTitle.style.marginBottom = '12px';
      solutionTitle.style.fontFamily = config.fontFamily;
      solutionTitle.textContent = '解析:';
      
      const solutionContent = document.createElement('div');
      solutionContent.style.fontSize = '14px';
      solutionContent.style.lineHeight = '1.6';
      solutionContent.style.color = '#374151';
      solutionContent.style.backgroundColor = '#fef3c7';
      solutionContent.style.padding = '16px';
      solutionContent.style.borderRadius = '8px';
      solutionContent.style.border = '1px solid #fde68a';
      solutionContent.style.fontFamily = config.fontFamily;
      solutionContent.innerHTML = renderContentWithCache(question.content.solution);
      
      solutionSection.appendChild(solutionTitle);
      solutionSection.appendChild(solutionContent);
      screenshotContent.appendChild(solutionSection);
    }
    
    // 7. 来源信息区域
    if (config.showSource && question.source) {
      const sourceSection = document.createElement('div');
      sourceSection.style.marginBottom = '24px';
      
      const sourceTitle = document.createElement('h4');
      sourceTitle.style.fontSize = '15px';
      sourceTitle.style.fontWeight = '600';
      sourceTitle.style.color = '#111827';
      sourceTitle.style.marginBottom = '8px';
      sourceTitle.style.fontFamily = config.fontFamily;
      sourceTitle.textContent = '题目来源:';
      
      const sourceContent = document.createElement('div');
      sourceContent.style.fontSize = '14px';
      sourceContent.style.color = '#6b7280';
      sourceContent.style.padding = '8px 12px';
      sourceContent.style.backgroundColor = '#f8fafc';
      sourceContent.style.border = '1px solid #e2e8f0';
      sourceContent.style.borderRadius = '6px';
      sourceContent.style.fontFamily = config.fontFamily;
      sourceContent.textContent = question.source;
      
      sourceSection.appendChild(sourceTitle);
      sourceSection.appendChild(sourceContent);
      screenshotContent.appendChild(sourceSection);
    }
    
    // 8. 题库信息
    if (config.showBankName && bankName) {
      const bankInfoSection = document.createElement('div');
      bankInfoSection.style.marginBottom = '24px';
      
      const bankTitle = document.createElement('h4');
      bankTitle.style.fontSize = '15px';
      bankTitle.style.fontWeight = '600';
      bankTitle.style.color = '#111827';
      bankTitle.style.marginBottom = '8px';
      bankTitle.style.fontFamily = config.fontFamily;
      bankTitle.textContent = '所属题库:';
      
      const bankContent = document.createElement('div');
      bankContent.style.fontSize = '14px';
      bankContent.style.color = '#6b7280';
      bankContent.style.padding = '8px 12px';
      bankContent.style.backgroundColor = '#f8fafc';
      bankContent.style.border = '1px solid #e2e8f0';
      bankContent.style.borderRadius = '6px';
      bankContent.style.fontFamily = config.fontFamily;
      bankContent.textContent = bankName;
      
      bankInfoSection.appendChild(bankTitle);
      bankInfoSection.appendChild(bankContent);
      screenshotContent.appendChild(bankInfoSection);
    }
    
    // 9. Mareate标识
    const mareateSection = document.createElement('div');
    mareateSection.style.marginTop = 'auto';
    mareateSection.style.paddingTop = '24px';
    mareateSection.style.borderTop = '2px solid #f3f4f6';
    mareateSection.style.textAlign = 'center';
    
    const mareateText = document.createElement('div');
    mareateText.style.fontSize = '14px';
    mareateText.style.color = '#6b7280';
    mareateText.style.fontWeight = '500';
    mareateText.style.fontFamily = config.fontFamily;
    mareateText.textContent = '该题目编辑来自于Mareate，截图来自于Mareate';
    
    const mareateLogo = document.createElement('div');
    mareateLogo.style.fontSize = '16px';
    mareateLogo.style.color = '#3b82f6';
    mareateLogo.style.fontWeight = '700';
    mareateLogo.style.marginTop = '4px';
    mareateLogo.style.fontFamily = config.fontFamily;
    mareateLogo.textContent = 'Mareate';
    
    mareateSection.appendChild(mareateText);
    mareateSection.appendChild(mareateLogo);
    screenshotContent.appendChild(mareateSection);
    
    screenshotContainer.appendChild(screenshotContent);
    document.body.appendChild(screenshotContainer);
    
    // 在截图前渲染LaTeX
    try {
      if ((window as any)._renderLaTeX) {
        (window as any)._renderLaTeX(screenshotContainer);
        // 给LaTeX渲染一些额外时间
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (error) {
      console.warn('LaTeX渲染失败:', error);
    }
    
    try {
      // 尝试使用html2canvas
      let canvas;
      try {
        canvas = await html2canvas(screenshotContainer, {
          background: '#ffffff',
          useCORS: true,
          allowTaint: true,
          width: screenshotContainer.offsetWidth,
          height: screenshotContainer.offsetHeight,
          logging: false
        });
          } catch (html2canvasError) {
            console.error('html2canvas截图失败:', html2canvasError);
            throw html2canvasError;
          }
          
          onScreenshot(canvas);
        } finally {
          document.body.removeChild(screenshotContainer);
        }
  } catch (error) {
    console.error('截图失败:', error);
    throw error;
  }
};

export default generateScreenshot;
