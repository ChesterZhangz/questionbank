// 绘图渲染器
// 生成各种类型的图表和函数图像

import { createSVGElement, setSVGAttributes, createSVGPath } from '../../utils/SVGUtils';
import { DataProcessor } from './DataProcessor';
import type { PlotCommand, PlotOptions } from './PgfplotsParser';
import type { AxisScale } from './AxisRenderer';

export interface PlotPoint {
  x: number;
  y: number;
  valid: boolean;
}

export interface MarkerStyle {
  shape: string;
  size: number;
  color: string;
  strokeWidth: number;
}

export interface LineStyle {
  color: string;
  width: number;
  dashArray?: string;
  opacity: number;
}

export class PlotRenderer {
  private scale: AxisScale;
  
  constructor(scale: AxisScale) {
    this.scale = scale;
  }

  /**
   * 渲染单个绘图命令
   */
  renderPlot(plot: PlotCommand): SVGGElement {
    const plotGroup = createSVGElement('g') as SVGGElement;
    setSVGAttributes(plotGroup, { 'class': 'pgfplot-series' });

    const points = this.generatePoints(plot);
    
    const lineStyle = this.createLineStyle(plot.options);
    const markerStyle = this.createMarkerStyle(plot.options);
    // 绘制线条
    if (!plot.options.only_marks) {
      const linePath = this.renderLine(points, lineStyle, plot.options.smooth);
      if (linePath) {
        plotGroup.appendChild(linePath);
      }
    }

    // 绘制标记点
    if (!plot.options.no_marks && plot.options.mark && plot.options.mark !== 'none') {
      const markers = this.renderMarkers(points, markerStyle);
      markers.forEach(marker => plotGroup.appendChild(marker));
    }

    return plotGroup;
  }

  /**
   * 生成绘图点
   */
  private generatePoints(plot: PlotCommand): PlotPoint[] {
    let result: PlotPoint[];
    switch (plot.type) {
      case 'function':
        result = this.generateFunctionPoints(plot.data as string, plot.options);
        break;
      case 'coordinates':
        result = this.parseCoordinates(plot.data as string);
        break;
      case 'table':
        result = this.parseTableData(plot.data as string);
        break;
      case 'expression':
        result = this.generateFunctionPoints(plot.data as string, plot.options);
        break;
      default:
        result = [];
    }
    
    return result;
  }

  /**
   * 生成函数图像点
   */
  private generateFunctionPoints(expression: string, options: PlotOptions): PlotPoint[] {
    // 现在expression应该始终是字符串
    if (typeof expression !== 'string') {
      console.error('expression 不是字符串！', expression, typeof expression);
      return [];
    }
    
    const domain = options.domain || [-5, 5];
    const samples = options.samples || 100;

    // 使用DataProcessor生成函数数据
    const functionPoints = DataProcessor.generateFunctionData(expression, domain, samples).data.map(point => ({
      x: point.x,
      y: point.y,
      valid: isFinite(point.y) // DataPoint没有valid属性，我们根据y值判断
    }));
    
    const result = functionPoints.map(point => {
      const screenX = this.scale.xScale(point.x);
      const screenY = this.scale.yScale(point.y);
      const isValid = point.valid && isFinite(point.y) && isFinite(screenX) && isFinite(screenY);
      
      return {
        x: screenX,
        y: screenY,
        valid: isValid
      };
    });
    
    return result;
  }

  /**
   * 解析坐标数据
   */
  private parseCoordinates(data: string): PlotPoint[] {
    const points: PlotPoint[] = [];
    
    // 匹配 (x,y) 格式的坐标
    const coordRegex = /\(\s*([^,\s]+)\s*,\s*([^)\s]+)\s*\)/g;
    let match;

    while ((match = coordRegex.exec(data)) !== null) {
      const x = parseFloat(match[1]);
      const y = parseFloat(match[2]);
      
      if (!isNaN(x) && !isNaN(y)) {
        points.push({
          x: this.scale.xScale(x),
          y: this.scale.yScale(y),
          valid: true
        });
      }
    }

