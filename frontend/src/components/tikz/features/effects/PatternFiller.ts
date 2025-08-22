// TikZ 图案填充器
import { createSVGElement, setSVGAttributes } from '../../utils/SVGUtils';

export interface PatternOptions {
  id: string;
  width: number;
  height: number;
  patternUnits?: 'userSpaceOnUse' | 'objectBoundingBox';
  patternContentUnits?: 'userSpaceOnUse' | 'objectBoundingBox';
}

export interface TikZPattern {
  id: string;
  element: SVGPatternElement;
  options: PatternOptions;
}

export class PatternFiller {
  private static patternCounter = 0;

  /**
   * 创建图案
   */
  static createPattern(options: PatternOptions): TikZPattern {
    const pattern = createSVGElement('pattern') as SVGPatternElement;
    
    setSVGAttributes(pattern, {
      id: options.id,
      width: options.width,
      height: options.height,
      patternUnits: options.patternUnits || 'objectBoundingBox',
      patternContentUnits: options.patternContentUnits || 'objectBoundingBox'
    });

    return {
      id: options.id,
      element: pattern,
      options
    };
  }

  /**
   * 创建点状图案
   */
  static createDotsPattern(
    dotSize: number = 2,
    spacing: number = 10,
    color: string = 'black'
  ): TikZPattern {
    const id = `dots-pattern-${++this.patternCounter}`;
    const pattern = this.createPattern({
      id,
      width: spacing,
      height: spacing
    });

    const circle = createSVGElement('circle');
    setSVGAttributes(circle, {
      cx: spacing / 2,
      cy: spacing / 2,
      r: dotSize,
      fill: color
    });

    pattern.element.appendChild(circle);
    return pattern;
  }

  /**
   * 创建线条图案
   */
  static createLinesPattern(
    lineWidth: number = 1,
    spacing: number = 10,
    angle: number = 45,
    color: string = 'black'
  ): TikZPattern {
    const id = `lines-pattern-${++this.patternCounter}`;
    const pattern = this.createPattern({
      id,
      width: spacing,
      height: spacing
    });

    const line = createSVGElement('line');
    const radians = (angle * Math.PI) / 180;
    const cos = Math.cos(radians);
    const sin = Math.sin(radians);
    
    // 计算线条的起点和终点
    const x1 = spacing / 2 - (spacing * cos) / 2;
    const y1 = spacing / 2 - (spacing * sin) / 2;
    const x2 = spacing / 2 + (spacing * cos) / 2;
    const y2 = spacing / 2 + (spacing * sin) / 2;

    setSVGAttributes(line, {
      x1,
      y1,
      x2,
      y2,
      stroke: color,
      'stroke-width': lineWidth
    });

    pattern.element.appendChild(line);
    return pattern;
  }

  /**
   * 创建网格图案
   */
  static createGridPattern(
    gridSize: number = 10,
    lineWidth: number = 1,
    color: string = 'black'
  ): TikZPattern {
    const id = `grid-pattern-${++this.patternCounter}`;
    const pattern = this.createPattern({
      id,
      width: gridSize,
      height: gridSize
    });

    // 垂直线
    const verticalLine = createSVGElement('line');
    setSVGAttributes(verticalLine, {
      x1: gridSize / 2,
      y1: 0,
      x2: gridSize / 2,
      y2: gridSize,
      stroke: color,
      'stroke-width': lineWidth
    });

    // 水平线
    const horizontalLine = createSVGElement('line');
    setSVGAttributes(horizontalLine, {
      x1: 0,
      y1: gridSize / 2,
      x2: gridSize,
      y2: gridSize / 2,
      stroke: color,
      'stroke-width': lineWidth
    });

    pattern.element.appendChild(verticalLine);
    pattern.element.appendChild(horizontalLine);
    return pattern;
  }

