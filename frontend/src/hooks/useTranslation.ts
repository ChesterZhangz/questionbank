import { useLanguageStore } from '../stores/languageStore';
import { getLanguagePack } from '../locales';
import { setGlobalTranslationFunction } from '../lib/latex/symbols';
import { setGlobalTranslationFunction as setTikZGlobalTranslationFunction } from '../lib/tikz/symbols';

// 翻译Hook
export const useTranslation = () => {
  const { language } = useLanguageStore();
  const t = getLanguagePack(language);

  // 获取嵌套对象值的辅助函数
  const getNestedValue = (obj: any, path: string): string => {
    return path.split('.').reduce((current, key) => {
      return current?.[key];
    }, obj) || path;
  };

  // 翻译函数
  const translate = (key: string, params?: Record<string, string | number>): string => {
    let translation = getNestedValue(t, key);
    
    // 如果找不到翻译，返回key本身
    if (typeof translation !== 'string') {
      console.warn(`Translation missing for key: ${key}`);
      return key;
    }
    
    // 替换参数
    if (params) {
      Object.entries(params).forEach(([paramKey, paramValue]) => {
        translation = translation.replace(
          new RegExp(`{${paramKey}}`, 'g'),
          String(paramValue)
        );
      });
    }
    
    return translation;
  };

  // 设置全局翻译函数（用于符号库）
  setGlobalTranslationFunction(translate);
  setTikZGlobalTranslationFunction(translate);

  // 获取当前语言信息
  const getLanguageInfo = () => {
    return {
      code: language,
      name: t.language.name,
      nativeName: t.language.nativeName,
      direction: t.language.direction
    };
  };

  // 格式化日期
  const formatDate = (date: Date | string | number): string => {
    const d = new Date(date);
    const format = t.dateFormat;
    
    return format
      .replace('YYYY', d.getFullYear().toString())
      .replace('MM', String(d.getMonth() + 1).padStart(2, '0'))
      .replace('DD', String(d.getDate()).padStart(2, '0'));
  };

  // 格式化时间
  const formatTime = (date: Date | string | number): string => {
    const d = new Date(date);
    const format = t.timeFormat;
    
    return format
      .replace('HH', String(d.getHours()).padStart(2, '0'))
      .replace('mm', String(d.getMinutes()).padStart(2, '0'))
      .replace('ss', String(d.getSeconds()).padStart(2, '0'));
  };

  // 格式化日期时间
  const formatDateTime = (date: Date | string | number): string => {
    const d = new Date(date);
    const format = t.dateTimeFormat;
    
    return format
      .replace('YYYY', d.getFullYear().toString())
      .replace('MM', String(d.getMonth() + 1).padStart(2, '0'))
      .replace('DD', String(d.getDate()).padStart(2, '0'))
      .replace('HH', String(d.getHours()).padStart(2, '0'))
      .replace('mm', String(d.getMinutes()).padStart(2, '0'))
      .replace('ss', String(d.getSeconds()).padStart(2, '0'));
  };

  // 格式化数字
  const formatNumber = (num: number): string => {
    const { thousands } = t.numberFormat;
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, thousands);
  };

  // 格式化货币
  const formatCurrency = (amount: number): string => {
    const { currency } = t.numberFormat;
    return `${currency}${formatNumber(amount)}`;
  };

  return {
    t: translate,
    language,
    languageInfo: getLanguageInfo(),
    formatDate,
    formatTime,
    formatDateTime,
    formatNumber,
    formatCurrency
  };
};

// 简化的翻译Hook（只返回翻译函数）
export const useT = () => {
  const { t } = useTranslation();
  return t;
};
