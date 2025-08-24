import React, { useState, useCallback } from 'react';
import { Code } from 'lucide-react';
import { GradientEngine } from '../features/colors/GradientEngine';
import { PatternFiller } from '../features/effects/PatternFiller';
import { ShadowRenderer } from '../features/effects/ShadowRenderer';
import { TikZFunctionRenderer } from '../features/plotting/TikZFunctionRenderer';
import { TikZForeachUtils, type ForeachContext } from '../utils/TikZForeachUtils';
import { TikZStyleParser } from '../utils/TikZStyleParser';
import { TikZGeometryParser } from '../utils/TikZGeometryParser';


export interface TikZPreviewProps {
  code: string;
  format?: 'svg' | 'png';
  width?: number;
  height?: number;
  showGrid?: boolean;
  showTitle?: boolean;
  className?: string;
  onRender?: (svgContent: string) => void;
}

// TikZ模拟渲染器
class TikZSimulator {
  private width: number;
  private height: number;
  private elements: any[] = [];
  private rawElements: any[] = []; // 存储原始坐标的元素
  private coordinateRange: { minX: number, maxX: number, minY: number, maxY: number } | null = null;
  private adaptiveScale: number = 1;
  private showGrid: boolean;
  private showTitle: boolean;
  private functionRenderer: TikZFunctionRenderer;
  private foreachStack: Array<ForeachContext> = [];


  constructor(width: number = 500, height: number = 500, showGrid: boolean = true, showTitle: boolean = true) {
    this.width = width;
    this.height = height;
    this.showGrid = showGrid;
    this.showTitle = showTitle;
    
    // 初始化TikZ函数渲染器
    this.functionRenderer = new TikZFunctionRenderer({
      width,
      height,
      showGrid
    });
  }

  // 解析TikZ代码并生成SVG
  parseAndRender(code: string): string {
    this.elements = [];
    this.foreachStack = [];
    
    try {
      // 首先检查是否包含函数绘制代码或pgfplots轴环境
      // 只有明确包含函数绘制或轴环境时才使用TikZFunctionRenderer
      if (code.includes('plot') || code.includes('\\addplot') || code.includes('\\begin{axis}')) {
        const svgContent = this.functionRenderer.parseAndRender(code);
        if (svgContent) {
          return svgContent;
        }
      }
      
      // 否则使用传统TikZ解析
    const lines = code.split('\n');
    
      for (let lineNumber = 0; lineNumber < lines.length; lineNumber++) {
        const line = lines[lineNumber];
      const trimmedLine = line.trim();
      
      if (!trimmedLine || trimmedLine.startsWith('%')) {
        continue;
      }
      
      try {
          // 检查是否有待处理的foreach命令
          if (this.foreachStack.length > 0) {
            this.processForeachCommand(trimmedLine, lineNumber);
            continue;
          }
          
          // 解析 \foreach 命令
          if (TikZForeachUtils.containsForeach(trimmedLine)) {
            const foreachContext = TikZForeachUtils.parseForeach(trimmedLine, lineNumber);
            if (foreachContext) {
              // 总是存储foreach信息，等待下一行的命令
              this.foreachStack.push(foreachContext);
            }
            continue;
          }
          
        // 解析 \draw 命令
        if (trimmedLine.includes('\\draw')) {
          this.parseDrawCommand(trimmedLine, lineNumber);
        }
        // 解析 \fill 命令
        else if (trimmedLine.includes('\\fill')) {
          this.parseFillCommand(trimmedLine, lineNumber);
        }
        // 解析 \node 命令
        else if (trimmedLine.includes('\\node')) {
          this.parseNodeCommand(trimmedLine, lineNumber);
        }
        // 解析 \coordinate 命令
        else if (trimmedLine.includes('\\coordinate')) {
          this.parseCoordinateCommand(trimmedLine, lineNumber);
        }
        // 解析 \path 命令
        else if (trimmedLine.includes('\\path')) {
          this.parsePathCommand(trimmedLine, lineNumber);
        }
        // 解析 \shade 命令
        else if (trimmedLine.includes('\\shade')) {
          this.parseShadeCommand(trimmedLine, lineNumber);
        }
          // 解析 \begin{tikzpicture} 和 \end{tikzpicture}
          else if (trimmedLine.includes('\\begin{tikzpicture}')) {
            // 开始新的TikZ图形
            this.elements = [];
          }
          else if (trimmedLine.includes('\\end{tikzpicture}')) {
            // 结束TikZ图形
            break;
        }
      } catch (error) {
          console.warn(`第${lineNumber + 1}行解析失败:`, error);
          continue;
        }
      }
      
      // 解析完成后，计算自适应缩放并转换所有元素
      this.calculateAdaptiveScaling();
      this.transformAllElements();
      
      return this.generateSVG();
    } catch (error) {
      console.error('TikZ解析失败:', error);
      return this.generateErrorSVG(error instanceof Error ? error.message : String(error));
    }
  }

  // 计算自适应缩放因子
  private calculateAdaptiveScaling() {
    if (this.rawElements.length === 0) {
      this.adaptiveScale = Math.min(this.width / 8, this.height / 6); // 默认缩放
      this.coordinateRange = { minX: -2, maxX: 2, minY: -2, maxY: 2 };
      return;
    }

    // 收集所有坐标点
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;

    for (const element of this.rawElements) {
      switch (element.type) {
        case 'path':
          for (const point of element.points) {
            minX = Math.min(minX, point.x);
            maxX = Math.max(maxX, point.x);
            minY = Math.min(minY, point.y);
            maxY = Math.max(maxY, point.y);
          }
          break;
        case 'circle':
          minX = Math.min(minX, element.x - element.radius);
          maxX = Math.max(maxX, element.x + element.radius);
          minY = Math.min(minY, element.y - element.radius);
          maxY = Math.max(maxY, element.y + element.radius);
          break;
        case 'rectangle':
          minX = Math.min(minX, element.x);
          maxX = Math.max(maxX, element.x + element.width);
          minY = Math.min(minY, element.y);
          maxY = Math.max(maxY, element.y + element.height);
          break;
        case 'ellipse':
          minX = Math.min(minX, element.x - element.rx);
          maxX = Math.max(maxX, element.x + element.rx);
          minY = Math.min(minY, element.y - element.ry);
          maxY = Math.max(maxY, element.y + element.ry);
          break;
        case 'text':
          minX = Math.min(minX, element.x);
          maxX = Math.max(maxX, element.x);
          minY = Math.min(minY, element.y);
          maxY = Math.max(maxY, element.y);
          break;
      }
    }

    // 如果没有找到有效坐标，使用默认值
    if (minX === Infinity) {
      minX = -2; maxX = 2; minY = -2; maxY = 2;
    }

    // 存储坐标范围
    this.coordinateRange = { minX, maxX, minY, maxY };

    // 计算内容的实际尺寸
    const contentWidth = maxX - minX;
    const contentHeight = maxY - minY;

    // 如果内容尺寸为0，使用默认缩放
    if (contentWidth === 0 && contentHeight === 0) {
      this.adaptiveScale = Math.min(this.width / 8, this.height / 6);
      return;
    }

    // 计算适合的缩放因子，留出边距
    const margin = 40; // 边距
    const availableWidth = this.width - 2 * margin;
    const availableHeight = this.height - 2 * margin;

    let scaleX = contentWidth > 0 ? availableWidth / contentWidth : Infinity;
    let scaleY = contentHeight > 0 ? availableHeight / contentHeight : Infinity;

    // 使用较小的缩放因子以确保所有内容都能显示
    this.adaptiveScale = Math.min(scaleX, scaleY);

    // 限制缩放范围，避免过大或过小
    this.adaptiveScale = Math.max(1, Math.min(this.adaptiveScale, 200));
  }

