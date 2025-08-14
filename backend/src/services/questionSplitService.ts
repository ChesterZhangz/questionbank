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
  // 选择题编号格式: 数字．
  const regex = /(\d+)．([\s\S]*?)(?=\d+．|$)/g;
  let match;
  
  while ((match = regex.exec(content)) !== null) {
    const questionNumber = match[1];
    const questionContent = match[0];
    questions.push({
      number: questionNumber,
      content: questionContent.trim()
    });
  }
  
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
  // 填空题编号格式: 数字．
  const regex = /(\d+)．([\s\S]*?)(?=\d+．|$)/g;
  let match;
  
  while ((match = regex.exec(content)) !== null) {
    const questionNumber = match[1];
    const questionContent = match[0];
    questions.push({
      number: questionNumber,
      content: questionContent.trim()
    });
  }
  
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
    const regex = /(\d+)．([\s\S]*?)(?=\d+．|$)/g;
    let match;
    
    while ((match = regex.exec(content)) !== null) {
      const questionNumber = match[1];
      const questionContent = match[0];
      questions.push({
        number: questionNumber,
        content: questionContent.trim()
      });
    }
  }
  
  console.log(`分割解答题完成，共 ${questions.length} 道题目`);
  return questions;
}