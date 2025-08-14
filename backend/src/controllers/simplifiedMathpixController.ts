import { Request, Response } from 'express';
import { processPDF, processWord, validateMathpixConfig } from '../services/mathpixService';
import { 
  correctLatexWithDeepSeek, 
  recognizeChoiceQuestionWithDeepSeek,
  recognizeFillQuestionWithDeepSeek,
  processBatchQuestionsWithDeepSeek
} from '../services/deepseekAI';
import { processTeXWithOptimizedDeepSeek } from '../services/optimizedDeepseekAI';
import {
  splitChoiceQuestions,
  splitFillQuestions,
  splitSolutionQuestions
} from '../services/questionSplitService';

// 验证Mathpix API配置
export const validateConfig = async (req: Request, res: Response) => {
  try {
    const isValid = validateMathpixConfig();
    res.json({ valid: isValid });
  } catch (error: any) {
    console.error('验证Mathpix配置失败:', error);
    res.status(500).json({ error: error.message });
  }
};



// 简化版PDF文档处理（推荐使用优化版API）
export const processPDFDocument = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: '未提供PDF文件' });
      return;
    }

    const pdfBuffer = req.file.buffer;
    const sections = await processPDF(pdfBuffer);
    
    console.log('PDF提取完成，使用简化处理（推荐使用 /api/mathpix-optimized/process-pdf-optimized）');
    
    // 使用自定义函数分割题目
    const choiceSplitQuestions = splitChoiceQuestions(sections.choiceQuestions);
    const fillSplitQuestions = splitFillQuestions(sections.fillQuestions);
    const solutionSplitQuestions = splitSolutionQuestions(sections.solutionQuestions);
    
    console.log(`分割完成：选择题 ${choiceSplitQuestions.length} 道，填空题 ${fillSplitQuestions.length} 道，解答题 ${solutionSplitQuestions.length} 道`);
    
    // 简化处理：直接返回分割后的题目
    const allQuestions = [
      ...choiceSplitQuestions.map(q => ({ type: 'choice', number: q.number, content: q.content })),
      ...fillSplitQuestions.map(q => ({ type: 'fill', number: q.number, content: q.content })),
      ...solutionSplitQuestions.map(q => ({ type: 'solution', number: q.number, content: q.content }))
    ];
    
    res.json({
      success: true,
      sections: sections,
      questions: allQuestions,
      totalCount: allQuestions.length,
      choiceCount: choiceSplitQuestions.length,
      fillCount: fillSplitQuestions.length,
      solutionCount: solutionSplitQuestions.length,
      message: `简化处理完成 ${allQuestions.length} 道题目（选择题${choiceSplitQuestions.length}道，填空题${fillSplitQuestions.length}道，解答题${solutionSplitQuestions.length}道）`,
      note: '这是简化版处理，推荐使用 /api/mathpix-optimized/process-pdf-optimized 获得更好的结果'
    });
  } catch (error: any) {
    console.error('PDF处理失败:', error);
    res.status(500).json({ error: error.message });
  }
};

// 简化版Word文档处理（推荐使用优化版API）
export const processWordDocument = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: '未提供Word文件' });
      return;
    }

    const docBuffer = req.file.buffer;
    const sections = await processWord(docBuffer);
    
    console.log('Word文档提取完成，使用简化处理（推荐使用 /api/mathpix-optimized/process-word-optimized）');
    
    // 使用自定义函数分割题目
    const choiceSplitQuestions = splitChoiceQuestions(sections.choiceQuestions);
    const fillSplitQuestions = splitFillQuestions(sections.fillQuestions);
    const solutionSplitQuestions = splitSolutionQuestions(sections.solutionQuestions);
    
    console.log(`分割完成：选择题 ${choiceSplitQuestions.length} 道，填空题 ${fillSplitQuestions.length} 道，解答题 ${solutionSplitQuestions.length} 道`);
    
    // 简化处理：直接返回分割后的题目
    const allQuestions = [
      ...choiceSplitQuestions.map(q => ({ type: 'choice', number: q.number, content: q.content })),
      ...fillSplitQuestions.map(q => ({ type: 'fill', number: q.number, content: q.content })),
      ...solutionSplitQuestions.map(q => ({ type: 'solution', number: q.number, content: q.content }))
    ];
    
    res.json({
      success: true,
      sections: sections,
      questions: allQuestions,
      totalCount: allQuestions.length,
      choiceCount: choiceSplitQuestions.length,
      fillCount: fillSplitQuestions.length,
      solutionCount: solutionSplitQuestions.length,
      message: `简化处理完成 ${allQuestions.length} 道题目（选择题${choiceSplitQuestions.length}道，填空题${fillSplitQuestions.length}道，解答题${solutionSplitQuestions.length}道）`,
      note: '这是简化版处理，推荐使用 /api/mathpix-optimized/process-word-optimized 获得更好的结果'
    });
  } catch (error: any) {
    console.error('Word处理失败:', error);
    res.status(500).json({ error: error.message });
  }
};

// TeX文档处理
export const processTeXDocument = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: '未提供TeX文件' });
      return;
    }

    const texContent = req.file.buffer.toString('utf-8');
    console.log('TeX文件内容长度:', texContent.length);
    
    // 使用DeepSeek AI处理TeX文件
    const processedQuestions = await processTeXWithOptimizedDeepSeek(texContent);
    
    console.log(`TeX处理完成：${processedQuestions.length} 道题目`);
    
    res.json({
      success: true,
      questions: processedQuestions,
      totalCount: processedQuestions.length,
      message: `TeX处理完成 ${processedQuestions.length} 道题目`,
      note: '使用DeepSeek AI智能解析TeX文件'
    });
  } catch (error: any) {
    console.error('TeX处理失败:', error);
    res.status(500).json({ error: error.message });
  }
};

// 批量处理文档内容
export const processBatchContent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { content } = req.body;
    
    if (!content || typeof content !== 'string') {
      res.status(400).json({ error: '未提供有效的文档内容' });
      return;
    }

    console.log('开始批量处理文档内容（推荐使用优化版API）...');
    
    // 使用旧的批量处理功能
    const processedQuestions = await processBatchQuestionsWithDeepSeek(content);
    
    console.log(`批量处理完成，共识别出 ${processedQuestions.length} 道题目`);
    
    res.json({
      success: true,
      questions: processedQuestions,
      totalCount: processedQuestions.length,
      message: `成功处理 ${processedQuestions.length} 道题目`,
      note: '这是简化版处理，推荐使用优化版API获得更好的结果'
    });
  } catch (error: any) {
    console.error('批量处理失败:', error);
    res.status(500).json({ error: error.message });
  }
};