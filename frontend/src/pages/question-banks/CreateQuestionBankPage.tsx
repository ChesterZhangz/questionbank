import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Tag, Save, Calculator } from 'lucide-react';
import { questionBankAPI } from '../../services/api';
import type { CreateQuestionBankRequest } from '../../types';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import { SimpleSelect } from '../../components/ui/menu';
import { getMathCategories } from '../../constants/questionCategories';
import { useTranslation } from '../../hooks/useTranslation';

const CreateQuestionBankPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [formData, setFormData] = useState<CreateQuestionBankRequest>({
    name: '',
    description: '',
    category: '',
    tags: [],
    isPublic: false,
    allowCollaboration: true,
  });
  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // 清除对应字段的错误
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag !== tagToRemove) || []
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = t('questionBankPage.CreateQuestionBankPage.errors.nameRequired');
    }
    
    if (formData.name.length > 50) {
      newErrors.name = t('questionBankPage.CreateQuestionBankPage.errors.nameTooLong');
    }
    
    if (formData.description && formData.description.length > 500) {
      newErrors.description = t('questionBankPage.CreateQuestionBankPage.errors.descriptionTooLong');
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      const response = await questionBankAPI.createQuestionBank(formData);
      
      if (response.data.success) {
        navigate('/question-banks');
      } else {
        setErrors({ general: response.data.error || t('questionBankPage.CreateQuestionBankPage.errors.createFailed') });
      }
    } catch (error: any) {
      setErrors({ general: error.response?.data?.error || t('questionBankPage.CreateQuestionBankPage.errors.createFailed') });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* 头部 */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-6">
            <Button
              variant="outline"
              onClick={() => navigate('/question-banks')}
              className="mr-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('questionBankPage.CreateQuestionBankPage.buttons.back')}
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('questionBankPage.CreateQuestionBankPage.title')}</h1>
              <p className="text-gray-600 dark:text-gray-300">{t('questionBankPage.CreateQuestionBankPage.description')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 内容区域 */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card>
            <form onSubmit={handleSubmit} className="space-y-6">
              {errors.general && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4"
                >
                  <p className="text-red-600 dark:text-red-400">{errors.general}</p>
                </motion.div>
              )}

              {/* 题库名称 */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Input
                  label={t('questionBankPage.CreateQuestionBankPage.form.name')}
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  error={errors.name}
                  placeholder={t('questionBankPage.CreateQuestionBankPage.placeholders.name')}
                  required
                  icon={<Calculator className="w-5 h-5" />}
                />
              </motion.div>

              {/* 题库描述 */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    {t('questionBankPage.CreateQuestionBankPage.form.description')}
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    placeholder={t('questionBankPage.CreateQuestionBankPage.placeholders.description')}
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.description}</p>
                  )}
                </div>
              </motion.div>

              {/* 题库分类 */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <SimpleSelect
                  options={getMathCategories().map(category => ({
                    value: category.value,
                    label: category.label,
                    icon: category.icon
                  }))}
                  value={formData.category || ''}
                  onChange={(value) => setFormData(prev => ({ ...prev, category: value as string }))}
                  placeholder={t('questionBankPage.CreateQuestionBankPage.placeholders.category')}
                  label={t('questionBankPage.CreateQuestionBankPage.form.category')}
                  theme="blue"
                  variant="outline"
                  size="md"
                  showIcon={true}
                />
              </motion.div>

              {/* 题库标签 */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                    {t('questionBankPage.CreateQuestionBankPage.form.tags')}
                  </label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      name="tagInput"
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      placeholder={t('questionBankPage.CreateQuestionBankPage.placeholders.tags')}
                      icon={<Tag className="w-5 h-5" />}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddTag();
                        }
                      }}
                    />
                    <Button
                      type="button"
                      onClick={handleAddTag}
                      variant="outline"
                      disabled={!tagInput.trim()}
                    >
                      {t('questionBankPage.CreateQuestionBankPage.buttons.add')}
                    </Button>
                  </div>
                  
                  {/* 标签列表 */}
                  {formData.tags && formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-700"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            className="ml-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>

              {/* 题库设置 */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="space-y-4"
              >
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">{t('questionBankPage.CreateQuestionBankPage.settings.title')}</h3>
                
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="isPublic"
                      checked={formData.isPublic}
                      onChange={handleChange}
                      className="rounded border-gray-300 dark:border-gray-600 text-blue-600 dark:text-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-200">{t('questionBankPage.CreateQuestionBankPage.settings.isPublic')}</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="allowCollaboration"
                      checked={formData.allowCollaboration}
                      onChange={handleChange}
                      className="rounded border-gray-300 dark:border-gray-600 text-blue-600 dark:text-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-200">{t('questionBankPage.CreateQuestionBankPage.settings.allowCollaboration')}</span>
                  </label>
                </div>
              </motion.div>

              {/* 提交按钮 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700"
              >
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/question-banks')}
                  disabled={isSubmitting}
                >
                  {t('questionBankPage.CreateQuestionBankPage.buttons.cancel')}
                </Button>
                <Button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                  loading={isSubmitting}
                  disabled={isSubmitting}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {t('questionBankPage.CreateQuestionBankPage.buttons.create')}
                </Button>
              </motion.div>
            </form>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default CreateQuestionBankPage; 