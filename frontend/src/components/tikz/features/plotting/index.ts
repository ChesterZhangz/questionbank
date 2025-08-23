// TikZ 绘图功能模块统一导出

// TikZ 函数渲染器（纯 TikZ 实现）
export { TikZFunctionRenderer } from './TikZFunctionRenderer';
export type { TikZAxisOptions, TikZFunctionOptions, TikZFunction } from './TikZFunctionRenderer';

// 函数求值器
export { FunctionEvaluator } from './FunctionEvaluator';
export type { EvaluationContext, EvaluationResult } from './FunctionEvaluator';

// 数据处理器
export { DataProcessor } from './DataProcessor';
export type { DataPoint, DataSeries, StatisticalSummary } from './DataProcessor';