  /**
   * 创建斜线图案
   */
  static createDiagonalPattern(
    lineWidth: number = 1,
    spacing: number = 10,
    color: string = 'black'
  ): TikZPattern {
    const id = `diagonal-pattern-${++this.patternCounter}`;
    const pattern = this.createPattern({
      id,
      width: spacing,
      height: spacing
    });

    // 创建两条交叉的斜线
    const line1 = createSVGElement('line');
    setSVGAttributes(line1, {
      x1: 0,
      y1: 0,
      x2: spacing,
      y2: spacing,
      stroke: color,
      'stroke-width': lineWidth
    });

    const line2 = createSVGElement('line');
    setSVGAttributes(line2, {
      x1: spacing,
      y1: 0,
      x2: 0,
      y2: spacing,
      stroke: color,
      'stroke-width': lineWidth
    });

    pattern.element.appendChild(line1);
    pattern.element.appendChild(line2);
    return pattern;
  }

  /**
   * 创建波浪图案
   */
  static createWavesPattern(
    amplitude: number = 3,
    frequency: number = 2,
    lineWidth: number = 1,
    color: string = 'black'
  ): TikZPattern {
    const id = `waves-pattern-${++this.patternCounter}`;
    const pattern = this.createPattern({
      id,
      width: 20,
      height: 20
    });

    const path = createSVGElement('path');
    const d = this.generateWavePath(amplitude, frequency);
    
    setSVGAttributes(path, {
      d,
      fill: 'none',
      stroke: color,
      'stroke-width': lineWidth
    });

    pattern.element.appendChild(path);
    return pattern;
  }

  /**
   * 创建星星图案
   */
  static createStarsPattern(
    starSize: number = 5,
    spacing: number = 20,
    color: string = 'black'
  ): TikZPattern {
    const id = `stars-pattern-${++this.patternCounter}`;
    const pattern = this.createPattern({
      id,
      width: spacing,
      height: spacing
    });

    const star = this.createStar(starSize, color);
    setSVGAttributes(star, {
      transform: `translate(${spacing / 2}, ${spacing / 2})`
    });

    pattern.element.appendChild(star);
    return pattern;
  }

  /**
   * 创建六边形图案
   */
  static createHexagonPattern(
    hexSize: number = 8,
    spacing: number = 20,
    color: string = 'black'
  ): TikZPattern {
    const id = `hexagon-pattern-${++this.patternCounter}`;
    const pattern = this.createPattern({
      id,
      width: spacing,
      height: spacing
    });

    const hexagon = this.createHexagon(hexSize, color);
    setSVGAttributes(hexagon, {
      transform: `translate(${spacing / 2}, ${spacing / 2})`
    });

    pattern.element.appendChild(hexagon);
    return pattern;
  }

  /**
   * 创建TikZ风格的图案
   */
  static createTikZPattern(patternType: string): TikZPattern {
    switch (patternType.toLowerCase()) {
      case 'dots':
        return this.createDotsPattern();
      case 'lines':
        return this.createLinesPattern();
      case 'grid':
        return this.createGridPattern();
      case 'diagonal':
        return this.createDiagonalPattern();
      case 'waves':
        return this.createWavesPattern();
      case 'stars':
        return this.createStarsPattern();
      case 'hexagon':
        return this.createHexagonPattern();
      default:
        return this.createDotsPattern();
    }
  }

  /**
   * 解析TikZ图案语法
   */
  static parseTikZPattern(patternString: string): TikZPattern | null {
    const trimmed = patternString.trim();
    
    // 解析 pattern 语法
    if (trimmed.startsWith('pattern')) {
      return this.parsePattern(trimmed);
    }
    
    // 解析预定义图案类型
    const predefinedTypes = ['dots', 'lines', 'grid', 'diagonal', 'waves', 'stars', 'hexagon'];
    for (const type of predefinedTypes) {
      if (trimmed.includes(type)) {
        return this.createTikZPattern(type);
      }
    }
    
    return null;
  }

