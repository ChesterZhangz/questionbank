// TikZ 阴影渲染器
import { createSVGShadowFilter } from '../../utils/SVGUtils';

export interface ShadowOptions {
  dx?: number;           // X轴偏移
  dy?: number;           // Y轴偏移
  blur?: number;         // 模糊半径
  color?: string;        // 阴影颜色
  opacity?: number;      // 阴影透明度
  spread?: number;       // 阴影扩散
  inset?: boolean;       // 内阴影
}

export interface TikZShadow {
  id: string;
  options: ShadowOptions;
  filter: SVGElement;
}

export class ShadowRenderer {
  private static shadowCounter = 0;

  /**
   * 创建阴影效果
   */
  static createShadow(options: ShadowOptions = {}): TikZShadow {
    const id = `shadow-${++this.shadowCounter}`;
    
    const defaultOptions: ShadowOptions = {
      dx: 2,
      dy: 2,
      blur: 3,
      color: 'rgba(0,0,0,0.3)',
      opacity: 0.3,
      spread: 0,
      inset: false
    };

    const finalOptions = { ...defaultOptions, ...options };
    
    // 创建SVG滤镜
    const filter = createSVGShadowFilter(
      id,
      finalOptions.dx!,
      finalOptions.dy!,
      finalOptions.blur!,
      finalOptions.color!
    );

    return {
      id,
      options: finalOptions,
      filter
    };
  }

  /**
   * 创建默认阴影
   */
  static createDefaultShadow(): TikZShadow {
    return this.createShadow();
  }

  /**
   * 创建柔和阴影
   */
  static createSoftShadow(): TikZShadow {
    return this.createShadow({
      dx: 1,
      dy: 1,
      blur: 5,
      opacity: 0.2
    });
  }

  /**
   * 创建强烈阴影
   */
  static createStrongShadow(): TikZShadow {
    return this.createShadow({
      dx: 3,
      dy: 3,
      blur: 8,
      opacity: 0.5
    });
  }

  /**
   * 创建内阴影
   */
  static createInsetShadow(): TikZShadow {
    return this.createShadow({
      dx: 0,
      dy: 0,
      blur: 4,
      opacity: 0.4,
      inset: true
    });
  }

  /**
   * 创建彩色阴影
   */
  static createColoredShadow(color: string, opacity: number = 0.3): TikZShadow {
    return this.createShadow({
      color,
      opacity
    });
  }

  /**
   * 创建多层阴影
   */
  static createMultiShadow(shadows: ShadowOptions[]): TikZShadow[] {
    return shadows.map((options, index) => {
      const id = `multi-shadow-${++this.shadowCounter}-${index}`;
      
      const defaultOptions: ShadowOptions = {
        dx: 0,
        dy: 0,
        blur: 2,
        color: 'rgba(0,0,0,0.2)',
        opacity: 0.2
      };

      const finalOptions = { ...defaultOptions, ...options };
      
      const filter = createSVGShadowFilter(
        id,
        finalOptions.dx!,
        finalOptions.dy!,
        finalOptions.blur!,
        finalOptions.color!
      );

      return {
        id,
        options: finalOptions,
        filter
      };
    });
  }

  /**
   * 创建TikZ风格的阴影
   */
  static createTikZShadow(shadowType: string): TikZShadow {
    switch (shadowType.toLowerCase()) {
      case 'soft':
        return this.createSoftShadow();
      case 'strong':
        return this.createStrongShadow();
      case 'inset':
        return this.createInsetShadow();
      case 'colored':
        return this.createColoredShadow('rgba(0,0,255,0.3)');
      case 'none':
        return this.createShadow({ dx: 0, dy: 0, blur: 0, opacity: 0 });
      default:
        return this.createDefaultShadow();
    }
  }

  /**
   * 解析TikZ阴影语法
   */
  static parseTikZShadow(shadowString: string): TikZShadow | null {
    const trimmed = shadowString.trim();
    
    // 解析 drop shadow 语法
    if (trimmed.startsWith('drop shadow')) {
      return this.parseDropShadow(trimmed);
    }
    
    // 解析 shadow 语法
    if (trimmed.startsWith('shadow')) {
      return this.parseShadow(trimmed);
    }
    
    // 解析预定义阴影类型
    const predefinedTypes = ['soft', 'strong', 'inset', 'colored', 'none'];
    for (const type of predefinedTypes) {
      if (trimmed.includes(type)) {
        return this.createTikZShadow(type);
      }
    }
    
    return null;
  }

  /**
   * 解析 drop shadow 语法
   */
  private static parseDropShadow(shadowString: string): TikZShadow {
    // 提取参数
    const dxMatch = shadowString.match(/xshift=([-\d.]+)/);
    const dyMatch = shadowString.match(/yshift=([-\d.]+)/);
    const blurMatch = shadowString.match(/blur=([-\d.]+)/);
    const colorMatch = shadowString.match(/color=([^,\s]+)/);
    
    const dx = dxMatch ? parseFloat(dxMatch[1]) : 2;
    const dy = dyMatch ? parseFloat(dyMatch[1]) : 2;
    const blur = blurMatch ? parseFloat(blurMatch[1]) : 3;
    const color = colorMatch ? colorMatch[1] : 'rgba(0,0,0,0.3)';
    
    return this.createShadow({ dx, dy, blur, color });
  }

