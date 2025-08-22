import React, { useState, useCallback } from 'react';
import { 
  Code, 
  Download, 
  Maximize2,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { cn } from '../../../lib/utils';

export interface TikZCode {
  id: string;
  bid: string;
  code: string;
  order: number;
  format: 'svg' | 'png';
  createdAt: Date;
  createdBy: string;
  preview?: string;
}

interface TikZRendererProps {
  tikzCode: TikZCode;
  className?: string;
  showControls?: boolean;
  onRegenerate?: (tikzId: string) => void;
}

export const TikZRenderer: React.FC<TikZRendererProps> = ({
  tikzCode,
  className,
  showControls = true,
  onRegenerate
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);


  // 模拟渲染TikZ代码
  const simulateTikZRender = useCallback(async (code: string, format: 'svg' | 'png') => {
    setIsLoading(true);
    setError(null);

    try {
      // 模拟渲染延迟
      await new Promise(resolve => setTimeout(resolve, 1500));

      // 分析TikZ代码并生成模拟图形
      const hasCircles = code.includes('\\draw') && code.includes('circle');
      const hasRectangles = code.includes('\\draw') && code.includes('rectangle');
      const hasLines = code.includes('\\draw') && code.includes('--');
      const hasNodes = code.includes('\\node');
      
      // 根据代码内容生成不同的模拟图形
      let svgContent = '';
      
      if (hasCircles) {
        svgContent = generateCircleSimulation(code, format);
      } else if (hasRectangles) {
        svgContent = generateRectangleSimulation(code, format);
      } else if (hasLines) {
        svgContent = generateLineSimulation(code, format);
      } else if (hasNodes) {
        svgContent = generateNodeSimulation(code, format);
      } else {
        svgContent = generateGenericSimulation(code, format);
      }

      return svgContent;
    } catch (err) {
      throw new Error('模拟渲染失败');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 生成圆形模拟图形
  const generateCircleSimulation = (code: string, format: 'svg' | 'png') => {
    const circleMatches = code.match(/circle\s*\[([^\]]*)\]/g) || [];
    const radiusMatches = code.match(/r\s*=\s*(\d+\.?\d*)/g) || [];
    
    let circles = [];
    for (let i = 0; i < Math.min(circleMatches.length, 5); i++) {
      const x = 50 + i * 80;
      const y = 75;
      const r = radiusMatches[i] ? parseFloat(radiusMatches[i].match(/r\s*=\s*(\d+\.?\d*)/)?.[1] || '20') : 20;
      
      circles.push(`<circle cx="${x}" cy="${y}" r="${r}" fill="hsl(${i * 60}, 70%, 60%)" opacity="0.8"/>`);
    }

    return `
      <svg width="400" height="150" xmlns="http://www.w3.org/2000/svg">
        <rect width="400" height="150" fill="#f8f9fa"/>
        ${circles.join('\n        ')}
        <text x="200" y="140" text-anchor="middle" font-size="12" fill="#666">
          模拟圆形图形 (${format.toUpperCase()})
        </text>
      </svg>
    `;
  };

  // 生成矩形模拟图形
  const generateRectangleSimulation = (code: string, format: 'svg' | 'png') => {
    const rectMatches = code.match(/rectangle/g) || [];
    
    let rectangles = [];
    for (let i = 0; i < Math.min(rectMatches.length, 4); i++) {
      const x = 30 + i * 90;
      const y = 30;
      const width = 60;
      const height = 40;
      
      rectangles.push(`<rect x="${x}" y="${y}" width="${width}" height="${height}" fill="hsl(${i * 90}, 70%, 60%)" opacity="0.8"/>`);
    }

    return `
      <svg width="400" height="150" xmlns="http://www.w3.org/2000/svg">
        <rect width="400" height="150" fill="#f8f9fa"/>
        ${rectangles.join('\n        ')}
        <text x="200" y="140" text-anchor="middle" font-size="12" fill="#666">
          模拟矩形图形 (${format.toUpperCase()})
        </text>
      </svg>
    `;
  };

  // 生成线条模拟图形
  const generateLineSimulation = (code: string, format: 'svg' | 'png') => {
    const lineMatches = code.match(/--/g) || [];
    
    let lines = [];
    for (let i = 0; i < Math.min(lineMatches.length, 6); i++) {
      const x1 = 30 + i * 60;
      const y1 = 30 + (i % 2) * 60;
      const x2 = x1 + 40;
      const y2 = y1 + 40;
      
      lines.push(`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="hsl(${i * 45}, 70%, 50%)" stroke-width="3"/>`);
    }

    return `
      <svg width="400" height="150" xmlns="http://www.w3.org/2000/svg">
        <rect width="400" height="150" fill="#f8f9fa"/>
        ${lines.join('\n        ')}
        <text x="200" y="140" text-anchor="middle" font-size="12" fill="#666">
          模拟线条图形 (${format.toUpperCase()})
        </text>
      </svg>
    `;
  };

  // 生成节点模拟图形
  const generateNodeSimulation = (code: string, format: 'svg' | 'png') => {
    const nodeMatches = code.match(/\\node/g) || [];
    
    let nodes = [];
    for (let i = 0; i < Math.min(nodeMatches.length, 5); i++) {
      const x = 50 + i * 70;
      const y = 75;
      const text = `N${i + 1}`;
      
      nodes.push(`
        <circle cx="${x}" cy="${y}" r="25" fill="hsl(${i * 72}, 70%, 70%)" opacity="0.8"/>
        <text x="${x}" y="${y + 4}" text-anchor="middle" font-size="14" font-weight="bold" fill="white">${text}</text>
      `);
    }

    return `
      <svg width="400" height="150" xmlns="http://www.w3.org/2000/svg">
        <rect width="400" height="150" fill="#f8f9fa"/>
        ${nodes.join('\n        ')}
        <text x="200" y="140" text-anchor="middle" font-size="12" fill="#666">
          模拟节点图形 (${format.toUpperCase()})
        </text>
      </svg>
    `;
  };

  // 生成通用模拟图形
  const generateGenericSimulation = (_code: string, format: 'svg' | 'png') => {
    return `
      <svg width="400" height="150" xmlns="http://www.w3.org/2000/svg">
        <rect width="400" height="150" fill="#f8f9fa"/>
        <circle cx="100" cy="75" r="30" fill="blue" opacity="0.7"/>
        <rect x="200" y="45" width="60" height="60" fill="red" opacity="0.7"/>
        <line x1="300" y1="45" x2="350" y2="105" stroke="green" stroke-width="4"/>
        <text x="200" y="140" text-anchor="middle" font-size="12" fill="#666">
          通用模拟图形 (${format.toUpperCase()})
        </text>
      </svg>
    `;
  };

  // 处理模拟渲染
  const handleSimulateRender = useCallback(async () => {
    try {


      // 这里可以将模拟结果保存到tikzCode.preview
    } catch (err) {
      setError(err instanceof Error ? err.message : '渲染失败');
    }
  }, [tikzCode.code, tikzCode.format, simulateTikZRender]);

  // 处理真实渲染（调用后端API）
  const handleRealRender = useCallback(async () => {
    if (!onRegenerate) return;
    
    try {

      setIsLoading(true);
      onRegenerate(tikzCode.id);
    } catch (err) {
      setError('真实渲染失败');
    } finally {
      setIsLoading(false);
    }
  }, [tikzCode.id, onRegenerate]);

  // 下载图片
  const handleDownload = useCallback(() => {
    if (!tikzCode.preview) return;
    
    const link = document.createElement('a');
    link.href = tikzCode.preview;
    link.download = `tikz_${tikzCode.id}.${tikzCode.format}`;
    link.click();
  }, [tikzCode.preview, tikzCode.id, tikzCode.format]);

  // 切换全屏模式
  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(!isFullscreen);
  }, [isFullscreen]);

  // 渲染状态指示器
  const renderStatusIndicator = () => {
    if (isLoading) {
      return (
        <div className="flex items-center space-x-2 text-blue-600">
          <Clock className="w-4 h-4" />
          <span className="text-sm">渲染中...</span>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center space-x-2 text-red-600">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm">{error}</span>
        </div>
      );
    }

    if (tikzCode.preview) {
      return (
        <div className="flex items-center space-x-2 text-green-600">
          <CheckCircle className="w-4 h-4" />
          <span className="text-sm">渲染完成</span>
        </div>
      );
    }

    return (
      <div className="flex items-center space-x-2 text-gray-500">
        <Code className="w-4 h-4" />
        <span className="text-sm">等待渲染</span>
      </div>
    );
  };

  return (
    <div className={cn("relative", className)}>
      {/* 渲染状态 */}
      <div className="mb-3">
        {renderStatusIndicator()}
      </div>

      {/* 渲染区域 */}
      <div className={cn(
        "border border-gray-200 rounded-lg overflow-hidden bg-white",
        isFullscreen && "fixed inset-0 z-50 bg-white"
      )}>
        {/* 头部工具栏 */}
        {showControls && (
          <div className="flex items-center justify-between p-3 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">
                TikZ #{tikzCode.order + 1}
              </span>
              <span className="text-xs text-gray-500">
                {tikzCode.format.toUpperCase()} 格式
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              {/* 模拟渲染按钮 */}
              <button
                onClick={handleSimulateRender}
                disabled={isLoading}
                className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 disabled:opacity-50"
                title="模拟渲染"
              >
                模拟渲染
              </button>
              
              {/* 真实渲染按钮 */}
              {onRegenerate && (
                <button
                  onClick={handleRealRender}
                  disabled={isLoading}
                  className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 disabled:opacity-50"
                  title="真实渲染"
                >
                  真实渲染
                </button>
              )}
              
              {/* 下载按钮 */}
              {tikzCode.preview && (
                <button
                  onClick={handleDownload}
                  className="p-1 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded"
                  title="下载图片"
                >
                  <Download className="w-4 h-4" />
                </button>
              )}
              
              {/* 全屏按钮 */}
              <button
                onClick={toggleFullscreen}
                className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                title={isFullscreen ? "退出全屏" : "全屏显示"}
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* 图片显示区域 */}
        <div className="p-4">
          {tikzCode.preview ? (
            <div className="flex justify-center">
              <img
                src={tikzCode.preview}
                alt={`TikZ图形 ${tikzCode.id}`}
                className={cn(
                  "max-w-full object-contain",
                  isFullscreen ? "max-h-screen" : "max-h-96"
                )}
              />
            </div>
          ) : (
            <div className="h-64 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
              <div className="text-center text-gray-400">
                <Code className="mx-auto h-12 w-12 mb-2" />
                <p className="text-sm">点击渲染按钮生成图形</p>
                <p className="text-xs mt-1">支持模拟渲染和真实渲染</p>
              </div>
            </div>
          )}
        </div>

        {/* 错误信息 */}
        {error && (
          <div className="px-4 pb-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <span className="text-sm text-red-700">{error}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 渲染模式说明 */}
      {showControls && (
        <div className="mt-3 text-xs text-gray-500">
          <p>
            <span className="font-medium">模拟渲染:</span> 基于代码分析生成模拟图形，无需后端支持
          </p>
          <p>
            <span className="font-medium">真实渲染:</span> 调用后端LaTeX编译，生成真实的TikZ图形
          </p>
        </div>
      )}
    </div>
  );
};
