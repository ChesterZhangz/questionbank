import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { useQuestionPreviewStore } from '../../stores/questionPreviewStore';
import DraftManager from '../../components/preview/DraftManager';
import DraftReminderModal from '../../components/preview/DraftReminderModal';
import { cleanupOldStorage, checkMigrationStatus } from '../../utils/dataMigration';
import ProcessingProgressCard from '../../components/preview/ProcessingProgressCard';
import ProcessingResultPreview from '../../components/preview/ProcessingResultPreview';
import PaperHistoryDetail from '../../components/preview/PaperHistoryDetail';
import ErrorDisplay from '../../components/ui/ErrorDisplay';
import ConfirmModal from '../../components/ui/ConfirmModal';
import RightSlideModal from '../../components/ui/RightSlideModal';

import { useModal } from '../../hooks/useModal';

import { 
  Upload,
  FileText, 
  Trash2,
  Plus,
  Eye,
  History,
  Target,
  Brain,
  X,
  Save,
  FileUp,
  Database
} from 'lucide-react';

  // 文档接口定义
  interface DocumentItem {
    id: string;
    fileName: string;
    fileSize: number;
    fileType: 'pdf' | 'tex';
    status: 'uploading' | 'processing' | 'completed' | 'failed' | 'waiting' | 'paused' | 'retrying' | 'cancelled';
    uploadTime: Date;
    processTime?: Date;
    questions: Question[];
    originalContent?: string;
    processedContent?: string;
    confidence?: number;
    error?: string;
    
    // 增强的进度跟踪
    uploadProgress?: number;
    processingProgress?: number;
    currentStep?: string;
    estimatedTime?: number; // 预估剩余时间（秒）
    startTime?: Date;
    lastUpdateTime?: Date;
    
    // 处理步骤详情
    processingSteps?: {
      step: string;
      status: 'pending' | 'processing' | 'completed' | 'failed';
      progress: number;
      startTime?: Date;
      endTime?: Date;
      error?: string;
    }[];
    
    // 重试相关
    retryCount?: number;
    maxRetries?: number;
    retryDelay?: number;
    
    // 实时处理信息
    processingInfo?: {
      totalTime: number;
      questionsCount: number;
      choiceCount: number;
      fillCount: number;
      solutionCount: number;
      averageTimePerQuestion: number;
    };
  }

// 题目接口定义 - 使用标准Question结构
interface Question {
  _id: string;
  id: string;
  qid: string;
  bid: string;
  type: 'choice' | 'fill' | 'solution';
  content: {
    stem: string;
    options?: Array<{
      text: string;
      isCorrect: boolean;
    }>;
    answer: string;
    fillAnswers?: string[];
    solutionAnswers?: string[];
    solution?: string;
  };
  category?: string[];
  tags?: string[];
  source?: string;
  creator: any;
  questionBank: string;
  status: 'draft' | 'published' | 'archived';
  difficulty: number;
  views: number;
  favorites?: string[];
  images?: Array<{
    id: string;
    url: string;
    filename: string;
    order: number;
  }>;
  tikzCodes?: Array<{
    id: string;
    code: string;
    format: 'svg' | 'png';
    order: number;
  }>;
  createdAt: string;
  updatedAt: string;
  isSelected: boolean;
  isEditing: boolean;
}

