import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { Sun, Moon, Monitor } from 'lucide-react';

interface ThemeToggleProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'button' | 'dropdown' | 'icon';
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ 
  className = '', 
  size = 'md',
  variant = 'button'
}) => {
  const { theme, setTheme, toggleTheme } = useTheme();

  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg'
  };

  const iconSize = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  // 图标按钮版本
  if (variant === 'icon') {
    return (
      <button
        onClick={toggleTheme}
        className={`rounded-full p-2 transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-800 ${sizeClasses[size]} ${className}`}
        title={`当前主题: ${theme === 'light' ? '亮色' : theme === 'dark' ? '暗色' : '跟随系统'}`}
      >
        {theme === 'light' ? (
          <Sun className={iconSize[size]} />
        ) : theme === 'dark' ? (
          <Moon className={iconSize[size]} />
        ) : (
          <Monitor className={iconSize[size]} />
        )}
      </button>
    );
  }

  // 下拉菜单版本
  if (variant === 'dropdown') {
    return (
      <div className={`relative inline-block text-left ${className}`}>
        <button
          onClick={toggleTheme}
          className={`inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 ${sizeClasses[size]}`}
        >
          {theme === 'light' ? (
            <>
              <Sun className={`mr-2 ${iconSize[size]}`} />
              亮色
            </>
          ) : theme === 'dark' ? (
            <>
              <Moon className={`mr-2 ${iconSize[size]}`} />
              暗色
            </>
          ) : (
            <>
              <Monitor className={`mr-2 ${iconSize[size]}`} />
              系统
            </>
          )}
        </button>
      </div>
    );
  }

  // 默认按钮版本
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <button
        onClick={() => setTheme('light')}
        className={`flex items-center justify-center rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ${
          theme === 'light'
            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
            : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
        } ${sizeClasses[size]}`}
        title="亮色主题"
      >
        <Sun className={`mr-2 ${iconSize[size]}`} />
        亮色
      </button>

      <button
        onClick={() => setTheme('dark')}
        className={`flex items-center justify-center rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ${
          theme === 'dark'
            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
            : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
        } ${sizeClasses[size]}`}
        title="暗色主题"
      >
        <Moon className={`mr-2 ${iconSize[size]}`} />
        暗色
      </button>

      <button
        onClick={() => setTheme('auto')}
        className={`flex items-center justify-center rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ${
          theme === 'auto'
            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
            : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
        } ${sizeClasses[size]}`}
        title="跟随系统"
      >
        <Monitor className={`mr-2 ${iconSize[size]}`} />
        系统
      </button>
    </div>
  );
};

export default ThemeToggle;
