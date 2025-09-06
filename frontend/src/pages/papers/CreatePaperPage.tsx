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
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { showErrorRightSlide, rightSlideModal } = useModal();

  // 试卷集相关状态
  const [paperBanks, setPaperBanks] = useState<PaperBank[]>([]);
  const [loading, setLoading] = useState(false);
  const [showPaperBankModal, setShowPaperBankModal] = useState(false);

  // 试卷类型选项
  const paperTypeOptions = [
    { 
      value: 'lecture', 
      label: '讲义', 
      icon: BookOpen,
      description: '教学讲义，用于知识传授',
      enabled: true,
      color: 'blue'
    },
    { 
      value: 'practice', 
      label: '练习', 
      icon: PenTool,
      description: '练习题，用于巩固知识',
      enabled: false,
      color: 'orange'
    },
    { 
      value: 'test', 
      label: '试卷', 
      icon: FileText,
      description: '考试试卷，用于评估学习效果',
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
      const response = await paperBankAPI.getPaperBanks();
      if (response.data.success) {
        console.log('获取到的试卷集数据:', response.data.data.paperBanks);
        // 只显示用户有编辑/管理/拥有者权限的试卷集
        const accessibleBanks = response.data.data.paperBanks.filter((bank: PaperBank) => {
          console.log(`试卷集 ${bank.name} 的用户角色:`, bank.userRole);
          return ['owner', 'manager', 'collaborator'].includes(bank.userRole);
        });
        console.log('过滤后的可访问试卷集:', accessibleBanks);
        setPaperBanks(accessibleBanks);
      }
    } catch (error) {
      console.error('加载试卷集失败:', error);
      showErrorRightSlide('加载失败', '无法加载试卷集列表');
    } finally {
      setLoading(false);
    }
  };

  // 检查是否有权限创建试卷
  const hasPermission = paperBanks.length > 0;

  // 处理试卷类型选择
  const handlePaperTypeSelect = (type: string) => {
    if (type === 'lecture') {
      // 如果URL中有paperBankId参数，直接跳转到讲义编辑页面
      const urlPaperBankId = searchParams.get('paperBankId');
      if (urlPaperBankId && paperBanks.find(bank => bank._id === urlPaperBankId)) {
        navigate(`/paper-banks/${urlPaperBankId}/lectures/create`);
      } else {
        // 显示试卷集选择模态框
        showPaperBankSelection();
      }
    } else {
      showErrorRightSlide('功能暂未开放', '该功能正在开发中，敬请期待！');
    }
  };

  // 显示试卷集选择
  const showPaperBankSelection = () => {
    if (paperBanks.length === 0) {
      showErrorRightSlide('无法创建试卷', '您需要先创建试卷集或有编辑权限的试卷集才能创建试卷');
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

  // 处理试卷集选择
  const handlePaperBankSelect = (paperBankId: string) => {
    setShowPaperBankModal(false);
    navigate(`/paper-banks/${paperBankId}/lectures/create`);
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
                无法创建试卷
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                您需要拥有试卷集的编辑、管理或拥有者权限才能创建试卷
              </p>
            </div>
            
            <Card className="p-6 max-w-md mx-auto">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                获取权限的方法
              </h3>
              <ul className="text-left text-gray-600 dark:text-gray-300 space-y-2">
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  创建自己的试卷集
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  请试卷集拥有者添加您为成员
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  购买已发布的试卷集
                </li>
              </ul>
              
              <div className="mt-6 space-y-3">
                <Button
                  onClick={() => navigate('/paper-banks')}
                  className="w-full"
                >
                  查看试卷集
                </Button>
                <Button
                  onClick={() => navigate('/paper-banks/create')}
                  variant="outline"
                  className="w-full"
                >
                  创建试卷集
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
              返回
            </Button>
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                创建试卷
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-2 text-lg">
                选择试卷类型，开始创建您的试卷
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
                        可用
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                        <Lock className="w-4 h-4 mr-2" />
                        即将开放
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
            选择试卷类型后，将直接进入编辑页面开始创建
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
                选择试卷集
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                请选择要在其中创建讲义的试卷集
              </p>
              
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {paperBanks.map((bank) => (
                  <motion.div
                    key={bank._id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
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
                            <span>成员: {bank.memberCount}</span>
                            <span>状态: {bank.status === 'published' ? '已发布' : '草稿'}</span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                            <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setShowPaperBankModal(false)}
                >
                  取消
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
