import { getAllMathSymbols, searchMathSymbols } from './MathSymbols';
import { getAllQuestionSymbols } from './QuestionSymbols';
import type { SymbolDefinition } from '../types';

// 翻译函数类型
type TranslationFunction = (key: string) => string;

// 全局翻译函数设置
let globalTranslationFunction: TranslationFunction | null = null;

// 设置全局翻译函数
export const setGlobalTranslationFunction = (t: TranslationFunction) => {
  globalTranslationFunction = t;
};

// 获取全局翻译函数
const getGlobalTranslationFunction = (): TranslationFunction => {
  if (globalTranslationFunction) {
    return globalTranslationFunction;
  }
  // 如果没有设置全局翻译函数，返回默认函数
  return (key: string) => key;
};

// 自动补全建议接口
export interface AutoCompleteSuggestion {
  text: string;
  description: string;
  type: 'latex' | 'markdown' | 'question';
}

// 将SymbolDefinition转换为AutoCompleteSuggestion
export const convertToAutoCompleteSuggestions = (symbols: SymbolDefinition[]): AutoCompleteSuggestion[] => {
  return symbols.map(symbol => ({
    text: symbol.latex,
    description: symbol.name,
    type: isQuestionSymbol(symbol.category) ? 'question' : 'latex'
  }));
};

// 判断是否为题目符号
const isQuestionSymbol = (category: string): boolean => {
  const questionCategories = ['choice', 'fill', 'subp', 'subsubp', 'solution'];
  return questionCategories.includes(category);
};

// 获取所有数学符号的自动补全建议
export const getMathAutoCompleteSuggestions = (t?: TranslationFunction): AutoCompleteSuggestion[] => {
  const translationFunction = t || getGlobalTranslationFunction();
  return convertToAutoCompleteSuggestions(getAllMathSymbols(translationFunction));
};

// 获取所有题目符号的自动补全建议
export const getQuestionAutoCompleteSuggestions = (t?: TranslationFunction): AutoCompleteSuggestion[] => {
  const translationFunction = t || getGlobalTranslationFunction();
  return convertToAutoCompleteSuggestions(getAllQuestionSymbols(translationFunction));
};

// 获取所有符号的自动补全建议
export const getAllAutoCompleteSuggestions = (t?: TranslationFunction): AutoCompleteSuggestion[] => {
  const translationFunction = t || getGlobalTranslationFunction();
  return [
    ...getMathAutoCompleteSuggestions(translationFunction),
    ...getQuestionAutoCompleteSuggestions(translationFunction)
  ];
};

// 根据查询搜索所有符号
export const searchAllSymbols = (query: string, t?: TranslationFunction): AutoCompleteSuggestion[] => {
  const translationFunction = t || getGlobalTranslationFunction();
  
  // 当查询为空或只有反斜杠时，返回所有符号
  if (!query || query === '\\') {
    return getAllAutoCompleteSuggestions(translationFunction);
  }
  
  // 如果查询以反斜杠开头，去掉反斜杠进行搜索
  const searchQuery = query.startsWith('\\') ? query.slice(1) : query;
  
  // 搜索数学符号
  const mathResults = searchMathSymbols(searchQuery, translationFunction);
  const mathSuggestions = convertToAutoCompleteSuggestions(mathResults);
  
  // 搜索题目符号
  const questionResults = getAllQuestionSymbols(translationFunction).filter(symbol => 
    symbol.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    symbol.latex.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const questionSuggestions = convertToAutoCompleteSuggestions(questionResults);
  
  return [...mathSuggestions, ...questionSuggestions];
};

// 根据类型获取符号
export const getSymbolsByType = (type: 'latex' | 'question', t?: TranslationFunction): AutoCompleteSuggestion[] => {
  const translationFunction = t || getGlobalTranslationFunction();
  if (type === 'latex') {
    return getMathAutoCompleteSuggestions(translationFunction);
  } else {
    return getQuestionAutoCompleteSuggestions(translationFunction);
  }
};

// 导出所有符号数据
export * from './MathSymbols';
export * from './QuestionSymbols';