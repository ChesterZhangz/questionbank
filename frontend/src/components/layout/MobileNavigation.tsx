import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Home,
  BookOpen,
  FileText
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';

interface MobileNavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  requiresAdmin?: boolean;
}

const mobileNavItems: MobileNavItem[] = [
  { id: 'dashboard', label: '仪表盘', icon: Home, path: '/dashboard' },
  { id: 'question-banks', label: '题库', icon: BookOpen, path: '/question-banks' },
  { id: 'questions', label: '题目', icon: FileText, path: '/questions' },
];

interface MobileNavigationProps {
  isVisible: boolean;
}

const MobileNavigation: React.FC<MobileNavigationProps> = ({ isVisible }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();

  // 检查用户权限
  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';
  const isAdminEmail = user?.email === 'admin@viquard.com';

  // 过滤导航项（根据权限）
  const filteredNavItems = mobileNavItems.filter(item => {
    if (item.requiresAdmin && !isAdmin && !isAdminEmail) {
      return false;
    }
    return true;
  });

  const handleNavClick = (item: MobileNavItem) => {
    // 检查权限
    if (item.requiresAdmin && !isAdmin && !isAdminEmail) {
      return;
    }
    navigate(item.path);
  };

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  if (!isVisible) return null;

  return (
    <motion.nav
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border-t border-gray-200/50 dark:border-gray-700/50 shadow-lg dark:shadow-gray-900/30 z-[95] md:hidden"
    >
      <div className="flex items-center justify-around px-2 py-2">
        {filteredNavItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item)}
              className={`flex flex-col items-center justify-center w-16 h-16 rounded-xl transition-all duration-200 ${
                active
                  ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100/60 dark:hover:bg-gray-700/60'
              }`}
            >
              <Icon className={`w-6 h-6 transition-colors duration-200 ${
                active ? 'text-white' : 'text-gray-500 dark:text-gray-400'
              }`} />
              <span className={`text-xs font-medium mt-1 transition-colors duration-200 ${
                active ? 'text-white' : 'text-gray-500 dark:text-gray-400'
              }`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </motion.nav>
  );
};

export default MobileNavigation; 