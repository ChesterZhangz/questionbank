import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Tag, Save, Calculator, Atom, Plus, X, Target, Settings } from 'lucide-react';
import { paperBankAPI } from '../../services/api';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import { FuzzySelect } from '../../components/ui/menu';
import { getCategoryOptions, getSubcategoryOptions } from '../../config/paperBankCategories';

interface CreatePaperBankRequest {
  name: string;
  description: string;
  category: string;
  subcategory?: string;
  customTags: string[];
  allowCollaboration: boolean;
}

const CreatePaperBankPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<CreatePaperBankRequest>({
    name: '',
    description: '',
    category: '',
    subcategory: '',
    customTags: [],
    allowCollaboration: true,
  });
  const [customTagInput, setCustomTagInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value
    }));
    
    // 清除对应字段的错误
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleCategoryChange = (value: string | number) => {
    const categoryValue = value.toString();
    setFormData(prev => ({
      ...prev,
      category: categoryValue,
      subcategory: '' // 重置子分类
    }));
    if (errors.category) {
      setErrors(prev => ({ ...prev, category: '' }));
    }
  };

  const handleSubcategoryChange = (value: string | number) => {
    const subcategoryValue = value.toString();
    setFormData(prev => ({
      ...prev,
      subcategory: subcategoryValue
    }));
    if (errors.subcategory) {
      setErrors(prev => ({ ...prev, subcategory: '' }));
    }
  };

  const handleAddCustomTag = () => {
    if (customTagInput.trim() && !formData.customTags.includes(customTagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        customTags: [...prev.customTags, customTagInput.trim()]
      }));
      setCustomTagInput('');
    }
  };

  const handleRemoveCustomTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      customTags: prev.customTags.filter(tag => tag !== tagToRemove)
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = '请输入试卷集名称';
    }
    
    if (formData.name.length > 50) {
      newErrors.name = '试卷集名称不能超过50个字符';
    }
    
    if (!formData.category) {
      newErrors.category = '请选择分类';
    }
    
    if (formData.description && formData.description.length > 500) {
      newErrors.description = '试卷集描述不能超过500个字符';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      const response = await paperBankAPI.createPaperBank(formData);
      
      if (response.data.success) {
        navigate('/paper-banks');
      } else {
        setErrors({ general: '创建试卷集失败' });
      }
    } catch (error: any) {
      setErrors({ general: error.response?.data?.error || '创建试卷集失败' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'mathematics':
        return <Calculator className="w-5 h-5" />;
      case 'physics':
        return <Atom className="w-5 h-5" />;
      default:
        return <Calculator className="w-5 h-5" />;
    }
  };



  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* 标题区域 */}
      <div className="sticky top-0 z-30 bg-white dark:bg-gray-900 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/paper-banks')}
                className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </motion.button>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 dark:from-gray-100 to-blue-600 dark:to-blue-400 bg-clip-text text-transparent">
                  创建试卷集
                </h1>
                <p className="text-gray-600 dark:text-gray-300 mt-1">创建新的试卷集，支持分类管理和标签系统</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 主要内容 */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* 基本信息 */}
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-blue-600" />
                  基本信息
                </h2>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    试卷集名称 *
                  </label>
                  <Input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="请输入试卷集名称"
                    error={errors.name}
                    maxLength={50}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    试卷集描述
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="请描述试卷集的内容、特点和使用说明..."
                    rows={4}
                    maxLength={500}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
                  />
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {formData.description.length}/500
                    </span>
                    {errors.description && (
                      <span className="text-xs text-red-500">{errors.description}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* 分类设置 */}
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <Target className="w-5 h-5 text-green-600" />
                  分类设置
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      主分类 *
                    </label>
                    <FuzzySelect
                      options={getCategoryOptions()}
                      value={formData.category}
                      onChange={handleCategoryChange}
                      placeholder="选择主分类"
                      label=""
                    />
                    {errors.category && (
                      <p className="text-xs text-red-500 mt-1">{errors.category}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      子分类
                    </label>
                                         <FuzzySelect
                       options={formData.category ? getSubcategoryOptions(formData.category) : []}
                       value={formData.subcategory || ''}
                       onChange={handleSubcategoryChange}
                       placeholder={formData.category ? "选择子分类" : "请先选择主分类"}
                       label=""
                       disabled={!formData.category}
                     />
                    {errors.subcategory && (
                      <p className="text-xs text-red-500 mt-1">{errors.subcategory}</p>
                    )}
                  </div>
                </div>

                {/* 分类预览 */}
                {formData.category && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-700"
                  >
                    <div className="flex items-center gap-3">
                      {getCategoryIcon(formData.category)}
                      <div>
                        <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                          已选择分类：
                        </span>
                        <span className="text-sm text-blue-800 dark:text-blue-200 ml-1">
                          {getCategoryOptions().find(cat => cat.value === formData.category)?.label}
                        </span>
                        {formData.subcategory && (
                          <>
                            <span className="text-sm text-blue-700 dark:text-blue-300 mx-2">→</span>
                            <span className="text-sm text-blue-800 dark:text-blue-200">
                              {getSubcategoryOptions(formData.category).find(sub => sub.value === formData.subcategory)?.label}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* 标签管理 */}
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <Tag className="w-5 h-5 text-purple-600" />
                  标签管理
                </h2>
                
                <div>
                  <div className="flex gap-2">
                    <Input
                      value={customTagInput}
                      onChange={(e) => setCustomTagInput(e.target.value)}
                      placeholder="输入自定义标签"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCustomTag())}
                    />
                    <Button
                      type="button"
                      onClick={handleAddCustomTag}
                      variant="outline"
                      size="sm"
                      className="px-4"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  {formData.customTags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {formData.customTags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => handleRemoveCustomTag(tag)}
                            className="hover:bg-purple-200 dark:hover:bg-purple-800/50 rounded-full p-0.5"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* 高级设置 */}
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-orange-600" />
                  高级设置
                </h2>
                
                <div className="space-y-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="allowCollaboration"
                      checked={formData.allowCollaboration}
                      onChange={handleChange}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      允许协作编辑（其他用户可以参与编辑）
                    </span>
                  </label>
                </div>
              </div>

              {/* 错误提示 */}
              {errors.general && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <p className="text-sm text-red-600 dark:text-red-400">{errors.general}</p>
                </div>
              )}

              {/* 提交按钮 */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/paper-banks')}
                  disabled={isSubmitting}
                >
                  取消
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="min-w-[120px]"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      创建中...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Save className="w-4 h-4" />
                      创建试卷集
                    </div>
                  )}
                </Button>
              </div>
            </form>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default CreatePaperBankPage;
