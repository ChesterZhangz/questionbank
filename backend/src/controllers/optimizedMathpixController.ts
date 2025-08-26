import { Request, Response } from 'express';
import { processPDF } from '../services/mathpixService';
import {
  splitQuestionsByNumber
} from '../services/questionSplitService';
import {
  processQuestionsWithOptimizedDeepSeek,
  OptimizedProcessedQuestion,
  processTeXWithOptimizedDeepSeek
} from '../services/optimizedDeepseekAI';
import { emitProgress } from '../utils/progress';
import { isCancelled, clearCancelled } from '../utils/cancel';

/**
 * 优化版PDF文档处理
 * 核心优化：
 * 1. 精确分割题目（不依赖DeepSeek分割）
 * 2. 并行处理所有题目（一次性发送所有请求）
 * 3. 每道题一次API调用完成所有处理步骤
 * 4. 支持自由格式文档（新增）
 */
export const processOptimizedPDFDocument = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: '未提供PDF文件' });
      return;
    }
    const docId = (req as any).id || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    emitProgress(docId, { type: 'status', step: '开始处理PDF', progress: 0 });

    const pdfBuffer = req.file.buffer;
    
    // 1. Mathpix提取MMD内容
    emitProgress(docId, { type: 'status', step: '提取', progress: 10 });
    if (isCancelled(docId)) {
      emitProgress(docId, { type: 'cancelled' });
      res.status(499).json({ cancelled: true });
      return;
    }
    
    // 创建一个进度更新函数，用于Mathpix处理过程中的实时更新
    let mathpixProgress = 10;
    const updateMathpixProgress = (progress: number) => {
      mathpixProgress = Math.min(35, 10 + Math.round((progress / 100) * 25)); // 10%到35%之间
      emitProgress(docId, { type: 'status', step: '提取', progress: mathpixProgress });
    };
    
    const sections = await processPDF(pdfBuffer, updateMathpixProgress);
    if (isCancelled(docId)) {
      emitProgress(docId, { type: 'cancelled' });
      res.status(499).json({ cancelled: true });
      return;
    }
    emitProgress(docId, { type: 'status', step: '提取完成', progress: 35 });
    

    
    // 2. 统一按序号分割题目，不预设题型
    console.log('📄 采用统一分割策略，按序号切割题目...');
    
    // 获取MMD内容
    const mmdContent = sections.freeFormatContent || 
                      sections.choiceQuestions + '\n' + 
                      sections.fillQuestions + '\n' + 
                      sections.solutionQuestions;
    
    // 直接按序号分割
    const splitQuestions = splitQuestionsByNumber(mmdContent);
    emitProgress(docId, { type: 'status', step: '题目分割完成', total: splitQuestions.length, progress: 50 });
    
    if (splitQuestions.length === 0) {
      res.json({
        success: true,
        sections: sections,
        questions: [],
        totalCount: 0,
        choiceCount: 0,
        fillCount: 0,
        solutionCount: 0,
        message: '未发现有效题目',
        format: 'unified',
        note: '采用统一分割策略，未找到标准题目编号'
      });
      return;
    }
    
    // 转换为统一格式，让AI智能识别题型
    const allSplitQuestions: Array<{ content: string; number: string; type: 'choice' | 'fill' | 'solution' }> = 
      splitQuestions.map(q => ({
        content: q.content,
        number: q.number,
        type: 'solution' as const // 统一设置为solution，让AI自动识别
      }));
    
    console.log(`统一分割完成，共 ${allSplitQuestions.length} 道题目，将交由AI智能识别题型`);
    
    if (allSplitQuestions.length === 0) {
      res.json({
        success: true,
        sections: sections,
        questions: [],
        totalCount: 0,
        choiceCount: 0,
        fillCount: 0,
        solutionCount: 0,
        message: '未发现有效题目',
        format: sections.isFreeFormat ? 'free' : 'standard'
      });
      return;
    }
    
    // 3. 并行处理所有题目
    const startTime = Date.now();
    
    emitProgress(docId, { type: 'status', step: 'AI处理开始', progress: 60 });
    if (isCancelled(docId)) {
      emitProgress(docId, { type: 'cancelled' });
      res.status(499).json({ cancelled: true });
      return;
    }
    const optimizedResults = await processQuestionsWithOptimizedDeepSeek(allSplitQuestions);
    emitProgress(docId, { type: 'status', step: 'AI处理完成', progress: 90 });
    
    const processingTime = Date.now() - startTime;
    
    // 4. 统计结果
    const processedChoiceQuestions = optimizedResults.filter(q => q.type === 'choice');
    const processedFillQuestions = optimizedResults.filter(q => q.type === 'fill');
    const processedSolutionQuestions = optimizedResults.filter(q => q.type === 'solution');
    
    // 5. 返回结果
    emitProgress(docId, { type: 'completed', progress: 100 });
    clearCancelled(docId);
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
      format: 'unified',
      message: `成功处理 ${optimizedResults.length} 道题目（选择题${processedChoiceQuestions.length}道，填空题${processedFillQuestions.length}道，解答题${processedSolutionQuestions.length}道），耗时${processingTime}ms，采用统一分割策略，AI智能识别题型`
    });
  } catch (error: any) {
    console.error('❌ PDF处理失败:', error);
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
    const docId = (req as any).id || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    emitProgress(docId, { type: 'status', step: '开始处理TeX', progress: 0 });
    const texContent = req.file.buffer.toString('utf-8');
    
    // 使用优化版DeepSeek AI处理TeX文件
    const startTime = Date.now();
    emitProgress(docId, { type: 'status', step: 'AI解析', progress: 30 });
    if (isCancelled(docId)) {
      emitProgress(docId, { type: 'cancelled' });
      res.status(499).json({ cancelled: true });
      return;
    }
    const optimizedResults = await processTeXWithOptimizedDeepSeek(texContent);
    emitProgress(docId, { type: 'status', step: 'AI解析完成', progress: 85 });
    const processingTime = Date.now() - startTime;
    
    // 统计结果
    const processedChoiceQuestions = optimizedResults.filter(q => q.type === 'choice');
    const processedFillQuestions = optimizedResults.filter(q => q.type === 'fill');
    const processedSolutionQuestions = optimizedResults.filter(q => q.type === 'solution');
    
    // 返回结果
    emitProgress(docId, { type: 'completed', progress: 100 });
    clearCancelled(docId);
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