  // 转换所有原始元素到最终元素
  private transformAllElements() {
    if (!this.coordinateRange) return;

    const { minX, maxX, minY, maxY } = this.coordinateRange;
    const centerX = this.width / 2;
    const centerY = this.height / 2;
    
    // 计算内容中心点
    const contentCenterX = (minX + maxX) / 2;
    const contentCenterY = (minY + maxY) / 2;

    for (const rawElement of this.rawElements) {
      switch (rawElement.type) {
        case 'path':
          const transformedPoints = rawElement.points.map((point: any) => ({
            x: centerX + (point.x - contentCenterX) * this.adaptiveScale,
            y: centerY - (point.y - contentCenterY) * this.adaptiveScale // Y轴翻转
          }));
          this.elements.push({
            ...rawElement,
            points: transformedPoints
          });
          break;
        case 'circle':
          this.elements.push({
            ...rawElement,
            x: centerX + (rawElement.x - contentCenterX) * this.adaptiveScale,
            y: centerY - (rawElement.y - contentCenterY) * this.adaptiveScale,
            radius: rawElement.radius * this.adaptiveScale
          });
          break;
        case 'rectangle':
          this.elements.push({
            ...rawElement,
            x: centerX + (rawElement.x - contentCenterX) * this.adaptiveScale,
            y: centerY - (rawElement.y - contentCenterY) * this.adaptiveScale,
            width: rawElement.width * this.adaptiveScale,
            height: rawElement.height * this.adaptiveScale
          });
          break;
        case 'ellipse':
          this.elements.push({
            ...rawElement,
            x: centerX + (rawElement.x - contentCenterX) * this.adaptiveScale,
            y: centerY - (rawElement.y - contentCenterY) * this.adaptiveScale,
            rx: rawElement.rx * this.adaptiveScale,
            ry: rawElement.ry * this.adaptiveScale
          });
          break;
        case 'text':
          // 计算基础位置
          const baseX = centerX + (rawElement.x - contentCenterX) * this.adaptiveScale;
          const baseY = centerY - (rawElement.y - contentCenterY) * this.adaptiveScale;
          
          // 如果有位置调整信息，应用它
          let finalX = baseX;
          let finalY = baseY;
          if (rawElement.position) {
            const adjustedPos = this.adjustNodePosition(baseX, baseY, rawElement.position);
            finalX = adjustedPos.x;
            finalY = adjustedPos.y;
          }
          
          this.elements.push({
            ...rawElement,
            x: finalX,
            y: finalY
          });
          break;
        default:
          // 对于其他类型，直接复制
          this.elements.push(rawElement);
          break;
      }
    }
  }

