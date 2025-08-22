// TikZ 绘图功能模块统一导出

// 核心解析器
export { PgfplotsParser } from './PgfplotsParser';
export type { AxisOptions, PlotOptions, PlotCommand, AxisEnvironment } from './PgfplotsParser';

// 函数求值器
export { FunctionEvaluator } from './FunctionEvaluator';
export type { EvaluationContext, EvaluationResult } from './FunctionEvaluator';

// 坐标轴渲染器
export { AxisRenderer } from './AxisRenderer';
export type { AxisDimensions, AxisScale, TickInfo } from './AxisRenderer';

// 绘图渲染器
export { PlotRenderer } from './PlotRenderer';
export type { PlotPoint, MarkerStyle, LineStyle } from './PlotRenderer';

// 坐标系统
export { CoordinateSystem } from './CoordinateSystem';
export type { CoordinateTransform, CoordinateRange } from './CoordinateSystem';

// 图例系统
export { LegendRenderer } from './LegendRenderer';
export type { LegendItem, LegendOptions } from './LegendRenderer';

// 数据处理器
export { DataProcessor } from './DataProcessor';
export type { DataPoint, DataSeries, StatisticalSummary } from './DataProcessor';

// 绘图管理器（整合所有功能）
export { PgfplotsManager } from './PgfplotsManager';
