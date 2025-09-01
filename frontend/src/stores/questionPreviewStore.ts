import { create } from 'zustand';
import { questionAPI, questionAnalysisAPI } from '../services/api';
import { userDraftAPI, type QuestionDraft } from '../services/questionDraftAPI';
import type { Question, QuestionBank, AIAnalysisResult } from '../types';

// 筛选状态接口
export interface FilterState {
  type: string[];
  difficulty: number[];
  tags: string[];
  source: string[];
}

// 排序选项接口
export interface SortOption {
  field: 'createdAt' | 'updatedAt' | 'difficulty' | 'type' | 'title';
  order: 'asc' | 'desc';
}

// 状态接口
export interface QuestionPreviewState {
  // 题目数据
  questions: Question[];
  filteredQuestions: Question[];
  selectedQuestions: Question[];
  
  // 界面状态
  viewMode: 'grid' | 'list';
  searchTerm: string;
  filters: FilterState;
  sortBy: SortOption;
  
  // 编辑状态
  editingQuestionId?: string;
  isBatchEditing: boolean;
  
  // 分析状态
  analyzingQuestions: string[];
  analysisResults: Record<string, AIAnalysisResult>;
  
  // 保存状态
  savingQuestions: string[];
  saveProgress: number;
  
  // 题库数据
  questionBanks: QuestionBank[];
  selectedQuestionBank?: string;

  // 草稿状态
  drafts: QuestionDraft[];
  currentDraftId?: string;
  isDraftMode: boolean;
  isLoadingDrafts: boolean;
  draftError?: string;
  
  // 缓存机制
  draftCache: Map<string, QuestionDraft>;
  lastCacheTime: number;
}

// 操作方法接口
export interface QuestionPreviewActions {
  // 状态设置方法
  setQuestions: (questions: Question[]) => void;
  setFilteredQuestions: (questions: Question[]) => void;
  setSelectedQuestions: (questions: Question[]) => void;
  setViewMode: (mode: 'grid' | 'list') => void;
  setSearchTerm: (term: string) => void;
  setFilters: (filters: FilterState) => void;
  setSortBy: (sort: SortOption) => void;
  setEditingQuestionId: (id?: string) => void;
  setIsBatchEditing: (editing: boolean) => void;
  setAnalyzingQuestions: (ids: string[]) => void;
  setAnalysisResults: (results: Record<string, AIAnalysisResult>) => void;
  setSavingQuestions: (ids: string[]) => void;
  setSaveProgress: (progress: number) => void;
  setQuestionBanks: (banks: QuestionBank[]) => void;
  setSelectedQuestionBank: (bankId?: string) => void;
  
  // 草稿相关方法
  setDrafts: (drafts: QuestionDraft[]) => void;
  setCurrentDraftId: (id?: string) => void;
  setIsDraftMode: (mode: boolean) => void;
  setIsLoadingDrafts: (loading: boolean) => void;
  setDraftError: (error?: string) => void;
  
  // 草稿API方法
  fetchDrafts: () => Promise<void>;
  saveDraft: (name: string, description?: string) => Promise<QuestionDraft>;
  loadDraft: (draftId: string) => Promise<void>;
  deleteDraft: (draftId: string) => Promise<void>;
  updateDraft: (draftId: string, updates: Partial<QuestionDraft>) => Promise<QuestionDraft>;
  duplicateDraft: (draftId: string) => Promise<QuestionDraft>;
  batchDeleteDrafts: (draftIds: string[]) => Promise<{ deletedCount: number }>;
  
  // 业务方法
  updateQuestion: (id: string, updates: Partial<Question>) => Promise<void>;
  deleteQuestion: (id: string) => Promise<void>;
  batchUpdateQuestions: (updates: Array<{id: string, updates: Partial<Question>}>) => Promise<void>;
  batchDeleteQuestions: (ids: string[]) => Promise<void>;
  analyzeQuestion: (content: string) => Promise<AIAnalysisResult>;
  batchAnalyzeQuestions: (questions: Question[]) => Promise<AIAnalysisResult[]>;
  saveQuestions: (questions: Question[], targetBankId: string) => Promise<{ 
      success: boolean; 
      savedCount: number; 
      failedCount: number;
      totalQuestions: number;
      failedQuestions: Array<{id: string, error: string, question: any}>;
      hasFailures: boolean;
      validationErrors?: boolean;
    }>;
  
