import React, { useState, useCallback } from 'react';
import { Code } from 'lucide-react';
import { ColorParser } from '../features/colors/ColorParser';
import { GradientEngine } from '../features/colors/GradientEngine';
import { PatternFiller } from '../features/effects/PatternFiller';
import { ShadowRenderer } from '../features/effects/ShadowRenderer';
import { TikZFunctionRenderer } from '../features/plotting/TikZFunctionRenderer';


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
  private showGrid: boolean;
  private showTitle: boolean;
  private bounds: { minX: number; minY: number; maxX: number; maxY: number } | null = null;
  private functionRenderer: TikZFunctionRenderer;


  constructor(width: number = 400, height: number = 300, showGrid: boolean = true, showTitle: boolean = true) {
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
    
    try {
      // 首先检查是否包含函数绘制代码
      
      if (code.includes('\\draw') || code.includes('\\\\draw')) {
        const svgContent = this.functionRenderer.parseAndRender(code);
        if (svgContent) {
          return svgContent;
        }
      }
      
      // 否则使用传统TikZ解析
      this.parseTikZCode(code);
      
      // 生成SVG
      return this.generateSVG();
    } catch (error) {
      // 错误日志已清理
      throw new Error(`TikZ解析失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // 解析TikZ代码
  private parseTikZCode(code: string) {
    const lines = code.split('\n');
    let lineNumber = 0;
    
    for (const line of lines) {
      lineNumber++;
      const trimmedLine = line.trim();
      
      // 跳过空行和注释
      if (!trimmedLine || trimmedLine.startsWith('%')) {
        continue;
      }
      
      try {
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
        
        // 解析函数绘图命令 \plot
        else if (trimmedLine.includes('\\plot')) {
          this.parsePlotCommand(trimmedLine, lineNumber);
        }
        
        // 跳过 \begin{tikzpicture} 和 \end{tikzpicture}
        else if (trimmedLine.includes('\\begin{tikzpicture}') || trimmedLine.includes('\\end{tikzpicture}')) {
          continue;
        }
        
        // 记录无法识别的命令
        else if (trimmedLine.startsWith('\\')) {
          // 警告日志已清理
        }
      } catch (error) {
        // 错误日志已清理
        // 继续解析其他行，而不是完全失败
      }
    }
    
    // 如果没有解析到任何元素，生成一个默认的占位符
    if (this.elements.length === 0) {
      this.elements.push({
        type: 'placeholder',
        message: '未识别到有效的TikZ命令'
      });
    }
    
    // 计算边界框用于居中
    this.calculateBounds();
  }

  // 解析 \draw 命令
  private parseDrawCommand(line: string, lineNumber: number) {
    try {
      // 提取样式
      const styleMatch = line.match(/\\draw\[([^\]]*)\]/);
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
          // 修复坐标系统：将LaTeX坐标转换为SVG坐标
          return { 
            x: (x + 2) * 50, 
            y: this.height - (y + 2) * 50  // Y轴翻转
          };
        } catch (error) {
          throw new Error(`第${index + 1}个坐标解析失败: ${coord}`);
        }
      });
      
      // 添加路径元素
      this.elements.push({
        type: 'path',
        points,
        style: this.parseStyle(style)
      });
      
      // 添加内嵌节点元素
      inlineNodes.forEach(node => {
        this.elements.push(node);
      });
    } else {
      // 警告日志已清理
    }
  }

  // 解析内嵌节点
  private parseInlineNodes(line: string, lineNumber: number) {
    const nodes: any[] = [];
    
    // 匹配 (x,y)node[position]{text} 模式
    const inlineNodeRegex = /\(([^)]+)\)\s*node\s*(?:\[([^\]]*)\])?\s*\{([^}]+)\}/g;
    let match;
    
    while ((match = inlineNodeRegex.exec(line)) !== null) {
      try {
        const [, coordStr, positionStr, text] = match;
        const [x, y] = coordStr.split(',').map(s => parseFloat(s.trim()));
        
        if (isNaN(x) || isNaN(y)) {
          console.warn(`第${lineNumber}行: 内嵌节点坐标值无效: (${x},${y})`);
          continue;
        }
        
        // 解析位置参数
        const position = this.parseNodePosition(positionStr || '');
        const baseX = (x + 2) * 50;
        const baseY = this.height - (y + 2) * 50;  // Y轴翻转
        
        // 根据位置参数调整坐标
        const adjustedPos = this.adjustNodePosition(baseX, baseY, position);
        
        const parsedText = this.parseNodeText(text);
        // 数学符号使用更大的字体
        const fontSize = parsedText.hasItalic ? '16px' : '14px';
        nodes.push({
          type: 'text',
          x: adjustedPos.x,
          y: adjustedPos.y,
          text: parsedText.content,
          italic: parsedText.hasItalic,
          style: { fill: 'black', fontSize: fontSize, ...position.style }
        });
      } catch (error) {
        // 警告日志已清理
      }
    }
    
    return nodes;
  }

  // 解析圆形
  private parseCircle(line: string, style: string) {
    const coordMatch = line.match(/\(([^)]+)\)/);
    const radiusMatch = line.match(/circle\s*\(([^)]+)\)/);
    
    if (coordMatch && radiusMatch) {
      try {
        const [x, y] = coordMatch[1].split(',').map(s => parseFloat(s.trim()));
        const radius = parseFloat(radiusMatch[1]);
        
        if (isNaN(x) || isNaN(y) || isNaN(radius)) {
          throw new Error(`坐标或半径值无效: x=${x}, y=${y}, radius=${radius}`);
        }
        
        this.elements.push({
          type: 'circle',
          x: (x + 2) * 50,
          y: this.height - (y + 2) * 50,  // Y轴翻转
          radius: radius * 50,
          style: this.parseStyle(style)
        });
      } catch (error) {
        throw new Error(`圆形参数解析失败: ${error instanceof Error ? error.message : String(error)}`);
      }
    } else {
      // 警告日志已清理
    }
  }

  // 解析矩形
  private parseRectangle(line: string, style: string) {
    const coordMatch = line.match(/\(([^)]+)\)/);
    const sizeMatch = line.match(/rectangle\s*\(([^)]+)\)/);
    
    if (coordMatch && sizeMatch) {
      try {
        const [x1, y1] = coordMatch[1].split(',').map(s => parseFloat(s.trim()));
        const [x2, y2] = sizeMatch[1].split(',').map(s => parseFloat(s.trim()));
        
        if (isNaN(x1) || isNaN(y1) || isNaN(x2) || isNaN(y2)) {
          throw new Error(`矩形坐标值无效: (${x1},${y1}) to (${x2},${y2})`);
        }
        
        this.elements.push({
          type: 'rectangle',
          x: (x1 + 2) * 50,
          y: this.height - (y2 + 2) * 50,  // Y轴翻转，使用y2作为顶部
          width: (x2 - x1) * 50,
          height: (y2 - y1) * 50,
          style: this.parseStyle(style)
        });
      } catch (error) {
        throw new Error(`矩形参数解析失败: ${error instanceof Error ? error.message : String(error)}`);
      }
    } else {
      // 警告日志已清理
    }
  }

  // 解析椭圆
  private parseEllipse(line: string, style: string) {
    const coordMatch = line.match(/\(([^)]+)\)/);
    const sizeMatch = line.match(/ellipse\s*\(([^)]+)\)/);
    
    if (coordMatch && sizeMatch) {
      try {
        const [x, y] = coordMatch[1].split(',').map(s => parseFloat(s.trim()));
        const [rx, ry] = sizeMatch[1].split(',').map(s => parseFloat(s.trim()));
        
        if (isNaN(x) || isNaN(y) || isNaN(rx) || isNaN(ry)) {
          throw new Error(`椭圆参数值无效: center=(${x},${y}), radii=(${rx},${ry})`);
        }
        
        this.elements.push({
          type: 'ellipse',
          x: (x + 2) * 50,
          y: this.height - (y + 2) * 50,  // Y轴翻转
          rx: rx * 50,
          ry: ry * 50,
          style: this.parseStyle(style)
        });
      } catch (error) {
        throw new Error(`椭圆参数解析失败: ${error instanceof Error ? error.message : String(error)}`);
      }
    } else {
      // 警告日志已清理
    }
  }

  // 解析通用绘制命令
  private parseGenericDraw(line: string, style: string) {
    // 尝试解析简单的点
    const coordMatch = line.match(/\(([^)]+)\)/);
    if (coordMatch) {
      try {
        const [x, y] = coordMatch[1].split(',').map(s => parseFloat(s.trim()));
        if (!isNaN(x) && !isNaN(y)) {
                     this.elements.push({
             type: 'point',
             x: (x + 2) * 50,
             y: this.height - (y + 2) * 50,  // Y轴翻转
             style: { ...this.parseStyle(style), fill: 'black', r: 2 }
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
        const baseX = (x + 2) * 50;
        const baseY = this.height - (y + 2) * 50;  // Y轴翻转
        
        // 根据位置参数调整坐标
        const adjustedPos = this.adjustNodePosition(baseX, baseY, position);
        
        const parsedText = this.parseNodeText(text);
        // 数学符号使用更大的字体
        const fontSize = parsedText.hasItalic ? '16px' : '14px';
        this.elements.push({
          type: 'text',
          x: adjustedPos.x,
          y: adjustedPos.y,
          text: parsedText.content,
          italic: parsedText.hasItalic,
          style: { fill: 'black', fontSize: fontSize, ...position.style }
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
          // 数学符号使用更大的字体
          const fontSize = parsedText.hasItalic ? '16px' : '14px';
          this.elements.push({
            type: 'text',
            x: (x + 2) * 50,
            y: this.height - (y + 2) * 50,  // Y轴翻转
            text: parsedText.content,
            italic: parsedText.hasItalic,
            style: { fill: 'black', fontSize: fontSize }
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

    // 解析位置关键词
    if (params.includes('above')) {
      position.anchor = 'above';
      position.offsetY = -20;
    } else if (params.includes('below')) {
      position.anchor = 'below';
      position.offsetY = 20;
    } else if (params.includes('left')) {
      position.anchor = 'left';
      position.offsetX = -30;
    } else if (params.includes('right')) {
      position.anchor = 'right';
      position.offsetX = 30;
    } else if (params.includes('above right')) {
      position.anchor = 'above right';
      position.offsetX = 20;
      position.offsetY = -20;
    } else if (params.includes('above left')) {
      position.anchor = 'above left';
      position.offsetX = -20;
      position.offsetY = -20;
    } else if (params.includes('below right')) {
      position.anchor = 'below right';
      position.offsetX = 20;
      position.offsetY = 20;
    } else if (params.includes('below left')) {
      position.anchor = 'below left';
      position.offsetX = -20;
      position.offsetY = 20;
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

  // 解析节点文本（支持LaTeX数学符号）
  private parseNodeText(text: string): { content: string; hasItalic: boolean } {
    // 检查是否包含数学模式
    const hasMathMode = /\$([^$]+)\$/.test(text);
    
    // 处理简单的LaTeX数学符号
    const processedText = text
      .replace(/\$([^$]+)\$/g, '$1')  // 移除$符号，保留内容
      .replace(/\\alpha/g, 'α')
      .replace(/\\beta/g, 'β')
      .replace(/\\gamma/g, 'γ')
      .replace(/\\delta/g, 'δ')
      .replace(/\\pi/g, 'π')
      .replace(/\\theta/g, 'θ')
      .replace(/\\lambda/g, 'λ')
      .replace(/\\mu/g, 'μ')
      .replace(/\\sigma/g, 'σ')
      .replace(/\\omega/g, 'ω');
    
    return {
      content: processedText,
      hasItalic: hasMathMode
    };
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
        
        this.elements.push({
          type: 'point',
          x: (x + 2) * 50,
          y: this.height - (y + 2) * 50,  // Y轴翻转
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
      // 提取样式
      const styleMatch = line.match(/\\shade\[([^\]]*)\]/);
      const style = styleMatch ? styleMatch[1] : '';
      
      // 解析渐变填充
      if (line.includes('circle')) {
        this.parseCircle(line, style);
      } else if (line.includes('rectangle')) {
        this.parseRectangle(line, style);
      } else if (line.includes('ellipse')) {
        this.parseEllipse(line, style);
      } else {
        // 尝试解析其他类型的渐变命令
        this.parseGenericDraw(line, style);
      }
    } catch (error) {
      // 错误日志已清理
      throw new Error(`第${lineNumber}行: \\shade命令解析失败`);
    }
  }

  // 解析函数绘图命令
  private parsePlotCommand(line: string, lineNumber: number) {
    try {
      // 提取样式
      const styleMatch = line.match(/\\draw\[([^\]]*)\]/);
      const style = styleMatch ? styleMatch[1] : '';
      
      // 解析domain参数
      const domainMatch = line.match(/domain=([^,\]]+)/);
      const samplesMatch = line.match(/samples=(\d+)/);
      
      const domain = domainMatch ? domainMatch[1] : '-2:2';
      const samples = samplesMatch ? parseInt(samplesMatch[1]) : 50;
      
      // 解析函数表达式
      const plotMatch = line.match(/plot\s*\((.*?)\)/);
      if (plotMatch) {
        const expression = plotMatch[1];
        this.generateFunctionPlot(expression, domain, samples, style);
      }
    } catch (error) {
      throw new Error(`第${lineNumber}行: \\plot命令解析失败`);
    }
  }

  // 生成函数图像
  private generateFunctionPlot(expression: string, domain: string, samples: number, style: string) {
    try {
      const [minX, maxX] = domain.split(':').map(x => parseFloat(x));
      const step = (maxX - minX) / samples;
      const points = [];
      
      for (let i = 0; i <= samples; i++) {
        const x = minX + i * step;
        const y = this.evaluateFunction(expression, x);
        
        if (!isNaN(y) && isFinite(y)) {
          points.push({
            x: (x + 2) * 50,
            y: this.height - (y + 2) * 50
          });
        }
      }
      
      if (points.length > 1) {
        this.elements.push({
          type: 'function',
          points,
          style: this.parseStyle(style)
        });
      }
    } catch (error) {
      console.warn('函数绘图生成失败:', error);
    }
  }

  // 简单的函数求值器
  private evaluateFunction(expression: string, x: number): number {
    // 替换常见的数学函数和运算符
    let expr = expression
      .replace(/\\x/g, x.toString())
      .replace(/\^/g, '**')
      .replace(/sin\(/g, 'Math.sin(')
      .replace(/cos\(/g, 'Math.cos(')
      .replace(/tan\(/g, 'Math.tan(')
      .replace(/ln\(/g, 'Math.log(')
      .replace(/log\(/g, 'Math.log10(')
      .replace(/sqrt\(/g, 'Math.sqrt(')
      .replace(/abs\(/g, 'Math.abs(')
      .replace(/exp\(/g, 'Math.exp(')
      .replace(/pi/g, 'Math.PI')
      .replace(/e/g, 'Math.E');
    
    // 处理简单的多项式
    if (expression.includes('\\x*\\x')) {
      expr = expr.replace(/\\x\*\\x/g, `${x}*${x}`);
    }
    if (expression.includes('\\x')) {
      expr = expr.replace(/\\x/g, x.toString());
    }
    
    try {
      // 安全的函数求值
      return Function('"use strict"; return (' + expr + ')')();
    } catch (error) {
      return NaN;
    }
  }

  // 计算边界框用于居中和自动扩展
  private calculateBounds() {
    if (this.elements.length === 0) {
      this.bounds = null;
      return;
    }

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    
    this.elements.forEach(element => {
      switch (element.type) {
        case 'path':
          element.points.forEach((point: any) => {
            minX = Math.min(minX, point.x);
            minY = Math.min(minY, point.y);
            maxX = Math.max(maxX, point.x);
            maxY = Math.max(maxY, point.y);
          });
          break;
        case 'circle':
        case 'ellipse':
          minX = Math.min(minX, element.x - (element.radius || element.rx));
          minY = Math.min(minY, element.y - (element.radius || element.ry));
          maxX = Math.max(maxX, element.x + (element.radius || element.rx));
          maxY = Math.max(maxY, element.y + (element.radius || element.ry));
          break;
        case 'rectangle':
          minX = Math.min(minX, element.x);
          minY = Math.min(minY, element.y);
          maxX = Math.max(maxX, element.x + element.width);
          maxY = Math.max(maxY, element.y + element.height);
          break;
        case 'point':
          // 点的边界计算，考虑点的半径
          const pointRadius = element.style?.r || 3;
          minX = Math.min(minX, element.x - pointRadius);
          minY = Math.min(minY, element.y - pointRadius);
          maxX = Math.max(maxX, element.x + pointRadius);
          maxY = Math.max(maxY, element.y + pointRadius);
          break;
        case 'text':
          // 文本的边界计算，考虑文本的大小
          const fontSize = parseInt(element.style?.fontSize) || 14;
          const textWidth = element.text.length * fontSize * 0.6; // 估算文本宽度
          const textHeight = fontSize;
          minX = Math.min(minX, element.x - textWidth / 2);
          minY = Math.min(minY, element.y - textHeight / 2);
          maxX = Math.max(maxX, element.x + textWidth / 2);
          maxY = Math.max(maxY, element.y + textHeight / 2);
          break;
      }
    });

    this.bounds = { minX, minY, maxX, maxY };
    
    // 自动扩展画布
    this.autoExpandCanvas();
  }

  // 自动扩展画布以包含所有图形
  private autoExpandCanvas() {
    if (!this.bounds) return;

    const padding = 50; // 边距
    const requiredWidth = this.bounds.maxX - this.bounds.minX + 2 * padding;
    const requiredHeight = this.bounds.maxY - this.bounds.minY + 2 * padding;

    // 如果需要的尺寸比当前画布大，就扩展画布
    if (requiredWidth > this.width) {
      this.width = Math.max(this.width, requiredWidth);
    }
    
    if (requiredHeight > this.height) {
      this.height = Math.max(this.height, requiredHeight);
    }
  }

  // 获取居中偏移量
  private getCenteringOffset() {
    if (!this.bounds) return { offsetX: 0, offsetY: 0 };
    
    const contentWidth = this.bounds.maxX - this.bounds.minX;
    const contentHeight = this.bounds.maxY - this.bounds.minY;
    
    const offsetX = (this.width - contentWidth) / 2 - this.bounds.minX;
    const offsetY = (this.height - contentHeight) / 2 - this.bounds.minY;
    
    return { offsetX, offsetY };
  }

  // 解析样式
  private parseStyle(style: string) {
    const result: any = {};
    
    // 线条粗细
    if (style.includes('thick')) result.strokeWidth = '3';
    else if (style.includes('thin')) result.strokeWidth = '1';
    else if (style.includes('ultra thick')) result.strokeWidth = '5';
    else if (style.includes('very thick')) result.strokeWidth = '4';
    else if (style.includes('semithick')) result.strokeWidth = '2.5';
    else if (style.includes('very thin')) result.strokeWidth = '0.5';
    else if (style.includes('ultra thin')) result.strokeWidth = '0.25';
    
    // 使用ColorParser解析颜色
    const colorPattern = /([a-zA-Z]+)!(\d+)/;
    const colorMatch = style.match(colorPattern);
    if (colorMatch) {
      const [, color, opacity] = colorMatch;
      const parsedColor = ColorParser.parse(color);
      result.stroke = parsedColor.value;
      result.opacity = (parseInt(opacity) / 100).toString();
    } else {
      // 基础颜色
      if (style.includes('blue')) result.stroke = ColorParser.parse('blue').value;
      else if (style.includes('red')) result.stroke = ColorParser.parse('red').value;
      else if (style.includes('green')) result.stroke = ColorParser.parse('green').value;
      else if (style.includes('black')) result.stroke = ColorParser.parse('black').value;
      else if (style.includes('white')) result.stroke = ColorParser.parse('white').value;
      else if (style.includes('yellow')) result.stroke = ColorParser.parse('yellow').value;
      else if (style.includes('orange')) result.stroke = ColorParser.parse('orange').value;
      else if (style.includes('purple')) result.stroke = ColorParser.parse('purple').value;
      else if (style.includes('brown')) result.stroke = ColorParser.parse('brown').value;
      else if (style.includes('pink')) result.stroke = ColorParser.parse('pink').value;
      else if (style.includes('gray')) result.stroke = ColorParser.parse('gray').value;
      else if (style.includes('cyan')) result.stroke = ColorParser.parse('cyan').value;
      else if (style.includes('magenta')) result.stroke = ColorParser.parse('magenta').value;
    }
    
    // 线条样式
    if (style.includes('dashed')) result.strokeDasharray = '5,5';
    else if (style.includes('dotted')) result.strokeDasharray = '2,2';
    else if (style.includes('loosely dashed')) result.strokeDasharray = '10,5';
    else if (style.includes('densely dashed')) result.strokeDasharray = '3,3';
    else if (style.includes('loosely dotted')) result.strokeDasharray = '5,2';
    else if (style.includes('densely dotted')) result.strokeDasharray = '1,1';
    
    // 箭头
    if (style.includes('->')) result.markerEnd = 'url(#arrowhead)';
    if (style.includes('<-')) result.markerStart = 'url(#arrowhead)';
    if (style.includes('<->')) {
      result.markerStart = 'url(#arrowhead)';
      result.markerEnd = 'url(#arrowhead)';
    }
    
    // 填充
    if (style.includes('fill')) {
      if (style.includes('fill=')) {
        const fillMatch = style.match(/fill=([a-zA-Z!0-9]+)/);
        if (fillMatch) {
          const fillColor = fillMatch[1];
          if (fillColor.includes('!')) {
            const [color, opacity] = fillColor.split('!');
            const parsedColor = ColorParser.parse(color);
            result.fill = parsedColor.value;
            result.fillOpacity = (parseInt(opacity) / 100).toString();
          } else {
            const parsedColor = ColorParser.parse(fillColor);
            result.fill = parsedColor.value;
          }
        }
      } else {
        result.fill = result.stroke || 'black';
      }
    }
    
    // 图案填充支持
    if (style.includes('pattern=')) {
      const patternMatch = style.match(/pattern=([a-zA-Z]+)/);
      if (patternMatch) {
        result.pattern = patternMatch[1];
        result.fill = `url(#pattern-${patternMatch[1]})`;
      }
    }
    
    // 渐变填充支持
    if (style.includes('top color=') && style.includes('bottom color=')) {
      const topColorMatch = style.match(/top color=([a-zA-Z]+)/);
      const bottomColorMatch = style.match(/bottom color=([a-zA-Z]+)/);
      if (topColorMatch && bottomColorMatch) {
        result.gradient = {
          type: 'vertical',
          startColor: ColorParser.parse(topColorMatch[1]).value,
          endColor: ColorParser.parse(bottomColorMatch[1]).value
        };
        result.fill = 'url(#gradient-vertical)';
      }
    }
    
    if (style.includes('left color=') && style.includes('right color=')) {
      const leftColorMatch = style.match(/left color=([a-zA-Z]+)/);
      const rightColorMatch = style.match(/right color=([a-zA-Z]+)/);
      if (leftColorMatch && rightColorMatch) {
        result.gradient = {
          type: 'horizontal',
          startColor: ColorParser.parse(leftColorMatch[1]).value,
          endColor: ColorParser.parse(rightColorMatch[1]).value
        };
        result.fill = 'url(#gradient-horizontal)';
      }
    }
    
    // 阴影效果
    if (style.includes('drop shadow')) {
      result.dropShadow = true;
      result.filter = 'url(#dropshadow)';
    }
    
    // 透明度
    if (style.includes('opacity=')) {
      const opacityMatch = style.match(/opacity=([0-9.]+)/);
      if (opacityMatch) {
        result.opacity = opacityMatch[1];
      }
    }
    
    // 默认样式
    if (!result.stroke) result.stroke = 'black';
    if (!result.strokeWidth) result.strokeWidth = '2';
    
    return result;
  }

  // 生成SVG
  private generateSVG(): string {
    let svgContent = `<svg width="${this.width}" height="${this.height}" xmlns="http://www.w3.org/2000/svg">`;
    
    // 添加SVG定义
    svgContent += this.generateDefinitions();
    
    // 背景
    svgContent += `<rect width="${this.width}" height="${this.height}" fill="#f8f9fa" stroke="#e9ecef" stroke-width="1"/>`;
    
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
      svgContent += `<text x="${this.width / 2}" y="${this.height - 10}" text-anchor="middle" font-size="12" fill="#666">TikZ 模拟渲染</text>`;
    }
    
    svgContent += '</svg>';
    return svgContent;
  }

  // 生成SVG定义
  private generateDefinitions(): string {
    let defs = '<defs>';
    
    // 箭头标记
    defs += `
      <marker id="arrowhead" markerWidth="10" markerHeight="7" 
              refX="10" refY="3.5" orient="auto">
        <polygon points="0 0, 10 3.5, 0 7" fill="black" />
      </marker>
    `;
    
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
    const gridSize = 50;
    
    for (let x = 0; x <= this.width; x += gridSize) {
      grid += `<line x1="${x}" y1="0" x2="${x}" y2="${this.height}" stroke="#e9ecef" stroke-width="0.5" opacity="0.5"/>`;
    }
    
    for (let y = 0; y <= this.height; y += gridSize) {
      grid += `<line x1="0" y1="${y}" x2="${this.width}" y2="${y}" stroke="#e9ecef" stroke-width="0.5" opacity="0.5"/>`;
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
      
      let pathAttributes = `stroke="${element.style.stroke}" stroke-width="${element.style.strokeWidth}"`;
      
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

  // 渲染圆形
  private renderCircle(element: any, offsetX: number = 0, offsetY: number = 0): string {
    try {
      let circleAttributes = `stroke="${element.style.stroke}" stroke-width="${element.style.strokeWidth}"`;
      
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
      return `<rect x="${element.x + offsetX}" y="${element.y + offsetY}" width="${element.width}" height="${element.height}" stroke="${element.style.stroke}" stroke-width="${element.style.strokeWidth}" fill="none"/>`;
    } catch (error) {
      // 错误日志已清理
      return '';
    }
  }

  // 渲染椭圆
  private renderEllipse(element: any, offsetX: number = 0, offsetY: number = 0): string {
    try {
      return `<ellipse cx="${element.x + offsetX}" cy="${element.y + offsetY}" rx="${element.rx}" ry="${element.ry}" stroke="${element.style.stroke}" stroke-width="${element.style.strokeWidth}" fill="none"/>`;
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
      
      let pathAttributes = `stroke="${element.style.stroke}" stroke-width="${element.style.strokeWidth}"`;
      
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
}

export const TikZPreview: React.FC<TikZPreviewProps> = ({
  code,
  format: _format = 'svg', // eslint-disable-line @typescript-eslint/no-unused-vars
  width = 400,
  height = 300,
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
