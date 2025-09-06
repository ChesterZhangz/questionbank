import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  Settings,
  Home,
  Upload,
  Users,
  FileText,
  LogOut,
  User,
  BookOpen,
  // ClipboardList,
  Shield,
  Info,
  Building2,
  ClipboardList
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import Avatar from '../ui/Avatar';
import { useTheme } from '../../hooks/useTheme';
import { useUserAvatar } from '../../hooks/useUserAvatar';
import { getLogoPath, getSiteName, getSiteTagline } from '../../config/siteConfig';

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  badge?: number;
  requiresAdmin?: boolean;
  requiresSuperAdmin?: boolean;
}

interface NavSection {
  id: string;
  title: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    id: 'overview',
    title: '总览',
    items: [
      { id: 'dashboard', label: '仪表盘', icon: Home, path: '/dashboard' }
    ]
  },
  {
    id: 'questions',
    title: '题目与题库',
    items: [
      { id: 'question-banks', label: '题库管理', icon: BookOpen, path: '/question-banks' },
      { id: 'questions', label: '题目管理', icon: FileText, path: '/questions' },
      { id: 'batch-upload', label: '批量上传', icon: Upload, path: '/batch-upload' }
    ]
  },
  {
    id: 'papers',
    title: '试卷',
    items: [
      { id: 'paper-banks', label: '试卷集', icon: ClipboardList, path: '/paper-banks' },
      { id: 'my-papers', label: '我的试卷', icon: FileText, path: '/my-papers' },
    ]
  },
  {
    id: 'admin',
    title: '管理者页面',
    items: [
      { id: 'enterprise-management', label: '企业管理', icon: Shield, path: '/enterprise-management', requiresSuperAdmin: true },
      { id: 'users', label: '用户管理', icon: Users, path: '/users', requiresAdmin: true }
    ]
  }
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  onLayoutChange: (mode: 'sidebar' | 'header') => void;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggle }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const [activeSection, setActiveSection] = useState('dashboard');
  const { isDark } = useTheme();
  const { src: userAvatarSrc } = useUserAvatar();

  // 检查用户权限
  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';
  const isSuperAdmin = user?.role === 'superadmin';
  const isAdminEmail = user?.email === 'admin@viquard.com';

  // 根据当前路径自动设置活动状态
  useEffect(() => {
    const currentPath = location.pathname;
    
    // 匹配路径并设置活动状态
    if (currentPath === '/dashboard') {
      setActiveSection('dashboard');
    } else if (currentPath.startsWith('/question-banks')) {
      setActiveSection('question-banks');
    } else if (currentPath === '/questions' || currentPath.startsWith('/questions/')) {
      // 包括题目管理页面和查看题目页面
      setActiveSection('questions');
    } else if (currentPath === '/batch-upload') {
      setActiveSection('batch-upload');
    } else if (currentPath === '/paper-banks' || currentPath.startsWith('/paper-banks/')) {
      setActiveSection('paper-banks');
    } else if (currentPath === '/my-papers' || currentPath.startsWith('/papers/')) {
      setActiveSection('papers');
    } else if (currentPath === '/markdown-demo') {
      setActiveSection('markdown-demo');
    } else if (currentPath === '/paper-generation') {
      setActiveSection('paper-generation');
    } else if (currentPath === '/my-enterprise') {
      setActiveSection('my-enterprise');
    } else if (currentPath === '/enterprise-management') {
      setActiveSection('enterprise-management');
    } else if (currentPath.startsWith('/users')) {
      setActiveSection('users');
    } else if (currentPath.startsWith('/analytics')) {
      setActiveSection('analytics');
    } else if (currentPath === '/settings') {
      setActiveSection('settings');
    } else if (currentPath === '/profile') {
      setActiveSection('profile');
    } else if (currentPath === '/version') {
      setActiveSection('version');
        } else if (currentPath === '/LaTeXGuide' || currentPath.startsWith('/guide/')) {
      setActiveSection('LaTeXGuide');
    }
  }, [location.pathname]);

  const handleNavClick = (item: NavItem) => {
    // 检查权限
    if (item.requiresSuperAdmin && !isSuperAdmin && !isAdminEmail) {
      return;
    }
    if (item.requiresAdmin && !isAdmin && !isAdminEmail) {
      return;
    }

    setActiveSection(item.id);
    navigate(item.path);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && !collapsed) {
      onToggle();
    }
  };

  // 过滤导航项（根据权限）
  const filteredNavSections = navSections.map(section => ({
    ...section,
    items: section.items.filter(item => {
      if (item.requiresSuperAdmin && !isSuperAdmin && !isAdminEmail) {
        return false;
      }
      if (item.requiresAdmin && !isAdmin && !isAdminEmail) {
        return false;
      }
      return true;
    })
  })).filter(section => section.items.length > 0);

  return (
    <motion.aside 
      className={`fixed left-0 top-0 h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border-r border-gray-200/50 dark:border-gray-700/50 shadow-xl z-[90] flex flex-col transition-all duration-300 ease-in-out backdrop-blur-sm ${
        collapsed ? 'w-20' : 'w-72'
      }`}
      initial={false}
      animate={{ width: collapsed ? 80 : 288 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
      role="navigation"
      aria-label="主导航"
    >
      {/* 侧边栏头部 */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200/50 dark:border-gray-700/50 h-20 flex-shrink-0 bg-gradient-to-r from-blue-600/10 to-indigo-600/10 dark:from-blue-600/20 dark:to-indigo-600/20">
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex items-center"
            >
              <div className="flex items-center gap-3">
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
                  <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">{getSiteName()}</h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{getSiteTagline()}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        <button 
          className="p-2.5 rounded-xl hover:bg-white/60 dark:hover:bg-gray-700/60 transition-all duration-200 hover:shadow-md backdrop-blur-sm"
          onClick={onToggle}
          aria-label={collapsed ? '展开侧边栏' : '收起侧边栏'}
        >
          <ChevronLeft className={`w-5 h-5 text-gray-600 dark:text-gray-300 transition-transform duration-300 ${
            collapsed ? 'rotate-180' : ''
          }`} />
        </button>
      </div>
      
      {/* 导航菜单 */}
      <nav className="flex-1 overflow-y-auto py-4">
        <div className="space-y-6">
          {filteredNavSections.map((section) => (
            <div key={section.id} className="mb-6">
              <AnimatePresence>
                {!collapsed && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="px-6 mb-4 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider"
                  >
                    {section.title}
                  </motion.div>
                )}
              </AnimatePresence>
              
              <ul className="space-y-2 px-4">
                {section.items.map((item) => (
                  <NavItem
                    key={item.id}
                    item={item}
                    active={activeSection === item.id}
                    collapsed={collapsed}
                    onClick={() => handleNavClick(item)}
                    isAdmin={isAdmin || isAdminEmail}
                    isSuperAdmin={isSuperAdmin || isAdminEmail}
                  />
                ))}
              </ul>
            </div>
          ))}
        </div>
      </nav>
      
      {/* 用户信息和设置 */}
      <div className={`border-t border-gray-200/50 dark:border-gray-700/50 flex-shrink-0 bg-gradient-to-br from-gray-50/80 to-gray-100/80 dark:from-gray-800/80 dark:to-gray-900/80 backdrop-blur-sm ${
        collapsed ? 'p-2' : 'p-4'
      }`}>
        {/* 用户信息 */}
        <div className={`flex items-center gap-3 mb-3 ${
          collapsed ? 'justify-center' : ''
        }`}>
          <Avatar
            src={userAvatarSrc}
            name={user?.name}
            size="lg"
            showAdminBadge={true}
            isSuperAdmin={isSuperAdmin}
            isAdminEmail={isAdminEmail}
          />
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 min-w-0"
              >
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                  {user?.name || '用户'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {user?.email || 'user@example.com'}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-xs px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium">
                    {isSuperAdmin || isAdminEmail ? '超级管理员' : isAdmin ? '管理员' : '普通用户'}
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 设置和退出 */}
        <div className="space-y-1.5">
          <button
            onClick={() => navigate('/profile')}
            className={`w-full flex items-center gap-3 text-sm rounded-xl transition-all duration-300 hover:shadow-md backdrop-blur-sm ${
              activeSection === 'profile'
                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                : 'text-gray-700 dark:text-gray-300 hover:bg-white/60 dark:hover:bg-gray-700/60 hover:text-gray-900 dark:hover:text-gray-100'
            } ${
              collapsed ? 'justify-center px-2 py-2.5' : 'px-3 py-2.5'
            }`}
          >
            <User className={`w-4 h-4 transition-colors duration-300 ${
              activeSection === 'profile' ? 'text-white' : 'text-gray-600 dark:text-gray-400'
            }`} />
            <AnimatePresence>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="font-medium"
                >
                  个人信息
                </motion.span>
              )}
            </AnimatePresence>
          </button>
          
          {/* 我的企业 - 只有企业用户才显示 */}
          {user?.enterpriseId && (
            <button
              onClick={() => navigate('/my-enterprise')}
              className={`w-full flex items-center gap-3 text-sm rounded-xl transition-all duration-300 hover:shadow-md backdrop-blur-sm ${
                activeSection === 'my-enterprise'
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-white/60 dark:hover:bg-gray-700/60 hover:text-gray-900 dark:hover:text-gray-100'
              } ${
                collapsed ? 'justify-center px-2 py-2.5' : 'px-3 py-2.5'
              }`}
            >
              <Building2 className={`w-4 h-4 transition-colors duration-300 ${
                activeSection === 'my-enterprise' ? 'text-white' : 'text-gray-600 dark:text-gray-400'
              }`} />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="font-medium"
                  >
                    我的企业
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          )}
          
          <button
            onClick={() => navigate('/settings')}
            className={`w-full flex items-center gap-3 text-sm rounded-xl transition-all duration-300 hover:shadow-md backdrop-blur-sm ${
              activeSection === 'settings'
                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                : 'text-gray-700 dark:text-gray-300 hover:bg-white/60 dark:hover:bg-gray-700/60 hover:text-gray-900 dark:hover:text-gray-100'
            } ${
              collapsed ? 'justify-center px-2 py-2.5' : 'px-3 py-2.5'
            }`}
          >
            <Settings className={`w-4 h-4 transition-colors duration-300 ${
              activeSection === 'settings' ? 'text-white' : 'text-gray-600 dark:text-gray-400'
            }`} />
            <AnimatePresence>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="font-medium"
                >
                  设置
                </motion.span>
              )}
            </AnimatePresence>
          </button>
          
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-white/60 dark:hover:bg-gray-700/60 rounded-xl transition-all duration-300 hover:shadow-md backdrop-blur-sm ${
              collapsed ? 'justify-center px-2 py-2.5' : 'px-3 py-2.5'
            }`}
          >
            <LogOut className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            <AnimatePresence>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="font-medium"
                >
                  退出登录
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>



        {/* 版本信息 */}
        <div className="mt-3 pt-3 border-t border-gray-200/50 dark:border-gray-700/50">
          <button
            onClick={() => navigate('/version')}
            className={`w-full flex items-center gap-3 text-sm rounded-lg transition-all duration-300 ${
              activeSection === 'version'
                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-white/40 dark:hover:bg-gray-700/40'
            } ${
              collapsed ? 'justify-center px-2 py-1.5' : 'px-3 py-1.5'
            }`}
          >
            <Info className={`w-3.5 h-3.5 transition-colors duration-300 ${
              activeSection === 'version' ? 'text-white' : ''
            }`} />
            <AnimatePresence>
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2"
                >
                  <span className="text-xs">v0.80</span>
                  <span className="text-xs opacity-75">版本信息</span>
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </div>
      </div>
    </motion.aside>
  );
};

interface NavItemProps {
  item: NavItem;
  active: boolean;
  collapsed: boolean;
  onClick: () => void;
  isAdmin: boolean;
  isSuperAdmin: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ 
  item, 
  active, 
  collapsed, 
  onClick,
  isAdmin,
  isSuperAdmin
}) => {
  const canAccess = !item.requiresAdmin || isAdmin || isSuperAdmin;

  if (!canAccess) {
    return null;
  }

  return (
    <li>
      <button
        onClick={onClick}
        className={`w-full flex items-center gap-4 px-4 py-3.5 text-sm font-medium rounded-xl transition-all duration-300 group relative ${
          active
            ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
            : 'text-gray-700 dark:text-gray-300 hover:bg-white/60 dark:hover:bg-gray-700/60 hover:text-gray-900 dark:hover:text-gray-100 hover:shadow-md'
        } ${collapsed ? 'justify-center' : 'justify-start'}`}
        aria-label={item.label}
      >
        <div className="flex items-center gap-4">
          <item.icon className={`w-5 h-5 transition-colors duration-300 ${
            active ? 'text-white' : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300'
          }`} />
          {!collapsed && (
            <span className="truncate">{item.label}</span>
          )}
        </div>
        
        {item.badge && !collapsed && (
          <span className={`ml-auto px-2 py-1 text-xs font-semibold rounded-full ${
            active
              ? 'bg-white/20 text-white'
              : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
          }`}>
            {item.badge}
          </span>
        )}
      </button>
    </li>
  );
};

export default Sidebar; 