import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronDown, 
  Settings,
  LogOut,
  User,
  Building2,
  Menu
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import Avatar from '../ui/Avatar';
import { useTheme } from '../../hooks/useTheme';
import { getLogoPath, getSiteName, getSiteTagline } from '../../config/siteConfig';

interface HeaderProps {
  sidebarCollapsed: boolean;
  onToggleSidebar: () => void;
  layoutMode: 'sidebar' | 'header';
  isMobile?: boolean;
}

const Header: React.FC<HeaderProps> = ({ 
  sidebarCollapsed, 
  onToggleSidebar, 
  layoutMode,
  isMobile = false
}) => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const { isDark } = useTheme();

  // 检查用户权限
  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';
  const isSuperAdmin = user?.role === 'superadmin';
  const isAdminEmail = user?.email === 'admin@viquard.com';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // 点击外部关闭菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 h-20 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50 shadow-lg z-[100]">
      <div className={`flex items-center justify-between h-full ${isMobile ? 'px-4' : 'px-8'}`}>
        <div className="flex items-center gap-8">
          {layoutMode === 'sidebar' && !isMobile && (
            <button 
              className="p-3 rounded-xl hover:bg-gray-100/80 dark:hover:bg-gray-700/80 transition-all duration-200 hover:shadow-md backdrop-blur-sm"
              onClick={onToggleSidebar}
              aria-label={sidebarCollapsed ? '展开侧边栏' : '收起侧边栏'}
            >
              <Menu className="w-6 h-6 text-gray-600 dark:text-gray-300" />
            </button>
          )}
          
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden">
              <img 
                src={getLogoPath(isDark)} 
                alt="网站Logo" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  // 如果头像加载失败，使用彩色logo作为fallback
                  const target = e.target as HTMLImageElement;
                  target.src = getLogoPath(isDark, true);
                }}
              />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">{getSiteName()}</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">{getSiteTagline()}</p>
            </div>
          </div>

          {layoutMode === 'header' && !isMobile && (
            <nav className="flex gap-2">
              <NavLink to="/dashboard" label="仪表盘" />
              <NavLink to="/question-banks" label="题库管理" />
              <NavLink to="/questions" label="题目管理" />
              <NavLink to="/paper-generation" label="组卷" />
              {(isAdmin || isAdminEmail) && (
                <NavLink to="/users" label="用户管理" />
              )}
            </nav>
          )}
        </div>

        <div className="flex items-center gap-6">
          {/* 用户菜单 */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className={`flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-gray-100/80 dark:hover:bg-gray-700/80 transition-all duration-200 hover:shadow-md backdrop-blur-sm ${
                isMobile ? 'gap-2' : 'gap-4'
              }`}
              aria-label="用户菜单"
            >
              <Avatar
                src={user?.avatar}
                name={user?.name}
                size="md"
                showAdminBadge={true}
                isSuperAdmin={isSuperAdmin}
                isAdminEmail={isAdminEmail}
              />
              {!isMobile && (
                <div className="text-left">
                  <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">{user?.name || '用户'}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{user?.email || 'user@example.com'}</div>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-xs px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium">
                      {isSuperAdmin || isAdminEmail ? '超级管理员' : isAdmin ? '管理员' : '普通用户'}
                    </span>
                  </div>
                </div>
              )}
              <ChevronDown className={`w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform duration-200 ${
                userMenuOpen ? 'rotate-180' : ''
              }`} />
            </button>

            {/* 用户下拉菜单 */}
            <AnimatePresence>
              {userMenuOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className={`absolute right-0 top-full mt-3 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border border-gray-200/50 dark:border-gray-700/50 rounded-xl shadow-xl py-3 z-50 ${
                    isMobile ? 'w-48' : 'w-56'
                  }`}
                >
                  {!isMobile && (
                    <div className="px-4 py-3 border-b border-gray-200/50 dark:border-gray-700/50">
                      <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">{user?.name || '用户'}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{user?.email || 'user@example.com'}</div>
                      <div className="flex items-center gap-1 mt-2">
                        <span className="text-xs px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium">
                          {isSuperAdmin || isAdminEmail ? '超级管理员' : isAdmin ? '管理员' : '普通用户'}
                        </span>
                      </div>
                    </div>
                  )}
                  <div className="py-2">
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        navigate('/my-enterprise');
                      }}
                      className="w-full flex items-center gap-4 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100/80 dark:hover:bg-gray-700/80 transition-all duration-200"
                    >
                      <Building2 className="w-4 h-4" />
                      我的企业
                    </button>
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        navigate('/profile');
                      }}
                      className="w-full flex items-center gap-4 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100/80 dark:hover:bg-gray-700/80 transition-all duration-200"
                    >
                      <User className="w-4 h-4" />
                      个人信息
                    </button>
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        navigate('/settings');
                      }}
                      className="w-full flex items-center gap-4 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100/80 dark:hover:bg-gray-700/80 transition-all duration-200"
                    >
                      <Settings className="w-4 h-4" />
                      设置
                    </button>
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        handleLogout();
                      }}
                      className="w-full flex items-center gap-4 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100/80 dark:hover:bg-gray-700/80 transition-all duration-200"
                    >
                      <LogOut className="w-4 h-4" />
                      退出登录
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
};

interface NavLinkProps {
  to: string;
  label: string;
}

const NavLink: React.FC<NavLinkProps> = ({ to, label }) => {
  const navigate = useNavigate();
  
  return (
    <button 
      className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100/80 dark:hover:bg-gray-700/80 rounded-xl transition-all duration-200 font-medium"
      onClick={() => navigate(to)}
    >
      {label}
    </button>
  );
};

export default Header; 