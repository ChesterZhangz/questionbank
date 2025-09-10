import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, BookOpen, FileText, Clock, Users, Tag, CheckCircle, Menu, ChevronRight } from 'lucide-react';
import Button from '../../ui/Button';
import LaTeXPreview from '../../editor/preview/LaTeXPreview';
import TikZPreview from '../../tikz/core/TikZPreview';
import { useNavigate, useParams } from 'react-router-dom';
import { paperAPI, paperBankAPI } from '../../../services/api';
import LoadingPage from '../../ui/LoadingPage';
import { PaperCopyManager } from '../copy';
import OverleafLinkManager from '../copy/OverleafLinkManager';
import { useAuthStore } from '../../../stores/authStore';
import './PracticePaperViewPage.css';

interface PracticePaper {
  _id: string;
  name: string;
  type: 'practice';
  tags: string[];
  sections: Array<{
    title: string;
    items: Array<{ 
      question: {
        _id: string;
        type: string;
        content: {
          stem: string;
          options?: Array<{ text: string; isCorrect: boolean }>;
          answer: string;
        };
        category?: string[];
        tags?: string[];
        difficulty?: number;
        // 图片和TikZ支持
        images?: Array<{
          id: string;
          url: string;
          filename: string;
          order: number;
          bid?: string;
          format?: string;
          uploadedAt?: Date;
          uploadedBy?: string;
          cosKey?: string;
        }>;
        tikzCodes?: Array<{
          id: string;
          code: string;
          format: 'svg' | 'png';
          order: number;
          bid?: string;
          createdAt?: Date;
          createdBy?: string;
        }>;
      };
    }>;
  }>;
  bank: {
    _id: string;
    name: string;
    ownerId?: string;
  };
  createdAt: string;
  updatedAt: string;
  owner: {
    _id: string;
    name: string;
  };
  overleafEditLink?: string; // Overleaf编辑链接
  overleafLinkAddedBy?: {
    _id: string;
    name: string;
    email: string;
    username: string;
  }; // 添加链接的用户
  overleafLinkAddedAt?: string; // 添加链接的时间
}

const PracticePaperViewPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const [paper, setPaper] = useState<PracticePaper | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // 检查用户是否有试卷集管理权限
  const [hasBankManagementPermission, setHasBankManagementPermission] = useState(false);
  
  // 菜单栏状态
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set());
  
  // 题目选择状态
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [selectiveCopyConfig, setSelectiveCopyConfig] = useState({
    showDifficulty: true,
    showSource: true,
    showAnswer: false
  });
  
  // 滚动引用
  const sectionRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const questionRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // 处理分类数据，兼容字符串和数组格式 - 仿照QuestionView
  const getCategoryArray = useCallback((category: string | string[] | undefined): string[] => {
    if (!category) return [];
    if (Array.isArray(category)) return category;
    // 如果是字符串，按逗号分割
    return category.split(',').map(item => item.trim()).filter(item => item.length > 0);
  }, []);

  // 滚动到指定部分
  const scrollToSection = (sectionIndex: number) => {
    const sectionId = `section-${sectionIndex}`;
    const element = sectionRefs.current[sectionId];
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // 滚动到指定题目
  const scrollToQuestion = (sectionIndex: number, questionIndex: number) => {
    const questionId = `question-${sectionIndex}-${questionIndex}`;
    const element = questionRefs.current[questionId];
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // 切换选择模式
  const toggleSelectMode = () => {
    setIsSelectMode(!isSelectMode);
    if (isSelectMode) {
      setSelectedQuestions([]);
    }
  };

  // 切换题目选择
  const toggleQuestionSelection = (questionId: string) => {
    setSelectedQuestions(prev => 
      prev.includes(questionId)
        ? prev.filter(id => id !== questionId)
        : [...prev, questionId]
    );
  };

  // 全选/取消全选
  const toggleAllQuestions = () => {
    if (!paper) return;
    
    const allQuestionIds = paper.sections.flatMap(section => 
      section.items.map(item => item.question._id)
    );
    
    if (selectedQuestions.length === allQuestionIds.length) {
      setSelectedQuestions([]);
    } else {
      setSelectedQuestions(allQuestionIds);
    }
  };


  // 更新选择性复制配置
  const updateSelectiveCopyConfig = (updates: Partial<typeof selectiveCopyConfig>) => {
    setSelectiveCopyConfig(prev => ({ ...prev, ...updates }));
  };

  // 切换部分展开状态
  const toggleSection = (sectionIndex: number) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionIndex)) {
      newExpanded.delete(sectionIndex);
    } else {
      newExpanded.add(sectionIndex);
    }
    setExpandedSections(newExpanded);
  };

  useEffect(() => {
    const fetchPaper = async () => {
      try {
        setLoading(true);
        const response = await paperAPI.getPaper(id!);
        if (response.data.success) {
          setPaper(response.data.data);
        } else {
          setError('获取练习卷失败');
        }
      } catch (err) {
        setError('获取练习卷失败');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPaper();
    }
  }, [id]);

  // 检查用户是否有试卷集管理权限
  useEffect(() => {
    const checkBankPermission = async () => {
      if (!paper || !user) return;
      
      try {
        // 检查是否为试卷创建者
        const isPaperOwner = paper.owner._id === user._id;
        
        // 检查是否为试卷集所有者
        const isBankOwner = paper.bank?.ownerId === user._id;
        
        // 检查是否为试卷集成员（编辑者/管理者）
        let isBankMember = false;
        if (paper.bank?._id) {
          try {
            const response = await paperBankAPI.getPaperBankMembers(paper.bank._id);
            if (response.data.success) {
              const members = response.data.data.members;
              const currentUserMember = members.find((member: any) => 
                member.userId === user._id && 
                ['owner', 'manager', 'collaborator'].includes(member.role)
              );
              isBankMember = !!currentUserMember;
            }
          } catch (err) {
            console.error('check bank membership failed:', err);
          }
        }
        
        const hasPermission = isPaperOwner || isBankOwner || isBankMember;
        
        setHasBankManagementPermission(hasPermission);
      } catch (err) {
        console.error('check bank permission failed:', err);
        setHasBankManagementPermission(false);
      }
    };

    checkBankPermission();
  }, [paper, user]);

  if (loading) {
    return <LoadingPage />;
  }

  if (error || !paper) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {error || '练习卷不存在'}
          </h2>
          <Button onClick={() => navigate('/my-papers')}>
            返回我的试卷
          </Button>
        </div>
      </div>
    );
  }

  // 计算总题数
  const totalQuestions = paper.sections.reduce((total, section) => total + section.items.length, 0);
  
  // 计算部分数
  const sectionCount = paper.sections.length;

  const getQuestionTypeText = (type: string) => {
    const typeMap: { [key: string]: string } = {
      'choice': '选择题',
      'multiple-choice': '多选题',
      'fill': '填空题',
      'solution': '解答题'
    };
    return typeMap[type] || type;
  };

  const getQuestionTypeColor = (type: string) => {
    const colorMap: { [key: string]: string } = {
      'choice': 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200',
      'multiple-choice': 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200',
      'fill': 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200',
      'solution': 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200'
    };
    return colorMap[type] || 'bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-200';
  };

  // 难度颜色 - 仿照QuestionView
  const getDifficultyColor = (difficulty: number) => {
    switch (difficulty) {
      case 1: return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30';
      case 2: return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30';
      case 3: return 'text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30';
      case 4: return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30';
      case 5: return 'text-red-700 dark:text-red-300 bg-red-200 dark:bg-red-800/30';
      default: return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-900/30';
    }
  };

  // 难度文本 - 仿照QuestionView
  const getDifficultyText = (difficulty: number) => {
    switch (difficulty) {
      case 1: return '非常简单';
      case 2: return '简单';
      case 3: return '中等';
      case 4: return '困难';
      case 5: return '非常困难';
      default: return '未知';
    }
  };

  // 难度星级 - 仿照QuestionView
  const getDifficultyStars = (difficulty: number) => {
    return '★'.repeat(difficulty) + '☆'.repeat(5 - difficulty);
  };


  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* 头部导航 */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/my-papers')}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>返回</span>
              </Button>
              <div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <BookOpen className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {paper.name}
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    试卷集: {paper.bank.name}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Overleaf编辑链接 - 所有有权限的用户都可以看到 */}
              {hasBankManagementPermission && (
                <OverleafLinkManager
                  paper={paper}
                  onUpdateLink={(link) => setPaper({ ...paper, overleafEditLink: link })}
                  onRemoveLink={() => setPaper({ ...paper, overleafEditLink: undefined })}
                  canEdit={hasBankManagementPermission || (paper.overleafLinkAddedBy?._id === user?._id)}
                />
              )}
              
              {/* 如果已有链接但用户没有管理权限，只显示链接 */}
              {!hasBankManagementPermission && paper.overleafEditLink && (
                <div className="flex items-center space-x-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                  <FileText className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  <a 
                    href={paper.overleafEditLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Overleaf编辑链接
                  </a>
                </div>
              )}
              
              <Button
                variant="outline"
                onClick={() => navigate(`/paper-banks/${paper.bank._id}/practices/${paper._id}/edit`)}
              >
                编辑
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 主要内容 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-6">
          {/* 左侧菜单栏 */}
          <div className={`w-80 flex-shrink-0 transition-all duration-200 ${isMenuOpen ? 'block' : 'hidden lg:block'}`}>
            <div className="sticky top-8">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="relative overflow-hidden bg-gradient-to-br from-white via-gray-50 to-white dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm"
              >
                {/* 背景装饰 */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/3 via-purple-500/3 to-pink-500/3 dark:from-blue-500/8 dark:via-purple-500/8 dark:to-pink-500/8" />
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-green-400/8 to-blue-400/8 rounded-full -translate-y-10 translate-x-10" />
                <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-purple-400/8 to-pink-400/8 rounded-full translate-y-8 -translate-x-8" />
                
                <div className="relative p-6">
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    className="flex items-center justify-between mb-6"
                  >
                    <h3 className="text-xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-gray-100 dark:to-white bg-clip-text text-transparent">
                      题目导航
                    </h3>
                    <button
                      onClick={() => setIsMenuOpen(false)}
                      className="lg:hidden p-2 hover:bg-gray-100/50 dark:hover:bg-gray-700/50 rounded-xl transition-colors"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                  </motion.div>
                  
                  <div className="space-y-3">
                    {paper.sections.map((section, sectionIndex) => (
                      <motion.div 
                        key={sectionIndex} 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, delay: 0.2 + sectionIndex * 0.05 }}
                        className="relative overflow-hidden bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-700/50 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
                      >
                        <button
                          onClick={() => {
                            scrollToSection(sectionIndex);
                            toggleSection(sectionIndex);
                          }}
                          className="w-full flex items-center justify-between p-4 text-left hover:bg-gradient-to-r hover:from-blue-500/5 hover:to-purple-500/5 dark:hover:from-blue-500/10 dark:hover:to-purple-500/10 rounded-xl transition-all duration-200"
                        >
                          <div className="flex items-center space-x-3">
                            <motion.div 
                              className="p-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg shadow-sm"
                              whileHover={{ scale: 1.1, rotate: 5 }}
                              transition={{ type: "spring", stiffness: 400, damping: 10 }}
                            >
                              <CheckCircle className="w-4 h-4 text-white" />
                            </motion.div>
                            <div>
                              <span className="font-semibold text-gray-900 dark:text-white text-sm">
                                {section.title}
                              </span>
                              <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                {section.items.length} 道题
                              </div>
                            </div>
                          </div>
                          <motion.div
                            animate={{ rotate: expandedSections.has(sectionIndex) ? 90 : 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <ChevronRight className="w-4 h-4 text-gray-500" />
                          </motion.div>
                        </button>
                        
                        <motion.div
                          initial={false}
                          animate={{ 
                            height: expandedSections.has(sectionIndex) ? 'auto' : 0,
                            opacity: expandedSections.has(sectionIndex) ? 1 : 0
                          }}
                          transition={{ duration: 0.2, ease: "easeInOut" }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 pb-3 space-y-1">
                            {section.items.map((_, questionIndex) => (
                              <motion.button
                                key={questionIndex}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.15, delay: questionIndex * 0.02 }}
                                onClick={() => scrollToQuestion(sectionIndex, questionIndex)}
                                className="w-full text-left p-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gradient-to-r hover:from-blue-500/5 hover:to-purple-500/5 dark:hover:from-blue-500/10 dark:hover:to-purple-500/10 rounded-lg transition-all duration-150 hover:text-gray-900 dark:hover:text-gray-200"
                              >
                                第{questionIndex + 1}题
                              </motion.button>
                            ))}
                          </div>
                        </motion.div>
                      </motion.div>
                    ))}
                  </div>
                  
                  {/* 复制模板 */}
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.4 }}
                    className="mt-8"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-gray-100 dark:to-white bg-clip-text text-transparent">
                        复制模板
                      </h3>
                      
                      {/* 选择模式控制 */}
                      <div className="flex items-center space-x-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={toggleSelectMode}
                          className={`px-3 py-2 text-sm font-medium rounded-xl transition-all duration-200 ${
                            isSelectMode
                              ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600'
                          }`}
                        >
                          {isSelectMode ? '退出选择' : '选择题目'}
                        </motion.button>
                        
                        {isSelectMode && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.2 }}
                            onClick={toggleAllQuestions}
                            className="px-3 py-2 text-sm font-medium rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200"
                          >
                            {selectedQuestions.length === paper.sections.flatMap(s => s.items).length ? '取消全选' : '全选'}
                          </motion.button>
                        )}
                      </div>
                    </div>
                       
                    <PaperCopyManager
                      paper={paper}
                      showSettings={true}
                      canEdit={false} // 在侧边栏不显示Overleaf链接管理
                      onPaperUpdate={(updatedPaper) => setPaper(updatedPaper)}
                      isSelectMode={isSelectMode}
                      selectedQuestions={selectedQuestions}
                      selectiveCopyConfig={selectiveCopyConfig}
                      onSelectiveCopy={(latex) => {
                        navigator.clipboard.writeText(latex).then(() => {
                          // 可以添加成功提示
                        }).catch(err => {
                          console.error('复制失败:', err);
                        });
                      }}
                      onSelectiveCopyConfigUpdate={updateSelectiveCopyConfig}
                      currentUserId={user?._id}
                      className="space-y-2"
                    />
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* 右侧内容区域 */}
          <div className="flex-1 min-w-0">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-8"
            >
          {/* 基本信息卡片 - 重新设计 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="relative overflow-hidden bg-gradient-to-br from-white via-gray-50 to-white dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm"
          >
            {/* 背景装饰 */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 dark:from-blue-500/10 dark:via-purple-500/10 dark:to-pink-500/10" />
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full -translate-y-16 translate-x-16" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-green-400/10 to-blue-400/10 rounded-full translate-y-12 -translate-x-12" />
            
            <div className="relative p-8">
              {/* 标题区域 */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="text-center mb-8"
              >
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-gray-100 dark:to-white bg-clip-text text-transparent mb-2">
                  {paper.name}
                </h1>
                <div className="w-16 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mx-auto" />
              </motion.div>

              {/* 统计信息网格 */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                  className="group"
                >
                  <div className="relative p-6 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="relative text-center">
                      <motion.div 
                        className="inline-flex p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl mb-3 shadow-lg"
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                      >
                        <FileText className="w-6 h-6 text-white" />
                      </motion.div>
                      <motion.div 
                        className="text-3xl font-bold text-gray-900 dark:text-white mb-1"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.3, delay: 0.4, type: "spring", stiffness: 300 }}
                      >
                        {sectionCount}
                      </motion.div>
                      <div className="text-sm font-medium text-gray-600 dark:text-gray-400">部分数</div>
                    </div>
                  </div>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="group"
                >
                  <div className="relative p-6 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="relative text-center">
                      <motion.div 
                        className="inline-flex p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl mb-3 shadow-lg"
                        whileHover={{ scale: 1.1, rotate: -5 }}
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                      >
                        <BookOpen className="w-6 h-6 text-white" />
                      </motion.div>
                      <motion.div 
                        className="text-3xl font-bold text-gray-900 dark:text-white mb-1"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.3, delay: 0.5, type: "spring", stiffness: 300 }}
                      >
                        {totalQuestions}
                      </motion.div>
                      <div className="text-sm font-medium text-gray-600 dark:text-gray-400">总题数</div>
                    </div>
                  </div>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="group"
                >
                  <div className="relative p-6 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="relative text-center">
                      <motion.div 
                        className="inline-flex p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl mb-3 shadow-lg"
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                      >
                        <Clock className="w-6 h-6 text-white" />
                      </motion.div>
                      <motion.div 
                        className="text-3xl font-bold text-gray-900 dark:text-white mb-1"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.3, delay: 0.6, type: "spring", stiffness: 300 }}
                      >
                        {new Date(paper.createdAt).toLocaleDateString()}
                      </motion.div>
                      <div className="text-sm font-medium text-gray-600 dark:text-gray-400">创建时间</div>
                    </div>
                  </div>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  className="group"
                >
                  <div className="relative p-6 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="relative text-center">
                      <motion.div 
                        className="inline-flex p-3 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl mb-3 shadow-lg"
                        whileHover={{ scale: 1.1, rotate: -5 }}
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                      >
                        <Users className="w-6 h-6 text-white" />
                      </motion.div>
                      <motion.div 
                        className="text-3xl font-bold text-gray-900 dark:text-white mb-1 truncate"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.3, delay: 0.7, type: "spring", stiffness: 300 }}
                      >
                        {paper.owner.name}
                      </motion.div>
                      <div className="text-sm font-medium text-gray-600 dark:text-gray-400">创建者</div>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* 标签区域 */}
              {paper.tags && paper.tags.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                  className="relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-gray-100/50 to-gray-200/50 dark:from-gray-700/50 dark:to-gray-800/50 rounded-2xl" />
                  <div className="relative p-6">
                    <motion.div 
                      className="flex items-center justify-center mb-4"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.7 }}
                    >
                      <Tag className="w-5 h-5 text-gray-600 dark:text-gray-400 mr-2" />
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">标签</h3>
                    </motion.div>
                    <div className="flex flex-wrap justify-center gap-3">
                      {paper.tags.map((tag, idx) => (
                        <motion.span
                          key={idx}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.4, delay: 0.8 + idx * 0.1 }}
                          whileHover={{ scale: 1.05, y: -2 }}
                          className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full shadow-md hover:shadow-lg transition-all duration-300 cursor-default"
                        >
                          {tag}
                        </motion.span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* 题目列表 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="relative overflow-hidden bg-gradient-to-br from-white via-gray-50 to-white dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm"
          >
            {/* 背景装饰 */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/3 via-purple-500/3 to-pink-500/3 dark:from-blue-500/8 dark:via-purple-500/8 dark:to-pink-500/8" />
            <div className="absolute top-0 left-0 w-24 h-24 bg-gradient-to-br from-green-400/8 to-blue-400/8 rounded-full -translate-y-12 -translate-x-12" />
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-purple-400/8 to-pink-400/8 rounded-full translate-y-16 translate-x-16" />
            
            <div className="relative p-8">
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
                className="text-center mb-8"
              >
                <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-gray-100 dark:to-white bg-clip-text text-transparent mb-2">
                  题目列表
                </h2>
                <div className="w-12 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mx-auto" />
              </motion.div>
            
            <div className="space-y-6">
              {paper.sections.map((section, sectionIndex) => (
                <motion.div 
                  key={sectionIndex} 
                  id={`section-${sectionIndex}`}
                  ref={(el) => { sectionRefs.current[`section-${sectionIndex}`] = el; }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.4 + sectionIndex * 0.05 }}
                  className="relative overflow-hidden bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                >
                  {/* 悬停背景效果 */}
                  <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 dark:from-green-500/10 dark:to-emerald-500/10 rounded-2xl opacity-0 hover:opacity-100 transition-opacity duration-300" />
                  
                  <div className="relative p-6">
                    <motion.div 
                      className="flex items-center space-x-4 mb-6"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.5 + sectionIndex * 0.05 }}
                    >
                      <motion.div 
                        className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl shadow-lg"
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                      >
                        <CheckCircle className="w-5 h-5 text-white" />
                      </motion.div>
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex-1">
                        {section.title}
                      </h3>
                      <motion.span 
                        className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full shadow-md"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.3, delay: 0.6 + sectionIndex * 0.05, type: "spring", stiffness: 300 }}
                      >
                        {section.items.length} 道题
                      </motion.span>
                    </motion.div>
                  
                  <div className="space-y-6">
                    {section.items.map((item, questionIndex) => {
                      // 安全检查：确保 question 存在
                      if (!item.question) {
                        return (
                          <div key={questionIndex} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6">
                            <div className="text-gray-500 dark:text-gray-400 text-sm">
                              题目数据不完整
                            </div>
                          </div>
                        );
                      }

                      // 处理分类和标签数据
                      const categories = getCategoryArray(item.question.category);
                      const tags = item.question.tags || [];
                      const allTags = [...categories, ...tags];

                      const questionId = item.question._id;
                      const isSelected = selectedQuestions.includes(questionId);
                      
                      return (
                        <motion.div 
                          key={questionIndex} 
                          id={`question-${sectionIndex}-${questionIndex}`}
                          ref={(el) => { questionRefs.current[`question-${sectionIndex}-${questionIndex}`] = el; }}
                          className={`relative overflow-hidden rounded-2xl p-6 question-card-enhanced transition-all duration-300 ${
                            isSelectMode
                              ? `cursor-pointer border-2 ${
                                  isSelected
                                    ? 'bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 border-blue-500 dark:border-blue-400 shadow-lg'
                                    : 'bg-white/40 dark:bg-gray-800/40 border-gray-200/50 dark:border-gray-600/50 hover:border-blue-300 dark:hover:border-blue-500 hover:shadow-md hover:-translate-y-1'
                                }`
                              : 'bg-white/40 dark:bg-gray-800/40 border border-gray-200/50 dark:border-gray-600/50 hover:shadow-md hover:-translate-y-1'
                          }`}
                          onClick={isSelectMode ? () => toggleQuestionSelection(questionId) : undefined}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2, delay: 0.6 + questionIndex * 0.02 }}
                          whileHover={{ scale: 1.02 }}
                        >
                          {/* 背景装饰 */}
                          <div className="absolute inset-0 bg-gradient-to-r from-gray-50/50 to-gray-100/50 dark:from-gray-700/30 dark:to-gray-800/30 rounded-2xl opacity-0 hover:opacity-100 transition-opacity duration-300" />
                          
                          <div className="relative flex items-start space-x-4">
                            {/* 选择模式下的选择框 */}
                            {isSelectMode && (
                              <div className="flex-shrink-0 mt-1">
                                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                                  isSelected
                                    ? 'bg-blue-500 border-blue-500 text-white'
                                    : 'border-gray-300 dark:border-gray-600'
                                }`}>
                                  {isSelected && (
                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                  )}
                                </div>
                              </div>
                            )}
                            
                            <span className="flex-shrink-0 w-8 h-8 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full flex items-center justify-center text-sm font-medium">
                              {questionIndex + 1}
                            </span>
                            <div className="flex-1 min-w-0 w-full">
                              {/* 题目类型和难度信息 */}
                              <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center space-x-3">
                                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${getQuestionTypeColor(item.question.type)}`}>
                                    {getQuestionTypeText(item.question.type)}
                                  </span>
                                  {item.question.difficulty && (
                                    <div className="flex items-center space-x-2">
                                      <span className="difficulty-stars-enhanced text-sm">
                                        {getDifficultyStars(item.question.difficulty)}
                                      </span>
                                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(item.question.difficulty)}`}>
                                        {getDifficultyText(item.question.difficulty)}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* 题目标签 */}
                              {allTags.length > 0 && (
                                <div className="mb-4">
                                  <div className="flex flex-wrap gap-2">
                                    {allTags.map((tag, tagIndex) => {
                                      // 判断标签类型：前几个是小题型，后面是知识点
                                      const isCategory = tagIndex < categories.length;
                                      const tagClass = isCategory ? 'category-tag' : 'knowledge-tag';
                                      
                                      return (
                                        <span
                                          key={`tag-${tagIndex}`}
                                          className={`${tagClass} inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200`}
                                        >
                                          {tag}
                                        </span>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}
                              
                              {/* 题目内容 */}
                              <div className="text-gray-800 dark:text-gray-200 mb-4 question-view-latex-content">
                                <LaTeXPreview
                                  content={item.question.content?.stem || '题目内容加载中...'}
                                  config={{
                                    mode: 'full'
                                  }}
                                  fullWidth={true}
                                  maxWidth="max-w-none"
                                />
                              </div>
                              
                              {/* 题目图片和TikZ显示 */}
                              {((item.question.images && item.question.images.length > 0) || (item.question.tikzCodes && item.question.tikzCodes.length > 0)) && (
                                <div className="mb-4">
                                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                    图形与图片
                                    <span className="ml-2 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs">
                                      ({((item.question.images?.length || 0) + (item.question.tikzCodes?.length || 0))} 个)
                                    </span>
                                  </div>
                                  
                                  {/* 合并图片和图形数据 */}
                                  <div className="flex space-x-3 overflow-x-auto pb-2">
                                    {[
                                      ...(item.question.images || []).map(item => ({ type: 'image' as const, data: item })),
                                      ...(item.question.tikzCodes || []).map(item => ({ type: 'tikz' as const, data: item }))
                                    ].sort((a, b) => {
                                      // 按order字段排序
                                      const orderA = a.data.order || 0;
                                      const orderB = b.data.order || 0;
                                      return orderA - orderB;
                                    }).map((item) => (
                                      <div key={`${item.type}-${item.data.id}`} className="flex-shrink-0 group relative">
                                        {item.type === 'image' ? (
                                          // 图片显示
                                          <div className="w-24 h-20 rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden bg-gray-50 dark:bg-gray-700 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer">
                                            <img
                                              src={item.data.url}
                                              alt={item.data.filename}
                                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                            />
                                            <div className="absolute top-1 left-1 bg-blue-500 text-white text-xs px-1 py-0.5 rounded">
                                              图片
                                            </div>
                                          </div>
                                        ) : (
                                          // TikZ显示
                                          <div className="w-24 h-20 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden cursor-pointer">
                                            <TikZPreview
                                              code={item.data.code}
                                              format={item.data.format as 'svg' | 'png'}
                                              width={400}
                                              height={300}
                                              showGrid={false}
                                              showTitle={false}
                                              className="w-full h-full group-hover:scale-105 transition-transform duration-200 flex items-center justify-center"
                                            />
                                            <div className="absolute top-1 left-1 bg-purple-500 text-white text-xs px-1 py-0.5 rounded">
                                              图形
                                            </div>
                                          </div>
                                        )}
                                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-lg flex items-center justify-center">
                                          <div className="opacity-0 group-hover:opacity-100 transition-all duration-200 text-white text-xs font-medium">
                                            查看
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              {/* 选择题选项 */}
                              {item.question.content?.options && (
                                <div className="space-y-2">
                                  {item.question.content.options.map((option, optionIndex) => (
                                    <div key={optionIndex} className="flex items-start space-x-2 text-sm text-gray-600 dark:text-gray-400">
                                      <span className="flex-shrink-0 w-5 h-5 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-full flex items-center justify-center text-xs font-medium">
                                        {String.fromCharCode(65 + optionIndex)}
                                      </span>
                                      <div className="flex-1">
                                        <LaTeXPreview
                                          content={option.text}
                                          config={{
                                            mode: 'full'
                                          }}
                                        />
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                  </div>
                </motion.div>
              ))}
            </div>
            </div>
          </motion.div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* 移动端菜单按钮 */}
      <button
        onClick={() => setIsMenuOpen(true)}
        className="fixed bottom-6 right-6 lg:hidden bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-colors z-50"
      >
        <Menu className="w-6 h-6" />
      </button>
    </div>
  );
};

export default PracticePaperViewPage;
