import { LaTeXRenderer } from '../renderer/LaTeXRenderer';
import type { RenderConfig } from '../types';
import '../styles/renderPreview.css';

// 全局渲染器实例
const renderer = new LaTeXRenderer({
  mode: 'full',
  features: {
    markdown: true,
    questionSyntax: true,
    autoNumbering: true,
    errorHandling: 'lenient'
  },
  cache: {
    enabled: true,
    maxSize: 200
  }
});

// 轻量级渲染器实例
const lightweightRenderer = new LaTeXRenderer({
  mode: 'lightweight',
  features: {
    markdown: false,
    questionSyntax: true,
    autoNumbering: false,
    errorHandling: 'lenient'
  },
  cache: {
    enabled: true,
    maxSize: 100
  }
});

/**
 * 渲染LaTeX内容（完整模式）
 * @param content 要渲染的内容
 * @param config 可选的渲染配置
 * @returns 渲染后的HTML字符串
 */
export const renderContent = (content: string, config?: Partial<RenderConfig>): string => {
  if (!content || content.trim() === '') {
    return '';
  }

  try {
    const rendererInstance = config ? new LaTeXRenderer(config) : renderer;
    const result = rendererInstance.render(content);
    return result.html;
  } catch (error) {
    console.error('LaTeX渲染错误:', error);
    return content; // 返回原始内容
  }
};

/**
 * 渲染LaTeX内容（轻量级模式）
 * @param content 要渲染的内容
 * @returns 渲染后的HTML字符串
 */
export const renderContentLightweight = (content: string): string => {
  if (!content || content.trim() === '') {
    return '';
  }

  try {
    const result = lightweightRenderer.render(content);
    return result.html;
  } catch (error) {
    console.error('LaTeX渲染错误:', error);
    return content; // 返回原始内容
  }
};

/**
 * 兼容旧版本的renderContentWithCache函数
 * @param content 要渲染的内容
 * @returns 渲染后的HTML字符串
 */
export const renderContentWithCache = (content: string): string => {
  return renderContent(content);
};

/**
 * 渲染搜索结果显示
 * @param content 要渲染的内容
 * @param maxLength 最大长度
 * @returns 渲染后的HTML字符串
 */
export const renderSearchContent = (content: string, maxLength: number = 100): string => {
  if (!content || content.trim() === '') {
    return '';
  }

  const truncatedContent = content.length > maxLength 
    ? content.substring(0, maxLength) + '...'
    : content;

  return renderContentLightweight(truncatedContent);
}; 