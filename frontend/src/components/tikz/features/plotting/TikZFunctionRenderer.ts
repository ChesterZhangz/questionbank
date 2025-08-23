// TikZ 函数渲染器
// 纯 TikZ 实现，支持函数绘制、坐标轴、网格等

import { createSVGElement, setSVGAttributes } from '../../utils/SVGUtils';

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
      width: 400,
      height: 300,
      showGrid: true,
      showTicks: true,
      showArrows: true,
      gridColor: this.getAdaptiveColor('#e0e0e0', '#404040'),
      axisColor: this.getAdaptiveColor('#000000', '#ffffff'),
      backgroundColor: 'transparent',
      ...options
    };

    // 确保 width 和 height 有有效值
    if (!this.options.width) this.options.width = 400;
    if (!this.options.height) this.options.height = 300;

    // 然后计算尺寸
    this.dimensions = this.calculateDimensions();
  }

  /**
   * 计算尺寸和边距
   */
  private calculateDimensions() {
    const marginLeft = 60;
    const marginRight = 20;
    const marginTop = 40;
    const marginBottom = 60;

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
    setSVGAttributes(line, {
      x1: startScreen.x,
      y1: startScreen.y,
      x2: endScreen.x,
      y2: endScreen.y,
      stroke: options.color || '#000000',
      'stroke-width': options.lineWidth || 1.5,
      'stroke-linecap': 'round'
    });
    lineGroup.appendChild(line);
    
    // 如果有箭头，添加箭头
    if (options.hasArrow) {
      // 传递屏幕坐标的差值作为方向向量
      const arrow = this.createArrowHead(endScreen.x, endScreen.y, endScreen.x - startScreen.x, endScreen.y - startScreen.y, options);
      lineGroup.appendChild(arrow);
    }
    
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
   * 创建箭头头部
   */
  private createArrowHead(x: number, y: number, dx: number, dy: number, options: any): SVGGElement {
    const arrowGroup = createSVGElement('g') as SVGGElement;
    
    // 标准化方向向量
    const length = Math.sqrt(dx * dx + dy * dy);
    if (length === 0) return arrowGroup;
    
    const unitX = dx / length;
    const unitY = dy / length;
    
    const arrowLength = 8;
    const arrowAngle = Math.PI / 6; 
    
    const line1X = x - arrowLength * (unitX * Math.cos(arrowAngle) + unitY * Math.sin(arrowAngle));
    const line1Y = y - arrowLength * (unitY * Math.cos(arrowAngle) - unitX * Math.sin(arrowAngle));
    
    const line2X = x - arrowLength * (unitX * Math.cos(arrowAngle) - unitY * Math.sin(arrowAngle));
    const line2Y = y - arrowLength * (unitY * Math.cos(arrowAngle) + unitX * Math.sin(arrowAngle));
    
    // 创建箭头的两条线
    const arrowLine1 = createSVGElement('line');
    setSVGAttributes(arrowLine1, {
      x1: x,
      y1: y,
      x2: line1X,
      y2: line1Y,
      stroke: options.color || '#000000',
      'stroke-width': options.lineWidth || 1.5,
      'stroke-linecap': 'round'
    });
    
    const arrowLine2 = createSVGElement('line');
    setSVGAttributes(arrowLine2, {
      x1: x,
      y1: y,
      x2: line2X,
      y2: line2Y,
      stroke: options.color || '#000000',
      'stroke-width': options.lineWidth || 1.5,
      'stroke-linecap': 'round'
    });
    
    arrowGroup.appendChild(arrowLine1);
    arrowGroup.appendChild(arrowLine2);
    
    return arrowGroup;
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
    if (!this.options.height) this.options.height = 400;
    
    let svg: SVGSVGElement;
    try {
      svg = createSVGElement('svg') as SVGSVGElement;
    } catch (error) {
      console.error('创建SVG元素失败:', error);
      throw error;
    }


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
    if (!this.options.height) this.options.height = 400;

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
    const lines = code.split('\n');
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // 跳过空行和注释
      if (!trimmedLine || trimmedLine.startsWith('%')) {
        continue;
      }

      // 解析 plot 命令（支持双反斜杠）
      const plotMatch = trimmedLine.match(/\\\\?draw\s*(?:\[([^\]]*)\])?\s*plot\s*(?:\[([^\]]*)\])?\s*\{([^}]+)\}/);
      if (plotMatch) {
        const drawOptions = plotMatch[1] || '';
        const plotOptions = plotMatch[2] || '';
        const expression = plotMatch[3];

        // 解析选项
        const options = this.parsePlotOptions(drawOptions, plotOptions);
        
        // 添加函数
        this.addFunction(expression, options);
      }

      // 解析 draw 命令（坐标轴、网格等）
      const drawMatch = trimmedLine.match(/\\\\?draw\s*(?:\[([^\]]*)\])?\s*([^;]+);/);
      if (drawMatch && !drawMatch[2].includes('plot')) { // 排除 plot 命令
        const drawOptions = drawMatch[1] || '';
        const drawPath = drawMatch[2];
        
        // 解析选项
        const hasArrow = drawOptions.includes('->');
        
        const options = {
          hasArrow,
          color: this.parseColor(drawOptions) || this.getAdaptiveColor('#000000', '#ffffff'),
          lineWidth: this.parseLineWidth(drawOptions) || 1.5,
          fill: this.parseFill(drawOptions)
        };
        
        // 检查是否是图形绘制命令
        if (drawPath.includes('rectangle')) {
          this.parseRectangle(drawPath, options);
        } else if (drawPath.includes('circle')) {
          this.parseCircle(drawPath, options);
        } else if (drawPath.includes('ellipse')) {
          this.parseEllipse(drawPath, options);
        } else if (drawPath.includes('arc')) {
          this.parseArc(drawPath, options);
        } else {
          // 检查是否包含 node，支持多种node位置格式
          const nodeMatches = [];
          let cleanPath = drawPath;
          const globalNodeRegex = /node\s*\[([^\]]*)\]\s*\{([^}]+)\}/g;
          let nodeMatch;
          
          while ((nodeMatch = globalNodeRegex.exec(drawPath)) !== null) {
            nodeMatches.push({
              fullMatch: nodeMatch[0],
              nodeOptions: nodeMatch[1],
              nodeText: nodeMatch[2],
              startIndex: nodeMatch.index
            });
          }
          
          // 移除所有node部分，得到纯路径
          cleanPath = drawPath.replace(/node\s*\[([^\]]*)\]\s*\{([^}]+)\}/g, '').trim();
          
          // 添加线条元素（使用清理后的路径）
          if (cleanPath) {
            this.drawElements.push({
              type: 'line',
              path: cleanPath,
              options
            });
          }
          
          // 为每个node添加独立的元素
          nodeMatches.forEach((node) => {
            // 确定node的位置：
            // 如果node在路径中间，我们需要分析它应该位于哪个坐标
            let nodePosition = this.determineNodePosition(drawPath, cleanPath, node);
            
            this.drawElements.push({
              type: 'node',
              path: nodePosition,
              nodeOptions: node.nodeOptions.trim(),
              nodeText: node.nodeText.trim(),
              options: { color: options.color }
            });
          });
        }
      }

      // 解析坐标轴设置（支持双反斜杠）
      const axisMatch = trimmedLine.match(/\\\\?tikzset\s*\{([^}]+)\}/);
      if (axisMatch) {
        this.parseAxisOptions(axisMatch[1]);
      }
    }
    
  }

  /**
   * 确定node的位置坐标
   */
  private determineNodePosition(originalPath: string, cleanPath: string, nodeInfo: any): string {
    // 提取所有坐标点
    const coordMatches = cleanPath.match(/\(([^)]+)\)/g);
    if (!coordMatches || coordMatches.length === 0) {
      return cleanPath; // 返回原路径作为后备
    }
    
    // 分析node在原始路径中的位置
    const beforeNode = originalPath.substring(0, nodeInfo.startIndex);
    const coordsBeforeNode = beforeNode.match(/\(([^)]+)\)/g) || [];
    
    // 确定node应该关联的坐标
    let targetCoord: string;
    
    if (coordsBeforeNode.length > 0) {
      // node前面有坐标，使用最后一个坐标
      targetCoord = coordsBeforeNode[coordsBeforeNode.length - 1];
    } else {
      // node前面没有坐标，使用第一个坐标
      targetCoord = coordMatches[0];
    }
    
    // 创建一个只包含目标坐标的路径，用于node定位
    return `${targetCoord}--${targetCoord}`;
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
   * 解析颜色选项
   */
  private parseColor(options: string): string | null {
    // 匹配颜色名称并转换为适配暗色模式的hex值
    const colorMatch = options.match(/\b(red|blue|green|yellow|orange|purple|pink|brown|gray|black|white)\b/);
    if (colorMatch) {
      const colorName = colorMatch[1];
      // 根据颜色名称返回适配暗色模式的hex值
      switch (colorName) {
        case 'red': return this.getAdaptiveColor('#ff0000', '#ff6666');
        case 'blue': return this.getAdaptiveColor('#0000ff', '#6666ff');
        case 'green': return this.getAdaptiveColor('#00ff00', '#66ff66');
        case 'yellow': return this.getAdaptiveColor('#ffff00', '#ffff66');
        case 'orange': return this.getAdaptiveColor('#ffa500', '#ffcc66');
        case 'purple': return this.getAdaptiveColor('#800080', '#cc66cc');
        case 'pink': return this.getAdaptiveColor('#ffc0cb', '#ffccdd');
        case 'brown': return this.getAdaptiveColor('#8b4513', '#cc9966');
        case 'gray': return this.getAdaptiveColor('#808080', '#cccccc');
        case 'black': return this.getAdaptiveColor('#000000', '#ffffff');
        case 'white': return this.getAdaptiveColor('#ffffff', '#000000');
        default: return this.getAdaptiveColor('#000000', '#ffffff');
      }
    }
    
    // 匹配 RGB 颜色（保持原样，用户自定义颜色）
    const rgbMatch = options.match(/rgb\(([^)]+)\)/);
    if (rgbMatch) {
      return `rgb(${rgbMatch[1]})`;
    }
    
    // 匹配 hex 颜色（保持原样，用户自定义颜色）
    const hexMatch = options.match(/#[0-9a-fA-F]{6}/);
    if (hexMatch) {
      return hexMatch[0];
    }
    
    return null;
  }

  /**
   * 解析线宽选项
   */
  private parseLineWidth(options: string): number | null {
    if (options.includes('thick')) return 2;
    if (options.includes('thin')) return 0.5;
    if (options.includes('very thick')) return 3;
    if (options.includes('ultra thick')) return 4;
    
    // 匹配具体数值
    const widthMatch = options.match(/line width=([0-9.]+)/);
    if (widthMatch) {
      return parseFloat(widthMatch[1]);
    }
    
    return null;
  }

  /**
   * 解析填充选项
   */
  private parseFill(options: string): string | null {
    const fillMatch = options.match(/fill=([^,\]]+)/);
    if (fillMatch) {
      return fillMatch[1].trim();
    }
    
    if (options.includes('fill')) {
      return '#cccccc'; // 默认填充颜色
    }
    
    return null;
  }

  /**
   * 解析矩形绘制命令
   */
  private parseRectangle(path: string, options: any) {
    // 匹配 (x1,y1) rectangle (x2,y2) 格式
    const rectMatch = path.match(/\(([^,]+),([^)]+)\)\s+rectangle\s+\(([^,]+),([^)]+)\)/);
    if (rectMatch) {
      const x1 = parseFloat(rectMatch[1]);
      const y1 = parseFloat(rectMatch[2]);
      const x2 = parseFloat(rectMatch[3]);
      const y2 = parseFloat(rectMatch[4]);
      
      this.drawElements.push({
        type: 'rectangle',
        x1, y1, x2, y2,
        options
      });
      
    }
  }

  /**
   * 解析圆形绘制命令
   */
  private parseCircle(path: string, options: any) {
    // 匹配 (x,y) circle (r) 格式
    const circleMatch = path.match(/\(([^,]+),([^)]+)\)\s+circle\s+\(([^)]+)\)/);
    if (circleMatch) {
      const x = parseFloat(circleMatch[1]);
      const y = parseFloat(circleMatch[2]);
      const r = parseFloat(circleMatch[3]);
      
      this.drawElements.push({
        type: 'circle',
        x, y, r,
        options
      });
    }
  }

  /**
   * 解析椭圆绘制命令
   */
  private parseEllipse(path: string, options: any) {
    // 匹配 (x,y) ellipse (rx and ry) 格式
    const ellipseMatch = path.match(/\(([^,]+),([^)]+)\)\s+ellipse\s+\(([^)]+)\s+and\s+([^)]+)\)/);
    if (ellipseMatch) {
      const x = parseFloat(ellipseMatch[1]);
      const y = parseFloat(ellipseMatch[2]);
      const rx = parseFloat(ellipseMatch[3]);
      const ry = parseFloat(ellipseMatch[4]);
      
      this.drawElements.push({
        type: 'ellipse',
        x, y, rx, ry,
        options
      });
    }
  }

  /**
   * 解析圆弧绘制命令
   */
  private parseArc(path: string, options: any) {
    // 匹配 (x,y) arc (start:end:radius) 格式
    const arcMatch = path.match(/\(([^,]+),([^)]+)\)\s+arc\s+\(([^:]+):([^:]+):([^)]+)\)/);
    if (arcMatch) {
      const x = parseFloat(arcMatch[1]);
      const y = parseFloat(arcMatch[2]);
      const startAngle = parseFloat(arcMatch[3]);
      const endAngle = parseFloat(arcMatch[4]);
      const radius = parseFloat(arcMatch[5]);
      
      this.drawElements.push({
        type: 'arc',
        x, y, radius, startAngle, endAngle,
        options
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
}