  // 解析 \draw 命令
  private parseDrawCommand(line: string, lineNumber: number) {
    try {
      // 提取样式
      const styleMatch = line.match(/\\draw\[([^\]]*)\]/);
      const style = styleMatch ? styleMatch[1] : '';
      
      // 解析路径
      if (line.includes('grid')) {
        this.parseGrid(line, style, lineNumber);
      } else if (line.includes('--')) {
        this.parseLinePath(line, style, lineNumber);
      } else if (line.includes('circle')) {
        this.parseCircle(line, style);
      } else if (line.includes('rectangle')) {
        this.parseRectangle(line, style);
      } else if (line.includes('ellipse')) {
        this.parseEllipse(line, style);
      } else if (line.includes('parabola')) {
        this.parseParabola(line, style);
      } else if (line.includes('arc')) {
        this.parseArc(line, style);
      } else {
        // 尝试解析其他类型的绘制命令
        this.parseGenericDraw(line, style);
      }
    } catch (error) {
      // 错误日志已清理
      throw new Error(`第${lineNumber}行: \\draw命令解析失败`);
    }
  }

  // 解析直线路径
  private parseLinePath(line: string, style: string, lineNumber: number) {
    // 首先检查是否有内嵌的node
    const inlineNodes = this.parseInlineNodes(line, lineNumber);
    
    // 移除node部分，只保留路径
    const pathOnly = line.replace(/node\s*(?:\[([^\]]*)\])?\s*\{([^}]+)\}/g, '');
    
    const coordMatches = pathOnly.match(/\(([^)]+)\)/g);
    if (coordMatches && coordMatches.length >= 2) {
      const points = coordMatches.map((coord, index) => {
        try {
          const [x, y] = coord.replace(/[()]/g, '').split(',').map(s => parseFloat(s.trim()));
          if (isNaN(x) || isNaN(y)) {
            throw new Error(`坐标值无效: ${coord}`);
          }
          
          // 存储原始坐标
          return { x, y };
        } catch (error) {
          throw new Error(`第${index + 1}个坐标解析失败: ${coord}`);
        }
      });
      
      // 添加到原始元素数组
      this.rawElements.push({
        type: 'path',
        points,
        style: TikZStyleParser.parseDrawOptions(style)
      });
      
      // 添加内嵌节点元素
      inlineNodes.forEach(node => {
        this.rawElements.push(node);
      });
    } else {
      // 警告日志已清理
    }
  }

  // 解析内嵌节点
  private parseInlineNodes(line: string, lineNumber: number) {
    const nodes: any[] = [];
    
    // 首先提取所有坐标
    const coordMatches = line.match(/\(([^)]+)\)/g);
    if (!coordMatches || coordMatches.length < 1) {
      return nodes;
    }
    
    // 更智能地匹配 node[position]{text} 模式，处理嵌套大括号
    const nodeMatches = this.extractNodesWithPositions(line);
    
    for (const nodeInfo of nodeMatches) {
      try {
        const { positionStr, text, nodeIndex } = nodeInfo;
        
        // 确定节点应该放在哪个坐标上
        // 根据节点在命令中的位置来决定使用哪个坐标
        let coordIndex = 0;
        
        // 分析节点在命令中的位置
        const beforeNode = line.substring(0, nodeIndex);
        const coordsBeforeNode = (beforeNode.match(/\(([^)]+)\)/g) || []).length;
        
        if (coordsBeforeNode > 0) {
          // 如果节点前面有坐标，使用最后一个坐标
          coordIndex = Math.min(coordsBeforeNode - 1, coordMatches.length - 1);
        } else {
          // 如果节点在第一个坐标前，使用第一个坐标
          coordIndex = 0;
        }
        
        const coordStr = coordMatches[coordIndex];
        const [x, y] = coordStr.replace(/[()]/g, '').split(',').map(s => parseFloat(s.trim()));
        
        if (isNaN(x) || isNaN(y)) {
          console.warn(`第${lineNumber}行: 内嵌节点坐标值无效: (${x},${y})`);
          continue;
        }
        
        // 解析位置参数
        const position = this.parseNodePosition(positionStr || '');
        
        const parsedText = this.parseNodeText(text);
        // 数字使用更小的字体，数学符号使用正常字体
        const fontSize = parsedText.isNumber ? '12px' : (parsedText.isMath ? '14px' : '14px');
        
        // 存储原始坐标，位置调整将在transformAllElements中处理
        nodes.push({
          type: 'text',
          x: x,
          y: y,
          text: parsedText.content,
          italic: parsedText.hasItalic,
          position: position, // 保存位置信息用于后续调整
          style: { fill: this.getTextColor(), fontSize: fontSize, ...position.style }
        });
      } catch (error) {
        console.warn(`第${lineNumber}行: 内嵌节点解析失败:`, error);
      }
    }
    
    return nodes;
  }

  // 提取节点信息，包括位置信息，处理嵌套大括号
  private extractNodesWithPositions(line: string): Array<{positionStr: string, text: string, nodeIndex: number}> {
    const results: Array<{positionStr: string, text: string, nodeIndex: number}> = [];
    
    // 使用更精确的方法来匹配节点，处理嵌套大括号
    let index = 0;
    while (index < line.length) {
      const nodeStart = line.indexOf('node', index);
      if (nodeStart === -1) break;
      
      let currentIndex = nodeStart + 4; // 跳过 'node'
      
      // 跳过空白字符
      while (currentIndex < line.length && /\s/.test(line[currentIndex])) {
        currentIndex++;
      }
      
      // 解析位置参数 [position]
      let positionStr = '';
      if (currentIndex < line.length && line[currentIndex] === '[') {
        const positionStart = currentIndex + 1;
        let bracketCount = 1;
        currentIndex++;
        
        while (currentIndex < line.length && bracketCount > 0) {
          if (line[currentIndex] === '[') bracketCount++;
          else if (line[currentIndex] === ']') bracketCount--;
          currentIndex++;
        }
        
        if (bracketCount === 0) {
          positionStr = line.substring(positionStart, currentIndex - 1);
        }
      }
      
      // 跳过空白字符
      while (currentIndex < line.length && /\s/.test(line[currentIndex])) {
        currentIndex++;
      }
      
      // 解析文本内容 {text}，处理嵌套大括号
      if (currentIndex < line.length && line[currentIndex] === '{') {
        const textStart = currentIndex + 1;
        let braceCount = 1;
        currentIndex++;
        
        while (currentIndex < line.length && braceCount > 0) {
          if (line[currentIndex] === '{') braceCount++;
          else if (line[currentIndex] === '}') braceCount--;
          currentIndex++;
        }
        
        if (braceCount === 0) {
          const text = line.substring(textStart, currentIndex - 1);
          results.push({
            positionStr,
            text,
            nodeIndex: nodeStart
          });
        }
      }
      
      index = currentIndex;
    }
    
    return results;
  }

  // 解析圆形
  private parseCircle(line: string, style: string) {
    const coords = TikZGeometryParser.parseCircleCoords(line);
    
    if (coords && TikZGeometryParser.validateCoords(coords)) {
      try {
        // 存储原始坐标
        this.rawElements.push({
          type: 'circle',
          x: coords.x,
          y: coords.y,
          radius: coords.radius,
          style: TikZStyleParser.parseDrawOptions(style)
        });
      } catch (error) {
        throw new Error(`圆形参数解析失败: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  }

  // 解析矩形
  private parseRectangle(line: string, style: string) {
    const coords = TikZGeometryParser.parseRectangleCoords(line);
    
    if (coords && TikZGeometryParser.validateCoords(coords)) {
      try {
        // 存储原始坐标
        this.rawElements.push({
          type: 'rectangle',
          x: coords.x1,
          y: coords.y1,
          width: coords.x2 - coords.x1,
          height: coords.y2 - coords.y1,
          style: TikZStyleParser.parseDrawOptions(style)
        });
      } catch (error) {
        throw new Error(`矩形参数解析失败: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  }

  // 解析椭圆
  private parseEllipse(line: string, style: string) {
    const coords = TikZGeometryParser.parseEllipseCoords(line);
    
    if (coords && TikZGeometryParser.validateCoords(coords)) {
      try {
        // 存储原始坐标
        this.rawElements.push({
          type: 'ellipse',
          x: coords.x,
          y: coords.y,
          rx: coords.rx,
          ry: coords.ry,
          style: TikZStyleParser.parseDrawOptions(style)
        });
      } catch (error) {
        throw new Error(`椭圆参数解析失败: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  }

  // 解析抛物线
  private parseParabola(line: string, style: string) {
    const coords = TikZGeometryParser.parseParabolaCoords(line);
    
    if (coords && TikZGeometryParser.validateCoords(coords)) {
      try {
        // 使用动态缩放
        const scale = Math.min(this.width / 8, this.height / 6);
        const centerX = this.width / 2;
        const centerY = this.height / 2;
        
        // 计算抛物线控制点（顶点）
        const midX = (coords.x1 + coords.x2) / 2;
        const controlY = Math.min(coords.y1, coords.y2) - Math.abs(coords.x2 - coords.x1) * 0.3; // 抛物线顶点
        
        this.elements.push({
          type: 'parabola',
          x1: centerX + coords.x1 * scale,
          y1: centerY - coords.y1 * scale,
          x2: centerX + coords.x2 * scale,
          y2: centerY - coords.y2 * scale,
          controlX: centerX + midX * scale,
          controlY: centerY - controlY * scale,
          style: TikZStyleParser.parseDrawOptions(style)
        });
      } catch (error) {
        throw new Error(`抛物线参数解析失败: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  }

  // 解析圆弧
  private parseArc(line: string, style: string) {
    const coords = TikZGeometryParser.parseArcCoords(line);
    
    if (coords && TikZGeometryParser.validateCoords(coords)) {
      try {
        // 使用动态缩放
        const scale = Math.min(this.width / 8, this.height / 6);
        const centerX = this.width / 2;
        const centerY = this.height / 2;
        
        this.elements.push({
          type: 'arc',
          x: centerX + coords.x * scale,
          y: centerY - coords.y * scale,
          startAngle: coords.startAngle * Math.PI / 180, // 转换为弧度
          endAngle: coords.endAngle * Math.PI / 180,
          radius: coords.radius * scale,
          style: TikZStyleParser.parseDrawOptions(style)
        });
      } catch (error) {
        throw new Error(`圆弧参数解析失败: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  }

  // 解析网格
  private parseGrid(line: string, style: string, lineNumber: number) {
    try {
      const coords = TikZGeometryParser.parseGridCoords(line, style);
      
      if (coords && TikZGeometryParser.validateCoords(coords)) {
        // 解析颜色，默认为灰色
        const colorMatch = style.match(/\b(gray|grey|black|blue|red|green|yellow|orange|purple|pink|brown|white)\b/);
        const color = colorMatch ? colorMatch[1] : 'gray';
        
        // 解析线宽
        const lineWidth = TikZStyleParser.parseLineWidth(style) || 1;
        
        // 生成网格线
        this.generateGridLines(coords.x1, coords.y1, coords.x2, coords.y2, coords.step, color, lineWidth);
    } else {
        throw new Error(`无法解析网格命令: ${line}`);
      }
    } catch (error) {
      throw new Error(`第${lineNumber}行: grid命令解析失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // 生成网格线
  private generateGridLines(x1: number, y1: number, x2: number, y2: number, step: number, color: string, lineWidth: number) {
    const minX = Math.min(x1, x2);
    const maxX = Math.max(x1, x2);
    const minY = Math.min(y1, y2);
    const maxY = Math.max(y1, y2);
    
    // 使用动态缩放
    const scale = Math.min(this.width / 8, this.height / 6);
    const centerX = this.width / 2;
    const centerY = this.height / 2;
    
    // 生成垂直线
    for (let x = minX; x <= maxX; x += step) {
      this.elements.push({
        type: 'path',
        points: [
          { x: centerX + x * scale, y: centerY - minY * scale },
          { x: centerX + x * scale, y: centerY - maxY * scale }
        ],
        style: {
          stroke: TikZStyleParser.getColorValue(color),
          strokeWidth: lineWidth,
          opacity: 0.5
        }
      });
    }
      
      // 生成水平线
      for (let y = minY; y <= maxY; y += step) {
        this.elements.push({
          type: 'path',
          points: [
            { x: centerX + minX * scale, y: centerY - y * scale },
            { x: centerX + maxX * scale, y: centerY - y * scale }
          ],
          style: {
            stroke: TikZStyleParser.getColorValue(color),
            strokeWidth: lineWidth,
            opacity: 0.5
          }
        });
    }
  }

  // 获取适合当前模式的文本颜色
  private getTextColor(): string {
    return TikZStyleParser.getTextColor();
  }

  // 解析通用绘制命令
  private parseGenericDraw(line: string, style: string) {
    // 尝试解析简单的点
    const coordMatch = line.match(/\(([^)]+)\)/);
    if (coordMatch) {
      try {
        const [x, y] = coordMatch[1].split(',').map(s => parseFloat(s.trim()));
        if (!isNaN(x) && !isNaN(y)) {
                             // 使用动态缩放
        const scale = Math.min(this.width / 8, this.height / 6);
        const centerX = this.width / 2;
        const centerY = this.height / 2;
        
                     this.elements.push({
             type: 'point',
          x: centerX + x * scale,
          y: centerY - y * scale,  // Y轴翻转
             style: { ...TikZStyleParser.parseDrawOptions(style), fill: 'black', r: 2 }
           });
          return;
        }
      } catch (error) {
        // 忽略错误，继续尝试其他解析方法
      }
    }
    
    // 警告日志已清理
  }

  // 解析 \fill 命令
  private parseFillCommand(line: string, lineNumber: number) {
    // 类似 \draw 的解析，但设置填充样式
    try {
      this.parseDrawCommand(line.replace('\\fill', '\\draw'), lineNumber);
    } catch (error) {
      throw new Error(`第${lineNumber}行: \\fill命令解析失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

    // 解析 \node 命令
  private parseNodeCommand(line: string, lineNumber: number) {
    try {
      // 匹配多种 \node 格式
      // 格式1: \node at (x,y) {text}
      // 格式2: \node[position] at (x,y) {text}
      // 格式3: \node[style] at (x,y) {text}
      const nodeMatch = line.match(/\\node(?:\[([^\]]*)\])?\s*(?:at\s*)?\(([^)]+)\)\s*\{([^}]+)\}/);
      
      if (nodeMatch) {
        const [, styleOrPosition, coordStr, text] = nodeMatch;
        const [x, y] = coordStr.split(',').map(s => parseFloat(s.trim()));
        
        if (isNaN(x) || isNaN(y)) {
          throw new Error(`节点坐标值无效: (${x},${y})`);
        }
        
        // 解析位置参数
        const position = this.parseNodePosition(styleOrPosition || '');
        
        // 使用动态缩放
        const scale = Math.min(this.width / 8, this.height / 6);
        const centerX = this.width / 2;
        const centerY = this.height / 2;
        
        const baseX = centerX + x * scale;
        const baseY = centerY - y * scale;  // Y轴翻转
        
        // 根据位置参数调整坐标
        const adjustedPos = this.adjustNodePosition(baseX, baseY, position);
        
        const parsedText = this.parseNodeText(text);
        // 数字使用更小的字体，数学符号使用正常字体
        const fontSize = parsedText.isNumber ? '12px' : (parsedText.isMath ? '14px' : '14px');
        this.elements.push({
          type: 'text',
          x: adjustedPos.x,
          y: adjustedPos.y,
          text: parsedText.content,
          italic: parsedText.hasItalic,
          style: { fill: this.getTextColor(), fontSize: fontSize, ...position.style }
        });
      } else {
        // 备用解析方式 - 处理简化格式
        const coordMatch = line.match(/\(([^)]+)\)/);
        const textMatch = line.match(/\{\s*([^}]+)\s*\}/);
        
        if (coordMatch && textMatch) {
          const [x, y] = coordMatch[1].split(',').map(s => parseFloat(s.trim()));
          const text = textMatch[1];
          
          if (isNaN(x) || isNaN(y)) {
            throw new Error(`节点坐标值无效: (${x},${y})`);
          }
          
          const parsedText = this.parseNodeText(text);
          // 数字使用更小的字体，数学符号使用正常字体
          const fontSize = parsedText.isNumber ? '12px' : (parsedText.isMath ? '14px' : '14px');
          
          // 使用动态缩放
          const scale = Math.min(this.width / 8, this.height / 6);
          const centerX = this.width / 2;
          const centerY = this.height / 2;
          
          this.elements.push({
            type: 'text',
            x: centerX + x * scale,
            y: centerY - y * scale,  // Y轴翻转
            text: parsedText.content,
            italic: parsedText.hasItalic,
            style: { fill: this.getTextColor(), fontSize: fontSize }
          });
        } else {
          // 警告日志已清理
        }
      }
    } catch (error) {
      throw new Error(`第${lineNumber}行: \\node命令解析失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // 解析节点位置参数
  private parseNodePosition(params: string) {
    const position = {
      anchor: 'center',
      offsetX: 0,
      offsetY: 0,
      style: {}
    };

    if (!params) return position;

    // 解析位置关键词 - 减少偏移量让文字更靠近坐标轴
    if (params.includes('above')) {
      position.anchor = 'above';
      position.offsetY = -15;
    } else if (params.includes('below')) {
      position.anchor = 'below';
      position.offsetY = 15;
    } else if (params.includes('left')) {
      position.anchor = 'left';
      position.offsetX = -20;
    } else if (params.includes('right')) {
      position.anchor = 'right';
      position.offsetX = 20;
    } else if (params.includes('above right')) {
      position.anchor = 'above right';
      position.offsetX = 15;
      position.offsetY = -15;
    } else if (params.includes('above left')) {
      position.anchor = 'above left';
      position.offsetX = -15;
      position.offsetY = -15;
    } else if (params.includes('below right')) {
      position.anchor = 'below right';
      position.offsetX = 15;
      position.offsetY = 15;
    } else if (params.includes('below left')) {
      position.anchor = 'below left';
      position.offsetX = -15;
      position.offsetY = 15;
    }

    // 解析颜色
    if (params.includes('red')) position.style = { fill: 'red' };
    else if (params.includes('blue')) position.style = { fill: 'blue' };
    else if (params.includes('green')) position.style = { fill: 'green' };

    return position;
  }

  // 调整节点位置
  private adjustNodePosition(baseX: number, baseY: number, position: any) {
    return {
      x: baseX + position.offsetX,
      y: baseY + position.offsetY
    };
  }

  // 解析节点文本（支持LaTeX数学符号转Unicode）
  private parseNodeText(text: string): { content: string; hasItalic: boolean; isNumber: boolean; isMath: boolean } {
    // 检查是否包含数学模式
    const hasMathMode = /\$([^$]+)\$/.test(text);
    
    // 如果包含数学模式，提取并转换内容
    if (hasMathMode) {
      const mathContent = text.replace(/\$([^$]+)\$/g, '$1');
      const convertedText = this.convertLaTeXToUnicode(mathContent);
      
      // 检查转换后是否为纯数字
      const isNumber = /^-?\d+(\.\d+)?$/.test(convertedText.trim());
      
      return {
        content: convertedText,
        hasItalic: !isNumber, // 数字不使用斜体，其他数学符号使用斜体
        isNumber: isNumber,
        isMath: true
      };
    }
    
    // 普通文本处理
    const processedText = this.convertLaTeXToUnicode(text);
    const isNumber = /^-?\d+(\.\d+)?$/.test(processedText.trim());
    
    return {
      content: processedText,
      hasItalic: false,
      isNumber: isNumber,
      isMath: false
    };
  }

  // 将LaTeX符号转换为Unicode字符
  private convertLaTeXToUnicode(text: string): string {
    return text
      // 希腊字母
      .replace(/\\alpha/g, 'α')
      .replace(/\\beta/g, 'β')
      .replace(/\\gamma/g, 'γ')
      .replace(/\\delta/g, 'δ')
      .replace(/\\epsilon/g, 'ε')
      .replace(/\\zeta/g, 'ζ')
      .replace(/\\eta/g, 'η')
      .replace(/\\theta/g, 'θ')
      .replace(/\\iota/g, 'ι')
      .replace(/\\kappa/g, 'κ')
      .replace(/\\lambda/g, 'λ')
      .replace(/\\mu/g, 'μ')
      .replace(/\\nu/g, 'ν')
      .replace(/\\xi/g, 'ξ')
      .replace(/\\pi/g, 'π')
      .replace(/\\rho/g, 'ρ')
      .replace(/\\sigma/g, 'σ')
      .replace(/\\tau/g, 'τ')
      .replace(/\\upsilon/g, 'υ')
      .replace(/\\phi/g, 'φ')
      .replace(/\\chi/g, 'χ')
      .replace(/\\psi/g, 'ψ')
      .replace(/\\omega/g, 'ω')
      // 大写希腊字母
      .replace(/\\Gamma/g, 'Γ')
      .replace(/\\Delta/g, 'Δ')
      .replace(/\\Theta/g, 'Θ')
      .replace(/\\Lambda/g, 'Λ')
      .replace(/\\Xi/g, 'Ξ')
      .replace(/\\Pi/g, 'Π')
      .replace(/\\Sigma/g, 'Σ')
      .replace(/\\Upsilon/g, 'Υ')
      .replace(/\\Phi/g, 'Φ')
      .replace(/\\Psi/g, 'Ψ')
      .replace(/\\Omega/g, 'Ω')
      // 数学符号
      .replace(/\\infty/g, '∞')
      .replace(/\\sum/g, '∑')
      .replace(/\\prod/g, '∏')
      .replace(/\\int/g, '∫')
      .replace(/\\partial/g, '∂')
      .replace(/\\nabla/g, '∇')
      .replace(/\\pm/g, '±')
      .replace(/\\mp/g, '∓')
      .replace(/\\times/g, '×')
      .replace(/\\div/g, '÷')
      .replace(/\\cdot/g, '·')
      .replace(/\\leq/g, '≤')
      .replace(/\\geq/g, '≥')
      .replace(/\\neq/g, '≠')
      .replace(/\\approx/g, '≈')
      .replace(/\\equiv/g, '≡')
      .replace(/\\in/g, '∈')
      .replace(/\\notin/g, '∉')
      .replace(/\\subset/g, '⊂')
      .replace(/\\supset/g, '⊃')
      .replace(/\\subseteq/g, '⊆')
      .replace(/\\supseteq/g, '⊇')
      .replace(/\\cap/g, '∩')
      .replace(/\\cup/g, '∪')
      .replace(/\\emptyset/g, '∅')
      .replace(/\\forall/g, '∀')
      .replace(/\\exists/g, '∃')
      .replace(/\\neg/g, '¬')
      .replace(/\\land/g, '∧')
      .replace(/\\lor/g, '∨')
      .replace(/\\rightarrow/g, '→')
      .replace(/\\leftarrow/g, '←')
      .replace(/\\leftrightarrow/g, '↔')
      .replace(/\\Rightarrow/g, '⇒')
      .replace(/\\Leftarrow/g, '⇐')
      .replace(/\\Leftrightarrow/g, '⇔')
      // 分数处理 - 使用智能分数解析
      .replace(/\\(?:d?f|t|c)rac\{([^}]*(?:\{[^}]*\}[^}]*)*)\}\{([^}]*(?:\{[^}]*\}[^}]*)*)\}/g, (_, num, den) => {
        return this.renderFractionSafe(num, den);
      })
      // 二项式系数
      .replace(/\\binom\{([^}]*(?:\{[^}]*\}[^}]*)*)\}\{([^}]*(?:\{[^}]*\}[^}]*)*)\}/g, (_, n, k) => {
        return this.renderBinomialSafe(n, k);
      })
      // 根号处理
      .replace(/\\sqrt\{([^}]*(?:\{[^}]*\}[^}]*)*)\}/g, (_, radicand) => {
        return this.renderSqrtSafe(radicand);
      })
      .replace(/\\sqrt\[([^\]]*)\]\{([^}]*(?:\{[^}]*\}[^}]*)*)\}/g, (_, index, radicand) => {
        return this.renderSqrtSafe(radicand, index);
      })
      // 上下标的简单处理（转为普通字符）
      .replace(/\^(\{[^}]+\}|\w)/g, (_, exp) => {
        const cleanExp = exp.replace(/[{}]/g, '');
        return this.toSuperscript(cleanExp);
      })
      .replace(/_(\{[^}]+\}|\w)/g, (_, sub) => {
        const cleanSub = sub.replace(/[{}]/g, '');
        return this.toSubscript(cleanSub);
      });
  }

  // 安全的分数渲染 - 避免递归调用
  private renderFractionSafe(numerator: string, denominator: string): string {
    // 只处理基本符号，避免递归
    const num = this.convertBasicSymbols(numerator.trim());
    const den = this.convertBasicSymbols(denominator.trim());
    
    // 对于简单的情况，尝试使用Unicode分数字符
    const simpleFractions: { [key: string]: string } = {
      '1/2': '½', '1/3': '⅓', '2/3': '⅔', '1/4': '¼', '3/4': '¾',
      '1/5': '⅕', '2/5': '⅖', '3/5': '⅗', '4/5': '⅘', '1/6': '⅙',
      '5/6': '⅚', '1/8': '⅛', '3/8': '⅜', '5/8': '⅝', '7/8': '⅞'
    };
    
    const fractionKey = `${num}/${den}`;
    if (simpleFractions[fractionKey]) {
      return simpleFractions[fractionKey];
    }
    
    // 如果分子或分母为空，特殊处理
    if (!num && !den) {
      return '□/□'; // 空分数占位符
    } else if (!num) {
      return `□/${den}`;
    } else if (!den) {
      return `${num}/□`;
    }
    
    // 对于复杂情况，使用斜杠分隔
    if (num.length > 3 || den.length > 3 || 
        num.includes(' ') || den.includes(' ')) {
      return `(${num})/(${den})`;
    }
    
    // 对于其他情况，使用上标和下标创建美观的分数
    const numSup = this.toSuperscript(num);
    const denSub = this.toSubscript(den);
    
    // 使用Unicode分数线字符
    return `${numSup}⁄${denSub}`;
  }

  // 安全的二项式系数渲染
  private renderBinomialSafe(n: string, k: string): string {
    const nProcessed = this.convertBasicSymbols(n.trim());
    const kProcessed = this.convertBasicSymbols(k.trim());
    const nSup = this.toSuperscript(nProcessed);
    const kSub = this.toSubscript(kProcessed);
    return `C(${nSup},${kSub})`;
  }

  // 安全的根号渲染
  private renderSqrtSafe(radicand: string, index?: string): string {
    const processedRadicand = this.convertBasicSymbols(radicand.trim());
    if (index) {
      // 有根指数的根号
      const processedIndex = this.convertBasicSymbols(index.trim());
      const indexSup = this.toSuperscript(processedIndex);
      return `${indexSup}√(${processedRadicand})`;
    } else {
      // 平方根
      return `√(${processedRadicand})`;
    }
  }



  // 转换基本符号（不包含复杂结构，避免递归）
  private convertBasicSymbols(text: string): string {
    return text
      // 希腊字母
      .replace(/\\alpha/g, 'α')
      .replace(/\\beta/g, 'β')
      .replace(/\\gamma/g, 'γ')
      .replace(/\\delta/g, 'δ')
      .replace(/\\epsilon/g, 'ε')
      .replace(/\\zeta/g, 'ζ')
      .replace(/\\eta/g, 'η')
      .replace(/\\theta/g, 'θ')
      .replace(/\\iota/g, 'ι')
      .replace(/\\kappa/g, 'κ')
      .replace(/\\lambda/g, 'λ')
      .replace(/\\mu/g, 'μ')
      .replace(/\\nu/g, 'ν')
      .replace(/\\xi/g, 'ξ')
      .replace(/\\pi/g, 'π')
      .replace(/\\rho/g, 'ρ')
      .replace(/\\sigma/g, 'σ')
      .replace(/\\tau/g, 'τ')
      .replace(/\\upsilon/g, 'υ')
      .replace(/\\phi/g, 'φ')
      .replace(/\\chi/g, 'χ')
      .replace(/\\psi/g, 'ψ')
      .replace(/\\omega/g, 'ω')
      // 大写希腊字母
      .replace(/\\Gamma/g, 'Γ')
      .replace(/\\Delta/g, 'Δ')
      .replace(/\\Theta/g, 'Θ')
      .replace(/\\Lambda/g, 'Λ')
      .replace(/\\Xi/g, 'Ξ')
      .replace(/\\Pi/g, 'Π')
      .replace(/\\Sigma/g, 'Σ')
      .replace(/\\Upsilon/g, 'Υ')
      .replace(/\\Phi/g, 'Φ')
      .replace(/\\Psi/g, 'Ψ')
      .replace(/\\Omega/g, 'Ω')
      // 基本数学符号
      .replace(/\\infty/g, '∞')
      .replace(/\\sum/g, '∑')
      .replace(/\\prod/g, '∏')
      .replace(/\\int/g, '∫')
      .replace(/\\partial/g, '∂')
      .replace(/\\nabla/g, '∇')
      .replace(/\\pm/g, '±')
      .replace(/\\mp/g, '∓')
      .replace(/\\times/g, '×')
      .replace(/\\div/g, '÷')
      .replace(/\\cdot/g, '·')
      .replace(/\\leq/g, '≤')
      .replace(/\\geq/g, '≥')
      .replace(/\\neq/g, '≠')
      .replace(/\\approx/g, '≈')
      .replace(/\\equiv/g, '≡')
      .replace(/\\in/g, '∈')
      .replace(/\\notin/g, '∉')
      .replace(/\\subset/g, '⊂')
      .replace(/\\supset/g, '⊃')
      .replace(/\\subseteq/g, '⊆')
      .replace(/\\supseteq/g, '⊇')
      .replace(/\\cap/g, '∩')
      .replace(/\\cup/g, '∪')
      .replace(/\\emptyset/g, '∅')
      .replace(/\\forall/g, '∀')
      .replace(/\\exists/g, '∃')
      .replace(/\\neg/g, '¬')
      .replace(/\\land/g, '∧')
      .replace(/\\lor/g, '∨')
      .replace(/\\rightarrow/g, '→')
      .replace(/\\leftarrow/g, '←')
      .replace(/\\leftrightarrow/g, '↔')
      .replace(/\\Rightarrow/g, '⇒')
      .replace(/\\Leftarrow/g, '⇐')
      .replace(/\\Leftrightarrow/g, '⇔')
      // 简单的上下标处理
      .replace(/\^(\{[^}]+\}|\w)/g, (_, exp) => {
        const cleanExp = exp.replace(/[{}]/g, '');
        return this.toSuperscript(cleanExp);
      })
      .replace(/_(\{[^}]+\}|\w)/g, (_, sub) => {
        const cleanSub = sub.replace(/[{}]/g, '');
        return this.toSubscript(cleanSub);
      });
  }

  // 转换为上标字符
  private toSuperscript(text: string): string {
    const superscriptMap: { [key: string]: string } = {
      '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
      '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
      '+': '⁺', '-': '⁻', '=': '⁼', '(': '⁽', ')': '⁾',
      'n': 'ⁿ', 'i': 'ⁱ', 'x': 'ˣ', 'y': 'ʸ'
    };
    
    return text.split('').map(char => superscriptMap[char] || char).join('');
  }

  // 转换为下标字符
  private toSubscript(text: string): string {
    const subscriptMap: { [key: string]: string } = {
      '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄',
      '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉',
      '+': '₊', '-': '₋', '=': '₌', '(': '₍', ')': '₎',
      'a': 'ₐ', 'e': 'ₑ', 'h': 'ₕ', 'i': 'ᵢ', 'j': 'ⱼ',
      'k': 'ₖ', 'l': 'ₗ', 'm': 'ₘ', 'n': 'ₙ', 'o': 'ₒ',
      'p': 'ₚ', 'r': 'ᵣ', 's': 'ₛ', 't': 'ₜ', 'u': 'ᵤ',
      'v': 'ᵥ', 'x': 'ₓ'
    };
    
    return text.split('').map(char => subscriptMap[char] || char).join('');
  }

  // 解析 \coordinate 命令
  private parseCoordinateCommand(line: string, lineNumber: number) {
    try {
      const coordMatch = line.match(/\(([^)]+)\)/);
      
      if (coordMatch) {
        const [x, y] = coordMatch[1].split(',').map(s => parseFloat(s.trim()));
        
        if (isNaN(x) || isNaN(y)) {
          throw new Error(`坐标值无效: (${x},${y})`);
        }
        
        // 使用动态缩放
        const scale = Math.min(this.width / 8, this.height / 6);
        const centerX = this.width / 2;
        const centerY = this.height / 2;
        
        this.elements.push({
          type: 'point',
          x: centerX + x * scale,
          y: centerY - y * scale,  // Y轴翻转
          style: { fill: 'red', r: 3 }
        });
      } else {
        // 警告日志已清理
      }
    } catch (error) {
      throw new Error(`第${lineNumber}行: \\coordinate命令解析失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // 解析 \path 命令
  private parsePathCommand(line: string, lineNumber: number) {
    try {
      // 提取样式
      const styleMatch = line.match(/\\path\[([^\]]*)\]/);
      const style = styleMatch ? styleMatch[1] : '';
      
      // 解析路径
      if (line.includes('--')) {
        this.parseLinePath(line, style, lineNumber);
      } else if (line.includes('circle')) {
        this.parseCircle(line, style);
      } else if (line.includes('rectangle')) {
        this.parseRectangle(line, style);
      } else if (line.includes('ellipse')) {
        this.parseEllipse(line, style);
      } else if (line.includes('parabola')) {
        this.parseParabola(line, style);
      } else if (line.includes('arc')) {
        this.parseArc(line, style);
      } else {
        // 尝试解析其他类型的路径命令
        this.parseGenericDraw(line, style);
      }
    } catch (error) {
      // 错误日志已清理
      throw new Error(`第${lineNumber}行: \\path命令解析失败`);
    }
  }

  // 解析 \shade 命令
  private parseShadeCommand(line: string, lineNumber: number) {
    try {
      // 匹配 \shade[options] (x1,y1) to (x2,y2) 格式
      const shadeMatch = line.match(/\\shade\s*\[([^\]]*)\]\s*\(([^)]+)\)\s+to\s+\(([^)]+)\)/);
      
      if (shadeMatch) {
        const [, options, start, end] = shadeMatch;
        const [x1, y1] = start.split(',').map(s => parseFloat(s.trim()));
        const [x2, y2] = end.split(',').map(s => parseFloat(s.trim()));
        
        // 解析样式选项
        const style = TikZStyleParser.parseDrawOptions(options);
        
        // 创建渐变填充的矩形
        this.elements.push({
          type: 'shade',
          x1, y1, x2, y2,
          style,
          lineNumber
        });
      }
    } catch (error) {
      throw new Error(`第${lineNumber + 1}行: shade命令解析失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }



  // 获取居中偏移量
  private getCenteringOffset() {
    // 简化版本，返回0偏移
    return { offsetX: 0, offsetY: 0 };
  }

  // 生成SVG
  private generateSVG(): string {
    let svgContent = `<svg width="${this.width}" height="${this.height}" xmlns="http://www.w3.org/2000/svg">`;
    
    // 添加SVG定义
    svgContent += this.generateDefinitions();
    
    // 完全透明背景，无边框
    svgContent += `<rect width="${this.width}" height="${this.height}" fill="rgba(0,0,0,0)" stroke="none"/>`;
    
    // 网格线（可选）
    if (this.showGrid) {
      svgContent += this.generateGrid();
    }
    
    // 渲染所有元素
    for (const element of this.elements) {
      if (element.type === 'placeholder') {
        // 渲染占位符
        svgContent += this.renderPlaceholder(element);
      } else {
        svgContent += this.renderElement(element);
      }
    }
    
    // 添加标题（可选）
    if (this.showTitle) {
      svgContent += `<text x="${this.width / 2}" y="${this.height - 20}" text-anchor="middle" font-size="12" fill="#666">TikZ 模拟渲染</text>`;
    }
    
    svgContent += '</svg>';
    return svgContent;
  }

  // 生成SVG定义
  private generateDefinitions(): string {
    let defs = '<defs>';
    
    // 基础箭头标记 - 支持暗色模式
    const isDarkMode = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');
    const defaultArrowColor = isDarkMode ? '#e5e7eb' : '#000000';
    
    // 默认箭头
    defs += `
      <marker id="arrowhead" markerWidth="10" markerHeight="7" 
              refX="10" refY="3.5" orient="auto">
        <polygon points="0 0, 10 3.5, 0 7" fill="${defaultArrowColor}" />
      </marker>
    `;
    
    // 为常见颜色生成专门的箭头
    const commonColors = [
      { name: 'red', color: '#ff0000' },
      { name: 'blue', color: '#0000ff' },
      { name: 'green', color: '#00ff00' },
      { name: 'yellow', color: '#ffff00' },
      { name: 'orange', color: '#ffa500' },
      { name: 'purple', color: '#800080' },
      { name: 'pink', color: '#ffc0cb' },
      { name: 'brown', color: '#8b4513' },
      { name: 'gray', color: '#808080' },
      { name: 'grey', color: '#808080' },
      { name: 'black', color: '#000000' },
      { name: 'white', color: '#ffffff' }
    ];
    
    commonColors.forEach(({ name, color }) => {
      defs += `
        <marker id="arrowhead-${name}" markerWidth="10" markerHeight="7" 
                refX="10" refY="3.5" orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" fill="${color}" />
        </marker>
      `;
    });
    
    // 使用ShadowRenderer创建阴影滤镜
    const shadow = ShadowRenderer.createDefaultShadow();
    defs += shadow.filter.outerHTML;
    
    // 使用GradientEngine创建渐变
    const verticalGradient = GradientEngine.createVerticalGradient([
      { offset: '0%', color: 'red' },
      { offset: '100%', color: 'blue' }
    ]);
    defs += `<linearGradient id="gradient-vertical" x1="0" y1="0" x2="0" y2="1">
      ${verticalGradient.stops.map(stop => `<stop offset="${stop.offset}" style="stop-color:${stop.color};stop-opacity:${stop.opacity || 1}" />`).join('')}
    </linearGradient>`;
    
    const horizontalGradient = GradientEngine.createHorizontalGradient([
      { offset: '0%', color: 'red' },
      { offset: '100%', color: 'blue' }
    ]);
    defs += `<linearGradient id="gradient-horizontal" x1="0" y1="0" x2="1" y2="0">
      ${horizontalGradient.stops.map(stop => `<stop offset="${stop.offset}" style="stop-color:${stop.color};stop-opacity:${stop.opacity || 1}" />`).join('')}
    </linearGradient>`;
    
    // 使用PatternFiller创建图案
    const dotsPattern = PatternFiller.createDotsPattern(2, 8, 'purple');
    defs += dotsPattern.element.outerHTML;
    
    const linesPattern = PatternFiller.createLinesPattern(1, 8, 0, 'purple');
    defs += linesPattern.element.outerHTML;
    
    const gridPattern = PatternFiller.createGridPattern(8, 0.5, 'purple');
    defs += gridPattern.element.outerHTML;
    
    const diagonalPattern = PatternFiller.createLinesPattern(1, 8, 45, 'purple');
    defs += diagonalPattern.element.outerHTML;
    
    const wavesPattern = PatternFiller.createWavesPattern(3, 2, 1, 'purple');
    defs += wavesPattern.element.outerHTML;
    
    const starsPattern = PatternFiller.createStarsPattern(5, 12, 'purple');
    defs += starsPattern.element.outerHTML;
    
    const hexagonPattern = PatternFiller.createHexagonPattern(8, 10, 'purple');
    defs += hexagonPattern.element.outerHTML;
    
    defs += '</defs>';
    return defs;
  }

  // 生成网格
  private generateGrid(): string {
    let grid = '';
    const gridSize = 60;
    
    // 支持暗色模式
    const isDarkMode = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');
    const gridColor = isDarkMode ? '#404040' : '#e9ecef';
    
    for (let x = 0; x <= this.width; x += gridSize) {
      grid += `<line x1="${x}" y1="0" x2="${x}" y2="${this.height}" stroke="${gridColor}" stroke-width="0.5" opacity="0.5"/>`;
    }
    
    for (let y = 0; y <= this.height; y += gridSize) {
      grid += `<line x1="0" y1="${y}" x2="${this.width}" y2="${y}" stroke="${gridColor}" stroke-width="0.5" opacity="0.5"/>`;
    }
    
    return grid;
  }

  // 渲染占位符
  private renderPlaceholder(element: any): string {
    // 确保文本内容正确转义XML特殊字符
    const escapedMessage = element.message
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
    return `<text x="${this.width / 2}" y="${this.height / 2}" text-anchor="middle" dominant-baseline="middle" font-size="14" fill="#999">${escapedMessage}</text>`;
  }

  // 渲染单个元素
  private renderElement(element: any): string {
    try {
      const { offsetX, offsetY } = this.getCenteringOffset();
      
      switch (element.type) {
        case 'path':
          return this.renderPath(element, offsetX, offsetY);
        case 'circle':
          return this.renderCircle(element, offsetX, offsetY);
        case 'rectangle':
          return this.renderRectangle(element, offsetX, offsetY);
        case 'ellipse':
          return this.renderEllipse(element, offsetX, offsetY);
        case 'parabola':
          return this.renderParabola(element, offsetX, offsetY);
        case 'arc':
          return this.renderArc(element, offsetX, offsetY);
        case 'text':
          return this.renderText(element, offsetX, offsetY);
        case 'point':
          return this.renderPoint(element, offsetX, offsetY);
        case 'function':
          return this.renderFunction(element, offsetX, offsetY);
        default:
          // 警告日志已清理
          return '';
      }
    } catch (error) {
      // 错误日志已清理
      return '';
    }
  }

  // 渲染路径
  private renderPath(element: any, offsetX: number = 0, offsetY: number = 0): string {
    if (!element.points || element.points.length < 2) return '';
    
    try {
      const d = element.points.map((point: any, index: number) => 
        `${index === 0 ? 'M' : 'L'} ${point.x + offsetX} ${point.y + offsetY}`
      ).join(' ');
      
      // 获取适合当前模式的描边颜色
      const strokeColor = element.style.stroke || element.style.color || this.getTextColor();
      let pathAttributes = `stroke="${strokeColor}" stroke-width="${element.style.strokeWidth || element.style.lineWidth || 1}"`;
      
      if (element.style.strokeDasharray) {
        pathAttributes += ` stroke-dasharray="${element.style.strokeDasharray}"`;
      }
      
      if (element.style.fill) {
        pathAttributes += ` fill="${element.style.fill}"`;
      } else {
        pathAttributes += ` fill="none"`;
      }
      
      if (element.style.opacity) {
        pathAttributes += ` opacity="${element.style.opacity}"`;
      }
      
      // 添加箭头标记
      if (element.style.hasArrow || element.style.arrow) {
        // 根据线条颜色选择对应的箭头
        let arrowId = 'arrowhead'; // 默认箭头
        
        if (element.style.color) {
          // 尝试匹配颜色名称
          const colorName = TikZStyleParser.getColorName(element.style.color);
          if (colorName) {
            arrowId = `arrowhead-${colorName}`;
          }
        }
        
        pathAttributes += ` marker-end="url(#${arrowId})"`;
      }
      
      return `<path d="${d}" ${pathAttributes}/>`;
    } catch (error) {
      // 错误日志已清理
      return '';
    }
  }

  // 渲染圆形
  private renderCircle(element: any, offsetX: number = 0, offsetY: number = 0): string {
    try {
      // 获取适合当前模式的描边颜色
      const strokeColor = element.style.stroke || this.getTextColor();
      let circleAttributes = `stroke="${strokeColor}" stroke-width="${element.style.strokeWidth}"`;
      
      if (element.style.strokeDasharray) {
        circleAttributes += ` stroke-dasharray="${element.style.strokeDasharray}"`;
      }
      
      if (element.style.fill) {
        circleAttributes += ` fill="${element.style.fill}"`;
      } else {
        circleAttributes += ` fill="none"`;
      }
      
      if (element.style.opacity) {
        circleAttributes += ` opacity="${element.style.opacity}"`;
      }
      
      return `<circle cx="${element.x + offsetX}" cy="${element.y + offsetY}" r="${element.radius}" ${circleAttributes}/>`;
    } catch (error) {
      // 错误日志已清理
      return '';
    }
  }

  // 渲染矩形
  private renderRectangle(element: any, offsetX: number = 0, offsetY: number = 0): string {
    try {
      // 获取适合当前模式的描边颜色
      const strokeColor = element.style.stroke || this.getTextColor();
      return `<rect x="${element.x + offsetX}" y="${element.y + offsetY}" width="${element.width}" height="${element.height}" stroke="${strokeColor}" stroke-width="${element.style.strokeWidth}" fill="none"/>`;
    } catch (error) {
      // 错误日志已清理
      return '';
    }
  }

  // 渲染椭圆
  private renderEllipse(element: any, offsetX: number = 0, offsetY: number = 0): string {
    try {
      // 获取适合当前模式的描边颜色
      const strokeColor = element.style.stroke || this.getTextColor();
      let ellipseAttributes = `stroke="${strokeColor}" stroke-width="${element.style.strokeWidth}"`;
      
      if (element.style.strokeDasharray) {
        ellipseAttributes += ` stroke-dasharray="${element.style.strokeDasharray}"`;
      }
      
      if (element.style.fill) {
        ellipseAttributes += ` fill="${element.style.fill}"`;
      } else {
        ellipseAttributes += ` fill="none"`;
      }
      
      if (element.style.opacity) {
        ellipseAttributes += ` opacity="${element.style.opacity}"`;
      }
      
      return `<ellipse cx="${element.x + offsetX}" cy="${element.y + offsetY}" rx="${element.rx}" ry="${element.ry}" ${ellipseAttributes}/>`;
    } catch (error) {
      // 错误日志已清理
      return '';
    }
  }

  // 渲染抛物线
  private renderParabola(element: any, offsetX: number = 0, offsetY: number = 0): string {
    try {
      // 获取适合当前模式的描边颜色
      const strokeColor = element.style.stroke || this.getTextColor();
      let pathAttributes = `stroke="${strokeColor}" stroke-width="${element.style.strokeWidth || 1}"`;
      
      if (element.style.strokeDasharray) {
        pathAttributes += ` stroke-dasharray="${element.style.strokeDasharray}"`;
      }
      
      if (element.style.fill) {
        pathAttributes += ` fill="${element.style.fill}"`;
      } else {
        pathAttributes += ` fill="none"`;
      }
      
      if (element.style.opacity) {
        pathAttributes += ` opacity="${element.style.opacity}"`;
      }
      
      // 使用二次贝塞尔曲线绘制抛物线
      const d = `M ${element.x1 + offsetX} ${element.y1 + offsetY} Q ${element.controlX + offsetX} ${element.controlY + offsetY} ${element.x2 + offsetX} ${element.y2 + offsetY}`;
      
      return `<path d="${d}" ${pathAttributes}/>`;
    } catch (error) {
      // 错误日志已清理
      return '';
    }
  }

  // 渲染圆弧
  private renderArc(element: any, offsetX: number = 0, offsetY: number = 0): string {
    try {
      // 获取适合当前模式的描边颜色
      const strokeColor = element.style.stroke || this.getTextColor();
      let arcAttributes = `stroke="${strokeColor}" stroke-width="${element.style.strokeWidth || 1}"`;
      
      if (element.style.strokeDasharray) {
        arcAttributes += ` stroke-dasharray="${element.style.strokeDasharray}"`;
      }
      
      if (element.style.fill) {
        arcAttributes += ` fill="${element.style.fill}"`;
      } else {
        arcAttributes += ` fill="none"`;
      }
      
      if (element.style.opacity) {
        arcAttributes += ` opacity="${element.style.opacity}"`;
      }
      
      // 计算圆弧的起始和结束点
      const startX = element.x + offsetX + element.radius * Math.cos(element.startAngle);
      const startY = element.y + offsetY - element.radius * Math.sin(element.startAngle);
      const endX = element.x + offsetX + element.radius * Math.cos(element.endAngle);
      const endY = element.y + offsetY - element.radius * Math.sin(element.endAngle);
      
      // 计算大弧标志
      const largeArcFlag = Math.abs(element.endAngle - element.startAngle) > Math.PI ? 1 : 0;
      
      // 使用SVG的A命令绘制圆弧
      const d = `M ${startX} ${startY} A ${element.radius} ${element.radius} 0 ${largeArcFlag} 0 ${endX} ${endY}`;
      
      return `<path d="${d}" ${arcAttributes}/>`;
    } catch (error) {
      // 错误日志已清理
      return '';
    }
  }

  // 渲染文本
  private renderText(element: any, offsetX: number = 0, offsetY: number = 0): string {
    try {
      // 确保文本内容正确转义XML特殊字符
      const escapedText = element.text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
      
      // 添加斜体样式
      const fontStyle = element.italic ? 'italic' : 'normal';
      
      return `<text x="${element.x + offsetX}" y="${element.y + offsetY}" text-anchor="middle" dominant-baseline="middle" font-size="${element.style.fontSize}" font-style="${fontStyle}" fill="${element.style.fill}">${escapedText}</text>`;
    } catch (error) {
      // 错误日志已清理
      return '';
    }
  }

  // 渲染点
  private renderPoint(element: any, offsetX: number = 0, offsetY: number = 0): string {
    try {
      return `<circle cx="${element.x + offsetX}" cy="${element.y + offsetY}" r="${element.style.r}" fill="${element.style.fill}"/>`;
    } catch (error) {
      // 错误日志已清理
      return '';
    }
  }

  // 渲染函数图像
  private renderFunction(element: any, offsetX: number = 0, offsetY: number = 0): string {
    try {
      if (!element.points || element.points.length < 2) return '';
      
      const d = element.points.map((point: any, index: number) => 
        `${index === 0 ? 'M' : 'L'} ${point.x + offsetX} ${point.y + offsetY}`
      ).join(' ');
      
      // 获取适合当前模式的描边颜色
      const strokeColor = element.style.stroke || this.getTextColor();
      let pathAttributes = `stroke="${strokeColor}" stroke-width="${element.style.strokeWidth}"`;
      
      if (element.style.strokeDasharray) {
        pathAttributes += ` stroke-dasharray="${element.style.strokeDasharray}"`;
      }
      
      if (element.style.fill) {
        pathAttributes += ` fill="${element.style.fill}"`;
      } else {
        pathAttributes += ` fill="none"`;
      }
      
      if (element.style.opacity) {
        pathAttributes += ` opacity="${element.style.opacity}"`;
      }
      
      return `<path d="${d}" ${pathAttributes}/>`;
    } catch (error) {
      // 错误日志已清理
      return '';
    }
  }

  // 处理foreach命令
  private processForeachCommand(command: string, lineNumber: number) {
    if (this.foreachStack.length === 0) return;
    
    const currentForeach = this.foreachStack[this.foreachStack.length - 1];
    
    // 如果这是第一次处理，设置命令
    if (currentForeach.command === '') {
      currentForeach.command = command;
    }
    
    // 使用工具类处理foreach命令
    TikZForeachUtils.processForeachCommand(currentForeach, (expandedCommand: string, _lineNumber: number) => {
      // 递归解析展开后的命令
      if (expandedCommand.includes('\\draw')) {
        this.parseDrawCommand(expandedCommand, lineNumber);
      } else if (expandedCommand.includes('\\fill')) {
        this.parseFillCommand(expandedCommand, lineNumber);
      } else if (expandedCommand.includes('\\node')) {
        this.parseNodeCommand(expandedCommand, lineNumber);
      } else if (expandedCommand.includes('\\coordinate')) {
        this.parseCoordinateCommand(expandedCommand, lineNumber);
      } else if (expandedCommand.includes('\\path')) {
        this.parsePathCommand(expandedCommand, lineNumber);
      } else if (expandedCommand.includes('\\shade')) {
        this.parseShadeCommand(expandedCommand, lineNumber);
      }
    });
    
    // 当前foreach处理完成，移除它
    this.foreachStack.pop();
  }

  // 生成错误SVG
  private generateErrorSVG(message: string): string {
    return `<svg width="500" height="500" xmlns="http://www.w3.org/2000/svg"><text x="250" y="250" text-anchor="middle" dominant-baseline="middle" font-size="16" fill="red">${message}</text></svg>`;
  }
}

