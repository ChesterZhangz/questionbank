/**
 * TikZ 几何图形解析工具类
 * 统一处理圆形、矩形、椭圆、圆弧等几何图形的坐标解析
 */

export interface CircleCoords {
  x: number;
  y: number;
  radius: number;
}

export interface RectangleCoords {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface EllipseCoords {
  x: number;
  y: number;
  rx: number;
  ry: number;
}

export interface ArcCoords {
  x: number;
  y: number;
  startAngle: number;
  endAngle: number;
  radius: number;
}

export interface ParabolaCoords {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface GridCoords {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  step: number;
}

export class TikZGeometryParser {
  /**
   * 解析圆形坐标
   * 格式: (x,y) circle (radius)
   */
  static parseCircleCoords(line: string): CircleCoords | null {
    const coordMatch = line.match(/\(([^)]+)\)/);
    const radiusMatch = line.match(/circle\s*\(([^)]+)\)/);
    
    if (coordMatch && radiusMatch) {
      try {
        const [x, y] = coordMatch[1].split(',').map(s => parseFloat(s.trim()));
        const radius = parseFloat(radiusMatch[1]);
        
        if (isNaN(x) || isNaN(y) || isNaN(radius)) {
          throw new Error(`圆形坐标或半径值无效: x=${x}, y=${y}, radius=${radius}`);
        }
        
        return { x, y, radius };
      } catch (error) {
        console.warn('解析圆形坐标失败:', error);
        return null;
      }
    }
    
    return null;
  }

