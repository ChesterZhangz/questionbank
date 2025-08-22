// 图例渲染器
// 生成pgfplots风格的图例系统

import { createSVGElement, setSVGAttributes } from '../../utils/SVGUtils';
import { LaTeXRenderer } from '../../../../lib/latex/renderer/LaTeXRenderer';

export interface LegendItem {
  label: string;
  color: string;
  lineStyle?: 'solid' | 'dashed' | 'dotted' | 'dashdotted';
  lineWidth?: number;
  marker?: string;
  markerSize?: number;
  markerColor?: string;
}

export interface LegendOptions {
  position: 'north east' | 'north west' | 'south east' | 'south west' | 'outer north east';
  fontSize?: number;
  fontFamily?: string;
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  padding?: number;
  spacing?: number;
  showFrame?: boolean;
  showBackground?: boolean;
}

export class LegendRenderer {
  private items: LegendItem[];
  private options: LegendOptions;
  private containerDimensions: { width: number; height: number };
  private latexRenderer: LaTeXRenderer;

  constructor(
    items: LegendItem[] = [],
    options: LegendOptions = { position: 'north east' },
    containerDimensions: { width: number; height: number } = { width: 400, height: 300 }
  ) {
    this.items = items;
    this.options = {
      fontSize: 12,
      fontFamily: 'Arial, sans-serif',
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      borderColor: '#cccccc',
      borderWidth: 1,
      padding: 8,
      spacing: 4,
      showFrame: true,
      showBackground: true,
      ...options
    };
    this.containerDimensions = containerDimensions;
    this.latexRenderer = new LaTeXRenderer({ mode: 'lightweight' });
  }

  /**
   * 渲染图例
   */
  renderLegend(): SVGGElement | null {
    if (this.items.length === 0) {
      return null;
    }

    const legendGroup = createSVGElement('g') as SVGGElement;
    setSVGAttributes(legendGroup, { 'class': 'pgfplots-legend' });

    // 计算图例尺寸和位置
    const legendDimensions = this.calculateLegendDimensions();
    const legendPosition = this.calculateLegendPosition(legendDimensions);

    // 创建背景和边框
    if (this.options.showBackground || this.options.showFrame) {
      const background = this.createLegendBackground(legendDimensions, legendPosition);
      legendGroup.appendChild(background);
    }

    // 渲染图例项
    const itemsGroup = this.renderLegendItems(legendDimensions, legendPosition);
    legendGroup.appendChild(itemsGroup);

    return legendGroup;
  }

  /**
   * 计算图例尺寸
   */
  private calculateLegendDimensions(): { width: number; height: number } {
    const { fontSize = 12, padding = 8, spacing = 4 } = this.options;
    const itemHeight = fontSize + spacing;
    const maxLabelWidth = Math.max(...this.items.map(item => this.getTextWidth(item.label, fontSize)));
    
    // 图例项宽度：图标宽度 + 间距 + 标签宽度
    const iconWidth = 20; // 图标宽度
    const itemSpacing = 8; // 图标和标签之间的间距
    const itemWidth = iconWidth + itemSpacing + maxLabelWidth;
    
    const width = itemWidth + padding * 2;
    const height = this.items.length * itemHeight + padding * 2;

    return { width, height };
  }

  /**
   * 计算图例位置
   */
  private calculateLegendPosition(legendDimensions: { width: number; height: number }): { x: number; y: number } {
    const { width: containerWidth, height: containerHeight } = this.containerDimensions;
    const { width: legendWidth, height: legendHeight } = legendDimensions;
    const margin = 20; // 距离容器边缘的边距

    switch (this.options.position) {
      case 'north east':
        return {
          x: containerWidth - legendWidth - margin,
          y: margin
        };
      case 'north west':
        return {
          x: margin,
          y: margin
        };
      case 'south east':
        return {
          x: containerWidth - legendWidth - margin,
          y: containerHeight - legendHeight - margin
        };
      case 'south west':
        return {
          x: margin,
          y: containerHeight - legendHeight - margin
        };
      case 'outer north east':
        return {
          x: containerWidth + margin,
          y: margin
        };
      default:
        return {
          x: containerWidth - legendWidth - margin,
          y: margin
        };
    }
  }

  /**
   * 创建图例背景
   */
  private createLegendBackground(
    dimensions: { width: number; height: number },
    position: { x: number; y: number }
  ): SVGRectElement {
    const background = createSVGElement('rect') as SVGRectElement;
    
    const attributes: Record<string, string | number> = {
      x: position.x,
      y: position.y,
      width: dimensions.width,
      height: dimensions.height,
      rx: 4, // 圆角
      ry: 4
    };

    if (this.options.showBackground) {
      attributes.fill = this.options.backgroundColor || 'rgba(255, 255, 255, 0.9)';
    } else {
      attributes.fill = 'none';
    }

    if (this.options.showFrame) {
      attributes.stroke = this.options.borderColor || '#cccccc';
      attributes['stroke-width'] = this.options.borderWidth || 1;
    }

    setSVGAttributes(background, attributes);
    return background;
  }

