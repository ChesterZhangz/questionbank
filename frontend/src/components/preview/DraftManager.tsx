import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Save, 
  FolderOpen, 
  Trash2, 
  Clock, 
  FileText,
  X,
  Edit3
} from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { useQuestionPreviewStore } from '../../stores/questionPreviewStore';
import type { QuestionDraft } from '../../services/questionDraftAPI';
import { useModal } from '../../hooks/useModal';
import RightSlideModal from '../ui/RightSlideModal';
import ConfirmModal from '../ui/ConfirmModal';
import { useTranslation } from '../../hooks/useTranslation';

interface DraftManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onEnterEdit?: (draft: QuestionDraft) => void;
  onUserSaveDraft?: () => void; // 用户主动保存草稿的回调
  onDraftSaved?: (draftId: string) => void; // 草稿保存成功后的回调，用于更新URL
}

const DraftManager: React.FC<DraftManagerProps> = ({ isOpen, onClose, onEnterEdit, onUserSaveDraft, onDraftSaved }) => {
  const { t } = useTranslation();
  
  // 弹窗状态管理
  const { 
    showConfirm,
    confirmModal,
    closeConfirm,
    setConfirmLoading,
    rightSlideModal,
    showSuccessRightSlide,
    showErrorRightSlide,
    closeRightSlide
  } = useModal();

  const {
    drafts,
    currentDraftId,
    isDraftMode,
    questions,
    isLoadingDrafts,
    saveDraft,
    loadDraft,
    deleteDraft,
    updateDraft,
    fetchDrafts
  } = useQuestionPreviewStore();

  // 当草稿管理器打开时，获取最新的草稿列表
  useEffect(() => {
    if (isOpen) {
      fetchDrafts();
    }
  }, [isOpen, fetchDrafts]);

  const [showSaveForm, setShowSaveForm] = useState(false);
  const [draftName, setDraftName] = useState('');
  const [draftDescription, setDraftDescription] = useState('');
  const [editingDraftId, setEditingDraftId] = useState<string | null>(null);
  const [editingDraftName, setEditingDraftName] = useState('');
  const [loadingDraftId, setLoadingDraftId] = useState<string | null>(null);
  const [deletingDraftId, setDeletingDraftId] = useState<string | null>(null);

  const handleSaveDraft = async () => {
    if (!draftName.trim()) {
      showErrorRightSlide(t('preview.draftManager.inputError'), t('preview.draftManager.inputErrorMessage'));
      return;
    }

    if (questions.length === 0) {
      showErrorRightSlide(t('preview.draftManager.saveFailed'), t('preview.draftManager.saveFailedMessage'));
      return;
    }

    // 检查是否存在高度相似的草稿（允许一定的差异）
    const duplicateDraft = drafts.find(draft => {
      // 如果题目数量差异很大，认为不是重复
      if (Math.abs(draft.questions.length - questions.length) > 2) return false;
      
      // 计算相似度（基于题目内容和类型）
      let similarCount = 0;
      const minSimilarity = 0.7; // 70%相似度才认为是重复
      
      questions.forEach((currentQuestion, index) => {
        if (index < draft.questions.length) {
          const draftQuestion = draft.questions[index];
          if (
            draftQuestion.content.stem === currentQuestion.content.stem &&
            draftQuestion.type === currentQuestion.type
          ) {
            similarCount++;
          }
        }
      });
      
      const similarity = similarCount / Math.max(questions.length, draft.questions.length);
      return similarity >= minSimilarity;
    });
    
          if (duplicateDraft) {
        const similarity = Math.round((duplicateDraft.questions.filter((_, index) => 
          index < questions.length && 
          duplicateDraft.questions[index]?.content.stem === questions[index]?.content.stem &&
          duplicateDraft.questions[index]?.type === questions[index]?.type
        ).length / Math.max(questions.length, duplicateDraft.questions.length)) * 100);
        
        const confirmMessage = t('preview.draftManager.confirmOverwriteMessage', { 
          name: duplicateDraft.name, 
          similarity: similarity 
        });
        
        showConfirm(
          t('preview.draftManager.confirmOverwrite'),
          confirmMessage,
          async () => {
            try {
              // 覆盖现有草稿
              const { updateDraft, setCurrentDraftId, setIsDraftMode } = useQuestionPreviewStore.getState();
              await updateDraft(duplicateDraft._id, {
                name: draftName.trim(),
                description: draftDescription.trim() || undefined,
                questions: questions
              });
              setCurrentDraftId(duplicateDraft._id);
              setIsDraftMode(true);
              
              setDraftName('');
              setDraftDescription('');
              setShowSaveForm(false);
              showSuccessRightSlide(t('preview.draftManager.updateSuccess'), t('preview.draftManager.updateSuccessMessage', { name: duplicateDraft.name }));
              
              // 通知父组件用户已主动保存草稿
              if (onUserSaveDraft) {
                onUserSaveDraft();
              }
            } catch (error) {
              showErrorRightSlide(t('preview.draftManager.updateFailed'), t('preview.draftManager.updateFailedMessage'));
            }
            
            // 关闭确认弹窗
            closeConfirm();
          });
        return;
      }

    // 正常保存新草稿
    try {
      const newDraft = await saveDraft(draftName.trim(), draftDescription.trim() || undefined);
      setDraftName('');
      setDraftDescription('');
      setShowSaveForm(false);
      showSuccessRightSlide(t('preview.draftManager.saveSuccess'), t('preview.draftManager.saveSuccessMessage', { name: draftName.trim() }));
      
      // 通知父组件用户已主动保存草稿
      if (onUserSaveDraft) {
        onUserSaveDraft();
      }
      
      // 通知父组件草稿保存成功，用于更新URL
      if (onDraftSaved && newDraft._id) {
        onDraftSaved(newDraft._id);
      }
    } catch (error) {
      console.error('保存草稿失败:', error);
      showErrorRightSlide(t('preview.draftManager.saveFailed'), error instanceof Error ? error.message : t('preview.draftManager.updateFailedMessage'));
    }
  };

  const handleLoadDraft = async (draft: QuestionDraft) => {
    if (isDraftMode && currentDraftId && currentDraftId !== draft._id) {
      showConfirm(
        t('preview.draftManager.confirmLoad'),
        t('preview.draftManager.confirmLoadMessage'),
        async () => {
          try {
            setLoadingDraftId(draft._id);
            await loadDraft(draft._id);
            showSuccessRightSlide(t('preview.draftManager.loadSuccess'), t('preview.draftManager.loadSuccessMessage', { name: draft.name }));
          } catch (error) {
            console.error('加载草稿失败:', error);
            showErrorRightSlide(t('preview.draftManager.loadFailed'), error instanceof Error ? error.message : t('preview.draftManager.loadFailedMessage'));
          } finally {
            setLoadingDraftId(null);
            closeConfirm();
          }
        }
      );
      return;
    }
    
    try {
      setLoadingDraftId(draft._id);
      
      // 添加一个小的延迟来显示加载状态，提升用户体验
      const loadPromise = loadDraft(draft._id);
      const timeoutPromise = new Promise(resolve => setTimeout(resolve, 300));
      
      await Promise.all([loadPromise, timeoutPromise]);
      
      showSuccessRightSlide(t('preview.draftManager.loadSuccess'), t('preview.draftManager.loadSuccessMessage', { name: draft.name }));
    } catch (error) {
      console.error('加载草稿失败:', error);
      showErrorRightSlide(t('preview.draftManager.loadFailed'), error instanceof Error ? error.message : t('preview.draftManager.loadFailedMessage'));
    } finally {
      setLoadingDraftId(null);
    }
  };

  const handleDeleteDraft = async (draft: QuestionDraft) => {
    showConfirm(
      t('preview.draftManager.confirmDelete'),
      t('preview.draftManager.confirmDeleteMessage', { name: draft.name }),
      async () => {
        try {
          setDeletingDraftId(draft._id);
          setConfirmLoading(true, t('preview.draftManager.deleting'));
          await deleteDraft(draft._id);
          showSuccessRightSlide(t('preview.draftManager.deleteSuccess'), t('preview.draftManager.deleteSuccessMessage'));
          closeConfirm();
        } catch (error) {
          console.error('删除草稿失败:', error);
          showErrorRightSlide(t('preview.draftManager.deleteFailed'), error instanceof Error ? error.message : t('preview.draftManager.deleteFailedMessage'));
        } finally {
          setDeletingDraftId(null);
          setConfirmLoading(false);
        }
      }
    );
  };

  const handleEnterEdit = (draft: QuestionDraft) => {
    if (onEnterEdit) {
      // 在进入编辑前，先同步草稿状态
      const { setCurrentDraftId, setIsDraftMode } = useQuestionPreviewStore.getState();
      setCurrentDraftId(draft._id);
      setIsDraftMode(true);
      
      onEnterEdit(draft);
    }
  };

  const handleStartRename = (draft: QuestionDraft) => {
          setEditingDraftId(draft._id);
    setEditingDraftName(draft.name);
  };

  const handleSaveRename = () => {
    if (!editingDraftName.trim()) {
      showErrorRightSlide('输入错误', '请输入草稿名称');
      return;
    }

    if (!editingDraftId) {
      showErrorRightSlide('重命名失败', '草稿ID无效');
      return;
    }

    // 检查名称是否重复
    const existingDraft = drafts.find(d => d.name === editingDraftName.trim() && d._id !== editingDraftId);
    if (existingDraft) {
      showErrorRightSlide('名称重复', '草稿名称已存在');
      return;
    }

    // 更新草稿名称
    updateDraft(editingDraftId, { name: editingDraftName.trim() });
    
    setEditingDraftId(null);
    setEditingDraftName('');
    showSuccessRightSlide(t('preview.draftManager.renameSuccess'), t('preview.draftManager.renameSuccessMessage'));
  };

  const handleCancelRename = () => {
    setEditingDraftId(null);
    setEditingDraftName('');
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCurrentDraft = () => {
    return drafts.find(d => d._id === currentDraftId);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 背景遮罩 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={onClose}
          />
          
          {/* 草稿管理面板 */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed top-0 right-0 h-full w-96 bg-white dark:bg-gray-800 shadow-xl z-50 overflow-hidden flex flex-col"
          >
            {/* 头部 */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold flex items-center">
                    <FileText className="mr-2 h-5 w-5" />
                    {t('preview.draftManager.title')}
                  </h3>
                  <p className="text-sm opacity-90">
                    {isDraftMode ? t('preview.draftManager.currentDraft', { name: getCurrentDraft()?.name || '未命名' }) : t('preview.draftManager.notInDraftMode')}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onClose}
                  className="text-white border-white hover:bg-white/20"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* 内容区域 */}
            <div className="flex-1 overflow-y-auto">
                          {/* 保存新草稿 */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <Button
                onClick={() => questions.length > 0 && setShowSaveForm(true)}
                disabled={questions.length === 0}
                className={`w-full ${
                  questions.length === 0
                    ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-green-500 to-blue-600 text-white hover:from-green-600 hover:to-blue-700'
                }`}
                title={questions.length === 0 ? t('preview.draftManager.noQuestionsToSave') : t('preview.draftManager.saveCurrent')}
              >
                <Save className="h-4 w-4 mr-2" />
                {questions.length === 0 ? t('preview.draftManager.noQuestionsToSave') : t('preview.draftManager.saveCurrent')}
              </Button>
              {questions.length === 0 && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                  {t('preview.draftManager.noQuestionsHint')}
                </p>
              )}
            </div>

              {/* 保存表单 */}
              <AnimatePresence>
                {showSaveForm && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-4 border-b bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                  >
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                          {t('preview.draftManager.draftName')} *
                        </label>
                        <input
                          type="text"
                          value={draftName}
                          onChange={(e) => setDraftName(e.target.value)}
                          placeholder={t('preview.draftManager.draftNamePlaceholder')}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                          {t('preview.draftManager.description')}
                        </label>
                        <textarea
                          value={draftDescription}
                          onChange={(e) => setDraftDescription(e.target.value)}
                          placeholder={t('preview.draftManager.descriptionPlaceholder')}
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                        />
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          onClick={handleSaveDraft}
                          className="flex-1 bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                        >
                          {t('preview.draftManager.save')}
                        </Button>
                        <Button
                          onClick={() => {
                            setShowSaveForm(false);
                            setDraftName('');
                            setDraftDescription('');
                          }}
                          variant="outline"
                          className="flex-1"
                        >
                          {t('preview.draftManager.cancel')}
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* 草稿列表 */}
              <div className="p-4">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-3">
                  {t('preview.draftManager.draftList', { count: drafts.length })}
                </h4>
                
                {isLoadingDrafts ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <div className="h-8 w-8 mx-auto mb-3 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                    <p>{t('preview.draftManager.loadingDrafts')}</p>
                  </div>
                ) : drafts.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>{t('preview.draftManager.noDrafts')}</p>
                    <p className="text-sm">{t('preview.draftManager.noDraftsHint')}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <AnimatePresence>
                      {drafts.map((draft, index) => (
                        <motion.div
                          key={draft._id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <Card className={`p-3 transition-all duration-200 ${
                            currentDraftId === draft._id 
                              ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                              : 'hover:shadow-md'
                          }`}>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                {editingDraftId === draft._id ? (
                                  <div className="flex-1 mr-2">
                                    <input
                                      type="text"
                                      value={editingDraftName}
                                      onChange={(e) => setEditingDraftName(e.target.value)}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                          handleSaveRename();
                                        } else if (e.key === 'Escape') {
                                          handleCancelRename();
                                        }
                                      }}
                                      className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                      autoFocus
                                    />
                                  </div>
                                ) : (
                                  <span className="font-medium text-sm truncate text-gray-900 dark:text-gray-100" title={draft.name}>
                                    {draft.name}
                                  </span>
                                )}
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {t('preview.draftManager.questionCount', { count: draft.questions.length })}
                                </span>
                              </div>
                              
                              {draft.description && (
                                <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2">
                                  {draft.description}
                                </p>
                              )}
                              
                              <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                                <Clock className="h-3 w-3 mr-1" />
                                {formatDate(draft.updatedAt)}
                              </div>
                              
                              <div className="flex items-center justify-between">
                                {editingDraftId === draft._id ? (
                                  <div className="flex space-x-1">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={handleSaveRename}
                                      className="text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 text-xs px-2 py-1"
                                    >
                                      <Save className="h-3 w-3 mr-1" />
                                      {t('preview.draftManager.saveRename')}
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={handleCancelRename}
                                      className="text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 text-xs px-2 py-1"
                                    >
                                      <X className="h-3 w-3 mr-1" />
                                      {t('preview.draftManager.cancelRename')}
                                    </Button>
                                  </div>
                                ) : (
                                  <div className="flex space-x-1">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleLoadDraft(draft)}
                                      className="text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-xs px-2 py-1"
                                      disabled={currentDraftId === draft._id || loadingDraftId === draft._id}
                                    >
                                      {loadingDraftId === draft._id ? (
                                        <>
                                          <div className="h-3 w-3 mr-1 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                                          {t('preview.draftManager.loading')}
                                        </>
                                      ) : (
                                        <>
                                          <FolderOpen className="h-3 w-3 mr-1" />
                                          {currentDraftId === draft._id ? t('preview.draftManager.currentDraftStatus') : t('preview.draftManager.load')}
                                        </>
                                      )}
                                    </Button>
                                    
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleStartRename(draft)}
                                      className="text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 text-xs px-2 py-1"
                                      disabled={editingDraftId === draft._id}
                                    >
                                      <Edit3 className="h-3 w-3 mr-1" />
                                      {t('preview.draftManager.rename')}
                                    </Button>
                                    
                                    {onEnterEdit && (
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleEnterEdit(draft)}
                                        className="text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 text-xs px-2 py-1"
                                      >
                                        <Edit3 className="h-3 w-3 mr-1" />
                                        {t('preview.draftManager.edit')}
                                      </Button>
                                    )}
                                  </div>
                                )}
                                
                                                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDeleteDraft(draft)}
                                  className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 text-xs px-2 py-1"
                                  disabled={editingDraftId === draft._id || deletingDraftId === draft._id}
                                >
                                  {deletingDraftId === draft._id ? (
                                    <>
                                      <div className="h-3 w-3 mr-1 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
                                      {t('preview.draftManager.deleting')}
                                    </>
                                  ) : (
                                    <>
                                      <Trash2 className="h-3 w-3 mr-1" />
                                      {t('preview.draftManager.delete')}
                                    </>
                                  )}
                                </Button>
                              </div>
                            </div>
                          </Card>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            </div>

            {/* 底部信息 */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
              <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                <p>{t('preview.draftManager.cloudStorage')}</p>
                <p>{t('preview.draftManager.dataSecurity')}</p>
              </div>
            </div>
          </motion.div>

          {/* 确认弹窗 */}
          <ConfirmModal
            {...confirmModal}
            onCancel={closeConfirm}
          />

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
        </>
      )}
    </AnimatePresence>
  );
};

export default DraftManager; 