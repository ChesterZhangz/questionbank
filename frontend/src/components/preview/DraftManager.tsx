import React, { useState } from 'react';
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
import { useQuestionPreviewStore, type QuestionDraft } from '../../stores/questionPreviewStore';
import { useModal } from '../../hooks/useModal';
import RightSlideModal from '../ui/RightSlideModal';

interface DraftManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onEnterEdit?: (draft: QuestionDraft) => void;
  onUserSaveDraft?: () => void; // 用户主动保存草稿的回调
}

const DraftManager: React.FC<DraftManagerProps> = ({ isOpen, onClose, onEnterEdit, onUserSaveDraft }) => {
  // 弹窗状态管理
  const { 
    showConfirm,
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
    saveDraft,
    loadDraft,
    deleteDraft,
    updateDraft
  } = useQuestionPreviewStore();

  const [showSaveForm, setShowSaveForm] = useState(false);
  const [draftName, setDraftName] = useState('');
  const [draftDescription, setDraftDescription] = useState('');
  const [editingDraftId, setEditingDraftId] = useState<string | null>(null);
  const [editingDraftName, setEditingDraftName] = useState('');

  const handleSaveDraft = () => {
    if (!draftName.trim()) {
      showErrorRightSlide('输入错误', '请输入草稿名称');
      return;
    }

    if (questions.length === 0) {
      showErrorRightSlide('保存失败', '没有题目可以保存');
      return;
    }

    // 检查是否存在内容重复的草稿
    const { checkDuplicateQuestions } = useQuestionPreviewStore.getState();
    const duplicateDraft = checkDuplicateQuestions(questions);
    
    if (duplicateDraft) {
      const confirmMessage = `检测到与草稿"${duplicateDraft.name}"内容完全相同的习题集。\n\n是否要覆盖现有草稿？\n\n注意：这将更新草稿"${duplicateDraft.name}"的内容，而不是创建新的草稿。`;
      
      showConfirm(
        '确认覆盖',
        confirmMessage,
        () => {
        // 覆盖现有草稿
        const { updateDraft, setCurrentDraftId, setIsDraftMode } = useQuestionPreviewStore.getState();
        updateDraft(duplicateDraft.id, {
          name: draftName.trim(),
          description: draftDescription.trim() || undefined,
          questions: questions
        });
        setCurrentDraftId(duplicateDraft.id);
        setIsDraftMode(true);
        
        setDraftName('');
        setDraftDescription('');
        setShowSaveForm(false);
        showSuccessRightSlide('更新成功', `已更新草稿：${duplicateDraft.name}`);
        
        // 通知父组件用户已主动保存草稿
        if (onUserSaveDraft) {
          onUserSaveDraft();
        }
      });
      return;
    }

    // 正常保存新草稿
    saveDraft(draftName.trim(), draftDescription.trim() || undefined);
    setDraftName('');
    setDraftDescription('');
    setShowSaveForm(false);
    showSuccessRightSlide('保存成功', '草稿保存成功');
    
    // 通知父组件用户已主动保存草稿
    if (onUserSaveDraft) {
      onUserSaveDraft();
    }
  };

  const handleLoadDraft = (draft: QuestionDraft) => {
    if (isDraftMode && currentDraftId && currentDraftId !== draft.id) {
      showConfirm(
        '确认加载',
        '当前有未保存的草稿，确定要加载其他草稿吗？',
        () => {
          loadDraft(draft.id);
          showSuccessRightSlide('加载成功', `已加载草稿：${draft.name}`);
        }
      );
      return;
    }
    
    loadDraft(draft.id);
    showSuccessRightSlide('加载成功', `已加载草稿：${draft.name}`);
  };

  const handleDeleteDraft = (draft: QuestionDraft) => {
    showConfirm(
      '确认删除',
      `确定要删除草稿"${draft.name}"吗？`,
      () => {
        deleteDraft(draft.id);
        showSuccessRightSlide('删除成功', '草稿删除成功');
      }
    );
  };

  const handleEnterEdit = (draft: QuestionDraft) => {
    if (onEnterEdit) {
      onEnterEdit(draft);
    }
  };

  const handleStartRename = (draft: QuestionDraft) => {
    setEditingDraftId(draft.id);
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
    const existingDraft = drafts.find(d => d.name === editingDraftName.trim() && d.id !== editingDraftId);
    if (existingDraft) {
      showErrorRightSlide('名称重复', '草稿名称已存在');
      return;
    }

    // 更新草稿名称
    updateDraft(editingDraftId, { name: editingDraftName.trim() });
    
    setEditingDraftId(null);
    setEditingDraftName('');
    showSuccessRightSlide('重命名成功', '草稿重命名成功');
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
    return drafts.find(d => d.id === currentDraftId);
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
                    题目集草稿
                  </h3>
                  <p className="text-sm opacity-90">
                    {isDraftMode ? `当前草稿：${getCurrentDraft()?.name || '未命名'}` : '未在草稿模式'}
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
                title={questions.length === 0 ? '当前没有题目可以保存' : '保存当前题目集为草稿'}
              >
                <Save className="h-4 w-4 mr-2" />
                {questions.length === 0 ? '暂无题目可保存' : '保存当前题目集为草稿'}
              </Button>
              {questions.length === 0 && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                  请先上传文档或加载草稿
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
                          草稿名称 *
                        </label>
                        <input
                          type="text"
                          value={draftName}
                          onChange={(e) => setDraftName(e.target.value)}
                          placeholder="请输入草稿名称"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                          描述（可选）
                        </label>
                        <textarea
                          value={draftDescription}
                          onChange={(e) => setDraftDescription(e.target.value)}
                          placeholder="请输入草稿描述"
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                        />
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          onClick={handleSaveDraft}
                          className="flex-1 bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                        >
                          保存
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
                          取消
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* 草稿列表 */}
              <div className="p-4">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-3">
                  草稿列表 ({drafts.length})
                </h4>
                
                {drafts.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>暂无草稿</p>
                    <p className="text-sm">保存题目集后，草稿将显示在这里</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <AnimatePresence>
                      {drafts.map((draft, index) => (
                        <motion.div
                          key={draft.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <Card className={`p-3 transition-all duration-200 ${
                            currentDraftId === draft.id 
                              ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                              : 'hover:shadow-md'
                          }`}>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                {editingDraftId === draft.id ? (
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
                                  {draft.questions.length}题
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
                                {editingDraftId === draft.id ? (
                                  <div className="flex space-x-1">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={handleSaveRename}
                                      className="text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 text-xs px-2 py-1"
                                    >
                                      <Save className="h-3 w-3 mr-1" />
                                      保存
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={handleCancelRename}
                                      className="text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 text-xs px-2 py-1"
                                    >
                                      <X className="h-3 w-3 mr-1" />
                                      取消
                                    </Button>
                                  </div>
                                ) : (
                                  <div className="flex space-x-1">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleLoadDraft(draft)}
                                      className="text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-xs px-2 py-1"
                                      disabled={currentDraftId === draft.id}
                                    >
                                      <FolderOpen className="h-3 w-3 mr-1" />
                                      {currentDraftId === draft.id ? '当前草稿' : '加载'}
                                    </Button>
                                    
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleStartRename(draft)}
                                      className="text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 text-xs px-2 py-1"
                                      disabled={editingDraftId === draft.id}
                                    >
                                      <Edit3 className="h-3 w-3 mr-1" />
                                      重命名
                                    </Button>
                                    
                                    {onEnterEdit && (
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleEnterEdit(draft)}
                                        className="text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 text-xs px-2 py-1"
                                      >
                                        <Edit3 className="h-3 w-3 mr-1" />
                                        编辑
                                      </Button>
                                    )}
                                  </div>
                                )}
                                
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDeleteDraft(draft)}
                                  className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 text-xs px-2 py-1"
                                  disabled={editingDraftId === draft.id}
                                >
                                  <Trash2 className="h-3 w-3" />
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
                <p>草稿保存在本地存储中</p>
                <p>最多保留 20 个草稿</p>
              </div>
            </div>
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
        </>
      )}
    </AnimatePresence>
  );
};

export default DraftManager; 