  // 工具方法
  reset: () => void;
}

// 创建store
export const useQuestionPreviewStore = create<QuestionPreviewState & QuestionPreviewActions>()(
  (set, get) => ({
    // 初始状态
    questions: [],
    filteredQuestions: [],
    selectedQuestions: [],
    viewMode: 'grid',
    searchTerm: '',
    filters: {
      type: [],
      difficulty: [],
      tags: [],
      source: []
    },
    sortBy: {
      field: 'createdAt',
      order: 'desc'
    },
    editingQuestionId: undefined,
    isBatchEditing: false,
    analyzingQuestions: [],
    analysisResults: {},
    savingQuestions: [],
    saveProgress: 0,
    questionBanks: [],
    selectedQuestionBank: undefined,
    drafts: [],
    currentDraftId: undefined,
    isDraftMode: false,
    isLoadingDrafts: false,
    draftError: undefined,
    draftCache: new Map(),
    lastCacheTime: 0,

    // 状态设置方法
    setQuestions: (questions) => set({ questions, filteredQuestions: questions }),
    setFilteredQuestions: (questions) => set({ filteredQuestions: questions }),
    setSelectedQuestions: (questions) => set({ selectedQuestions: questions }),
    setViewMode: (viewMode) => set({ viewMode }),
    setSearchTerm: (searchTerm) => set({ searchTerm }),
    setFilters: (filters) => set({ filters }),
    setSortBy: (sortBy) => set({ sortBy }),
    setEditingQuestionId: (editingQuestionId) => set({ editingQuestionId }),
    setIsBatchEditing: (isBatchEditing) => set({ isBatchEditing }),
    setAnalyzingQuestions: (analyzingQuestions) => set({ analyzingQuestions }),
    setAnalysisResults: (analysisResults) => set({ analysisResults }),
    setSavingQuestions: (savingQuestions) => set({ savingQuestions }),
    setSaveProgress: (saveProgress) => set({ saveProgress }),
    setQuestionBanks: (questionBanks) => set({ questionBanks }),
    setSelectedQuestionBank: (selectedQuestionBank) => set({ selectedQuestionBank }),

    // 草稿状态设置方法
    setDrafts: (drafts) => set({ drafts }),
    setCurrentDraftId: (currentDraftId) => set({ currentDraftId }),
    setIsDraftMode: (isDraftMode) => set({ isDraftMode }),
    setIsLoadingDrafts: (isLoadingDrafts) => set({ isLoadingDrafts }),
    setDraftError: (draftError) => set({ draftError }),

    // 草稿API方法
    fetchDrafts: async () => {
      try {
        set({ isLoadingDrafts: true, draftError: undefined });
        const result = await userDraftAPI.getDrafts();
        
        // 检查结果是否有效
        if (!result || !result.drafts || !Array.isArray(result.drafts)) {
          console.warn('获取草稿列表返回数据格式异常:', result);
          set({ drafts: [], isLoadingDrafts: false });
          return;
        }
        
        // 预加载所有草稿的详细数据，避免后续加载时的延迟
        const draftsWithDetails = await Promise.all(
          result.drafts.map(async (draft) => {
            try {
              // 检查草稿是否有效
              if (!draft || !draft._id) {
                console.warn('跳过无效草稿:', draft);
                return null;
              }
              
              // 如果草稿没有完整的题目数据，则获取详细数据
              if (!draft.questions || draft.questions.length === 0) {
                const detailedDraft = await userDraftAPI.getDraftById(draft._id);
                return detailedDraft;
              }
              return draft;
            } catch (error) {
              console.error(`预加载草稿 ${draft?._id || 'unknown'} 失败:`, error);
              return draft; // 返回原始数据
            }
          })
        );
        
        // 过滤掉无效的草稿
        const validDrafts = draftsWithDetails.filter(draft => draft !== null);
        
        set({ drafts: validDrafts, isLoadingDrafts: false });
      } catch (error) {
        console.error('获取草稿列表失败:', error);
        set({ 
          drafts: [], // 确保设置为空数组而不是undefined
          isLoadingDrafts: false, 
          draftError: error instanceof Error ? error.message : '获取草稿列表失败' 
        });
      }
    },

    saveDraft: async (name, description) => {
      try {
        const { questions } = get();
        const draftData = {
          name: name.trim(),
          description: description?.trim(),
          questions,
          tags: []
        };
        
        const newDraft = await userDraftAPI.createDraft(draftData);
        
        // 更新本地草稿列表
        set(state => ({
          drafts: [newDraft, ...state.drafts],
          currentDraftId: newDraft._id,
          isDraftMode: true
        }));
        
        return newDraft;
      } catch (error) {
        console.error('保存草稿失败:', error);
        
        // 根据错误类型提供更详细的错误信息
        let errorMessage = '保存草稿失败';
        if (error instanceof Error) {
          if (error.message.includes('401')) {
            errorMessage = '认证失败，请重新登录';
          } else if (error.message.includes('400')) {
            errorMessage = '草稿数据格式错误';
          } else if (error.message.includes('500')) {
            errorMessage = '服务器错误，请稍后重试';
          } else {
            errorMessage = error.message;
          }
        }
        
        throw new Error(errorMessage);
      }
    },

    loadDraft: async (draftId) => {
      try {
        const state = get();
        
        // 1. 先检查本地草稿列表
        const existingDraft = state.drafts.find(d => d._id === draftId);
        if (existingDraft && existingDraft.questions && existingDraft.questions.length > 0) {
          set({
            questions: existingDraft.questions,
            filteredQuestions: existingDraft.questions,
            selectedQuestions: [],
            currentDraftId: draftId,
            isDraftMode: true
          });
          return;
        }
        
        // 2. 检查缓存（缓存5分钟）
        const cacheAge = Date.now() - state.lastCacheTime;
        const cachedDraft = state.draftCache.get(draftId);
        if (cachedDraft && cacheAge < 5 * 60 * 1000) {
          set({
            questions: cachedDraft.questions,
            filteredQuestions: cachedDraft.questions,
            selectedQuestions: [],
            currentDraftId: draftId,
            isDraftMode: true
          });
          return;
        }
        
        // 3. 从服务器获取
        const draft = await userDraftAPI.getDraftById(draftId);
        
        // 4. 更新缓存
        const newCache = new Map(state.draftCache);
        newCache.set(draftId, draft);
        
        set({
          questions: draft.questions,
          filteredQuestions: draft.questions,
          selectedQuestions: [],
          currentDraftId: draftId,
          isDraftMode: true,
          draftCache: newCache,
          lastCacheTime: Date.now()
        });
      } catch (error) {
        console.error('加载草稿失败:', error);
        throw error;
      }
    },

    deleteDraft: async (draftId) => {
      try {
        await userDraftAPI.deleteDraft(draftId);
        
        // 更新本地草稿列表
        set(state => {
          const updatedDrafts = state.drafts.filter(d => d._id !== draftId);
          const shouldClearCurrentDraft = state.currentDraftId === draftId;
          
          return {
            drafts: updatedDrafts,
            currentDraftId: shouldClearCurrentDraft ? undefined : state.currentDraftId,
            isDraftMode: shouldClearCurrentDraft ? false : state.isDraftMode,
            // 如果删除的是当前草稿，清空题目列表
            questions: shouldClearCurrentDraft ? [] : state.questions,
            filteredQuestions: shouldClearCurrentDraft ? [] : state.filteredQuestions
          };
        });
        
        console.log(`草稿 ${draftId} 删除成功，本地状态已更新`);
      } catch (error) {
        console.error('删除草稿失败:', error);
        throw error;
      }
    },

    updateDraft: async (draftId, updates) => {
      try {
        const updatedDraft = await userDraftAPI.updateDraft(draftId, updates);
        
        // 更新本地草稿列表
        set(state => ({
          drafts: state.drafts.map(d => d._id === draftId ? updatedDraft : d)
        }));
        
        return updatedDraft;
      } catch (error) {
        console.error('更新草稿失败:', error);
        throw error;
      }
    },

    duplicateDraft: async (draftId) => {
      try {
        const newDraft = await userDraftAPI.duplicateDraft(draftId);
        
        // 更新本地草稿列表
        set(state => ({
          drafts: [newDraft, ...state.drafts]
        }));
        
        return newDraft;
      } catch (error) {
        console.error('复制草稿失败:', error);
        throw error;
      }
    },

    batchDeleteDrafts: async (draftIds) => {
      try {
        const result = await userDraftAPI.batchDeleteDrafts(draftIds);
        
        // 更新本地草稿列表
        set(state => ({
          drafts: state.drafts.filter(d => !draftIds.includes(d._id)),
          currentDraftId: draftIds.includes(state.currentDraftId || '') ? undefined : state.currentDraftId,
          isDraftMode: draftIds.includes(state.currentDraftId || '') ? false : state.isDraftMode
        }));
        
        return result;
      } catch (error) {
        console.error('批量删除草稿失败:', error);
        throw error;
      }
    },

    // 业务方法
    updateQuestion: async (id, updates) => {
      const { questions, isDraftMode, currentDraftId } = get();
      const updatedQuestions = questions.map(q => {
        if (q.id === id) {
          // 如果更新包含content字段，需要深度合并
          if (updates.content && q.content) {
            return {
              ...q,
              ...updates,
              content: {
                ...q.content,
                ...updates.content
              }
            };
          }
          return { ...q, ...updates };
        }
        return q;
      });
      
      set({ questions: updatedQuestions });
      
      // 如果当前是草稿模式且有草稿ID，立即保存到后端
      if (isDraftMode && currentDraftId) {
        try {
          await get().updateDraft(currentDraftId, { questions: updatedQuestions });
        } catch (error) {
          console.error('自动保存草稿失败:', error);
        }
      }
    },

    deleteQuestion: async (id) => {
      const { questions, selectedQuestions, isDraftMode, currentDraftId } = get();
      const updatedQuestions = questions.filter(q => q.id !== id);
      const updatedSelectedQuestions = selectedQuestions.filter(q => q.id !== id);
      
      set({ 
        questions: updatedQuestions, 
        selectedQuestions: updatedSelectedQuestions
      });
      

      if (isDraftMode && currentDraftId) {
        try {
          await get().updateDraft(currentDraftId, { questions: updatedQuestions });
        } catch (error) {
          console.error('自动保存草稿失败:', error);
        }
      }
    },

    batchUpdateQuestions: async (updates) => {
      const { questions, isDraftMode, currentDraftId } = get();
      let updatedQuestions = [...questions];
      
      updates.forEach(({ id, updates: questionUpdates }) => {
        updatedQuestions = updatedQuestions.map(q => {
          if (q.id === id) {
            // 如果更新包含content字段，需要深度合并
            if (questionUpdates.content && q.content) {
              return {
                ...q,
                ...questionUpdates,
                content: {
                  ...q.content,
                  ...questionUpdates.content
                }
              };
            }
            return { ...q, ...questionUpdates };
          }
          return q;
        });
      });
      
      set({ questions: updatedQuestions });
      
      // 如果当前是草稿模式且有草稿ID，立即保存到后端
      if (isDraftMode && currentDraftId) {
        try {
          await get().updateDraft(currentDraftId, { questions: updatedQuestions });
        } catch (error) {
          console.error('自动保存草稿失败:', error);
        }
      }
    },

    batchDeleteQuestions: async (ids) => {
      const { questions, selectedQuestions, isDraftMode, currentDraftId } = get();
      const updatedQuestions = questions.filter(q => q.id && !ids.includes(q.id));
      const updatedSelectedQuestions = selectedQuestions.filter(q => q.id && !ids.includes(q.id));
      
      set({ 
        questions: updatedQuestions, 
        selectedQuestions: updatedSelectedQuestions
      });
      
      // 如果当前是草稿模式且有草稿ID，立即保存到后端
      if (isDraftMode && currentDraftId) {
        try {
          await get().updateDraft(currentDraftId, { questions: updatedQuestions });
        } catch (error) {
          console.error('自动保存草稿失败:', error);
        }
      }
    },

    analyzeQuestion: async (content) => {
      try {
        const response = await questionAnalysisAPI.analyzeQuestion(content);
        const analysis = response.data?.analysis;
        // 确保返回的数据符合AIAnalysisResult接口
        if (analysis) {
          return {
            ...analysis,
            category: Array.isArray(analysis.category) ? analysis.category : [analysis.category].filter(Boolean)
          };
        }
        return analysis;
      } catch (error) {
        console.error('AI分析失败:', error);
        throw error;
      }
    },

    batchAnalyzeQuestions: async (questions) => {
      try {
        // 使用并行处理，但分批执行避免API限流
        const batchSize = 3; // 每批处理3道题
        const allResults: (AIAnalysisResult | null)[] = [];
        
        for (let i = 0; i < questions.length; i += batchSize) {
          const batch = questions.slice(i, i + batchSize);
          
          // 并行处理当前批次
          const batchPromises = batch.map(async (question, batchIndex) => {
            const content = typeof question.content === 'string' ? question.content : question.content.stem;
            
            if (!content) {
              return null;
            }
            
            try {
              const response = await questionAnalysisAPI.analyzeQuestion(content);
              const analysis = response?.data?.analysis;
              
              if (analysis) {
                return {
                  ...analysis,
                  category: Array.isArray(analysis.category) ? analysis.category : [analysis.category].filter(Boolean)
                };
              }
              return null;
            } catch (error) {
              console.error(`AI分析失败 (题目 ${i + batchIndex + 1}):`, error);
              return null;
            }
          });
          
          // 等待当前批次完成
          const batchResults = await Promise.all(batchPromises);
          allResults.push(...batchResults);
          
          // 批次间添加短暂延迟，避免API限流
          if (i + batchSize < questions.length) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        }
        
        return allResults.filter(Boolean) as AIAnalysisResult[];
      } catch (error) {
        console.error('批量AI分析失败:', error);
        throw error;
      }
    },

    saveQuestions: async (questions, targetBankId) => {
      try {
        set({ savingQuestions: questions.map(q => q.id || ''), saveProgress: 0 });
        
        const totalQuestions = questions.length;
        let savedCount = 0;
        const failedQuestions: Array<{id: string, error: string, question: any}> = [];

        // 保存前数据验证
        const validationErrors: Array<{id: string, error: string, question: any}> = [];
        
        for (const question of questions) {
          // 验证必填字段
          if (!question.content?.stem?.trim()) {
            validationErrors.push({
              id: question.id || question._id || 'unknown',
              error: '题干内容不能为空',
              question: question
            });
            continue;
          }
          
          if (!question.type) {
            validationErrors.push({
              id: question.id || question._id || 'unknown',
              error: '题目类型不能为空',
              question: question
            });
            continue;
          }
          
          if (!question.difficulty || question.difficulty < 1 || question.difficulty > 5) {
            validationErrors.push({
              id: question.id || question._id || 'unknown',
              error: '题目难度必须在1-5之间',
              question: question
            });
            continue;
          }
          
          // 验证答案字段 - 根据题目类型检查相应的答案
          if (question.type === 'choice') {
            // 选择题：必须有选项和答案
            if (!question.content?.options || question.content.options.length === 0) {
              validationErrors.push({
                id: question.id || question._id || 'unknown',
                error: '选择题必须包含选项',
                question: question
              });
              continue;
            }
            if (!question.content?.answer?.trim()) {
              validationErrors.push({
                id: question.id || question._id || 'unknown',
                error: '选择题答案不能为空',
                question: question
              });
              continue;
            }
          } else if (question.type === 'fill') {
            // 填空题：必须有填空答案
            if (!question.content?.fillAnswers || question.content.fillAnswers.length === 0) {
              validationErrors.push({
                id: question.id || question._id || 'unknown',
                error: '填空题必须包含答案',
                question: question
              });
              continue;
            }
            // 检查每个填空答案是否为空
            const emptyAnswers = question.content.fillAnswers.some((answer: string) => !answer?.trim());
            if (emptyAnswers) {
              validationErrors.push({
                id: question.id || question._id || 'unknown',
                error: '填空题的所有答案都不能为空',
                question: question
              });
              continue;
            }
          } else if (question.type === 'solution') {
            // 解答题：必须有解答步骤答案
            if (!question.content?.solutionAnswers || question.content.solutionAnswers.length === 0) {
              validationErrors.push({
                id: question.id || question._id || 'unknown',
                error: '解答题必须包含解答步骤',
                question: question
              });
              continue;
            }
            // 检查每个解答步骤是否为空
            const emptySteps = question.content.solutionAnswers.some((step: string) => !step?.trim());
            if (emptySteps) {
              validationErrors.push({
                id: question.id || question._id || 'unknown',
                error: '解答题的所有步骤都不能为空',
                question: question
              });
              continue;
            }
          }
          
          // 通用答案验证：确保有某种形式的答案
          if (!question.content?.answer?.trim() && 
              (!question.content?.fillAnswers || question.content.fillAnswers.length === 0) &&
              (!question.content?.solutionAnswers || question.content.solutionAnswers.length === 0)) {
            validationErrors.push({
              id: question.id || question._id || 'unknown',
              error: '题目必须包含答案内容',
              question: question
            });
            continue;
          }
        }
        
        // 如果有验证错误，直接返回
        if (validationErrors.length > 0) {
          set({ savingQuestions: [], saveProgress: 0 });
          return {
            success: false,
            savedCount: 0,
            failedCount: validationErrors.length,
            totalQuestions,
            failedQuestions: validationErrors,
            hasFailures: true,
            validationErrors: true
          };
        }
        
        for (const question of questions) {
          try {
            // 准备题目数据
            const questionData = {
              ...question,
              bid: targetBankId,
              questionBank: targetBankId
            };
            
            // 为填空题自动生成answer字段（后端要求）
            if (questionData.type === 'fill' && questionData.content?.fillAnswers) {
              questionData.content.answer = questionData.content.fillAnswers.join('; ');
            }
            
            // 为解答题自动生成answer字段（后端要求）
            if (questionData.type === 'solution' && questionData.content?.solutionAnswers) {
              questionData.content.answer = questionData.content.solutionAnswers.join('; ');
            }
            
            // 保存题目
            await questionAPI.createQuestion(targetBankId, questionData);
            savedCount++;
            
            // 更新进度
            set({ saveProgress: Math.round((savedCount / totalQuestions) * 100) });
          } catch (error) {
            console.error(`保存题目失败: ${question.id}`, error);
            failedQuestions.push({ id: question.id || 'unknown', error: error instanceof Error ? error.message : String(error), question: question });
          }
        }
        
        set({ savingQuestions: [], saveProgress: 100 });
        
        return { 
          success: true, 
          savedCount, 
          failedCount: failedQuestions.length,
          totalQuestions,
          failedQuestions,
          hasFailures: failedQuestions.length > 0
        };
      } catch (error) {
        set({ savingQuestions: [], saveProgress: 0 });
        console.error('批量保存题目失败:', error);
        throw error;
      }
    },

    // 工具方法
    reset: () => set({
      questions: [],
      filteredQuestions: [],
      selectedQuestions: [],
      searchTerm: '',
      filters: {
        type: [],
        difficulty: [],
        tags: [],
        source: []
      },
      sortBy: {
        field: 'createdAt',
        order: 'desc'
      },
      editingQuestionId: undefined,
      isBatchEditing: false,
      analyzingQuestions: [],
      analysisResults: {},
      savingQuestions: [],
      saveProgress: 0,
      currentDraftId: undefined,
      isDraftMode: false
    })
  })
); 