  /**
   * 解析矩形坐标
   * 格式: (x1,y1) rectangle (x2,y2)
   */
  static parseRectangleCoords(line: string): RectangleCoords | null {
    // 支持两种格式
    // 格式1: (x1,y1) rectangle (x2,y2)
    const rectMatch1 = line.match(/\(([^,]+),([^)]+)\)\s+rectangle\s+\(([^,]+),([^)]+)\)/);
    if (rectMatch1) {
      try {
        const x1 = parseFloat(rectMatch1[1]);
        const y1 = parseFloat(rectMatch1[2]);
        const x2 = parseFloat(rectMatch1[3]);
        const y2 = parseFloat(rectMatch1[4]);
        
        if (isNaN(x1) || isNaN(y1) || isNaN(x2) || isNaN(y2)) {
          throw new Error(`矩形坐标值无效: (${x1},${y1}) rectangle (${x2},${y2})`);
        }
        
        return { x1, y1, x2, y2 };
      } catch (error) {
        console.warn('解析矩形坐标失败:', error);
        return null;
      }
    }
    
    // 格式2: (x,y) rectangle (width,height) - 相对尺寸
    const coordMatch = line.match(/\(([^)]+)\)/);
    const sizeMatch = line.match(/rectangle\s*\(([^)]+)\)/);
    
    if (coordMatch && sizeMatch) {
      try {
        const [x1, y1] = coordMatch[1].split(',').map(s => parseFloat(s.trim()));
        const [x2, y2] = sizeMatch[1].split(',').map(s => parseFloat(s.trim()));
        
        if (isNaN(x1) || isNaN(y1) || isNaN(x2) || isNaN(y2)) {
          throw new Error(`矩形坐标值无效: (${x1},${y1}) to (${x2},${y2})`);
        }
        
        return { x1, y1, x2, y2 };
      } catch (error) {
        console.warn('解析矩形坐标失败:', error);
        return null;
      }
    }
    
    return null;
  }

  /**
   * 解析椭圆坐标
   * 格式: (x,y) ellipse (rx,ry) 或 (x,y) ellipse (rx and ry)
   */
  static parseEllipseCoords(line: string): EllipseCoords | null {
    const coordMatch = line.match(/\(([^)]+)\)/);
    
    // 格式1: (x,y) ellipse (rx and ry)
    const ellipseMatch1 = line.match(/ellipse\s*\(([^)]+)\s+and\s+([^)]+)\)/);
    if (coordMatch && ellipseMatch1) {
      try {
        const [x, y] = coordMatch[1].split(',').map(s => parseFloat(s.trim()));
        const rx = parseFloat(ellipseMatch1[1]);
        const ry = parseFloat(ellipseMatch1[2]);
        
        if (isNaN(x) || isNaN(y) || isNaN(rx) || isNaN(ry)) {
          throw new Error(`椭圆参数值无效: center=(${x},${y}), radii=(${rx},${ry})`);
        }
        
        return { x, y, rx, ry };
      } catch (error) {
        console.warn('解析椭圆坐标失败:', error);
        return null;
      }
    }
    
    // 格式2: (x,y) ellipse (rx,ry)
    const ellipseMatch2 = line.match(/ellipse\s*\(([^)]+)\)/);
    if (coordMatch && ellipseMatch2) {
      try {
        const [x, y] = coordMatch[1].split(',').map(s => parseFloat(s.trim()));
        const [rx, ry] = ellipseMatch2[1].split(',').map(s => parseFloat(s.trim()));
        
        if (isNaN(x) || isNaN(y) || isNaN(rx) || isNaN(ry)) {
          throw new Error(`椭圆参数值无效: center=(${x},${y}), radii=(${rx},${ry})`);
        }
        
        return { x, y, rx, ry };
      } catch (error) {
        console.warn('解析椭圆坐标失败:', error);
        return null;
      }
    }
    
    return null;
  }

  /**
   * 解析圆弧坐标
   * 格式: (x,y) arc (startAngle:endAngle:radius)
   */
  static parseArcCoords(line: string): ArcCoords | null {
    const coordMatch = line.match(/\(([^)]+)\)/);
    const arcMatch = line.match(/arc\s*\(([^:]+):([^:]+):([^)]+)\)/);
    
    if (coordMatch && arcMatch) {
      try {
        const [x, y] = coordMatch[1].split(',').map(s => parseFloat(s.trim()));
        const startAngle = parseFloat(arcMatch[1]);
        const endAngle = parseFloat(arcMatch[2]);
        const radius = parseFloat(arcMatch[3]);
        
        if (isNaN(x) || isNaN(y) || isNaN(startAngle) || isNaN(endAngle) || isNaN(radius)) {
          throw new Error(`圆弧参数值无效: center=(${x},${y}), angles=(${startAngle},${endAngle}), radius=${radius}`);
        }
        
        return { x, y, startAngle, endAngle, radius };
      } catch (error) {
        console.warn('解析圆弧坐标失败:', error);
        return null;
      }
    }
    
    // 支持逗号分隔格式: (x,y) arc (startAngle,endAngle,radius)
    const arcMatch2 = line.match(/arc\s*\(([^)]+)\)/);
    if (coordMatch && arcMatch2) {
      try {
        const [x, y] = coordMatch[1].split(',').map(s => parseFloat(s.trim()));
        const arcParams = arcMatch2[1].split(',').map(s => s.trim());
        
        if (arcParams.length < 3) {
          throw new Error(`圆弧参数不足: 需要起始角度、结束角度、半径`);
        }
        
        const startAngle = parseFloat(arcParams[0]);
        const endAngle = parseFloat(arcParams[1]);
        const radius = parseFloat(arcParams[2]);
        
        if (isNaN(x) || isNaN(y) || isNaN(startAngle) || isNaN(endAngle) || isNaN(radius)) {
          throw new Error(`圆弧参数值无效: center=(${x},${y}), angles=(${startAngle},${endAngle}), radius=${radius}`);
        }
        
        return { x, y, startAngle, endAngle, radius };
      } catch (error) {
        console.warn('解析圆弧坐标失败:', error);
        return null;
      }
    }
    
    return null;
  }

  /**
   * 解析抛物线坐标
   * 格式: (x1,y1) parabola (x2,y2)
   */
  static parseParabolaCoords(line: string): ParabolaCoords | null {
    const coordMatch = line.match(/\(([^)]+)\)/);
    const parabolaMatch = line.match(/parabola\s*\(([^)]+)\)/);
    
    if (coordMatch && parabolaMatch) {
      try {
        const [x1, y1] = coordMatch[1].split(',').map(s => parseFloat(s.trim()));
        const [x2, y2] = parabolaMatch[1].split(',').map(s => parseFloat(s.trim()));
        
        if (isNaN(x1) || isNaN(y1) || isNaN(x2) || isNaN(y2)) {
          throw new Error(`抛物线参数值无效: start=(${x1},${y1}), end=(${x2},${y2})`);
        }
        
        return { x1, y1, x2, y2 };
      } catch (error) {
        console.warn('解析抛物线坐标失败:', error);
        return null;
      }
    }
    
    return null;
  }

  /**
   * 解析网格坐标
   * 格式: (x1,y1) grid (x2,y2)
   */
  static parseGridCoords(line: string, style: string): GridCoords | null {
    const gridMatch = line.match(/\(([^)]+)\)\s+grid\s+\(([^)]+)\)/);
    
    if (gridMatch) {
      try {
        const [x1, y1] = gridMatch[1].split(',').map(s => parseFloat(s.trim()));
        const [x2, y2] = gridMatch[2].split(',').map(s => parseFloat(s.trim()));
        
        if (isNaN(x1) || isNaN(y1) || isNaN(x2) || isNaN(y2)) {
          throw new Error(`网格坐标值无效: (${x1},${y1}) grid (${x2},${y2})`);
        }
        
        // 解析step参数，默认为1
        const stepMatch = style.match(/step=([0-9.]+)(?:cm|pt)?/);
        const step = stepMatch ? parseFloat(stepMatch[1]) : 1;
        
        return { x1, y1, x2, y2, step };
      } catch (error) {
        console.warn('解析网格坐标失败:', error);
        return null;
      }
    }
    
    return null;
  }

  /**
   * 解析路径坐标点
   * 格式: (x1,y1) -- (x2,y2) -- (x3,y3) ...
   */
  static parsePathCoords(line: string): Array<{x: number, y: number}> | null {
    // 移除node部分，只保留路径
    const pathOnly = line.replace(/node\s*(?:\[([^\]]*)\])?\s*\{([^}]+)\}/g, '');
    
    const coordMatches = pathOnly.match(/\(([^)]+)\)/g);
    if (coordMatches && coordMatches.length >= 2) {
      try {
        const points = coordMatches.map((coord, index) => {
          const [x, y] = coord.replace(/[()]/g, '').split(',').map(s => parseFloat(s.trim()));
          if (isNaN(x) || isNaN(y)) {
            throw new Error(`第${index + 1}个坐标值无效: ${coord}`);
          }
          return { x, y };
        });
        
        return points;
      } catch (error) {
        console.warn('解析路径坐标失败:', error);
        return null;
      }
    }
    
    return null;
  }

  /**
   * 验证坐标值是否有效
   */
  static validateCoords(coords: any): boolean {
    if (!coords) return false;
    
    // 检查所有数值属性是否为有效数字
    for (const [key, value] of Object.entries(coords)) {
      if (typeof value === 'number' && (isNaN(value) || !isFinite(value))) {
        console.warn(`坐标属性 ${key} 的值无效: ${value}`);
        return false;
      }
    }
    
    return true;
  }

  /**
   * 获取几何图形的边界框
   */
  static getBoundingBox(coords: any, type: string): {minX: number, minY: number, maxX: number, maxY: number} | null {
    if (!this.validateCoords(coords)) return null;
    
    switch (type) {
      case 'circle':
        const circle = coords as CircleCoords;
        return {
          minX: circle.x - circle.radius,
          minY: circle.y - circle.radius,
          maxX: circle.x + circle.radius,
          maxY: circle.y + circle.radius
        };
        
      case 'rectangle':
        const rect = coords as RectangleCoords;
        return {
          minX: Math.min(rect.x1, rect.x2),
          minY: Math.min(rect.y1, rect.y2),
          maxX: Math.max(rect.x1, rect.x2),
          maxY: Math.max(rect.y1, rect.y2)
        };
        
      case 'ellipse':
        const ellipse = coords as EllipseCoords;
        return {
          minX: ellipse.x - ellipse.rx,
          minY: ellipse.y - ellipse.ry,
          maxX: ellipse.x + ellipse.rx,
          maxY: ellipse.y + ellipse.ry
        };
        
      case 'arc':
        const arc = coords as ArcCoords;
        return {
          minX: arc.x - arc.radius,
          minY: arc.y - arc.radius,
          maxX: arc.x + arc.radius,
          maxY: arc.y + arc.radius
        };
        
      default:
        return null;
    }
  }
}
