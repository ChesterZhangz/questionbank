import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Plus, Tag } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';

interface TagSelectorProps {
  label: string;
  availableTags: string[];
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  placeholder?: string;
  maxDisplay?: number;
  className?: string;
}

const TagSelector: React.FC<TagSelectorProps> = ({
  label,
  availableTags,
  selectedTags,
  onTagsChange,
  placeholder,
  className = ""
}) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredTags, setFilteredTags] = useState(availableTags);
  const [dropdownStyle, setDropdownStyle] = useState({});
  const containerRef = useRef<HTMLDivElement>(null);

  // 过滤标签
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredTags(availableTags);
    } else {
      const filtered = availableTags.filter(tag =>
        tag.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredTags(filtered);
    }
  }, [searchTerm, availableTags]);

  // 计算下拉菜单位置
  useEffect(() => {
    if (isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const dropdownHeight = 320; // 预估下拉菜单高度
      
      // 检查下方空间是否足够
      const spaceBelow = viewportHeight - rect.bottom;
      const spaceAbove = rect.top;
      
      if (spaceBelow < dropdownHeight && spaceAbove > dropdownHeight) {
        // 如果下方空间不够，但上方空间足够，则向上展开
        setDropdownStyle({
          position: 'absolute',
          bottom: '100%',
          left: 0,
          right: 0,
          marginBottom: '8px',
          zIndex: 99999
        });
      } else {
        // 默认向下展开
        setDropdownStyle({
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          marginTop: '8px',
          zIndex: 99999
        });
      }
    }
  }, [isOpen]);

  // 点击外部关闭
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // 添加标签
  const handleAddTag = (tag: string) => {
    if (!selectedTags.includes(tag)) {
      onTagsChange([...selectedTags, tag]);
    }
  };

  // 移除标签
  const handleRemoveTag = (tag: string) => {
    onTagsChange(selectedTags.filter(t => t !== tag));
  };

  // 清空所有标签
  const handleClearAll = () => {
    onTagsChange([]);
  };

  // 获取未选中的标签
  const unselectedTags = filteredTags.filter(tag => !selectedTags.includes(tag));

  return (
    <div className={`relative group ${className}`} ref={containerRef}>
      {label && (
        <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1.5">{label}</label>
      )}
      
      <div className="space-y-3">
        {/* 已选标签显示 */}
        {selectedTags.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-indigo-50/80 to-purple-50/80 dark:from-indigo-900/20 dark:to-purple-900/20 p-3 rounded-lg border border-indigo-100/50 dark:border-indigo-700/50"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-indigo-700 dark:text-indigo-300 flex items-center gap-1">
                <Tag className="w-3 h-3" />
                {t('ui.tagSelector.selectedTags')} ({selectedTags.length})
              </span>
              <button
                onClick={handleClearAll}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-200 transition-colors px-2 py-1 rounded hover:bg-indigo-100 dark:hover:bg-indigo-800/50"
              >
                {t('ui.tagSelector.clear')}
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <AnimatePresence>
                {selectedTags.map((tag) => (
                  <motion.span
                    key={tag}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-indigo-200 dark:border-indigo-600 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-medium shadow-sm dark:shadow-gray-900/20 hover:shadow-md transition-all duration-200"
                  >
                    <span className="w-1.5 h-1.5 bg-indigo-500 dark:bg-indigo-400 rounded-full"></span>
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:bg-indigo-100 dark:hover:bg-indigo-700/50 rounded-full p-0.5 transition-colors ml-1"
                    >
                      <X className="h-2.5 w-2.5" />
                    </button>
                  </motion.span>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
        
        {/* 标签选择器 */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className={`w-full px-3 py-2 border border-gray-200 dark:border-gray-600 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-sm dark:shadow-gray-900/20 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 transition-all duration-200 appearance-none cursor-pointer hover:border-gray-300 dark:hover:border-gray-500 group-hover:shadow-md dark:group-hover:shadow-gray-900/30 ${
              isOpen ? 'ring-2 ring-blue-500 border-blue-500 dark:ring-blue-400 dark:border-blue-400' : ''
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Tag className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                <span className={selectedTags.length === 0 ? 'text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-gray-100'}>
                  {selectedTags.length === 0 ? (placeholder || t('ui.tagSelector.selectTags')) : t('ui.tagSelector.totalTags', { total: availableTags.length, selected: selectedTags.length })}
                </span>
              </div>
              <div className="transition-transform duration-200 group-hover:scale-110">
                <Plus className={`h-4 w-4 text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-transform duration-200 ${isOpen ? 'rotate-45' : ''}`} />
              </div>
            </div>
          </button>
          
          {/* 自定义下拉指示器 */}
          <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-white/80 dark:from-gray-800/80 to-transparent pointer-events-none rounded-r-lg"></div>
        </div>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute w-full bg-white/95 dark:bg-gray-800/95 backdrop-blur-md border border-gray-200/50 dark:border-gray-600/50 rounded-lg shadow-lg dark:shadow-gray-900/30 max-h-80 overflow-hidden"
              style={dropdownStyle}
            >
              {/* 搜索框 */}
              <div className="p-3 border-b border-gray-100/50 dark:border-gray-700/50">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-4 w-4" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={t('ui.tagSelector.searchTags')}
                    className="w-full pl-10 pr-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 placeholder-gray-500 dark:placeholder-gray-400"
                    autoFocus
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </div>

              {/* 标签列表 */}
              <div className="max-h-64 overflow-y-auto">
                {unselectedTags.length > 0 ? (
                  <div className="p-3">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">{t('ui.tagSelector.availableTags')} ({unselectedTags.length})</div>
                    <div className="flex flex-wrap gap-2">
                      {unselectedTags.map((tag) => (
                        <motion.button
                          key={tag}
                          whileHover={{ scale: 1.05, y: -1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleAddTag(tag)}
                          className="px-3 py-1.5 bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-full text-xs font-medium hover:bg-white dark:hover:bg-gray-600 hover:border-gray-300 dark:hover:border-gray-500 hover:shadow-sm dark:hover:shadow-gray-900/20 transition-all duration-200 flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" />
                          {tag}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="p-4 text-center">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                      {searchTerm ? t('ui.tagSelector.noMatchingTags') : t('ui.tagSelector.allTagsSelected')}
                    </div>
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm('')}
                        className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 transition-colors"
                      >
                        {t('ui.tagSelector.clearSearch')}
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* 底部统计 */}
              <div className="p-2 border-t border-gray-100/50 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-700/30">
                <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                  {t('ui.tagSelector.totalTags', { total: availableTags.length, selected: selectedTags.length })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default TagSelector; 