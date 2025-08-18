/**
 * 题目分割服务
 * 使用正则表达式分割不同类型的题目
 */

/**
 * 分割后的题目接口
 */
export interface SplitQuestion {
  number: string;
  content: string;
}

/**
 * 分割选择题
 * @param content 选择题部分的MMD内容
 * @returns 分割后的选择题数组
 */
export function splitChoiceQuestions(content: string): SplitQuestion[] {
  const questions: SplitQuestion[] = [];
  
  // 支持多种编号格式：数字．、数字.、数字、等
  const patterns = [
    /(\d+)．([\s\S]*?)(?=\d+[．\.、\)]|$)/g,  // 数字．
    /(\d+)\.([\s\S]*?)(?=\d+[．\.、\)]|$)/g,  // 数字.
    /(\d+)、([\s\S]*?)(?=\d+[．\.、\)]|$)/g,  // 数字、
    /(\d+)\)([\s\S]*?)(?=\d+[．\.、\)]|$)/g   // 数字)
  ];
  
  for (const regex of patterns) {
    let match;
    while ((match = regex.exec(content)) !== null) {
      const questionNumber = match[1];
      const questionContent = match[0];
      
      // 检查是否已经添加过这个题目
      const exists = questions.some(q => q.number === questionNumber);
      if (!exists) {
        questions.push({
          number: questionNumber,
          content: questionContent.trim()
        });
      }
    }
  }
  
  // 按题目编号排序
  questions.sort((a, b) => parseInt(a.number) - parseInt(b.number));
  
  console.log(`分割选择题完成，共 ${questions.length} 道题目`);
  return questions;
}

/**
 * 分割填空题
 * @param content 填空题部分的MMD内容
 * @returns 分割后的填空题数组
 */
export function splitFillQuestions(content: string): SplitQuestion[] {
  const questions: SplitQuestion[] = [];
  
  // 支持多种编号格式：数字．、数字.、数字、等
  const patterns = [
    /(\d+)．([\s\S]*?)(?=\d+[．\.、\)]|$)/g,  // 数字．
    /(\d+)\.([\s\S]*?)(?=\d+[．\.、\)]|$)/g,  // 数字.
    /(\d+)、([\s\S]*?)(?=\d+[．\.、\)]|$)/g,  // 数字、
    /(\d+)\)([\s\S]*?)(?=\d+[．\.、\)]|$)/g   // 数字)
  ];
  
  for (const regex of patterns) {
    let match;
    while ((match = regex.exec(content)) !== null) {
      const questionNumber = match[1];
      const questionContent = match[0];
      
      // 检查是否已经添加过这个题目
      const exists = questions.some(q => q.number === questionNumber);
      if (!exists) {
        questions.push({
          number: questionNumber,
          content: questionContent.trim()
        });
      }
    }
  }
  
  // 按题目编号排序
  questions.sort((a, b) => parseInt(a.number) - parseInt(b.number));
  
  console.log(`分割填空题完成，共 ${questions.length} 道题目`);
  return questions;
}

/**
 * 分割解答题
 * @param content 解答题部分的MMD内容
 * @returns 分割后的解答题数组
 */
export function splitSolutionQuestions(content: string): SplitQuestion[] {
  const questions: SplitQuestion[] = [];
  
  // 解答题编号格式: \section*{数字．
  // 首先尝试匹配section标记的题目
  const sectionRegex = /\\section\*\{(\d+)．([\s\S]*?)(?=\\section\*\{\d+．|$)/g;
  let sectionMatch;
  
  while ((sectionMatch = sectionRegex.exec(content)) !== null) {
    const questionNumber = sectionMatch[1];
    const questionContent = sectionMatch[0];
    questions.push({
      number: questionNumber,
      content: questionContent.trim()
    });
  }
  
  // 如果没有找到section标记的题目，尝试普通数字编号
  if (questions.length === 0) {
    const patterns = [
      /(\d+)．([\s\S]*?)(?=\d+[．\.、\)]|$)/g,  // 数字．
      /(\d+)\.([\s\S]*?)(?=\d+[．\.、\)]|$)/g,  // 数字.
      /(\d+)、([\s\S]*?)(?=\d+[．\.、\)]|$)/g,  // 数字、
      /(\d+)\)([\s\S]*?)(?=\d+[．\.、\)]|$)/g   // 数字)
    ];
    
    for (const regex of patterns) {
      let match;
      while ((match = regex.exec(content)) !== null) {
        const questionNumber = match[1];
        const questionContent = match[0];
        
        // 检查是否已经添加过这个题目
        const exists = questions.some(q => q.number === questionNumber);
        if (!exists) {
          questions.push({
            number: questionNumber,
            content: questionContent.trim()
          });
        }
      }
    }
  }
  
  // 按题目编号排序
  questions.sort((a, b) => parseInt(a.number) - parseInt(b.number));
  
  console.log(`分割解答题完成，共 ${questions.length} 道题目`);
  return questions;
}

