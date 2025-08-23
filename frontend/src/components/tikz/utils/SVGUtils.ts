// TikZ SVG 工具函数

// SVG 命名空间
export const SVG_NS = 'http://www.w3.org/2000/svg';

// 创建SVG元素
export function createSVGElement(tagName: string): SVGElement {
  return document.createElementNS(SVG_NS, tagName);
}

// 设置SVG属性
export function setSVGAttribute(element: SVGElement, name: string, value: string | number): void {
  if (value !== undefined && value !== null) {
    element.setAttribute(name, String(value));
  }
}

// 设置多个SVG属性
export function setSVGAttributes(element: SVGElement, attributes: Record<string, string | number>): void {
  Object.entries(attributes).forEach(([name, value]) => {
    if (value !== undefined && value !== null) {
      setSVGAttribute(element, name, value);
    }
  });
}

// 创建SVG路径
export function createSVGPath(d: string, attributes: Record<string, string | number> = {}): SVGPathElement {
  const path = createSVGElement('path') as SVGPathElement;
  setSVGAttribute(path, 'd', d);
  setSVGAttributes(path, attributes);
  return path;
}

// 创建SVG圆形
export function createSVGCircle(
  cx: number,
  cy: number,
  r: number,
  attributes: Record<string, string | number> = {}
): SVGCircleElement {
  const circle = createSVGElement('circle') as SVGCircleElement;
  setSVGAttribute(circle, 'cx', cx);
  setSVGAttribute(circle, 'cy', cy);
  setSVGAttribute(circle, 'r', r);
  setSVGAttributes(circle, attributes);
  return circle;
}

// 创建SVG椭圆
export function createSVGEllipse(
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  attributes: Record<string, string | number> = {}
): SVGEllipseElement {
  const ellipse = createSVGElement('ellipse') as SVGEllipseElement;
  setSVGAttribute(ellipse, 'cx', cx);
  setSVGAttribute(ellipse, 'cy', cy);
  setSVGAttribute(ellipse, 'rx', rx);
  setSVGAttribute(ellipse, 'ry', ry);
  setSVGAttributes(ellipse, attributes);
  return ellipse;
}

// 创建SVG矩形
export function createSVGRect(
  x: number,
  y: number,
  width: number,
  height: number,
  attributes: Record<string, string | number> = {}
): SVGRectElement {
  const rect = createSVGElement('rect') as SVGRectElement;
  setSVGAttribute(rect, 'x', x);
  setSVGAttribute(rect, 'y', y);
  setSVGAttribute(rect, 'width', width);
  setSVGAttribute(rect, 'height', height);
  setSVGAttributes(rect, attributes);
  return rect;
}

// 创建SVG线条
export function createSVGLine(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  attributes: Record<string, string | number> = {}
): SVGLineElement {
  const line = createSVGElement('line') as SVGLineElement;
  setSVGAttribute(line, 'x1', x1);
  setSVGAttribute(line, 'y1', y1);
  setSVGAttribute(line, 'x2', x2);
  setSVGAttribute(line, 'y2', y2);
  setSVGAttributes(line, attributes);
  return line;
}

// 创建SVG多边形
export function createSVGPolygon(
  points: Array<{ x: number; y: number }>,
  attributes: Record<string, string | number> = {}
): SVGPolygonElement {
  const polygon = createSVGElement('polygon') as SVGPolygonElement;
  const pointsString = points.map(p => `${p.x},${p.y}`).join(' ');
  setSVGAttribute(polygon, 'points', pointsString);
  setSVGAttributes(polygon, attributes);
  return polygon;
}

// 创建SVG折线
export function createSVGPolyline(
  points: Array<{ x: number; y: number }>,
  attributes: Record<string, string | number> = {}
): SVGPolylineElement {
  const polyline = createSVGElement('polyline') as SVGPolylineElement;
  const pointsString = points.map(p => `${p.x},${p.y}`).join(' ');
  setSVGAttribute(polyline, 'points', pointsString);
  setSVGAttributes(polyline, attributes);
  return polyline;
}

// 创建SVG文本
export function createSVGText(
  x: number,
  y: number,
  text: string,
  attributes: Record<string, string | number> = {}
): SVGTextElement {
  const textElement = createSVGElement('text') as SVGTextElement;
  setSVGAttribute(textElement, 'x', x);
  setSVGAttribute(textElement, 'y', y);
  textElement.textContent = text;
  setSVGAttributes(textElement, attributes);
  return textElement;
}

// 创建SVG组
export function createSVGGroup(attributes: Record<string, string | number> = {}): SVGGElement {
  const group = createSVGElement('g') as SVGGElement;
  setSVGAttributes(group, attributes);
  return group;
}

// 创建SVG定义
export function createSVGDefs(): SVGDefsElement {
  return createSVGElement('defs') as SVGDefsElement;
}

