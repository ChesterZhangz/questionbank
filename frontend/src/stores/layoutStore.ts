import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface LayoutState {
  sidebarCollapsed: boolean;
  layoutMode: 'sidebar' | 'header';
  theme: 'light' | 'dark' | 'auto';
  
  toggleSidebar: () => void;
  setLayoutMode: (mode: 'sidebar' | 'header') => void;
  setTheme: (theme: 'light' | 'dark' | 'auto') => void;
}

export const useLayoutStore = create<LayoutState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      layoutMode: 'sidebar',
      theme: 'light',
      
      toggleSidebar: () => set(state => ({ 
        sidebarCollapsed: !state.sidebarCollapsed 
      })),
      
      setLayoutMode: (mode) => set({ layoutMode: mode }),
      
      setTheme: (theme) => set({ theme })
    }),
    {
      name: 'layout-settings',
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        layoutMode: state.layoutMode,
        theme: state.theme,
      }),
    }
  )
); 