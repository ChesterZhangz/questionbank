// TikZ 渐变引擎
import { createSVGLinearGradient, createSVGRadialGradient } from '../../utils/SVGUtils';
import { ColorParser } from './ColorParser';

export interface GradientStop {
  offset: string;
  color: string;
  opacity?: number;
}

export interface LinearGradient {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  stops: GradientStop[];
  units?: 'userSpaceOnUse' | 'objectBoundingBox';
}

export interface RadialGradient {
  id: string;
  cx: number;
  cy: number;
  r: number;
  fx?: number;
  fy?: number;
  stops: GradientStop[];
  units?: 'userSpaceOnUse' | 'objectBoundingBox';
}

export class GradientEngine {
  private static gradientCounter = 0;

  /**
   * 创建线性渐变
   */
  static createLinearGradient(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    stops: GradientStop[],
    units: 'userSpaceOnUse' | 'objectBoundingBox' = 'objectBoundingBox'
  ): LinearGradient {
    const id = `linear-gradient-${++this.gradientCounter}`;
    
    return {
      id,
      x1,
      y1,
      x2,
      y2,
      stops: this.normalizeStops(stops),
      units
    };
  }

  /**
   * 创建径向渐变
   */
  static createRadialGradient(
    cx: number,
    cy: number,
    r: number,
    stops: GradientStop[],
    fx?: number,
    fy?: number,
    units: 'userSpaceOnUse' | 'objectBoundingBox' = 'objectBoundingBox'
  ): RadialGradient {
    const id = `radial-gradient-${++this.gradientCounter}`;
    
    return {
      id,
      cx,
      cy,
      r,
      fx: fx ?? cx,
      fy: fy ?? cy,
      stops: this.normalizeStops(stops),
      units
    };
  }

  /**
   * 创建水平渐变（从左到右）
   */
  static createHorizontalGradient(stops: GradientStop[]): LinearGradient {
    return this.createLinearGradient(0, 0, 1, 0, stops);
  }

  /**
   * 创建垂直渐变（从上到下）
   */
  static createVerticalGradient(stops: GradientStop[]): LinearGradient {
    return this.createLinearGradient(0, 0, 0, 1, stops);
  }

  /**
   * 创建对角渐变（左上到右下）
   */
  static createDiagonalGradient(stops: GradientStop[]): LinearGradient {
    return this.createLinearGradient(0, 0, 1, 1, stops);
  }

  /**
   * 创建圆形渐变（从中心向外）
   */
  static createCircularGradient(stops: GradientStop[]): RadialGradient {
    return this.createRadialGradient(0.5, 0.5, 0.5, stops);
  }

  /**
   * 创建彩虹渐变
   */
  static createRainbowGradient(): LinearGradient {
    const stops: GradientStop[] = [
      { offset: '0%', color: 'red' },
      { offset: '16.67%', color: 'orange' },
      { offset: '33.33%', color: 'yellow' },
      { offset: '50%', color: 'green' },
      { offset: '66.67%', color: 'blue' },
      { offset: '83.33%', color: 'indigo' },
      { offset: '100%', color: 'violet' }
    ];
    
    return this.createHorizontalGradient(stops);
  }

  /**
   * 创建金属渐变
   */
  static createMetallicGradient(baseColor: string = 'silver'): LinearGradient {
    const lightColor = ColorParser.lighten(baseColor, 0.3);
    const darkColor = ColorParser.darken(baseColor, 0.3);
    
    const stops: GradientStop[] = [
      { offset: '0%', color: lightColor },
      { offset: '25%', color: baseColor },
      { offset: '50%', color: darkColor },
      { offset: '75%', color: baseColor },
      { offset: '100%', color: lightColor }
    ];
    
    return this.createVerticalGradient(stops);
  }

  /**
   * 创建玻璃渐变
   */
  static createGlassGradient(baseColor: string = 'white'): LinearGradient {
    const transparentColor = ColorParser.parse(baseColor);
    const transparent = transparentColor.isValid 
      ? transparentColor.value.replace('rgb', 'rgba').replace(')', ', 0.1)')
      : 'rgba(255, 255, 255, 0.1)';
    
    const stops: GradientStop[] = [
      { offset: '0%', color: transparent },
      { offset: '50%', color: baseColor },
      { offset: '100%', color: transparent }
    ];
    
    return this.createVerticalGradient(stops);
  }

  /**
   * 创建阴影渐变
   */
  static createShadowGradient(color: string = 'black'): RadialGradient {
    const transparent = ColorParser.parse(color);
    const transparentColor = transparent.isValid 
      ? transparent.value.replace('rgb', 'rgba').replace(')', ', 0.8)')
      : 'rgba(0, 0, 0, 0.8)';
    
    const stops: GradientStop[] = [
      { offset: '0%', color: transparentColor },
      { offset: '70%', color: ColorParser.parse(color).value },
      { offset: '100%', color: 'transparent' }
    ];
    
    return this.createCircularGradient(stops);
  }

