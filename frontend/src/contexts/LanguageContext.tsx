import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useAuthStore } from '../stores/authStore';

export type Language = 'zh-CN' | 'en-US';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  isLoading: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const { user } = useAuthStore();
  const [language, setLanguageState] = useState<Language>('zh-CN');
  const [isLoading] = useState(false);

  // 初始化语言设置
  useEffect(() => {
    if (user?.preferences?.language) {
      setLanguageState(user.preferences.language);
    }
  }, [user]);

  // 设置语言
  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage);
    // 这里可以添加保存到后端的逻辑
    // 或者通过authStore来更新用户偏好
  };

  const value: LanguageContextType = {
    language,
    setLanguage,
    isLoading
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
