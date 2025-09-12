import React from 'react';
import { User, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from '../../hooks/useTranslation';

interface AvatarProps {
  /** 用户头像URL */
  src?: string;
  /** 用户姓名（用于生成首字母头像） */
  name?: string;
  /** 头像大小 */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  /** 是否显示管理员徽章 */
  showAdminBadge?: boolean;
  /** 是否为超级管理员 */
  isSuperAdmin?: boolean;
  /** 是否为管理员邮箱 */
  isAdminEmail?: boolean;
  /** 自定义className */
  className?: string;
  /** 是否禁用悬停效果 */
  disableHover?: boolean;
  /** 点击事件 */
  onClick?: () => void;
  /** 是否显示在线状态 */
  showOnlineStatus?: boolean;
  /** 在线状态 */
  isOnline?: boolean;
  /** 头像形状 */
  shape?: 'circle' | 'rounded' | 'square';
}

/**
 * 统一的头像组件
 * 用于所有需要显示用户头像的地方，确保一致的视觉效果
 */
const Avatar: React.FC<AvatarProps> = ({
  src,
  name = '',
  size = 'md',
  showAdminBadge = false,
  isSuperAdmin = false,
  isAdminEmail = false,
  className = '',
  disableHover = false,
  onClick,
  showOnlineStatus = false,
  isOnline = false,
  shape = 'rounded'
}) => {
  const { t } = useTranslation();
  // 获取尺寸样式
  const getSizeClasses = () => {
    switch (size) {
      case 'xs':
        return 'w-6 h-6';
      case 'sm':
        return 'w-8 h-8';
      case 'md':
        return 'w-10 h-10';
      case 'lg':
        return 'w-12 h-12';
      case 'xl':
        return 'w-16 h-16';
      case '2xl':
        return 'w-20 h-20';
      default:
        return 'w-10 h-10';
    }
  };

  // 获取形状样式
  const getShapeClasses = () => {
    switch (shape) {
      case 'circle':
        return 'rounded-full';
      case 'rounded':
        return 'rounded-xl';
      case 'square':
        return 'rounded-lg';
      default:
        return 'rounded-xl';
    }
  };

  // 获取图标大小
  const getIconSize = () => {
    switch (size) {
      case 'xs':
        return 'w-3 h-3';
      case 'sm':
        return 'w-4 h-4';
      case 'md':
        return 'w-5 h-5';
      case 'lg':
        return 'w-6 h-6';
      case 'xl':
        return 'w-8 h-8';
      case '2xl':
        return 'w-10 h-10';
      default:
        return 'w-5 h-5';
    }
  };

  // 获取徽章大小
  const getBadgeSize = () => {
    switch (size) {
      case 'xs':
        return 'w-3 h-3';
      case 'sm':
        return 'w-4 h-4';
      case 'md':
        return 'w-5 h-5';
      case 'lg':
        return 'w-6 h-6';
      case 'xl':
        return 'w-7 h-7';
      case '2xl':
        return 'w-8 h-8';
      default:
        return 'w-5 h-5';
    }
  };

  // 获取徽章图标大小
  const getBadgeIconSize = () => {
    switch (size) {
      case 'xs':
        return 'w-1.5 h-1.5';
      case 'sm':
        return 'w-2 h-2';
      case 'md':
        return 'w-3 h-3';
      case 'lg':
        return 'w-3.5 h-3.5';
      case 'xl':
        return 'w-4 h-4';
      case '2xl':
        return 'w-5 h-5';
      default:
        return 'w-3 h-3';
    }
  };

  // 生成首字母头像
  const getInitials = (name: string) => {
    if (!name) return t('ui.avatar.defaultInitials');
    
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // 获取头像背景色（基于姓名生成一致的颜色）
  const getAvatarColor = (name: string) => {
    if (!name) return 'from-blue-600 to-indigo-600';
    
    const colors = [
      'from-blue-600 to-indigo-600',
      'from-purple-600 to-pink-600',
      'from-green-600 to-emerald-600',
      'from-yellow-600 to-orange-600',
      'from-red-600 to-rose-600',
      'from-cyan-600 to-blue-600',
      'from-violet-600 to-purple-600',
      'from-emerald-600 to-teal-600',
      'from-orange-600 to-red-600',
      'from-teal-600 to-cyan-600'
    ];
    
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    return colors[Math.abs(hash) % colors.length];
  };

  // 基础样式
  const baseClasses = `
    ${getSizeClasses()} 
    ${getShapeClasses()} 
    flex items-center justify-center 
    shadow-lg 
    transition-all duration-200
    ${!disableHover ? 'hover:shadow-xl hover:scale-105' : ''}
    ${onClick ? 'cursor-pointer' : ''}
    ${className}
  `;

  // 渲染头像内容
  const renderAvatarContent = () => {
    if (src) {
      return (
        <img
          src={src}
          alt={name || t('ui.avatar.defaultName')}
          className={`${getSizeClasses()} ${getShapeClasses()} object-cover`}
          onError={(e) => {
            // 如果图片加载失败，隐藏图片元素，显示默认头像
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      );
    }

    // 如果有姓名，显示首字母头像
    if (name) {
      return (
        <div className={`${baseClasses} bg-gradient-to-br ${getAvatarColor(name)} text-white font-semibold`}>
          <span className={`${size === 'xs' ? 'text-xs' : size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-lg' : size === 'xl' ? 'text-xl' : size === '2xl' ? 'text-2xl' : 'text-base'}`}>
            {getInitials(name)}
          </span>
        </div>
      );
    }

    // 默认头像（使用用户图标）
    return (
      <div className={`${baseClasses} bg-gradient-to-br from-blue-600 to-indigo-600 text-white`}>
        <User className={getIconSize()} />
      </div>
    );
  };

  return (
    <motion.div 
      className="relative inline-block"
      whileHover={!disableHover ? { scale: 1.05 } : {}}
      whileTap={onClick ? { scale: 0.95 } : {}}
      onClick={onClick}
    >
      {/* 头像主体 */}
      {renderAvatarContent()}

      {/* 管理员徽章 */}
      {showAdminBadge && (isSuperAdmin || isAdminEmail) && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
          className={`absolute -top-1 -right-1 ${getBadgeSize()} bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-sm`}
        >
          <Shield className={`${getBadgeIconSize()} text-white`} />
        </motion.div>
      )}

      {/* 在线状态指示器 */}
      {showOnlineStatus && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
          className={`absolute -bottom-1 -right-1 ${
            size === 'xs' ? 'w-2.5 h-2.5' : 
            size === 'sm' ? 'w-3 h-3' : 
            size === 'md' ? 'w-3.5 h-3.5' :
            size === 'lg' ? 'w-4 h-4' :
            size === 'xl' ? 'w-5 h-5' : 'w-6 h-6'
          } ${isOnline ? 'bg-green-500' : 'bg-gray-400'} rounded-full border-2 border-white dark:border-gray-800 shadow-sm`}
        />
      )}
    </motion.div>
  );
};

export default Avatar;
