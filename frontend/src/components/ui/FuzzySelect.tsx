import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Search, X } from 'lucide-react';

interface FuzzySelectOption {
  value: string | number;
  label: string;
  icon?: string | React.ComponentType<{ className?: string }>;
  html?: string; // 支持HTML内容
}

interface FuzzySelectProps {
  options: FuzzySelectOption[];
  value: string | number;
  onChange: (value: string | number) => void;
  placeholder?: string;
  label?: string;
  className?: string;
  disabled?: boolean;
}

const FuzzySelect: React.FC<FuzzySelectProps> = ({
  options,
  value,
  onChange,
  placeholder = "请选择...",
  label,
  className = "",
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredOptions, setFilteredOptions] = useState(options);
  const [dropdownStyle, setDropdownStyle] = useState({});
  const containerRef = useRef<HTMLDivElement>(null);

  // 获取当前选中项的标签
  const selectedOption = options.find(option => option.value === value);

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

  // 计算下拉菜单位置 - 只向下展开
  useEffect(() => {
    if (isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      
      // 始终向下展开，不向上展开
      setDropdownStyle({
        position: 'fixed',
        top: rect.bottom + 8,
        left: rect.left,
        width: rect.width,
        zIndex: 99999
      });
    }
  }, [isOpen]);

  // 监听窗口滚动和resize事件，重新计算位置 - 只向下展开
  useEffect(() => {
    const updatePosition = () => {
      if (isOpen && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        
        // 始终向下展开，不向上展开
        setDropdownStyle({
          position: 'fixed',
          top: rect.bottom + 8,
          left: rect.left,
          width: rect.width,
          zIndex: 99999
        });
      }
    };

    if (isOpen) {
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
    }

    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
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
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (option: FuzzySelectOption) => {
    onChange(option.value);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setSearchTerm('');
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
          className={`w-full px-3 py-2 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 shadow-sm dark:shadow-gray-900/20 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 transition-all duration-200 appearance-none cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-500 group-hover:shadow-md dark:group-hover:shadow-gray-900/30 ${
            disabled ? 'opacity-50 cursor-not-allowed' : ''
          } ${isOpen ? 'ring-2 ring-blue-500 border-blue-500 dark:ring-blue-400 dark:border-blue-400' : ''}`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {selectedOption?.icon && (
                <span className="text-xs opacity-80">
                  {typeof selectedOption.icon === 'string' ? (
                    selectedOption.icon
                  ) : (
                    <selectedOption.icon className="w-3 h-3" />
                  )}
                </span>
              )}
              <span className={selectedOption ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400'}>
                {selectedOption ? (
                  selectedOption.html ? (
                    <span dangerouslySetInnerHTML={{ __html: selectedOption.html }} />
                  ) : (
                    selectedOption.label
                  )
                ) : (
                  placeholder
                )}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="transition-transform duration-200 group-hover:scale-110">
                <ChevronDown className={`h-4 w-4 text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
              </div>
            </div>
          </div>
        </button>
        
        {/* 清除按钮 - 独立于主按钮 */}
        {value && (
          <div
            onClick={handleClear}
            className="absolute right-8 top-1/2 transform -translate-y-1/2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full p-1 transition-colors cursor-pointer z-10"
          >
            <X className="h-3 w-3 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300" />
          </div>
        )}
        
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
            className="fixed bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-xl max-h-60 overflow-hidden z-[99999]"
            style={dropdownStyle}
          >
            {/* 搜索框 */}
            <div className="p-2.5 border-b border-gray-100/50 dark:border-gray-700/50 w-full">
              <div className="relative w-full">
                <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-3.5 w-3.5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="搜索..."
                  className="w-full pl-8 pr-3 py-1.5 border border-gray-200 dark:border-gray-600 rounded-lg text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 placeholder-gray-500 dark:placeholder-gray-400"
                  autoFocus
                />
              </div>
            </div>

            {/* 选项列表 */}
            <div className="max-h-48 overflow-y-auto w-full">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleSelect(option)}
                    className={`w-full px-3 py-2 text-left text-xs transition-colors duration-150 flex items-center space-x-2 ${
                      option.value === value
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
                    <span className="flex-1 min-w-0 w-full">
                      {option.html ? (
                        <span dangerouslySetInnerHTML={{ __html: option.html }} />
                      ) : (
                        option.label
                      )}
                    </span>
                    {option.value === value && (
                      <div className="w-1.5 h-1.5 bg-blue-500 dark:bg-blue-400 rounded-full flex-shrink-0"></div>
                    )}
                  </button>
                ))
              ) : (
                <div className="px-3 py-2 text-xs text-gray-500 dark:text-gray-400 text-center w-full">
                  没有找到匹配的选项
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FuzzySelect; 