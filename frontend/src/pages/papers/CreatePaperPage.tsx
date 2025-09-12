import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  BookOpen, 
  PenTool, 
  FileText, 
  AlertCircle,
  CheckCircle,
  Lock
} from 'lucide-react';

import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { useModal } from '../../hooks/useModal';
import RightSlideModal from '../../components/ui/RightSlideModal';
import { paperBankAPI } from '../../services/api';
import { useTranslation } from '../../hooks/useTranslation';

interface PaperBank {
  _id: string;
  name: string;
  description: string;
  status: 'draft' | 'published';
  memberCount: number;
  ownerId: string;
  userRole: 'owner' | 'manager' | 'collaborator' | 'viewer';
}

const CreatePaperPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { showErrorRightSlide, rightSlideModal } = useModal();

  // 试卷集相关状态
  const [paperBanks, setPaperBanks] = useState<PaperBank[]>([]);
  const [loading, setLoading] = useState(false);
  const [showPaperBankModal, setShowPaperBankModal] = useState(false);
  const [selectedPaperType, setSelectedPaperType] = useState<string>('');

  // 试卷类型选项
  const paperTypeOptions = [
    { 
      value: 'lecture', 
      label: t('paperPage.createPage.paperTypes.lecture.label'), 
      icon: BookOpen,
      description: t('paperPage.createPage.paperTypes.lecture.description'),
      enabled: false,
      color: 'blue'
    },
    { 
      value: 'practice', 
      label: t('paperPage.createPage.paperTypes.practice.label'), 
      icon: PenTool,
      description: t('paperPage.createPage.paperTypes.practice.description'),
      enabled: true,
      color: 'orange'
    },
    { 
      value: 'test', 
      label: t('paperPage.createPage.paperTypes.test.label'), 
      icon: FileText,
      description: t('paperPage.createPage.paperTypes.test.description'),
      enabled: false,
      color: 'red'
    }
  ];

  // 加载用户有权限的试卷集
  useEffect(() => {
    loadPaperBanks();
  }, []);

  const loadPaperBanks = async () => {
    try {
      setLoading(true);
      // 使用getMyPapers API来获取用户有权限访问的所有试卷集（包括被邀请的）
      const response = await paperBankAPI.getMyPapers();
      if (response.data.success) {
        // 只显示用户有编辑/管理/拥有者权限的试卷集
        const accessibleBanks = response.data.data.papers.filter((bank: PaperBank) => {
          return ['owner', 'manager', 'collaborator'].includes(bank.userRole);
        });
        setPaperBanks(accessibleBanks);
      }
    } catch (error) {
      console.error(t('paperPage.createPage.errors.loadFailed'), error);
      showErrorRightSlide(t('paperPage.createPage.errors.loadFailed'), t('paperPage.createPage.errors.loadFailedMessage'));
    } finally {
      setLoading(false);
    }
  };

  // 检查是否有权限创建试卷
  const hasPermission = paperBanks.length > 0;

  // 处理试卷类型选择
  const handlePaperTypeSelect = (type: string) => {
    // 记录选择的试卷类型
    setSelectedPaperType(type);
    
    if (type === 'lecture') {
      // 如果URL中有paperBankId参数，直接跳转到讲义编辑页面
      const urlPaperBankId = searchParams.get('paperBankId');
      if (urlPaperBankId && paperBanks.find(bank => bank._id === urlPaperBankId)) {
        navigate(`/paper-banks/${urlPaperBankId}/lectures/create`);
      } else {
        // 显示试卷集选择模态框
        showPaperBankSelection();
      }
    } else if (type === 'practice') {
      // 练习模式：如果URL中有paperBankId参数，直接跳转到练习编辑页面
      const urlPaperBankId = searchParams.get('paperBankId');
      if (urlPaperBankId && paperBanks.find(bank => bank._id === urlPaperBankId)) {
        navigate(`/paper-banks/${urlPaperBankId}/practices/create`);
      } else {
        // 显示试卷集选择模态框
        showPracticeBankSelection();
      }
    } else {
      showErrorRightSlide(t('paperPage.createPage.errors.featureNotAvailable'), t('paperPage.createPage.errors.featureNotAvailableMessage'));
    }
  };

  // 显示试卷集选择
  const showPaperBankSelection = () => {
    if (paperBanks.length === 0) {
      showErrorRightSlide(t('paperPage.createPage.errors.cannotCreate'), t('paperPage.createPage.errors.cannotCreateMessage'));
      return;
    }
    
    if (paperBanks.length === 1) {
      // 只有一个试卷集，直接跳转
      navigate(`/paper-banks/${paperBanks[0]._id}/lectures/create`);
    } else {
      // 多个试卷集，显示选择界面
      setShowPaperBankModal(true);
    }
  };

  // 显示练习模式试卷集选择
  const showPracticeBankSelection = () => {
    if (paperBanks.length === 0) {
      showErrorRightSlide(t('paperPage.createPage.errors.cannotCreatePractice'), t('paperPage.createPage.errors.cannotCreatePracticeMessage'));
      return;
    }
    
    if (paperBanks.length === 1) {
      // 只有一个试卷集，直接跳转
      navigate(`/paper-banks/${paperBanks[0]._id}/practices/create`);
    } else {
      // 多个试卷集，显示选择界面
      setShowPaperBankModal(true);
    }
  };

  // 处理试卷集选择
  const handlePaperBankSelect = (paperBankId: string) => {
    setShowPaperBankModal(false);
    // 根据用户选择的试卷类型跳转到对应页面
    if (selectedPaperType === 'practice') {
      navigate(`/paper-banks/${paperBankId}/practices/create`);
    } else if (selectedPaperType === 'lecture') {
      navigate(`/paper-banks/${paperBankId}/lectures/create`);
    } else if (selectedPaperType === 'test') {
      // 试卷类型暂时未实现，显示错误信息
      showErrorRightSlide(t('paperPage.createPage.errors.featureNotAvailable'), t('paperPage.createPage.errors.featureNotAvailableMessage'));
    } else {
      // 默认跳转到练习页面
      navigate(`/paper-banks/${paperBankId}/practices/create`);
    }
  };

  // 如果没有权限，显示提示页面
  if (!hasPermission && !loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="mb-8">
              <AlertCircle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {t('paperPage.createPage.noPermission.title')}
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                {t('paperPage.createPage.noPermission.description')}
              </p>
            </div>
            
            <Card className="p-6 max-w-md mx-auto">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {t('paperPage.createPage.noPermission.methodsTitle')}
              </h3>
              <ul className="text-left text-gray-600 dark:text-gray-300 space-y-2">
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  {t('paperPage.createPage.noPermission.methods.createBank')}
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  {t('paperPage.createPage.noPermission.methods.beInvited')}
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  {t('paperPage.createPage.noPermission.methods.purchase')}
                </li>
              </ul>
              
              <div className="mt-6 space-y-3">
                <Button
                  onClick={() => navigate('/paper-banks')}
                  className="w-full"
                >
                  {t('paperPage.createPage.noPermission.viewBanks')}
                </Button>
                <Button
                  onClick={() => navigate('/paper-banks/create')}
                  variant="outline"
                  className="w-full"
                >
                  {t('paperPage.createPage.noPermission.createBank')}
                </Button>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* 页面头部 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex items-center mb-6">
            <Button
              onClick={() => navigate(-1)}
              variant="ghost"
              size="sm"
              className="mr-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('paperPage.createPage.back')}
            </Button>
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                {t('paperPage.createPage.title')}
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-2 text-lg">
                {t('paperPage.createPage.description')}
              </p>
            </div>
          </div>
        </motion.div>

        {/* 试卷类型卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {paperTypeOptions.map((option, index) => (
            <motion.div
              key={option.value}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card 
                className={`p-8 h-full cursor-pointer transition-all duration-300 ${
                  option.enabled
                    ? 'hover:shadow-xl hover:shadow-blue-500/10 border-2 hover:border-blue-300 dark:hover:border-blue-600'
                    : 'opacity-60 cursor-not-allowed'
                }`}
                onClick={() => option.enabled && handlePaperTypeSelect(option.value)}
              >
                <div className="text-center">
                  {/* 图标 */}
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-6 ${
                    option.enabled 
                      ? `bg-${option.color}-100 dark:bg-${option.color}-900/30 text-${option.color}-600 dark:text-${option.color}-400`
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
                  }`}>
                    {option.enabled ? (
                      <option.icon className="w-8 h-8" />
                    ) : (
                      <Lock className="w-8 h-8" />
                    )}
                  </div>

                  {/* 标题 */}
                  <h3 className={`text-2xl font-bold mb-3 ${
                    option.enabled 
                      ? 'text-gray-900 dark:text-white' 
                      : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {option.label}
                  </h3>

                  {/* 描述 */}
                  <p className={`text-gray-600 dark:text-gray-300 mb-6 ${
                    !option.enabled && 'text-gray-400 dark:text-gray-500'
                  }`}>
                    {option.description}
                  </p>

                  {/* 状态标签 */}
                  <div className="flex justify-center">
                    {option.enabled ? (
                      <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        {t('paperPage.createPage.paperTypes.practice.status')}
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                        <Lock className="w-4 h-4 mr-2" />
                        {t('paperPage.createPage.paperTypes.lecture.status')}
                      </span>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* 底部提示 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-12 text-center"
        >
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            {t('paperPage.createPage.bottomTip')}
          </p>
        </motion.div>
      </div>

      {/* 试卷集选择模态框 */}
      {showPaperBankModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full mx-4"
          >
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                {t('paperPage.createPage.selectBank.title')}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                {t('paperPage.createPage.selectBank.description')}
              </p>
              
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {paperBanks.map((bank) => (
                  <div key={bank._id}>
                    <Card 
                      className="p-4 cursor-pointer hover:shadow-md transition-all duration-200 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600"
                      onClick={() => handlePaperBankSelect(bank._id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {bank.name}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                            {bank.description}
                          </p>
                          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                            <span>{t('paperPage.createPage.selectBank.members')}: {bank.memberCount}</span>
                            <span>{t('paperPage.createPage.selectBank.status')}: {bank.status === 'published' ? t('paperPage.createPage.selectBank.published') : t('paperPage.createPage.selectBank.draft')}</span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                            <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          </div>
                        </div>
                      </div>
                    </Card>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setShowPaperBankModal(false)}
                >
                  {t('paperPage.createPage.selectBank.cancel')}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* 模态框 */}
      <RightSlideModal
        isOpen={rightSlideModal.isOpen}
        onClose={() => {}}
        title={rightSlideModal.title}
        message={rightSlideModal.message}
        type={rightSlideModal.type}
        width={rightSlideModal.width}
        autoClose={rightSlideModal.autoClose}
        showProgress={rightSlideModal.showProgress}
      />
    </div>
  );
};

export default CreatePaperPage;
