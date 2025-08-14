import { Request, Response } from 'express';
import { processPDF, processWord } from '../services/mathpixService';
import {
  splitChoiceQuestions,
  splitFillQuestions,
  splitSolutionQuestions
} from '../services/questionSplitService';
import {
  processQuestionsWithOptimizedDeepSeek,
  OptimizedProcessedQuestion,
  processTeXWithOptimizedDeepSeek
} from '../services/optimizedDeepseekAI';

/**
 * 优化版PDF文档处理
 * 核心优化：
 * 1. 精确分割题目（不依赖DeepSeek分割）
 * 2. 并行处理所有题目（一次性发送所有请求）
 * 3. 每道题一次API调用完成所有处理步骤
 */
export const processOptimizedPDFDocument = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: '未提供PDF文件' });
      return;
    }

    const pdfBuffer = req.file.buffer;
    
    // 1. Mathpix提取MMD内容并分割

    const sections = await processPDF(pdfBuffer);
    
    // 2. 使用自定义函数精确分割题目
    const choiceSplitQuestions = splitChoiceQuestions(sections.choiceQuestions);
    const fillSplitQuestions = splitFillQuestions(sections.fillQuestions);
    const solutionSplitQuestions = splitSolutionQuestions(sections.solutionQuestions);
    
    // 3. 准备所有题目进行并行处理

    const allSplitQuestions = [
      ...choiceSplitQuestions.map(q => ({ 
        content: q.content, 
        number: q.number, 
        type: 'choice' as const 
      })),
      ...fillSplitQuestions.map(q => ({ 
        content: q.content, 
        number: q.number, 
        type: 'fill' as const 
      })),
      ...solutionSplitQuestions.map(q => ({ 
        content: q.content, 
        number: q.number, 
        type: 'solution' as const 
      }))
    ];
    
    if (allSplitQuestions.length === 0) {
      res.json({
        success: true,
        sections: sections,
        questions: [],
        totalCount: 0,
        choiceCount: 0,
        fillCount: 0,
        solutionCount: 0,
        message: '未发现有效题目'
      });
      return;
    }
    
    // 4. 并行处理所有题目

    const startTime = Date.now();
    
    const optimizedResults = await processQuestionsWithOptimizedDeepSeek(allSplitQuestions);
    
    const processingTime = Date.now() - startTime;

    
    // 5. 统计结果
    const processedChoiceQuestions = optimizedResults.filter(q => q.type === 'choice');
    const processedFillQuestions = optimizedResults.filter(q => q.type === 'fill');
    const processedSolutionQuestions = optimizedResults.filter(q => q.type === 'solution');
    

    
    // 6. 返回结果
    res.json({
      success: true,
      sections: sections, // 保留分割后的原始内容
      questions: optimizedResults, // 优化处理后的题目
      totalCount: optimizedResults.length,
      choiceCount: processedChoiceQuestions.length,
      fillCount: processedFillQuestions.length,
      solutionCount: processedSolutionQuestions.length,
      processingTime: processingTime,
      averageTimePerQuestion: Math.round(processingTime / allSplitQuestions.length),
      message: `成功处理 ${optimizedResults.length} 道题目（选择题${processedChoiceQuestions.length}道，填空题${processedFillQuestions.length}道，解答题${processedSolutionQuestions.length}道），耗时${processingTime}ms`
    });
  } catch (error: any) {
    console.error('❌ PDF处理失败:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * 优化版Word文档处理
 */
export const processOptimizedWordDocument = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: '未提供Word文件' });
      return;
    }

    const docBuffer = req.file.buffer;
    console.log('📄 开始处理Word文档...');
    
    // 1. Mathpix提取MMD内容并分割
    console.log('🔄 步骤1: Mathpix提取和分割...');
    const sections = await processWord(docBuffer);
    
    // 2. 使用自定义函数精确分割题目
    console.log('✂️ 步骤2: 精确分割题目...');
    const choiceSplitQuestions = splitChoiceQuestions(sections.choiceQuestions);
    const fillSplitQuestions = splitFillQuestions(sections.fillQuestions);
    const solutionSplitQuestions = splitSolutionQuestions(sections.solutionQuestions);
    
    console.log(`分割完成：选择题 ${choiceSplitQuestions.length} 道，填空题 ${fillSplitQuestions.length} 道，解答题 ${solutionSplitQuestions.length} 道`);
    
    // 3. 准备所有题目进行并行处理
    console.log('🚀 步骤3: 准备并行处理...');
    const allSplitQuestions = [
      ...choiceSplitQuestions.map(q => ({ 
        content: q.content, 
        number: q.number, 
        type: 'choice' as const 
      })),
      ...fillSplitQuestions.map(q => ({ 
        content: q.content, 
        number: q.number, 
        type: 'fill' as const 
      })),
      ...solutionSplitQuestions.map(q => ({ 
        content: q.content, 
        number: q.number, 
        type: 'solution' as const 
      }))
    ];
    
    if (allSplitQuestions.length === 0) {
      res.json({
        success: true,
        sections: sections,
        questions: [],
        totalCount: 0,
        choiceCount: 0,
        fillCount: 0,
        solutionCount: 0,
        message: '未发现有效题目'
      });
      return;
    }
    
    // 4. 并行处理所有题目
    const startTime = Date.now();
    
    const optimizedResults = await processQuestionsWithOptimizedDeepSeek(allSplitQuestions);
    
    const processingTime = Date.now() - startTime;
    
    // 5. 统计结果
    const processedChoiceQuestions = optimizedResults.filter(q => q.type === 'choice');
    const processedFillQuestions = optimizedResults.filter(q => q.type === 'fill');
    const processedSolutionQuestions = optimizedResults.filter(q => q.type === 'solution');
    
    
    // 6. 返回结果
    res.json({
      success: true,
      sections: sections, // 保留分割后的原始内容
      questions: optimizedResults, // 优化处理后的题目
      totalCount: optimizedResults.length,
      choiceCount: processedChoiceQuestions.length,
      fillCount: processedFillQuestions.length,
      solutionCount: processedSolutionQuestions.length,
      processingTime: processingTime,
      averageTimePerQuestion: Math.round(processingTime / allSplitQuestions.length),
      message: `成功处理 ${optimizedResults.length} 道题目（选择题${processedChoiceQuestions.length}道，填空题${processedFillQuestions.length}道，解答题${processedSolutionQuestions.length}道），耗时${processingTime}ms`
    });
  } catch (error: any) {
    console.error('❌ Word处理失败:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * 优化版TeX文档处理
 * 核心优化：
 * 1. 直接使用DeepSeek AI解析TeX文件
 * 2. 智能识别题目类型和结构
 * 3. 保留所有LaTeX公式和数学符号
 */
export const processOptimizedTeXDocument = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: '未提供TeX文件' });
      return;
    }

    const texContent = req.file.buffer.toString('utf-8');
    
    // 使用优化版DeepSeek AI处理TeX文件
    const startTime = Date.now();
    
    const optimizedResults = await processTeXWithOptimizedDeepSeek(texContent);
    
    const processingTime = Date.now() - startTime;
    
    // 统计结果
    const processedChoiceQuestions = optimizedResults.filter(q => q.type === 'choice');
    const processedFillQuestions = optimizedResults.filter(q => q.type === 'fill');
    const processedSolutionQuestions = optimizedResults.filter(q => q.type === 'solution');
    
    // 返回结果
    res.json({
      success: true,
      questions: optimizedResults,
      totalCount: optimizedResults.length,
      choiceCount: processedChoiceQuestions.length,
      fillCount: processedFillQuestions.length,
      solutionCount: processedSolutionQuestions.length,
      processingTime: processingTime,
      message: `TeX处理完成 ${optimizedResults.length} 道题目`,
      note: '使用优化版DeepSeek AI智能解析TeX文件'
    });
  } catch (error: any) {
    console.error('优化版TeX处理失败:', error);
    res.status(500).json({ error: error.message });
  }
};