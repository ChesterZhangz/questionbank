import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, 
  Eye, 
  Edit, 
  MoreVertical,
  BookOpen,
  Calendar,
  Trash2,
  X,
  RotateCw,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Download,
  Maximize
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Question } from '../../types';
import Card from '../ui/Card';
import Button from '../ui/Button';
// 导入LaTeXPreview组件，使用与编辑区相同的渲染逻辑
import LaTeXPreview from '../editor/preview/LaTeXPreview';
import TikZPreview from '../tikz/core/TikZPreview';

import { useModal } from '../../hooks/useModal';
import ConfirmModal from '../ui/ConfirmModal';
// 导入QuestionCard专用的LaTeX样式
import './QuestionCard.css';

interface QuestionCardProps {
  question: Question;
  bid: string;
  bankName?: string; // 题库名称，用于显示
  userRole: string;
  index: number; // 添加索引用于编号
  onFavorite?: (qid: string, isFavorite: boolean) => void;
  isFavorite?: boolean;
  className?: string;
  onViewDetail?: (index: number) => void; // 新增：查看详情回调
  // 新增：选择相关属性
  selected?: boolean;
  onSelect?: (selected: boolean) => void;
  showCheckbox?: boolean;
  // 新增：视图模式
  viewMode?: 'grid' | 'list';
  // 新增：删除功能
  onDelete?: (qid: string) => void;
}

