import express from 'express';
import { authMiddleware } from '../middleware/auth';
import { questionEvaluationService } from '../services/questionEvaluationService';
import { Question } from '../models/Question';

const router = express.Router();

// 生成题目评价
router.post('/evaluate', authMiddleware, async (req, res) => {
  try {
    const { content, solution, solutionAnswers, tags, difficulty, category, questionType } = req.body;

    if (!content || typeof content !== 'string') {
      return res.status(400).json({
        success: false,
        message: '题目内容不能为空'
      });
    }

    console.log('开始生成题目评价，内容长度:', content.length);

    const evaluation = await questionEvaluationService.evaluateQuestion({
      content,
      solution,
      solutionAnswers,
      tags: tags || [],
      difficulty: difficulty || 3,
      category: category || ['综合题'],
      questionType: questionType || 'solution'
    });

    console.log('题目评价生成完成');
    return res.json({
      success: true,
      evaluation
    });
  } catch (error: any) {
    console.error('题目评价生成失败:', error);
    
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      return res.status(408).json({
        success: false,
        message: 'AI评价生成超时，请稍后重试'
      });
    }
    
    return res.status(500).json({
      success: false,
      message: '题目评价生成失败，请重试'
    });
  }
});

// 获取题目的完整分析结果
router.get('/analysis/:questionId', authMiddleware, async (req, res) => {
  try {
    const { questionId } = req.params;
    
    if (!questionId) {
      return res.status(400).json({
        success: false,
        message: '题目ID不能为空'
      });
    }

    // 从请求查询参数获取题目数据
    const { content, solution, solutionAnswers, tags, difficulty, category, type } = req.query;
    
    if (!content) {
      return res.status(400).json({
        success: false,
        message: '题目内容不能为空'
      });
    }

    const questionData = {
      content: {
        stem: content as string,
        solution: solution as string,
        solutionAnswers: solutionAnswers ? (Array.isArray(solutionAnswers) ? solutionAnswers : [solutionAnswers]) as string[] : []
      },
      tags: tags ? (Array.isArray(tags) ? tags : [tags]) as string[] : [],
      difficulty: difficulty ? parseInt(difficulty as string) : 3,
      category: category ? (Array.isArray(category) ? category : [category]) as string[] : ['综合题'],
      type: type as string || 'solution'
    };
    
    console.log('开始获取题目完整分析:', questionId);

    const analysis = await questionEvaluationService.getCompleteAnalysis(questionId, questionData);

    console.log('题目完整分析获取完成');
    return res.json({
      success: true,
      analysis
    });
  } catch (error: any) {
    console.error('获取题目完整分析失败:', error);
    
    return res.status(500).json({
      success: false,
      message: '获取题目完整分析失败，请重试'
    });
  }
});

// 批量评价题目
router.post('/batch-evaluate', authMiddleware, async (req, res) => {
  try {
    const { questions } = req.body;

    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({
        success: false,
        message: '题目列表不能为空'
      });
    }

    if (questions.length > 100) {
      return res.status(400).json({
        success: false,
        message: '批量评价题目数量不能超过100个'
      });
    }

    console.log('开始批量评价题目，数量:', questions.length);

    const results = await questionEvaluationService.batchEvaluateQuestions(questions);

    console.log('批量评价完成');
    return res.json({
      success: true,
      results
    });
  } catch (error: any) {
    console.error('批量评价失败:', error);
    
    return res.status(500).json({
      success: false,
      message: '批量评价失败，请重试'
    });
  }
});




