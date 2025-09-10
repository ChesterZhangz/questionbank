import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown} from 'lucide-react';
import './SimpleSelect.css';

interface SimpleSelectOption {
  value: string | number;
  label: string;
  icon?: string | React.ComponentType<{ className?: string }>;
}

interface SimpleSelectProps {
  options: SimpleSelectOption[];
  value: string | number;
  onChange: (value: string | number) => void;
  placeholder?: string;
  label?: string;
  className?: string;
  disabled?: boolean;
  // 样式定制选项
  variant?: 'default' | 'outline' | 'filled' | 'minimal';
  size?: 'sm' | 'md' | 'lg';
  rounded?: 'sm' | 'md' | 'lg' | 'full';
  theme?: 'blue' | 'green' | 'purple' | 'red' | 'gray';
  showIcon?: boolean;
  customStyles?: {
    button?: string;
    dropdown?: string;
    option?: string;
    selectedOption?: string;
  };
}

const SimpleSelect: React.FC<SimpleSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = "请选择...",
  label,
  className = "",
  disabled = false,
  variant = 'default',
  size = 'md',
  rounded = 'md',
  theme = 'blue',
  showIcon = true,
  customStyles = {}
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState({});
  const containerRef = useRef<HTMLDivElement>(null);

  // 获取当前选中项的标签
  const selectedOption = options.find(option => option.value === value);

  // 样式生成函数
  const getStyles = () => {

    // 尺寸样式
    const sizeStyles = {
      sm: 'px-2 py-1.5 text-xs',
      md: 'px-3 py-2 text-sm',
      lg: 'px-4 py-2.5 text-base'
    };

    // 圆角样式
    const roundedStyles = {
      sm: 'rounded',
      md: 'rounded-lg',
      lg: 'rounded-xl',
      full: 'rounded-full'
    };

    // 主题样式 - 简化颜色，使用更朴素的色调
    const themeStyles = {
      blue: {
        button: 'border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400',
        dropdown: 'border-gray-200 dark:border-gray-600',
        option: 'hover:bg-gray-50 dark:hover:bg-gray-700',
        selectedOption: 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
      },
      green: {
        button: 'border-gray-300 dark:border-gray-600 focus:ring-green-500 focus:border-green-500 dark:focus:ring-green-400 dark:focus:border-green-400',
        dropdown: 'border-gray-200 dark:border-gray-600',
        option: 'hover:bg-gray-50 dark:hover:bg-gray-700',
        selectedOption: 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
      },
      purple: {
        button: 'border-gray-300 dark:border-gray-600 focus:ring-purple-500 focus:border-purple-500 dark:focus:ring-purple-400 dark:focus:border-purple-400',
        dropdown: 'border-gray-200 dark:border-gray-600',
        option: 'hover:bg-gray-50 dark:hover:bg-gray-700',
        selectedOption: 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
      },
      red: {
        button: 'border-gray-300 dark:border-gray-600 focus:ring-red-500 focus:border-red-500 dark:focus:ring-red-400 dark:focus:border-red-400',
        dropdown: 'border-gray-200 dark:border-gray-600',
        option: 'hover:bg-gray-50 dark:hover:bg-gray-700',
        selectedOption: 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
      },
      gray: {
        button: 'border-gray-300 dark:border-gray-600 focus:ring-gray-500 focus:border-gray-500 dark:focus:ring-gray-400 dark:focus:border-gray-400',
        dropdown: 'border-gray-200 dark:border-gray-600',
        option: 'hover:bg-gray-50 dark:hover:bg-gray-700',
        selectedOption: 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
      }
    };

    // 变体样式 - 简化设计
    const variantStyles = {
      default: 'bg-white dark:bg-gray-800 shadow-sm',
      outline: 'bg-transparent border',
      filled: 'bg-gray-50 dark:bg-gray-700',
      minimal: 'bg-transparent border-0 shadow-none'
    };

    return {
      button: `${sizeStyles[size]} ${roundedStyles[rounded]} ${variantStyles[variant]} ${themeStyles[theme].button} ${customStyles.button || ''}`,
      dropdown: `${themeStyles[theme].dropdown} ${customStyles.dropdown || ''}`,
      option: `${themeStyles[theme].option} ${customStyles.option || ''}`,
      selectedOption: `${themeStyles[theme].selectedOption} ${customStyles.selectedOption || ''}`
    };
  };

  const styles = getStyles();

  // 计算下拉菜单位置 - 智能选择展开方向
  useEffect(() => {
    if (isOpen && containerRef.current) {
      const container = containerRef.current;
      const rect = container.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;
      const dropdownHeight = Math.min(options.length * 40 + 20, 240); // 估算下拉菜单高度
      const dropdownWidth = Math.max(rect.width, 280); // 最小宽度280px
      
      // 检查下方空间是否足够
      const spaceBelow = viewportHeight - rect.bottom;
      const spaceAbove = rect.top;
      
      // 计算水平位置，确保不超出视口
      let left = rect.left;
      if (left + dropdownWidth > viewportWidth) {
        left = viewportWidth - dropdownWidth - 10; // 留10px边距
      }
      if (left < 10) {
        left = 10; // 最小左边距
      }
      
      // 如果下方空间不足，则向上展开
      if (spaceBelow < dropdownHeight && spaceAbove > dropdownHeight) {
        setDropdownStyle({
          position: 'fixed',
          bottom: viewportHeight - rect.top + 8,
          left: left,
          width: dropdownWidth,
          zIndex: 999999
        });
      } else {
        // 默认向下展开
        setDropdownStyle({
          position: 'fixed',
          top: rect.bottom + 8,
          left: left,
          width: dropdownWidth,
          zIndex: 999999
        });
      }
    }
  }, [isOpen, options.length]);

  // 点击外部关闭
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (option: SimpleSelectOption) => {
    onChange(option.value);
    setIsOpen(false);
  };


  return (
    <div className={`relative group ${className}`} ref={containerRef}>
      {label && (
        <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1.5">{label}</label>
      )}
      
      <div className="relative">
        {/* 下拉按钮 - 样式与Input组件保持一致 */}
        <div
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className={`relative w-full cursor-pointer input ${showIcon && selectedOption?.icon ? 'pl-10' : ''} ${
            disabled ? 'opacity-50 cursor-not-allowed' : ''
          } ${isOpen ? 'ring-2 ring-blue-500 border-blue-500 dark:ring-blue-400 dark:border-blue-400' : ''}`}
        >
          {/* 主按钮内容 */}
          <div className="flex items-center justify-between w-full h-full">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              {showIcon && selectedOption?.icon && (
                <div className="flex-shrink-0">
                  {typeof selectedOption.icon === 'string' ? (
                    <span className="text-lg">{selectedOption.icon}</span>
                  ) : (
                    <selectedOption.icon className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                  )}
                </div>
              )}
              <span className={`flex-1 min-w-0 truncate transition-colors duration-200 ${
                selectedOption ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400'
              }`}>
                {selectedOption ? selectedOption.label : placeholder}
              </span>
            </div>
            
            {/* 箭头图标 - 使用lucide-react的ChevronDown */}
            <div className="flex-shrink-0 ml-3">
              <motion.div
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
              >
                <ChevronDown className="w-4 h-4 text-gray-400 dark:text-gray-500" />
              </motion.div>
            </div>
          </div>
        </div>
        
        
        {/* 简化的边框效果 */}
        <div className="absolute inset-0 rounded-lg border border-gray-200 dark:border-gray-600 opacity-0 transition-opacity duration-300 pointer-events-none"></div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ 
              duration: 0.25, 
              ease: [0.4, 0, 0.2, 1],
              opacity: { duration: 0.2 },
              y: { duration: 0.25 },
              scale: { duration: 0.25 }
            }}
            className="absolute w-full z-[999999]"
            style={dropdownStyle}
          >
            {/* 自定义下拉菜单容器 */}
            <div className="relative simple-select-dropdown">
              {/* 菜单背景 */}
              <div className={`relative bg-white dark:bg-gray-800 rounded-lg shadow-lg max-h-60 overflow-hidden ${styles.dropdown}`}>
                
                {/* 菜单内容 */}
                <div className="relative pt-2 pb-1">
                  {/* 选项列表 */}
                  <div className="max-h-56 overflow-y-auto custom-scrollbar">
                    {options.length > 0 ? (
                      options.map((option) => (
                        <motion.div
                          key={option.value}
                          onClick={() => handleSelect(option)}
                          className={`relative mx-2 mb-1 cursor-pointer transition-all duration-200 group/option ${
                            option.value === value ? styles.selectedOption : styles.option
                          }`}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          transition={{ duration: 0.15, ease: "easeOut" }}
                        >
                          {/* 选项背景 */}
                          <div className={`relative px-4 py-3 rounded-md transition-all duration-200 ${
                            option.value === value 
                              ? 'bg-gray-100 dark:bg-gray-700' 
                              : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                          }`}>
                            
                            {/* 选项内容 */}
                            <div className="flex items-center space-x-3">
                              {showIcon && option.icon && (
                                <div className="flex-shrink-0">
                                  {typeof option.icon === 'string' ? (
                                    <span className="text-lg opacity-80">{option.icon}</span>
                                  ) : (
                                    <option.icon className="w-4 h-4 opacity-80" />
                                  )}
                                </div>
                              )}
                              
                              <span className={`flex-1 min-w-0 text-sm font-medium transition-colors duration-200 ${
                                option.value === value 
                                  ? 'text-blue-700 dark:text-blue-300' 
                                  : 'text-gray-700 dark:text-gray-200 group-hover/option:text-gray-900 dark:group-hover/option:text-gray-100'
                              }`}>
                                {option.label}
                              </span>
                              
                              {/* 选中状态指示器 */}
                              {option.value === value && (
                                <motion.div 
                                  className="flex-shrink-0"
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  transition={{ duration: 0.2, ease: "easeOut" }}
                                >
                                  <div className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full"></div>
                                </motion.div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <div className="px-4 py-6 text-center">
                        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                          <span className="text-2xl opacity-60">📭</span>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">没有可选项</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SimpleSelect;
