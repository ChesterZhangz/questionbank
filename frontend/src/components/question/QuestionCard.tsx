import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Star, 
  Eye, 
  Edit, 
  MoreVertical,
  BookOpen,
  Calendar,
  Camera,
  Trash2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Question } from '../../types';
import Card from '../ui/Card';
import Button from '../ui/Button';
// 导入LaTeXPreview组件，使用与编辑区相同的渲染逻辑
import LaTeXPreview from '../editor/preview/LaTeXPreview';
import { useScreenshotStore } from '../../stores/screenshotStore';
import { useModal } from '../../hooks/useModal';
import ConfirmModal from '../ui/ConfirmModal';
// 导入QuestionCard专用的LaTeX样式
import './QuestionCard.css';

interface QuestionCardProps {
  question: Question;
  bid: string;
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
  const { showConfirm, showSuccessRightSlide, showErrorRightSlide, confirmModal, closeConfirm } = useModal();
  
  const { config } = useScreenshotStore();
  // 格式化题库编号显示
  const formatBid = (bid: string) => {
    if (!bid) return '未知题库';
    if (bid.length <= 12) return bid;
    return bid.substring(0, 8) + '...' + bid.substring(bid.length - 4);
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
      case 1: return '简单';
      case 2: return '较易';
      case 3: return '中等';
      case 4: return '较难';
      case 5: return '困难';
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
      await onFavorite(question.qid, !isFavorite);
    } catch (error) {
      console.error('收藏操作失败:', error);
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
      navigate(`/question-banks/${bid}/questions/${question.qid}`);
    }
  };

  // 编辑题目
  const handleEdit = () => {
    navigate(`/question-banks/${bid}/questions/${question.qid}/edit`);
  };

  // 删除题目
  const handleDelete = async () => {
    if (!onDelete) return;
    
    showConfirm(
      '确认删除',
      '确定要删除这道题目吗？此操作不可撤销。',
      async () => {
        try {
          await onDelete(question._id);
        } catch (error) {
          console.error('删除题目失败:', error);
          showErrorRightSlide('删除失败', '删除题目失败，请重试');
        }
      }
    );
  };

  // 截图功能 - 使用新的截图工具
  const handleScreenshot = async () => {
    try {
      // 导入截图工具
      const { generateScreenshot } = await import('../screenshot/QuestionScreenshotTool');
      
      // 调用截图工具的方法
      await generateScreenshot({
        question,
        bid,
        bankName: formatBid(bid), // 使用格式化的题库名称
        config,
        onScreenshot: async (canvas: HTMLCanvasElement) => {
          // 转换为图片并复制到剪贴板
          try {
            canvas.toBlob(async (blob: Blob | null) => {
              if (blob) {
                const clipboardItem = new ClipboardItem({
                  'image/png': blob
                });
                await navigator.clipboard.write([clipboardItem]);
                showSuccessRightSlide('复制成功', '题目截图已复制到剪贴板！');
              }
            }, 'image/png', 1.0);
          } catch (error) {
            // 如果剪贴板API不支持，则下载文件
            console.warn('剪贴板API不支持，改为下载文件:', error);
            const link = document.createElement('a');
            link.download = `Mareate_题目_${String(index + 1).padStart(2, '0')}.png`;
            link.href = canvas.toDataURL('image/png', 1.0);
            link.click();
          }
        }
      });
    } catch (error) {
      console.error('截图失败:', error);
      showErrorRightSlide('截图失败', '截图失败，请重试');
    }
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
          className={`w-full h-96 hover:shadow-lg dark:hover:shadow-gray-900/30 transition-all duration-200 cursor-pointer group flex flex-col ${
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
                  className="p-1"
                >
                  <Star 
                    className={`w-4 h-4 ${isFavorite ? 'fill-yellow-400 text-yellow-500' : 'text-gray-400 dark:text-gray-500'}`} 
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

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleScreenshot();
                            setShowMenu(false);
                          }}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <Camera className="w-4 h-4 mr-2" />
                          截图分享
                        </button>

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
            <div className="flex-1 overflow-hidden min-w-0">
              {/* 题目主干 */}
              <div className="mb-4 min-w-0">
                <h3 className="text-base font-medium text-gray-900 dark:text-gray-100 mb-3 line-clamp-3 leading-relaxed min-w-0">
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
              </div>

              {/* 选项区域 - 可滚动 */}
              {question.content.options && question.content.options.length > 0 && (
                <div className="mb-4 min-w-0">
                  <div className="space-y-2 max-h-32 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-gray-100 dark:scrollbar-track-gray-800 min-w-0">
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
                  <span className="truncate text-xs" title={bid}>
                    {formatBid(bid)}
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
        // 列表模式 - 简化
        <div className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md dark:hover:shadow-gray-900/30 transition-all duration-200">
          <div className="p-4">
            <div className="flex items-center space-x-4">
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
              <div className="flex-1 min-w-0 overflow-hidden">
                <div className="flex items-center justify-between mb-2 min-w-0">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate min-w-0 flex-1">
                    <div 
                      className="text-gray-900 dark:text-gray-100 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 overflow-hidden"
                      onClick={handleViewDetail}
                    >
                      <LaTeXPreview 
                        content={question.content.stem.substring(0, 80) + '...'} 
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
                        maxHeight="max-h-8"
                      />
                    </div>
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
                      <Star 
                        className={`w-4 h-4 ${isFavorite ? 'fill-yellow-400 text-yellow-500' : 'text-gray-400 dark:text-gray-500'}`} 
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
                
                <div className="flex items-center space-x-3 text-sm text-gray-500 dark:text-gray-400 min-w-0 overflow-hidden flex-wrap">
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
                  <span className="px-2 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700 rounded-md text-xs font-medium truncate max-w-24" title={bid || '未知题库'}>
                    {formatBid(bid)}
                  </span>
                  <span className="flex items-center space-x-1 flex-shrink-0">
                    <Star className="h-3 w-3 fill-current text-yellow-400 dark:text-yellow-500" />
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

      {/* 确认弹窗 */}
      <ConfirmModal
        {...confirmModal}
        onCancel={closeConfirm}
      />
    </motion.div>
  );
});

export default QuestionCard;