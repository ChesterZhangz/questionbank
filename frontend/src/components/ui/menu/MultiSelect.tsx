import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, X, Check, Search } from 'lucide-react';
import type { LucideProps } from 'lucide-react';
import { useTranslation } from '../../../hooks/useTranslation';

interface Option {
  value: string | number;
  label: string;
  icon?: string | React.ComponentType<LucideProps>;
}

interface MultiSelectProps {
  label: string;
  options: Option[];
  value: (string | number)[];
  onChange: (value: (string | number)[]) => void;
  placeholder?: string;
  maxDisplay?: number;
  className?: string;
  disabled?: boolean;
}

const MultiSelect: React.FC<MultiSelectProps> = ({
  label,
  options,
  value,
  onChange,
  placeholder,
  maxDisplay = 2,
  className = "",
  disabled = false
}) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredOptions, setFilteredOptions] = useState(options);
  const [dropdownStyle, setDropdownStyle] = useState({});
  const containerRef = useRef<HTMLDivElement>(null);

  // 过滤选项
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredOptions(options);
    } else {
      const filtered = options.filter(option =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredOptions(filtered);
    }
  }, [searchTerm, options]);

  // 计算下拉菜单位置 - 始终向下展开
  useEffect(() => {
    if (isOpen && containerRef.current) {
      // 始终向下展开，使用绝对定位
      setDropdownStyle({
        position: 'absolute',
        top: '100%',
        left: 0,
        right: 0,
        marginTop: '8px',
        zIndex: 999999
      });
    }
  }, [isOpen]);

  // 点击外部关闭下拉菜单
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

  // 获取选中项的标签
  const getSelectedLabels = () => {
    const selectedOptions = options.filter(option => value.includes(option.value));
    return selectedOptions.map(option => option.label);
  };

  // 处理选择/取消选择
  const handleToggleOption = (optionValue: string | number) => {
    if (value.includes(optionValue)) {
      onChange(value.filter(v => v !== optionValue));
    } else {
      onChange([...value, optionValue]);
    }
  };

  // 清空所有选择
  const handleClearAll = () => {
    onChange([]);
  };

  // 显示文本
  const getDisplayText = () => {
    const selectedLabels = getSelectedLabels();
    if (selectedLabels.length === 0) {
      return placeholder || t('ui.menu.multiSelect.placeholder');
    }
    if (selectedLabels.length <= maxDisplay) {
      return selectedLabels.join(', ');
    }
    return `${selectedLabels.slice(0, maxDisplay).join(', ')} +${selectedLabels.length - maxDisplay}`;
  };

  return (
    <div className={`relative group ${className}`} ref={containerRef}>
      {label && (
        <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1.5">{label}</label>
      )}
      
      <div className="relative">
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={`w-full px-3 py-2 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 transition-all duration-200 appearance-none cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-500 group-hover:shadow-md dark:group-hover:shadow-gray-900/20 ${
            disabled ? 'opacity-50 cursor-not-allowed' : ''
          } ${isOpen ? 'ring-2 ring-blue-500 border-blue-500 dark:ring-blue-400 dark:border-blue-400' : ''}`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className={value.length === 0 ? 'text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-gray-100'}>
                {getDisplayText()}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              {value.length > 0 && (
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClearAll();
                  }}
                  className="hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full p-1 transition-colors cursor-pointer"
                >
                  <X className="h-3 w-3 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300" />
                </div>
              )}
              <div className="transition-transform duration-200 group-hover:scale-110">
                <ChevronDown className={`h-4 w-4 text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
              </div>
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
            className="absolute w-full bg-white/95 dark:bg-gray-800/95 backdrop-blur-md border border-gray-200/50 dark:border-gray-600/50 rounded-lg shadow-lg dark:shadow-gray-900/30 max-h-60 overflow-hidden"
            style={dropdownStyle}
          >
            {/* 搜索框 */}
            <div className="p-2.5 border-b border-gray-100/50 dark:border-gray-700/50">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-3.5 w-3.5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={t('ui.menu.multiSelect.searchPlaceholder')}
                  className="w-full pl-8 pr-3 py-1.5 border border-gray-200 dark:border-gray-600 rounded-lg text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 placeholder-gray-500 dark:placeholder-gray-400"
                  autoFocus
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>

            {/* 选项列表 */}
            <div className="max-h-48 overflow-y-auto">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => {
                  const isSelected = value.includes(option.value);
                  return (
                    <button
                      key={option.value}
                      onClick={() => handleToggleOption(option.value)}
                      className={`w-full px-3 py-2 text-left text-xs transition-colors duration-150 flex items-center space-x-2 ${
                        isSelected
                          ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-r-2 border-blue-500 dark:border-blue-400'
                          : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      {option.icon && (
                        <span className="text-xs opacity-80">
                          {typeof option.icon === 'string' ? (
                            option.icon
                          ) : (
                            <option.icon className="w-3 h-3" />
                          )}
                        </span>
                      )}
                      <span className="flex-1">{option.label}</span>
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Check className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </motion.div>
                      )}
                    </button>
                  );
                })
              ) : (
                <div className="px-3 py-2 text-xs text-gray-500 dark:text-gray-400 text-center">
                  {t('ui.menu.multiSelect.noMatches')}
                </div>
              )}
            </div>

            {/* 底部操作 */}
            {value.length > 0 && (
              <div className="p-2 border-t border-gray-100/50 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-700/30">
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="w-full px-2 py-1 text-xs text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition-colors"
                >
                  {t('ui.menu.multiSelect.clearAll')} ({value.length})
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MultiSelect; 