  /**
   * 解析 pattern 语法
   */
  private static parsePattern(patternString: string): TikZPattern {
    // 提取参数
    const typeMatch = patternString.match(/type=([^,\s]+)/);
    const sizeMatch = patternString.match(/size=([-\d.]+)/);
    const spacingMatch = patternString.match(/spacing=([-\d.]+)/);
    const colorMatch = patternString.match(/color=([^,\s]+)/);
    
    const type = typeMatch ? typeMatch[1] : 'dots';
    const size = sizeMatch ? parseFloat(sizeMatch[1]) : 2;
    const spacing = spacingMatch ? parseFloat(spacingMatch[1]) : 10;
    const color = colorMatch ? colorMatch[1] : 'black';
    
    switch (type.toLowerCase()) {
      case 'dots':
        return this.createDotsPattern(size, spacing, color);
      case 'lines':
        return this.createLinesPattern(size, spacing, 45, color);
      case 'grid':
        return this.createGridPattern(spacing, size, color);
      case 'diagonal':
        return this.createDiagonalPattern(size, spacing, color);
      case 'waves':
        return this.createWavesPattern(size, 2, 1, color);
      case 'stars':
        return this.createStarsPattern(size, spacing, color);
      case 'hexagon':
        return this.createHexagonPattern(size, spacing, color);
      default:
        return this.createDotsPattern(size, spacing, color);
    }
  }

  /**
   * 应用图案到SVG元素
   */
  static applyPattern(element: SVGElement, pattern: TikZPattern): void {
    // 确保元素有defs父元素
    let defs = element.querySelector('defs') as SVGDefsElement;
    if (!defs) {
      defs = createSVGElement('defs') as SVGDefsElement;
      element.appendChild(defs);
    }
    
    // 添加图案
    defs.appendChild(pattern.element);
    
    // 应用图案到元素
    element.setAttribute('fill', `url(#${pattern.id})`);
  }

  /**
   * 移除图案
   */
  static removePattern(element: SVGElement): void {
    element.removeAttribute('fill');
  }

  /**
   * 生成波浪路径
   */
  private static generateWavePath(amplitude: number, frequency: number): string {
    const points: string[] = [];
    const steps = 20;
    
    for (let i = 0; i <= steps; i++) {
      const x = (i / steps) * 20;
      const y = 10 + amplitude * Math.sin((i / steps) * 2 * Math.PI * frequency);
      points.push(`${x},${y}`);
    }
    
    return `M ${points.join(' L ')}`;
  }

  /**
   * 创建星星形状
   */
  private static createStar(size: number, color: string): SVGElement {
    const star = createSVGElement('path');
    const d = this.generateStarPath(size);
    
    setSVGAttributes(star, {
      d,
      fill: color
    });
    
    return star;
  }

  /**
   * 生成星星路径
   */
  private static generateStarPath(size: number): string {
    const points: string[] = [];
    const spikes = 5;
    
    for (let i = 0; i < spikes * 2; i++) {
      const angle = (i * Math.PI) / spikes;
      const radius = i % 2 === 0 ? size : size / 2;
      const x = radius * Math.cos(angle);
      const y = radius * Math.sin(angle);
      points.push(`${x},${y}`);
    }
    
    return `M ${points.join(' L ')} Z`;
  }

  /**
   * 创建六边形形状
   */
  private static createHexagon(size: number, color: string): SVGElement {
    const hexagon = createSVGElement('path');
    const d = this.generateHexagonPath(size);
    
    setSVGAttributes(hexagon, {
      d,
      fill: 'none',
      stroke: color,
      'stroke-width': 1
    });
    
    return hexagon;
  }

  /**
   * 生成六边形路径
   */
  private static generateHexagonPath(size: number): string {
    const points: string[] = [];
    
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3;
      const x = size * Math.cos(angle);
      const y = size * Math.sin(angle);
      points.push(`${x},${y}`);
    }
    
    return `M ${points.join(' L ')} Z`;
  }

  /**
   * 获取图案的CSS值
   */
  static getCSSPattern(_pattern: TikZPattern): string {
    // CSS不支持复杂的图案，返回简单的颜色
    return 'currentColor';
  }
}
