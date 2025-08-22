// TikZ 组件统一导出
export { default as TikZPreview } from './core/TikZPreview';
export { default as TikZHighlightInput } from './core/TikZHighlightInput';
export { default as TikZHighlighter } from './core/TikZHighlighter';
export { default as TikZAutoComplete } from './core/TikZAutoComplete';
export { default as TikZEditorPanel } from './core/TikZEditorPanel';
export { default as TikZContentEditor } from './core/TikZContentEditor';
export { default as TikZContentPreview } from './core/TikZContentPreview';

// 命名导出
export { TikZEditor } from './core/TikZEditor';
export { TikZRenderer } from './core/TikZRenderer';

// 颜色系统
export { ColorParser } from './features/colors/ColorParser';
export { GradientEngine } from './features/colors/GradientEngine';

// 效果系统
export { ShadowRenderer } from './features/effects/ShadowRenderer';
export { PatternFiller } from './features/effects/PatternFiller';

// 工具函数
export * from './utils/MathUtils';
export * from './utils/SVGUtils';
