import React, { useState } from 'react';
import { QuestionMediaManager } from '../components/question/QuestionMediaManager';
import type { QuestionImage } from '../components/question/QuestionImageManager';
import type { TikZCode } from '../components/tikz/core/TikZEditor';

const QuestionMediaDemo: React.FC = () => {
  const [images, setImages] = useState<QuestionImage[]>([
    {
      id: 'demo-img-1',
      bid: 'demo-bank',
      order: 0,
      format: 'png',
      uploadedAt: new Date(),
      uploadedBy: 'demo-user',
      filename: 'demo-image-1.png',
      url: 'https://via.placeholder.com/300x200/4F46E5/FFFFFF?text=Demo+Image+1'
    },
    {
      id: 'demo-img-2',
      bid: 'demo-bank',
      order: 1,
      format: 'jpg',
      uploadedAt: new Date(),
      uploadedBy: 'demo-user',
      filename: 'demo-image-2.jpg',
      url: 'https://via.placeholder.com/300x200/10B981/FFFFFF?text=Demo+Image+2'
    }
  ]);

  const [tikzCodes, setTikZCodes] = useState<TikZCode[]>([
    {
      id: 'demo-tikz-1',
      bid: 'demo-bank',
      code: `\\begin{tikzpicture}
\\draw[thick, blue] (0,0) circle (1cm);
\\draw[thick, red] (2,0) circle (1cm);
\\draw[thick, green] (1,1.5) circle (1cm);
\\end{tikzpicture}`,
      order: 0,
      format: 'svg',
      createdAt: new Date(),
      createdBy: 'demo-user',
      // preview字段已移除，使用前端实时渲染
    },
    {
      id: 'demo-tikz-2',
      bid: 'demo-bank',
      code: `\\begin{tikzpicture}
\\draw[thick, blue] (0,0) rectangle (2,1);
\\draw[thick, red] (2.5,0) rectangle (4.5,1);
\\draw[thick, green] (1,1.5) rectangle (3,2.5);
\\end{tikzpicture}`,
      order: 1,
      format: 'svg',
      createdAt: new Date(),
      createdBy: 'demo-user',
      // preview字段已移除，使用前端实时渲染
    }
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部 */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-3xl font-bold text-gray-900">题目媒体管理演示</h1>
            <p className="mt-2 text-lg text-gray-600">
              体验图片上传和TikZ图形编辑功能
            </p>
          </div>
        </div>
      </div>

      {/* 主要内容 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <QuestionMediaManager
          questionId="demo-question-001"
          images={images}
          tikzCodes={tikzCodes}
          onImagesChange={setImages}
          onTikZCodesChange={setTikZCodes}
        />
      </div>

      {/* 功能说明 */}
      <div className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">功能特性</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">图片管理</h3>
                <p className="text-gray-600 text-sm">
                  支持拖拽上传、批量处理、格式转换和智能压缩
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">TikZ编辑</h3>
                <p className="text-gray-600 text-sm">
                  代码编辑器、语法高亮、实时预览和智能编译
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">智能预览</h3>
                <p className="text-gray-600 text-sm">
                  模拟渲染、真实编译、格式转换和响应式显示
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionMediaDemo;
