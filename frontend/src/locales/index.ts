// 国际化配置文件
import { zhCN } from './zh-CN';
import { enUS } from './en-US';

export type Language = 'zh-CN' | 'en-US';

export const languages = {
  'zh-CN': zhCN,
  'en-US': enUS,
} as const;

export type LanguagePack = typeof zhCN;

// 默认语言
export const defaultLanguage: Language = 'zh-CN';

// 支持的语言列表
export const supportedLanguages: Array<{
  code: Language;
  name: string;
  nativeName: string;
  flag: string;
}> = [
  {
    code: 'zh-CN',
    name: 'Chinese',
    nativeName: '中文',
    flag: '🇨🇳'
  },
  {
    code: 'en-US',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸'
  }
];

// 获取语言包
export const getLanguagePack = (language: Language): LanguagePack => {
  return languages[language] || languages[defaultLanguage];
};

// 检查语言是否支持
export const isLanguageSupported = (language: string): language is Language => {
  return language in languages;
};

// 获取浏览器语言
export const getBrowserLanguage = (): Language => {
  const browserLang = navigator.language || navigator.languages?.[0] || 'en-US';
  
  // 检查是否支持完整语言代码
  if (isLanguageSupported(browserLang)) {
    return browserLang;
  }
  
  // 检查语言前缀（如 zh-CN -> zh）
  const langPrefix = browserLang.split('-')[0];
  const supportedLang = supportedLanguages.find(lang => 
    lang.code.startsWith(langPrefix)
  );
  
  return supportedLang?.code || defaultLanguage;
};

// 导出所有语言包
export { zhCN, enUS };
