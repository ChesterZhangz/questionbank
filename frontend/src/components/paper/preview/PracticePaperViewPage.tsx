import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, BookOpen, FileText, Clock, Users, Tag, CheckCircle, Menu, ChevronDown, ChevronRight } from 'lucide-react';
import Button from '../../ui/Button';
import LaTeXPreview from '../../editor/preview/LaTeXPreview';
import TikZPreview from '../../tikz/core/TikZPreview';
import { useNavigate, useParams } from 'react-router-dom';
import { paperAPI } from '../../../services/api';
import LoadingPage from '../../ui/LoadingPage';
import { PaperCopyManager } from '../copy';
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
  };
  createdAt: string;
  updatedAt: string;
  owner: {
    username: string;
  };
}

const PracticePaperViewPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [paper, setPaper] = useState<PracticePaper | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // 菜单栏状态
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set());
  
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
              <PaperCopyManager
                paper={paper}
                showSettings={false}
                className="flex-shrink-0"
              />
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
          <div className={`w-80 flex-shrink-0 transition-all duration-300 ${isMenuOpen ? 'block' : 'hidden lg:block'}`}>
            <div className="sticky top-8">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">题目导航</h3>
                  <button
                    onClick={() => setIsMenuOpen(false)}
                    className="lg:hidden p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="space-y-2">
                  {paper.sections.map((section, sectionIndex) => (
                    <div key={sectionIndex} className="border border-gray-200 dark:border-gray-700 rounded-lg">
                      <button
                        onClick={() => {
                          scrollToSection(sectionIndex);
                          toggleSection(sectionIndex);
                        }}
                        className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      >
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                          <span className="font-medium text-gray-900 dark:text-white">
                            {section.title}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            ({section.items.length}题)
                          </span>
                        </div>
                        {expandedSections.has(sectionIndex) ? (
                          <ChevronDown className="w-4 h-4 text-gray-500" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-gray-500" />
                        )}
                      </button>
                      
                      {expandedSections.has(sectionIndex) && (
                        <div className="px-3 pb-2 space-y-1">
                          {section.items.map((_, questionIndex) => (
                            <button
                              key={questionIndex}
                              onClick={() => scrollToQuestion(sectionIndex, questionIndex)}
                              className="w-full text-left p-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                            >
                              第{questionIndex + 1}题
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                
                {/* 复制模板 */}
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">复制模板</h3>
                <PaperCopyManager
                  paper={paper}
                  showSettings={true}
                  className="space-y-2"
                />
                </div>
              </div>
            </div>
          </div>

          {/* 右侧内容区域 */}
          <div className="flex-1 min-w-0">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
          {/* 基本信息卡片 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg w-fit mx-auto mb-2">
                  <FileText className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {sectionCount}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">部分数</div>
              </div>
              
              <div className="text-center">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg w-fit mx-auto mb-2">
                  <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {totalQuestions}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">总题数</div>
              </div>
              
              <div className="text-center">
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg w-fit mx-auto mb-2">
                  <Clock className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="text-sm text-gray-900 dark:text-white">
                  {new Date(paper.createdAt).toLocaleDateString()}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">创建时间</div>
              </div>
              
              <div className="text-center">
                <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg w-fit mx-auto mb-2">
                  <Users className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div className="text-sm text-gray-900 dark:text-white">
                  {paper.owner.username}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">创建者</div>
              </div>
            </div>

            {/* 标签 */}
            {paper.tags && paper.tags.length > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center">
                  <Tag className="w-4 h-4 mr-1" />
                  标签
                </h3>
                <div className="flex flex-wrap gap-2">
                  {paper.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 text-sm bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 题目列表 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              题目列表
            </h2>
            
            <div className="space-y-8">
              {paper.sections.map((section, sectionIndex) => (
                <div 
                  key={sectionIndex} 
                  id={`section-${sectionIndex}`}
                  ref={(el) => { sectionRefs.current[`section-${sectionIndex}`] = el; }}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-6"
                >
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">
                      {section.title}
                    </h3>
                    <span className="px-2 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full">
                      {section.items.length} 道题
                    </span>
                  </div>
                  
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

                      return (
                        <motion.div 
                          key={questionIndex} 
                          id={`question-${sectionIndex}-${questionIndex}`}
                          ref={(el) => { questionRefs.current[`question-${sectionIndex}-${questionIndex}`] = el; }}
                          className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6 question-card-enhanced"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: questionIndex * 0.1 }}
                        >
                          <div className="flex items-start space-x-4">
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
              ))}
            </div>
          </div>
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