    return points;
  }

  /**
   * 解析表格数据
   */
  private parseTableData(data: string): PlotPoint[] {
    const points: PlotPoint[] = [];
    const lines = data.trim().split('\n');

    for (const line of lines) {
      const values = line.trim().split(/\s+/);
      if (values.length >= 2) {
        const x = parseFloat(values[0]);
        const y = parseFloat(values[1]);
        
        if (!isNaN(x) && !isNaN(y)) {
          points.push({
            x: this.scale.xScale(x),
            y: this.scale.yScale(y),
            valid: true
          });
        }
      }
    }

    return points;
  }

  /**
   * 渲染线条
   */
  private renderLine(points: PlotPoint[], style: LineStyle, smooth: boolean = false): SVGPathElement | null {
    const validPoints = points.filter(p => p.valid);
    if (validPoints.length < 2) return null;

    let pathData: string;
    
    if (smooth) {
      pathData = this.createSmoothPath(validPoints);
    } else {
      pathData = this.createLinearPath(validPoints);
    }

    const path = createSVGPath(pathData);
    setSVGAttributes(path, {
      fill: 'none',
      stroke: style.color,
      'stroke-width': style.width,
      'stroke-opacity': style.opacity,
      ...(style.dashArray && { 'stroke-dasharray': style.dashArray })
    });

    return path;
  }

  /**
   * 创建线性路径
   */
  private createLinearPath(points: PlotPoint[]): string {
    const segments: string[] = [];
    let currentSegment: PlotPoint[] = [];

    for (const point of points) {
      if (point.valid) {
        currentSegment.push(point);
      } else {
        // 遇到无效点，结束当前线段
        if (currentSegment.length > 1) {
          segments.push(this.pointsToPathData(currentSegment));
        }
        currentSegment = [];
      }
    }

    // 处理最后一个线段
    if (currentSegment.length > 1) {
      segments.push(this.pointsToPathData(currentSegment));
    }

    return segments.join(' ');
  }

  /**
   * 创建平滑路径（贝塞尔曲线）
   */
  private createSmoothPath(points: PlotPoint[]): string {
    if (points.length < 3) {
      return this.createLinearPath(points);
    }

    const path: string[] = [];
    path.push(`M ${points[0].x} ${points[0].y}`);

    // 计算控制点
    for (let i = 1; i < points.length - 1; i++) {
      const p0 = points[i - 1];
      const p1 = points[i];
      const p2 = points[i + 1];

      // 计算切线方向
      const dx1 = (p1.x - p0.x) * 0.3;
      const dy1 = (p1.y - p0.y) * 0.3;
      const dx2 = (p2.x - p1.x) * 0.3;
      const dy2 = (p2.y - p1.y) * 0.3;

      const cp1x = p1.x - dx1;
      const cp1y = p1.y - dy1;
      const cp2x = p1.x + dx2;
      const cp2y = p1.y + dy2;

      if (i === 1) {
        path.push(`Q ${cp1x} ${cp1y} ${p1.x} ${p1.y}`);
      }
      
      if (i === points.length - 2) {
        path.push(`Q ${cp2x} ${cp2y} ${p2.x} ${p2.y}`);
      } else {
        path.push(`C ${cp1x} ${cp1y} ${cp2x} ${cp2y} ${p2.x} ${p2.y}`);
      }
    }

    return path.join(' ');
  }

  /**
   * 将点数组转换为SVG路径数据
   */
  private pointsToPathData(points: PlotPoint[]): string {
    if (points.length === 0) return '';
    
    const pathParts = [`M ${points[0].x} ${points[0].y}`];
    
    for (let i = 1; i < points.length; i++) {
      pathParts.push(`L ${points[i].x} ${points[i].y}`);
    }
    
    return pathParts.join(' ');
  }

  /**
   * 渲染标记点
   */
  private renderMarkers(points: PlotPoint[], style: MarkerStyle): SVGElement[] {
    const validPoints = points.filter(p => p.valid);
    return validPoints.map(point => this.createMarker(point, style));
  }

  /**
   * 创建单个标记点
   */
  private createMarker(point: PlotPoint, style: MarkerStyle): SVGElement {
    const { x, y } = point;
    const { shape, size, color, strokeWidth } = style;

    switch (shape) {
      case 'o':
        return this.createCircleMarker(x, y, size, color, strokeWidth);
      case '*':
        return this.createStarMarker(x, y, size, color);
      case 'x':
        return this.createCrossMarker(x, y, size, color, strokeWidth);
      case '+':
        return this.createPlusMarker(x, y, size, color, strokeWidth);
      case 'square':
        return this.createSquareMarker(x, y, size, color, strokeWidth);
      case 'triangle':
        return this.createTriangleMarker(x, y, size, color, strokeWidth);
      default:
        return this.createCircleMarker(x, y, size, color, strokeWidth);
    }
  }

  /**
   * 创建圆形标记
   */
  private createCircleMarker(x: number, y: number, size: number, color: string, strokeWidth: number): SVGCircleElement {
    const circle = createSVGElement('circle') as SVGCircleElement;
    setSVGAttributes(circle, {
      cx: x,
      cy: y,
      r: size,
      fill: 'none',
      stroke: color,
      'stroke-width': strokeWidth
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
      stroke: color,
      'stroke-width': 1
    });
    return star;
  }

  /**
   * 创建叉形标记
   */
  private createCrossMarker(x: number, y: number, size: number, color: string, strokeWidth: number): SVGGElement {
    const group = createSVGElement('g') as SVGGElement;
    
    const line1 = createSVGElement('line');
    setSVGAttributes(line1, {
      x1: x - size,
      y1: y - size,
      x2: x + size,
      y2: y + size,
      stroke: color,
      'stroke-width': strokeWidth
    });
    
    const line2 = createSVGElement('line');
    setSVGAttributes(line2, {
      x1: x - size,
      y1: y + size,
      x2: x + size,
      y2: y - size,
      stroke: color,
      'stroke-width': strokeWidth
    });
    
    group.appendChild(line1);
    group.appendChild(line2);
    return group;
  }

  /**
   * 创建加号标记
   */
  private createPlusMarker(x: number, y: number, size: number, color: string, strokeWidth: number): SVGGElement {
    const group = createSVGElement('g') as SVGGElement;
    
    const line1 = createSVGElement('line');
    setSVGAttributes(line1, {
      x1: x - size,
      y1: y,
      x2: x + size,
      y2: y,
      stroke: color,
      'stroke-width': strokeWidth
    });
    
    const line2 = createSVGElement('line');
    setSVGAttributes(line2, {
      x1: x,
      y1: y - size,
      x2: x,
      y2: y + size,
      stroke: color,
      'stroke-width': strokeWidth
    });
    
    group.appendChild(line1);
    group.appendChild(line2);
    return group;
  }

  /**
   * 创建方形标记
   */
  private createSquareMarker(x: number, y: number, size: number, color: string, strokeWidth: number): SVGRectElement {
    const square = createSVGElement('rect') as SVGRectElement;
    setSVGAttributes(square, {
      x: x - size,
      y: y - size,
      width: size * 2,
      height: size * 2,
      fill: 'none',
      stroke: color,
      'stroke-width': strokeWidth
    });
    return square;
  }

  /**
   * 创建三角形标记
   */
  private createTriangleMarker(x: number, y: number, size: number, color: string, strokeWidth: number): SVGPolygonElement {
    const triangle = createSVGElement('polygon') as SVGPolygonElement;
    const points = [
      `${x},${y - size}`,
      `${x - size},${y + size}`,
      `${x + size},${y + size}`
    ];
    setSVGAttributes(triangle, {
      points: points.join(' '),
      fill: 'none',
      stroke: color,
      'stroke-width': strokeWidth
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
   * 创建线条样式
   */
  private createLineStyle(options: PlotOptions): LineStyle {
    const style: LineStyle = {
      color: options.color || '#0066cc',
      width: options.line_width || 1.5,
      opacity: options.opacity || 1
    };

    // 设置线条样式
    switch (options.style) {
      case 'dashed':
        style.dashArray = '5,5';
        break;
      case 'dotted':
        style.dashArray = '2,2';
        break;
      case 'dashdotted':
        style.dashArray = '10,5,2,5';
        break;
      default:
        // solid - 不设置dashArray
        break;
    }

    return style;
  }

  /**
   * 创建标记样式
   */
  private createMarkerStyle(options: PlotOptions): MarkerStyle {
    return {
      shape: options.mark || 'o',
      size: options.mark_size || 3,
      color: options.color || '#0066cc',
      strokeWidth: 1.5
    };
  }
}

// 导出相关类型
// export type { PlotPoint, MarkerStyle, LineStyle };
