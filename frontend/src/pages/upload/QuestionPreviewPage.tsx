import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  rectSortingStrategy
} from '@dnd-kit/sortable';
import { ConfirmDialog } from '../../components/ui/Alert';
import { useModal } from '../../hooks/useModal';
import RightSlideModal from '../../components/ui/RightSlideModal';
import Button from '../../components/ui/Button';
import { useQuestionPreviewStore } from '../../stores/questionPreviewStore';
import { questionBankAPI, questionAPI, questionAnalysisAPI } from '../../services/api';
import type { Question, SimilarityResult, AIAnalysisResult } from '../../types';
import QuestionPreviewHeader from '../../components/preview/QuestionPreviewHeader';
import QuestionPreviewToolbar from '../../components/preview/QuestionPreviewToolbar';
import QuestionPreviewStats from '../../components/preview/QuestionPreviewStats';
import QuestionGrid from '../../components/preview/QuestionGrid';
import QuestionList from '../../components/preview/QuestionList';

import SourceSettingPanel from '../../components/preview/SourceSettingPanel';
import AIAnalysisPanel from '../../components/preview/AIAnalysisPanel';
import QuestionSavePanel from '../../components/preview/QuestionSavePanel';
import QuestionEditModal from '../../components/preview/QuestionEditModal';
import BatchMoveModal from '../../components/preview/BatchMoveModal';
import DraftManager from '../../components/preview/DraftManager';
import DraftReminderModal from '../../components/preview/DraftReminderModal';
import QuestionSplitModal from '../../components/preview/QuestionSplitModal';
import SimilarityDetectionModal from '../../components/similarity/SimilarityDetectionModal';

const QuestionPreviewPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    // 状态
    questions,
    filteredQuestions,
    selectedQuestions,
    viewMode,
    searchTerm,
    filters,
    sortBy,

    analyzingQuestions,
    analysisResults,
    savingQuestions,
    saveProgress,
    questionBanks,
    selectedQuestionBank,
    currentDraftId,
    isDraftMode,
    
    // 操作方法
    setQuestions,
    setFilteredQuestions,
    setSelectedQuestions,
    setViewMode,
    setSearchTerm,
    setFilters,
    setSortBy,


    setAnalyzingQuestions,
    setAnalysisResults,
    setSavingQuestions,
    setSaveProgress,
    setQuestionBanks,
    setSelectedQuestionBank,
    
    // 业务方法
    updateQuestion,
    deleteQuestion,
    batchUpdateQuestions,
    batchDeleteQuestions,
    analyzeQuestion,
    batchAnalyzeQuestions,
    saveQuestions,
    
    // 草稿方法
    loadDraft,
    setCurrentDraftId,
    setIsDraftMode,
    autoSaveDraft
  } = useQuestionPreviewStore();

  // 弹窗状态管理
  const { 
    rightSlideModal,
    showSuccessRightSlide,
    showErrorRightSlide,
    closeRightSlide
  } = useModal();

  // 相似度检测相关状态
  const [showSimilarityModal, setShowSimilarityModal] = useState(false);
  const [similarQuestions, setSimilarQuestions] = useState<SimilarityResult[]>([]);
  const [pendingQuestionData, setPendingQuestionData] = useState<any>(null);
  const [detectedSimilarQuestions, setDetectedSimilarQuestions] = useState<Map<string, SimilarityResult[]>>(new Map());
  const [currentSimilarityQuestionIndex, setCurrentSimilarityQuestionIndex] = useState(0);
  const [similarityQuestionIds, setSimilarityQuestionIds] = useState<string[]>([]);
  const [hasTriggeredSimilarityDetection, setHasTriggeredSimilarityDetection] = useState(false);
  // 低难度题目答案生成中的队列（用于显示“等待生成答案与解析”）
  const [answerGeneratingQuestions, setAnswerGeneratingQuestions] = useState<string[]>([]);

  // 拖拽传感器
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // 筛选和排序逻辑
  useEffect(() => {
    let filtered = [...questions];

    // 搜索筛选
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(question => {
        // 搜索题干内容
        const stemMatch = question.content?.stem?.toLowerCase().includes(searchLower);
        // 搜索答案内容
        const answerMatch = question.content?.answer?.toLowerCase().includes(searchLower);
        // 搜索选项内容
        const optionsMatch = question.content?.options?.some(option => 
          option.text?.toLowerCase().includes(searchLower)
        );
        // 搜索标签
        const tagsMatch = question.tags?.some(tag => 
          tag.toLowerCase().includes(searchLower)
        );
        // 搜索来源
        const sourceMatch = question.source?.toLowerCase().includes(searchLower);
        
        return stemMatch || answerMatch || optionsMatch || tagsMatch || sourceMatch;
      });
    }

    // 类型筛选
    if (filters.type.length > 0) {
      filtered = filtered.filter(question => 
        filters.type.includes(question.type)
      );
    }

    // 难度筛选
    if (filters.difficulty.length > 0) {
      filtered = filtered.filter(question => 
        filters.difficulty.includes(question.difficulty || 3)
      );
    }

    // 标签筛选
    if (filters.tags.length > 0) {
      filtered = filtered.filter(question => 
        question.tags?.some(tag => filters.tags.includes(tag))
      );
    }

    // 来源筛选
    if (filters.source.length > 0) {
      filtered = filtered.filter(question => 
        filters.source.includes(question.source || '')
      );
    }

    // 只有当用户主动选择了排序方式时才排序
    // 默认情况下保持原始顺序
    if (sortBy.field !== 'createdAt' || sortBy.order !== 'desc') {
      filtered.sort((a, b) => {
        const { field, order } = sortBy;
        let aValue: any, bValue: any;

        switch (field) {
          case 'createdAt':
            aValue = new Date(a.createdAt || Date.now());
            bValue = new Date(b.createdAt || Date.now());
            break;
          case 'updatedAt':
            aValue = new Date(a.updatedAt || Date.now());
            bValue = new Date(b.updatedAt || Date.now());
            break;
          case 'difficulty':
            aValue = a.difficulty || 3;
            bValue = b.difficulty || 3;
            break;
          case 'type':
            aValue = a.type || '';
            bValue = b.type || '';
            break;
          case 'title':
            aValue = a.content?.stem || '';
            bValue = b.content?.stem || '';
            break;
          default:
            aValue = a.createdAt || Date.now();
            bValue = b.createdAt || Date.now();
        }

        if (order === 'asc') {
          return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
        } else {
          return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
        }
      });
    }

    setFilteredQuestions(filtered);
  }, [questions, searchTerm, filters, sortBy]);

  // 页面状态
  const [showSourcePanel, setShowSourcePanel] = useState(false);
  const [showAnalysisPanel, setShowAnalysisPanel] = useState(false);
  const [showSavePanel, setShowSavePanel] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [showBatchMoveModal, setShowBatchMoveModal] = useState(false);
  const [showDraftManager, setShowDraftManager] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [splittingQuestion, setSplittingQuestion] = useState<Question | null>(null);
  const [hasUserSavedDraft, setHasUserSavedDraft] = useState(false); // 用户是否主动保存过草稿
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false); // 是否显示离开确认对话框
  const [showDraftReminder, setShowDraftReminder] = useState(false); // 是否显示草稿提醒
  const [isEditModeReminder, setIsEditModeReminder] = useState(false); // 是否是编辑模式触发的提醒

  // 页面离开处理
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // 如果用户没有保存过草稿且当前有题目，显示离开提醒
      if (!hasUserSavedDraft && !isDraftMode && questions.length > 0) {
        e.preventDefault();
        e.returnValue = '您有未保存的题目，确定要离开吗？';
        return '您有未保存的题目，确定要离开吗？';
      }
      // 如果用户已经保存过草稿，自动保存当前状态
      else if (hasUserSavedDraft && isDraftMode && currentDraftId) {
        // 自动保存当前状态
        const currentDrafts = useQuestionPreviewStore.getState().drafts;
        const updatedDrafts = currentDrafts.map(draft => 
          draft.id === currentDraftId 
            ? { ...draft, questions, updatedAt: new Date() }
            : draft
        );
        useQuestionPreviewStore.getState().setDrafts(updatedDrafts);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasUserSavedDraft, isDraftMode, questions, currentDraftId]);

  // 初始化数据
  useEffect(() => {
    const initializePage = async () => {
      try {
        // 从路由state获取题目数据
        const routeData = location.state as {
          questions: Question[];
          documentInfo?: any;
          isFromDraft?: boolean;
          draftId?: string;
        };

        // 如果有草稿ID，优先加载草稿数据
        if (routeData?.isFromDraft && routeData?.draftId) {
          setCurrentDraftId(routeData.draftId);
          setIsDraftMode(true);
          loadDraft(routeData.draftId);
          // 不直接返回，继续加载题库列表
        }

        if (routeData?.questions) {
          // 转换BatchUploadPage的Question格式为我们的Question格式
          const processedQuestions = routeData.questions.map((q, index) => {
            // 如果q.content是字符串，转换为对象格式
            let content;
            if (typeof q.content === 'string') {
              // 转换选项格式：从string[]转换为{text: string, isCorrect: boolean}[]
              let options: Array<{text: string, isCorrect: boolean}> = [];
              if ((q as any).options && Array.isArray((q as any).options)) {
                options = (q as any).options.map((optionText: string) => ({
                  text: optionText,
                  isCorrect: false // 默认设置为false，用户需要手动设置正确答案
                }));
              }
              
              content = {
                stem: q.content,
                options,
                answer: (q as any).answer || '',
                fillAnswers: (q as any).fillAnswers || [],
                solutionAnswers: (q as any).solutionAnswers || [],
                solution: (q as any).solution || ''
              };
            } else {
              // 如果content已经是对象，确保options格式正确
              let options: Array<{text: string, isCorrect: boolean}> = [];
              if (q.content?.options) {
                if (Array.isArray(q.content.options)) {
                  // 检查是否已经是正确格式
                  const firstOption = q.content.options[0];
                  if (firstOption && typeof firstOption === 'string') {
                    // 如果是string[]格式，转换为对象格式
                    options = (q.content.options as unknown as string[]).map((optionText: string) => ({
                      text: optionText,
                      isCorrect: false
                    }));
                  } else if (firstOption && typeof firstOption === 'object' && 'text' in firstOption) {
                    // 如果已经是对象格式，直接使用
                    options = q.content.options as Array<{text: string, isCorrect: boolean}>;
                  }
                }
              }
              
              content = {
                ...q.content,
                options,
                stem: q.content?.stem || '',
                answer: q.content?.answer || '',
                fillAnswers: q.content?.fillAnswers || [],
                solutionAnswers: q.content?.solutionAnswers || [],
                solution: q.content?.solution || ''
              };
            }

            return {
              ...q,
              id: q.id || q._id || `temp-${index}`,
              content,
              isSelected: false,
              // 保持原有标签，不自动添加题号标签
              tags: q.tags || []
            };
          });
          setQuestions(processedQuestions);
          // 移除直接设置filteredQuestions，让筛选逻辑处理
          
          // 只在首次进入时进行相似度检测
          if (!hasTriggeredSimilarityDetection) {
            setTimeout(() => {
              autoDetectSimilarity(processedQuestions);
              setHasTriggeredSimilarityDetection(true);
            }, 1000); // 1秒后开始检测
          }
          
          // 如果不是来自草稿且用户还没有保存过草稿，延迟显示草稿提醒
          if (!routeData.isFromDraft && !hasUserSavedDraft) {
            setTimeout(() => {
              setShowDraftReminder(true);
            }, 2000); // 2秒后显示提醒
          }
        }

        // 加载用户题库列表
        try {
          const response = await questionBankAPI.getQuestionBanks();
          if (response.data?.success && response.data.questionBanks) {
            setQuestionBanks(response.data.questionBanks);
          }
        } catch (error) {
          // 加载题库列表失败
        }
      } catch (error) {
        showErrorRightSlide('初始化失败', '页面初始化失败，请刷新重试');
      }
    };

    initializePage();
  }, [location.state, setQuestions, setFilteredQuestions, setQuestionBanks, loadDraft, setCurrentDraftId, setIsDraftMode]);

  // 处理拖拽结束
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = questions.findIndex(q => q.id === active.id);
      const newIndex = questions.findIndex(q => q.id === over?.id);

      const newQuestions = arrayMove(questions, oldIndex, newIndex);
      setQuestions(newQuestions);
      // 移除直接设置filteredQuestions，让筛选逻辑处理
    }
  };

  // 处理题目选择
  const handleQuestionSelect = useCallback((questionId: string, selected: boolean) => {
    const question = questions.find(q => q.id === questionId);
    if (!question) return;

    if (selected) {
      // 如果题目不在已选择列表中，则添加
      if (!selectedQuestions.some(q => q.id === questionId)) {
        setSelectedQuestions([...selectedQuestions, question]);
      }
    } else {
      // 如果题目在已选择列表中，则移除
      setSelectedQuestions(selectedQuestions.filter(q => q.id !== questionId));
    }
  }, [questions, selectedQuestions, setSelectedQuestions]);

  // 处理全选
  const handleSelectAll = useCallback(() => {
    setSelectedQuestions(filteredQuestions);
  }, [filteredQuestions, setSelectedQuestions]);

  // 处理取消全选
  const handleDeselectAll = useCallback(() => {
    setSelectedQuestions([]);
  }, [setSelectedQuestions]);

  // 处理批量设置来源
  const handleBatchSetSource = useCallback(async (source: string) => {
    if (selectedQuestions.length === 0) {
      showErrorRightSlide('选择错误', '请先选择题目');
      return;
    }

    try {
      const updates = selectedQuestions.map(q => ({
        id: q.id!,
        updates: { source }
      }));

      await batchUpdateQuestions(updates);
      showSuccessRightSlide('设置成功', `已为 ${selectedQuestions.length} 道题目设置来源`);
      setShowSourcePanel(false);
    } catch (error) {
      showErrorRightSlide('设置失败', '批量设置来源失败');
    }
  }, [selectedQuestions, batchUpdateQuestions, setShowSourcePanel]);

  // 处理批量AI分析
  const handleBatchAnalysis = useCallback(async () => {
    if (selectedQuestions.length === 0) {
      showErrorRightSlide('选择错误', '请先选择题目');
      return;
    }

    try {
      setAnalyzingQuestions(selectedQuestions.map(q => q.id!).filter(Boolean));
      
      // 1. 先进行AI分析获取标签
      const results = await batchAnalyzeQuestions(selectedQuestions);
      
      // 2. 立即应用标签并更新UI
      const questionsWithTags = questions.map((question) => {
        const resultIndex = selectedQuestions.findIndex(q => q.id === question.id);
        if (resultIndex !== -1 && results[resultIndex]) {
          const result = results[resultIndex];
          return {
            ...question,
            category: result.category,
            tags: result.tags,
            difficulty: result.difficulty,
            type: result.questionType
          };
        }
        return question;
      });
      
      // 3. 立即更新UI显示标签
      setQuestions(questionsWithTags);
      
      // 同时保存到分析结果中
      const newResults = { ...analysisResults };
      results.forEach((result, index) => {
        if (selectedQuestions[index].id) {
          newResults[selectedQuestions[index].id] = result;
        }
      });
      setAnalysisResults(newResults);

      // 自动保存草稿以持久化AI分析结果
      autoSaveDraft();
      
      // 4. 显示标签分析完成的消息
      showSuccessRightSlide("操作成功", `已完成 ${selectedQuestions.length} 道题目的AI分析`);
      
      // 5. 异步生成答案（不阻塞UI）
      const lowDifficultyQuestions = selectedQuestions.filter((_, index) => 
        results[index]?.difficulty <= 3
      );
      
      if (lowDifficultyQuestions.length > 0) {
        // 标记这些题目正在等待生成答案与解析
        setAnswerGeneratingQuestions(lowDifficultyQuestions.map(q => q.id!).filter(Boolean));
        // 后台异步生成答案
        generateAnswersInBackground(lowDifficultyQuestions, results);
      }
      
    } catch (error) {
      showErrorRightSlide("操作失败", '批量AI分析失败');
    } finally {
      setAnalyzingQuestions([]);
    }
  }, [selectedQuestions, questions, analysisResults, setAnalyzingQuestions, setAnalysisResults, batchAnalyzeQuestions, setQuestions]);

  // 后台异步生成答案
  const generateAnswersInBackground = useCallback(async (questionsToGenerate: Question[], results: AIAnalysisResult[]) => {
    try {
      let completedCount = 0;
      
      for (let i = 0; i < questionsToGenerate.length; i++) {
        const question = questionsToGenerate[i];
        const resultIndex = selectedQuestions.findIndex(q => q.id === question.id);
        const result = results[resultIndex];
        
        if (!result) continue;
        
        try {
          const answerResult = await questionAnalysisAPI.generateAnswer({
            content: question.content.stem,
            type: result.questionType,
            difficulty: result.difficulty,
            category: result.category,
            tags: result.tags
          });
          
          if (answerResult.data?.data) {
            const answerData = answerResult.data.data;
            
            // 更新单个题目的答案
            setQuestions(questions.map(q => 
              q.id === question.id ? {
                ...q,
                content: {
                  ...q.content,
                  answer: answerData.answer || '',
                  solution: answerData.solution || '',
                  fillAnswers: answerData.fillAnswers || [],
                  solutionAnswers: answerData.solutionAnswers || []
                }
              } : q
            ));
            // 从“等待生成答案”队列移除
            setAnswerGeneratingQuestions(prev => prev.filter(id => id !== question.id));
            
            completedCount++;
          }
        } catch (answerError) {
          // 错误日志已清理
          // 失败也移除等待状态，避免卡住
          setAnswerGeneratingQuestions(prev => prev.filter(id => id !== question.id));
        }
      }
      
      // 答案生成完成后显示提示
      if (completedCount > 0) {
        showSuccessRightSlide("答案生成完成", `已为 ${completedCount} 道低难度题目生成答案和解析`);
        // 重新保存草稿以包含答案
        autoSaveDraft();
      }
    } catch (error) {
      // 错误日志已清理
    }
  }, [selectedQuestions, setQuestions, questions]);

  // 处理单题AI分析
  const handleSingleAnalysis = useCallback(async (questionId: string) => {
    const question = questions.find(q => q.id === questionId);
    if (!question) return;

    try {
      setAnalyzingQuestions([...analyzingQuestions, questionId]);
      
      // 1. 先进行AI分析获取标签
      const result = await analyzeQuestion(question.content.stem);
      
      // 2. 立即应用标签并更新UI
      const updatedQuestion = {
        ...question,
        category: result.category,
        tags: result.tags,
        difficulty: result.difficulty,
        type: result.questionType
      };
      
      // 3. 立即更新UI显示标签
      const updatedQuestions = questions.map(q => 
        q.id === questionId ? updatedQuestion : q
      );
      setQuestions(updatedQuestions);
      
      // 同时保存到分析结果中
      setAnalysisResults({
        ...analysisResults,
        [questionId]: result
      });

      // 自动保存草稿以持久化AI分析结果
      autoSaveDraft();
      
      // 4. 显示标签分析完成的消息
      showSuccessRightSlide("操作成功", 'AI分析完成，已应用到题目');
      
      // 5. 如果难度为3星及以下，异步生成答案
      if (result.difficulty <= 3) {
        setAnswerGeneratingQuestions(prev => Array.from(new Set([...(prev || []), questionId])));
        generateSingleAnswerInBackground(questionId, question, result);
      }
      
    } catch (error) {
      showErrorRightSlide("操作失败", 'AI分析失败');
    } finally {
      setAnalyzingQuestions(analyzingQuestions.filter(id => id !== questionId));
    }
  }, [questions, analyzingQuestions, analysisResults, setAnalyzingQuestions, setAnalysisResults, analyzeQuestion, setQuestions]);

  // 后台异步生成单题答案
  const generateSingleAnswerInBackground = useCallback(async (questionId: string, question: Question, result: AIAnalysisResult) => {
    try {
      const answerResult = await questionAnalysisAPI.generateAnswer({
        content: question.content.stem,
        type: result.questionType,
        difficulty: result.difficulty,
        category: result.category,
        tags: result.tags
      });
      
      if (answerResult.data?.data) {
        const answerData = answerResult.data.data;
        
        // 更新题目的答案和解析
        setQuestions(questions.map(q => 
          q.id === questionId ? {
            ...q,
            content: {
              ...q.content,
              answer: answerData.answer || '',
              solution: answerData.solution || '',
              fillAnswers: answerData.fillAnswers || [],
              solutionAnswers: answerData.solutionAnswers || []
            }
          } : q
        ));
        
        // 重新保存草稿以包含答案
        autoSaveDraft();
        
        // 显示答案生成完成的消息
        showSuccessRightSlide("答案生成完成", '已为题目生成答案和解析');
      }
    } catch (answerError) {
      // 错误日志已清理
      // 答案生成失败不影响标签分析结果，不显示错误消息
    } finally {
      // 无论成功或失败，移除等待状态
      setAnswerGeneratingQuestions(prev => prev.filter(id => id !== questionId));
    }
  }, [setQuestions, questions]);

  // 自动相似度检测函数
  const autoDetectSimilarity = useCallback(async (questionsToDetect: Question[]) => {
    if (questionsToDetect.length === 0) return;

    const newDetectedSimilarQuestions = new Map<string, SimilarityResult[]>();

    try {
      // 为每道题进行相似度检测
      const detectionPromises = questionsToDetect.map(async (question) => {
        if (!question.content?.stem?.trim()) return;

        try {
          const response = await questionAPI.detectSimilarity({
            stem: question.content.stem.trim(),
            type: 'choice',
            difficulty: 3,
            category: '',
            tags: question.tags || [],
            threshold: 0.75, // 提高阈值，只显示高相似度的题目
            excludeQuestionId: question.id || question._id // 排除当前题目本身
          });

          if (response.data?.similarQuestions && response.data.similarQuestions.length > 0) {
            newDetectedSimilarQuestions.set(question.id || question._id, response.data.similarQuestions);
          }
        } catch (error) {
          // 题目相似度检测失败
        }
      });

      await Promise.all(detectionPromises);

      // 更新检测结果
      setDetectedSimilarQuestions(newDetectedSimilarQuestions);

      // 如果有检测到相似题目，显示第一个
      if (newDetectedSimilarQuestions.size > 0) {
        const questionIds = Array.from(newDetectedSimilarQuestions.keys());
        setSimilarityQuestionIds(questionIds);
        setCurrentSimilarityQuestionIndex(0);
        
        const firstQuestionId = questionIds[0];
        const firstQuestion = questionsToDetect.find(q => q.id === firstQuestionId);
        const similarQuestions = newDetectedSimilarQuestions.get(firstQuestionId) || [];

        if (firstQuestion && similarQuestions.length > 0) {
          const questionData = {
            type: firstQuestion.type,
            content: {
              stem: firstQuestion.content?.stem,
              answer: firstQuestion.content?.answer,
              options: (firstQuestion.type === 'choice' || firstQuestion.type === 'multiple-choice') ? firstQuestion.content?.options?.map((option, index) => ({
                text: option.text,
                isCorrect: firstQuestion.content?.answer?.includes(String.fromCharCode(65 + index))
              })) : undefined
            },
            category: Array.isArray(firstQuestion.category) ? firstQuestion.category.join(', ') : (typeof firstQuestion.category === 'string' ? firstQuestion.category : ''),
            tags: firstQuestion.tags,
            difficulty: firstQuestion.difficulty || 3,
            source: firstQuestion.source
          };

          setPendingQuestionData(questionData);
          setSimilarQuestions(similarQuestions);
          setShowSimilarityModal(true);
        }
      }
    } catch (error) {
      // 自动相似度检测失败
    }
  }, [questions]);

  // 翻页到下一题
  const handleNextSimilarityQuestion = useCallback(() => {
    if (currentSimilarityQuestionIndex < similarityQuestionIds.length - 1) {
      const nextIndex = currentSimilarityQuestionIndex + 1;
      const nextQuestionId = similarityQuestionIds[nextIndex];
      const nextQuestion = questions.find(q => q.id === nextQuestionId);
      const similarQuestions = detectedSimilarQuestions.get(nextQuestionId) || [];

      if (nextQuestion && similarQuestions.length > 0) {
        const questionData = {
          type: nextQuestion.type,
          content: {
            stem: nextQuestion.content?.stem,
            answer: nextQuestion.content?.answer,
            options: (nextQuestion.type === 'choice' || nextQuestion.type === 'multiple-choice') ? nextQuestion.content?.options?.map((option, index) => ({
              text: option.text,
              isCorrect: nextQuestion.content?.answer?.includes(String.fromCharCode(65 + index))
            })) : undefined
          },
          category: Array.isArray(nextQuestion.category) ? nextQuestion.category.join(', ') : (typeof nextQuestion.category === 'string' ? nextQuestion.category : ''),
          tags: nextQuestion.tags,
          difficulty: nextQuestion.difficulty || 3,
          source: nextQuestion.source
        };

        setPendingQuestionData(questionData);
        setSimilarQuestions(similarQuestions);
        setCurrentSimilarityQuestionIndex(nextIndex);
      }
    }
  }, [currentSimilarityQuestionIndex, similarityQuestionIds, questions, detectedSimilarQuestions]);

  // 翻页到上一题
  const handlePrevSimilarityQuestion = useCallback(() => {
    if (currentSimilarityQuestionIndex > 0) {
      const prevIndex = currentSimilarityQuestionIndex - 1;
      const prevQuestionId = similarityQuestionIds[prevIndex];
      const prevQuestion = questions.find(q => q.id === prevQuestionId);
      const similarQuestions = detectedSimilarQuestions.get(prevQuestionId) || [];

      if (prevQuestion && similarQuestions.length > 0) {
        const questionData = {
          type: prevQuestion.type,
          content: {
            stem: prevQuestion.content?.stem,
            answer: prevQuestion.content?.answer,
            options: (prevQuestion.type === 'choice' || prevQuestion.type === 'multiple-choice') ? prevQuestion.content?.options?.map((option, index) => ({
              text: option.text,
              isCorrect: prevQuestion.content?.answer?.includes(String.fromCharCode(65 + index))
            })) : undefined
          },
          category: Array.isArray(prevQuestion.category) ? prevQuestion.category.join(', ') : (typeof prevQuestion.category === 'string' ? prevQuestion.category : ''),
          tags: prevQuestion.tags,
          difficulty: prevQuestion.difficulty || 3,
          source: prevQuestion.source
        };

        setPendingQuestionData(questionData);
        setSimilarQuestions(similarQuestions);
        setCurrentSimilarityQuestionIndex(prevIndex);
      }
    }
  }, [currentSimilarityQuestionIndex, similarityQuestionIds, questions, detectedSimilarQuestions]);

  // 处理题目编辑
  const handleEditQuestion = useCallback((questionId: string) => {
    if (!isDraftMode && !hasUserSavedDraft) {
      // 显示草稿提醒而不是简单的toast
      setIsEditModeReminder(true);
      setShowDraftReminder(true);
      return;
    }
    
    const question = questions.find(q => (q.id || q._id) === questionId);
    if (question) {
      setEditingQuestion(question);
    }
  }, [questions, isDraftMode]);

  // 处理题目分割
  const handleSplitQuestion = useCallback((questionId: string) => {
    if (!isDraftMode && !hasUserSavedDraft) {
      // 显示草稿提醒
      setIsEditModeReminder(true);
      setShowDraftReminder(true);
      return;
    }
    
    const question = questions.find(q => (q.id || q._id) === questionId);
    if (question) {
      setSplittingQuestion(question);
    }
  }, [questions, isDraftMode]);

  // 处理分割确认
  const handleSplitConfirm = useCallback(async (newQuestions: Question[]) => {
    if (!splittingQuestion) return;

    try {
      // 移除原题目
      const updatedQuestions = questions.filter(q => q.id !== splittingQuestion.id);
      
      // 添加新题目
      const finalQuestions = [...updatedQuestions, ...newQuestions];
      
      // 更新题目列表
      setQuestions(finalQuestions);
      // 移除直接设置filteredQuestions，让筛选逻辑处理
      
      // 自动保存草稿
      autoSaveDraft();
      
      showSuccessRightSlide("操作成功", `已将题目分割为 ${newQuestions.length} 道新题目`);
    } catch (error) {
      showErrorRightSlide("操作失败", '分割题目失败');
    } finally {
      setSplittingQuestion(null);
    }
  }, [splittingQuestion, questions, setQuestions, autoSaveDraft]);

  // 处理编辑保存
  const handleSaveEdit = useCallback(async (updatedQuestion: Partial<Question>) => {
    try {
      if (editingQuestion) {
        // 使用本地ID进行更新
        const questionId = editingQuestion.id || editingQuestion._id;
        if (questionId) {
          await updateQuestion(questionId, updatedQuestion);
          
          // 如果已经保存过试卷，显示自动保存提示
          if (isDraftMode) {
            showSuccessRightSlide("操作成功", '题目更新成功，已自动保存');
          } else {
            showSuccessRightSlide("操作成功", '题目更新成功');
          }
        } else {
          showErrorRightSlide("操作失败", '题目ID不存在，无法保存');
        }
      }
      setEditingQuestion(null);
    } catch (error) {
      showErrorRightSlide("操作失败", '保存编辑失败');
    }
  }, [editingQuestion, updateQuestion, isDraftMode]);

  // 处理编辑取消
  const handleCancelEdit = useCallback(() => {
    setEditingQuestion(null);
  }, []);





  // 处理相似度检测继续
  const handleSimilarityContinue = useCallback(async () => {
    setShowSimilarityModal(false);
    setPendingQuestionData(null);
    setSimilarQuestions([]);
  }, []);

  // 处理相似度检测取消
  const handleSimilarityCancel = useCallback(() => {
    setShowSimilarityModal(false);
    setPendingQuestionData(null);
    setSimilarQuestions([]);
  }, []);



  // 处理题目删除
  const handleQuestionDelete = useCallback(async (questionId: string) => {
    if (!isDraftMode && !hasUserSavedDraft) {
      setIsEditModeReminder(true);
      setShowDraftReminder(true);
      return;
    }
    
    try {
      await deleteQuestion(questionId);
      showSuccessRightSlide("操作成功", '题目删除成功');
    } catch (error) {
      showErrorRightSlide("操作失败", '题目删除失败');
    }
  }, [deleteQuestion, isDraftMode]);

  // 处理批量删除
  const handleBatchDelete = useCallback(async () => {
    if (!isDraftMode && !hasUserSavedDraft) {
      setIsEditModeReminder(true);
      setShowDraftReminder(true);
      return;
    }
    
    if (selectedQuestions.length === 0) {
      showErrorRightSlide("操作失败", '请先选择题目');
      return;
    }

    try {
      await batchDeleteQuestions(selectedQuestions.map(q => q.id!).filter(Boolean));
      showSuccessRightSlide("操作成功", `已删除 ${selectedQuestions.length} 道题目`);
      setSelectedQuestions([]);
      setShowConfirmDelete(false);
    } catch (error) {
      showErrorRightSlide("操作失败", '批量删除失败');
    }
  }, [selectedQuestions, batchDeleteQuestions, setSelectedQuestions, setShowConfirmDelete, isDraftMode]);

  // 处理批量移动
  const handleBatchMove = useCallback((targetIndex: number, moveAfter: boolean) => {
    if (!isDraftMode && !hasUserSavedDraft) {
      setIsEditModeReminder(true);
      setShowDraftReminder(true);
      return;
    }
    
    if (selectedQuestions.length === 0) {
      showErrorRightSlide("操作失败", '请先选择题目');
      return;
    }

    try {
      // 获取选中题目的ID列表
      const selectedIds = selectedQuestions.map(q => q.id!).filter(Boolean);
      
      // 获取目标题目的ID
      const targetQuestionId = questions[targetIndex]?.id;
      if (!targetQuestionId) {
        showErrorRightSlide("操作失败", '目标题目不存在');
        return;
      }
      
      // 从当前题目列表中移除选中的题目
      const remainingQuestions = questions.filter(q => !selectedIds.includes(q.id!));
      
      // 在剩余题目中找到目标题目的新位置
      const newTargetIndex = remainingQuestions.findIndex(q => q.id === targetQuestionId);
      if (newTargetIndex === -1) {
        showErrorRightSlide("操作失败", '目标题目不存在');
        return;
      }
      
      // 计算实际插入位置
      const actualTargetIndex = moveAfter ? newTargetIndex + 1 : newTargetIndex;
      
      // 在目标位置插入选中的题目
      const newQuestions = [
        ...remainingQuestions.slice(0, actualTargetIndex),
        ...selectedQuestions,
        ...remainingQuestions.slice(actualTargetIndex)
      ];
      
      // 更新题目列表
      setQuestions(newQuestions);
      
      // 清空选择
      setSelectedQuestions([]);
      
      showSuccessRightSlide("操作成功", `已移动 ${selectedQuestions.length} 道题目`);
    } catch (error) {
      showErrorRightSlide("操作失败", '批量移动失败');
    }
  }, [selectedQuestions, questions, setQuestions, setSelectedQuestions, isDraftMode, setIsEditModeReminder, setShowDraftReminder]);



  // 处理题目保存
  const handleSaveQuestions = useCallback(async (targetBankId: string) => {
    if (selectedQuestions.length === 0) {
      showErrorRightSlide("操作失败", '请先选择题目');
      return;
    }

    try {
      setSavingQuestions(selectedQuestions.map(q => q.id!).filter(Boolean));
      setSaveProgress(0);

      // 从questions数组中获取最新的题目数据，确保包含所有更新
      const latestQuestions = selectedQuestions.map(selectedQ => {
        const latestQ = questions.find(q => q.id === selectedQ.id);
        return latestQ || selectedQ;
      });

      await saveQuestions(latestQuestions, targetBankId);
      
      showSuccessRightSlide("操作成功",  `已保存 ${selectedQuestions.length} 道题目到题库`);
      setShowSavePanel(false);
      
      // 跳转到题库详情页
      navigate(`/question-banks/${targetBankId}`);
    } catch (error) {
      showErrorRightSlide("操作失败", '保存题目失败');
    } finally {
      setSavingQuestions([]);
      setSaveProgress(0);
    }
  }, [selectedQuestions, questions, saveQuestions, setSavingQuestions, setSaveProgress, setShowSavePanel, navigate]);

  // 返回批量上传页面
  const handleBack = () => {
    // 如果用户没有保存过草稿且当前有题目，显示确认对话框
    if (!hasUserSavedDraft && !isDraftMode && questions.length > 0) {
      setShowLeaveConfirm(true);
    } else {
      // 如果用户已经保存过草稿，自动保存当前状态
      if (hasUserSavedDraft && isDraftMode && currentDraftId) {
        const currentDrafts = useQuestionPreviewStore.getState().drafts;
        const updatedDrafts = currentDrafts.map(draft => 
          draft.id === currentDraftId 
            ? { ...draft, questions, updatedAt: new Date() }
            : draft
        );
        useQuestionPreviewStore.getState().setDrafts(updatedDrafts);
      }
      navigate('/batch-upload');
    }
  };

  // 确认离开
  const handleConfirmLeave = () => {
    setShowLeaveConfirm(false);
    navigate('/batch-upload');
  };

  // 取消离开
  const handleCancelLeave = () => {
    setShowLeaveConfirm(false);
  };

  // 处理用户主动保存草稿
  const handleUserSaveDraft = () => {
    setHasUserSavedDraft(true);
    // 关闭草稿提醒
    setShowDraftReminder(false);
    setIsEditModeReminder(false);
  };

  // 处理草稿保存成功
  const handleDraftSaveSuccess = () => {
    setHasUserSavedDraft(true);
    setShowDraftReminder(false);
    setIsEditModeReminder(false);
  };

  // 如果草稿被删除且没有题目，显示空状态
  if (questions.length === 0 && !isDraftMode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-6">
          {/* 页面头部 */}
          <QuestionPreviewHeader
            totalQuestions={0}
            selectedCount={0}
            onBack={handleBack}
            onOpenDraftManager={() => setShowDraftManager(true)}
            isDraftMode={false}
          />

          {/* 空状态 */}
          <div className="flex flex-col items-center justify-center py-20">
            <div className="text-center">
              <div className="mx-auto h-24 w-24 text-gray-400 dark:text-gray-500 mb-6">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-full h-full">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">草稿已清空</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">所有题目已被删除，草稿已自动清理</p>
              <div className="flex space-x-4">
                <Button
                  onClick={handleBack}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  返回批量上传
                </Button>
                <Button
                  onClick={() => setShowDraftManager(true)}
                  variant="outline"
                  className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  查看其他草稿
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 flex flex-col">
      <div className="max-w-7xl mx-auto px-4 py-4 sm:py-6 w-full flex-1 flex flex-col">
        {/* 页面头部 - 固定高度 */}
        <div className="flex-shrink-0">
          <QuestionPreviewHeader
            totalQuestions={questions.length}
            selectedCount={selectedQuestions.length}
            onBack={handleBack}
            onOpenDraftManager={() => setShowDraftManager(true)}
            isDraftMode={isDraftMode}
          />
        </div>

        {/* 统计面板 - 固定高度 */}
        <div className="flex-shrink-0 mt-4">
          <QuestionPreviewStats
            totalQuestions={questions.length}
            selectedCount={selectedQuestions.length}
            analyzedCount={Object.keys(analysisResults).length}
          />
        </div>

        {/* 工具栏 - 固定高度 */}
        <div className="flex-shrink-0 mt-4">
          <QuestionPreviewToolbar
            viewMode={viewMode}
            searchTerm={searchTerm}
            filters={filters}
            sortBy={sortBy}
            onViewModeChange={setViewMode}
            onSearchChange={setSearchTerm}
            onFiltersChange={setFilters}
            onSortChange={setSortBy}
            onSelectAll={handleSelectAll}
            onDeselectAll={handleDeselectAll}
            onBatchSetSource={() => setShowSourcePanel(true)}
            onBatchAnalysis={handleBatchAnalysis}
            onBatchMove={() => setShowBatchMoveModal(true)}
            onBatchDelete={() => setShowConfirmDelete(true)}
            onSave={() => setShowSavePanel(true)}
            selectedCount={selectedQuestions.length}
            totalCount={filteredQuestions.length}
            analyzingQuestions={analyzingQuestions}
          />
        </div>

        {/* 题目列表 - 可滚动区域 */}
        <div className="flex-1 overflow-hidden mt-4">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={filteredQuestions.map(q => q.id!).filter(Boolean)}
              strategy={viewMode === 'grid' ? rectSortingStrategy : verticalListSortingStrategy}
            >
              {viewMode === 'grid' ? (
                <div className="h-full overflow-y-auto">
                  <QuestionGrid
                    questions={filteredQuestions}
                    selectedQuestions={selectedQuestions}
                    analyzingQuestions={analyzingQuestions}
                    answerGeneratingQuestions={answerGeneratingQuestions}
                    onSelect={handleQuestionSelect}
                    onEdit={handleEditQuestion}
                    onAnalyze={handleSingleAnalysis}
                    onDelete={handleQuestionDelete}
                    onSplit={handleSplitQuestion}
                  />
                </div>
              ) : (
                <div className="h-full overflow-y-auto">
                  <QuestionList
                    questions={filteredQuestions}
                    selectedQuestions={selectedQuestions}
                    analyzingQuestions={analyzingQuestions}
                    answerGeneratingQuestions={answerGeneratingQuestions}
                    onSelect={handleQuestionSelect}
                    onEdit={handleEditQuestion}
                    onAnalyze={handleSingleAnalysis}
                    onDelete={handleQuestionDelete}
                    onSplit={handleSplitQuestion}
                  />
                </div>
              )}
            </SortableContext>
          </DndContext>
        </div>
      </div>

      {/* 来源设置面板 */}
      <AnimatePresence>
        {showSourcePanel && (
          <SourceSettingPanel
            onClose={() => setShowSourcePanel(false)}
            onConfirm={handleBatchSetSource}
            selectedCount={selectedQuestions.length}
          />
        )}
      </AnimatePresence>

      {/* AI分析面板 */}
      <AnimatePresence>
        {showAnalysisPanel && (
          <AIAnalysisPanel
            onClose={() => setShowAnalysisPanel(false)}
            onAnalyze={handleBatchAnalysis}
            selectedCount={selectedQuestions.length}
            isAnalyzing={analyzingQuestions.length > 0}
          />
        )}
      </AnimatePresence>

      {/* 题目保存面板 */}
      <AnimatePresence>
        {showSavePanel && (
          <QuestionSavePanel
            onClose={() => setShowSavePanel(false)}
            onSave={handleSaveQuestions}
            questionBanks={questionBanks}
            selectedQuestionBank={selectedQuestionBank}
            onQuestionBankChange={setSelectedQuestionBank}
            selectedCount={selectedQuestions.length}
            isSaving={savingQuestions.length > 0}
            saveProgress={saveProgress}
          />
        )}
      </AnimatePresence>

      {/* 题目编辑模态框 */}
      <QuestionEditModal
        isOpen={!!editingQuestion}
        question={editingQuestion}
        questionBank={null} // 这里可以传入当前题库信息
        onClose={handleCancelEdit}
        onSave={handleSaveEdit}
      />

      {/* 批量移动模态框 */}
      <BatchMoveModal
        isOpen={showBatchMoveModal}
        selectedQuestions={selectedQuestions}
        allQuestions={questions}
        onClose={() => setShowBatchMoveModal(false)}
        onMove={handleBatchMove}
      />

      {/* 确认删除对话框 */}
      <ConfirmDialog
        isOpen={showConfirmDelete}
        onClose={() => setShowConfirmDelete(false)}
        onConfirm={handleBatchDelete}
        title="确认删除"
        message={`确定要删除选中的 ${selectedQuestions.length} 道题目吗？此操作不可撤销.`}
        confirmText="删除"
        cancelText="取消"
        type="danger"
      />

      {/* 离开确认对话框 */}
      <ConfirmDialog
        isOpen={showLeaveConfirm}
        onClose={handleCancelLeave}
        onConfirm={handleConfirmLeave}
        title="确认离开"
        message="您有未保存的题目，确定要离开吗？离开后未保存的更改将丢失."
        confirmText="离开"
        cancelText="取消"
        type="warning"
      />

      {/* 草稿管理器 */}
      <DraftManager
        isOpen={showDraftManager}
        onClose={() => setShowDraftManager(false)}
        onUserSaveDraft={handleUserSaveDraft}
      />

      {/* 草稿提醒模态框 */}
      <DraftReminderModal
        isOpen={showDraftReminder}
        onClose={() => {
          setShowDraftReminder(false);
          setIsEditModeReminder(false);
        }}
        onSaveSuccess={handleDraftSaveSuccess}
        questionCount={questions.length}
        isEditMode={isEditModeReminder}
      />

      {/* 题目分割模态框 */}
      <QuestionSplitModal
        isOpen={!!splittingQuestion}
        question={splittingQuestion}
        onClose={() => setSplittingQuestion(null)}
        onSplit={handleSplitConfirm}
      />

      {/* 相似度检测模态框 */}
      <SimilarityDetectionModal
        isOpen={showSimilarityModal}
        onClose={handleSimilarityCancel}
        similarQuestions={similarQuestions}
        onContinue={handleSimilarityContinue}
        onCancel={handleSimilarityCancel}
        questionData={pendingQuestionData}
        detectedSimilarQuestions={detectedSimilarQuestions}
        onNextQuestion={handleNextSimilarityQuestion}
        onPrevQuestion={handlePrevSimilarityQuestion}
        currentQuestionIndex={currentSimilarityQuestionIndex}
        totalQuestions={similarityQuestionIds.length}
      />

      {/* 右侧滑入通知 */}
      <RightSlideModal
        isOpen={rightSlideModal.isOpen}
        title={rightSlideModal.title}
        message={rightSlideModal.message}
        type={rightSlideModal.type}
        width={rightSlideModal.width}
        autoClose={rightSlideModal.autoClose}
        showProgress={rightSlideModal.showProgress}
        onClose={closeRightSlide}
      />
    </div>
  );
};

export default QuestionPreviewPage; 