  /**
   * 解析 shadow 语法
   */
  private static parseShadow(shadowString: string): TikZShadow {
    // 提取参数
    const dxMatch = shadowString.match(/xshift=([-\d.]+)/);
    const dyMatch = shadowString.match(/yshift=([-\d.]+)/);
    const blurMatch = shadowString.match(/blur=([-\d.]+)/);
    const colorMatch = shadowString.match(/color=([^,\s]+)/);
    
    const dx = dxMatch ? parseFloat(dxMatch[1]) : 2;
    const dy = dyMatch ? parseFloat(dyMatch[1]) : 2;
    const blur = blurMatch ? parseFloat(blurMatch[1]) : 3;
    const color = colorMatch ? colorMatch[1] : 'rgba(0,0,0,0.3)';
    
    return this.createShadow({ dx, dy, blur, color });
  }

  /**
   * 应用阴影到SVG元素
   */
  static applyShadow(element: SVGElement, shadow: TikZShadow): void {
    // 确保元素有defs父元素
    let defs = element.querySelector('defs');
    if (!defs) {
      defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
      element.appendChild(defs);
    }
    
    // 添加阴影滤镜
    defs.appendChild(shadow.filter);
    
    // 应用滤镜到元素
    element.setAttribute('filter', `url(#${shadow.id})`);
  }

  /**
   * 移除阴影
   */
  static removeShadow(element: SVGElement): void {
    element.removeAttribute('filter');
  }

  /**
   * 获取阴影的CSS值
   */
  static getCSSShadow(shadow: TikZShadow): string {
    const { dx, dy, blur, color, spread, inset } = shadow.options;
    
    let cssShadow = '';
    
    if (inset) {
      cssShadow += 'inset ';
    }
    
    cssShadow += `${dx}px ${dy}px ${blur}px`;
    
    if (spread && spread > 0) {
      cssShadow += ` ${spread}px`;
    }
    
    cssShadow += ` ${color}`;
    
    return cssShadow;
  }

  /**
   * 创建组合阴影效果
   */
  static createCombinedShadow(shadows: ShadowOptions[]): TikZShadow {
    const id = `combined-shadow-${++this.shadowCounter}`;
    
    // 创建组合滤镜
    const filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
    filter.setAttribute('id', id);
    
    // 添加多个阴影效果
    shadows.forEach((options, index) => {
      // const shadow = this.createShadow(options);
      const feOffset = document.createElementNS('http://www.w3.org/2000/svg', 'feOffset');
      const feGaussianBlur = document.createElementNS('http://www.w3.org/2000/svg', 'feGaussianBlur');
      const feColorMatrix = document.createElementNS('http://www.w3.org/2000/svg', 'feColorMatrix');
      
      feOffset.setAttribute('dx', String(options.dx || 0));
      feOffset.setAttribute('dy', String(options.dy || 0));
      feOffset.setAttribute('in', index === 0 ? 'SourceAlpha' : `shadow${index}`);
      feOffset.setAttribute('result', `shadow${index + 1}`);
      
      feGaussianBlur.setAttribute('stdDeviation', String(options.blur || 0));
      feGaussianBlur.setAttribute('in', `shadow${index + 1}`);
      feGaussianBlur.setAttribute('result', `blur${index + 1}`);
      
      // 设置颜色和透明度
      // const color = options.color || 'rgba(0,0,0,0.3)';
      const opacity = options.opacity || 0.3;
      
      feColorMatrix.setAttribute('type', 'matrix');
      feColorMatrix.setAttribute('values', `0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 ${opacity} 0`);
      
      filter.appendChild(feOffset);
      filter.appendChild(feGaussianBlur);
      filter.appendChild(feColorMatrix);
    });
    
    // 合并所有阴影
    const feMerge = document.createElementNS('http://www.w3.org/2000/svg', 'feMerge');
    shadows.forEach((_, index) => {
      const feMergeNode = document.createElementNS('http://www.w3.org/2000/svg', 'feMergeNode');
      feMergeNode.setAttribute('in', `blur${index + 1}`);
      feMerge.appendChild(feMergeNode);
    });
    
    // 添加原图
    const feMergeNodeOriginal = document.createElementNS('http://www.w3.org/2000/svg', 'feMergeNode');
    feMergeNodeOriginal.setAttribute('in', 'SourceGraphic');
    feMerge.appendChild(feMergeNodeOriginal);
    
    filter.appendChild(feMerge);
    
    return {
      id,
      options: shadows[0] || {},
      filter
    };
  }
}
