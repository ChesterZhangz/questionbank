import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Edit3, 
  Trash2, 
  Tag, 
  Plus, 
  X, 
  Star,
  Target,
  Clock
} from 'lucide-react';
import Button from '../ui/Button';
import { renderContent } from '../../lib/latex/utils/renderContent';
import LaTeXPreview from '../editor/preview/LaTeXPreview';

// 题目接口定义
interface Question {
  id: string;
  documentId: string;
  title: string;
  content: string;
  type: 'choice' | 'fill' | 'solution';
  options?: string[];
  blanks?: number[];
  source?: string;
  confidence?: number;
  difficulty?: number;
  tags?: string[];
  category?: string[];
  isSelected: boolean;
  isEditing: boolean;
}

interface EnhancedQuestionItemProps {
  question: Question;
  index: number;
  onUpdate: (question: Question) => void;
  onDelete?: (questionId: string) => void;
}

// 悬浮编辑器组件
const FloatingEditor: React.FC<{
  question: Question;
  onSave: (updates: Partial<Question>) => void;
  onClose: () => void;
  position: { x: number; y: number };
}> = ({ question, onSave, onClose, position }) => {
  const [editData, setEditData] = useState({
    content: question.content,
    type: question.type,
    difficulty: question.difficulty || 3,
    tags: question.tags || [],
    category: question.category || []
  });
  const [newTag, setNewTag] = useState('');
  const editorRef = useRef<HTMLDivElement>(null);

  // 点击外部关闭
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (editorRef.current && !editorRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const handleSave = () => {
    onSave(editData);
    onClose();
  };

  const addTag = () => {
    if (newTag.trim() && !editData.tags.includes(newTag.trim())) {
      setEditData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setEditData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  return (
    <motion.div
      ref={editorRef}
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 10 }}
      className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-xl p-4 w-96 max-h-96 overflow-y-auto"
      style={{
        left: Math.min(position.x, window.innerWidth - 400),
        top: Math.min(position.y, window.innerHeight - 400)
      }}
    >
      <div className="space-y-4">
        {/* 头部 */}
        <div className="flex items-center justify-between pb-2 border-b">
          <h3 className="font-semibold text-gray-900">快速编辑</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="p-1"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* 题目类型 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            题目类型
          </label>
          <select
            value={editData.type}
            onChange={(e) => setEditData(prev => ({ ...prev, type: e.target.value as any }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="choice">选择题</option>
            <option value="fill">填空题</option>
            <option value="solution">解答题</option>
          </select>
        </div>

        {/* 难度等级 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            难度等级
          </label>
          <div className="flex items-center space-x-2">
            {[1, 2, 3, 4, 5].map((level) => (
              <button
                key={level}
                onClick={() => setEditData(prev => ({ ...prev, difficulty: level }))}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  editData.difficulty === level
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        {/* 标签管理 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            标签管理
          </label>
          
          {/* 现有标签 */}
          <div className="flex flex-wrap gap-2 mb-2">
            {editData.tags.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
              >
                {tag}
                <button
                  onClick={() => removeTag(tag)}
                  className="ml-1 hover:text-blue-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>

          {/* 添加新标签 */}
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addTag()}
              placeholder="添加标签..."
              className="flex-1 px-3 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={addTag}
              disabled={!newTag.trim()}
              className="px-2 py-1"
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex items-center justify-end space-x-2 pt-2 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
          >
            取消
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-700"
          >
            保存
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

// 主组件
const EnhancedQuestionItem: React.FC<EnhancedQuestionItemProps> = ({ 
  question, 
  index, 
  onUpdate,
  onDelete 
}) => {
  const [showFloatingEditor, setShowFloatingEditor] = useState(false);
  const [editorPosition, setEditorPosition] = useState({ x: 0, y: 0 });

  const toggleSelection = () => {
    onUpdate({ ...question, isSelected: !question.isSelected });
  };

  const handleQuickEdit = (event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setEditorPosition({
      x: rect.right + 10,
      y: rect.top
    });
    setShowFloatingEditor(true);
  };

  const handleSaveEdit = (updates: Partial<Question>) => {
    onUpdate({ ...question, ...updates });
  };

  const getTypeColor = (type: Question['type']) => {
    switch (type) {
      case 'choice': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'fill': return 'bg-green-100 text-green-800 border-green-200';
      case 'solution': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeName = (type: Question['type']) => {
    switch (type) {
      case 'choice': return '选择题';
      case 'fill': return '填空题';
      case 'solution': return '解答题';
      default: return '未知';
    }
  };

  const getDifficultyStars = (difficulty?: number) => {
    if (!difficulty) return null;
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-3 w-3 ${
          i < difficulty 
            ? 'text-yellow-400 fill-yellow-400' 
            : 'text-gray-300'
        }`}
      />
    ));
  };

  // 渲染LaTeX内容
  const renderQuestionContent = (content: string) => {
    try {
      return { __html: renderContent(content) };
    } catch (error) {
      // 错误日志已清理
      return { __html: content };
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        transition={{ delay: index * 0.05 }}
        className={`border rounded-lg p-6 transition-all duration-200 hover:shadow-md ${
          question.isSelected 
            ? 'border-blue-500 bg-blue-50 shadow-md' 
            : 'border-gray-200 hover:border-gray-300'
        }`}
      >
        <div className="space-y-4">
          {/* 题目头部 */}
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3 flex-1">
              <input
                type="checkbox"
                checked={question.isSelected}
                onChange={toggleSelection}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1"
              />
              
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <span className="font-semibold text-lg text-gray-900">{question.title}</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getTypeColor(question.type)}`}>
                    {getTypeName(question.type)}
                  </span>
                  
                  {/* 难度显示 */}
                  {question.difficulty && (
                    <div className="flex items-center space-x-1">
                      <Target className="h-3 w-3 text-gray-500" />
                      <div className="flex items-center space-x-1">
                        {getDifficultyStars(question.difficulty)}
                      </div>
                    </div>
                  )}
                  
                  {/* 置信度 */}
                  {question.confidence && (
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                      置信度: {(question.confidence * 100).toFixed(1)}%
                    </span>
                  )}
                </div>

                {/* 标签显示 */}
                {question.tags && question.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {question.tags.map((tag, tagIndex) => (
                      <span
                        key={tagIndex}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700"
                      >
                        <Tag className="h-3 w-3 mr-1" />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleQuickEdit}
                className="hover:bg-blue-50"
              >
                <Edit3 className="h-4 w-4" />
                快速编辑
              </Button>
              
              {onDelete && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDelete(question.id)}
                  className="text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
          
          {/* 题目内容（LaTeX渲染） */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div 
              className="prose prose-sm max-w-none text-gray-800 leading-relaxed"
              dangerouslySetInnerHTML={renderQuestionContent(question.content)}
            />
          </div>

          {/* 选择题选项 */}
          {question.type === 'choice' && question.options && question.options.length > 0 && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3">选项 ({question.options.length})</h4>
              <div className="space-y-2">
                {question.options.map((option, optionIndex) => (
                  <div key={optionIndex} className="flex items-start space-x-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-xs font-medium">
                      {String.fromCharCode(65 + optionIndex)}
                    </span>
                    <div className="flex-1 text-sm text-gray-700">
                      <LaTeXPreview 
                        content={option} 
                        config={{ 
                          mode: 'full',
                          features: {
                            markdown: true,
                            questionSyntax: true,
                            autoNumbering: true,
                            errorHandling: 'lenient'
                          }
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 填空题信息 */}
          {question.type === 'fill' && question.blanks && question.blanks.length > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-green-800">填空题</span>
                <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                  {question.blanks.length} 个填空
                </span>
              </div>
            </div>
          )}

          {/* 底部信息栏 */}
          <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
            <div className="flex items-center space-x-4">
              <span className="flex items-center space-x-1">
                <Clock className="h-3 w-3" />
                <span>来源: {question.source}</span>
              </span>
              <span>文档: {question.documentId.slice(-8)}</span>
            </div>
            
            <div className="flex items-center space-x-2">
              {question.category && question.category.length > 0 && (
                <span className="bg-gray-100 px-2 py-1 rounded-full">
                  分类: {question.category.join(', ')}
                </span>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* 悬浮编辑器 */}
      <AnimatePresence>
        {showFloatingEditor && (
          <FloatingEditor
            question={question}
            onSave={handleSaveEdit}
            onClose={() => setShowFloatingEditor(false)}
            position={editorPosition}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default EnhancedQuestionItem;