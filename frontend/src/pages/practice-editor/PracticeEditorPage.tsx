import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from '../../hooks/useTranslation';
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
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// 可拖拽的题目组件
interface SortableQuestionProps {
  question: any;
  questionIndex: number;
  onRemove: (questionId: string, sectionId: string) => void;
  sectionId: string;
  t: (key: string, params?: any) => string;
}

const SortableQuestion: React.FC<SortableQuestionProps> = ({ 
  question, 
  questionIndex, 
  onRemove, 
  sectionId,
  t
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: question._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-start justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg ${
        isDragging ? 'shadow-lg border-2 border-blue-300' : ''
      }`}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-start space-x-2">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing flex-shrink-0 mt-0.5 p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
          >
            <GripVertical className="w-4 h-4 text-gray-400" />
          </div>
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400 flex-shrink-0 mt-0.5">
            {questionIndex + 1}.
          </span>
          <div className="text-sm text-gray-700 dark:text-gray-300 flex-1">
            <LaTeXPreview
              content={question.content?.stem || t('practiceEditor.questionContentLoading')}
              config={{ 
                mode: 'full',
                features: {
                  markdown: true,
                  questionSyntax: true,
                  autoNumbering: true,
                  errorHandling: 'lenient'
                },
                styling: {
                  fontSize: '0.875rem',
                  lineHeight: '1.5',
                  maxWidth: '100%'
                }
              }}
              variant="compact"
              showTitle={false}
              className="question-card-latex-content"
              maxWidth="max-w-none"
            />
            
            {/* 题目图片和TikZ显示 */}
            {((question.images && question.images.length > 0) || (question.tikzCodes && question.tikzCodes.length > 0)) && (
              <div className="mt-2">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  {t('practiceEditor.graphicsAndImages')} ({((question.images?.length || 0) + (question.tikzCodes?.length || 0))} {t('practiceEditor.count')})
                </div>
                
                {/* 合并图片和图形数据 */}
                <div className="flex space-x-1 overflow-x-auto pb-1">
                  {[
                    ...(question.images || []).map((item: any) => ({ type: 'image' as const, data: item })),
                    ...(question.tikzCodes || []).map((item: any) => ({ type: 'tikz' as const, data: item }))
                  ].sort((a, b) => {
                    // 按order字段排序
                    const orderA = a.data.order || 0;
                    const orderB = b.data.order || 0;
                    return orderA - orderB;
                  }).map((item) => (
                    <div key={`${item.type}-${item.data.id}`} className="flex-shrink-0 group relative">
                      {item.type === 'image' ? (
                        // 图片显示
                        <div className="w-12 h-9 rounded border border-gray-200 dark:border-gray-600 overflow-hidden bg-gray-50 dark:bg-gray-700 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer">
                          <img
                            src={item.data.url}
                            alt={item.data.filename}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          />
                          <div className="absolute top-0.5 left-0.5 bg-blue-500 text-white text-xs px-1 py-0.5 rounded text-[8px]">
                            {t('practiceEditor.image')}
                          </div>
                        </div>
                      ) : (
                        // TikZ显示
                        <div className="w-12 h-9 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-600 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden cursor-pointer">
                          <TikZPreview
                            code={item.data.code}
                            format={item.data.format as 'svg' | 'png'}
                            width={150}
                            height={112}
                            showGrid={false}
                            showTitle={false}
                            className="w-full h-full group-hover:scale-105 transition-transform duration-200 flex items-center justify-center"
                          />
                          <div className="absolute top-0.5 left-0.5 bg-purple-500 text-white text-xs px-1 py-0.5 rounded text-[8px]">
                            {t('practiceEditor.shape')}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center space-x-2 ml-4">
        <Tooltip content={t('practiceEditor.removeFromSection')}>
          <Button
            onClick={() => onRemove(question._id, sectionId)}
            size="sm"
            variant="ghost"
            className="text-red-500 hover:text-red-700"
          >
            <X className="w-4 h-4" />
          </Button>
        </Tooltip>
      </div>
    </div>
  );
};

import { 
  ArrowLeft, 
  Save,
  PenTool,
  X,
  Plus,
  Search,
  PlusCircle,
  Trash2,
  GripVertical,
  Filter,
  RefreshCw,
  ArrowUpDown,
  Target,
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import { useModal } from '../../hooks/useModal';
import ConfirmModal from '../../components/ui/ConfirmModal';
import RightSlideModal from '../../components/ui/RightSlideModal';
import { paperAPI, paperBankAPI, questionAPI, questionBankAPI } from '../../services/api';
import type { Question, QuestionBank } from '../../types';
import LaTeXPreview from '../../components/editor/preview/LaTeXPreview';
import TikZPreview from '../../components/tikz/core/TikZPreview';
import { MultiSelect } from '../../components/ui/menu';
import SimpleSelect from '../../components/ui/menu/SimpleSelect';
import TagSelector from '../../components/ui/TagSelector';
import './PracticeEditorPage.css';
// 导入QuestionView的标签样式
import '../../components/question/QuestionView.css';

// Tooltip组件
const Tooltip: React.FC<{ children: React.ReactNode; content: string; position?: 'top' | 'bottom' | 'left' | 'right' }> = ({ 
  children, 
  content, 
  position = 'top' 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);

  const updatePosition = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      
      let x = rect.left + rect.width / 2;
      let y = rect.top + rect.height / 2;

      if (position === 'top') {
        y = rect.top - 8;
      } else if (position === 'bottom') {
        y = rect.bottom + 8;
      } else if (position === 'left') {
        x = rect.left - 8;
      } else if (position === 'right') {
        x = rect.right + 8;
      }

      setTooltipPosition({ x, y });
    }
  };

  const handleMouseEnter = () => {
    updatePosition();
    setIsVisible(true);
  };

  const handleMouseLeave = () => {
    setIsVisible(false);
  };

  return (
    <>
      <div 
        ref={triggerRef}
        className="relative inline-block"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {children}
      </div>
      {isVisible && createPortal(
        <div
          className="fixed z-[999999] px-3 py-2 text-xs text-white bg-gray-900 dark:bg-gray-700 rounded-md shadow-lg whitespace-nowrap pointer-events-none"
          style={{
            left: `${tooltipPosition.x}px`,
            top: `${tooltipPosition.y}px`,
            transform: position === 'top' || position === 'bottom' ? 'translateX(-50%)' : 'translateY(-50%)',
            ...(position === 'top' && { transform: 'translateX(-50%) translateY(-100%)' }),
            ...(position === 'bottom' && { transform: 'translateX(-50%)' }),
            ...(position === 'left' && { transform: 'translateX(-100%) translateY(-50%)' }),
            ...(position === 'right' && { transform: 'translateY(-50%)' })
          }}
        >
          {content}
          <div 
            className="absolute w-2 h-2 bg-gray-900 dark:bg-gray-700 rotate-45"
            style={{
              ...(position === 'top' && {
                top: '100%',
                left: '50%',
                transform: 'translateX(-50%)',
                marginTop: '-4px'
              }),
              ...(position === 'bottom' && {
                bottom: '100%',
                left: '50%',
                transform: 'translateX(-50%)',
                marginBottom: '-4px'
              }),
              ...(position === 'left' && {
                left: '100%',
                top: '50%',
                transform: 'translateY(-50%)',
                marginLeft: '-4px'
              }),
              ...(position === 'right' && {
                right: '100%',
                top: '50%',
                transform: 'translateY(-50%)',
                marginRight: '-4px'
              })
            }}
          ></div>
        </div>,
        document.body
      )}
    </>
  );
};

interface Section {
  id: string;
  title: string;
  questions: Question[];
}

interface PracticeEditorPageProps {}

const PracticeEditorPage: React.FC<PracticeEditorPageProps> = () => {
  const navigate = useNavigate();
  const { paperBankId, id: practiceId } = useParams<{ paperBankId: string; id: string }>();
  const { showErrorRightSlide, showSuccessRightSlide, rightSlideModal, closeRightSlide } = useModal();
  const { t } = useTranslation();
  
  // 练习基本信息
  const [title, setTitle] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [questionsLoaded, setQuestionsLoaded] = useState(false); // 新增：题目是否已加载完成
  const [hasBeenSaved, setHasBeenSaved] = useState(false); // 新增：是否已经保存过
  
  // 试卷集和题目数据
  const [availableQuestions, setAvailableQuestions] = useState<Question[]>([]);
  const [sections, setSections] = useState<Section[]>([
    { id: '1', title: t('practiceEditor.defaultSectionTitle', { number: 1 }), questions: [] }
  ]);
  const [loading, setLoading] = useState(true);
  
  // 分页相关状态
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [allDisplayedQuestionIds, setAllDisplayedQuestionIds] = useState<Set<string>>(new Set());
  const pageSize = 20;
  
  // 题目缓存相关状态
  const [questionCache, setQuestionCache] = useState<Question[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
  const [isPreloading, setIsPreloading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const cacheSize = 100; // 缓存100道题目，搜索时能获取更多结果
  
  // 新增：试卷集选择状态
  const [selectedPaperBank, setSelectedPaperBank] = useState<string>(paperBankId || '');
  const [paperBanks, setPaperBanks] = useState<any[]>([]);
  const [questionBanks, setQuestionBanks] = useState<QuestionBank[]>([]);
  
  // 搜索和筛选
  const [searchQuery, setSearchQuery] = useState('');
  
  // 新增：高级筛选状态
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedDifficulties, setSelectedDifficulties] = useState<number[]>([]);
  const [selectedBanks, setSelectedBanks] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  
  // 当前编辑的section
  const [editingSection, setEditingSection] = useState<string>('1');
  // 正在编辑标题的section
  const [editingTitle, setEditingTitle] = useState<string | null>(null);
  // 正在编辑练习标题
  const [editingPracticeTitle, setEditingPracticeTitle] = useState(false);
  // 当前选中的部分（用于添加题目）
  const [selectedSection, setSelectedSection] = useState<string>('1');

  // 处理分类数据，兼容字符串和数组格式
  const getCategoryArray = (category: string | string[] | undefined): string[] => {
    if (!category) return [];
    if (Array.isArray(category)) return category;
    // 如果是字符串，按逗号分割
    return category.split(',').map(item => item.trim()).filter(item => item.length > 0);
  };

  // 提取练习卷中出现最多的三个标签
  const extractTopTags = (): string[] => {
    const tagCounts: { [key: string]: number } = {};
    
    sections.forEach(section => {
      section.questions.forEach(question => {
        // 收集题目的所有标签
        const questionTags = [
          ...getCategoryArray(question.category),
          ...(question.tags || [])
        ];
        
        // 如果没有标签，使用默认标签
        if (questionTags.length === 0) {
          questionTags.push(t('practiceEditor.defaultTags.practice'), t('practiceEditor.defaultTags.comprehensive'));
        }
        
        questionTags.forEach(tag => {
          if (tag && tag.trim()) {
            const cleanTag = tag.trim();
            tagCounts[cleanTag] = (tagCounts[cleanTag] || 0) + 1;
          }
        });
      });
    });
    
    // 按出现次数排序，取前三个
    const result = Object.entries(tagCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([tag]) => tag);
    
    // 如果仍然没有标签，返回默认标签
    if (result.length === 0) {
      return [t('practiceEditor.defaultTags.practice'), t('practiceEditor.defaultTags.comprehensive'), t('practiceEditor.defaultTags.selfTest')];
    }
    
    return result;
  };

  // 获取已添加题目的ID集合
  const getAddedQuestionIds = (): Set<string> => {
    const addedIds = new Set<string>();
    sections.forEach(section => {
      section.questions.forEach(question => {
        addedIds.add(question._id);
      });
    });
    return addedIds;
  };

  // 客户端筛选函数
  const filterQuestions = (questions: Question[], searchQuery: string, selectedTypes: string[], selectedDifficulties: number[], selectedBanks: string[], selectedTags: string[]) => {
    return questions.filter(question => {
      // 搜索关键词匹配
      if (searchQuery.trim()) {
        const searchTerm = searchQuery.toLowerCase().trim();
        // const searchRegex = new RegExp(searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
        
        // 检查题目内容、标签、题型等是否匹配
        const contentMatch = question.content?.stem?.toLowerCase().includes(searchTerm) || 
                            question.content?.solution?.toLowerCase().includes(searchTerm) ||
                            question.qid?.toLowerCase().includes(searchTerm);
        
        const tagMatch = question.tags?.some(tag => tag.toLowerCase().includes(searchTerm)) || false;
        const typeMatch = question.type?.toLowerCase().includes(searchTerm) || false;
        
        // 难度关键词匹配
        const difficultyKeywords = {
          [t('practiceEditor.searchKeywords.difficulty.simple')]: 1, 
          [t('practiceEditor.searchKeywords.difficulty.easy')]: 1, 
          [t('practiceEditor.searchKeywords.difficulty.basic')]: 1,
          [t('practiceEditor.searchKeywords.difficulty.medium')]: 3, 
          [t('practiceEditor.searchKeywords.difficulty.normal')]: 3, 
          [t('practiceEditor.searchKeywords.difficulty.general')]: 3,
          [t('practiceEditor.searchKeywords.difficulty.hard')]: 5, 
          [t('practiceEditor.searchKeywords.difficulty.difficult')]: 5, 
          [t('practiceEditor.searchKeywords.difficulty.complex')]: 5
        };
        
        let difficultyMatch = false;
        for (const [keyword, level] of Object.entries(difficultyKeywords)) {
          if (searchTerm.includes(keyword) && question.difficulty === level) {
            difficultyMatch = true;
            break;
          }
        }
        
        // 题型关键词匹配
        const typeKeywords = {
          [t('practiceEditor.searchKeywords.types.choice')]: 'choice', 
          [t('practiceEditor.searchKeywords.types.singleChoice')]: 'choice',
          [t('practiceEditor.searchKeywords.types.multipleChoice')]: 'multiple-choice', 
          [t('practiceEditor.searchKeywords.types.multipleChoiceQuestion')]: 'multiple-choice',
          [t('practiceEditor.searchKeywords.types.fill')]: 'fill', 
          [t('practiceEditor.searchKeywords.types.fillQuestion')]: 'fill',
          [t('practiceEditor.searchKeywords.types.solution')]: 'solution', 
          [t('practiceEditor.searchKeywords.types.solutionQuestion')]: 'solution', 
          [t('practiceEditor.searchKeywords.types.calculation')]: 'solution'
        };
        
        let typeKeywordMatch = false;
        for (const [keyword, type] of Object.entries(typeKeywords)) {
          if (searchTerm.includes(keyword) && question.type === type) {
            typeKeywordMatch = true;
            break;
          }
        }
        
        if (!contentMatch && !tagMatch && !typeMatch && !difficultyMatch && !typeKeywordMatch) {
          return false;
        }
      }
      
      // 题型筛选
      if (selectedTypes.length > 0 && !selectedTypes.includes(question.type)) {
        return false;
      }
      
      // 难度筛选
      if (selectedDifficulties.length > 0 && !selectedDifficulties.includes(question.difficulty)) {
        return false;
      }
      
      // 题库筛选
      if (selectedBanks.length > 0 && !selectedBanks.includes(question.bid)) {
        return false;
      }
      
      // 标签筛选
      if (selectedTags.length > 0) {
        const questionTags = question.tags || [];
        const hasMatchingTag = selectedTags.some(tag => 
          questionTags.some(questionTag => 
            questionTag.toLowerCase().includes(tag.toLowerCase())
          )
        );
        if (!hasMatchingTag) {
          return false;
        }
      }
      
      return true;
    });
  };

  // 获取指定试卷集中所有已使用的题目ID
  const getUsedQuestionIdsInPaperBank = async (paperBankId: string) => {
    try {
      if (!paperBankId || paperBankId === 'undefined') {
        return [];
      }
      
      // 获取我的所有试卷，然后筛选出指定试卷集的试卷
      const response = await paperAPI.getMyPapers({ bank: paperBankId });
      if (!response.data.success) {
        return [];
      }
      
      const papers = response.data.data.papers || [];
      const usedQuestionIds = new Set<string>();
      
      // 遍历所有试卷，收集已使用的题目ID
      papers.forEach((paper: any) => {
        if (paper.sections && paper.sections.length > 0) {
          paper.sections.forEach((section: any) => {
            if (section.items && section.items.length > 0) {
              section.items.forEach((item: any) => {
                const question = item.question || item;
                if (question._id) {
                  usedQuestionIds.add(question._id);
                }
              });
            }
          });
        }
      });
      
      return Array.from(usedQuestionIds);
    } catch (error) {
      console.error('获取试卷集中已使用题目失败:', error);
      return [];
    }
  };

  // 预加载题目到缓存
  const preloadQuestions = async (startPage: number, targetCount: number) => {
    if (isPreloading) return;
    
    try {
      setIsPreloading(true);
      const questions: Question[] = [];
      let currentPage = startPage;
      
      while (questions.length < targetCount) {
        // 构建筛选参数
        const filterParams: any = {
          page: currentPage,
          limit: 100 // 总是获取更多题目
        };
        
        // 添加搜索条件
        if (searchQuery.trim()) {
          filterParams.search = searchQuery.trim();
        }
        
        // 添加题型筛选
        if (selectedTypes.length > 0) {
          filterParams.type = selectedTypes;
        }
        
        // 添加难度筛选
        if (selectedDifficulties.length > 0) {
          filterParams.difficulty = selectedDifficulties;
        }
        
        // 添加题库筛选
        if (selectedBanks.length > 0) {
          filterParams.bankId = selectedBanks;
        }
        
        // 添加标签筛选
        if (selectedTags.length > 0) {
          filterParams.tags = selectedTags;
        }

        const questionsResponse = await questionAPI.getAllQuestions(filterParams);
        
        if (!questionsResponse.data.success || !questionsResponse.data.data?.questions?.length) {
          break;
        }
        
        let pageQuestions = questionsResponse.data.data.questions;
        
        // 排除已添加的题目
        const addedIds = getAddedQuestionIds();
        pageQuestions = pageQuestions.filter(question => !addedIds.has(question._id));
        
        // 排除试卷集中已使用的题目
        if (selectedPaperBank) {
          const usedIds = await getUsedQuestionIdsInPaperBank(selectedPaperBank);
          pageQuestions = pageQuestions.filter(question => !usedIds.includes(question._id));
        }
        
        // 排除已显示的题目
        pageQuestions = pageQuestions.filter(question => !allDisplayedQuestionIds.has(question._id));
        
        // 排除缓存中已有的题目
        const cacheIds = new Set(questionCache.map(q => q._id));
        pageQuestions = pageQuestions.filter(question => !cacheIds.has(question._id));
        
        questions.push(...pageQuestions);
        currentPage++;
        
        // 如果这一页没有有效题目，退出循环
        if (pageQuestions.length === 0) {
          break;
        }
      }
      
      // 更新缓存
      setQuestionCache(prev => {
        const newCache = [...prev, ...questions];
        // 去重处理
        const uniqueCache = newCache.filter((question, index, self) => 
          index === self.findIndex(q => q._id === question._id)
        );
        // 保持缓存大小不超过目标数量
        return uniqueCache.slice(0, targetCount);
      });
    } catch (error) {
      console.error('预加载题目失败:', error);
    } finally {
      setIsPreloading(false);
    }
  };

  // 题目类型文本
  const getQuestionTypeText = (type: string) => {
    switch (type) {
      case 'choice': return t('practiceEditor.questionTypes.choice');
      case 'multiple-choice': return t('practiceEditor.questionTypes.multipleChoice');
      case 'fill': return t('practiceEditor.questionTypes.fill');
      case 'solution': return t('practiceEditor.questionTypes.solution');
      default: return t('practiceEditor.questionTypes.unknown');
    }
  };

  // 题目类型颜色
  const getQuestionTypeColor = (type: string) => {
    switch (type) {
      case 'choice': return 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700';
      case 'multiple-choice': return 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700';
      case 'fill': return 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-700';
      case 'solution': return 'bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-700';
      default: return 'bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600';
    }
  };

  // 难度颜色
  const getDifficultyColor = (difficulty: number) => {
    switch (difficulty) {
      case 1: return 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-700';
      case 2: return 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-700';
      case 3: return 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/30 border-orange-200 dark:border-orange-700';
      case 4: return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-700';
      case 5: return 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 border-purple-200 dark:border-purple-700';
      default: return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600';
    }
  };

  // 难度文本
  const getDifficultyText = (difficulty: number) => {
    switch (difficulty) {
      case 1: return t('practiceEditor.difficulties.veryEasy');
      case 2: return t('practiceEditor.difficulties.easy');
      case 3: return t('practiceEditor.difficulties.medium');
      case 4: return t('practiceEditor.difficulties.hard');
      case 5: return t('practiceEditor.difficulties.veryHard');
      default: return t('practiceEditor.difficulties.unknown');
    }
  };

  // 加载数据
  useEffect(() => {
    if (paperBankId && paperBankId !== 'undefined') {
      loadData();
    } else {
      // 如果没有有效的试卷集ID，仍然加载基础数据
      loadData();
    }
  }, [paperBankId, practiceId]);

  // 监听内容变化 - 已移除hasUnsavedChanges状态管理

  // 手动搜索函数
  const handleSearch = () => {
    // 清除之前的定时器
    if (searchTimeoutId) {
      clearTimeout(searchTimeoutId);
    }

    // 如果搜索框为空，显示全部题目
    if (!searchQuery.trim()) {
      // 立即取消当前搜索状态和加载
      setIsSearching(false);
      setLoading(false);
      setQuestionsLoading(false);
      
      // 如果没有搜索关键词，只使用客户端筛选
      if (questionCache.length > 0) {
        // 获取已添加的题目ID
        const addedIds = getAddedQuestionIds();
        
        // 先排除已添加的题目
        let availableQuestions = questionCache.filter(question => !addedIds.has(question._id));
        
        // 应用客户端筛选（只筛选条件，不搜索）
        const filtered = filterQuestions(
          availableQuestions,
          '', // 空搜索关键词
          selectedTypes,
          selectedDifficulties,
          selectedBanks,
          selectedTags
        );
        
        // 去重处理
        const uniqueFiltered = filtered.filter((question, index, self) => 
          index === self.findIndex(q => q._id === question._id)
        );
        
        // 更新筛选后的题目列表
        setFilteredQuestions(uniqueFiltered);
        setAvailableQuestions(uniqueFiltered.slice(0, pageSize));
        
        // 更新分页信息
        setTotalQuestions(uniqueFiltered.length);
        setTotalPages(Math.ceil(uniqueFiltered.length / pageSize));
        setCurrentPage(1);
      } else {
        // 如果缓存为空且没有搜索关键词，重新加载全部题目
        setIsSearching(true);
        setQuestionsLoading(true);
        loadQuestions(1, true, true, true, true).finally(() => {
          setIsSearching(false);
          setQuestionsLoading(false);
        });
      }
      return;
    }

    // 如果有搜索关键词，立即清空缓存和筛选结果，防止显示旧结果
    if (searchQuery.trim()) {
      // 立即清空缓存和筛选结果，防止显示上一个搜索的结果
      setQuestionCache([]);
      setFilteredQuestions([]);
      setAvailableQuestions([]);
      setIsSearching(true);
      setQuestionsLoading(true);
      
      // 立即开始搜索
      loadQuestions(1, true, true, true, true).finally(() => {
        setIsSearching(false);
        setQuestionsLoading(false);
      });
    }
  };

  // 清空搜索
  const handleClearSearch = () => {
    setSearchQuery('');
    handleSearch();
  };

  // 拖拽传感器
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // 处理拖拽结束
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    // 找到拖拽的题目属于哪个部分
    const sourceSection = sections.find(section => 
      section.questions.some(question => question._id === active.id)
    );

    if (!sourceSection) {
      return;
    }

    const oldIndex = sourceSection.questions.findIndex(question => question._id === active.id);
    const newIndex = sourceSection.questions.findIndex(question => question._id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      // 更新题目顺序
      const newQuestions = arrayMove(sourceSection.questions, oldIndex, newIndex);
      
      setSections(prevSections => 
        prevSections.map(section => 
          section.id === sourceSection.id 
            ? { ...section, questions: newQuestions }
            : section
        )
      );
      setHasBeenSaved(false); // 重置保存状态
    }
  };

  // 监听搜索框内容变化，清空时自动显示全部题目
  useEffect(() => {
    // 如果搜索框为空，自动显示全部题目
    if (!searchQuery.trim()) {
      // 立即取消当前搜索状态和加载
      setIsSearching(false);
      setLoading(false);
      setQuestionsLoading(false);
      
      // 如果没有搜索关键词，只使用客户端筛选
      if (questionCache.length > 0) {
        // 获取已添加的题目ID
        const addedIds = getAddedQuestionIds();
        
        // 先排除已添加的题目
        let availableQuestions = questionCache.filter(question => !addedIds.has(question._id));
        
        // 应用客户端筛选（只筛选条件，不搜索）
        const filtered = filterQuestions(
          availableQuestions,
          '', // 空搜索关键词
          selectedTypes,
          selectedDifficulties,
          selectedBanks,
          selectedTags
        );
        
        // 去重处理
        const uniqueFiltered = filtered.filter((question, index, self) => 
          index === self.findIndex(q => q._id === question._id)
        );
        
        // 更新筛选后的题目列表
        setFilteredQuestions(uniqueFiltered);
        setAvailableQuestions(uniqueFiltered.slice(0, pageSize));
        
        // 更新分页信息
        setTotalQuestions(uniqueFiltered.length);
        setTotalPages(Math.ceil(uniqueFiltered.length / pageSize));
        setCurrentPage(1);
      } else {
        // 如果缓存为空且没有搜索关键词，重新加载全部题目
        setIsSearching(true);
        setQuestionsLoading(true);
        loadQuestions(1, true, true, true, true).finally(() => {
          setIsSearching(false);
          setQuestionsLoading(false);
        });
      }
    }
  }, [searchQuery]); // 监听搜索框内容变化

  // 筛选逻辑（只处理筛选条件变化）
  useEffect(() => {
    // 如果正在搜索，不处理筛选
    if (isSearching || searchQuery.trim()) {
      return;
    }

    // 如果有缓存，进行客户端筛选
    if (questionCache.length > 0) {
      // 获取已添加的题目ID
      const addedIds = getAddedQuestionIds();
      
      // 先排除已添加的题目
      let availableQuestions = questionCache.filter(question => !addedIds.has(question._id));
      
      // 应用客户端筛选
      const filtered = filterQuestions(
        availableQuestions,
        '', // 空搜索关键词
        selectedTypes,
        selectedDifficulties,
        selectedBanks,
        selectedTags
      );
      
      // 去重处理
      const uniqueFiltered = filtered.filter((question, index, self) => 
        index === self.findIndex(q => q._id === question._id)
      );
      
      // 更新筛选后的题目列表
      setFilteredQuestions(uniqueFiltered);
      setAvailableQuestions(uniqueFiltered.slice(0, pageSize));
      
      // 更新分页信息
      setTotalQuestions(uniqueFiltered.length);
      setTotalPages(Math.ceil(uniqueFiltered.length / pageSize));
      setCurrentPage(1);
    }
  }, [selectedTypes, selectedDifficulties, selectedBanks, selectedTags, questionCache, isSearching, searchQuery]); // 监听筛选条件和缓存变化

  // 监听试卷集变化，重新加载题目并排除该试卷集中已使用的题目
  useEffect(() => {
    if (selectedPaperBank && questionsLoaded) {
      // 切换试卷集时，重新加载题目并排除该试卷集中已使用的题目
      loadQuestions(1, true, true, true, true);
    }
  }, [selectedPaperBank]);

  // 监听缓存变化，自动更新显示（只在非搜索状态下）
  useEffect(() => {
    if (questionCache.length > 0 && currentPage > 1 && !searchQuery.trim()) {
      const startIndex = (currentPage - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const questions = questionCache.slice(startIndex, endIndex);
      
      if (questions.length > 0) {
        setAvailableQuestions(questions);
        setAllDisplayedQuestionIds(prev => {
          const newSet = new Set(prev);
          questions.forEach(q => newSet.add(q._id));
          return newSet;
        });
      }
    }
  }, [questionCache, currentPage, searchQuery]);

  // 加载试卷集和题目数据
  const loadData = async () => {
    try {
      // 在编辑模式下，不设置loading状态，让questionsLoaded控制显示
      if (!practiceId || practiceId === 'undefined') {
        setLoading(true);
      }
      
      // 设置所有加载状态
      setQuestionsLoading(true);
      setPreviewLoading(true);
      
      // 构建并行请求数组
      const parallelRequests: Promise<any>[] = [
        paperBankAPI.getMyPapers(),
        questionBankAPI.getQuestionBanks()
      ];
      
      // 如果指定了试卷集ID，添加试卷集请求
      if (paperBankId && paperBankId !== 'undefined') {
        parallelRequests.push(paperBankAPI.getPaperBank(paperBankId));
      }
      
      // 如果是编辑模式，添加练习卷请求和题目请求
      if (practiceId && practiceId !== 'undefined') {
        parallelRequests.push(paperAPI.getPaper(practiceId));
        // 题目请求（不排除已添加的题目，因为sections还没加载，但排除试卷集中已使用的题目）
        parallelRequests.push(loadQuestions(1, true, false, false, true));
      } else {
        // 如果不是编辑模式，直接加载题目（排除已添加的题目和试卷集中已使用的题目）
        // 注意：在创建模式下，excludeAdded 应该是 false，因为没有已添加的题目
        parallelRequests.push(loadQuestions(1, true, false, false, true));
      }
      
      // 并行执行所有请求
      const results = await Promise.all(parallelRequests);
      
      // 处理试卷集数据
      if (results[0]?.data?.success) {
        setPaperBanks(results[0].data.data.papers || []);
      }
      
      // 处理题目库数据
      if (results[1]?.data?.success) {
        setQuestionBanks(results[1].data.questionBanks || []);
      }
      
      let resultIndex = 2;
      
      // 处理试卷集详情（如果存在）
      if (paperBankId && paperBankId !== 'undefined') {
        if (results[resultIndex]?.data?.success) {
          setSelectedPaperBank(paperBankId);
        }
        resultIndex++;
      } else {
        // 如果没有从URL获取到试卷集ID，自动选择第一个试卷集
        if (paperBanks.length > 0) {
          setSelectedPaperBank(paperBanks[0]._id);
        }
      }
      
      // 处理编辑模式的数据
      if (practiceId && practiceId !== 'undefined') {
        // 处理练习卷数据
        if (results[resultIndex]?.data?.success && results[resultIndex]?.data?.data) {
          const practice = results[resultIndex].data.data;
          
          // 设置练习卷基本信息
          setTitle(practice.name || '');
          
          // 设置试卷集
          if (practice.bank) {
            setSelectedPaperBank(practice.bank._id || practice.bank);
          }
          
          // 设置部分和题目数据
          if (practice.sections && practice.sections.length > 0) {
            const loadedSections = practice.sections.map((section: any, index: number) => ({
              id: (index + 1).toString(),
              title: section.title || t('practiceEditor.defaultSectionTitle', { number: index + 1 }),
              questions: section.items ? section.items.map((item: any) => {
                // 如果item有question字段，使用它；否则直接使用item
                const question = item.question || item;
                return {
                  _id: question._id,
                  content: question.content,
                  type: question.type,
                  difficulty: question.difficulty,
                  tags: question.tags || [],
                  category: question.category || []
                };
              }) : []
            }));
            setSections(loadedSections);
            
            // 设置当前选中的部分为第一个部分
            if (loadedSections.length > 0) {
              setSelectedSection(loadedSections[0].id);
            }
          }
        }
      }
    } catch (error) {
      console.error('加载数据失败:', error);
      showErrorRightSlide(t('practiceEditor.errors.loadFailed'), t('practiceEditor.errors.loadFailedMessage'));
    } finally {
      // 结束所有加载状态
      setQuestionsLoading(false);
      setPreviewLoading(false);
      
      // 在编辑模式下，不设置loading状态，让questionsLoaded控制显示
      if (!practiceId || practiceId === 'undefined') {
        setLoading(false);
      }
    }
  };

  // 加载题目数据（支持分页和筛选）
  const loadQuestions = async (page: number = 1, resetQuestions: boolean = true, excludeAdded: boolean = false, manageLoading: boolean = true, excludePaperBankUsed: boolean = false) => {
    try {
      if (manageLoading) {
        setQuestionsLoading(true);
      }
      
      // 如果是第一页且缓存为空，或者筛选条件发生变化，需要重新加载
      const shouldReloadCache = page === 1 && (questionCache.length === 0 || resetQuestions);
      
      if (shouldReloadCache) {
        // 清空缓存并重新加载
        setQuestionCache([]);
        
        // 构建筛选参数
        const filterParams: any = {
          page: 1,
          limit: searchQuery.trim() ? 100 : 100 // 总是获取更多题目，确保显示全部
        };
      
        // 添加搜索条件
        if (searchQuery.trim()) {
          filterParams.search = searchQuery.trim();
        }
        
        // 添加题型筛选
        if (selectedTypes.length > 0) {
          filterParams.type = selectedTypes;
        }
        
        // 添加难度筛选
        if (selectedDifficulties.length > 0) {
          filterParams.difficulty = selectedDifficulties;
        }
        
        // 添加题库筛选
        if (selectedBanks.length > 0) {
          filterParams.bankId = selectedBanks;
        }
        
        // 添加标签筛选
        if (selectedTags.length > 0) {
          filterParams.tags = selectedTags;
        }

        const questionsResponse = await questionAPI.getAllQuestions(filterParams);

        if (questionsResponse.data.success) {
          let questions = questionsResponse.data.data?.questions || [];
        
        // 如果需要排除已添加的题目
        if (excludeAdded) {
          const addedIds = getAddedQuestionIds();
          questions = questions.filter(question => !addedIds.has(question._id));
        }
        
        // 如果需要排除试卷集中已使用的题目
        if (excludePaperBankUsed && selectedPaperBank) {
          const usedIds = await getUsedQuestionIdsInPaperBank(selectedPaperBank);
          questions = questions.filter(question => !usedIds.includes(question._id));
          
          // 如果筛选后题目数量不足目标数量，且是重置模式，尝试加载更多题目
          const targetCount = 100; // 总是尝试加载更多题目
          if (resetQuestions && questions.length < targetCount) {
            let currentPage = page;
            
            // 持续加载直到达到目标数量或没有更多题目
            while (questions.length < targetCount) {
              currentPage++;
              
              try {
                // 构建筛选参数
                const moreFilterParams: any = {
                  page: currentPage,
                  limit: 100 // 总是获取更多题目
                };
                
                // 添加搜索条件
                if (searchQuery.trim()) {
                  moreFilterParams.search = searchQuery.trim();
                }
                
                // 添加题型筛选
                if (selectedTypes.length > 0) {
                  moreFilterParams.type = selectedTypes;
                }
                
                // 添加难度筛选
                if (selectedDifficulties.length > 0) {
                  moreFilterParams.difficulty = selectedDifficulties;
                }
                
                // 添加题库筛选
                if (selectedBanks.length > 0) {
                  moreFilterParams.bankId = selectedBanks;
                }
                
                // 添加标签筛选
                if (selectedTags.length > 0) {
                  moreFilterParams.tags = selectedTags;
                }
                
                const moreQuestionsResponse = await questionAPI.getAllQuestions(moreFilterParams);
                
                if (!moreQuestionsResponse.data.success || !moreQuestionsResponse.data.data?.questions?.length) {
                  // 没有更多题目了，退出循环
                  break;
                }
                
                let moreQuestions = moreQuestionsResponse.data.data.questions;
                
                // 排除已添加的题目
                if (excludeAdded) {
                  const addedIds = getAddedQuestionIds();
                  moreQuestions = moreQuestions.filter(question => !addedIds.has(question._id));
                }
                
                // 排除试卷集中已使用的题目
                moreQuestions = moreQuestions.filter(question => !usedIds.includes(question._id));
                
                // 添加新题目，但不超过目标数量
                const remainingSlots = targetCount - questions.length;
                questions = [...questions, ...moreQuestions.slice(0, remainingSlots)];
                
                // 如果这一页没有有效题目，退出循环
                if (moreQuestions.length === 0) {
                  break;
                }
              } catch (error) {
                console.error('加载更多题目失败:', error);
                break;
              }
            }
          }
        }
        
        // 在分页时，排除已经显示过的题目（除了第一页）
        if (page > 1 && allDisplayedQuestionIds.size > 0) {
          questions = questions.filter(question => !allDisplayedQuestionIds.has(question._id));
        }
        
        // 使用API返回的分页信息（现在使用客户端筛选结果）
        // const total = questionsResponse.data.data?.pagination?.total || 0;
        // const totalPagesFromAPI = questionsResponse.data.data?.pagination?.totalPages || 1;
        
        if (resetQuestions) {
          // 更新缓存
          setQuestionCache(questions);
          // 应用客户端筛选
          const addedIds = getAddedQuestionIds();
          const availableQuestions = questions.filter(question => !addedIds.has(question._id));
          const filtered = filterQuestions(
            availableQuestions,
            searchQuery,
            selectedTypes,
            selectedDifficulties,
            selectedBanks,
            selectedTags
          );
          setFilteredQuestions(filtered);
          setAvailableQuestions(filtered.slice(0, pageSize));
          setTotalQuestions(filtered.length);
          setTotalPages(Math.ceil(filtered.length / pageSize));
          setAllDisplayedQuestionIds(new Set(filtered.slice(0, pageSize).map(q => q._id)));
        } else {
          // 追加模式：更新缓存并重新筛选
          const newCache = [...questionCache, ...questions];
          // 去重处理
          const uniqueCache = newCache.filter((question, index, self) => 
            index === self.findIndex(q => q._id === question._id)
          );
          setQuestionCache(uniqueCache);
          const addedIds = getAddedQuestionIds();
          const availableQuestions = uniqueCache.filter(question => !addedIds.has(question._id));
          const filtered = filterQuestions(
            availableQuestions,
            searchQuery,
            selectedTypes,
            selectedDifficulties,
            selectedBanks,
            selectedTags
          );
          setFilteredQuestions(filtered);
          setAvailableQuestions(prev => {
            const newQuestions = filtered.slice(prev.length, prev.length + pageSize);
            // 去重处理
            const uniqueQuestions = [...prev, ...newQuestions].filter((question, index, self) => 
              index === self.findIndex(q => q._id === question._id)
            );
            return uniqueQuestions;
          });
          setTotalQuestions(filtered.length);
          setTotalPages(Math.ceil(filtered.length / pageSize));
          setAllDisplayedQuestionIds(prev => {
            const newSet = new Set(prev);
            filtered.slice(prev.size, prev.size + pageSize).forEach(q => newSet.add(q._id));
            return newSet;
          });
        }
        
        setCurrentPage(page);
        
        // 更新可用筛选选项（只在第一页时更新）
        if (page === 1 && questionsResponse.data.data?.filters) {
          setAvailableTags(questionsResponse.data.data.filters.availableTags || []);
        }
        
          // 标记题目已加载完成
          setQuestionsLoaded(true);
          
          // 启动预加载
          if (questions.length >= 20) {
            preloadQuestions(currentPage + 1, cacheSize);
          }
        } else {
          showErrorRightSlide(t('practiceEditor.errors.questionLoadFailed'), questionsResponse.data.error || t('practiceEditor.errors.questionLoadFailedMessage'));
        }
      } else {
        // 使用缓存中的题目
        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const questions = questionCache.slice(startIndex, endIndex);
        
        if (questions.length > 0) {
          setAvailableQuestions(questions);
          setAllDisplayedQuestionIds(prev => {
            const newSet = new Set(prev);
            questions.forEach(q => newSet.add(q._id));
            return newSet;
          });
          setCurrentPage(page);
        } else {
          // 缓存中没有足够的题目，需要加载更多
          const nextPage = Math.floor(questionCache.length / pageSize) + 1;
          preloadQuestions(nextPage, cacheSize);
        }
      }
    } catch (error) {
      console.error('加载题目失败:', error);
      showErrorRightSlide(t('practiceEditor.errors.loadFailed'), t('practiceEditor.errors.questionLoadFailedMessage'));
    } finally {
      if (manageLoading) {
        setQuestionsLoading(false);
      }
    }
  };

  // 分页处理函数
  const handlePageChange = (page: number) => {
    // 使用筛选后的题目进行分页
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const questions = filteredQuestions.slice(startIndex, endIndex);
    
    if (questions.length > 0) {
      // 去重处理
      const uniqueQuestions = questions.filter((question, index, self) => 
        index === self.findIndex(q => q._id === question._id)
      );
      setAvailableQuestions(uniqueQuestions);
      setAllDisplayedQuestionIds(prev => {
        const newSet = new Set(prev);
        uniqueQuestions.forEach(q => newSet.add(q._id));
        return newSet;
      });
      setCurrentPage(page);
    } else if (filteredQuestions.length === 0 && questionCache.length > 0) {
      // 如果没有筛选结果，尝试加载更多数据
      const nextPage = Math.floor(questionCache.length / pageSize) + 1;
      preloadQuestions(nextPage, cacheSize);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      handlePageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      handlePageChange(currentPage + 1);
    }
  };

  // 试卷集选择处理
  const handlePaperBankChange = (value: string | number) => {
    setSelectedPaperBank(String(value));
    // 切换试卷集时，立即重新加载题目并排除该试卷集中已使用的题目
    if (questionsLoaded) {
      loadQuestions(1, true, true, true, true);
    }
  };

  // 添加题目到section
  const addQuestionToSection = (question: Question, sectionId?: string) => {
    const targetSectionId = sectionId || selectedSection;
    
    setSections(prevSections => 
      prevSections.map(section => 
        section.id === targetSectionId 
          ? { ...section, questions: [...section.questions, question] }
          : section
      )
    );
    setHasBeenSaved(false); // 重置保存状态
    
    // 从筛选结果中移除已添加的题目
    const newFiltered = filteredQuestions.filter(q => q._id !== question._id);
    setFilteredQuestions(newFiltered);
    
    // 更新当前页显示的题目
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const newAvailableQuestions = newFiltered.slice(startIndex, endIndex);
    setAvailableQuestions(newAvailableQuestions);
    
    // 更新分页信息
    setTotalQuestions(newFiltered.length);
    setTotalPages(Math.ceil(newFiltered.length / pageSize));
    
    // 更新已显示的题目ID集合
    setAllDisplayedQuestionIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(question._id);
      newAvailableQuestions.forEach(q => newSet.add(q._id));
      return newSet;
    });
  };

  // 从section移除题目
  const removeQuestionFromSection = (questionId: string, sectionId: string) => {
    // 找到要移除的题目
    const section = sections.find(s => s.id === sectionId);
    const questionToRemove = section?.questions.find(q => q._id === questionId);
    
    setSections(prevSections => 
      prevSections.map(section => 
        section.id === sectionId 
          ? { ...section, questions: section.questions.filter(q => q._id !== questionId) }
          : section
      )
    );
    setHasBeenSaved(false); // 重置保存状态
    
    // 将题目重新添加到筛选结果中
    if (questionToRemove) {
      const newFiltered = [...filteredQuestions, questionToRemove];
      setFilteredQuestions(newFiltered);
      
      // 更新当前页显示的题目
      const startIndex = (currentPage - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const newAvailableQuestions = newFiltered.slice(startIndex, endIndex);
      setAvailableQuestions(newAvailableQuestions);
      
      // 更新分页信息
      setTotalQuestions(newFiltered.length);
      setTotalPages(Math.ceil(newFiltered.length / pageSize));
      
      // 更新已显示的题目ID集合
      setAllDisplayedQuestionIds(prev => {
        const newSet = new Set(prev);
        newSet.add(questionToRemove._id);
        newAvailableQuestions.forEach(q => newSet.add(q._id));
        return newSet;
      });
    }
  };


  // 添加新的section
  const addSection = () => {
    const newId = (sections.length + 1).toString();
    setSections(prevSections => [
      ...prevSections,
      { id: newId, title: t('practiceEditor.defaultSectionTitle', { number: sections.length + 1 }), questions: [] }
    ]);
    setEditingSection(newId);
    setSelectedSection(newId); // 自动切换到新部分
  };

  // 删除section
  const removeSection = (sectionId: string) => {
    if (sections.length > 1) {
      setSections(prevSections => prevSections.filter(s => s.id !== sectionId));
      
      // 如果删除的是当前编辑的section，切换到第一个section
      if (editingSection === sectionId) {
        const remainingSections = sections.filter(s => s.id !== sectionId);
        if (remainingSections.length > 0) {
          setEditingSection(remainingSections[0].id);
        }
      }
      
      // 如果删除的是当前选中的section，切换到第一个section
      if (selectedSection === sectionId) {
        const remainingSections = sections.filter(s => s.id !== sectionId);
        if (remainingSections.length > 0) {
          setSelectedSection(remainingSections[0].id);
        }
      }
    }
  };

  // 更新section信息
  const updateSection = (sectionId: string, field: 'title' | 'instruction', value: string) => {
    setSections(prevSections => 
      prevSections.map(section => 
        section.id === sectionId 
          ? { ...section, [field]: value }
          : section
      )
    );
    setHasBeenSaved(false); // 重置保存状态
  };

  // 处理标题编辑
  const handleTitleEdit = (sectionId: string) => {
    setEditingTitle(sectionId);
  };

  const handleTitleSave = (sectionId: string, newTitle: string) => {
    if (newTitle.trim()) {
      updateSection(sectionId, 'title', newTitle.trim());
    }
    setEditingTitle(null);
  };

  const handleTitleCancel = () => {
    setEditingTitle(null);
  };

  // 处理练习标题编辑
  const handlePracticeTitleEdit = () => {
    setEditingPracticeTitle(true);
  };

  const handlePracticeTitleSave = (newTitle: string) => {
    if (newTitle.trim()) {
      setTitle(newTitle.trim());
      setHasBeenSaved(false); // 重置保存状态
    }
    setEditingPracticeTitle(false);
  };

  const handlePracticeTitleCancel = () => {
    setEditingPracticeTitle(false);
  };

  // 切换选中的部分
  const switchToSection = (sectionId: string) => {
    setSelectedSection(sectionId);
  };

  // 交换部分位置
  const swapSections = (fromIndex: number, toIndex: number) => {
    const newSections = [...sections];
    [newSections[fromIndex], newSections[toIndex]] = [newSections[toIndex], newSections[fromIndex]];
    setSections(newSections);
    setHasBeenSaved(false); // 重置保存状态
  };


  // 保存练习
  const handleSave = async (): Promise<boolean> => {
    if (!title.trim()) {
      showErrorRightSlide(t('practiceEditor.errors.saveFailed'), t('practiceEditor.errors.noTitleMessage'));
      return false;
    }

    if (sections.every(section => section.questions.length === 0)) {
      showErrorRightSlide(t('practiceEditor.errors.saveFailed'), t('practiceEditor.errors.noQuestionsMessage'));
      return false;
    }

    try {
      setIsSaving(true);
      
      // 转换sections格式
      const paperSections = sections.map(section => ({
        title: section.title,
        items: section.questions.map(question => ({
          question: question._id
          // 练习模式不设置分值
        }))
      }));

      // 自动提取标签
      const autoTags = extractTopTags();

      // 确定使用的试卷集ID
      const bankId = paperBankId || selectedPaperBank;
      
      if (!bankId) {
        showErrorRightSlide(t('practiceEditor.errors.saveFailed'), t('practiceEditor.errors.noPaperBankMessage'));
        return false;
      }

      const practiceData = {
        name: title,
        type: 'practice',
        tags: autoTags,
        paperBankId: bankId,
        sections: paperSections
      };

      let response;
      if (practiceId && practiceId !== 'undefined') {
        // 编辑模式：更新现有练习卷
        response = await paperAPI.updatePaper(practiceId, practiceData);
      } else {
        // 创建模式：创建新练习卷
        response = await paperAPI.createPaper(practiceData);
      }
      
      if (response.data.success) {
        const successMessage = practiceId ? t('practiceEditor.success.practiceUpdated') : t('practiceEditor.success.practiceSaved');
        showSuccessRightSlide(t('practiceEditor.success.saveSuccess'), successMessage);
        setHasBeenSaved(true); // 标记为已保存
        return true;
      } else {
        showErrorRightSlide(t('practiceEditor.errors.saveFailed'), t('practiceEditor.errors.saveFailedMessage'));
        return false;
      }
    } catch (error) {
      console.error('保存练习失败:', error);
      showErrorRightSlide(t('practiceEditor.errors.saveFailed'), t('practiceEditor.errors.saveError'));
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  // 检查是否有实际编辑
  const hasActualChanges = () => {
    // 检查是否有标题
    const hasTitle = title.trim().length > 0;
    
    // 检查是否有题目
    const hasQuestions = sections.some(section => section.questions.length > 0);
    
    // 检查是否有非默认的部分标题（排除默认的"第一部分"）
    const hasCustomSectionTitles = sections.some((section, index) => 
      section.title !== t('practiceEditor.defaultSectionTitle', { number: index + 1 }) && section.title !== t('practiceEditor.defaultSectionTitle', { number: 1 })
    );
    
    return hasTitle || hasQuestions || hasCustomSectionTitles;
  };

  // 处理返回
  const handleBack = () => {
    // 如果已经保存过，直接返回
    if (hasBeenSaved) {
      navigate(-1);
      return;
    }
    
    if (hasActualChanges()) {
      setShowSaveModal(true);
    } else {
      navigate(-1);
    }
  };

  // 确认保存并返回
  const handleConfirmSave = async () => {
    // 检查是否有标题
    if (!title.trim()) {
      showErrorRightSlide(t('practiceEditor.errors.saveFailed'), t('practiceEditor.errors.noTitle'));
      setShowSaveModal(false);
      return;
    }
    
    // 设置保存中状态
    setIsSaving(true);
    
    const success = await handleSave();
    if (success) {
      setShowSaveModal(false);
      navigate(-1);
    }
    // 注意：setIsSaving(false) 在 handleSave 的 finally 中已经处理
  };

  // 取消保存
  const handleCancelSave = () => {
    setShowSaveModal(false);
    navigate(-1);
  };

  // 只在新建模式下显示全屏加载
  if (loading && (!practiceId || practiceId === 'undefined')) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">{t('practiceEditor.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* 头部工具栏 */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* 左侧 */}
            <div className="flex items-center space-x-4">
              <Button
                onClick={handleBack}
                variant="ghost"
                size="sm"
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t('practiceEditor.back')}
              </Button>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <PenTool className="w-5 h-5 text-orange-500" />
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">
                    {t('practiceEditor.pageTitle')}
                  </span>
                </div>
                
                
                {/* 试卷集选择 */}
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600 dark:text-gray-300">{t('practiceEditor.paperBank')}:</span>
                  <SimpleSelect
                    options={paperBanks.map(bank => ({
                      value: bank._id,
                      label: bank.name
                    }))}
                    value={selectedPaperBank}
                    onChange={handlePaperBankChange}
                    placeholder={t('practiceEditor.selectPaperBank')}
                    size="sm"
                    variant="outline"
                    theme="gray"
                    className="w-48"
                  />
                </div>
              </div>
            </div>

            {/* 右侧 */}
            <div className="flex items-center space-x-3">
              <Button
                onClick={async () => {
                  if (!title.trim()) {
                    showErrorRightSlide(t('practiceEditor.errors.saveFailed'), t('practiceEditor.errors.noTitle'));
                    return;
                  }
                  await handleSave();
                }}
                disabled={isSaving}
                className="bg-orange-500 hover:bg-orange-600 text-white"
              >
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? t('practiceEditor.saving') : t('practiceEditor.save')}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 主要内容区域 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 左侧：题目选择器 */}
          <div>

            {/* 题目筛选 */}
            <Card className="p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {t('practiceEditor.questionFilter')}
                </h3>
                <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowFilters(!showFilters)}
                      className="flex items-center space-x-1"
                    >
                      <Filter className="w-4 h-4" />
                      <span>{showFilters ? t('practiceEditor.hideFilter') : t('practiceEditor.advancedFilter')}</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedTypes([]);
                        setSelectedDifficulties([]);
                        setSelectedBanks([]);
                        setSelectedTags([]);
                        // 重置后重新加载题目，排除已添加的题目
                        loadQuestions(1, true, true);
                      }}
                      className="flex items-center space-x-1"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span>{t('practiceEditor.reset')}</span>
                    </Button>
                </div>
              </div>
              
              <div className="space-y-4">
                {/* 搜索框 */}
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    {isSearching ? (
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                        <div className="animate-spin w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full"></div>
                      </div>
                    ) : (
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    )}
                    <Input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleSearch();
                        }
                      }}
                      placeholder={t('practiceEditor.searchPlaceholder')}
                      className="pl-10 pr-10"
                    />
                    {searchQuery && (
                      <button
                        onClick={handleClearSearch}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <Button
                    onClick={handleSearch}
                    disabled={isSearching}
                    className="px-4"
                  >
                    {isSearching ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        {t('practiceEditor.searching')}
                      </div>
                    ) : (
                      t('practiceEditor.search')
                    )}
                  </Button>
                </div>

                {/* 高级筛选面板 */}
                {showFilters && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {/* 题型筛选 */}
                      <div>
                        <MultiSelect
                          label={t('practiceEditor.typeFilter')}
                          options={[
                            { value: 'choice', label: t('practiceEditor.questionTypes.choice') },
                            { value: 'multiple-choice', label: t('practiceEditor.questionTypes.multipleChoice') },
                            { value: 'fill', label: t('practiceEditor.questionTypes.fill') },
                            { value: 'solution', label: t('practiceEditor.questionTypes.solution') }
                          ]}
                          value={selectedTypes}
                          onChange={(value) => setSelectedTypes(value as string[])}
                          placeholder={t('practiceEditor.selectTypes')}
                        />
                      </div>

                      {/* 难度筛选 */}
                      <div>
                        <MultiSelect
                          label={t('practiceEditor.difficultyFilter')}
                          options={[
                            { value: 1, label: t('practiceEditor.difficulties.veryEasy'), icon: '○' },
                            { value: 2, label: t('practiceEditor.difficulties.easy'), icon: '○○' },
                            { value: 3, label: t('practiceEditor.difficulties.medium'), icon: '○○○' },
                            { value: 4, label: t('practiceEditor.difficulties.hard'), icon: '○○○○' },
                            { value: 5, label: t('practiceEditor.difficulties.veryHard'), icon: '○○○○○' }
                          ]}
                          value={selectedDifficulties}
                          onChange={(value) => setSelectedDifficulties(value as number[])}
                          placeholder={t('practiceEditor.selectDifficulty')}
                          maxDisplay={2}
                        />
                      </div>

                      {/* 题库筛选 */}
                      <div>
                        <MultiSelect
                          label={t('practiceEditor.bankFilter')}
                          options={questionBanks.map(bank => ({
                            value: bank.bid,
                            label: bank.name
                          }))}
                          value={selectedBanks}
                          onChange={(value) => setSelectedBanks(value as string[])}
                          placeholder={t('practiceEditor.selectBank')}
                          maxDisplay={2}
                        />
                      </div>
                    </div>


                    {/* 标签筛选 */}
                    <div>
                      <TagSelector
                        label={t('practiceEditor.tagFilter')}
                        availableTags={availableTags}
                        selectedTags={selectedTags}
                        onTagsChange={setSelectedTags}
                        placeholder={t('practiceEditor.selectTags')}
                      />
                    </div>
                  </motion.div>
                )}

                {/* 筛选结果统计 */}
                <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300">
                  <span>{t('practiceEditor.foundQuestions', { count: totalQuestions })}</span>
                </div>
              </div>
            </Card>

            {/* 可用题目列表 */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {t('practiceEditor.availableQuestions')} ({availableQuestions.length})
                </h3>
                {questionsLoading && (
                  <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                    <span className="text-sm">{t('practiceEditor.loadingQuestions')}</span>
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600 dark:text-gray-300">{t('practiceEditor.addTo')}:</span>
                  <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                    {sections.find(s => s.id === selectedSection)?.title || `${t('practiceEditor.section')} ${selectedSection}`}
                  </span>
                </div>
              </div>
              
              <div className={`space-y-4 max-h-[32rem] overflow-y-auto overscroll-contain relative ${questionsLoading ? 'opacity-50' : ''}`}>
                {questionsLoading && (
                  <div className="absolute inset-0 bg-white/50 dark:bg-gray-900/50 flex items-center justify-center z-10 rounded-lg">
                    <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>{t('practiceEditor.filteringQuestions')}</span>
                    </div>
                  </div>
                )}
                {availableQuestions.length === 0 && !questionsLoading ? (
                  <div className="text-center py-20 text-gray-500 dark:text-gray-400">
                    <p>{t('practiceEditor.noQuestions')}</p>
                    <p className="text-sm mt-2">{t('practiceEditor.noQuestionsDescription')}</p>
                  </div>
                ) : (
                  availableQuestions.map((question) => (
                  <motion.div
                    key={question._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getQuestionTypeColor(question.type)}`}>
                            {getQuestionTypeText(question.type)}
                          </span>
                          {question.difficulty && (
                            <span 
                              className={`px-2 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(question.difficulty)}`}
                              style={{
                                backgroundColor: question.difficulty === 5 ? '#faf5ff' : undefined,
                                color: question.difficulty === 5 ? '#9333ea' : undefined,
                                borderColor: question.difficulty === 5 ? '#e9d5ff' : undefined
                              }}
                            >
                              {getDifficultyText(question.difficulty)}
                            </span>
                          )}
                          {/* 题目标签 - 移到类型行，与QuestionView样式一致 */}
                          {(() => {
                            const categories = getCategoryArray(question.category);
                            const tags = question.tags || [];
                            const allTags = [...categories, ...tags];
                            
                            return allTags.length > 0 ? (
                              <div className="flex flex-wrap gap-2">
                                {allTags.slice(0, 3).map((tag, index) => {
                                  // 判断标签类型：前几个是小题型，后面是知识点
                                  const isCategory = index < categories.length;
                                  const tagClass = isCategory ? 'category-tag' : 'knowledge-tag';
                                  
                                  return (
                                    <span
                                      key={`${question._id}-tag-${index}`}
                                      className={`${tagClass} inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200`}
                                    >
                                      {tag}
                                    </span>
                                  );
                                })}
                              </div>
                            ) : null;
                          })()}
                        </div>
                        
                        {/* LaTeX渲染的完整题目内容 */}
                        <div className="mb-3">
                          <LaTeXPreview
                            content={question.content?.stem || t('practiceEditor.questionContentLoading')}
                            config={{ 
                              mode: 'full',
                              features: {
                                markdown: true,
                                questionSyntax: true,
                                autoNumbering: true,
                                errorHandling: 'lenient'
                              },
                              styling: {
                                fontSize: '1rem',
                                lineHeight: '1.6',
                                maxWidth: '100%'
                              }
                            }}
                            variant="compact"
                            showTitle={false}
                            className="question-card-latex-content"
                            maxWidth="max-w-none"
                          />
                        </div>
                        
                        {/* 题目图片和TikZ显示 */}
                        {((question.images && question.images.length > 0) || (question.tikzCodes && question.tikzCodes.length > 0)) && (
                          <div className="mb-3">
                            <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                              {t('practiceEditor.graphicsAndImages')} ({((question.images?.length || 0) + (question.tikzCodes?.length || 0))} {t('practiceEditor.count')})
                            </div>
                            
                            {/* 合并图片和图形数据 */}
                            <div className="flex space-x-2 overflow-x-auto pb-1">
                              {[
                                ...(question.images || []).map(item => ({ type: 'image' as const, data: item })),
                                ...(question.tikzCodes || []).map(item => ({ type: 'tikz' as const, data: item }))
                              ].sort((a, b) => {
                                // 按order字段排序
                                const orderA = a.data.order || 0;
                                const orderB = b.data.order || 0;
                                return orderA - orderB;
                              }).map((item) => (
                                <div key={`${item.type}-${item.data.id}`} className="flex-shrink-0 group relative">
                                  {item.type === 'image' ? (
                                    // 图片显示
                                    <div className="w-16 h-12 rounded border border-gray-200 dark:border-gray-600 overflow-hidden bg-gray-50 dark:bg-gray-700 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer">
                                      <img
                                        src={item.data.url}
                                        alt={item.data.filename}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                      />
                                      <div className="absolute top-0.5 left-0.5 bg-blue-500 text-white text-xs px-1 py-0.5 rounded text-[10px]">
                                        {t('practiceEditor.image')}
                                      </div>
                                    </div>
                                  ) : (
                                    // TikZ显示
                                    <div className="w-16 h-12 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-600 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden cursor-pointer">
                                      <TikZPreview
                                        code={item.data.code}
                                        format={item.data.format as 'svg' | 'png'}
                                        width={200}
                                        height={150}
                                        showGrid={false}
                                        showTitle={false}
                                        className="w-full h-full group-hover:scale-105 transition-transform duration-200 flex items-center justify-center"
                                      />
                                      <div className="absolute top-0.5 left-0.5 bg-purple-500 text-white text-xs px-1 py-0.5 rounded text-[10px]">
                                        {t('practiceEditor.shape')}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* 显示选项（如果是选择题） */}
                        {question.content?.options && question.content.options.length > 0 && (
                          <div className="mb-3">
                            <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">{t('practiceEditor.options')}：</div>
                            <div className="space-y-1">
                              {question.content.options.map((option, index) => (
                                <div key={index} className="flex items-start space-x-2">
                                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400 w-4">
                                    {String.fromCharCode(65 + index)}.
                                  </span>
                                  <LaTeXPreview
                                    content={typeof option === 'string' ? option : option.text || ''}
                                    config={{ 
                                      mode: 'full',
                                      features: {
                                        markdown: true,
                                        questionSyntax: true,
                                        autoNumbering: true,
                                        errorHandling: 'lenient'
                                      },
                                      styling: {
                                        fontSize: '0.875rem',
                                        lineHeight: '1.5',
                                        maxWidth: '100%'
                                      }
                                    }}
                                    variant="compact"
                                    showTitle={false}
                                    className="question-card-latex-content option-text"
                                    maxWidth="max-w-none"
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      
                        <Button
                          onClick={() => addQuestionToSection(question, selectedSection)}
                          size="sm"
                          className="ml-4 bg-orange-500 hover:bg-orange-600 text-white"
                        >
                          <PlusCircle className="w-4 h-4 mr-1" />
                          {t('practiceEditor.add')}
                        </Button>
                    </div>
                  </motion.div>
                  ))
                )}
              </div>
              
              {/* 分页控件 */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-2">
                    <Button
                      onClick={handlePrevPage}
                      disabled={currentPage === 1 || questionsLoading}
                      variant="outline"
                      size="sm"
                    >
                      {t('practiceEditor.previousPage')}
                    </Button>
                    <Button
                      onClick={handleNextPage}
                      disabled={currentPage === totalPages || questionsLoading}
                      variant="outline"
                      size="sm"
                    >
                      {t('practiceEditor.nextPage')}
                    </Button>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {t('practiceEditor.page')} {currentPage} {t('practiceEditor.of')} {totalPages} {t('practiceEditor.page')}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-500">
                      （{t('practiceEditor.totalQuestions', { count: totalQuestions })}）
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <Button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          variant={currentPage === pageNum ? "default" : "outline"}
                          size="sm"
                          disabled={questionsLoading}
                          className="w-8 h-8 p-0"
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              )}
            </Card>
          </div>

          {/* 右侧：练习标题 */}
          <div>
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                {previewLoading && (
                  <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400 mb-4">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                    <span className="text-sm">{t('practiceEditor.loadingPracticeContent')}</span>
                  </div>
                )}
                <div className="flex items-center space-x-2 flex-1">
                  {/* 集成练习标题编辑到显示区域 */}
                  {editingPracticeTitle ? (
                    <Input
                      value={title}
                      onChange={(e) => {
                        setTitle(e.target.value);
                        setHasBeenSaved(false); // 重置保存状态
                      }}
                      placeholder={t('practiceEditor.enterTitle')}
                      className="text-lg font-medium flex-1"
                      autoFocus
                      onBlur={() => handlePracticeTitleSave(title)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handlePracticeTitleSave(title);
                        } else if (e.key === 'Escape') {
                          handlePracticeTitleCancel();
                        }
                      }}
                    />
                  ) : (
                    <span 
                      className="text-lg font-semibold text-gray-900 dark:text-white cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 px-2 py-1 rounded transition-colors flex-1"
                      onClick={handlePracticeTitleEdit}
                    >
                      {title || t('practiceEditor.clickToSetTitle')}
                    </span>
                  )}
                </div>
                  <Button
                    onClick={addSection}
                    size="sm"
                    variant="outline"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {t('practiceEditor.addSection')}
                  </Button>
              </div>

              <div className={`space-y-4 max-h-[40rem] overflow-y-auto overscroll-contain relative ${previewLoading ? 'opacity-50' : ''}`}>
                {previewLoading && (
                  <div className="absolute inset-0 bg-white/50 dark:bg-gray-900/50 flex items-center justify-center z-10 rounded-lg">
                    <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>{t('practiceEditor.loadingPracticeContent')}</span>
                    </div>
                  </div>
                )}
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  {sections.map((section) => (
                    <motion.div
                      key={section.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2 flex-1">
                          <GripVertical className="w-4 h-4 text-gray-400" />
                          {/* 集成标题编辑到显示区域 */}
                          {editingTitle === section.id ? (
                            <Input
                              value={section.title}
                              onChange={(e) => updateSection(section.id, 'title', e.target.value)}
                              placeholder={t('practiceEditor.sectionTitle')}
                              className="text-sm font-medium flex-1"
                              autoFocus
                              onBlur={() => handleTitleSave(section.id, section.title)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  handleTitleSave(section.id, section.title);
                                } else if (e.key === 'Escape') {
                                  handleTitleCancel();
                                }
                              }}
                            />
                          ) : (
                            <span 
                              className="font-medium text-gray-900 dark:text-white cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 px-2 py-1 rounded transition-colors flex-1"
                              onClick={() => handleTitleEdit(section.id)}
                            >
                              {section.title || `${t('practiceEditor.section')} ${section.id}`}
                            </span>
                          )}
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            ({section.questions.length} {t('practiceEditor.questions')})
                          </span>
                          {/* 当前选中状态指示 */}
                          {selectedSection === section.id && (
                            <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full">
                              {t('practiceEditor.current')}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-1">
                          {/* 切换按钮 - 只有非当前部分才显示 */}
                          {selectedSection !== section.id && (
                            <Tooltip content={t('practiceEditor.switchToSection')}>
                              <Button
                                onClick={() => switchToSection(section.id)}
                                size="sm"
                                variant="ghost"
                                className="text-blue-600 hover:text-blue-700"
                              >
                                <Target className="w-4 h-4" />
                              </Button>
                            </Tooltip>
                          )}
                          {/* 上移按钮 */}
                          {sections.findIndex(s => s.id === section.id) > 0 && (
                            <Tooltip content={t('practiceEditor.moveUp')}>
                              <Button
                                onClick={() => {
                                  const currentIndex = sections.findIndex(s => s.id === section.id);
                                  swapSections(currentIndex, currentIndex - 1);
                                }}
                                size="sm"
                                variant="ghost"
                                className="text-gray-500 hover:text-gray-700"
                              >
                                <ArrowUpDown className="w-4 h-4 rotate-180" />
                              </Button>
                            </Tooltip>
                          )}
                          {/* 下移按钮 */}
                          {sections.findIndex(s => s.id === section.id) < sections.length - 1 && (
                            <Tooltip content={t('practiceEditor.moveDown')}>
                              <Button
                                onClick={() => {
                                  const currentIndex = sections.findIndex(s => s.id === section.id);
                                  swapSections(currentIndex, currentIndex + 1);
                                }}
                                size="sm"
                                variant="ghost"
                                className="text-gray-500 hover:text-gray-700"
                              >
                                <ArrowUpDown className="w-4 h-4" />
                              </Button>
                            </Tooltip>
                          )}
                          {/* 删除按钮 */}
                          {sections.length > 1 && (
                            <Tooltip content={t('practiceEditor.deleteSection')}>
                              <Button
                                onClick={() => removeSection(section.id)}
                                size="sm"
                                variant="ghost"
                                className="text-red-500 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </Tooltip>
                          )}
                        </div>
                      </div>

                      <SortableContext
                        items={section.questions.map(q => q._id)}
                        strategy={verticalListSortingStrategy}
                      >
                        <div className="space-y-2">
                          {section.questions.map((question, questionIndex) => (
                            <SortableQuestion
                              key={question._id}
                              question={question}
                              questionIndex={questionIndex}
                              onRemove={removeQuestionFromSection}
                              sectionId={section.id}
                              t={t}
                            />
                          ))}
                        </div>
                      </SortableContext>
                    </motion.div>
                  ))}
                </DndContext>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* 保存确认模态框 */}
      <ConfirmModal
        isOpen={showSaveModal}
        onCancel={handleCancelSave}
        onConfirm={handleConfirmSave}
        title={t('practiceEditor.savePractice')}
        message={t('practiceEditor.unsavedChanges')}
        confirmText={t('practiceEditor.saveAndExit')}
        cancelText={t('practiceEditor.exitWithoutSaving')}
        type="warning"
        confirmLoading={isSaving}
        loadingText={t('practiceEditor.savingChanges')}
      />

      {/* 错误提示模态框 */}
      <RightSlideModal
        isOpen={rightSlideModal.isOpen}
        onClose={closeRightSlide}
        title={rightSlideModal.title}
        message={rightSlideModal.message}
        type={rightSlideModal.type}
        width={rightSlideModal.width}
        autoClose={rightSlideModal.autoClose}
        showProgress={rightSlideModal.showProgress}
      />
    </div>
  );
};

export default PracticeEditorPage;