const BatchUploadPage: React.FC = () => {
  const navigate = useNavigate();
  const { drafts = [] } = useQuestionPreviewStore();

  // 弹窗状态管理
  const { 
    showConfirm, 
    confirmModal, 
    closeConfirm,
    showSuccessRightSlide,
    showErrorRightSlide,
    rightSlideModal,
    closeRightSlide
  } = useModal();

  // 核心状态管理
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);

  // 界面状态
  const [showHistory, setShowHistory] = useState(false);
  const [showDraftManager, setShowDraftManager] = useState(false);
  const [showDraftReminder, setShowDraftReminder] = useState(false);
  const [showHistoryDetail, setShowHistoryDetail] = useState(false);
  const [selectedHistoryDoc, setSelectedHistoryDoc] = useState<DocumentItem | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // 历史记录
  const [uploadHistory, setUploadHistory] = useState<DocumentItem[]>([]);

  // 新增：全局处理状态
  const [globalProcessingStatus, setGlobalProcessingStatus] = useState<{
    isProcessing: boolean;
    totalDocuments: number;
    completedDocuments: number;
    failedDocuments: number;
    estimatedTotalTime: number;
  }>({
    isProcessing: false,
    totalDocuments: 0,
    completedDocuments: 0,
    failedDocuments: 0,
    estimatedTotalTime: 0
  });
  
  // 事件源映射：用于订阅后端SSE实时进度
  const progressEventSourcesRef = useRef<Record<string, EventSource>>({});


  // 新增：格式化时间显示
  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${Math.round(seconds)}秒`;
    if (seconds < 3600) return `${Math.round(seconds / 60)}分钟`;
    return `${Math.round(seconds / 3600)}小时${Math.round((seconds % 3600) / 60)}分钟`;
  };

  // 优化：计算预估时间（基于实际处理数据）
  const calculateEstimatedTime = (fileSize: number, fileType: string): number => {
    // 基于实际测试数据的更精确预估
    const fileSizeMB = fileSize / (1024 * 1024);
    
    let estimatedTime = 0;
    
    if (fileType === 'pdf') {
      // PDF处理时间：Mathpix提取(10-30s) + AI处理(每道题2-5s)
      const estimatedQuestions = Math.max(5, Math.round(fileSizeMB * 2)); // 预估题目数量
      const mathpixTime = Math.max(10, Math.min(30, fileSizeMB * 8)); // Mathpix提取时间
      const aiTime = estimatedQuestions * 3; // AI处理时间（每道题平均3秒）
      estimatedTime = mathpixTime + aiTime;
    } else if (fileType === 'tex') {
      // TeX处理时间：AI解析(5-15s) + 题目识别(每道题1-3s)
      const estimatedQuestions = Math.max(3, Math.round(fileSizeMB * 3)); // 预估题目数量
      const parseTime = Math.max(5, Math.min(15, fileSizeMB * 5)); // 解析时间
      const aiTime = estimatedQuestions * 2; // AI处理时间（每道题平均2秒）
      estimatedTime = parseTime + aiTime;
    }
    
    // 添加网络延迟和缓冲时间
    estimatedTime += 10;
    
    // 限制预估时间范围
    return Math.max(15, Math.min(estimatedTime, 600)); // 最少15秒，最多10分钟
  };

  // 新增：更新文档进度
  const updateDocumentProgress = useCallback((
    docId: string,
    updates: Partial<DocumentItem>
  ) => {
    setDocuments(prev => prev.map(doc => {
      if (doc.id === docId) {
        const updatedDoc = { ...doc, ...updates, lastUpdateTime: new Date() };
        
        // 更新全局处理状态
        if (updates.status === 'completed') {
          setGlobalProcessingStatus(prev => ({
            ...prev,
            completedDocuments: prev.completedDocuments + 1
          }));
        } else if (updates.status === 'failed') {
          setGlobalProcessingStatus(prev => ({
            ...prev,
            failedDocuments: prev.failedDocuments + 1
          }));
        }
        
        return updatedDoc;
      }
      return doc;
    }));
  }, []);

  // 优化：处理步骤更新（基于实际处理时间）
  const updateProcessingStep = useCallback((
    docId: string,
    stepName: string,
    status: 'pending' | 'processing' | 'completed' | 'failed',
    progress: number,
    error?: string
  ) => {
    setDocuments(prev => prev.map(doc => {
      if (doc.id === docId) {
        const steps = doc.processingSteps || [];
        const stepIndex = steps.findIndex(s => s.step === stepName);
        
        const updatedStep = {
          step: stepName,
          status,
          progress,
          startTime: status === 'processing' ? new Date() : undefined,
          endTime: status === 'completed' || status === 'failed' ? new Date() : undefined,
          error
        };
        
        const updatedSteps = stepIndex >= 0 
          ? steps.map((s, i) => i === stepIndex ? updatedStep : s)
          : [...steps, updatedStep];
        
        // 基于实际处理时间计算更精确的进度
        let overallProgress = 0;
        const totalSteps = updatedSteps.length;
        const completedSteps = updatedSteps.filter(s => s.status === 'completed').length;
        const processingSteps = updatedSteps.filter(s => s.status === 'processing');
        
        if (completedSteps === totalSteps) {
          overallProgress = 100;
        } else if (processingSteps.length > 0) {
          // 基于实际处理时间计算进度
          const currentStep = processingSteps[0];
          const stepProgress = currentStep.progress || 0;
          
          // 根据步骤类型分配不同的权重
          let stepWeight = 1;
          if (doc.fileType === 'pdf') {
            // PDF处理步骤权重
            const stepWeights: Record<string, number> = {
              '文件上传': 0.05,
              '提取': 0.25,
              '题目分割': 0.15,
              'AI处理': 0.45,
              '结果优化': 0.10
            };
            stepWeight = stepWeights[currentStep.step] || 1;
          } else if (doc.fileType === 'tex') {
            // TeX处理步骤权重
            const stepWeights: Record<string, number> = {
              '文件上传': 0.05,
              'DeepSeek AI解析': 0.60,
              '题目识别': 0.25,
              '结果优化': 0.10
            };
            stepWeight = stepWeights[currentStep.step] || 1;
          }
          
          // 计算总体进度
          const completedWeight = updatedSteps
            .filter(s => s.status === 'completed')
            .reduce((sum, s) => {
              let weight = 1;
              if (doc.fileType === 'pdf') {
                const pdfWeights: Record<string, number> = { '文件上传': 0.05, '提取': 0.25, '题目分割': 0.15, 'AI处理': 0.45, '结果优化': 0.10 };
                weight = pdfWeights[s.step] || 1;
              } else if (doc.fileType === 'tex') {
                const texWeights: Record<string, number> = { '文件上传': 0.05, 'DeepSeek AI解析': 0.60, '题目识别': 0.25, '结果优化': 0.10 };
                weight = texWeights[s.step] || 1;
              }
              return sum + weight;
            }, 0);
          
          overallProgress = Math.min(95, (completedWeight + stepWeight * (stepProgress / 100)) * 100);
        } else {
          overallProgress = (completedSteps / totalSteps) * 100;
        }
        
        return {
          ...doc,
          processingSteps: updatedSteps,
          currentStep: stepName,
          processingProgress: Math.round(overallProgress),
          lastUpdateTime: new Date()
        };
      }
      return doc;
    }));
  }, []);

  // 保存当前会话状态
  const saveCurrentSession = useCallback(() => {
    // 只保存未完成的文档到当前会话
    const activeDocuments = documents.filter(doc => doc.status !== 'completed');
    localStorage.setItem('batchUploadCurrentDocuments', JSON.stringify(activeDocuments));
    localStorage.setItem('batchUploadCurrentQuestions', JSON.stringify(allQuestions));
    localStorage.setItem('batchUploadGlobalStatus', JSON.stringify(globalProcessingStatus));
  }, [documents, allQuestions, globalProcessingStatus]);

  // 加载当前会话状态
  const loadCurrentSession = useCallback(() => {
    const savedDocuments = localStorage.getItem('batchUploadCurrentDocuments');
    const savedQuestions = localStorage.getItem('batchUploadCurrentQuestions');
    const savedGlobalStatus = localStorage.getItem('batchUploadGlobalStatus');
    
    if (savedDocuments) {
      try {
        const documents = JSON.parse(savedDocuments);
        // 恢复Date对象，但只保留未完成的文档
        const restoredDocuments = documents
          .filter((doc: any) => doc.status !== 'completed') // 过滤掉已完成的文档
          .map((doc: any) => ({
            ...doc,
            uploadTime: new Date(doc.uploadTime),
            processTime: doc.processTime ? new Date(doc.processTime) : undefined,
            startTime: doc.startTime ? new Date(doc.startTime) : undefined,
            lastUpdateTime: doc.lastUpdateTime ? new Date(doc.lastUpdateTime) : undefined,
            processingSteps: doc.processingSteps?.map((step: any) => ({
              ...step,
              startTime: step.startTime ? new Date(step.startTime) : undefined,
              endTime: step.endTime ? new Date(step.endTime) : undefined
            }))
          }));
        setDocuments(restoredDocuments);
              } catch (error) {
          showErrorRightSlide('加载失败', '加载当前文档状态失败');
        }
    }
    
    if (savedQuestions) {
      try {
        const questions = JSON.parse(savedQuestions);
        setAllQuestions(questions);
              } catch (error) {
          showErrorRightSlide('加载失败', '加载当前题目状态失败');
        }
    }
    
    if (savedGlobalStatus) {
      try {
        const globalStatus = JSON.parse(savedGlobalStatus);
        setGlobalProcessingStatus(globalStatus);
              } catch (error) {
          showErrorRightSlide('加载失败', '加载全局处理状态失败');
        }
    }
  }, []);

  // 组件挂载时加载数据
  useEffect(() => {
    // 检查并清理旧的localStorage数据
    const migrationStatus = checkMigrationStatus();
    if (migrationStatus.oldDataExists) {
      cleanupOldStorage();
    }
    
    loadUploadHistory();
    loadCurrentSession();
  }, []);

  // 监听状态变化，自动保存当前会话
  useEffect(() => {
    saveCurrentSession();
  }, [documents, allQuestions, globalProcessingStatus, saveCurrentSession]);

  // 页面可见性变化处理
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // 页面重新可见时，重新加载状态
        loadCurrentSession();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [loadCurrentSession]);

  // 页面卸载前保存状态
  useEffect(() => {
    const handleBeforeUnload = () => {
      saveCurrentSession();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [saveCurrentSession]);

  // 加载历史记录
  const loadUploadHistory = useCallback(() => {
    const savedHistory = localStorage.getItem('batchUploadHistory');
    if (savedHistory) {
      try {
        const history = JSON.parse(savedHistory);
        setUploadHistory(history);
              } catch (error) {
          showErrorRightSlide('加载失败', '加载历史记录失败');
        }
    }
  }, []);

  // 保存到历史记录
  const saveToHistory = useCallback((document: DocumentItem) => {
    setUploadHistory(prev => {
      const newHistory = [document, ...prev.slice(0, 49)]; // 保留最近50条
      localStorage.setItem('batchUploadHistory', JSON.stringify(newHistory));
      return newHistory;
    });
  }, []);

  // 清空历史记录
  const clearHistory = useCallback(() => {
    setUploadHistory([]);
    localStorage.removeItem('batchUploadHistory');
  }, []);

  // 清空当前会话状态
  const clearCurrentSession = useCallback(() => {
    setDocuments([]);
    setAllQuestions([]);
    setGlobalProcessingStatus({
      isProcessing: false,
      totalDocuments: 0,
      completedDocuments: 0,
      failedDocuments: 0,
      estimatedTotalTime: 0
    });
    localStorage.removeItem('batchUploadCurrentDocuments');
    localStorage.removeItem('batchUploadCurrentQuestions');
    localStorage.removeItem('batchUploadGlobalStatus');
  }, []);

  // 恢复历史记录
  const restoreFromHistory = useCallback((historyDoc: DocumentItem) => {
    const newDoc: DocumentItem = {
      ...historyDoc,
      id: Date.now().toString(),
      uploadTime: new Date(),
      status: 'completed' as const, // 直接设置为完成状态
      processingProgress: 100, // 设置进度为100%
      processingSteps: historyDoc.processingSteps?.map(step => ({
        ...step,
        status: 'completed' as const, // 所有步骤都设置为完成
        progress: 100
      }))
    };
    setDocuments(prev => [...prev, newDoc]);
    setAllQuestions(prev => [...prev, ...historyDoc.questions]);
  }, []);

  // 从草稿进入编辑
  const handleEnterEdit = useCallback((draft: any) => {
    // 跳转到题目预览编辑页面，传递草稿数据
    navigate('/batch-upload/preview-edit', {
      state: {
        questions: draft.questions,
        documentInfo: draft.documentInfo,
        isFromDraft: true,
        draftId: draft.id
      }
    });
    setShowDraftManager(false);
  }, [navigate]);

  // 处理草稿保存成功
  const handleDraftSaveSuccess = useCallback(() => {
    setShowDraftReminder(false);
  }, []);

  // 处理用户主动保存草稿
  const handleUserSaveDraft = useCallback(() => {
    // 在批量上传页面，用户保存草稿后不需要特殊处理
  }, []);

  // 处理草稿保存成功，更新URL
  const handleDraftSaved = useCallback((_draftId: string) => {
    // 在批量上传页面，草稿保存成功后不需要更新URL
  }, []);

  // 新增：文件名长度检测和优化建议
  const checkFileNameLength = (fileName: string) => {
    const maxLength = 100; // 建议的最大长度
    if (fileName.length > maxLength) {
      return {
        isLong: true,
        suggestion: `文件名较长(${fileName.length}字符)，建议缩短到${maxLength}字符以内以获得最佳体验`
      };
    }
    return { isLong: false, suggestion: '' };
  };

  // 新增：智能JSON解析函数
  const parseResponseJSON = (responseText: string, apiName: string) => {

    // 1. 尝试直接解析JSON
    try {
      const result = JSON.parse(responseText);
      return result;
    } catch (parseError) {
              // 直接JSON解析失败
    }

    // 2. 尝试提取JSON部分（处理流式响应或包含其他内容的响应）
    const jsonPatterns = [
      /\{.*\}/s,                    // 匹配完整的JSON对象
      /\[.*\]/s,                    // 匹配JSON数组
      /data:\s*(\{.*\})/s,          // 匹配 "data: {json}" 格式
      /data:\s*(\[.*\])/s,          // 匹配 "data: [json]" 格式
      /result:\s*(\{.*\})/s,        // 匹配 "result: {json}" 格式
      /result:\s*(\[.*\])/s,        // 匹配 "result: [json]" 格式
    ];

    for (const pattern of jsonPatterns) {
      const match = responseText.match(pattern);
      if (match) {
        try {
          const jsonStr = match[1] || match[0];
          const result = JSON.parse(jsonStr);
          return result;
        } catch (extractError) {
          // 模式提取失败
        }
      }
    }

    // 3. 尝试清理响应文本后解析
    try {
      // 移除可能的SSE前缀和多余字符
      const cleanedText = responseText
        .replace(/^data:\s*/gm, '')  // 移除SSE前缀
        .replace(/^\s*/, '')         // 移除开头空白
        .replace(/\s*$/, '')         // 移除结尾空白
        .replace(/^[^{[]*/, '')      // 移除JSON前的任何内容
        .replace(/[^}\]]*$/, '');    // 移除JSON后的任何内容

      if (cleanedText) {
        const result = JSON.parse(cleanedText);
        return result;
      }
    } catch (cleanError) {
              // 清理后解析失败
    }
    throw new Error(`无法解析${apiName}响应数据，响应格式不正确`);
  };

  // 处理文件上传
  const handleFileUpload = useCallback(async (file: File) => {
    // 检查文件名长度
    const fileNameCheck = checkFileNameLength(file.name);
    if (fileNameCheck.isLong) {
    }

    // 检查文件大小 (50MB限制)
    const maxFileSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxFileSize) {
      showErrorRightSlide('文件过大', `文件大小不能超过 ${(maxFileSize / 1024 / 1024).toFixed(0)}MB，当前文件大小: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
      return;
    }

    const estimatedTime = calculateEstimatedTime(file.size, getFileType(file));
    
    const fileType = getFileType(file);
    
    // 根据文档类型设置不同的处理步骤
    let processingSteps: {
      step: string;
      status: 'pending' | 'processing' | 'completed' | 'failed';
      progress: number;
    }[] = [];
    
    if (fileType === 'pdf') {
      // PDF文档使用6步流程
      processingSteps = [
        { step: '文件上传', status: 'pending', progress: 0 },
        { step: '提取', status: 'pending', progress: 0 },
        { step: '题目分割', status: 'pending', progress: 0 },
        { step: 'AI处理', status: 'pending', progress: 0 },
        { step: '结果优化', status: 'pending', progress: 0 }
      ];
    } else if (fileType === 'tex') {
      // TeX文档使用3步流程
      processingSteps = [
        { step: '文件上传', status: 'pending', progress: 0 },
        { step: 'DeepSeek AI解析', status: 'pending', progress: 0 },
        { step: '题目识别', status: 'pending', progress: 0 },
        { step: '结果优化', status: 'pending', progress: 0 }
      ];
    }
    
    const newDocument: DocumentItem = {
      id: Date.now().toString(),
      fileName: file.name,
      fileSize: file.size,
      fileType: fileType,
      status: 'uploading',
      uploadTime: new Date(),
      questions: [],
      uploadProgress: 0,
      processingProgress: 0,
      estimatedTime,
      startTime: new Date(),
      lastUpdateTime: new Date(),
      processingSteps,
      retryCount: 0,
      maxRetries: 3,
      retryDelay: 5000
    };

    setDocuments(prev => [...prev, newDocument]);
    
    // 更新全局处理状态
    setGlobalProcessingStatus(prev => ({
      ...prev,
      isProcessing: true,
      totalDocuments: prev.totalDocuments + 1,
      estimatedTotalTime: prev.estimatedTotalTime + estimatedTime
    }));

    try {
      // 开始上传进度跟踪
      updateProcessingStep(newDocument.id, '文件上传', 'processing', 0);
      
      const formData = new FormData();

      // 根据文件类型调用不同的API
      if (file.type.includes('pdf')) {
        formData.append('pdf', file);
        await processPDFFile(newDocument, formData);
      } else if (newDocument.fileType === 'tex') {
        formData.append('tex', file);
        await processTeXFile(newDocument, formData);
      } else {
        throw new Error('不支持的文件类型，仅支持PDF和TeX文件');
      }
    } catch (error: any) {
      showErrorRightSlide('处理失败', '文件处理失败，请重试');
      updateDocumentProgress(newDocument.id, { 
        status: 'failed', 
        error: error.message || '文件处理失败'
      });
    }
  }, [updateDocumentProgress, updateProcessingStep, checkFileNameLength]);

  // 获取文件类型
  const getFileType = (file: File): 'pdf' | 'tex' => {
    if (file.type.includes('pdf')) return 'pdf';
    if (file.name.toLowerCase().endsWith('.tex')) return 'tex';
    throw new Error('不支持的文件类型，仅支持PDF和TeX文件');
  };

  // 处理PDF文件
  const processPDFFile = async (document: DocumentItem, formData: FormData) => {
    updateDocumentProgress(document.id, { status: 'processing' });
    
    // 初始化所有处理步骤
    updateProcessingStep(document.id, '文件上传', 'completed', 100);
    updateProcessingStep(document.id, 'Mathpix提取', 'processing', 0);
    updateProcessingStep(document.id, '题目分割', 'processing', 0);
    updateProcessingStep(document.id, 'AI处理', 'processing', 0);
    updateProcessingStep(document.id, '结果优化', 'processing', 0);
    
    // 从Zustand持久化数据中获取token
    const authStorage = localStorage.getItem('auth-storage');
    let token = '';
    if (authStorage) {
      try {
        const authData = JSON.parse(authStorage);
        if (authData.state && authData.state.token) {
          token = authData.state.token;
        }
      } catch (error) {
        // 静默处理认证存储解析错误
      }
    }
    
    if (!token) {
      // 没有认证token，尝试使用测试路由
      if (import.meta.env.DEV) {
      } else {
        throw new Error('需要登录才能处理文件，请先登录');
      }
    }
    
    try {
      // 步骤1: Mathpix提取MMD内容并分割
      updateProcessingStep(document.id, '提取', 'processing', 10);
      
      // 在开发环境中使用本地后端，生产环境使用远程API
      const apiBaseUrl = import.meta.env.DEV 
        ? 'http://localhost:3001/api' 
        : (import.meta.env.VITE_API_URL || 'https://www.mareate.com/api');
      
      // 记录开始时间
      const startTime = Date.now();
      
      // 打开SSE进度订阅
      try {
        const es = new EventSource(`${apiBaseUrl}/mathpix-optimized/progress/${document.id}`);
        progressEventSourcesRef.current[document.id] = es;
        es.onmessage = (evt) => {
          try {
            const data = JSON.parse(evt.data);
            // SSE收到事件
            
            if (data?.type === 'status') {
              const step = data.step || '';
              const p = typeof data.progress === 'number' ? data.progress : 0;
              
              // 精确匹配后端发送的步骤名称
              if (step === '开始处理PDF') {
                updateProcessingStep(document.id, '文件上传', 'completed', 100);
              } else if (step === '提取') {
                updateProcessingStep(document.id, '提取', 'processing', p);
              } else if (step === '提取完成') {
                updateProcessingStep(document.id, '提取', 'completed', 100);
              } else if (step === '题目分割完成') {
                updateProcessingStep(document.id, '题目分割', 'completed', 100);
              } else if (step === 'AI处理开始') {
                updateProcessingStep(document.id, 'AI处理', 'processing', p);
              } else if (step === 'AI处理完成') {
                updateProcessingStep(document.id, 'AI处理', 'completed', 100);
              } else if (step === '开始处理TeX') {
                updateProcessingStep(document.id, '文件上传', 'completed', 100);
              } else if (step === 'AI解析') {
                updateProcessingStep(document.id, 'DeepSeek AI解析', 'processing', p);
              } else if (step === 'AI解析完成') {
                updateProcessingStep(document.id, 'DeepSeek AI解析', 'completed', 100);
                updateProcessingStep(document.id, '题目识别', 'completed', 100);
                updateProcessingStep(document.id, '结果优化', 'completed', 100);
              }
            } else if (data?.type === 'completed') {
              updateProcessingStep(document.id, '结果优化', 'completed', 100);
            } else if (data?.type === 'cancelled') {
              updateDocumentProgress(document.id, { status: 'cancelled' });
              try { es.close(); } catch {}
              delete progressEventSourcesRef.current[document.id];
            }
          } catch (error) {
            console.error('SSE事件解析失败:', error);
          }
        };
        es.onerror = () => {
          try { es.close(); } catch {}
          delete progressEventSourcesRef.current[document.id];
        };
      } catch {}

      const response = await fetch(`${apiBaseUrl}/mathpix-optimized/process-pdf-optimized`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Doc-Id': document.id
        },
        body: formData
      });
      
      if (!response.ok) {
        let errorMessage = `PDF处理失败: ${response.status} ${response.statusText}`;
        
        // 根据状态码提供更友好的错误信息
        if (response.status === 413) {
          errorMessage = '文件过大，请压缩PDF文件或选择较小的文件';
        } else if (response.status === 401) {
          errorMessage = '认证失败，请重新登录';
        } else if (response.status === 403) {
          errorMessage = '权限不足，无法处理此文件';
        } else if (response.status === 429) {
          errorMessage = '请求过于频繁，请稍后再试';
        } else if (response.status >= 500) {
          errorMessage = '服务器内部错误，请稍后再试';
        }
        
        throw new Error(errorMessage);
      }

      // 检查响应内容类型
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.warn('响应内容类型不是JSON:', contentType);
      }

      // 获取响应文本并使用智能解析
      const responseText = await response.text();
      const result = parseResponseJSON(responseText, 'PDF处理API');

      // 验证结果格式
      if (!result || typeof result !== 'object') {
        throw new Error('后端返回的数据格式不正确');
      }

      // 计算实际处理时间
      const processingTime = Date.now() - startTime;
      
      // 注意：进度更新现在完全由SSE事件控制，不再在这里强制更新
      
      // 更新预估时间（基于实际处理时间）
      if (result.processingTime) {
        updateDocumentProgress(document.id, {
          estimatedTime: Math.round(result.processingTime / 1000) // 转换为秒
        });
      }
      
      // 显示实时处理信息
      const processingInfo = {
        totalTime: Math.round(processingTime / 1000),
        questionsCount: result.totalCount || 0,
        choiceCount: result.choiceCount || 0,
        fillCount: result.fillCount || 0,
        solutionCount: result.solutionCount || 0,
        averageTimePerQuestion: result.averageTimePerQuestion ? Math.round(result.averageTimePerQuestion / 1000) : 0
      };
      
      updateDocumentProgress(document.id, { 
        status: 'completed', 
        processingProgress: 100,
        processTime: new Date(),
        processingInfo
      });
      try { progressEventSourcesRef.current[document.id]?.close(); } catch {}
      delete progressEventSourcesRef.current[document.id];
      
      // 处理后端返回的真实题目数据，转换为标准Question结构
      const questions = (result.questions || []).map((q: any, index: number) => ({
        _id: `temp-${document.id}-Q${index + 1}`,  // 临时ID
        id: `${document.id}-Q${index + 1}`,        // 本地ID
        qid: `temp-${document.id}-Q${index + 1}`,  // 临时题目ID
        bid: '',  // 待分配题库ID
        type: q.type || 'solution',
        content: {
          stem: q.content || '',  // 题干
          options: q.options?.map((opt: string) => ({
            text: opt,
            isCorrect: false  // 需要AI判断或用户设置
          })) || [],
          answer: '',  // 需要AI生成或用户输入
          fillAnswers: q.blanks ? new Array(q.blanks).fill('') : [],
          solutionAnswers: [],
          solution: ''  // 需要AI生成或用户输入
        },
        category: q.category || [],
        tags: q.tags || ['待分类'],
        source: document.fileName,
        creator: null,  // 待设置
        questionBank: '',  // 待设置
        status: 'draft',
        difficulty: q.difficulty || 3,
        views: 0,
        favorites: [],
        images: [],
        tikzCodes: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isSelected: false,
        isEditing: false
      }));

      // 使用后端返回的真实数据
      updateDocumentProgress(document.id, { 
        questions,
        confidence: result.confidence || (result.totalCount > 0 ? 0.95 : 0.5),
        originalContent: result.sections?.originalContent,
        processedContent: result.sections?.processedContent
      });

      // 添加题目到全局列表
      setAllQuestions(prev => [...prev, ...questions]);

      // 保存到历史记录，包含真实的后端数据
      saveToHistory({
        ...document,
        questions,
        confidence: result.confidence || (result.totalCount > 0 ? 0.95 : 0.5),
        processTime: new Date(),
        originalContent: result.sections?.originalContent,
        processedContent: result.sections?.processedContent
      });

      // 如果有题目，延迟显示草稿提醒
      if (questions.length > 0) {
        setTimeout(() => {
          setShowDraftReminder(true);
        }, 3000); // 3秒后显示提醒
      }
      
    } catch (error: any) {
      console.error('PDF处理失败:', error);
      updateProcessingStep(document.id, '文档解析', 'failed', 0, error.message);
      updateDocumentProgress(document.id, { 
        status: 'failed', 
        error: error.message || 'PDF处理失败'
      });
      try { progressEventSourcesRef.current[document.id]?.close(); } catch {}
      delete progressEventSourcesRef.current[document.id];
      throw error;
    }
  };



  // 处理TeX文件
  const processTeXFile = async (document: DocumentItem, formData: FormData) => {
    updateDocumentProgress(document.id, { status: 'processing' });
    
    // 初始化所有处理步骤 - TeX处理流程更简单
    updateProcessingStep(document.id, '文件上传', 'completed', 100);
    updateProcessingStep(document.id, 'DeepSeek AI解析', 'processing', 0);
    updateProcessingStep(document.id, '题目识别', 'processing', 0);
    updateProcessingStep(document.id, '结果优化', 'processing', 0);
    
    // 从Zustand持久化数据中获取token
    const authStorage = localStorage.getItem('auth-storage');
    let token = '';
    if (authStorage) {
      try {
        const authData = JSON.parse(authStorage);
        if (authData.state && authData.state.token) {
          token = authData.state.token;
        }
      } catch (error) {
        console.error('Failed to parse auth storage:', error);
      }
    }
    
    try {
      // 打开SSE进度订阅
      try {
        const apiBaseUrl = import.meta.env.VITE_API_URL || 'https://www.mareate.com/api';
        const es = new EventSource(`${apiBaseUrl}/mathpix-optimized/progress/${document.id}`);
        progressEventSourcesRef.current[document.id] = es;
        es.onmessage = (evt) => {
          try {
            const data = JSON.parse(evt.data);
            // SSE收到事件
            
            if (data?.type === 'status') {
              const step = data.step || '';
              const p = typeof data.progress === 'number' ? data.progress : 0;
              
              // 精确匹配后端发送的步骤名称
              if (step === '开始处理PDF') {
                updateProcessingStep(document.id, '文件上传', 'completed', 100);
              } else if (step === '提取') {
                updateProcessingStep(document.id, '提取', 'processing', p);
              } else if (step === '提取完成') {
                updateProcessingStep(document.id, '提取', 'completed', 100);
              } else if (step === '题目分割完成') {
                updateProcessingStep(document.id, '题目分割', 'completed', 100);
              } else if (step === 'AI处理开始') {
                updateProcessingStep(document.id, 'AI处理', 'processing', p);
              } else if (step === 'AI处理完成') {
                updateProcessingStep(document.id, 'AI处理', 'completed', 100);
              } else if (step === '开始处理TeX') {
                updateProcessingStep(document.id, '文件上传', 'completed', 100);
              } else if (step === 'AI解析') {
                updateProcessingStep(document.id, 'DeepSeek AI解析', 'processing', p);
              } else if (step === 'AI解析完成') {
                updateProcessingStep(document.id, 'DeepSeek AI解析', 'completed', 100);
                updateProcessingStep(document.id, '题目识别', 'completed', 100);
                updateProcessingStep(document.id, '结果优化', 'completed', 100);
              }
            } else if (data?.type === 'completed') {
              updateProcessingStep(document.id, '结果优化', 'completed', 100);
            } else if (data?.type === 'cancelled') {
              updateDocumentProgress(document.id, { status: 'cancelled' });
              try { es.close(); } catch {}
              delete progressEventSourcesRef.current[document.id];
            }
          } catch (error) {
            console.error('SSE事件解析失败:', error);
          }
        };
        es.onerror = () => {
          try { es.close(); } catch {}
          delete progressEventSourcesRef.current[document.id];
        };
      } catch {}
      
      // 记录开始时间
      const startTime = Date.now();
      
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://www.mareate.com/api'}/mathpix-optimized/process-tex`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Doc-Id': document.id
        },
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`TeX文件处理失败: ${response.status} ${response.statusText}`);
      }

      // 检查响应内容类型
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.warn('响应内容类型不是JSON:', contentType);
      }

      // 获取响应文本并使用智能解析
      const responseText = await response.text();
      const result = parseResponseJSON(responseText, 'TeX处理API');

      // 验证结果格式
      if (!result || typeof result !== 'object') {
        throw new Error('后端返回的数据格式不正确');
      }
      
      // 计算实际处理时间
      const processingTime = Date.now() - startTime;
      
      // 注意：进度更新现在完全由SSE事件控制，不再在这里强制更新
      
      // 更新预估时间（基于实际处理时间）
      if (result.processingTime) {
        updateDocumentProgress(document.id, {
          estimatedTime: Math.round(result.processingTime / 1000) // 转换为秒
        });
      }
      
      // 显示实时处理信息
      const processingInfo = {
        totalTime: Math.round(processingTime / 1000),
        questionsCount: result.totalCount || 0,
        choiceCount: result.choiceCount || 0,
        fillCount: result.fillCount || 0,
        solutionCount: result.solutionCount || 0,
        averageTimePerQuestion: result.averageTimePerQuestion ? Math.round(result.averageTimePerQuestion / 1000) : 0
      };
      
      updateDocumentProgress(document.id, { 
        status: 'completed', 
        processingProgress: 100,
        processTime: new Date(),
        processingInfo
      });
      try { progressEventSourcesRef.current[document.id]?.close(); } catch {}
      delete progressEventSourcesRef.current[document.id];
      
      // 处理后端返回的真实题目数据，转换为标准Question结构
      const questions = (result.questions || []).map((q: any, index: number) => ({
        _id: `temp-${document.id}-Q${index + 1}`,  // 临时ID
        id: `${document.id}-Q${index + 1}`,        // 本地ID
        qid: `temp-${document.id}-Q${index + 1}`,  // 临时题目ID
        bid: '',  // 待分配题库ID
        type: q.type || 'solution',
        content: {
          stem: q.content || '',  // 题干
          options: q.options?.map((opt: string) => ({
            text: opt,
            isCorrect: false  // 需要AI判断或用户设置
          })) || [],
          answer: '',  // 需要AI生成或用户输入
          fillAnswers: q.blanks ? new Array(q.blanks).fill('') : [],
          solutionAnswers: [],
          solution: ''  // 需要AI生成或用户输入
        },
        category: q.category || [],
        tags: q.tags || ['待分类'],
        source: document.fileName,
        creator: null,  // 待设置
        questionBank: '',  // 待设置
        status: 'draft',
        difficulty: q.difficulty || 3,
        views: 0,
        favorites: [],
        images: [],
        tikzCodes: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isSelected: false,
        isEditing: false
      }));

      // 使用后端返回的真实数据
      updateDocumentProgress(document.id, { 
        questions,
        confidence: result.confidence || (result.totalCount > 0 ? 0.95 : 0.5),
        originalContent: result.sections?.originalContent,
        processedContent: result.sections?.processedContent
      });

      // 添加题目到全局列表
      setAllQuestions(prev => [...prev, ...questions]);

      // 保存到历史记录
      saveToHistory({
        ...document,
        questions,
        confidence: result.confidence || (result.totalCount > 0 ? 0.95 : 0.5),
        processTime: new Date(),
        originalContent: result.sections?.originalContent,
        processedContent: result.sections?.processedContent
      });

      // 如果有题目，延迟显示草稿提醒
      if (questions.length > 0) {
        setTimeout(() => {
          setShowDraftReminder(true);
        }, 3000);
      }
      
    } catch (error: any) {
      console.error('TeX处理失败:', error);
      updateProcessingStep(document.id, '文档解析', 'failed', 0, error.message);
      updateDocumentProgress(document.id, { 
        status: 'failed', 
        error: error.message || 'TeX文件处理失败'
      });
      try { progressEventSourcesRef.current[document.id]?.close(); } catch {}
      delete progressEventSourcesRef.current[document.id];
      throw error;
    }
  };

  // 拖拽处理
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    files.forEach(file => {
      const validTypes = ['application/pdf', 'text/plain'];
      const validExtensions = ['.pdf', '.tex'];
      
      if (validTypes.some(type => file.type.includes(type)) || 
          validExtensions.some(ext => file.name.toLowerCase().endsWith(ext))) {
        handleFileUpload(file);
      } else {
        showErrorRightSlide('文件类型错误', `不支持的文件类型: ${file.name}`);
      }
    });
  }, [handleFileUpload]);

  // 新增：删除/取消文档功能
  const handleDeleteDocument = useCallback(async (docId: string) => {
    const document = documents.find(d => d.id === docId);
    if (!document) return;

    const isProcessing = document.status === 'processing' || document.status === 'uploading';
    const confirmMessage = isProcessing 
      ? '确定要取消这个文档的处理吗？' 
      : '确定要删除这个文档吗？此操作不可撤销.';

    showConfirm(
      '确认操作',
      confirmMessage,
      async () => {
      try {
        // 如果文档正在处理，先尝试取消后端处理
        if (isProcessing) {
          const authStorage = localStorage.getItem('auth-storage');
          let token = '';
          if (authStorage) {
            try {
              const authData = JSON.parse(authStorage);
              if (authData.state && authData.state.token) {
                token = authData.state.token;
              }
            } catch (error) {
              console.error('Failed to parse auth storage:', error);
            }
          }

          // 发送取消请求到后端
          try {
            await fetch(`${import.meta.env.VITE_API_URL || 'https://www.mareate.com/api'}/mathpix-optimized/cancel/${docId}`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });
          } catch (error) {
            console.error('取消后端处理失败:', error);
            // 即使后端取消失败，也要继续删除本地状态
          }
          // 关闭事件源
          try { progressEventSourcesRef.current[docId]?.close(); } catch {}
          delete progressEventSourcesRef.current[docId];
        }

        // 删除本地状态
        setDocuments(prev => prev.filter(doc => doc.id !== docId));
        setAllQuestions(prev => prev.filter(q => q.id.split('-Q')[0] !== docId));

      } catch (error) {
        console.error('删除文档失败:', error);
        // 即使出错也要删除本地状态
        setDocuments(prev => prev.filter(doc => doc.id !== docId));
        setAllQuestions(prev => prev.filter(q => q.id.split('-Q')[0] !== docId));
      }
      
      // 关闭确认弹窗
      closeConfirm();
    });
  }, [documents, closeConfirm]);



  const handleResumeDocument = useCallback((docId: string) => {
    updateDocumentProgress(docId, { status: 'processing' });
    
    // 重新加入处理队列
  }, []);

  const handleRetryDocument = useCallback(async (docId: string) => {
    const document = documents.find(d => d.id === docId);
    if (!document) return;

    const retryCount = (document.retryCount || 0) + 1;
    if (retryCount > (document.maxRetries || 3)) {
      showErrorRightSlide('重试失败', '已达到最大重试次数');
      return;
    }

    updateDocumentProgress(docId, { 
      status: 'retrying',
      retryCount,
      error: undefined
    });

    // 重置处理步骤
    updateProcessingStep(docId, '文件上传', 'pending', 0);
    updateProcessingStep(docId, '文档解析', 'pending', 0);
    updateProcessingStep(docId, '题目分割', 'pending', 0);
    updateProcessingStep(docId, 'AI处理', 'pending', 0);
    updateProcessingStep(docId, '结果优化', 'pending', 0);

    try {
      // 这里可以重新处理文档
      // 暂时模拟重试成功
      setTimeout(() => {
        updateDocumentProgress(docId, { status: 'processing' });
      }, 1000);
    } catch (error: any) {
      updateDocumentProgress(docId, { 
        status: 'failed', 
        error: error.message || '重试失败'
      });
    }
  }, [documents, updateDocumentProgress, updateProcessingStep]);



  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* 头部标题栏 */}
      <div className="sticky top-0 z-30 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 dark:from-gray-100 to-blue-600 dark:to-blue-400 bg-clip-text text-transparent">
                智能批量上传
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">AI驱动的文档智能解析，支持PDF、TeX一键识别题目并批量导入题库</p>
            </div>
            <motion.div 
              className="flex items-center space-x-4"
              layout
            >
              {/* 上传统计面板 */}
              <motion.div 
                className="flex items-center space-x-3"
                layout
              >
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ 
                    duration: 0.4,
                    delay: 0.1,
                    ease: [0.25, 0.1, 0.25, 1]
                  }}
                  className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl px-4 py-2 border border-blue-200 dark:border-blue-700 shadow-sm hover:shadow-md transition-shadow duration-200"
                >
                  <motion.div 
                    className="flex items-center space-x-2"
                    layout
                  >
                    <motion.div 
                      className="w-2 h-2 bg-blue-500 rounded-full"
                      animate={{ 
                        scale: [1, 1.2, 1],
                        opacity: [0.7, 1, 0.7]
                      }}
                      transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                    <motion.span 
                      className="text-sm font-medium text-blue-700 dark:text-blue-300"
                      layout
                      key={`uploaded-${documents.length}`}
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ 
                        duration: 0.3,
                        ease: "easeOut"
                      }}
                    >
                      已上传: {documents.length} 个文档
                    </motion.span>
                  </motion.div>
                </motion.div>
                
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ 
                    duration: 0.4,
                    delay: 0.2,
                    ease: [0.25, 0.1, 0.25, 1]
                  }}
                  className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl px-4 py-2 border border-green-200 dark:border-green-700 shadow-sm hover:shadow-md transition-shadow duration-200"
                >
                  <motion.div 
                    className="flex items-center space-x-2"
                    layout
                  >
                    <motion.div 
                      className="w-2 h-2 bg-green-500 rounded-full"
                      animate={{ 
                        scale: [1, 1.2, 1],
                        opacity: [0.7, 1, 0.7]
                      }}
                      transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                    <motion.span 
                      className="text-sm font-medium text-green-700 dark:text-green-300"
                      layout
                      key={`questions-${allQuestions.length}`}
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ 
                        duration: 0.3,
                        ease: "easeOut"
                      }}
                    >
                      识别题目: {allQuestions.length} 道
                    </motion.span>
                  </motion.div>
                </motion.div>
              </motion.div>

              {/* 快速操作按钮 */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.4 }}
                className="flex space-x-2"
              >
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowHistory(true)}
                  className="flex items-center space-x-2"
                >
                  <History className="h-4 w-4" />
                  <span>历史记录</span>
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDraftManager(true)}
                  className="flex items-center space-x-2"
                >
                  <Save className="h-4 w-4" />
                  <span>草稿管理</span>
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* 内容区域 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* 快速统计卡片 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <FileUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">已上传文档</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{documents.length}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <Target className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">识别题目</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{allQuestions.length}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Brain className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">AI处理中</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {documents.filter(d => d.status === 'processing').length}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center">
              <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <Database className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">题目集草稿</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{drafts.length}</p>
              </div>
            </div>
          </Card>
        </motion.div>





        {/* 文件上传区域 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <Card className="p-8">
            <div className="text-center mb-8">
              <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
                <Upload className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">文档上传</h2>
              <p className="text-gray-600 dark:text-gray-400">支持 PDF、TeX 格式，拖拽或点击上传</p>
            </div>
            
            <div
              className={`border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 ${
                isDragging 
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                  : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-3">
                    {isDragging ? '释放文件开始上传' : '拖拽文件到这里或点击上传'}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    支持 PDF、TeX 格式，单文件最大 50MB
                  </p>
                </div>
                
                <div className="flex items-center justify-center space-x-8 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-5 w-5 text-red-500" />
                    <span>PDF</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <FileText className="h-5 w-5 text-green-500" />
                    <span>TeX</span>
                  </div>
                </div>
                
                <input
                  type="file"
                  multiple
                  accept=".pdf,.tex"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    files.forEach(handleFileUpload);
                  }}
                  className="hidden"
                  id="file-upload"
                />
                <Button
                  onClick={() => document.getElementById('file-upload')?.click()}
                  size="lg"
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  选择文件
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* 文档管理区域 */}
        <AnimatePresence>
          {documents.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: 0.4 }}
              className="mb-8"
            >
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-semibold flex items-center text-gray-900 dark:text-gray-100">
                      <FileText className="mr-2 h-5 w-5 text-blue-600 dark:text-blue-400" />
                      文档管理
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                      共 {documents.length} 个文档，
                      {documents.filter(d => d.status === 'completed').length} 个已完成，
                      {documents.filter(d => d.status === 'processing' || d.status === 'uploading').length} 个处理中
                    </p>
                  </div>
                  
                  {/* 全局处理状态 */}
                  {globalProcessingStatus.isProcessing && (
                    <div className="flex items-center space-x-4">
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        总进度: {globalProcessingStatus.completedDocuments}/{globalProcessingStatus.totalDocuments}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        预估剩余: {formatTime(globalProcessingStatus.estimatedTotalTime)}
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <AnimatePresence>
                    {documents.map((doc, index) => (
                      <motion.div
                        key={doc.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ delay: index * 0.05 }}
                        className="group"
                      >
                        {/* 使用新的进度显示组件 */}
                        {doc.status === 'completed' ? (
                          <ProcessingResultPreview
                            document={doc}
                            onViewDetails={() => {
                              navigate('/batch-upload/preview-edit', {
                                state: {
                                  questions: doc.questions,
                                  documentInfo: {
                                    id: doc.id,
                                    fileName: doc.fileName,
                                    fileType: doc.fileType,
                                    confidence: doc.confidence,
                                    processTime: doc.processTime
                                  }
                                }
                              });
                            }}
                            onDownload={() => {
                              // 下载处理结果
                              const dataStr = JSON.stringify(doc.questions, null, 2);
                              const dataBlob = new Blob([dataStr], { type: 'application/json' });
                              const url = URL.createObjectURL(dataBlob);
                              const link = document.createElement('a');
                              link.href = url;
                              link.download = `${doc.fileName}_questions.json`;
                              link.click();
                              URL.revokeObjectURL(url);
                            }}
                            onShare={() => {
                              // 分享功能
                              navigator.clipboard.writeText(
                                `文档 "${doc.fileName}" 处理完成，共识别 ${doc.questions.length} 道题目`
                              );
                              showSuccessRightSlide('复制成功', '处理结果已复制到剪贴板');
                            }}
                          />
                        ) : doc.status === 'failed' ? (
                          <div className="space-y-4">
                            <ProcessingProgressCard
                              document={doc}
                              onDelete={handleDeleteDocument}
                              onResume={handleResumeDocument}
                              onRetry={handleRetryDocument}
                            />
                            <ErrorDisplay
                              error={doc.error || '处理失败'}
                              errorType="processing"
                              onRetry={() => handleRetryDocument(doc.id)}
                              onHelp={() => {
                                window.open('https://support.example.com', '_blank');
                              }}
                              showDetails={true}
                            />
                          </div>
                        ) : (
                          <ProcessingProgressCard
                            document={doc}
                            onDelete={handleDeleteDocument}
                            onResume={handleResumeDocument}
                            onRetry={handleRetryDocument}
                          />
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 历史记录侧边栏 */}
        <AnimatePresence>
          {showHistory && (
            <>
              {/* 背景遮罩 */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 z-50"
                onClick={() => setShowHistory(false)}
              />
              
              {/* 侧边栏 */}
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'tween', duration: 0.3 }}
                className="fixed top-0 right-0 h-full w-96 bg-white dark:bg-gray-800 shadow-xl z-50 overflow-hidden flex flex-col"
              >
                {/* 侧边栏头部 */}
                <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold flex items-center">
                        <History className="mr-2 h-5 w-5" />
                        上传历史
                      </h3>
                      <p className="text-sm opacity-90">共 {uploadHistory.length} 条记录</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowHistory(false)}
                      className="text-white border-white hover:bg-white/20"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* 历史记录操作栏 */}
                {uploadHistory.length > 0 && (
                  <div className="p-4 border-b bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        最近 {uploadHistory.length} 条记录
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          showConfirm(
                            '清空历史记录',
                            '确定要清空所有历史记录和当前会话吗？这将清除所有上传的文件和题目.',
                            () => {
                              // 用户确认后才执行清空操作
                              clearHistory();
                              clearCurrentSession();
                              closeConfirm();
                            }
                          );
                        }}
                        className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        清空全部
                      </Button>
                    </div>
                  </div>
                )}

                {/* 历史记录列表 */}
                <div className="flex-1 overflow-y-auto">
                  {uploadHistory.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
                      <History className="h-16 w-16 mb-4 opacity-30" />
                      <h4 className="text-lg font-medium mb-2">暂无历史记录</h4>
                      <p className="text-sm text-center px-4">
                        上传并处理完成的文档会自动保存到这里
                      </p>
                    </div>
                  ) : (
                    <div className="p-4 space-y-3">
                      <AnimatePresence>
                        {uploadHistory.map((historyDoc, index) => (
                          <motion.div
                            key={`${historyDoc.id}-${index}`}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ delay: index * 0.05 }}
                            className="group"
                          >
                            <Card className="p-3 hover:shadow-md transition-all duration-200">
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <div className="flex-1 min-w-0">
                                    <div className="group relative">
                                      <span className="font-medium text-sm truncate block text-gray-900 dark:text-gray-100" title={historyDoc.fileName}>
                                        {historyDoc.fileName}
                                      </span>
                                      {/* 悬停显示完整文件名 */}
                                      <div className="absolute bottom-full left-0 mb-2 px-3 py-2 bg-gray-900 dark:bg-gray-700 text-white dark:text-gray-100 text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-[9999] max-w-xs break-words">
                                        {historyDoc.fileName}
                                        <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900 dark:border-t-gray-700"></div>
                                      </div>
                                    </div>
                                  </div>
                                  <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0 ml-2">
                                    {historyDoc.questions.length}题
                                  </span>
                                </div>
                                
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  {new Date(historyDoc.uploadTime).toLocaleString()}
                                </div>
                                
                                <div className="flex items-center justify-between">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      restoreFromHistory(historyDoc);
                                      setShowHistory(false);
                                    }}
                                    className="text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-xs px-2 py-1"
                                  >
                                    <Plus className="h-3 w-3 mr-1" />
                                    恢复
                                  </Button>
                                  
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedHistoryDoc(historyDoc);
                                      setShowHistoryDetail(true);
                                    }}
                                    className="text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 text-xs px-2 py-1"
                                  >
                                    <Eye className="h-3 w-3 mr-1" />
                                    详情
                                  </Button>
                                </div>
                                
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    showConfirm(
                                      '删除历史记录',
                                      `确定要删除历史记录 "${historyDoc.fileName}" 吗？`,
                                      () => {
                                        // 先关闭模态框
                                        closeConfirm();
                                        setUploadHistory(prev => {
                                          const newHistory = prev.filter((_, i) => i !== index);
                                          localStorage.setItem('batchUploadHistory', JSON.stringify(newHistory));
                                          return newHistory;
                                        });
                                      }
                                    );
                                  }}
                                  className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 text-xs px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </Card>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  )}
                </div>
                
                {/* 侧边栏底部 */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                  <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                    <p>历史记录保存在本地存储中</p>
                    <p>最多保留 50 条记录</p>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* 草稿管理器 */}
        <DraftManager
          isOpen={showDraftManager}
          onClose={() => setShowDraftManager(false)}
          onEnterEdit={handleEnterEdit}
          onUserSaveDraft={handleUserSaveDraft}
          onDraftSaved={handleDraftSaved}
        />

        {/* 草稿提醒模态框 */}
        <DraftReminderModal
          isOpen={showDraftReminder}
          onClose={() => setShowDraftReminder(false)}
          onSaveSuccess={handleDraftSaveSuccess}
          questionCount={allQuestions.length}
        />

        {/* 上传历史详情 */}
        <PaperHistoryDetail
          isOpen={showHistoryDetail}
          onClose={() => {
            setShowHistoryDetail(false);
            setSelectedHistoryDoc(null);
          }}
          historyDoc={selectedHistoryDoc}
        />

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
    </div>
  );
};

export default BatchUploadPage;