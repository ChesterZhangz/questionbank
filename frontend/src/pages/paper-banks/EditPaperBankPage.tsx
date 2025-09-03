import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Save, 
  TrendingUp,
  Clock,
  Edit
} from 'lucide-react';

import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import { FuzzySelect } from '../../components/ui/menu';
import { paperBankAPI } from '../../services/api';
import { getCategoryOptions, getSubcategoryOptions, paperBankCategories } from '../../config/paperBankCategories';
import { useModal } from '../../hooks/useModal';
import ConfirmModal from '../../components/ui/ConfirmModal';
import RightSlideModal from '../../components/ui/RightSlideModal';

interface EditPaperBankFormData {
  name: string;
  description: string;
  category: string;
  subcategory?: string;
  customTags: string[];
  price: number;
}

const EditPaperBankPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { showConfirm, confirmModal, closeConfirm, showErrorRightSlide, showSuccessRightSlide, rightSlideModal, closeRightSlide } = useModal();

  const [formData, setFormData] = useState<EditPaperBankFormData>({
    name: '',
    description: '',
    category: '',
    subcategory: '',
    customTags: [],
    price: 0
  });

  const [originalData, setOriginalData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    if (id) {
      fetchPaperBank();
    }
  }, [id]);

  const fetchPaperBank = async () => {
    try {
      setLoading(true);
      const response = await paperBankAPI.getPaperBank(id!);
      if (response.data.success) {
        const paperBank = response.data.data;
        setOriginalData(paperBank);
        setFormData({
          name: paperBank.name,
          description: paperBank.description,
          category: paperBank.category,
          subcategory: paperBank.subcategory || '',
          customTags: paperBank.customTags || [],
          price: paperBank.price || 0
        });
      } else {
        showErrorRightSlide('获取失败', '获取试卷集信息失败');
        navigate('/paper-banks');
      }
    } catch (error: any) {
      showErrorRightSlide('获取失败', error.response?.data?.error || '获取试卷集信息失败');
      navigate('/paper-banks');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = '名称不能为空';
    }

    if (!formData.description.trim()) {
      newErrors.description = '描述不能为空';
    }

    if (!formData.category) {
      newErrors.category = '请选择分类';
    }

    if (formData.price < 0) {
      newErrors.price = '价格不能为负数';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setSaving(true);
    try {
      const response = await paperBankAPI.updatePaperBank(id!, formData);
      if (response.data.success) {
        showSuccessRightSlide('保存成功', '试卷集信息已更新');
        setOriginalData({ ...originalData, ...formData });
      } else {
        showErrorRightSlide('保存失败', '更新试卷集失败');
      }
    } catch (error: any) {
      showErrorRightSlide('保存失败', error.response?.data?.error || '更新试卷集失败');
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    showConfirm(
      '确认发布',
      '确定要发布这个试卷集吗？发布后其他用户将可以看到并购买。',
      async () => {
        setPublishing(true);
        try {
          const response = await paperBankAPI.publishPaperBank(id!);
          if (response.data.success) {
            closeConfirm(); // 先关闭确认窗口
            showSuccessRightSlide('发布成功', '试卷集已成功发布');
            setOriginalData({ ...originalData, status: 'published', publishedAt: new Date().toISOString() });
          } else {
            showErrorRightSlide('发布失败', '发布试卷集失败');
          }
        } catch (error: any) {
          showErrorRightSlide('发布失败', error.response?.data?.error || '发布试卷集失败');
        } finally {
          setPublishing(false);
        }
      }
    );
  };

  const handleUnpublish = async () => {
    try {
      const response = await paperBankAPI.unpublishPaperBank(id!);
      if (response.data.success) {
        showSuccessRightSlide('取消发布成功', '试卷集已取消发布');
        setOriginalData({ ...originalData, status: 'draft', publishedAt: undefined });
      } else {
        showErrorRightSlide('取消发布失败', '取消发布试卷集失败');
      }
    } catch (error: any) {
      showErrorRightSlide('取消发布失败', error.response?.data?.error || '取消发布试卷集失败');
    }
  };

  const getCategoryIcon = (category: string) => {
    const cat = paperBankCategories.find(c => c.value === category);
    return cat ? cat.icon : null;
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.customTags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        customTags: [...formData.customTags, tagInput.trim()]
      });
      setTagInput('');
    }
  };

  const handleRemoveTag = (index: number) => {
    setFormData({
      ...formData,
      customTags: formData.customTags.filter((_, i) => i !== index)
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* 标题区域 */}
      <div className="sticky top-0 z-30 bg-white dark:bg-gray-900 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => navigate('/paper-banks')}
                variant="ghost"
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 dark:from-gray-100 to-blue-600 dark:to-blue-400 bg-clip-text text-transparent">
                  编辑试卷集
                </h1>
                <p className="text-gray-600 dark:text-gray-300 mt-1">修改试卷集的基本信息和设置</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {/* 发布状态显示 */}
              <div className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800">
                <span className="text-sm text-gray-600 dark:text-gray-400">状态:</span>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  originalData?.status === 'published' 
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                    : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                }`}>
                  {originalData?.status === 'published' ? '已发布' : '草稿'}
                </span>
              </div>
              
              {/* 发布/取消发布按钮 */}
              {originalData?.status === 'published' ? (
                <Button
                  onClick={handleUnpublish}
                  variant="outline"
                  className="text-yellow-600 border-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20"
                >
                  <Clock className="w-4 h-4 mr-2" />
                  取消发布
                </Button>
              ) : (
                <Button
                  onClick={handlePublish}
                  disabled={publishing}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  {publishing ? '发布中...' : '发布'}
                </Button>
              )}
              
              <Button
                onClick={handleSubmit}
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? '保存中...' : '保存'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 主要内容 */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="space-y-8"
        >
          {/* 基本信息卡片 */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <Card className="p-8 border-0 shadow-lg bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
              <div className="space-y-6">
                {/* 基本信息 */}
                <div>
                  <div className="flex items-center mb-6">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mr-3">
                      <Edit className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">基本信息</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.2 }}
                    >
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        试卷集名称 *
                      </label>
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="请输入试卷集名称"
                        error={errors.name}
                        className="transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </motion.div>
                    
                    {originalData?.status === 'published' && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.3 }}
                      >
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          价格 (¥)
                        </label>
                        <Input
                          type="number"
                          value={formData.price}
                          onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                          placeholder="0"
                          min="0"
                          step="0.01"
                          error={errors.price}
                          className="transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </motion.div>
                    )}
                  </div>
                  
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.4 }}
                    className="mt-6"
                  >
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      描述 *
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="请输入试卷集描述"
                      rows={4}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100 transition-all duration-200 ${
                        errors.description ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.description && (
                      <motion.p
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-2 text-sm text-red-600"
                      >
                        {errors.description}
                      </motion.p>
                    )}
                  </motion.div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* 分类设置卡片 */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <Card className="p-8 border-0 shadow-lg bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
              <div className="space-y-6">
                <div className="flex items-center mb-6">
                  <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mr-3">
                    <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">分类设置</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.3 }}
                  >
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      主分类 *
                    </label>
                    <FuzzySelect
                      options={getCategoryOptions()}
                      value={formData.category}
                      onChange={(value) => {
                        setFormData({ ...formData, category: String(value), subcategory: '' });
                      }}
                      placeholder="选择主分类"
                    />
                  </motion.div>
                  
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.4 }}
                  >
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      子分类
                    </label>
                    <FuzzySelect
                      options={getSubcategoryOptions(formData.category)}
                      value={formData.subcategory || ''}
                      onChange={(value) => setFormData({ ...formData, subcategory: String(value) })}
                      placeholder="选择子分类"
                      disabled={!formData.category}
                    />
                  </motion.div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* 标签设置卡片 */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <Card className="p-8 border-0 shadow-lg bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
              <div className="space-y-6">
                <div className="flex items-center mb-6">
                  <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mr-3">
                    <Clock className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">标签设置</h3>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Input
                      placeholder="输入标签名称"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && tagInput.trim()) {
                          handleAddTag();
                        }
                      }}
                      className="flex-1"
                    />
                    <Button
                      onClick={handleAddTag}
                      disabled={!tagInput.trim()}
                      size="sm"
                      className="px-4"
                    >
                      添加
                    </Button>
                  </div>
                  
                  {formData.customTags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.customTags.map((tag, index) => (
                        <motion.span
                          key={index}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-700"
                        >
                          {tag}
                          <button
                            onClick={() => handleRemoveTag(index)}
                            className="ml-2 text-purple-500 hover:text-purple-700 dark:hover:text-purple-200"
                          >
                            ×
                          </button>
                        </motion.span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </motion.div>

          {/* 预览信息卡片 */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            <Card className="p-8 border-0 shadow-lg bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
              <div className="space-y-6">
                <div className="flex items-center mb-6">
                  <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center mr-3">
                    <Edit className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">预览信息</h3>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">分类:</span>
                      <div className="flex items-center mt-2">
                        {getCategoryIcon(formData.category) && React.createElement(getCategoryIcon(formData.category)!, { className: "w-4 h-4 mr-2 text-blue-600" })}
                        <span className="text-gray-900 dark:text-gray-100 font-medium">
                          {paperBankCategories.find(c => c.value === formData.category)?.label || '未选择'}
                        </span>
                      </div>
                    </div>
                    
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">子分类:</span>
                      <div className="mt-2 text-gray-900 dark:text-gray-100 font-medium">
                        {formData.subcategory ? 
                          paperBankCategories
                            .find(c => c.value === formData.category)
                            ?.subcategories?.find(s => s.value === formData.subcategory)?.label || formData.subcategory
                          : '未选择'
                        }
                      </div>
                    </div>
                    
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">价格:</span>
                      <div className="mt-2 text-gray-900 dark:text-gray-100 font-medium">
                        {originalData?.status === 'published' ? `¥${formData.price}` : '草稿状态不显示'}
                      </div>
                    </div>
                    
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">标签数量:</span>
                      <div className="mt-2 text-gray-900 dark:text-gray-100 font-medium">
                        {formData.customTags.length} 个
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </motion.div>
      </div>

      {/* 弹窗组件 */}
      <ConfirmModal {...confirmModal} onCancel={closeConfirm} />
      
      {/* 右侧弹窗 */}
      <RightSlideModal
        {...rightSlideModal}
        onClose={closeRightSlide}
      />
    </div>
  );
};

export default EditPaperBankPage;
