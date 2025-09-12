import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Handshake, Eye, Crown } from 'lucide-react';
import SimpleSelect from './menu/SimpleSelect';
import ConfirmModal from './ConfirmModal';
import { useTranslation } from '../../hooks/useTranslation';

interface RoleSelectorProps {
  currentRole: string;
  onRoleChange: (role: string) => void;
  disabled?: boolean;
  className?: string;
  showLabel?: boolean;
}

const RoleSelector: React.FC<RoleSelectorProps> = ({
  currentRole,
  onRoleChange,
  disabled = false,
  className = '',
  showLabel = true
}) => {
  const { t } = useTranslation();
  const [isChanging, setIsChanging] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingRole, setPendingRole] = useState<string>('');

  // 角色选项配置
  const roleOptions = [
    {
      value: 'owner',
      label: t('ui.roleSelector.roles.owner.label'),
      icon: Crown,
      description: t('ui.roleSelector.roles.owner.description')
    },
    {
      value: 'manager',
      label: t('ui.roleSelector.roles.manager.label'),
      icon: Settings,
      description: t('ui.roleSelector.roles.manager.description')
    },
    {
      value: 'collaborator',
      label: t('ui.roleSelector.roles.collaborator.label'),
      icon: Handshake,
      description: t('ui.roleSelector.roles.collaborator.description')
    },
    {
      value: 'viewer',
      label: t('ui.roleSelector.roles.viewer.label'),
      icon: Eye,
      description: t('ui.roleSelector.roles.viewer.description')
    }
  ];


  const handleRoleChange = async (newRole: string | number) => {
    const roleString = String(newRole);
    if (roleString === currentRole) return;
    
    // 如果要设置为所有者，需要确认
    if (roleString === 'owner') {
      setPendingRole(roleString);
      setShowConfirmModal(true);
      return;
    }
    
    // 其他角色直接更新
    await updateRole(roleString);
  };

  const updateRole = async (role: string) => {
    setIsChanging(true);
    try {
      await onRoleChange(role);
    } catch (error) {
      console.error('角色更新失败:', error);
    } finally {
      setIsChanging(false);
    }
  };

  const handleConfirmRoleChange = async () => {
    setShowConfirmModal(false);
    await updateRole(pendingRole);
    setPendingRole('');
  };

  const handleCancelRoleChange = () => {
    setShowConfirmModal(false);
    setPendingRole('');
  };

  return (
    <div className={`role-selector ${className}`}>
      {showLabel && (
        <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-2">
          {t('ui.roleSelector.memberRole')}
        </label>
      )}
      
      <div className="relative">
        <div className="relative z-50">
          <SimpleSelect
            options={roleOptions}
            value={currentRole}
            onChange={handleRoleChange}
            placeholder={t('ui.roleSelector.selectRole')}
            disabled={disabled || isChanging}
            variant="outline"
            size="sm"
            theme="blue"
            showIcon={true}
            customStyles={{
              button: 'min-w-[140px]',
              dropdown: 'min-w-[280px]',
              option: 'py-3 px-4'
            }}
          />
        </div>
        
        {/* 加载状态指示器 */}
        {isChanging && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute right-2 top-1/2 transform -translate-y-1/2"
          >
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </motion.div>
        )}
      </div>
      
      {/* 确认对话框 */}
      <ConfirmModal
        isOpen={showConfirmModal}
        onCancel={handleCancelRoleChange}
        onConfirm={handleConfirmRoleChange}
        title={t('ui.roleSelector.confirmOwner')}
        message={t('ui.roleSelector.confirmOwnerMessage')}
        confirmText={t('ui.roleSelector.confirmSet')}
        cancelText={t('ui.alert.cancel')}
        type="warning"
      />
    </div>
  );
};

export default RoleSelector;