// 创建SVG渐变
export function createSVGLinearGradient(
  id: string,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  stops: Array<{ offset: string; color: string; opacity?: number }>
): SVGLinearGradientElement {
  const gradient = createSVGElement('linearGradient') as SVGLinearGradientElement;
  setSVGAttribute(gradient, 'id', id);
  setSVGAttribute(gradient, 'x1', x1);
  setSVGAttribute(gradient, 'y1', y1);
  setSVGAttribute(gradient, 'x2', x2);
  setSVGAttribute(gradient, 'y2', y2);
  
  stops.forEach(stop => {
    const stopElement = createSVGElement('stop') as SVGStopElement;
    setSVGAttribute(stopElement, 'offset', stop.offset);
    setSVGAttribute(stopElement, 'stop-color', stop.color);
    if (stop.opacity !== undefined) {
      setSVGAttribute(stopElement, 'stop-opacity', stop.opacity);
    }
    gradient.appendChild(stopElement);
  });
  
  return gradient;
}

// 创建SVG径向渐变
export function createSVGRadialGradient(
  id: string,
  cx: number,
  cy: number,
  r: number,
  stops: Array<{ offset: string; color: string; opacity?: number }>
): SVGRadialGradientElement {
  const gradient = createSVGElement('radialGradient') as SVGRadialGradientElement;
  setSVGAttribute(gradient, 'id', id);
  setSVGAttribute(gradient, 'cx', cx);
  setSVGAttribute(gradient, 'cy', cy);
  setSVGAttribute(gradient, 'r', r);
  
  stops.forEach(stop => {
    const stopElement = createSVGElement('stop') as SVGStopElement;
    setSVGAttribute(stopElement, 'offset', stop.offset);
    setSVGAttribute(stopElement, 'stop-color', stop.color);
    if (stop.opacity !== undefined) {
      setSVGAttribute(stopElement, 'stop-opacity', stop.opacity);
    }
    gradient.appendChild(stopElement);
  });
  
  return gradient;
}

// 创建SVG滤镜
export function createSVGFilter(
  id: string,
  attributes: Record<string, string | number> = {}
): SVGFilterElement {
  const filter = createSVGElement('filter') as SVGFilterElement;
  setSVGAttribute(filter, 'id', id);
  setSVGAttributes(filter, attributes);
  return filter;
}

// 创建SVG阴影滤镜
export function createSVGShadowFilter(
  id: string,
  dx: number = 2,
  dy: number = 2,
  blur: number = 3,
  _color: string = 'rgba(0,0,0,0.3)'
): SVGFilterElement {
  const filter = createSVGFilter(id);
  
  // 创建阴影偏移
  const feOffset = createSVGElement('feOffset') as SVGFEOffsetElement;
  setSVGAttribute(feOffset, 'dx', dx);
  setSVGAttribute(feOffset, 'dy', dy);
  setSVGAttribute(feOffset, 'in', 'SourceAlpha');
  setSVGAttribute(feOffset, 'result', 'shadow');
  
  // 创建模糊效果
  const feGaussianBlur = createSVGElement('feGaussianBlur') as SVGFEGaussianBlurElement;
  setSVGAttribute(feGaussianBlur, 'stdDeviation', blur);
  setSVGAttribute(feGaussianBlur, 'in', 'shadow');
  setSVGAttribute(feGaussianBlur, 'result', 'shadowBlur');
  
  // 创建颜色矩阵
  const feColorMatrix = createSVGElement('feColorMatrix') as SVGFEColorMatrixElement;
  setSVGAttribute(feColorMatrix, 'type', 'matrix');
  setSVGAttribute(feColorMatrix, 'values', '0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.3 0');
  
  // 合并阴影和原图
  const feMerge = createSVGElement('feMerge') as SVGFEMergeElement;
  const feMergeNode1 = createSVGElement('feMergeNode') as SVGFEMergeNodeElement;
  const feMergeNode2 = createSVGElement('feMergeNode') as SVGFEMergeNodeElement;
  setSVGAttribute(feMergeNode1, 'in', 'shadowBlur');
  setSVGAttribute(feMergeNode2, 'in', 'SourceGraphic');
  
  feMerge.appendChild(feMergeNode1);
  feMerge.appendChild(feMergeNode2);
  
  filter.appendChild(feOffset);
  filter.appendChild(feGaussianBlur);
  filter.appendChild(feColorMatrix);
  filter.appendChild(feMerge);
  
  return filter;
}

// 清理SVG元素
export function clearSVGElement(element: SVGElement): void {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
}

// 获取SVG元素的边界框
export function getSVGBBox(element: SVGElement): DOMRect | null {
  if ('getBBox' in element) {
    return (element as any).getBBox();
  }
  return null;
}

// 设置SVG元素的变换
export function setSVGTransform(element: SVGElement, transform: string): void {
  setSVGAttribute(element, 'transform', transform);
}
