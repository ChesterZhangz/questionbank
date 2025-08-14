import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLayoutStore } from '../../stores/layoutStore';
import { useMobile } from '../../hooks/useMobile';
import Header from './Header';
import Sidebar from './Sidebar';
import MobileNavigation from './MobileNavigation';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { 
    sidebarCollapsed, 
    layoutMode, 
    toggleSidebar, 
    setLayoutMode,
    theme 
  } = useLayoutStore();

  const { isMobile } = useMobile();

  // 在移动端自动切换到header模式
  useEffect(() => {
    if (isMobile && layoutMode === 'sidebar') {
      setLayoutMode('header');
    }
  }, [isMobile, layoutMode, setLayoutMode]);

  // 键盘快捷键支持（仅在桌面端）
  useEffect(() => {
    if (isMobile) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault();
        toggleSidebar();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [toggleSidebar, isMobile]);

  // 应用主题
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <div className="min-h-screen bg-bg-secondary dark:bg-gray-900">
      <AnimatePresence mode="wait">
        {layoutMode === 'header' && (
          <Header 
            key="header"
            sidebarCollapsed={sidebarCollapsed}
            onToggleSidebar={toggleSidebar}
            layoutMode={layoutMode}
            isMobile={isMobile}
          />
        )}
      </AnimatePresence>
      
      <div className={`flex ${layoutMode === 'header' ? 'pt-16' : 'pt-0'}`}>
        <AnimatePresence mode="wait">
          {layoutMode === 'sidebar' && !isMobile && (
            <Sidebar 
              key="sidebar"
              collapsed={sidebarCollapsed}
              onToggle={toggleSidebar}
              onLayoutChange={setLayoutMode}
            />
          )}
        </AnimatePresence>
        
        <MainContent 
          layoutMode={layoutMode} 
          sidebarCollapsed={sidebarCollapsed}
          isMobile={isMobile}
        >
          {children}
        </MainContent>
      </div>
      
      {/* 移动端底部导航 */}
      <MobileNavigation isVisible={isMobile} />
    </div>
  );
};

interface MainContentProps {
  children: React.ReactNode;
  layoutMode: 'sidebar' | 'header';
  sidebarCollapsed: boolean;
  isMobile: boolean;
}

const MainContent: React.FC<MainContentProps> = ({ 
  children, 
  layoutMode,
  isMobile
}) => {
  const { sidebarCollapsed: collapsed } = useLayoutStore();
  
  return (
    <motion.main 
      className={`flex-1 transition-all duration-300 ease-in-out ${
        layoutMode === 'sidebar' && !isMobile
          ? `min-h-screen ${collapsed ? 'ml-16' : 'ml-64'}`
          : 'min-h-[calc(100vh-4rem)] ml-0'
      } ${isMobile ? 'pb-20' : ''}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className={`${isMobile ? 'p-4' : 'p-6'}`}>
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </div>
    </motion.main>
  );
};

export default AppLayout; 