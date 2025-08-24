// TikZ 函数渲染器
// 纯 TikZ 实现，支持函数绘制、坐标轴、网格等

import { createSVGElement, setSVGAttributes } from '../../utils/SVGUtils';
import { TikZForeachUtils, type ForeachContext } from '../../utils/TikZForeachUtils';
import { TikZStyleParser } from '../../utils/TikZStyleParser';
import { TikZGeometryParser } from '../../utils/TikZGeometryParser';

export interface TikZAxisOptions {
  xmin?: number;
  xmax?: number;
  ymin?: number;
  ymax?: number;
  width?: number;
  height?: number;
  showGrid?: boolean;
  showTicks?: boolean;
  showArrows?: boolean;
  xlabel?: string;
  ylabel?: string;
  gridColor?: string;
  axisColor?: string;
  backgroundColor?: string;
}

export interface TikZFunctionOptions {
  color?: string;
  lineWidth?: number;
  style?: 'solid' | 'dashed' | 'dotted';
  samples?: number;
  domain?: [number, number];
  smooth?: boolean;
}

export interface TikZFunction {
  expression: string;
  options: TikZFunctionOptions;
}

export class TikZFunctionRenderer {
  private options: TikZAxisOptions;
  private functions: TikZFunction[] = [];
  private drawElements: any[] = [];
  private foreachStack: Array<ForeachContext> = [];
  private dimensions: {
    width: number;
    height: number;
    marginLeft: number;
    marginRight: number;
    marginTop: number;
    marginBottom: number;
    plotWidth: number;
    plotHeight: number;
  };