  /**
   * 渲染图例项
   */
  private renderLegendItems(
    _dimensions: { width: number; height: number },
    position: { x: number; y: number }
  ): SVGGElement {
    const itemsGroup = createSVGElement('g') as SVGGElement;
    const { padding = 8, spacing = 4, fontSize = 12 } = this.options;

    this.items.forEach((item, index) => {
      const itemY = position.y + padding + index * (fontSize + spacing);
      const itemGroup = this.renderLegendItem(item, position.x + padding, itemY);
      itemsGroup.appendChild(itemGroup);
    });

    return itemsGroup;
  }

  /**
   * 渲染单个图例项
   */
  private renderLegendItem(item: LegendItem, x: number, y: number): SVGGElement {
    const itemGroup = createSVGElement('g') as SVGGElement;
    const iconWidth = 20;
    const itemSpacing = 8;

    // 渲染线条图标
    if (item.lineStyle !== undefined) {
      const lineIcon = this.createLineIcon(item, x, y, iconWidth);
      itemGroup.appendChild(lineIcon);
    }

    // 渲染标记图标
    if (item.marker && item.marker !== 'none') {
      const markerIcon = this.createMarkerIcon(item, x + iconWidth / 2, y + this.options.fontSize! / 2);
      itemGroup.appendChild(markerIcon);
    }

    // 渲染标签
    const label = this.createLabel(item, x + iconWidth + itemSpacing, y);
    itemGroup.appendChild(label);
    
    // 标签创建完成

    return itemGroup;
  }

  /**
   * 创建线条图标
   */
  private createLineIcon(item: LegendItem, x: number, y: number, width: number): SVGPathElement {
    const path = createSVGElement('path') as SVGPathElement;
    const centerY = y + this.options.fontSize! / 2;
    
    let pathData = `M ${x} ${centerY} L ${x + width} ${centerY}`;
    let dashArray: string | undefined;

    // 设置线条样式
    switch (item.lineStyle) {
      case 'dashed':
        dashArray = '3,3';
        break;
      case 'dotted':
        dashArray = '1,2';
        break;
      case 'dashdotted':
        dashArray = '6,2,1,2';
        break;
      default:
        // solid - 不设置dashArray
        break;
    }

    setSVGAttributes(path, {
      d: pathData,
      stroke: item.color || '#000000',
      'stroke-width': item.lineWidth || 1.5,
      fill: 'none',
      ...(dashArray && { 'stroke-dasharray': dashArray })
    });

    return path;
  }

  /**
   * 创建标记图标
   */
  private createMarkerIcon(item: LegendItem, x: number, y: number): SVGElement {
    const { marker = 'o', markerSize = 3, markerColor, color } = item;
    const iconColor = markerColor || color || '#000000';

    switch (marker) {
      case 'o':
        return this.createCircleMarker(x, y, markerSize, iconColor);
      case '*':
        return this.createStarMarker(x, y, markerSize, iconColor);
      case 'x':
        return this.createCrossMarker(x, y, markerSize, iconColor);
      case '+':
        return this.createPlusMarker(x, y, markerSize, iconColor);
      case 'square':
        return this.createSquareMarker(x, y, markerSize, iconColor);
      case 'triangle':
        return this.createTriangleMarker(x, y, markerSize, iconColor);
      default:
        return this.createCircleMarker(x, y, markerSize, iconColor);
    }
  }

  /**
   * 创建圆形标记
   */
  private createCircleMarker(x: number, y: number, size: number, color: string): SVGCircleElement {
    const circle = createSVGElement('circle') as SVGCircleElement;
    setSVGAttributes(circle, {
      cx: x,
      cy: y,
      r: size,
      fill: color,
      stroke: 'none'
    });
    return circle;
  }

  /**
   * 创建星形标记
   */
  private createStarMarker(x: number, y: number, size: number, color: string): SVGPolygonElement {
    const star = createSVGElement('polygon') as SVGPolygonElement;
    const points = this.generateStarPoints(x, y, size);
    setSVGAttributes(star, {
      points: points.map(p => `${p.x},${p.y}`).join(' '),
      fill: color,
      stroke: 'none'
    });
    return star;
  }

  /**
   * 创建叉形标记
   */
  private createCrossMarker(x: number, y: number, size: number, color: string): SVGGElement {
    const group = createSVGElement('g') as SVGGElement;
    
    const line1 = createSVGElement('line');
    setSVGAttributes(line1, {
      x1: x - size,
      y1: y - size,
      x2: x + size,
      y2: y + size,
      stroke: color,
      'stroke-width': 1
    });
    
    const line2 = createSVGElement('line');
    setSVGAttributes(line2, {
      x1: x - size,
      y1: y + size,
      x2: x + size,
      y2: y - size,
      stroke: color,
      'stroke-width': 1
    });
    
    group.appendChild(line1);
    group.appendChild(line2);
    return group;
  }

