import React from 'react';
import { renderContentLightweight } from '../../lib/latex/utils/renderContent';
import './SearchResultDisplay.css';

interface SearchResultDisplayProps {
  content: string;
  maxLength?: number;
  className?: string;
}

// 缓存系统
const renderCache = new Map<string, string>();
const CACHE_SIZE_LIMIT = 50;

// 清理缓存函数
const cleanCache = () => {
  if (renderCache.size > CACHE_SIZE_LIMIT) {
    const entries = Array.from(renderCache.entries());
    const toDelete = Math.floor(CACHE_SIZE_LIMIT * 0.2);
    entries.slice(0, toDelete).forEach(([key]) => renderCache.delete(key));
  }
};

// 渲染LaTeX内容的核心函数
const renderLaTeXContent = (text: string): string => {
  if (!text) return '';
  
  // 检查缓存
  if (renderCache.has(text)) {
    return renderCache.get(text)!;
  }
  
  // 使用新的渲染函数
  const result = renderContentLightweight(text);
  
  // 缓存结果
  renderCache.set(text, result);
  cleanCache();
  
  return result;
};

const SearchResultDisplay: React.FC<SearchResultDisplayProps> = ({
  content,
  maxLength = 100,
  className = ''
}) => {
  const processedContent = React.useMemo(() => {
    if (!content) return '';
    
    // 先截取内容
    const truncatedContent = content.length > maxLength 
      ? content.substring(0, maxLength) + '...'
      : content;
    
    // 然后渲染LaTeX
    return renderLaTeXContent(truncatedContent);
  }, [content, maxLength]);

  return (
    <div 
      className={`search-result-content ${className}`}
      dangerouslySetInnerHTML={{ __html: processedContent }}
    />
  );
};

export default SearchResultDisplay; 