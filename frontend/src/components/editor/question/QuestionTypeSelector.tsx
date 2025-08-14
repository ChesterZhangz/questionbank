import React, { useState } from 'react';
import { Check, Plus, X } from 'lucide-react';
import Button from '../../ui/Button';
import Input from '../../ui/Input';
import Card from '../../ui/Card';
import { useModal } from '../../../hooks/useModal';

interface QuestionTypeSelectorProps {
  selectedTypes: string[];
  onTypesChange: (types: string[]) => void;
  maxCount?: number;
  className?: string;
}

// 预设小题型选项 - 与后端DeepSeek选项保持一致
const presetQuestionTypes = [
  '计算题', '创新题', '新定义题', '应用题', '证明题', '综合题', 
  '实验题', '探究题', '开放题', '竞赛题', '选择题', '填空题', 
  '解答题', '判断题', '连线题', '排序题', '匹配题', '简答题',
  '论述题', '分析题', '设计题', '评价题', '比较题', '归纳题',
  '概念题'
];

const QuestionTypeSelector: React.FC<QuestionTypeSelectorProps> = ({
  selectedTypes = [],
  onTypesChange,
  maxCount = 3,
  className = ''
}) => {
  // 弹窗状态管理
  const { showErrorRightSlide } = useModal();

  const [showDropdown, setShowDropdown] = useState(false);
  const [customType, setCustomType] = useState('');

  const handleSelectType = (type: string) => {
    if (selectedTypes.includes(type)) {
      // 如果已选择，则移除
      onTypesChange(selectedTypes.filter(t => t !== type));
    } else {
      // 如果未选择且未达到最大数量，则添加
      if (selectedTypes.length < maxCount) {
        onTypesChange([...selectedTypes, type]);
      } else {
        showErrorRightSlide('选择限制', `小题型最多只能选择${maxCount}个`);
      }
    }
  };

  const handleAddCustomType = () => {
    if (!customType.trim()) return;
    
    // 检查是否在预设选项中
    if (!presetQuestionTypes.includes(customType.trim())) {
      showErrorRightSlide('输入限制', '小题型只能从预设选项中选择，不能自定义输入');
      return;
    }
    
    if (selectedTypes.includes(customType.trim())) {
      showErrorRightSlide('重复输入', '该小题型已存在');
      return;
    }

    if (selectedTypes.length >= maxCount) {
      showErrorRightSlide('选择限制', `小题型最多只能选择${maxCount}个`);
      return;
    }

    onTypesChange([...selectedTypes, customType.trim()]);
    setCustomType('');
  };

  const handleRemoveType = (typeToRemove: string) => {
    onTypesChange(selectedTypes.filter(type => type !== typeToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddCustomType();
    }
  };

  return (
    <Card className={className}>
      <div className="p-4 border-b bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-blue-500 rounded-sm flex items-center justify-center">
            <span className="text-white text-xs font-bold">题</span>
          </div>
          <h3 className="font-medium text-gray-900 dark:text-gray-100">小题型</h3>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            ({selectedTypes.length}/{maxCount})
          </span>
        </div>
      </div>
      
      <div className="p-4 space-y-3">
        {/* 选择输入 */}
        <div className="flex space-x-2">
          <div className="relative flex-1">
            <Input
              value={customType}
              onChange={(e) => setCustomType(e.target.value)}
              placeholder={`从预设选项中选择小题型（最多${maxCount}个）`}
              onKeyPress={handleKeyPress}
              onFocus={() => setShowDropdown(true)}
              onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
              readOnly
            />
            
            {/* 预设选项下拉框 */}
            {showDropdown && (
              <div className="absolute z-[9999] w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg dark:shadow-gray-900/50 max-h-60 overflow-y-auto">
                {presetQuestionTypes.map((type) => {
                  const isSelected = selectedTypes.includes(type);
                  return (
                    <button
                      key={type}
                      onClick={() => handleSelectType(type)}
                      className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700 focus:outline-none flex items-center justify-between ${
                        isSelected ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-200'
                      }`}
                    >
                      <span>{type}</span>
                      {isSelected && <Check className="w-4 h-4" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
          <Button 
            variant="outline" 
            onClick={handleAddCustomType} 
            size="sm"
            disabled={!customType.trim() || selectedTypes.length >= maxCount || !presetQuestionTypes.includes(customType.trim())}
            className="border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {/* 已选择的题型 */}
        {selectedTypes.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {selectedTypes.map((type, index) => (
              <span
                key={`type-${type}-${index}`}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-700"
              >
                {type}
                <button
                  onClick={() => handleRemoveType(type)}
                  className="ml-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 focus:outline-none"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* 提示信息 */}
        {selectedTypes.length === 0 && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            请从预设选项中选择小题型，帮助更好地分类题目
          </p>
        )}
      </div>
    </Card>
  );
};

export default QuestionTypeSelector; 