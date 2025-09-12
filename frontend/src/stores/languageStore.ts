import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authAPI } from '../services/api';

export type Language = 'zh-CN' | 'en-US';

interface LanguageState {
  language: Language;
  isLoading: boolean;
  setLanguage: (language: Language) => void;
  updateLanguage: (language: Language) => Promise<void>;
  initializeLanguage: (userLanguage?: Language) => void;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language: 'zh-CN',
      isLoading: false,

      setLanguage: (language: Language) => {
        set({ language });
      },

      updateLanguage: async (language: Language) => {
        set({ isLoading: true });
        try {
          // 更新后端用户偏好
          await authAPI.updateProfile({
            preferences: {
              language: language
            }
          });
          
          // 更新本地状态
          set({ language, isLoading: false });
        } catch (error) {
          console.error('Failed to update language:', error);
          set({ isLoading: false });
          throw error;
        }
      },

      initializeLanguage: (userLanguage?: Language) => {
        if (userLanguage) {
          set({ language: userLanguage });
        }
      }
    }),
    {
      name: 'language-storage',
      partialize: (state) => ({ language: state.language }),
    }
  )
);
