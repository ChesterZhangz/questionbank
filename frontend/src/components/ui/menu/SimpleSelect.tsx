import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronDown} from 'lucide-react';
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
  clearable?: boolean;
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
  clearable = true,
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

    // 主题样式
    const themeStyles = {
      blue: {
        button: 'border-blue-200 dark:border-blue-700 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400',
        dropdown: 'border-blue-200 dark:border-blue-700',
        option: 'hover:bg-blue-50 dark:hover:bg-blue-900/30',
        selectedOption: 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-r-2 border-blue-500 dark:border-blue-400'
      },
      green: {
        button: 'border-green-200 dark:border-green-700 focus:ring-green-500 focus:border-green-500 dark:focus:ring-green-400 dark:focus:border-green-400',
        dropdown: 'border-green-200 dark:border-green-700',
        option: 'hover:bg-green-50 dark:hover:bg-green-900/30',
        selectedOption: 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-r-2 border-green-500 dark:border-green-400'
      },
      purple: {
        button: 'border-purple-200 dark:border-purple-700 focus:ring-purple-500 focus:border-purple-500 dark:focus:ring-purple-400 dark:focus:border-purple-400',
        dropdown: 'border-purple-200 dark:border-purple-700',
        option: 'hover:bg-purple-50 dark:hover:bg-purple-900/30',
        selectedOption: 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-r-2 border-purple-500 dark:border-purple-400'
      },
      red: {
        button: 'border-red-200 dark:border-red-700 focus:ring-red-500 focus:border-red-500 dark:focus:ring-red-400 dark:focus:border-red-400',
        dropdown: 'border-red-200 dark:border-red-700',
        option: 'hover:bg-red-50 dark:hover:bg-red-900/30',
        selectedOption: 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-r-2 border-red-500 dark:border-red-400'
      },
      gray: {
        button: 'border-gray-200 dark:border-gray-600 focus:ring-gray-500 focus:border-gray-500 dark:focus:ring-gray-400 dark:focus:border-gray-400',
        dropdown: 'border-gray-200 dark:border-gray-600',
        option: 'hover:bg-gray-50 dark:hover:bg-gray-700',
        selectedOption: 'bg-gray-50 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300 border-r-2 border-gray-500 dark:border-gray-400'
      }
    };

    // 变体样式
    const variantStyles = {
      default: 'bg-white dark:bg-gray-800 shadow-sm dark:shadow-gray-900/20',
      outline: 'bg-transparent border-2',
      filled: 'bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600',
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
      const dropdownHeight = Math.min(options.length * 40 + 20, 240); // 估算下拉菜单高度
      
      // 检查下方空间是否足够
      const spaceBelow = viewportHeight - rect.bottom;
      const spaceAbove = rect.top;
      
      // 如果下方空间不足，则向上展开
      if (spaceBelow < dropdownHeight && spaceAbove > dropdownHeight) {
        setDropdownStyle({
          position: 'absolute',
          bottom: '100%',
          left: 0,
          right: 0,
          marginBottom: '8px',
          zIndex: 999999
        });
      } else {
        // 默认向下展开
        setDropdownStyle({
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          marginTop: '8px',
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

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
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
              <ChevronDown className={`w-4 h-4 text-gray-400 dark:text-gray-500 transition-transform duration-200 ${
                isOpen ? 'rotate-180' : ''
              }`} />
            </div>
          </div>
        </div>
        
        {/* 清除按钮 */}
        {clearable && value && (
          <div
            onClick={handleClear}
            className="absolute right-12 top-1/2 transform -translate-y-1/2 group/clear"
          >
            <div className="relative w-6 h-6 cursor-pointer transition-all duration-200 hover:scale-110">
              {/* 外圈 */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/30 dark:to-red-800/30 border border-red-300 dark:border-red-600"></div>
              {/* 内圈 */}
              <div className="absolute inset-1 rounded-full bg-gradient-to-br from-white to-red-50 dark:from-gray-700 dark:to-red-900/20"></div>
              {/* X符号 */}
              <div className="absolute inset-0 flex items-center justify-center">
                <X className="w-3 h-3 text-red-600 dark:text-red-400 group-hover/clear:text-red-700 dark:group-hover/clear:text-red-300" />
              </div>
            </div>
          </div>
        )}
        
        {/* 自定义渐变边框效果 */}
        <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 opacity-0 transition-opacity duration-300 pointer-events-none"></div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95, rotateX: -15 }}
            animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
            exit={{ opacity: 0, y: -10, scale: 0.95, rotateX: -15 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="absolute w-full z-[999999]"
            style={dropdownStyle}
          >
            {/* 自定义下拉菜单容器 */}
            <div className="relative simple-select-dropdown">
              {/* 菜单背景 */}
              <div className={`relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-h-60 overflow-hidden ${styles.dropdown}`}>
                {/* 顶部装饰条 */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
                
                {/* 菜单内容 */}
                <div className="relative pt-2 pb-1">
                  {/* 选项列表 */}
                  <div className="max-h-56 overflow-y-auto custom-scrollbar">
                    {options.length > 0 ? (
                      options.map((option) => (
                        <div
                          key={option.value}
                          onClick={() => handleSelect(option)}
                          className={`relative mx-2 mb-1 cursor-pointer transition-all duration-200 group/option ${
                            option.value === value ? styles.selectedOption : styles.option
                          }`}
                        >
                          {/* 选项背景 */}
                          <div className={`relative px-4 py-3 rounded-lg transition-all duration-200 ${
                            option.value === value 
                              ? 'bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 shadow-sm' 
                              : 'hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 dark:hover:from-gray-700 dark:hover:to-gray-800'
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
                                <div className="flex-shrink-0">
                                  <div className="relative w-5 h-5">
                                    {/* 外圈 */}
                                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 border-2 border-white dark:border-gray-800"></div>
                                    {/* 内圈 */}
                                    <div className="absolute inset-1 rounded-full bg-gradient-to-br from-blue-400 to-purple-400"></div>
                                    {/* 勾选符号 */}
                                    <div className="absolute inset-0 flex items-center justify-center">
                                      <div className="w-2 h-2 bg-white rounded-full"></div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                            
                            {/* 选项底部装饰线 */}
                            {option.value === value && (
                              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                            )}
                          </div>
                          
                          {/* 悬停效果 */}
                          <div className={`absolute inset-0 rounded-lg bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 opacity-0 transition-opacity duration-200 group-hover/option:opacity-100 pointer-events-none`}></div>
                        </div>
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
                
                {/* 底部装饰条 */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500"></div>
              </div>
              
              {/* 菜单阴影效果 */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-black/5 via-transparent to-black/10 pointer-events-none"></div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SimpleSelect;