export const TikZPreview: React.FC<TikZPreviewProps> = ({
  code,
  format: _format = 'svg', // eslint-disable-line @typescript-eslint/no-unused-vars
  width = 500,
  height = 500,
  showGrid = true,
  showTitle = true,
  className = '',
  onRender
}) => {

  const [previewUrl, setPreviewUrl] = useState<string>('');

  // 创建TikZ模拟器实例
  const tikzSimulator = useCallback(() => {
    return new TikZSimulator(width, height, showGrid, showTitle);
  }, [width, height, showGrid, showTitle]);

  // 渲染TikZ代码
  const handleRender = useCallback(async () => {
    if (!code.trim()) {
      return;
    }

    try {
      // 使用前端模拟器渲染
      const simulator = tikzSimulator();
      const svg = simulator.parseAndRender(code);
      
      // 生成预览URL - 使用encodeURIComponent替代btoa以支持中文字符
      const url = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
      setPreviewUrl(url);

      // 回调函数
      if (onRender) {
        onRender(svg);
      }
    } catch (error) {
      // 错误日志已清理
    }
  }, [code, tikzSimulator, onRender]);

  // 自动渲染（当代码变化时）
  React.useEffect(() => {
    if (code.trim()) {
      handleRender();
    }
  }, [code, handleRender]);



  return (
    <div className={`${className}`}>
      {/* 预览区域 - 透明背景设计 */}
      <div className="relative">
        {/* 完全透明容器 - 无边框，无内边距 */}
        <div className="bg-transparent flex items-center justify-center w-full h-full">
          {previewUrl ? (
            <div className="relative w-full h-full flex items-center justify-center">
              {/* SVG预览 - 完全透明背景 */}
              <img 
                src={previewUrl} 
                alt="TikZ预览" 
                className="max-w-full h-auto"
                style={{
                  filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))'
                }}
              />
            </div>
          ) : (
            <div className="text-center">
              {/* 空状态图标 */}
              <div className="relative mb-4">
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-full flex items-center justify-center">
                  <Code className="w-8 h-8 text-blue-500 dark:text-blue-400" />
                </div>
                {/* 装饰性圆点 */}
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
                <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-indigo-400 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
              </div>
              
              {/* 提示文字 */}
              <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
                图形预览区域
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                输入TikZ代码后自动渲染
              </p>
              <div className="flex items-center justify-center space-x-2 text-xs text-gray-400 dark:text-gray-500">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span>前端模拟渲染</span>
                <div className="w-2 h-2 bg-indigo-400 rounded-full"></div>
                <span>无需后端</span>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default TikZPreview;
