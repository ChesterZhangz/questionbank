import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Handshake, Eye, Crown, X, Loader } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import Button from './Button';
import Card from './Card';

interface RoleChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRole: string;
  memberName: string;
  memberEmail: string;
  onRoleChange: (role: string) => Promise<void>;
}

const RoleChangeModal: React.FC<RoleChangeModalProps> = ({
  isOpen,
  onClose,
  currentRole,
  memberName,
  memberEmail,
  onRoleChange
}) => {
  const { t } = useTranslation();
  const [selectedRole, setSelectedRole] = useState(currentRole);
  const [isChanging, setIsChanging] = useState(false);

  // 角色选项配置
  const roleOptions = [
    {
      value: 'manager',
      label: t('paperBanks.members.roles.manager'),
      icon: Settings,
      description: t('paperBanks.members.inviteForm.roleOptions.manager'),
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      borderColor: 'border-blue-200 dark:border-blue-700'
    },
    {
      value: 'collaborator',
      label: t('paperBanks.members.roles.collaborator'),
      icon: Handshake,
      description: t('paperBanks.members.inviteForm.roleOptions.collaborator'),
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      borderColor: 'border-green-200 dark:border-green-700'
    },
    {
      value: 'viewer',
      label: t('paperBanks.members.roles.viewer'),
      icon: Eye,
      description: t('paperBanks.members.inviteForm.roleOptions.viewer'),
      color: 'text-gray-600 dark:text-gray-400',
      bgColor: 'bg-gray-50 dark:bg-gray-900/20',
      borderColor: 'border-gray-200 dark:border-gray-700'
    }
  ];

  const handleRoleSelect = (role: string) => {
    setSelectedRole(role);
  };

  const handleConfirm = async () => {
    if (selectedRole === currentRole) {
      onClose();
      return;
    }

    setIsChanging(true);
    try {
      await onRoleChange(selectedRole);
      onClose();
    } catch (error) {
      console.error('角色更新失败:', error);
    } finally {
      setIsChanging(false);
    }
  };

  const handleClose = () => {
    if (!isChanging) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-md"
      >
        <Card className="p-6">
          {/* 头部 */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {t('paperBanks.changeRole.title')}
            </h3>
            <button
              onClick={handleClose}
              disabled={isChanging}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 成员信息 */}
          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold mr-3">
                {memberName.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  {memberName}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {memberEmail}
                </p>
              </div>
            </div>
          </div>

          {/* 当前角色显示 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              {t('paperBanks.changeRole.currentRole')}
            </label>
            <div className="flex items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
              <Crown className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-3" />
              <span className="text-blue-600 dark:text-blue-400 font-medium">
                {t('paperBanks.members.roles.' + currentRole)}
              </span>
            </div>
          </div>

          {/* 角色选择 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-3">
              {t('paperBanks.changeRole.selectNewRole')}
            </label>
            <div className="space-y-2">
              {roleOptions.map((role) => {
                const Icon = role.icon;
                const isSelected = selectedRole === role.value;
                const isCurrent = currentRole === role.value;
                
                return (
                  <motion.button
                    key={role.value}
                    onClick={() => handleRoleSelect(role.value)}
                    disabled={isCurrent || isChanging}
                    className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                      isSelected
                        ? `${role.bgColor} ${role.borderColor} border-2`
                        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    } ${isCurrent ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    whileHover={!isCurrent && !isChanging ? { scale: 1.02 } : {}}
                    whileTap={!isCurrent && !isChanging ? { scale: 0.98 } : {}}
                  >
                    <div className="flex items-center">
                      <Icon className={`w-5 h-5 mr-3 ${isSelected ? role.color : 'text-gray-400'}`} />
                      <div className="flex-1">
                        <div className={`font-medium ${isSelected ? role.color : 'text-gray-900 dark:text-gray-100'}`}>
                          {role.label}
                          {isCurrent && (
                            <span className="ml-2 text-xs bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 px-2 py-1 rounded">
                              {t('paperBanks.changeRole.current')}
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {role.description}
                        </div>
                      </div>
                      {isSelected && (
                        <div className={`w-6 h-6 rounded-full ${role.bgColor} ${role.borderColor} border-2 flex items-center justify-center`}>
                          <div className={`w-3 h-3 rounded-full ${role.color.replace('text-', 'bg-')}`}></div>
                        </div>
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex gap-3">
            <Button
              onClick={handleClose}
              variant="outline"
              disabled={isChanging}
              className="flex-1"
            >
              {t('paperBanks.changeRole.cancel')}
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={selectedRole === currentRole || isChanging}
              loading={isChanging}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {isChanging ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  {t('paperBanks.changeRole.updating')}
                </>
              ) : (
                t('paperBanks.changeRole.confirm')
              )}
            </Button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default RoleChangeModal;
