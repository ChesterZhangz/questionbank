import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Save,
  Upload,
  Users,
  Lock,
  Unlock,
  Bell,
  Database,
  Settings,
  Tag,
  Image,
  AlertCircle,
} from 'lucide-react';
import { questionBankAPI } from '../../services/api';
import { useAuthStore } from '../../stores/authStore';
import type { QuestionBank } from '../../types';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import LoadingPage from '../../components/ui/LoadingPage';
import ConfirmModal from '../../components/ui/ConfirmModal';
import RightSlideModal from '../../components/ui/RightSlideModal';
import { useModal } from '../../hooks/useModal';

interface QuestionBankSettings {
  // 基本信息
  name: string;
  description: string;
  category: string;
  tags: string[];
  cover?: string;
  
  // 权限设置
  isPublic: boolean;
  allowCollaboration: boolean;
  autoInvite: boolean;
  
  // 高级设置
  maxQuestions?: number;
  exportTemplate: string;
  autoBackup: boolean;
  backupFrequency: 'daily' | 'weekly' | 'monthly';
  notifications: {
    memberChange: boolean;
    questionUpdate: boolean;
    systemAlert: boolean;
  };
}

const QuestionBankSettingsPage: React.FC = () => {
  const { bid } = useParams<{ bid: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  // 弹窗状态管理
  const { 
    confirmModal, 
    closeConfirm,
    showSuccessRightSlide,
    showErrorRightSlide,
    rightSlideModal,
    closeRightSlide
  } = useModal();
  const [questionBank, setQuestionBank] = useState<QuestionBank | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'basic' | 'permissions' | 'advanced'>('basic');

  // 表单状态
  const [formData, setFormData] = useState<QuestionBankSettings>({
    name: '',
    description: '',
    category: '',
    tags: [],
    cover: '',
    isPublic: false,
    allowCollaboration: true,
    autoInvite: true,
    maxQuestions: undefined,
    exportTemplate: 'default',
    autoBackup: false,
    backupFrequency: 'weekly',
    notifications: {
      memberChange: true,
      questionUpdate: true,
      systemAlert: false
    }
  });

  // 标签输入
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    if (bid) {
      fetchQuestionBank();
    }
  }, [bid]);

  const fetchQuestionBank = async () => {
    try {
      const response = await questionBankAPI.getQuestionBank(bid!);
      if (response.data.success) {
        const bank = response.data.questionBank!;
        setQuestionBank(bank);
        determineUserRole(bank);
        
        // 填充表单数据
        setFormData({
          name: bank.name,
          description: bank.description || '',
          category: bank.category || '',
          tags: bank.tags || [],
          cover: bank.cover || '',
          isPublic: bank.isPublic,
          allowCollaboration: bank.allowCollaboration,
          autoInvite: true, // 默认值
          maxQuestions: undefined,
          exportTemplate: 'default',
          autoBackup: false,
          backupFrequency: 'weekly',
          notifications: {
            memberChange: true,
            questionUpdate: true,
            systemAlert: false
          }
        });
      } else {
        setError(response.data.error || '获取题库信息失败');
      }
    } catch (error: any) {
      setError(error.response?.data?.error || '获取题库信息失败');
    } finally {
      setLoading(false);
    }
  };

  const determineUserRole = (bank: QuestionBank) => {
    const userId = user?._id?.toString();
    const creatorId = bank.creator._id?.toString();
    
    if (creatorId === userId) {
      setUserRole('creator');
    } else if (bank.managers.some(m => m._id?.toString() === userId)) {
      setUserRole('manager');
    } else if (bank.collaborators.some(c => c._id?.toString() === userId)) {
      setUserRole('collaborator');
    } else {
      setUserRole('viewer');
    }
  };

  const handleSave = async () => {
    if (!(userRole === 'creator' || userRole === 'manager')) {
      showErrorRightSlide('权限不足', '只有创建者和管理者可以修改题库设置');
      return;
    }

    try {
      setSaving(true);
      
      // 保存基本信息
      const basicResponse = await questionBankAPI.updateQuestionBank(bid!, {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        tags: formData.tags,
        isPublic: formData.isPublic,
        allowCollaboration: formData.allowCollaboration
      });

      if (!basicResponse.data.success) {
        throw new Error(basicResponse.data.error || '保存基本信息失败');
      }

      // 保存高级设置
      const advancedResponse = await questionBankAPI.updateSettings(bid!, {
        maxQuestions: formData.maxQuestions,
        exportTemplate: formData.exportTemplate,
        autoBackup: formData.autoBackup,
        backupFrequency: formData.backupFrequency,
        notifications: formData.notifications
      });

      if (!advancedResponse.data.success) {
        throw new Error(advancedResponse.data.error || '保存高级设置失败');
      }

      showSuccessRightSlide('保存成功', '设置保存成功');
      navigate(`/question-banks/${bid}`);
    } catch (error: any) {
      showErrorRightSlide('保存失败', error.message || error.response?.data?.error || '保存失败');
    } finally {
      setSaving(false);
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const canEdit = userRole === 'creator' || userRole === 'manager';

  if (loading) {
    return (
      <LoadingPage
        type="loading"
        title="加载题库设置中..."
        description="正在获取题库配置信息，请稍候"
        animation="spinner"
      />
    );
  }

  if (error || !questionBank) {
    return (
      <LoadingPage
        type="error"
        title="加载失败"
        description={error || '无法加载题库信息'}
        backText="返回题库列表"
        onBack={() => navigate('/question-banks')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 页面头部 */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/question-banks/${bid}`)}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                返回
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">题库设置</h1>
                <p className="text-sm text-gray-500">{questionBank.name}</p>
              </div>
            </div>
            
            {canEdit && (
              <Button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {saving ? '保存中...' : '保存设置'}
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 权限提示 */}
        {!canEdit && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6"
          >
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              <p className="text-yellow-800">
                您当前的角色是 <span className="font-medium">{userRole === 'collaborator' ? '协作者' : '查看者'}</span>，
                只有创建者和管理者可以修改题库设置。
              </p>
            </div>
          </motion.div>
        )}

        {/* 标签页导航 */}
        <div className="flex space-x-1 bg-white rounded-lg p-1 mb-6 shadow-sm">
          <button
            onClick={() => setActiveTab('basic')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'basic'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Settings className="w-4 h-4 inline mr-2" />
            基本信息
          </button>
          <button
            onClick={() => setActiveTab('permissions')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'permissions'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Lock className="w-4 h-4 inline mr-2" />
            权限设置
          </button>
          <button
            onClick={() => setActiveTab('advanced')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'advanced'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Database className="w-4 h-4 inline mr-2" />
            高级设置
          </button>
        </div>

        {/* 基本信息设置 */}
        {activeTab === 'basic' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Settings className="w-5 h-5 text-blue-600" />
                    基本信息
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        题库名称 *
                      </label>
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="输入题库名称"
                        disabled={!canEdit}
                        maxLength={50}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {formData.name.length}/50 字符
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        题库描述
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="输入题库描述"
                        disabled={!canEdit}
                        maxLength={500}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {formData.description.length}/500 字符
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        分类
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                        disabled={!canEdit}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
                      >
                        <option value="">选择分类</option>
                        <option value="数学">数学</option>
                        <option value="物理">物理</option>
                        <option value="化学">化学</option>
                        <option value="生物">生物</option>
                        <option value="计算机">计算机</option>
                        <option value="其他">其他</option>
                      </select>
                    </div>
                  </div>
                </div>
              </Card>

              <Card>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Tag className="w-5 h-5 text-green-600" />
                    标签管理
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        添加标签
                      </label>
                      <div className="flex gap-2 mb-2">
                        <Input
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          placeholder="输入标签"
                          disabled={!canEdit}
                          onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                        />
                        <Button
                          onClick={handleAddTag}
                          disabled={!canEdit || !tagInput.trim()}
                          size="sm"
                        >
                          添加
                        </Button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        当前标签 ({formData.tags.length})
                      </label>
                      <div className="flex flex-wrap gap-2 min-h-[60px] p-3 bg-gray-50 rounded-lg">
                        {formData.tags.length > 0 ? (
                          formData.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                            >
                              <Tag className="w-3 h-3" />
                              {tag}
                              {canEdit && (
                                <button
                                  onClick={() => handleRemoveTag(tag)}
                                  className="ml-1 hover:text-blue-600 transition-colors"
                                >
                                  ×
                                </button>
                              )}
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-400 text-sm">暂无标签</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Image className="w-5 h-5 text-purple-600" />
                  封面设置
                </h3>
                <div className="flex items-center gap-6">
                  <div className="flex-shrink-0">
                    {formData.cover ? (
                      <img
                        src={formData.cover}
                        alt="题库封面"
                        className="w-24 h-24 object-cover rounded-lg border shadow-sm"
                      />
                    ) : (
                      <div className="w-24 h-24 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                        <Image className="w-10 h-10 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 mb-2">题库封面</h4>
                    <p className="text-sm text-gray-500 mb-4">
                      上传一张封面图片，让您的题库更加美观和专业
                    </p>
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={!canEdit}
                        className="flex items-center gap-2"
                      >
                        <Upload className="w-4 h-4" />
                        上传图片
                      </Button>
                      {formData.cover && canEdit && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-2 text-red-600 hover:text-red-700"
                        >
                          移除
                        </Button>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      支持 JPG、PNG 格式，建议尺寸 400x400，最大 2MB
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* 权限设置 */}
        {activeTab === 'permissions' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Lock className="w-5 h-5 text-red-600" />
                    访问权限
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        {formData.isPublic ? (
                          <Unlock className="w-5 h-5 text-green-600" />
                        ) : (
                          <Lock className="w-5 h-5 text-gray-600" />
                        )}
                        <div>
                          <h4 className="font-medium text-gray-900">公开题库</h4>
                          <p className="text-sm text-gray-500">
                            {formData.isPublic ? '所有用户都可以查看此题库' : '只有成员可以查看此题库'}
                          </p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.isPublic}
                          onChange={(e) => setFormData(prev => ({ ...prev, isPublic: e.target.checked }))}
                          disabled={!canEdit}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Users className="w-5 h-5 text-blue-600" />
                        <div>
                          <h4 className="font-medium text-gray-900">允许协作</h4>
                          <p className="text-sm text-gray-500">
                            {formData.allowCollaboration ? '成员可以添加和编辑题目' : '只有创建者和管理者可以编辑题目'}
                          </p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.allowCollaboration}
                          onChange={(e) => setFormData(prev => ({ ...prev, allowCollaboration: e.target.checked }))}
                          disabled={!canEdit}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </Card>

              <Card>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5 text-green-600" />
                    成员管理
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Users className="w-5 h-5 text-green-600" />
                        <div>
                          <h4 className="font-medium text-gray-900">自动邀请</h4>
                          <p className="text-sm text-gray-500">
                            {formData.autoInvite ? '自动邀请同企业邮箱用户成为协作者' : '手动邀请用户加入题库'}
                          </p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.autoInvite}
                          onChange={(e) => setFormData(prev => ({ ...prev, autoInvite: e.target.checked }))}
                          disabled={!canEdit}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertCircle className="w-4 h-4 text-blue-600" />
                        <h4 className="font-medium text-blue-900">权限说明</h4>
                      </div>
                      <ul className="text-sm text-blue-800 space-y-1">
                        <li>• 创建者：拥有所有权限，可以删除题库</li>
                        <li>• 管理者：可以管理成员和设置</li>
                        <li>• 协作者：可以添加和编辑题目</li>
                        <li>• 查看者：只能查看题目内容</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </motion.div>
        )}

        {/* 高级设置 */}
        {activeTab === 'advanced' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Database className="w-5 h-5 text-purple-600" />
                    数据管理
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        题目数量限制
                      </label>
                      <Input
                        type="number"
                        value={formData.maxQuestions || ''}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          maxQuestions: e.target.value ? parseInt(e.target.value) : undefined 
                        }))}
                        placeholder="不限制"
                        disabled={!canEdit}
                        min={1}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        留空表示不限制题目数量
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        导出模板
                      </label>
                      <select
                        value={formData.exportTemplate}
                        onChange={(e) => setFormData(prev => ({ ...prev, exportTemplate: e.target.value }))}
                        disabled={!canEdit}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
                      >
                        <option value="default">默认模板</option>
                        <option value="simple">简洁模板</option>
                        <option value="detailed">详细模板</option>
                        <option value="custom">自定义模板</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Database className="w-5 h-5 text-purple-600" />
                        <div>
                          <h4 className="font-medium text-gray-900">自动备份</h4>
                          <p className="text-sm text-gray-500">
                            {formData.autoBackup ? '定期自动备份题库数据' : '手动备份题库数据'}
                          </p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.autoBackup}
                          onChange={(e) => setFormData(prev => ({ ...prev, autoBackup: e.target.checked }))}
                          disabled={!canEdit}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    {formData.autoBackup && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          备份频率
                        </label>
                        <select
                          value={formData.backupFrequency}
                          onChange={(e) => setFormData(prev => ({ 
                            ...prev, 
                            backupFrequency: e.target.value as 'daily' | 'weekly' | 'monthly' 
                          }))}
                          disabled={!canEdit}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
                        >
                          <option value="daily">每日</option>
                          <option value="weekly">每周</option>
                          <option value="monthly">每月</option>
                        </select>
                      </div>
                    )}
                  </div>
                </div>
              </Card>

              <Card>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Bell className="w-5 h-5 text-orange-600" />
                    通知设置
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Users className="w-4 h-4 text-blue-600" />
                        <div>
                          <h4 className="font-medium text-gray-900">成员变更通知</h4>
                          <p className="text-xs text-gray-500">当有成员加入或离开时通知</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.notifications.memberChange}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            notifications: {
                              ...prev.notifications,
                              memberChange: e.target.checked
                            }
                          }))}
                          disabled={!canEdit}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Bell className="w-4 h-4 text-green-600" />
                        <div>
                          <h4 className="font-medium text-gray-900">题目更新通知</h4>
                          <p className="text-xs text-gray-500">当题目被添加或修改时通知</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.notifications.questionUpdate}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            notifications: {
                              ...prev.notifications,
                              questionUpdate: e.target.checked
                            }
                          }))}
                          disabled={!canEdit}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <AlertCircle className="w-4 h-4 text-yellow-600" />
                        <div>
                          <h4 className="font-medium text-gray-900">系统警告通知</h4>
                          <p className="text-xs text-gray-500">系统维护或重要更新通知</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.notifications.systemAlert}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            notifications: {
                              ...prev.notifications,
                              systemAlert: e.target.checked
                            }
                          }))}
                          disabled={!canEdit}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertCircle className="w-4 h-4 text-blue-600" />
                        <h4 className="font-medium text-blue-900">通知说明</h4>
                      </div>
                      <p className="text-xs text-blue-800">
                        通知将通过邮件和系统内消息发送。您可以在个人设置中管理通知偏好。
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </motion.div>
        )}
      </div>

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

export default QuestionBankSettingsPage; 