/**
 * 统一题目分割函数（新增）
 * 直接按序号切割，不预设题型，让AI智能识别
 * @param content MMD内容
 * @returns 分割后的题目数组
 */
export function splitQuestionsByNumber(content: string): SplitQuestion[] {
  const questions: SplitQuestion[] = [];
  
  // 支持多种题目编号格式
  const patterns = [
    // 格式1: 数字． (中文句号)
    /(\d+)．([\s\S]*?)(?=\d+．|$)/g,
    // 格式2: 数字. (英文句号)
    /(\d+)\.([\s\S]*?)(?=\d+\.|$)/g,
    // 格式3: 数字、 (中文顿号)
    /(\d+)、([\s\S]*?)(?=\d+、|$)/g,
    // 格式4: 数字) (右括号)
    /(\d+)\)([\s\S]*?)(?=\d+\)|$)/g,
    // 格式5: 数字． (中文句号，更宽松的匹配)
    /(\d+)．([\s\S]*?)(?=\d+[．\.、\)]|$)/g,
    // 格式6: 数字. (英文句号，更宽松的匹配)
    /(\d+)\.([\s\S]*?)(?=\d+[．\.、\)]|$)/g
  ];
  
  let foundQuestions = false;
  
  // 尝试每种编号格式
  for (const pattern of patterns) {
    if (foundQuestions) break;
    
    const matches = content.match(pattern);
    if (matches && matches.length > 0) {
      console.log(`使用模式 ${pattern.source} 成功识别题目编号`);
      
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const questionNumber = match[1];
        const questionContent = match[0];
        
        // 过滤掉太短的内容（可能是误识别）
        if (questionContent.trim().length > 10) {
          questions.push({
            number: questionNumber,
            content: questionContent.trim()
          });
        }
      }
      
      if (questions.length > 0) {
        foundQuestions = true;
        break;
      }
    }
  }
  
  // 如果没有找到标准编号格式，尝试其他方法
  if (!foundQuestions) {
    console.log('未找到标准题目编号，尝试智能分割...');
    
    // 方法1: 按段落分割（以空行为分隔符）
    const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim().length > 20);
    if (paragraphs.length > 1) {
      console.log(`按段落分割，找到 ${paragraphs.length} 个段落`);
      questions.push(...paragraphs.map((p, index) => ({
        number: `P${index + 1}`,
        content: p.trim()
      })));
    } else {
      // 方法2: 按行分割（过滤掉太短的行）
      const lines = content.split('\n').filter(line => line.trim().length > 30);
      if (lines.length > 1) {
        console.log(`按行分割，找到 ${lines.length} 行内容`);
        questions.push(...lines.map((line, index) => ({
          number: `L${index + 1}`,
          content: line.trim()
        })));
      }
    }
  }
  
  // 按题目编号排序
  questions.sort((a, b) => {
    const numA = parseInt(a.number.replace(/\D/g, ''));
    const numB = parseInt(b.number.replace(/\D/g, ''));
    return numA - numB;
  });
  
  console.log(`统一题目分割完成，共 ${questions.length} 道题目`);
  return questions;
}

/**
 * 分割自由格式题目（保留兼容性）
 * 智能识别题目编号，不预设题型
 * @param content 自由格式的MMD内容
 * @returns 分割后的题目数组
 */
export function splitFreeFormatQuestions(content: string): SplitQuestion[] {
  return splitQuestionsByNumber(content);
}