// 模板状态管理 - Zustand store
import { create } from 'zustand';

export const useTemplateStore = create(() => ({
  // 模板状态
  templates: [],
  currentTemplate: null,
  // 更多状态...
}));
