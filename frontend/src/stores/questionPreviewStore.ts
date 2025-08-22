import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { questionAPI, questionAnalysisAPI } from '../services/api';
import type { Question, QuestionBank, AIAnalysisResult } from '../types';

// 自定义确认函数，用于替代原生confirm
const showCustomConfirm = (message: string): Promise<boolean> => {
  return new Promise((resolve) => {
    // 创建一个简单的确认弹窗元素
    const confirmDiv = document.createElement('div');
    confirmDiv.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: white;
      border: 1px solid #ccc;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 10000;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      max-width: 400px;
      text-align: center;
    `;
    
    confirmDiv.innerHTML = `
      <div style="margin-bottom: 15px; color: #333;">${message}</div>
      <div style="display: flex; gap: 10px; justify-content: center;">
        <button id="confirm-yes" style="
          background: #007bff;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
        ">确定</button>
        <button id="confirm-no" style="
          background: #6c757d;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
        ">取消</button>
      </div>
    `;
    
    document.body.appendChild(confirmDiv);
    
    // 绑定事件
    const yesBtn = confirmDiv.querySelector('#confirm-yes');
    const noBtn = confirmDiv.querySelector('#confirm-no');
    
    if (yesBtn) {
      yesBtn.addEventListener('click', () => {
        confirmDiv.remove();
        resolve(true);
      });
    }
    
    if (noBtn) {
      noBtn.addEventListener('click', () => {
        confirmDiv.remove();
        resolve(false);
      });
    }
  });
};

// 草稿接口
export interface QuestionDraft {
  id: string;
  name: string;
  questions: Question[];
  documentInfo?: {
    id: string;
    fileName: string;
    fileType: string;
    confidence?: number;
    processTime?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
  description?: string;
}

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
  saveDraft: (name: string, description?: string) => void;
  loadDraft: (draftId: string) => void;
  deleteDraft: (draftId: string) => void;
  updateDraft: (draftId: string, updates: Partial<QuestionDraft>) => void;
  autoSaveDraft: () => void;
  createDraftFromFile: (fileName: string, questions: Question[], documentInfo?: any) => QuestionDraft;
  checkDuplicateQuestions: (questions: Question[]) => QuestionDraft | undefined;
  
  // 业务方法
  updateQuestion: (id: string, updates: Partial<Question>) => Promise<void>;
  deleteQuestion: (id: string) => Promise<void>;
  batchUpdateQuestions: (updates: Array<{id: string, updates: Partial<Question>}>) => Promise<void>;
  batchDeleteQuestions: (ids: string[]) => Promise<void>;
  analyzeQuestion: (content: string) => Promise<AIAnalysisResult>;
  batchAnalyzeQuestions: (questions: Question[]) => Promise<AIAnalysisResult[]>;
  saveQuestions: (questions: Question[], targetBankId: string) => Promise<void>;
  
  // 工具方法
  reset: () => void;
}

// 创建store
export const useQuestionPreviewStore = create<QuestionPreviewState & QuestionPreviewActions>()(
  persist(
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

      // 状态设置方法
      setQuestions: (questions) => set({ questions }),
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

      // 草稿相关方法
      setDrafts: (drafts) => set({ drafts }),
      setCurrentDraftId: (currentDraftId) => set({ currentDraftId }),
      setIsDraftMode: (isDraftMode) => set({ isDraftMode }),

      // 保存草稿
      saveDraft: (name, description) => {
        const { questions, drafts } = get();
        const now = new Date();
        
        // 检查是否已存在同名草稿
        const existingDraftIndex = drafts.findIndex(draft => draft.name === name);
        
        // 检查是否已存在内容相同的草稿
        const existingContentDraft = drafts.find(draft => {
          // 如果题目数量不同，内容肯定不同
          if (draft.questions.length !== questions.length) return false;
          
          // 检查每个题目是否相同（基于内容和类型）
          return draft.questions.every((draftQuestion, index) => {
            const currentQuestion = questions[index];
            return (
              draftQuestion.content === currentQuestion.content &&
              draftQuestion.type === currentQuestion.type &&
              draftQuestion.source === currentQuestion.source
            );
          });
        });
        
        if (existingContentDraft) {
          // 如果存在内容相同的草稿，询问用户是否要覆盖
          showCustomConfirm(`已存在内容相同的草稿"${existingContentDraft.name}"，是否要覆盖？`).then((confirmed) => {
            if (confirmed) {
              // 覆盖现有草稿
              const updatedDrafts = drafts.map(draft => 
                draft.id === existingContentDraft.id 
                  ? { ...draft, name, description, questions, updatedAt: now }
                  : draft
              );
              set({ 
                drafts: updatedDrafts,
                currentDraftId: existingContentDraft.id,
                isDraftMode: true
              });
            }
          });
          return; // 不创建新草稿
        }
        
        if (existingDraftIndex >= 0) {
          // 如果存在同名草稿，询问用户是否要覆盖
          showCustomConfirm(`已存在名为"${name}"的草稿，是否要覆盖？`).then((confirmed) => {
            if (confirmed) {
              // 覆盖现有草稿
              const updatedDrafts = [...drafts];
              updatedDrafts[existingDraftIndex] = {
                ...updatedDrafts[existingDraftIndex],
                name,
                description,
                questions,
                updatedAt: now
              };
              set({ 
                drafts: updatedDrafts,
                currentDraftId: updatedDrafts[existingDraftIndex].id,
                isDraftMode: true
              });
            }
          });
        } else {
          // 创建新草稿
          const newDraft: QuestionDraft = {
            id: `draft-${Date.now()}`,
            name,
            description,
            questions,
            createdAt: now,
            updatedAt: now
          };
          set({ 
            drafts: [...drafts, newDraft],
            currentDraftId: newDraft.id,
            isDraftMode: true
          });
        }
      },

      // 加载草稿
      loadDraft: (draftId) => {
        const { drafts } = get();
        const draft = drafts.find(d => d.id === draftId);
        if (draft) {
          set({
            questions: draft.questions,
            filteredQuestions: draft.questions, // 同时更新过滤后的题目
            selectedQuestions: [],
            currentDraftId: draftId,
            isDraftMode: true
          });
        }
      },

      // 删除草稿
      deleteDraft: (draftId) => {
        const { drafts, currentDraftId } = get();
        const updatedDrafts = drafts.filter(d => d.id !== draftId);
        set({ 
          drafts: updatedDrafts,
          currentDraftId: currentDraftId === draftId ? undefined : currentDraftId,
          isDraftMode: currentDraftId === draftId ? false : get().isDraftMode
        });
      },

      // 更新草稿
      updateDraft: (draftId, updates) => {
        const { drafts } = get();
        const updatedDrafts = drafts.map(draft => 
          draft.id === draftId 
            ? { ...draft, ...updates, updatedAt: new Date() }
            : draft
        );
        set({ drafts: updatedDrafts });
      },

      // 自动保存草稿
      autoSaveDraft: () => {
        const { questions, currentDraftId, drafts } = get();
        if (currentDraftId) {
          if (questions.length === 0) {
            // 如果题目数量为0，自动删除该草稿
            const updatedDrafts = drafts.filter(draft => draft.id !== currentDraftId);
            set({ 
              drafts: updatedDrafts,
              currentDraftId: undefined,
              isDraftMode: false
            });
          } else {
            // 更新草稿中的题目数据
            const updatedDrafts = drafts.map(draft => 
              draft.id === currentDraftId 
                ? { ...draft, questions, updatedAt: new Date() }
                : draft
            );
            set({ drafts: updatedDrafts });
          }
        }
      },

      // 从文件上传创建新草稿（用于批量上传）
      createDraftFromFile: (fileName: string, questions: Question[], documentInfo?: any) => {
        const { drafts } = get();
        const now = new Date();
        
        // 生成唯一的草稿名称
        let draftName = fileName;
        let counter = 1;
        while (drafts.some(draft => draft.name === draftName)) {
          draftName = `${fileName} (${counter})`;
          counter++;
        }
        
        // 创建新草稿
        const newDraft: QuestionDraft = {
          id: `draft-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: draftName,
          description: `从文件 ${fileName} 自动创建的草稿`,
          questions,
          documentInfo,
          createdAt: now,
          updatedAt: now
        };
        
        set({ 
          drafts: [...drafts, newDraft],
          currentDraftId: newDraft.id,
          isDraftMode: true
        });
        
        return newDraft;
      },

      // 检查习题集是否重复
      checkDuplicateQuestions: (questions: Question[]) => {
        const { drafts } = get();
        
        return drafts.find(draft => {
          // 如果题目数量不同，内容肯定不同
          if (draft.questions.length !== questions.length) return false;
          
          // 检查每个题目是否相同（基于内容和类型）
          return draft.questions.every((draftQuestion, index) => {
            const currentQuestion = questions[index];
            return (
              draftQuestion.content === currentQuestion.content &&
              draftQuestion.type === currentQuestion.type &&
              draftQuestion.source === currentQuestion.source
            );
          });
        });
      },

      // 业务方法
      updateQuestion: async (id, updates) => {
        const { questions, isDraftMode } = get();
        const updatedQuestions = questions.map(q => 
          q.id === id ? { ...q, ...updates } : q
        );
        
        set({ questions: updatedQuestions });
        
        // 如果已经保存过试卷（草稿模式或用户已保存），则自动保存
        if (isDraftMode) {
          get().autoSaveDraft();
        }
      },

      deleteQuestion: async (id) => {
        const { questions, selectedQuestions } = get();
        const updatedQuestions = questions.filter(q => q.id !== id);
        const updatedSelectedQuestions = selectedQuestions.filter(q => q.id !== id);
        
        set({ 
          questions: updatedQuestions, 
          selectedQuestions: updatedSelectedQuestions
        });
        
        // 自动保存草稿以持久化删除操作
        get().autoSaveDraft();
      },

      batchUpdateQuestions: async (updates) => {
        const { questions } = get();
        let updatedQuestions = [...questions];
        
        updates.forEach(({ id, updates: questionUpdates }) => {
          updatedQuestions = updatedQuestions.map(q => 
            q.id === id ? { ...q, ...questionUpdates } : q
          );
        });
        
        set({ questions: updatedQuestions });
        
        // 自动保存草稿以持久化更新操作
        get().autoSaveDraft();
      },

      batchDeleteQuestions: async (ids) => {
        const { questions, selectedQuestions } = get();
        const updatedQuestions = questions.filter(q => q.id && !ids.includes(q.id));
        const updatedSelectedQuestions = selectedQuestions.filter(q => q.id && !ids.includes(q.id));
        
        set({ 
          questions: updatedQuestions, 
          selectedQuestions: updatedSelectedQuestions
        });
        
        // 自动保存草稿以持久化删除操作
        get().autoSaveDraft();
      },

      analyzeQuestion: async (content) => {
        try {
          const response = await questionAnalysisAPI.analyzeQuestion(content);
          return response.data?.analysis;
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
          return results.map(r => r?.data?.analysis).filter(Boolean) as AIAnalysisResult[];
        } catch (error) {
          console.error('批量AI分析失败:', error);
          throw error;
        }
      },

      saveQuestions: async (questions, targetBankId) => {
        const { setSavingQuestions, setSaveProgress } = get();
        setSavingQuestions(questions.map(q => q.id || ''));
        setSaveProgress(0);
        
        try {
          const totalQuestions = questions.length;
          let savedCount = 0;
          
          for (let i = 0; i < questions.length; i++) {
            const question = questions[i];
            const questionIndex = i + 1; // 题目序号从1开始
            
            // 根据题目类型生成默认答案
            let defaultAnswer = '';
            if (question.type === 'choice' || question.type === 'multiple-choice') {
              // 选择题：找到正确答案的选项
              const correctOptions = question.content.options?.filter(opt => opt.isCorrect) || [];
              if (correctOptions.length > 0) {
                defaultAnswer = correctOptions.map(opt => opt.text).join('、');
              } else {
                // 如果没有设置正确答案，使用第一个选项作为默认答案
                defaultAnswer = question.content.options?.[0]?.text || 'A';
              }
            } else if (question.type === 'fill') {
              // 填空题：使用第一个填空答案
              defaultAnswer = question.content.fillAnswers?.[0] || '待填写';
            } else if (question.type === 'solution') {
              // 解答题：使用第一个解答步骤
              defaultAnswer = question.content.solutionAnswers?.[0] || '待解答';
            }
            
            // 处理来源信息：如果来源不为空，自动添加序号
            let processedSource = question.source || '';
            if (processedSource && !processedSource.includes(`T${questionIndex}`)) {
              // 如果来源不为空且不包含当前序号，则添加序号
              processedSource = `${processedSource} T${questionIndex}`;
            }
            
            // 确保数据格式正确，补充媒体数据的必要字段
            const questionData = {
              type: question.type,
              content: {
                stem: question.content.stem || '',
                options: question.content.options || [],
                answer: question.content.answer || defaultAnswer || '待完善', // 使用默认答案
                fillAnswers: question.content.fillAnswers || [],
                solutionAnswers: question.content.solutionAnswers || [],
                solution: question.content.solution || ''
              },
              category: Array.isArray(question.category) ? question.category.join(', ') : (typeof question.category === 'string' ? question.category : ''),
              tags: question.tags || [],
              source: processedSource, // 使用处理后的来源（包含序号）
              difficulty: question.difficulty || 3,
              images: question.images?.map(img => ({
                ...img,
                bid: targetBankId, // 补充题库ID
                format: img.format || 'png', // 默认格式
                uploadedAt: img.uploadedAt || new Date(), // 默认上传时间
                uploadedBy: img.uploadedBy || 'unknown-user' // 默认上传者
              })) || [],
              tikzCodes: question.tikzCodes?.map(tikz => ({
                ...tikz,
                bid: targetBankId, // 补充题库ID
                format: tikz.format || 'svg', // 默认格式
                createdAt: tikz.createdAt || new Date(), // 默认创建时间
                createdBy: tikz.createdBy || 'unknown-user' // 默认创建者
              })) || []
            };
            
            await questionAPI.createQuestion(targetBankId, questionData);
            savedCount++;
            setSaveProgress((savedCount / totalQuestions) * 100);
          }
          
          setSavingQuestions([]);
          setSaveProgress(100);
        } catch (error) {
          setSavingQuestions([]);
          setSaveProgress(0);
          throw error;
        }
      },

      // 工具方法
      reset: () => set({
        questions: [],
        filteredQuestions: [],
        selectedQuestions: [],
        viewMode: 'grid',
        searchTerm: '',
        filters: { type: [], difficulty: [], tags: [], source: [] },
        sortBy: { field: 'createdAt', order: 'desc' },
        editingQuestionId: undefined,
        isBatchEditing: false,
        analyzingQuestions: [],
        analysisResults: {},
        savingQuestions: [],
        saveProgress: 0,
        questionBanks: [],
        selectedQuestionBank: undefined,
        currentDraftId: undefined,
        isDraftMode: false
      })
    }),
    {
      name: 'question-preview-store',
      partialize: (state) => ({
        drafts: state.drafts,
        currentDraftId: state.currentDraftId,
        isDraftMode: state.isDraftMode,
        questions: state.questions // 同时保存当前题目数据
      }),
      onRehydrateStorage: () => (state) => {
        // 重新水合后的处理逻辑
        if (state && state.currentDraftId && state.drafts.length > 0) {
          // 如果有当前草稿ID，确保草稿数据是最新的
          const currentDraft = state.drafts.find(d => d.id === state.currentDraftId);
          if (currentDraft && currentDraft.questions.length > 0) {
            // 如果草稿有题目数据，使用草稿数据
            state.questions = currentDraft.questions;
            state.filteredQuestions = currentDraft.questions;
          }
        }
      }
    }
  )
); 