const QuestionCard: React.FC<QuestionCardProps> = React.memo(({
  question,
  bid,
  bankName,
  userRole,
  index,
  onFavorite,
  isFavorite = false,
  className = '',
  onViewDetail,
  selected = false,
  onSelect,
  showCheckbox = false,
  viewMode = 'grid',
  onDelete
}) => {
  // 弹窗状态管理
  const { confirmModal, closeConfirm } = useModal();
  
  // 图片预览状态
  const [previewImage, setPreviewImage] = useState<{ url: string; filename: string } | null>(null);
  const [previewTikZ, setPreviewTikZ] = useState<{ code: string; format: 'svg' | 'png' } | null>(null);
  
  // 图片操作状态
  const [imageRotation, setImageRotation] = useState(0);
  const [imageScale, setImageScale] = useState(1);
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  

  // 格式化题库名称显示
  const formatBankName = (name?: string) => {
    if (!name) return '未知题库';
    // 如果题库名称太长，进行截断显示
    if (name.length > 20) {
      return name.substring(0, 18) + '...';
    }
    return name;
  };

  // 格式化日期显示
  const formatDate = (date: string | Date) => {
    const d = new Date(date);
    const now = new Date();
    
    // 重置时间为00:00:00，只比较日期
    const dDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const nowDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const diffTime = nowDate.getTime() - dDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return '今天';
    if (diffDays === 1) return '昨天';
    if (diffDays === 2) return '前天';
    if (diffDays > 0 && diffDays <= 7) return `${diffDays}天前`;
    if (diffDays > 0 && diffDays <= 30) return `${Math.floor(diffDays / 7)}周前`;
    if (diffDays > 0 && diffDays <= 365) return `${Math.floor(diffDays / 30)}个月前`;
    
    // 如果是未来日期或超过一年，显示具体日期
    return d.toLocaleDateString('zh-CN', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit' 
    });
  };

  // 图片预览处理
  const handleImagePreview = (image: { url: string; filename: string }) => {
    setPreviewImage(image);
    // 重置图片状态
    setImageRotation(0);
    setImageScale(1);
    setImagePosition({ x: 0, y: 0 });
  };



  // 图片操作函数
  const rotateImage = (direction: 'left' | 'right') => {
    setImageRotation(prev => prev + (direction === 'right' ? 90 : -90));
  };

  const zoomImage = (type: 'in' | 'out') => {
    setImageScale(prev => {
      const newScale = type === 'in' ? prev * 1.2 : prev / 1.2;
      return Math.max(0.1, Math.min(5, newScale)); // 限制缩放范围
    });
  };

  const resetImageTransform = () => {
    setImageRotation(0);
    setImageScale(1);
    setImagePosition({ x: 0, y: 0 });
  };

  const downloadImage = () => {
    if (previewImage) {
      const link = document.createElement('a');
      link.href = previewImage.url;
      link.download = previewImage.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // 图片拖拽函数
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - imagePosition.x, y: e.clientY - imagePosition.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setImagePosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const [isFavoriting, setIsFavoriting] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // 题目类型文本
  const getQuestionTypeText = (type: string) => {
    switch (type) {
      case 'choice': return '选择题';
      case 'multiple-choice': return '多选题';
      case 'fill': return '填空题';
      case 'solution': return '解答题';
      default: return '未知类型';
    }
  };

  // 题目类型颜色
  const getQuestionTypeColor = (type: string) => {
    switch (type) {
      case 'choice': return 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700';
      case 'multiple-choice': return 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-700';
      case 'fill': return 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700';
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
      case 1: return '非常简单';
      case 2: return '简单';
      case 3: return '中等';
      case 4: return '困难';
      case 5: return '非常困难';
      default: return '未知';
    }
  };

  // 处理选项显示
  const renderOptions = () => {
    if (!question.content.options || question.content.options.length === 0) return null;
    
    return (
      <div className="question-card-options">
        <div className="question-card-options-label">
          选项：
        </div>
        {question.content.options.map((option, index) => (
          <div key={index} className="question-card-option">
            {/* 选项序号 */}
            <span className="question-card-option-number">
              {String.fromCharCode(65 + index)}
            </span>
            
            {/* 选项内容 */}
            <div className="question-card-option-content">
              <LaTeXPreview 
                content={option.text} 
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
                className="question-card-latex-content option-text"
                maxWidth="max-w-none"
              />
            </div>
          </div>
        ))}
      </div>
    );
  };

  // 收藏功能
  const handleFavorite = async () => {
    if (!onFavorite) return;
    
    setIsFavoriting(true);
    try {
              await onFavorite(question._id, !isFavorite);
    } catch (error) {
      // 错误日志已清理
    } finally {
      setIsFavoriting(false);
    }
  };

  // 处理选择
  const handleSelect = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onSelect) {
      onSelect(!selected);
    }
  };

  // 查看详情
  const handleViewDetail = () => {
    if (onViewDetail) {
      onViewDetail(index);
    } else {
      // 如果没有提供回调，则使用默认的导航方式
    navigate(`/question-banks/${bid}/questions/${question._id}`);
    }
  };

  // 编辑题目
  const handleEdit = () => {
    navigate(`/question-banks/${bid}/questions/${question.qid}/edit`);
  };

  // 删除题目
  const handleDelete = () => {
    if (!onDelete) return;
    
    // 直接调用父组件的删除函数，让父组件处理确认弹窗和删除逻辑
    onDelete(question._id);
  };

  

  // 点击外部关闭菜单
  const handleClickOutside = (event: MouseEvent) => {
    if (cardRef.current && !cardRef.current.contains(event.target as Node)) {
      setShowMenu(false);
    }
  };

  React.useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className={`w-full ${className}`}
    >
      {viewMode === 'grid' ? (
        // 网格模式 - 统一高度
        <Card 
          ref={cardRef}
          className={`question-card w-full h-96 hover:shadow-lg dark:hover:shadow-gray-900/30 transition-all duration-200 cursor-pointer group flex flex-col ${
            selected ? 'ring-2 ring-blue-500 dark:ring-blue-400 bg-blue-50 dark:bg-blue-900/20' : ''
          }`}
          onClick={handleViewDetail}
          padding="none"
          data-screenshot-target="true"
        >
          <div className="p-6 relative flex-1 flex flex-col overflow-hidden">
            {/* 选择复选框 */}
            {showCheckbox && (
              <div className="absolute top-4 left-4 z-20">
                <input
                  type="checkbox"
                  checked={selected}
                  onChange={(e) => onSelect && onSelect(e.target.checked)}
                  onClick={handleSelect}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                />
              </div>
            )}

            {/* 题目类型标签 - 左上角 */}
            <div className={`absolute top-4 ${showCheckbox ? 'left-12' : 'left-4'} z-10`}>
              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getQuestionTypeColor(question.type)}`}>
                {getQuestionTypeText(question.type)}
              </span>
            </div>

            {/* 题目编号 - 右上角 */}
            <div className="absolute top-4 right-4 z-10">
                          <span className="text-lg font-bold text-gray-400 dark:text-gray-500">
              {String(index + 1).padStart(2, '0')}
            </span>
            </div>

            {/* 题目头部 - 简化版 */}
            <div className="flex justify-between items-start mb-4 pt-8">
              {/* 难度标签 - 简化 */}
              <div className="flex items-center space-x-2">
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
              </div>

              {/* 操作按钮 - 简化 */}
              <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {/* 收藏按钮 */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleFavorite();
                  }}
                  disabled={isFavoriting}
                  className={`p-1 ${
                    isFavorite 
                      ? 'text-red-500 dark:text-red-400 border-red-300 dark:border-red-600' 
                      : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
                  }`}
                >
                  <Heart 
                    className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} 
                  />
                </Button>

                {/* 更多操作菜单 */}
                <div className="relative">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowMenu(!showMenu);
                    }}
                    className="p-1"
                  >
                    <MoreVertical className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                  </Button>

                  {showMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg dark:shadow-gray-900/50 border dark:border-gray-700 z-20">
                      <div className="py-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewDetail();
                            setShowMenu(false);
                          }}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          查看详情
                        </button>
                        
                        {(userRole === 'creator' || userRole === 'manager' || userRole === 'collaborator') && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit();
                              setShowMenu(false);
                            }}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            编辑题目
                          </button>
                        )}



                        {(userRole === 'creator' || userRole === 'manager') && onDelete && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete();
                              setShowMenu(false);
                            }}
                            className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            删除题目
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

                          {/* 题目内容区域 - 可滚动 */}
              <div className="flex-1 overflow-hidden min-w-0 flex flex-col">
                {/* 题目主干 - 可滚动 */}
                <div className="flex-1 min-w-0 question-card-content-scroll mb-2">
                  <h3 className="text-base font-medium text-gray-900 dark:text-gray-100 mb-3 leading-relaxed min-w-0">
                    <LaTeXPreview 
                      content={question.content.stem} 
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
                  </h3>
                  
                                    {/* 题目图片和图形显示 - 合并到一行 */}
                  {(() => { return null; })()}
                  {((question.images && question.images.length > 0) || (question.tikzCodes && question.tikzCodes.length > 0)) && (
                    <div className="mt-3">
                      {/* 媒体内容标题 */}
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">图形与图片</span>
                        <span className="text-xs text-gray-400 dark:text-gray-500">
                          ({((question.images?.length || 0) + (question.tikzCodes?.length || 0))}个)
                        </span>
                      </div>
                      
                      {/* 媒体内容 - 图片和图形混合显示 */}
                      <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
                        {/* 合并图片和图形，按顺序显示 */}
                        {[
                          ...(question.images || []).map(img => ({ type: 'image' as const, data: img })),
                          ...(question.tikzCodes || []).map(tikz => ({ type: 'tikz' as const, data: tikz }))
                        ].sort((a, b) => {
                          // 按order字段排序
                          const orderA = a.type === 'image' ? a.data.order : a.data.order;
                          const orderB = b.type === 'image' ? b.data.order : b.data.order;
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
                                  onClick={() => handleImagePreview(item.data)}
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
                                  format={item.data.format}
                                  width={480}
                                  height={360}
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
                </div>

              {/* 选项区域 - 可滚动 */}
              {question.content.options && question.content.options.length > 0 && (
                <div className="flex-shrink-0 min-w-0 question-card-options-scroll">
                  <div className="space-y-2 min-w-0">
                    {renderOptions()}
                  </div>
                </div>
              )}
            </div>

            {/* 底部信息 - 固定 */}
            <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-700 min-w-0">
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 min-w-0">
                                  <div className="flex items-center space-x-2 min-w-0 flex-1">
                    <BookOpen className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate text-xs" title={bankName || bid}>
                      {formatBankName(bankName)}
                    </span>
                  </div>
                <div className="flex items-center space-x-2 min-w-0">
                  <Calendar className="w-3 h-3 flex-shrink-0" />
                  <span className="text-xs whitespace-nowrap" title={new Date(question.createdAt).toLocaleDateString()}>
                    {formatDate(question.createdAt)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      ) : (
        // 列表模式 - 完整显示
        <div className="question-card w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md dark:hover:shadow-gray-900/30 transition-all duration-200">
          <div className="p-4">
            <div className="flex items-start space-x-4">
              {/* 选择复选框 */}
              {showCheckbox && (
                <div className="flex-shrink-0">
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={(e) => onSelect && onSelect(e.target.checked)}
                    onClick={handleSelect}
                    className="rounded border-gray-300 dark:border-gray-600 text-blue-600 dark:text-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400 h-4 w-4"
                  />
                </div>
              )}

              {/* 题目内容 */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2 min-w-0">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 min-w-0 flex-1">
                    <div 
                      className="text-gray-900 dark:text-gray-100 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400"
                      onClick={handleViewDetail}
                    >
                      <LaTeXPreview 
                        content={question.content.stem} 
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
                        className="question-card-latex-content list-mode"
                        maxWidth="max-w-none"
                      />
                    </div>
                    
                    {/* 题目图片和图形显示 - 列表模式，合并到一行 */}
                    {((question.images && question.images.length > 0) || (question.tikzCodes && question.tikzCodes.length > 0)) && (
                      <div className="mt-2">
                        {/* 媒体内容标题 */}
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">图形与图片</span>
                          <span className="text-xs text-gray-400 dark:text-gray-500">
                            ({((question.images?.length || 0) + (question.tikzCodes?.length || 0))}个)
                          </span>
                        </div>
                        
                        {/* 媒体内容 - 图片和图形混合显示 */}
                        <div className="flex space-x-3 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
                          {/* 合并图片和图形，按顺序显示 */}
                          {[
                            ...(question.images || []).map(img => ({ type: 'image' as const, data: img })),
                            ...(question.tikzCodes || []).map(tikz => ({ type: 'tikz' as const, data: tikz }))
                          ].sort((a, b) => {
                            // 按order字段排序
                            const orderA = a.type === 'image' ? a.data.order : a.data.order;
                            const orderB = b.type === 'image' ? b.data.order : b.data.order;
                            return orderA - orderB;
                          }).map((item) => (
                            <div key={`${item.type}-${item.data.id}`} className="flex-shrink-0 group relative">
                              {item.type === 'image' ? (
                                // 图片显示
                                <div className="w-20 h-16 rounded-md border border-gray-200 dark:border-gray-600 overflow-hidden bg-gray-50 dark:bg-gray-700 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer">
                                  <img
                                    src={item.data.url}
                                    alt={item.data.filename}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                    onClick={() => handleImagePreview(item.data)}
                                  />
                                  <div className="absolute top-1 left-1 bg-blue-500 text-white text-xs px-1 py-0.5 rounded">
                                    图片
                                  </div>
                                </div>
                              ) : (
                                // TikZ显示
                                <div className="w-20 h-16 bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-600 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden cursor-pointer">
                                  <TikZPreview
                                    code={item.data.code}
                                    format={item.data.format}
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
                              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-md flex items-center justify-center">
                                <div className="opacity-0 group-hover:opacity-100 transition-all duration-200 text-white text-xs font-medium">
                                  查看
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </h3>
                  <div className="flex items-center space-x-1">
                    {/* 收藏按钮 */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFavorite();
                      }}
                      disabled={isFavoriting}
                      className="p-1"
                    >
                      <Heart 
                        className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} 
                      />
                    </Button>

                    {/* 直接展示操作按钮（列表区域不使用下拉） */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewDetail();
                      }}
                      className="p-1"
                    >
                      <Eye className="w-4 h-4 text-gray-500 dark:text-gray-300" />
                    </Button>
                    {(userRole === 'creator' || userRole === 'manager' || userRole === 'collaborator') && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit();
                        }}
                        className="p-1"
                      >
                        <Edit className="w-4 h-4 text-gray-500 dark:text-gray-300" />
                      </Button>
                    )}
                    {(userRole === 'creator' || userRole === 'manager') && onDelete && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete();
                        }}
                        className="p-1 text-red-600 border-red-200 dark:text-red-400 dark:border-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}

                  </div>
                </div>
                
                {/* 选项区域 - 列表模式下完整显示 */}
                {question.content.options && question.content.options.length > 0 && (
                  <div className="mt-3">
                    <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">选项：</div>
                    <div className="space-y-2">
                      {question.content.options.map((option, optionIndex) => (
                        <div key={optionIndex} className="flex items-start space-x-2 text-sm">
                          <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-full text-xs font-medium text-gray-600 dark:text-gray-300">
                            {String.fromCharCode(65 + optionIndex)}
                          </span>
                          <div className="flex-1 min-w-0">
                            <LaTeXPreview 
                              content={option.text} 
                              config={{ 
                                mode: 'full',
                                features: {
                                  markdown: true,
                                  questionSyntax: true,
                                  autoNumbering: true,
                                  errorHandling: 'lenient'
                                },
                                styling: {
                                  fontSize: '0.9rem',
                                  lineHeight: '1.5',
                                  maxWidth: '100%'
                                }
                              }}
                              variant="compact"
                              showTitle={false}
                              className="question-card-latex-content list-mode"
                              maxWidth="max-w-none"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="flex items-center space-x-3 text-sm text-gray-500 dark:text-gray-400 min-w-0 overflow-hidden flex-wrap mt-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border flex-shrink-0 ${getQuestionTypeColor(question.type)}`}>
                    {getQuestionTypeText(question.type)}
                  </span>
                  <span 
                    className={`px-2 py-1 rounded-full text-xs font-medium border flex-shrink-0 ${getDifficultyColor(question.difficulty)}`}
                    style={{
                      backgroundColor: question.difficulty === 5 ? '#faf5ff' : undefined,
                      color: question.difficulty === 5 ? '#9333ea' : undefined,
                      borderColor: question.difficulty === 5 ? '#e9d5ff' : undefined
                    }}
                  >
                    {getDifficultyText(question.difficulty)}
                  </span>
                  <span className="px-2 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700 rounded-md text-xs font-medium truncate max-w-24" title={bankName || '未知题库'}>
                    {formatBankName(bankName)}
                  </span>
                  <span className="flex items-center space-x-1 flex-shrink-0">
                    <Eye className="h-3 w-3 text-gray-400 dark:text-gray-500" />
                    <span className="text-xs">{question.views || 0}</span>
                  </span>
                  <span className="text-xs whitespace-nowrap flex-shrink-0" title={new Date(question.createdAt).toLocaleDateString()}>
                    {formatDate(question.createdAt)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 图片预览模态框 */}
      <AnimatePresence>
        {previewImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black bg-opacity-90"
            onClick={() => setPreviewImage(null)}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {/* 顶部工具栏 */}
            <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between">
              {/* 左侧信息 */}
              <div className="flex items-center space-x-4">
                <div className="bg-black/50 backdrop-blur-sm rounded-lg px-3 py-2">
                  <p className="text-white text-sm font-medium">{previewImage.filename}</p>
                </div>
                <div className="bg-black/50 backdrop-blur-sm rounded-lg px-3 py-2">
                  <p className="text-white text-xs">缩放: {Math.round(imageScale * 100)}%</p>
                </div>
              </div>
              
              {/* 右侧操作按钮 */}
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    downloadImage();
                  }}
                  className="bg-black/50 backdrop-blur-sm border-white/20 text-white hover:bg-black/70"
                >
                  <Download className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPreviewImage(null)}
                  className="bg-black/50 backdrop-blur-sm border-white/20 text-white hover:bg-black/70"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* 左侧工具面板 */}
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 flex flex-col space-y-2">
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  rotateImage('left');
                }}
                className="bg-black/50 backdrop-blur-sm border-white/20 text-white hover:bg-black/70"
                title="逆时针旋转"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  rotateImage('right');
                }}
                className="bg-black/50 backdrop-blur-sm border-white/20 text-white hover:bg-black/70"
                title="顺时针旋转"
              >
                <RotateCw className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  zoomImage('in');
                }}
                className="bg-black/50 backdrop-blur-sm border-white/20 text-white hover:bg-black/70"
                title="放大"
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  zoomImage('out');
                }}
                className="bg-black/50 backdrop-blur-sm border-white/20 text-white hover:bg-black/70"
                title="缩小"
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  resetImageTransform();
                }}
                className="bg-black/50 backdrop-blur-sm border-white/20 text-white hover:bg-black/70"
                title="重置"
              >
                <Maximize className="w-4 h-4" />
              </Button>
            </div>
            
            {/* 图片内容 */}
            <div className="flex items-center justify-center w-full h-full p-16">
              <motion.img
                src={previewImage.url}
                alt={previewImage.filename}
                className={`max-w-none max-h-none select-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                style={{
                  transform: `translate(${imagePosition.x}px, ${imagePosition.y}px) rotate(${imageRotation}deg) scale(${imageScale})`,
                  transformOrigin: 'center'
                }}
                onMouseDown={handleMouseDown}
                onClick={(e) => e.stopPropagation()}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.3 }}
                draggable={false}
              />
            </div>

            {/* 底部提示 */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
              <div className="bg-black/50 backdrop-blur-sm rounded-lg px-4 py-2">
                <p className="text-white text-xs text-center">
                  拖拽图片移动位置 • 使用左侧工具进行操作 • 点击背景关闭
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TikZ预览模态框 */}
      <AnimatePresence>
        {previewTikZ && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4"
            onClick={() => setPreviewTikZ(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="relative max-w-4xl max-h-full bg-white dark:bg-gray-800 rounded-lg shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* 工具栏 */}
              <div className="absolute top-4 right-4 z-10 flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPreviewTikZ(null)}
                  className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              {/* TikZ内容 */}
              <div className="p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">TikZ 图形预览</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">格式: {previewTikZ.format.toUpperCase()}</p>
                </div>
                <div className="bg-transparent rounded-lg p-4 min-h-[500px] flex items-center justify-center">
                  <TikZPreview
                    code={previewTikZ.code}
                    format={previewTikZ.format}
                    width={800}
                    height={600}
                    showGrid={false}
                    showTitle={false}
                    className="w-full h-full flex items-center justify-center"
                  />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 确认弹窗 */}
      <ConfirmModal
        {...confirmModal}
        onCancel={closeConfirm}
      />
    </motion.div>
  );
});

export default QuestionCard;