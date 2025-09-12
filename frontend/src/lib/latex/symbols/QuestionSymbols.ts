import type { SymbolDefinition } from '../types';

// 翻译函数类型
type TranslationFunction = (key: string) => string;

// 默认翻译函数（用于向后兼容）
const defaultT: TranslationFunction = (key: string) => key;

// 选择题符号
export const getChoiceSymbols = (t: TranslationFunction = defaultT): SymbolDefinition[] => [
  { latex: '\\choice', name: t('lib.questionSymbols.choice'), category: 'choice' }
];

// 填空题符号
export const getFillSymbols = (t: TranslationFunction = defaultT): SymbolDefinition[] => [
  { latex: '\\fill', name: t('lib.questionSymbols.fill'), category: 'fill' }
];

// 小题符号
export const getSubpSymbols = (t: TranslationFunction = defaultT): SymbolDefinition[] => [
  { latex: '\\subp', name: t('lib.questionSymbols.subp'), category: 'subp' }
];

// 子小题符号
export const getSubsubpSymbols = (t: TranslationFunction = defaultT): SymbolDefinition[] => [
  { latex: '\\subsubp', name: t('lib.questionSymbols.subsubp'), category: 'subsubp' }
];

// 解答题符号
export const getSolutionSymbols = (_t: TranslationFunction = defaultT): SymbolDefinition[] => [
  // 移除解答相关符号，保持为空数组
];

// 题目符号分类
export const getQuestionSymbolCategories = (t: TranslationFunction = defaultT) => [
  {
    name: t('lib.questionSymbols.categories.choice'),
    icon: 'check-square',
    symbols: getChoiceSymbols(t)
  },
  {
    name: t('lib.questionSymbols.categories.fill'),
    icon: 'type',
    symbols: getFillSymbols(t)
  },
  {
    name: t('lib.questionSymbols.categories.subp'),
    icon: 'list',
    symbols: getSubpSymbols(t)
  },
  {
    name: t('lib.questionSymbols.categories.subsubp'),
    icon: 'list-ordered',
    symbols: getSubsubpSymbols(t)
  }
];

// 获取所有题目符号
export const getAllQuestionSymbols = (t: TranslationFunction = defaultT): SymbolDefinition[] => {
  return [
    ...getChoiceSymbols(t),
    ...getFillSymbols(t),
    ...getSubpSymbols(t),
    ...getSubsubpSymbols(t),
    ...getSolutionSymbols(t)
  ];
};

// 向后兼容的静态导出
export const choiceSymbols = getChoiceSymbols();
export const fillSymbols = getFillSymbols();
export const subpSymbols = getSubpSymbols();
export const subsubpSymbols = getSubsubpSymbols();
export const solutionSymbols = getSolutionSymbols();
export const questionSymbolCategories = getQuestionSymbolCategories();