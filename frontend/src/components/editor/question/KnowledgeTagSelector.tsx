import React, { useState } from 'react';
import { Tag, Check, Plus, X } from 'lucide-react';
import Button from '../../ui/Button';
import Input from '../../ui/Input';
import Card from '../../ui/Card';
import { useModal } from '../../../hooks/useModal';

interface KnowledgeTagSelectorProps {
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  maxCount?: number;
  className?: string;
}



const KnowledgeTagSelector: React.FC<KnowledgeTagSelectorProps> = ({
  selectedTags = [],
  onTagsChange,
  maxCount = 5,
  className = ''
}) => {
  // 弹窗状态管理
  const { showErrorRightSlide } = useModal();

  const [showDropdown, setShowDropdown] = useState(false);
  const [customTag, setCustomTag] = useState('');

  const handleSelectTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      // 如果已选择，则移除
      onTagsChange(selectedTags.filter(t => t !== tag));
    } else {
      // 如果未选择且未达到最大数量，则添加
      if (selectedTags.length < maxCount) {
        onTagsChange([...selectedTags, tag]);
      } else {
        showErrorRightSlide('选择限制', `知识点标签最多只能选择${maxCount}个`);
      }
    }
  };

  const handleAddCustomTag = () => {
    if (!customTag.trim()) return;
    
    if (selectedTags.includes(customTag.trim())) {
      showErrorRightSlide('重复输入', '该知识点标签已存在');
      return;
    }

    if (selectedTags.length >= maxCount) {
      showErrorRightSlide('选择限制', `知识点标签最多只能选择${maxCount}个`);
      return;
    }
    onTagsChange([...selectedTags, customTag.trim()]);
    setCustomTag('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onTagsChange(selectedTags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddCustomTag();
    }
  };

  // 按学科分类的知识点
  const categorizedTags = {
    '数学基础': ['函数', '导数', '积分', '极限', '数列', '概率', '统计', '几何', '代数', '三角'],
    '高等数学': ['微积分', '线性代数', '概率论', '数理统计', '离散数学', '数值分析'],
    '中学数学': ['集合', '逻辑', '数系', '整式', '分式', '根式', '二次函数', '指数函数', '对数函数'],

  };

  return (
    <Card className={className}>
      <div className="p-4 border-b bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <Tag className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          <h3 className="font-medium text-gray-900 dark:text-gray-100">知识点标签</h3>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            ({selectedTags.length}/{maxCount})
          </span>
        </div>
      </div>
      
      <div className="p-4 space-y-3">
        {/* 自定义输入 */}
        <div className="flex space-x-2">
          <div className="relative flex-1">
            <Input
              value={customTag}
              onChange={(e) => setCustomTag(e.target.value)}
              placeholder={`输入或选择知识点标签（最多${maxCount}个）`}
              onKeyPress={handleKeyPress}
              onFocus={() => setShowDropdown(true)}
              onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
            />
            
            {/* 预设选项下拉框 */}
            {showDropdown && (
              <div className="absolute z-[9999] w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg dark:shadow-gray-900/50 max-h-80 overflow-y-auto">
                {Object.entries(categorizedTags).map(([category, tags]) => (
                  <div key={category}>
                    <div className="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-xs font-medium text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600">
                      {category}
                    </div>
                    {tags.map((tag) => {
                      const isSelected = selectedTags.includes(tag);
                      return (
                        <button
                          key={tag}
                          onClick={() => handleSelectTag(tag)}
                          className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700 focus:outline-none flex items-center justify-between ${
                            isSelected ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-200'
                          }`}
                        >
                          <span>{tag}</span>
                          {isSelected && <Check className="w-4 h-4" />}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            )}
          </div>
          <Button 
            variant="outline" 
            onClick={handleAddCustomTag} 
            size="sm"
            disabled={!customTag.trim() || selectedTags.length >= maxCount}
            className="border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {/* 已选择的标签 */}
        {selectedTags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {selectedTags.map((tag, index) => (
              <span
                key={`tag-${tag}-${index}`}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-700"
              >
                {tag}
                <button
                  onClick={() => handleRemoveTag(tag)}
                  className="ml-2 text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200 focus:outline-none"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* 提示信息 */}
        {selectedTags.length === 0 && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            请选择预设标签或输入自定义知识点标签，帮助更好地分类和检索题目
          </p>
        )}
      </div>
    </Card>
  );
};

export default KnowledgeTagSelector; 