  /**
   * 解析TikZ渐变语法
   */
  static parseTikZGradient(gradientString: string): LinearGradient | RadialGradient | null {
    const trimmed = gradientString.trim();
    
    // 解析 \shade[top] 语法
    if (trimmed.startsWith('\\shade[') && trimmed.endsWith(']')) {
      const direction = trimmed.slice(7, -1);
      return this.parseShadeDirection(direction);
    }
    
    // 解析 \shade (0,0) rectangle (1,1); 语法
    if (trimmed.includes('rectangle')) {
      return this.parseRectangleShade(trimmed);
    }
    
    // 解析 \shade (0,0) circle (1); 语法
    if (trimmed.includes('circle')) {
      return this.parseCircleShade(trimmed);
    }
    
    return null;
  }

  /**
   * 解析 \shade[top] 方向
   */
  private static parseShadeDirection(direction: string): LinearGradient {
    const stops: GradientStop[] = [
      { offset: '0%', color: 'white' },
      { offset: '100%', color: 'gray' }
    ];
    
    switch (direction.toLowerCase()) {
      case 'top':
      case 'north':
        return this.createVerticalGradient(stops);
      case 'bottom':
      case 'south':
        return this.createVerticalGradient(stops.reverse());
      case 'left':
      case 'west':
        return this.createHorizontalGradient(stops);
      case 'right':
      case 'east':
        return this.createHorizontalGradient(stops.reverse());
      case 'northwest':
        return this.createLinearGradient(0, 0, 1, 1, stops);
      case 'northeast':
        return this.createLinearGradient(1, 0, 0, 1, stops);
      case 'southwest':
        return this.createLinearGradient(0, 1, 1, 0, stops);
      case 'southeast':
        return this.createLinearGradient(1, 1, 0, 0, stops);
      default:
        return this.createVerticalGradient(stops);
    }
  }

  /**
   * 解析矩形渐变
   */
  private static parseRectangleShade(_gradientString: string): LinearGradient {
    // 简化实现，返回默认渐变
    const stops: GradientStop[] = [
      { offset: '0%', color: 'white' },
      { offset: '100%', color: 'gray' }
    ];
    
    return this.createVerticalGradient(stops);
  }

  /**
   * 解析圆形渐变
   */
  private static parseCircleShade(_gradientString: string): RadialGradient {
    // 简化实现，返回默认渐变
    const stops: GradientStop[] = [
      { offset: '0%', color: 'white' },
      { offset: '100%', color: 'gray' }
    ];
    
    return this.createCircularGradient(stops);
  }

  /**
   * 标准化渐变停止点
   */
  private static normalizeStops(stops: GradientStop[]): GradientStop[] {
    if (!stops || stops.length === 0) {
      return [
        { offset: '0%', color: 'black' },
        { offset: '100%', color: 'white' }
      ];
    }

    if (stops.length === 1) {
      return [
        { offset: '0%', color: stops[0].color, opacity: stops[0].opacity },
        { offset: '100%', color: stops[0].color, opacity: stops[0].opacity }
      ];
    }

    // 确保第一个和最后一个停止点有正确的偏移
    const normalized = [...stops];
    
    if (!normalized[0].offset || normalized[0].offset === '0') {
      normalized[0].offset = '0%';
    }
    
    if (!normalized[normalized.length - 1].offset || normalized[normalized.length - 1].offset === '1') {
      normalized[normalized.length - 1].offset = '100%';
    }

    // 为中间的停止点添加偏移（如果没有的话）
    for (let i = 1; i < normalized.length - 1; i++) {
      if (!normalized[i].offset) {
        const prevOffset = parseFloat(normalized[i - 1].offset);
        const nextOffset = parseFloat(normalized[i + 1].offset);
        const offset = prevOffset + (nextOffset - prevOffset) / 2;
        normalized[i].offset = `${offset}%`;
      }
    }

    return normalized;
  }

  /**
   * 生成SVG渐变元素
   */
  static generateSVGGradient(gradient: LinearGradient | RadialGradient): SVGElement {
    if ('x1' in gradient) {
      // 线性渐变
      return createSVGLinearGradient(
        gradient.id,
        gradient.x1,
        gradient.y1,
        gradient.x2,
        gradient.y2,
        gradient.stops
      );
    } else {
      // 径向渐变
      return createSVGRadialGradient(
        gradient.id,
        gradient.cx,
        gradient.cy,
        gradient.r,
        gradient.stops
      );
    }
  }

  /**
   * 获取渐变的CSS值
   */
  static getCSSGradient(gradient: LinearGradient | RadialGradient): string {
    if ('x1' in gradient) {
      // 线性渐变
      const angle = Math.atan2(gradient.y2 - gradient.y1, gradient.x2 - gradient.x1) * 180 / Math.PI;
      const stops = gradient.stops.map(stop => 
        `${stop.color} ${stop.offset}`
      ).join(', ');
      
      return `linear-gradient(${angle}deg, ${stops})`;
    } else {
      // 径向渐变
      const stops = gradient.stops.map(stop => 
        `${stop.color} ${stop.offset}`
      ).join(', ');
      
      return `radial-gradient(circle at ${gradient.cx * 100}% ${gradient.cy * 100}%, ${stops})`;
    }
  }
}
