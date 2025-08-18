import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Palette,
  Layout,
  Monitor,
  Smartphone,
  Sun,
  Moon,
  Shield,
  Database,
  Eye,
  EyeOff
} from 'lucide-react';
import { useLayoutStore } from '../../stores/layoutStore';
import { useAuthStore } from '../../stores/authStore';

import { useTheme } from '../../contexts/ThemeContext';
import { authAPI } from '../../services/api';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import ConfirmModal from '../../components/ui/ConfirmModal';
import RightSlideModal from '../../components/ui/RightSlideModal';
import { useModal } from '../../hooks/useModal';

const SettingsPage: React.FC = () => {
  const { layoutMode, setLayoutMode } = useLayoutStore();
  const { theme, setTheme } = useTheme();
  const { logout } = useAuthStore();


  // 弹窗状态管理
  const { 
    confirmModal, 
    closeConfirm,
    showSuccessRightSlide,
    showErrorRightSlide,
    rightSlideModal,
    closeRightSlide
  } = useModal();

  // 密码修改状态
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  // 两步验证状态
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  // 数据导出状态
  const [exporting, setExporting] = useState(false);

  // 处理密码修改
  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showErrorRightSlide('密码错误', '新密码和确认密码不匹配');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      showErrorRightSlide('密码错误', '新密码长度至少6位');
      return;
    }

    try {
      await authAPI.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      showSuccessRightSlide('修改成功', '密码已成功修改，请使用新密码重新登录');
      setShowPasswordModal(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      logout();
    } catch (error: any) {
      showErrorRightSlide('修改失败', error.response?.data?.message || '密码修改失败，请重试');
    }
  };

  // 处理两步验证开关
  const handleTwoFactorToggle = () => {
    setTwoFactorEnabled(!twoFactorEnabled);
    showSuccessRightSlide(
      '设置成功', 
      `两步验证已${twoFactorEnabled ? '禁用' : '启用'}`
    );
  };

  // 处理数据导出
  const handleDataExport = async () => {
    setExporting(true);
    try {
      // 模拟导出过程
      await new Promise(resolve => setTimeout(resolve, 2000));
      showSuccessRightSlide('导出成功', '数据已成功导出到您的设备');
    } catch (error) {
      showErrorRightSlide('导出失败', '数据导出失败，请重试');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-blue-900/20 dark:to-indigo-900/20 p-6">
      <div className="max-w-7xl mx-auto">
        {/* 页面头部 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">系统设置</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">自定义您的应用体验和偏好设置</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 外观设置 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                    <Palette className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">外观设置</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">自定义界面主题和布局</p>
                  </div>
                </div>

                {/* 主题设置 */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      主题模式
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      <button
                        onClick={() => setTheme('light')}
                        className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all duration-200 ${
                          theme === 'light'
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                        }`}
                      >
                        <Sun className={`w-5 h-5 ${theme === 'light' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`} />
                        <div className="text-left">
                          <div className={`font-medium ${theme === 'light' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}`}>
                            浅色主题
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">明亮清晰的界面</div>
                        </div>
                      </button>

                      <button
                        onClick={() => setTheme('dark')}
                        className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all duration-200 ${
                          theme === 'dark'
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                        }`}
                      >
                        <Moon className={`w-5 h-5 ${theme === 'dark' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`} />
                        <div className="text-left">
                          <div className={`font-medium ${theme === 'dark' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}`}>
                            深色主题
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">护眼舒适的界面</div>
                        </div>
                      </button>

                      <button
                        onClick={() => setTheme('auto')}
                        className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all duration-200 ${
                          theme === 'auto'
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                        }`}
                      >
                        <Monitor className={`w-5 h-5 ${theme === 'auto' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`} />
                        <div className="text-left">
                          <div className={`font-medium ${theme === 'auto' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}`}>
                            跟随系统
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">自动跟随系统主题</div>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* 布局设置 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      布局模式
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setLayoutMode('sidebar')}
                        className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all duration-200 ${
                          layoutMode === 'sidebar'
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                        }`}
                      >
                        <Layout className={`w-5 h-5 ${layoutMode === 'sidebar' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`} />
                        <div className="text-left">
                          <div className={`font-medium ${layoutMode === 'sidebar' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}`}>
                            侧边栏模式
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">传统侧边导航</div>
                        </div>
                      </button>

                      <button
                        onClick={() => setLayoutMode('header')}
                        className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all duration-200 ${
                          layoutMode === 'header'
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                        }`}
                      >
                        <Monitor className={`w-5 h-5 ${layoutMode === 'header' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`} />
                        <div className="text-left">
                          <div className={`font-medium ${layoutMode === 'header' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}`}>
                            顶部导航模式
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">现代顶部导航</div>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* 账户安全 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg flex items-center justify-center">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">账户安全</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">保护您的账户安全</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                    onClick={() => setShowPasswordModal(true)}
                  >
                    <Shield className="w-4 h-4 mr-3" />
                    修改密码
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                    onClick={handleTwoFactorToggle}
                  >
                    <Smartphone className="w-4 h-4 mr-3" />
                    {twoFactorEnabled ? '禁用两步验证' : '启用两步验证'}
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                    onClick={handleDataExport}
                    disabled={exporting}
                  >
                    <Database className="w-4 h-4 mr-3" />
                    {exporting ? '导出中...' : '数据导出'}
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>


        </div>
      </div>

      {/* 密码修改模态框 */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">修改密码</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">当前密码</label>
                <div className="relative">
                  <input
                    type={showPasswords.current ? 'text' : 'password'}
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent dark:bg-gray-700 dark:text-gray-300"
                    placeholder="输入当前密码"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  >
                    {showPasswords.current ? <EyeOff className="w-4 h-4 text-gray-500 dark:text-gray-400" /> : <Eye className="w-4 h-4 text-gray-500 dark:text-gray-400" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">新密码</label>
                <div className="relative">
                  <input
                    type={showPasswords.new ? 'text' : 'password'}
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent dark:bg-gray-700 dark:text-gray-300"
                    placeholder="输入新密码"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  >
                    {showPasswords.new ? <EyeOff className="w-4 h-4 text-gray-500 dark:text-gray-400" /> : <Eye className="w-4 h-4 text-gray-500 dark:text-gray-400" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">确认新密码</label>
                <div className="relative">
                  <input
                    type={showPasswords.confirm ? 'text' : 'password'}
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent dark:bg-gray-700 dark:text-gray-300"
                    placeholder="再次输入新密码"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  >
                    {showPasswords.confirm ? <EyeOff className="w-4 h-4 text-gray-500 dark:text-gray-400" /> : <Eye className="w-4 h-4 text-gray-500 dark:text-gray-400" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowPasswordModal(false)}
                className="flex-1 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                取消
              </Button>
              <Button
                onClick={handlePasswordChange}
                className="flex-1"
              >
                确认修改
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 确认弹窗 */}
      <ConfirmModal
        {...confirmModal}
        onCancel={closeConfirm}
      />

      {/* 右侧弹窗 */}
      <RightSlideModal
        {...rightSlideModal}
        onClose={closeRightSlide}
      />
    </div>
  );
};

export default SettingsPage; 