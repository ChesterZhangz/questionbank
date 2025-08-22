// TikZ 数学工具函数

// 数学常量
export const MATH_CONSTANTS = {
  PI: Math.PI,
  E: Math.E,
  SQRT2: Math.SQRT2,
  SQRT1_2: Math.SQRT1_2,
  LN2: Math.LN2,
  LN10: Math.LN10,
  LOG2E: Math.LOG2E,
  LOG10E: Math.LOG10E
};

// 角度转弧度
export function degreesToRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

// 弧度转角度
export function radiansToDegrees(radians: number): number {
  return radians * (180 / Math.PI);
}

// 计算两点之间的距离
export function distance(p1: { x: number; y: number }, p2: { x: number; y: number }): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

// 计算点到直线的距离
export function pointToLineDistance(
  point: { x: number; y: number },
  lineStart: { x: number; y: number },
  lineEnd: { x: number; y: number }
): number {
  const A = lineEnd.y - lineStart.y;
  const B = lineStart.x - lineEnd.x;
  const C = lineEnd.x * lineStart.y - lineStart.x * lineEnd.y;
  
  return Math.abs(A * point.x + B * point.y + C) / Math.sqrt(A * A + B * B);
}

// 计算两条直线的交点
export function lineIntersection(
  line1Start: { x: number; y: number },
  line1End: { x: number; y: number },
  line2Start: { x: number; y: number },
  line2End: { x: number; y: number }
): { x: number; y: number } | null {
  const x1 = line1Start.x, y1 = line1Start.y;
  const x2 = line1End.x, y2 = line1End.y;
  const x3 = line2Start.x, y3 = line2Start.y;
  const x4 = line2End.x, y4 = line2End.y;
  
  const denominator = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
  
  if (Math.abs(denominator) < 1e-10) {
    return null; // 平行线
  }
  
  const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denominator;
  
  return {
    x: x1 + t * (x2 - x1),
    y: y1 + t * (y2 - y1)
  };
}

// 计算圆的面积
export function circleArea(radius: number): number {
  return Math.PI * radius * radius;
}

// 计算圆的周长
export function circleCircumference(radius: number): number {
  return 2 * Math.PI * radius;
}

// 计算椭圆的面积
export function ellipseArea(rx: number, ry: number): number {
  return Math.PI * rx * ry;
}

// 计算矩形的面积
export function rectangleArea(width: number, height: number): number {
  return width * height;
}

// 计算三角形的面积
export function triangleArea(
  p1: { x: number; y: number },
  p2: { x: number; y: number },
  p3: { x: number; y: number }
): number {
  return Math.abs((p2.x - p1.x) * (p3.y - p1.y) - (p3.x - p1.x) * (p2.y - p1.y)) / 2;
}

// 检查点是否在圆内
export function isPointInCircle(
  point: { x: number; y: number },
  center: { x: number; y: number },
  radius: number
): boolean {
  return distance(point, center) <= radius;
}

// 检查点是否在矩形内
export function isPointInRectangle(
  point: { x: number; y: number },
  rect: { x: number; y: number; width: number; height: number }
): boolean {
  return point.x >= rect.x && 
         point.x <= rect.x + rect.width && 
         point.y >= rect.y && 
         point.y <= rect.y + rect.height;
}

// 生成贝塞尔曲线点
export function bezierCurve(
  t: number,
  p0: { x: number; y: number },
  p1: { x: number; y: number },
  p2: { x: number; y: number },
  p3: { x: number; y: number }
): { x: number; y: number } {
  const oneMinusT = 1 - t;
  const oneMinusT2 = oneMinusT * oneMinusT;
  const oneMinusT3 = oneMinusT2 * oneMinusT;
  const t2 = t * t;
  const t3 = t2 * t;
  
  return {
    x: oneMinusT3 * p0.x + 3 * oneMinusT2 * t * p1.x + 3 * oneMinusT * t2 * p2.x + t3 * p3.x,
    y: oneMinusT3 * p0.y + 3 * oneMinusT2 * t * p1.y + 3 * oneMinusT * t2 * p2.y + t3 * p3.y
  };
}
