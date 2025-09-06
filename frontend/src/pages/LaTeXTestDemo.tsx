import React, { useState } from 'react';
import { WYSIWYGEditorWithToolbar } from '../components/editor/markdown/WYSIWYGEditorWithToolbar';

const LaTeXTestDemo: React.FC = () => {
  const [content, setContent] = useState('');

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
  };

  const insertTestContent = () => {
    const testContent = `
      <p>这是一个LaTeX测试页面：</p>
      <p>行内公式：$x^2 + y^2 = z^2$</p>
      <p>块级公式：</p>
      <div class="latex-container latex-block" data-latex="\\frac{a}{b} = \\frac{c}{d}" data-display-mode="true">
        <span class="latex-edit" contenteditable="true" style="display: none;">$$\\frac{a}{b} = \\frac{c}{d}$$</span>
        <span class="latex-render" style="display: inline-block;"></span>
      </div>
      <p>更多测试：</p>
      <p>积分：$\\int_0^\\infty e^{-x} dx$</p>
      <p>矩阵：</p>
      <div class="latex-container latex-block" data-latex="\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}" data-display-mode="true">
        <span class="latex-edit" contenteditable="true" style="display: none;">$$\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}$$</span>
        <span class="latex-render" style="display: inline-block;"></span>
      </div>
    `;
    setContent(testContent);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">LaTeX渲染测试</h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex gap-4 mb-4">
            <button
              onClick={insertTestContent}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              插入测试内容
            </button>
            <button
              onClick={() => setContent('')}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
            >
              清空内容
            </button>
          </div>
          
          <div className="border border-gray-300 rounded-lg">
            <WYSIWYGEditorWithToolbar
              value={content}
              onChange={handleContentChange}
              placeholder="在这里输入内容，或者点击'插入测试内容'按钮..."
              showToolbar={true}
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">使用说明：</h2>
          <ul className="space-y-2 text-gray-700">
            <li>• 点击数学公式按钮（∑）或按 <kbd className="px-2 py-1 bg-gray-200 rounded text-sm">Ctrl+M</kbd> 插入数学公式</li>
            <li>• 直接输入 <code className="px-1 py-0.5 bg-gray-100 rounded text-sm">$...$</code> 或 <code className="px-1 py-0.5 bg-gray-100 rounded text-sm">$$...$$</code> 会自动转换</li>
            <li>• 点击数学公式区域进入编辑模式，显示LaTeX源码</li>
            <li>• 按 <kbd className="px-2 py-1 bg-gray-200 rounded text-sm">Enter</kbd> 或 <kbd className="px-2 py-1 bg-gray-200 rounded text-sm">Escape</kbd> 退出编辑模式</li>
            <li>• 失去焦点时自动切换到渲染模式</li>
          </ul>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">当前HTML内容：</h2>
          <pre className="bg-gray-100 p-4 rounded-lg overflow-auto text-sm">
            {content || '(空内容)'}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default LaTeXTestDemo;
