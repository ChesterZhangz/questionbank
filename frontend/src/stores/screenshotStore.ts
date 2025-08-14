import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ScreenshotConfig } from '../components/screenshot/QuestionScreenshotTool';

interface ScreenshotStore {
  config: ScreenshotConfig;
  updateConfig: (updates: Partial<ScreenshotConfig>) => void;
  resetConfig: () => void;
}

const defaultConfig: ScreenshotConfig = {
  showAnswer: false,
  showSolution: false,
  showBankName: false,
  showQuestionNumber: true,
  showCreateTime: true,
  showSource: true,
  showTags: true,
  showDifficulty: true,
  showCategory: true,
  showKnowledgeTags: true,
  width: 700,
  padding: 50,
  fontFamily: 'Georgia, "Times New Roman", serif'
};

export const useScreenshotStore = create<ScreenshotStore>()(
  persist(
    (set) => ({
      config: defaultConfig,
      updateConfig: (updates) => {
        set((state) => ({
          config: { ...state.config, ...updates }
        }));
      },
      resetConfig: () => {
        set({ config: defaultConfig });
      }
    }),
    {
      name: 'screenshot-settings',
      version: 1
    }
  )
);
