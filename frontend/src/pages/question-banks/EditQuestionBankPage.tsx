import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Save, 
  Plus,
  Calculator
} from 'lucide-react';
import { questionBankAPI } from '../../services/api';
import type { QuestionBank, UpdateQuestionBankRequest } from '../../types';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import { SimpleSelect } from '../../components/ui/menu';
import LoadingPage from '../../components/ui/LoadingPage';
import { getMathCategories } from '../../constants/questionCategories';
import { useTranslation } from '../../hooks/useTranslation';

const EditQuestionBankPage: React.FC = () => {
  const { bid } = useParams<{ bid: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [questionBank, setQuestionBank] = useState<QuestionBank | null>(null);
  const [formData, setFormData] = useState<UpdateQuestionBankRequest>({
    name: '',
    description: '',
    category: '',
    tags: [],
    isPublic: false,
    allowCollaboration: true
  });
  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);



  useEffect(() => {
    if (bid) {
      fetchQuestionBank();
    }
  }, [bid]);

  const fetchQuestionBank = async () => {
    try {
      const response = await questionBankAPI.getQuestionBank(bid!);
      if (response.data.success && response.data.questionBank) {
        const bank = response.data.questionBank;
        setQuestionBank(bank);
        setFormData({
          name: bank.name,
          description: bank.description || '',
          category: bank.category || '',
          tags: bank.tags || [],
          isPublic: bank.isPublic,
          allowCollaboration: bank.allowCollaboration
        });
      } else {
        setError(response.data.error || t('questionBankPage.EditQuestionBankPage.errors.loadFailed'));
      }
    } catch (error: any) {
      setError(error.response?.data?.error || t('questionBankPage.EditQuestionBankPage.errors.loadFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
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
      tags: (prev.tags || []).filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name?.trim()) {
      setError(t('questionBankPage.EditQuestionBankPage.errors.nameRequired'));
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const response = await questionBankAPI.updateQuestionBank(bid!, formData);
      
      if (response.data.success) {
        navigate(`/question-banks/${bid}`);
      } else {
        setError(response.data.error || t('questionBankPage.EditQuestionBankPage.errors.updateFailed'));
      }
    } catch (error: any) {
      setError(error.response?.data?.error || t('questionBankPage.EditQuestionBankPage.errors.updateFailed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingPage />;
  }

  if (error || !questionBank) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">{t('questionBankPage.EditQuestionBankPage.errors.notFound')}</h1>
            <p className="text-gray-600 dark:text-gray-300 mb-6">{error || t('questionBankPage.EditQuestionBankPage.errors.loadFailed')}</p>
            <Button onClick={() => navigate('/question-banks')}>
              {t('common.backToQuestionBanks')}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* 头部 */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-6">
            <Button
              variant="outline"
              onClick={() => navigate(`/question-banks/${bid}`)}
              className="mr-4"
            >
              <ArrowLeft className="w-4 w-4 mr-2" />
              {t('questionBankPage.EditQuestionBankPage.buttons.back')}
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('questionBankPage.EditQuestionBankPage.title')}</h1>
              <p className="text-gray-600 dark:text-gray-300">{t('questionBankPage.EditQuestionBankPage.description')}</p>
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
              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4"
                >
                  <p className="text-red-600 dark:text-red-400">{error}</p>
                </motion.div>
              )}

              {/* 题库名称 */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                    {t('questionBankPage.EditQuestionBankPage.form.name')} *
                  </label>
                  <Input
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder={t('questionBankPage.EditQuestionBankPage.placeholders.name')}
                    icon={<Calculator className="w-5 w-5" />}
                    required
                  />
                </div>
              </motion.div>

              {/* 题库描述 */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                    {t('questionBankPage.EditQuestionBankPage.form.description')}
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                    className="input w-full dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                    placeholder={t('questionBankPage.EditQuestionBankPage.placeholders.description')}
                  />
                </div>
              </motion.div>

              {/* 分类 */}
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
                placeholder={t('questionBankPage.EditQuestionBankPage.placeholders.category')}
                label={t('questionBankPage.EditQuestionBankPage.form.category')}
                theme="blue"
                variant="outline"
                size="md"
                showIcon={true}
              />
              </motion.div>

              {/* 标签 */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                    {t('questionBankPage.EditQuestionBankPage.form.tags')}
                  </label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      name="tagInput"
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      placeholder={t('questionBankPage.EditQuestionBankPage.placeholders.tags')}
                      icon={<Plus className="w-5 w-5" />}
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
                      {t('questionBankPage.EditQuestionBankPage.buttons.add')}
                    </Button>
                  </div>
                  
                  {/* 标签列表 */}
                  {formData.tags && formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            className="ml-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>

              {/* 设置选项 */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="isPublic"
                      checked={formData.isPublic}
                      onChange={handleChange}
                      className="text-blue-600 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <label className="ml-2 text-sm text-gray-700 dark:text-gray-200">
                      {t('questionBankPage.EditQuestionBankPage.settings.isPublic')}
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="allowCollaboration"
                      checked={formData.allowCollaboration}
                      onChange={handleChange}
                      className="text-blue-600 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <label className="ml-2 text-sm text-gray-700 dark:text-gray-200">
                      {t('questionBankPage.EditQuestionBankPage.settings.allowCollaboration')}
                    </label>
                  </div>
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
                  onClick={() => navigate(`/question-banks/${bid}`)}
                  disabled={isSubmitting}
                >
                  {t('questionBankPage.EditQuestionBankPage.buttons.cancel')}
                </Button>
                <Button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700"
                  loading={isSubmitting}
                  disabled={isSubmitting}
                >
                  <Save className="w-4 w-4 mr-2" />
                  {t('questionBankPage.EditQuestionBankPage.buttons.save')}
                </Button>
              </motion.div>
            </form>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default EditQuestionBankPage; 