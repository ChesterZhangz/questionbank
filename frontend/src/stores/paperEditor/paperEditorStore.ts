// 试卷编辑器状态管理 - Zustand store
import { create } from 'zustand';

export const usePaperEditorStore = create(() => ({
  // 编辑器状态
  content: '',
  currentPaper: null,
  // 更多状态...
}));