  /**
   * 检测是否为暗色模式
   */
  private isDarkMode(): boolean {
    // 检查 document.documentElement 的 class 是否包含 'dark'
    if (typeof document !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return false;
  }

  /**
   * 根据暗色/浅色模式返回适配的颜色
   */
  private getAdaptiveColor(lightColor: string, darkColor: string): string {
    return this.isDarkMode() ? darkColor : lightColor;
  }

  constructor(options: TikZAxisOptions = {}) {
    // 先设置默认选项
    this.options = {
      xmin: -5,
      xmax: 5,
      ymin: -5,
      ymax: 5,
      width: 500,
      height: 500,
      showGrid: true,
      showTicks: true,
      showArrows: true,
      gridColor: this.getAdaptiveColor('#e0e0e0', '#404040'),
      axisColor: this.getAdaptiveColor('#000000', '#ffffff'),
      backgroundColor: 'transparent',
      ...options
    };

    // 确保 width 和 height 有有效值
    if (!this.options.width) this.options.width = 500;
    if (!this.options.height) this.options.height = 500;

    // 然后计算尺寸
    this.dimensions = this.calculateDimensions();
  }

  /**
   * 计算尺寸和边距
   */
  private calculateDimensions() {
    const marginLeft = 40;
    const marginRight = 40;
    const marginTop = 40;
    const marginBottom = 40;

    const dimensions = {
      width: this.options.width!,
      height: this.options.height!,
      marginLeft,
      marginRight,
      marginTop,
      marginBottom,
      plotWidth: this.options.width! - marginLeft - marginRight,
      plotHeight: this.options.height! - marginTop - marginBottom
    };



    return dimensions;
  }

  /**
   * 添加函数
   */
  addFunction(expression: string, options: TikZFunctionOptions = {}) {
    this.functions.push({
      expression,
      options: {
        color: '#0066cc',
        lineWidth: 1.5,
        style: 'solid',
        samples: 100,
        domain: [this.options.xmin!, this.options.xmax!],
        smooth: true,
        ...options
      }
    });
  }

  /**
   * 坐标转换：数据坐标到屏幕坐标
   */
  private dataToScreen(x: number, y: number): { x: number; y: number } {
    const { marginLeft, marginTop, plotWidth, plotHeight } = this.dimensions;
    const { xmin, xmax, ymin, ymax } = this.options;

    const screenX = marginLeft + ((x - xmin!) / (xmax! - xmin!)) * plotWidth;
    const screenY = marginTop + plotHeight - ((y - ymin!) / (ymax! - ymin!)) * plotHeight;


    return { x: screenX, y: screenY };
  }

  // 屏幕坐标到数据坐标方法已移除（未使用）

  /**
   * 安全评估数学表达式
   */
  private evaluateFunction(expression: string, x: number): number | null {
    try {
      // 预处理表达式
      let processed = expression
        .replace(/\^/g, '**')  // 替换 ^ 为 **
        .replace(/\bx\b/g, `(${x})`)  // 替换变量 x
        .replace(/sin\(/g, 'Math.sin(')
        .replace(/cos\(/g, 'Math.cos(')
        .replace(/tan\(/g, 'Math.tan(')
        .replace(/log\(/g, 'Math.log10(')
        .replace(/ln\(/g, 'Math.log(')
        .replace(/sqrt\(/g, 'Math.sqrt(')
        .replace(/exp\(/g, 'Math.exp(')
        .replace(/abs\(/g, 'Math.abs(')
        .replace(/pi/g, 'Math.PI')
        .replace(/e/g, 'Math.E');

      // 创建安全的函数
      const func = new Function(`return ${processed}`);
      const result = func();

      // 检查结果是否有效
      if (typeof result === 'number' && isFinite(result)) {
        return result;
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * 生成函数数据点
   */
  private generateFunctionPoints(expression: string, domain: [number, number], samples: number): Array<{ x: number; y: number }> {
    const [xmin, xmax] = domain;
    const step = (xmax - xmin) / (samples - 1);
    const points: Array<{ x: number; y: number }> = [];

    for (let i = 0; i < samples; i++) {
      const x = xmin + i * step;
      const y = this.evaluateFunction(expression, x);
      
      if (y !== null) {
        points.push({ x, y });
      }
    }
    return points;
  }

  /**
   * 渲染用户定义的 TikZ 元素（坐标轴、网格、刻度等）
   */
  private renderUserElements(): SVGGElement {
    const userGroup = createSVGElement('g') as SVGGElement;
    setSVGAttributes(userGroup, { 'class': 'tikz-user-elements' });

    // 渲染用户通过 \draw 等命令定义的元素
    for (const drawElement of this.drawElements) {
      const element = this.renderDrawElement(drawElement);
      if (element) {
        userGroup.appendChild(element);
      }
    }
    
    return userGroup;
  }

  /**
   * 渲染单个绘制元素
   */
  private renderDrawElement(drawElement: any): SVGElement | null {
    const { type, options } = drawElement;
    
    if (type === 'line') {
      return this.renderLine(drawElement.path, options);
    } else if (type === 'node') {
      return this.renderNode(drawElement);
    } else if (type === 'grid') {
      return this.renderGrid(drawElement);
    } else if (type === 'rectangle') {
      return this.renderRectangle(drawElement);
    } else if (type === 'circle') {
      return this.renderCircle(drawElement);
    } else if (type === 'ellipse') {
      return this.renderEllipse(drawElement);
    } else if (type === 'arc') {
      return this.renderArc(drawElement);
    }
    
    return null;
  }

  /**
   * 渲染线条（包括箭头）
   */
  private renderLine(path: string, options: any): SVGGElement {
    const lineGroup = createSVGElement('g') as SVGGElement;
    
    // 解析路径：例如 "(-1,0)--(2,0)" 或 "(1,0) -- (2,0)"（支持空格）
    const pathMatch = path.match(/\(([^)]+)\)\s*--\s*\(([^)]+)\)/);
    if (!pathMatch) {
      return lineGroup;
    }
    
    const [, start, end] = pathMatch;
    const [x1, y1] = start.split(',').map(s => parseFloat(s.trim()));
    const [x2, y2] = end.split(',').map(s => parseFloat(s.trim()));
    
    // 转换为屏幕坐标
    const startScreen = this.dataToScreen(x1, y1);
    const endScreen = this.dataToScreen(x2, y2);
    
    // 创建线条
    const line = createSVGElement('line');
    let lineAttributes: any = {
      x1: startScreen.x,
      y1: startScreen.y,
      x2: endScreen.x,
      y2: endScreen.y,
      stroke: options.color || '#000000',
      'stroke-width': options.lineWidth || 1.5,
      'stroke-linecap': 'round'
    };
    
    // 如果有箭头，添加箭头标记
    if (options.hasArrow) {
      // 根据线条颜色选择对应的箭头
      let arrowId = 'arrowhead'; // 默认箭头
      
      if (options.color) {
        // 尝试匹配颜色名称
        const colorName = this.getColorName(options.color);
        if (colorName) {
          arrowId = `arrowhead-${colorName}`;
        }
      }
      
      lineAttributes['marker-end'] = `url(#${arrowId})`;
    }
    
    setSVGAttributes(line, lineAttributes);
    lineGroup.appendChild(line);
    
    return lineGroup;
  }

  /**
   * 渲染 node 标签
   */
  private renderNode(nodeElement: any): SVGGElement {
    const nodeGroup = createSVGElement('g') as SVGGElement;
    const { path, nodeOptions, nodeText, options } = nodeElement;
    
    // 解析路径以获取终点坐标（node通常放在线条的终点）
    const pathMatch = path.match(/\(([^)]+)\)\s*--\s*\(([^)]+)\)/);
    if (!pathMatch) return nodeGroup;
    
    const [, , end] = pathMatch;
    const [x2, y2] = end.split(',').map((s: string) => parseFloat(s.trim()));
    
    // 转换为屏幕坐标
    const endScreen = this.dataToScreen(x2, y2);
    
    // 解析 node 选项（如 right, left, above, below）
    const position = this.parseNodePosition(nodeOptions);
    
    // 计算文本位置偏移
    const offset = this.calculateNodeOffset(position);
    const textX = endScreen.x + offset.x;
    const textY = endScreen.y + offset.y;
    
    // 创建文本元素
    const textElement = createSVGElement('text');
    setSVGAttributes(textElement, {
      x: textX,
      y: textY,
      fill: options.color || this.getAdaptiveColor('#000000', '#ffffff'),
      'font-size': '14',
      'font-family': 'serif',
      'text-anchor': position.includes('right') ? 'start' : 
                     position.includes('left') ? 'end' : 'middle',
      'dominant-baseline': position.includes('above') ? 'text-after-edge' :
                          position.includes('below') ? 'text-before-edge' : 'central'
    });
    
    // 处理 LaTeX 数学表达式
    if (nodeText.includes('$')) {
      // 简单的 LaTeX 处理 - 移除 $ 符号并使用斜体
      const mathText = nodeText.replace(/\$/g, '');
      textElement.textContent = mathText;
      setSVGAttributes(textElement, { 'font-style': 'italic' });
    } else {
      textElement.textContent = nodeText;
    }
    
    nodeGroup.appendChild(textElement);
    return nodeGroup;
  }

  /**
   * 解析 node 位置选项
   */
  private parseNodePosition(nodeOptions: string): string {
    const options = nodeOptions.toLowerCase();
    if (options.includes('right')) return 'right';
    if (options.includes('left')) return 'left';
    if (options.includes('above')) return 'above';
    if (options.includes('below')) return 'below';
    return 'right'; // 默认位置
  }

  /**
   * 计算 node 文本的偏移量
   */
  private calculateNodeOffset(position: string): { x: number; y: number } {
    const offset = 10; // 基础偏移量
    
    switch (position) {
      case 'right':
        return { x: offset, y: 0 };
      case 'left':
        return { x: -offset, y: 0 };
      case 'above':
        return { x: 0, y: -offset };
      case 'below':
        return { x: 0, y: offset };
      default:
        return { x: offset, y: 0 };
    }
  }

  /**
   * 获取颜色名称（用于匹配箭头）
   */
  private getColorName(color: string): string | null {
    const colorMap: { [key: string]: string } = {
      '#ff0000': 'red',
      '#0000ff': 'blue', 
      '#00ff00': 'green',
      '#ffff00': 'yellow',
      '#ffa500': 'orange',
      '#800080': 'purple',
      '#ffc0cb': 'pink',
      '#8b4513': 'brown',
      '#808080': 'gray',
      '#000000': 'black',
      '#ffffff': 'white'
    };
    
    // 直接匹配颜色名称
    const lowerColor = color.toLowerCase();
    if (['red', 'blue', 'green', 'yellow', 'orange', 'purple', 'pink', 'brown', 'gray', 'grey', 'black', 'white'].includes(lowerColor)) {
      return lowerColor;
    }
    
    // 匹配十六进制颜色
    return colorMap[color.toLowerCase()] || null;
  }

  /**
   * 生成SVG定义（箭头标记）
   */
  private generateDefinitions(): string {
    let defs = '<defs>';
    
    // 基础箭头标记 - 支持暗色模式
    const isDarkMode = this.isDarkMode();
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
    
    defs += '</defs>';
    return defs;
  }



  /**
   * 渲染函数图像
   */
  private renderFunctions(): SVGGElement {
    const functionsGroup = createSVGElement('g') as SVGGElement;
    setSVGAttributes(functionsGroup, { 'class': 'tikz-functions' });

    for (const func of this.functions) {
      const { expression, options } = func;
      const { color = this.getAdaptiveColor('#0066cc', '#4d9fff'), lineWidth = 1.5, style = 'solid', samples = 100, domain, smooth = true } = options;

      // 生成函数数据点
      const points = this.generateFunctionPoints(expression, domain || [this.options.xmin!, this.options.xmax!], samples);
      
      if (points.length < 2) {
        continue;
      }

      // 创建路径
      const path = createSVGElement('path');
      const pathData = points.map((point, index) => {
        const screenPos = this.dataToScreen(point.x, point.y);
        return `${index === 0 ? 'M' : 'L'} ${screenPos.x} ${screenPos.y}`;
      }).join(' ');

      // 设置路径属性
      const strokeDasharray = style === 'dashed' ? '5,5' : 
                             style === 'dotted' ? '2,2' : 'none';

      setSVGAttributes(path, {
        d: pathData,
        stroke: color,
        'stroke-width': lineWidth,
        fill: 'none',
        'stroke-linecap': 'round',
        'stroke-linejoin': smooth ? 'round' : 'miter',
        'stroke-dasharray': strokeDasharray
      });

      functionsGroup.appendChild(path);
    }

    return functionsGroup;
  }

  /**
   * 自动缩放SVG以适应内容
   */
  private autoScale(svg: SVGSVGElement): void {
    try {
      // 计算所有图形元素的边界框
      const contentBounds = this.calculateContentBounds();
      
      if (!contentBounds) {
        // 设置默认viewBox
        setSVGAttributes(svg, {
          width: this.options.width!,
          height: this.options.height!,
          viewBox: `0 0 ${this.options.width!} ${this.options.height!}`,
          xmlns: 'http://www.w3.org/2000/svg'
        });
        return;
      }
      
      
      // 更新坐标范围选项，确保所有图形都在范围内
      this.options.xmin = Math.floor(contentBounds.minX - 1);
      this.options.xmax = Math.ceil(contentBounds.maxX + 1);
      this.options.ymin = Math.floor(contentBounds.minY - 1);
      this.options.ymax = Math.ceil(contentBounds.maxY + 1);
      
      // 重新计算尺寸
      this.dimensions = this.calculateDimensions();
      
      
      
      // 添加边距
      const margin = 80; // 增加边距，确保图形不会贴边
      const expandedBounds = {
        minX: contentBounds.minX - margin,
        minY: contentBounds.minY - margin,
        maxX: contentBounds.maxX + margin,
        maxY: contentBounds.maxY + margin
      };
      
      const contentWidth = expandedBounds.maxX - expandedBounds.minX;
      const contentHeight = expandedBounds.maxY - expandedBounds.minY;
      
      
      // 设置SVG属性和viewBox，确保内容完全在边框内
      setSVGAttributes(svg, {
        width: this.options.width!,
        height: this.options.height!,
        viewBox: `${expandedBounds.minX} ${expandedBounds.minY} ${contentWidth} ${contentHeight}`,
        xmlns: 'http://www.w3.org/2000/svg'
      });
      
      
      
    } catch (error) {
      // 回退到默认设置
      setSVGAttributes(svg, {
        width: this.options.width!,
        height: this.options.height!,
        viewBox: `0 0 ${this.options.width!} ${this.options.height!}`,
        xmlns: 'http://www.w3.org/2000/svg'
      });
    }
  }

  /**
   * 计算所有内容的边界框
   */
  private calculateContentBounds(): { minX: number; minY: number; maxX: number; maxY: number } | null {
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    let hasContent = false;
    
    // 计算用户绘制元素的边界
    for (const drawElement of this.drawElements) {
      if (drawElement.type === 'line') {
        const pathMatch = drawElement.path.match(/\(([^)]+)\)\s*--\s*\(([^)]+)\)/);
        if (pathMatch) {
          const [, start, end] = pathMatch;
          const [x1, y1] = start.split(',').map((s: string) => parseFloat(s.trim()));
          const [x2, y2] = end.split(',').map((s: string) => parseFloat(s.trim()));
          
          // 转换为屏幕坐标
          const startScreen = this.dataToScreen(x1, y1);
          const endScreen = this.dataToScreen(x2, y2);
          
          minX = Math.min(minX, startScreen.x, endScreen.x);
          minY = Math.min(minY, startScreen.y, endScreen.y);
          maxX = Math.max(maxX, startScreen.x, endScreen.x);
          maxY = Math.max(maxY, startScreen.y, endScreen.y);
          hasContent = true;
        }
      } else if (drawElement.type === 'rectangle') {
        // 计算矩形的边界
        const { x1, y1, x2, y2 } = drawElement;
        const topLeft = this.dataToScreen(Math.min(x1, x2), Math.max(y1, y2));
        const bottomRight = this.dataToScreen(Math.max(x1, x2), Math.min(y1, y2));
        
        minX = Math.min(minX, topLeft.x, bottomRight.x);
        minY = Math.min(minY, topLeft.y, bottomRight.y);
        maxX = Math.max(maxX, topLeft.x, bottomRight.x);
        maxY = Math.max(maxY, topLeft.y, bottomRight.y);
        hasContent = true;
      } else if (drawElement.type === 'circle') {
        // 计算圆形的边界
        const { x, y, r } = drawElement;
        const center = this.dataToScreen(x, y);
        const scaleX = this.dimensions.plotWidth / (this.options.xmax! - this.options.xmin!);
        const radiusInPixels = Math.abs(r * scaleX);
        
        minX = Math.min(minX, center.x - radiusInPixels);
        minY = Math.min(minY, center.y - radiusInPixels);
        maxX = Math.max(maxX, center.x + radiusInPixels);
        maxY = Math.max(maxY, center.y + radiusInPixels);
        hasContent = true;
      } else if (drawElement.type === 'ellipse') {
        // 计算椭圆的边界
        const { x, y, rx, ry } = drawElement;
        const center = this.dataToScreen(x, y);
        const scaleX = this.dimensions.plotWidth / (this.options.xmax! - this.options.xmin!);
        const scaleY = this.dimensions.plotHeight / (this.options.ymax! - this.options.ymin!);
        const rxInPixels = Math.abs(rx * scaleX);
        const ryInPixels = Math.abs(ry * scaleY);
        
        minX = Math.min(minX, center.x - rxInPixels);
        minY = Math.min(minY, center.y - ryInPixels);
        maxX = Math.max(maxX, center.x + rxInPixels);
        maxY = Math.max(maxY, center.y + ryInPixels);
        hasContent = true;
      } else if (drawElement.type === 'arc') {
        // 计算圆弧的边界
        const { x, y, radius } = drawElement;
        const center = this.dataToScreen(x, y);
        const scaleX = this.dimensions.plotWidth / (this.options.xmax! - this.options.xmin!);
        const radiusInPixels = Math.abs(radius * scaleX);
        
        // 圆弧的边界框是圆形
        minX = Math.min(minX, center.x - radiusInPixels);
        minY = Math.min(minY, center.y - radiusInPixels);
        maxX = Math.max(maxX, center.x + radiusInPixels);
        maxY = Math.max(maxY, center.y + radiusInPixels);
        hasContent = true;
      }
    }
    
    // 计算函数曲线的边界
    for (const func of this.functions) {
      const domain = func.options.domain || [this.options.xmin!, this.options.xmax!];
      const samples = func.options.samples || 200;
      const points = this.generateFunctionPoints(func.expression, domain, samples);
      for (const point of points) {
        const screenPoint = this.dataToScreen(point.x, point.y);
        minX = Math.min(minX, screenPoint.x);
        minY = Math.min(minY, screenPoint.y);
        maxX = Math.max(maxX, screenPoint.x);
        maxY = Math.max(maxY, screenPoint.y);
        hasContent = true;
      }
    }
    
    if (!hasContent) {
      return null;
    }
    
    return { minX, minY, maxX, maxY };
  }

  /**
   * 渲染完整的图表
   */
  render(): SVGSVGElement {
    
    // 确保尺寸有效
    if (!this.options.width) this.options.width = 500;
    if (!this.options.height) this.options.height = 500;
    
    let svg: SVGSVGElement;
    try {
      svg = createSVGElement('svg') as SVGSVGElement;
    } catch (error) {
      console.error('创建SVG元素失败:', error);
      throw error;
    }

    // 添加SVG定义（箭头标记等）
    svg.innerHTML = this.generateDefinitions();

    // 渲染用户定义的 TikZ 元素（包括坐标轴、网格、刻度等）
    const userElements = this.renderUserElements();
    svg.appendChild(userElements);
    
    // 渲染函数
    const functionElements = this.renderFunctions();
    svg.appendChild(functionElements);
    
    // 计算内容边界并自动缩放
    this.autoScale(svg);

    return svg;
  }

  /**
   * 解析 TikZ 代码并渲染
   */
  parseAndRender(code: string): string {
    // 清空现有函数和绘制元素
    this.functions = [];
    this.drawElements = [];

    // 解析 TikZ 代码
    this.parseTikZCode(code);

    // 确保 width 和 height 仍然有效
    if (!this.options.width) this.options.width = 500;
    if (!this.options.height) this.options.height = 500;

    // 重新计算尺寸（坐标轴范围可能已更新）
    this.dimensions = this.calculateDimensions();

    // 渲染图表
    const svg = this.render();
    return svg.outerHTML;
  }

  /**
   * 解析 TikZ 代码
   */
  private parseTikZCode(code: string) {
    this.drawElements = [];
    this.foreachStack = [];
    
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
            if (foreachContext.command) {
              // 如果同一行有命令，直接处理
              this.foreachStack.push(foreachContext);
              this.processForeachCommand(foreachContext.command, lineNumber);
            } else {
              // 存储foreach信息，等待下一行的命令
              this.foreachStack.push(foreachContext);
            }
          }
          continue;
        }
        
        // 解析函数绘制
        if (trimmedLine.includes('plot')) {
          this.parsePlotCommand(trimmedLine);
        }
        
        // 解析 draw 命令（坐标轴、网格等）
        const drawMatch = trimmedLine.match(/\\\\?draw\s*(?:\[([^\]]*)\])?\s*([^;]+);/);
        if (drawMatch && !drawMatch[2].includes('plot')) {
          const drawOptions = drawMatch[1] || '';
          const drawPath = drawMatch[2];
          
          if (drawPath.includes('grid')) {
            this.parseGrid(drawPath, drawOptions);
          } else if (drawPath.includes('rectangle')) {
            this.parseRectangle(drawPath, this.parseDrawOptions(drawOptions));
          } else if (drawPath.includes('circle')) {
            this.parseCircle(drawPath, this.parseDrawOptions(drawOptions));
          } else if (drawPath.includes('ellipse')) {
            this.parseEllipse(drawPath, this.parseDrawOptions(drawOptions));
          } else if (drawPath.includes('arc')) {
            this.parseArc(drawPath, this.parseDrawOptions(drawOptions));
          } else {
            // 处理线条和node
            this.drawElements.push({
              type: 'line',
              path: drawPath,
              options: this.parseDrawOptions(drawOptions)
            });
          }
        }
        
        // 解析坐标轴设置
        if (trimmedLine.includes('\\begin{axis}') || trimmedLine.includes('\\begin{tikzpicture}')) {
          this.parseAxisOptions(trimmedLine);
        }
        
        // 解析函数定义
        if (trimmedLine.includes('\\addplot')) {
          this.parseAddPlot(trimmedLine);
        }
        
      } catch (error) {
        console.warn(`第${lineNumber + 1}行解析失败:`, error);
        continue;
      }
    }
  }

  /**
   * 解析plot命令
   */
  private parsePlotCommand(line: string) {
    // 匹配 plot 命令（支持双反斜杠）
    const plotMatch = line.match(/\\\\?draw\s*(?:\[([^\]]*)\])?\s*plot\s*(?:\[([^\]]*)\])?\s*\{([^}]+)\}/);
    if (plotMatch) {
      const drawOptions = plotMatch[1] || '';
      const plotOptions = plotMatch[2] || '';
      const expression = plotMatch[3];

      // 解析选项
      const options = this.parsePlotOptions(drawOptions, plotOptions);
      
      // 添加函数
      this.addFunction(expression, options);
    }
  }

  /**
   * 解析addplot命令
   */
  private parseAddPlot(line: string) {
    // 匹配 \addplot 命令
    const addPlotMatch = line.match(/\\addplot\s*(?:\[([^\]]*)\])?\s*\{([^}]+)\}/);
    if (addPlotMatch) {
      const options = addPlotMatch[1] || '';
      const expression = addPlotMatch[2];
      
      // 解析选项
      const parsedOptions = this.parsePlotOptions(options, '');
      
      // 添加函数
      this.addFunction(expression, parsedOptions);
    }
  }

  /**
   * 解析绘图选项
   */
  private parsePlotOptions(drawOptions: string, plotOptions: string): TikZFunctionOptions {
    const options: TikZFunctionOptions = {};

    // 解析绘制选项
    if (drawOptions.includes('red')) options.color = this.getAdaptiveColor('#ff0000', '#ff6666');
    if (drawOptions.includes('blue')) options.color = this.getAdaptiveColor('#0000ff', '#6666ff');
    if (drawOptions.includes('green')) options.color = this.getAdaptiveColor('#00ff00', '#66ff66');
    if (drawOptions.includes('thick')) options.lineWidth = 2;
    if (drawOptions.includes('thin')) options.lineWidth = 0.5;
    if (drawOptions.includes('dashed')) options.style = 'dashed';
    if (drawOptions.includes('dotted')) options.style = 'dotted';

    // 解析绘图选项
    const domainMatch = plotOptions.match(/domain=([^,]+):([^,\]]+)/);
    if (domainMatch) {
      options.domain = [parseFloat(domainMatch[1]), parseFloat(domainMatch[2])];
    }

    const samplesMatch = plotOptions.match(/samples=(\d+)/);
    if (samplesMatch) {
      options.samples = parseInt(samplesMatch[1]);
    }

    const smoothMatch = plotOptions.match(/smooth/);
    if (smoothMatch) {
      options.smooth = true;
    }

    return options;
  }

  /**
   * 解析坐标轴选项
   */
  private parseAxisOptions(optionsString: string) {
    const xminMatch = optionsString.match(/xmin=([^,}]+)/);
    if (xminMatch) this.options.xmin = parseFloat(xminMatch[1]);

    const xmaxMatch = optionsString.match(/xmax=([^,}]+)/);
    if (xmaxMatch) this.options.xmax = parseFloat(xmaxMatch[1]);

    const yminMatch = optionsString.match(/ymin=([^,}]+)/);
    if (yminMatch) this.options.ymin = parseFloat(yminMatch[1]);

    const ymaxMatch = optionsString.match(/ymax=([^,}]+)/);
    if (ymaxMatch) this.options.ymax = parseFloat(ymaxMatch[1]);

    if (optionsString.includes('grid')) this.options.showGrid = true;
    if (optionsString.includes('no grid')) this.options.showGrid = false;
    if (optionsString.includes('ticks')) this.options.showTicks = true;
    if (optionsString.includes('no ticks')) this.options.showTicks = false;
  }



  /**
   * 解析矩形绘制命令
   */
  private parseRectangle(path: string, options: any) {
    const coords = TikZGeometryParser.parseRectangleCoords(path);
    
    if (coords && TikZGeometryParser.validateCoords(coords)) {
      this.drawElements.push({
        type: 'rectangle',
        x1: coords.x1, 
        y1: coords.y1, 
        x2: coords.x2, 
        y2: coords.y2,
        options
      });
    }
  }

  /**
   * 解析圆形绘制命令
   */
  private parseCircle(path: string, options: any) {
    const coords = TikZGeometryParser.parseCircleCoords(path);
    
    if (coords && TikZGeometryParser.validateCoords(coords)) {
      this.drawElements.push({
        type: 'circle',
        x: coords.x, 
        y: coords.y, 
        r: coords.radius,
        options
      });
    }
  }

  /**
   * 解析椭圆绘制命令
   */
  private parseEllipse(path: string, options: any) {
    const coords = TikZGeometryParser.parseEllipseCoords(path);
    
    if (coords && TikZGeometryParser.validateCoords(coords)) {
      this.drawElements.push({
        type: 'ellipse',
        x: coords.x, 
        y: coords.y, 
        rx: coords.rx, 
        ry: coords.ry,
        options
      });
    }
  }

  /**
   * 解析圆弧绘制命令
   */
  private parseArc(path: string, options: any) {
    const coords = TikZGeometryParser.parseArcCoords(path);
    
    if (coords && TikZGeometryParser.validateCoords(coords)) {
      this.drawElements.push({
        type: 'arc',
        x: coords.x, 
        y: coords.y, 
        radius: coords.radius, 
        startAngle: coords.startAngle, 
        endAngle: coords.endAngle,
        options
      });
    }
  }

  /**
   * 解析网格绘制命令
   */
  private parseGrid(path: string, options: string) {
    const coords = TikZGeometryParser.parseGridCoords(path, options);
    
    if (coords && TikZGeometryParser.validateCoords(coords)) {
      // 解析颜色和线宽
      const color = TikZStyleParser.parseColor(options) || this.getAdaptiveColor('#cccccc', '#444444');
      const lineWidth = TikZStyleParser.parseLineWidth(options) || 0.5;
      
      this.drawElements.push({
        type: 'grid',
        x1: coords.x1, 
        y1: coords.y1, 
        x2: coords.x2, 
        y2: coords.y2, 
        step: coords.step,
        options: { color, lineWidth }
      });
    }
  }

  /**
   * 渲染矩形
   */
  private renderRectangle(element: any): SVGGElement {
    const group = createSVGElement('g') as SVGGElement;
    const rect = createSVGElement('rect') as SVGRectElement;
    
    const { x1, y1, x2, y2, options } = element;
    
    // 转换坐标
    const topLeft = this.dataToScreen(Math.min(x1, x2), Math.max(y1, y2));
    const bottomRight = this.dataToScreen(Math.max(x1, x2), Math.min(y1, y2));
    
    const width = bottomRight.x - topLeft.x;
    const height = bottomRight.y - topLeft.y;
    
    setSVGAttributes(rect, {
      x: topLeft.x,
      y: topLeft.y,
      width: width,
      height: height,
      stroke: options.color,
      'stroke-width': options.lineWidth,
      fill: options.fill || 'none'
    });
    
    group.appendChild(rect);
    return group;
  }

  /**
   * 渲染圆形
   */
  private renderCircle(element: any): SVGGElement {
    const group = createSVGElement('g') as SVGGElement;
    const circle = createSVGElement('circle') as SVGCircleElement;
    
    const { x, y, r, options } = element;
    
    // 转换坐标
    const center = this.dataToScreen(x, y);
    // 计算缩放比例
    const scaleX = this.dimensions.plotWidth / (this.options.xmax! - this.options.xmin!);
    const radiusInPixels = Math.abs(r * scaleX);
    
    setSVGAttributes(circle, {
      cx: center.x,
      cy: center.y,
      r: radiusInPixels,
      stroke: options.color,
      'stroke-width': options.lineWidth,
      fill: options.fill || 'none'
    });
    
    group.appendChild(circle);
    return group;
  }

  /**
   * 渲染椭圆
   */
  private renderEllipse(element: any): SVGGElement {
    const group = createSVGElement('g') as SVGGElement;
    const ellipse = createSVGElement('ellipse') as SVGEllipseElement;
    
    const { x, y, rx, ry, options } = element;
    
    // 转换坐标
    const center = this.dataToScreen(x, y);
    // 计算缩放比例
    const scaleX = this.dimensions.plotWidth / (this.options.xmax! - this.options.xmin!);
    const scaleY = this.dimensions.plotHeight / (this.options.ymax! - this.options.ymin!);
    const rxInPixels = Math.abs(rx * scaleX);
    const ryInPixels = Math.abs(ry * scaleY);
    
    setSVGAttributes(ellipse, {
      cx: center.x,
      cy: center.y,
      rx: rxInPixels,
      ry: ryInPixels,
      stroke: options.color,
      'stroke-width': options.lineWidth,
      fill: options.fill || 'none'
    });
    
    group.appendChild(ellipse);
    return group;
  }

  /**
   * 渲染圆弧
   */
  private renderArc(element: any): SVGGElement {
    const group = createSVGElement('g') as SVGGElement;
    const path = createSVGElement('path') as SVGPathElement;
    
    const { x, y, radius, startAngle, endAngle, options } = element;
    
    // 转换坐标
    const center = this.dataToScreen(x, y);
    // 计算缩放比例
    const scaleX = this.dimensions.plotWidth / (this.options.xmax! - this.options.xmin!);
    const radiusInPixels = Math.abs(radius * scaleX);
    
    // 计算起始和结束点
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;
    
    const startX = center.x + radiusInPixels * Math.cos(startRad);
    const startY = center.y - radiusInPixels * Math.sin(startRad); // Y轴翻转
    const endX = center.x + radiusInPixels * Math.cos(endRad);
    const endY = center.y - radiusInPixels * Math.sin(endRad); // Y轴翻转
    
    // 判断是否是大弧
    const largeArcFlag = Math.abs(endAngle - startAngle) > 180 ? 1 : 0;
    
    // 创建SVG路径
    const pathData = `M ${startX} ${startY} A ${radiusInPixels} ${radiusInPixels} 0 ${largeArcFlag} 0 ${endX} ${endY}`;
    
    setSVGAttributes(path, {
      d: pathData,
      stroke: options.color,
      'stroke-width': options.lineWidth,
      fill: 'none'
    });
    
    group.appendChild(path);
    return group;
  }

  /**
   * 渲染网格
   */
  private renderGrid(element: any): SVGGElement {
    const group = createSVGElement('g') as SVGGElement;
    const { x1, y1, x2, y2, step, options } = element;
    
    const minX = Math.min(x1, x2);
    const maxX = Math.max(x1, x2);
    const minY = Math.min(y1, y2);
    const maxY = Math.max(y1, y2);
    
    // 生成垂直线
    for (let x = minX; x <= maxX; x += step) {
      const line = createSVGElement('line');
      const startPoint = this.dataToScreen(x, minY);
      const endPoint = this.dataToScreen(x, maxY);
      
      setSVGAttributes(line, {
        x1: startPoint.x,
        y1: startPoint.y,
        x2: endPoint.x,
        y2: endPoint.y,
        stroke: options.color,
        'stroke-width': options.lineWidth,
        opacity: 0.5
      });
      
      group.appendChild(line);
    }
    
    // 生成水平线
    for (let y = minY; y <= maxY; y += step) {
      const line = createSVGElement('line');
      const startPoint = this.dataToScreen(minX, y);
      const endPoint = this.dataToScreen(maxX, y);
      
      setSVGAttributes(line, {
        x1: startPoint.x,
        y1: startPoint.y,
        x2: endPoint.x,
        y2: endPoint.y,
        stroke: options.color,
        'stroke-width': options.lineWidth,
        opacity: 0.5
      });
      
      group.appendChild(line);
    }
    
    return group;
  }

  /**
   * 解析绘图选项
   */
  private parseDrawOptions(optionsString: string) {
    return TikZStyleParser.parseDrawOptions(optionsString);
  }

  /**
   * 处理foreach命令
   */
  private processForeachCommand(command: string, _lineNumber: number) {
    if (this.foreachStack.length === 0) return;
    
    const currentForeach = this.foreachStack[this.foreachStack.length - 1];
    
    // 如果这是第一次处理，设置命令
    if (currentForeach.command === '') {
      currentForeach.command = command;
    }
    
    // 使用工具类处理foreach命令
    TikZForeachUtils.processForeachCommand(currentForeach, (expandedCommand: string, _lineNumber: number) => {
      // 递归解析展开后的命令
      try {
        if (expandedCommand.includes('plot')) {
          this.parsePlotCommand(expandedCommand);
        } else if (expandedCommand.includes('\\draw')) {
          const drawMatch = expandedCommand.match(/\\\\?draw\s*(?:\[([^\]]*)\])?\s*([^;]+);/);
          if (drawMatch) {
            const drawOptions = drawMatch[1] || '';
            const drawPath = drawMatch[2];
            
            if (drawPath.includes('grid')) {
              this.parseGrid(drawPath, drawOptions);
            } else if (drawPath.includes('rectangle')) {
              this.parseRectangle(drawPath, this.parseDrawOptions(drawOptions));
            } else if (drawPath.includes('circle')) {
              this.parseCircle(drawPath, this.parseDrawOptions(drawOptions));
            } else if (drawPath.includes('ellipse')) {
              this.parseEllipse(drawPath, this.parseDrawOptions(drawOptions));
            } else if (drawPath.includes('arc')) {
              this.parseArc(drawPath, this.parseDrawOptions(drawOptions));
            } else {
              this.drawElements.push({
                type: 'line',
                path: drawPath,
                options: this.parseDrawOptions(drawOptions)
              });
            }
          }
        }
      } catch (error) {
        console.warn(`foreach展开命令解析失败: ${expandedCommand}`, error);
      }
    });
    
    // 当前foreach处理完成，移除它
    this.foreachStack.pop();
  }
}
