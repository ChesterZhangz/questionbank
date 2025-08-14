import type { SymbolDefinition } from '../types';

// 选择题符号
export const choiceSymbols: SymbolDefinition[] = [
  { latex: '\\choice', name: '选择题', category: 'choice' },
];

// 填空题符号
export const fillSymbols: SymbolDefinition[] = [
  { latex: '\\fill', name: '填空题', category: 'fill' },
];

// 小题符号
export const subpSymbols: SymbolDefinition[] = [
  { latex: '\\subp', name: '小题', category: 'subp' },
];

// 子小题符号
export const subsubpSymbols: SymbolDefinition[] = [
  { latex: '\\subsubp', name: '子小题', category: 'subsubp' },
];

// 解答题符号
export const solutionSymbols: SymbolDefinition[] = [
  // 移除解答相关符号，保持为空数组
];

// 题目符号分类
export const questionSymbolCategories = [
  {
    name: '选择题',
    icon: 'check-square',
    symbols: choiceSymbols
  },
  {
    name: '填空题',
    icon: 'type',
    symbols: fillSymbols
  },
  {
    name: '小题',
    icon: 'list',
    symbols: subpSymbols
  },
  {
    name: '子小题',
    icon: 'list-ordered',
    symbols: subsubpSymbols
  }
];

// 获取所有题目符号
export const getAllQuestionSymbols = (): SymbolDefinition[] => {
  return [
    ...choiceSymbols,
    ...fillSymbols,
    ...subpSymbols,
    ...subsubpSymbols,
    ...solutionSymbols
  ];
}; 