// 获取已保存的AI分析结果
router.get('/saved-analysis/:questionId', authMiddleware, async (req, res) => {
  try {
    const { questionId } = req.params;
    
    if (!questionId) {
      return res.status(400).json({
        success: false,
        message: '题目ID不能为空'
      });
    }

    console.log('获取已保存的AI分析结果:', questionId);

    // 从数据库查找题目
    const question = await Question.findOne({ qid: questionId });
    
    if (!question) {
      return res.status(404).json({
        success: false,
        message: '题目不存在'
      });
    }
    const evaluation = question.aiAnalysis?.evaluation;
    const hasReasoning = evaluation?.evaluationReasoning || (evaluation as any)?.reasoning;
    
    if (!question.aiAnalysis || 
        !evaluation || 
        !question.aiAnalysis.coreAbilities ||
        !evaluation.overallRating ||
        !hasReasoning) {
      console.log('AI分析结果不完整:', {
        hasAiAnalysis: !!question.aiAnalysis,
        hasEvaluation: !!evaluation,
        hasCoreAbilities: !!question.aiAnalysis?.coreAbilities,
        overallRating: evaluation?.overallRating,
        evaluationReasoning: evaluation?.evaluationReasoning,
        reasoning: (evaluation as any)?.reasoning,
        hasReasoning: !!hasReasoning
      });
      return res.json({
        success: true,
        hasSavedAnalysis: false,
        analysis: null
      });
    }

    return res.json({
      success: true,
      hasSavedAnalysis: true,
      analysis: question.aiAnalysis
    });
  } catch (error: any) {
    console.error('获取已保存的AI分析结果失败:', error);
    
    return res.status(500).json({
      success: false,
      message: '获取已保存的AI分析结果失败，请重试'
    });
  }
});

// 保存AI分析结果
router.post('/save-analysis/:questionId', authMiddleware, async (req, res) => {
  try {
    const { questionId } = req.params;
    const analysisData = req.body;
    
    if (!questionId) {
      return res.status(400).json({
        success: false,
        message: '题目ID不能为空'
      });
    }

    if (!analysisData) {
      return res.status(400).json({
        success: false,
        message: '分析数据不能为空'
      });
    }

    console.log('开始保存AI分析结果到数据库:', questionId);

    // 查找题目并更新AI分析结果
    const question = await Question.findOne({ qid: questionId });
    
    if (!question) {
      return res.status(404).json({
        success: false,
        message: '题目不存在'
      });
    }

    // 构建AI分析数据结构
    const aiAnalysisData = {
      evaluation: analysisData.evaluation ? {
        overallRating: analysisData.evaluation.overallRating || 0,
        evaluationReasoning: analysisData.evaluation.evaluationReasoning || ''
      } : undefined,
      coreAbilities: analysisData.coreAbilities ? {
        logicalThinking: analysisData.coreAbilities.logicalThinking || 0,
        mathematicalIntuition: analysisData.coreAbilities.mathematicalIntuition || 0,
        problemSolving: analysisData.coreAbilities.problemSolving || 0,
        analyticalSkills: analysisData.coreAbilities.analyticalSkills || 0,
        creativeThinking: analysisData.coreAbilities.creativeThinking || 0,
        computationalSkills: analysisData.coreAbilities.computationalSkills || 0
      } : undefined,
      analysisTimestamp: new Date(),
      analysisVersion: '1.0.0'
    };

    // 更新题目文档
    const updatedQuestion = await Question.findOneAndUpdate(
      { qid: questionId },
      { 
        $set: { 
          aiAnalysis: aiAnalysisData,
          updatedAt: new Date()
        }
      },
      { new: true, runValidators: true }
    );

    if (!updatedQuestion) {
      throw new Error('题目更新失败');
    }

    console.log('AI分析结果已成功保存到数据库:', {
      questionId,
      evaluation: aiAnalysisData.evaluation?.overallRating,
      coreAbilities: aiAnalysisData.coreAbilities ? '已保存' : '未保存',
      timestamp: aiAnalysisData.analysisTimestamp
    });

    return res.json({
      success: true,
      message: 'AI分析结果保存成功',
      data: {
        questionId,
        analysisTimestamp: aiAnalysisData.analysisTimestamp
      }
    });
  } catch (error: any) {
    console.error('保存AI分析结果失败:', error);
    
    return res.status(500).json({
      success: false,
      message: '保存AI分析结果失败，请重试',
      error: error.message
    });
  }
});

export default router;