  /**
   * 创建加号标记
   */
  private createPlusMarker(x: number, y: number, size: number, color: string): SVGGElement {
    const group = createSVGElement('g') as SVGGElement;
    
    const line1 = createSVGElement('line');
    setSVGAttributes(line1, {
      x1: x - size,
      y1: y,
      x2: x + size,
      y2: y,
      stroke: color,
      'stroke-width': 1
    });
    
    const line2 = createSVGElement('line');
    setSVGAttributes(line2, {
      x1: x,
      y1: y - size,
      x2: x,
      y2: y + size,
      stroke: color,
      'stroke-width': 1
    });
    
    group.appendChild(line1);
    group.appendChild(line2);
    return group;
  }

  /**
   * 创建方形标记
   */
  private createSquareMarker(x: number, y: number, size: number, color: string): SVGRectElement {
    const square = createSVGElement('rect') as SVGRectElement;
    setSVGAttributes(square, {
      x: x - size,
      y: y - size,
      width: size * 2,
      height: size * 2,
      fill: color,
      stroke: 'none'
    });
    return square;
  }

  /**
   * 创建三角形标记
   */
  private createTriangleMarker(x: number, y: number, size: number, color: string): SVGPolygonElement {
    const triangle = createSVGElement('polygon') as SVGPolygonElement;
    const points = [
      `${x},${y - size}`,
      `${x - size},${y + size}`,
      `${x + size},${y + size}`
    ];
    setSVGAttributes(triangle, {
      points: points.join(' '),
      fill: color,
      stroke: 'none'
    });
    return triangle;
  }

  /**
   * 生成星形点坐标
   */
  private generateStarPoints(centerX: number, centerY: number, size: number): Array<{x: number, y: number}> {
    const points: Array<{x: number, y: number}> = [];
    const spikes = 5;
    const outerRadius = size;
    const innerRadius = size * 0.4;

    for (let i = 0; i < spikes * 2; i++) {
      const angle = (i * Math.PI) / spikes;
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      points.push({
        x: centerX + Math.cos(angle - Math.PI / 2) * radius,
        y: centerY + Math.sin(angle - Math.PI / 2) * radius
      });
    }

    return points;
  }

  /**
   * 创建标签
   */
  private createLabel(item: LegendItem, x: number, y: number): SVGTextElement {
    const { fontSize = 12 } = this.options;
    
    // 创建SVG文本元素
    const textElement = createSVGElement('text') as SVGTextElement;
    
    // 渲染LaTeX内容
    const renderResult = this.latexRenderer.render(item.label);
    
    // 如果LaTeX渲染成功，提取纯文本内容
    if (renderResult.html && renderResult.html.trim().length > 0) {
      // 从KaTeX HTML中提取纯文本内容
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = renderResult.html;
      const textContent = tempDiv.textContent || tempDiv.innerText || item.label.replace(/\$/g, '');
      
      // 设置SVG文本属性
      setSVGAttributes(textElement, {
        x: x,
        y: y,
        'font-family': 'KaTeX_Main, "Times New Roman", serif',
        'font-size': `${fontSize}px`,
        'fill': '#000000',
        'text-anchor': 'start',
        'dominant-baseline': 'middle',
        'pointer-events': 'none'
      });
      
      // 设置文本内容
      textElement.textContent = textContent;
    } else {
      // 备用：使用简化的数学符号显示
      setSVGAttributes(textElement, {
        x: x,
        y: y,
        'font-family': 'KaTeX_Main, "Times New Roman", serif',
        'font-size': `${fontSize}px`,
        'fill': '#0000AA', // 蓝色表示备用
        'text-anchor': 'start',
        'dominant-baseline': 'middle',
        'pointer-events': 'none',
        'font-style': 'italic'
      });
      
      textElement.textContent = item.label.replace(/\$/g, '') + ' [FALLBACK]';
    }
    
    return textElement;
  }

  // 调试方法已移除

  /**
   * 获取文本宽度（近似值）
   */
  private getTextWidth(text: string, fontSize: number): number {
    // 简单的字符宽度估算
    const charWidth = fontSize * 0.6;
    return text.length * charWidth;
  }

  /**
   * 添加图例项
   */
  addItem(item: LegendItem): void {
    this.items.push(item);
  }

  /**
   * 移除图例项
   */
  removeItem(index: number): void {
    if (index >= 0 && index < this.items.length) {
      this.items.splice(index, 1);
    }
  }

  /**
   * 清空图例
   */
  clearItems(): void {
    this.items = [];
  }

  /**
   * 获取图例项
   */
  getItems(): LegendItem[] {
    return [...this.items];
  }

  /**
   * 设置图例选项
   */
  setOptions(options: Partial<LegendOptions>): void {
    this.options = { ...this.options, ...options };
  }

  /**
   * 获取图例选项
   */
  getOptions(): LegendOptions {
    return { ...this.options };
  }
}
