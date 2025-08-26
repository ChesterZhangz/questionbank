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
  saveQuestions: (questions: Question[], targetBankId: string) => Promise<{ success: boolean; savedCount: number; totalQuestions: number }>;
  
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
        set(state => ({
          drafts: state.drafts.filter(d => d._id !== draftId),
          currentDraftId: state.currentDraftId === draftId ? undefined : state.currentDraftId,
          isDraftMode: state.currentDraftId === draftId ? false : state.isDraftMode
        }));
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
        const promises = questions.map(q => {
          const content = typeof q.content === 'string' ? q.content : q.content.stem;
          if (!content) return null;
          return questionAnalysisAPI.analyzeQuestion(content);
        });
        const results = await Promise.all(promises.filter(Boolean));
        return results.map(r => {
          const analysis = r?.data?.analysis;
          if (analysis) {
            return {
              ...analysis,
              category: Array.isArray(analysis.category) ? analysis.category : [analysis.category].filter(Boolean)
            };
          }
          return analysis;
        }).filter(Boolean) as AIAnalysisResult[];
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
        
        for (const question of questions) {
          try {
            // 准备题目数据
            const questionData = {
              ...question,
              bid: targetBankId,
              questionBank: targetBankId
            };
            
                         // 保存题目
             await questionAPI.createQuestion(targetBankId, questionData);
            savedCount++;
            
            // 更新进度
            set({ saveProgress: Math.round((savedCount / totalQuestions) * 100) });
          } catch (error) {
            console.error(`保存题目失败: ${question.id}`, error);
          }
        }
        
        set({ savingQuestions: [], saveProgress: 100 });
        
        return { success: true, savedCount, totalQuestions };
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