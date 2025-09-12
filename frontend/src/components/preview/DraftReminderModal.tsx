import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, AlertTriangle, X, FileText, Clock, CheckCircle } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { useQuestionPreviewStore } from '../../stores/questionPreviewStore';
import { useModal } from '../../hooks/useModal';
import RightSlideModal from '../ui/RightSlideModal';
import { useTranslation } from '../../hooks/useTranslation';

interface DraftReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveSuccess?: () => void;
  questionCount: number;
  isEditMode?: boolean; // 是否是编辑模式触发的提醒
}

const DraftReminderModal: React.FC<DraftReminderModalProps> = ({ 
  isOpen, 
  onClose, 
  onSaveSuccess,
  questionCount,
  isEditMode = false
}) => {
  const { t } = useTranslation();
  const { saveDraft } = useQuestionPreviewStore();
  
  // 弹窗状态管理
  const { 
    rightSlideModal,
    showSuccessRightSlide,
    showErrorRightSlide,
    closeRightSlide
  } = useModal();
  const [draftName, setDraftName] = useState('');
  const [draftDescription, setDraftDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  React.useEffect(() => {
    if (isOpen && !draftName) {
      const now = new Date();
      const timeStr = now.toLocaleString('zh-CN', {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
      setDraftName(`${t('preview.draftReminderModal.draftName')}_${timeStr}`);
    }
  }, [isOpen]); // 移除draftName依赖，避免循环设置

  const handleSaveDraft = async () => {
    if (!draftName.trim()) {
      showErrorRightSlide(t('preview.draftReminderModal.inputError'), t('preview.draftReminderModal.inputErrorMessage'));
      return;
    }

    setIsSaving(true);
    try {
      saveDraft(draftName.trim(), draftDescription.trim() || undefined);
      showSuccessRightSlide(t('preview.draftReminderModal.saveSuccess'), t('preview.draftReminderModal.saveSuccessMessage'));
      onSaveSuccess?.();
      onClose();
    } catch (error) {
      showErrorRightSlide(t('preview.draftReminderModal.saveFailed'), t('preview.draftReminderModal.saveFailedMessage'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    if (isSaving) return;
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', duration: 0.3 }}
            className="w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <Card className="p-6 bg-white dark:bg-gray-800 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-full">
                    <AlertTriangle className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {isEditMode ? t('preview.draftReminderModal.needSave') : t('preview.draftReminderModal.saveReminder')}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {isEditMode 
                        ? t('preview.draftReminderModal.needSaveMessage') 
                        : t('preview.draftReminderModal.saveReminderMessage')
                      }
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClose}
                  disabled={isSaving}
                  className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <span className="text-sm font-medium text-blue-900 dark:text-blue-100">{t('preview.draftReminderModal.questionCount')}</span>
                  </div>
                  <span className="text-lg font-bold text-blue-900 dark:text-blue-100">{t('preview.draftReminderModal.questionCountValue', { count: questionCount })}</span>
                </div>
                <div className="mt-2 flex items-center space-x-2 text-xs text-blue-700 dark:text-blue-300">
                  <Clock className="h-3 w-3" />
                  <span>
                    {isEditMode 
                      ? t('preview.draftReminderModal.saveHint') 
                      : t('preview.draftReminderModal.saveHint2')
                    }
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                    {t('preview.draftReminderModal.draftName')} <span className="text-red-500 dark:text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={draftName}
                    onChange={(e) => setDraftName(e.target.value)}
                    placeholder={t('preview.draftReminderModal.draftNamePlaceholder')}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                    disabled={isSaving}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">{t('preview.draftReminderModal.description')}</label>
                  <textarea
                    value={draftDescription}
                    onChange={(e) => setDraftDescription(e.target.value)}
                    placeholder={t('preview.draftReminderModal.descriptionPlaceholder')}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                    disabled={isSaving}
                  />
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <Button
                  onClick={handleSaveDraft}
                  disabled={isSaving || !draftName.trim()}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      {t('preview.draftReminderModal.saving')}
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      {t('preview.draftReminderModal.saveNow')}
                    </>
                  )}
                </Button>
                
                <Button
                  onClick={handleClose}
                  variant="outline"
                  disabled={isSaving}
                  className="flex-1 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  {isEditMode ? t('preview.draftReminderModal.cancel') : t('preview.draftReminderModal.saveLater')}
                </Button>
              </div>

              <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                <div className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-gray-600 dark:text-gray-300">
                    <p className="font-medium mb-1">{t('preview.draftReminderModal.benefits')}</p>
                    <ul className="space-y-1">
                      <li>• {t('preview.draftReminderModal.benefit1')}</li>
                      <li>• {t('preview.draftReminderModal.benefit2')}</li>
                      <li>• {t('preview.draftReminderModal.benefit3')}</li>
                    </ul>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* 右侧滑入通知 */}
          <RightSlideModal
            isOpen={rightSlideModal.isOpen}
            title={rightSlideModal.title}
            message={rightSlideModal.message}
            type={rightSlideModal.type}
            width={rightSlideModal.width}
            autoClose={rightSlideModal.autoClose}
            showProgress={rightSlideModal.showProgress}
            onClose={closeRightSlide}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DraftReminderModal; 