import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Minus, Target, BookOpen, ChevronDown, Camera, Brain, Check, Plus, Upload, ChevronUp, ChevronDown as ChevronDownIcon, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { questionAPI, questionBankAPI, questionAnalysisAPI } from '../../services/api';
import type { CreateQuestionRequest, QuestionBank, SimilarityResult } from '../../types';
import SimilarityDetectionModal from '../../components/similarity/SimilarityDetectionModal';
import { useAuthStore } from '../../stores/authStore';
import Button from '../../components/ui/Button';
import { 
  LaTeXEditor, 
  HoverTooltip,
  QuestionTypeSelector,
  KnowledgeTagSelector,
  QuestionSourceSelector,
  MultiQuestionUploader,
  MultiQuestionEditor
} from '../../components/editor';
import { IntegratedMediaEditor, MediaContentPreview, SimpleMediaPreview } from '../../components/question';
import OCRUploader from '../../components/math/OCRUploader';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import { renderContent } from '../../lib/latex/utils/renderContent';
import LoadingPage from '../../components/ui/LoadingPage';
import 'katex/dist/katex.min.css';
import ConfirmModal from '../../components/ui/ConfirmModal';
import RightSlideModal from '../../components/ui/RightSlideModal';
import { useModal } from '../../hooks/useModal';
import { useTranslation } from '../../hooks/useTranslation';

interface QuestionContent {
  stem: string;
  options?: string[];
  answer: string;
  fillAnswers?: string[]; // 填空题答案数组
  solutionAnswers?: string[]; // 解答题答案数组
  solution?: string;
  difficulty?: number;
  tags?: string[];
  category?: string[]; // 改为数组以支持多个小题型
  source?: string;
}

const CreateQuestionPage: React.FC = () => {
  const { bid } = useParams<{ bid: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const { t } = useTranslation();
  const [questionType, setQuestionType] = useState<'choice' | 'multiple-choice' | 'fill' | 'solution'>('choice');
  const [content, setContent] = useState<QuestionContent>({
      stem: '',
    options: ['', '', '', ''],
    answer: '',
    solution: '',
    difficulty: 3,
    tags: [],
    category: [],
    source: ''
  });
  
  // 图片相关状态
  const [images, setImages] = useState<Array<{
    id: string;
    bid: string;
    url: string;
    filename: string;
    order: number;
    format: string;
    uploadedAt: Date;
    uploadedBy: string;
  }>>([]);
  
  // TikZ 图形相关状态
  const [tikzCodes, setTikzCodes] = useState<Array<{
    id: string;
    code: string;
    format: 'svg' | 'png';
    order: number;
  }>>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'stem' | 'solution' | 'media'>('stem');
  const [questionBanks, setQuestionBanks] = useState<QuestionBank[]>([]);
  const [selectedBankId, setSelectedBankId] = useState<string>('');
  const [showBankDropdown, setShowBankDropdown] = useState(false);
  const [loadingBanks, setLoadingBanks] = useState(false);
  
  // OCR相关状态
  const [showOCRUploader, setShowOCRUploader] = useState(false);
  const [ocrError, setOcrError] = useState<string>('');
  
  // 智能分析相关状态
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string>('');

  // 多题目上传相关状态
  const [isMultiMode, setIsMultiMode] = useState(false);
  const [multiQuestions, setMultiQuestions] = useState<any[]>([]);

  // 标题栏伸缩状态
  const [isHeaderExpanded, setIsHeaderExpanded] = useState(false);
  
  // 右侧标签区域缩放状态
  const [isRightPanelCollapsed, setIsRightPanelCollapsed] = useState(false);

  // 相似度检测相关状态
  const [showSimilarityModal, setShowSimilarityModal] = useState(false);
  const [similarQuestions, setSimilarQuestions] = useState<SimilarityResult[]>([]);
  const [pendingQuestionData, setPendingQuestionData] = useState<any>(null);
  
  // 权限错误提示状态
  const [permissionError, setPermissionError] = useState<string>('');
  const [isLoadingDetailedSimilarity, setIsLoadingDetailedSimilarity] = useState(false);
  
  // 实时相似度检测状态
  const [isDetectingSimilarity, setIsDetectingSimilarity] = useState(false);
  const [similarityWarning, setSimilarityWarning] = useState<{
    hasSimilar: boolean;
    similarCount: number;
    maxSimilarity: number;
  } | null>(null);
  const [detectionTimeout, setDetectionTimeout] = useState<NodeJS.Timeout | null>(null);

  // 弹窗状态管理
  const { 
    showConfirm, 
    confirmModal, 
    closeConfirm,
    showRightSlide,
    showSuccessRightSlide,
    showErrorRightSlide,
    rightSlideModal,
    closeRightSlide
  } = useModal();

  // 多题目上传处理函数
  const handleMultiQuestionsGenerated = (questions: any[]) => {
    setMultiQuestions(questions);
    showSuccessRightSlide(t('questionBankPage.CreateQuestionPage.success.multiQuestionsGenerated', { count: questions.length }), t('questionBankPage.CreateQuestionPage.success.multiQuestionsGenerated', { count: questions.length }));
  };

  const handleMultiQuestionsUpdate = (questions: any[]) => {
    setMultiQuestions(questions);
  };

  const handleMultiQuestionsSave = async (_questions: any[]) => {
    // 保存成功后退出多题目模式
    setIsMultiMode(false);
    setMultiQuestions([]);
    
    // 显示成功提示
    showSuccessRightSlide(t('questionBankPage.CreateQuestionPage.success.multiQuestionsSaved'), t('questionBankPage.CreateQuestionPage.success.multiQuestionsSaved'));
    
    // 根据来源决定返回路径
    if (bid) {
      navigate(`/question-banks/${selectedBankId}`);
    } else {
      navigate('/questions');
    }
  };

  // 相似度检测相关处理函数
  const handleSimilarityContinue = async () => {
    if (!pendingQuestionData) return;
    
    setIsSaving(true);
    try {
      // 直接创建题目，不进行相似度检测
      await questionAPI.createQuestion(selectedBankId, pendingQuestionData);
      
      // 关闭弹窗
      setShowSimilarityModal(false);
      setSimilarQuestions([]);
      setPendingQuestionData(null);
      
      // 显示成功提示
      showSuccessRightSlide(t('questionBankPage.CreateQuestionPage.success.multiQuestionsSaved'), t('questionBankPage.CreateQuestionPage.success.multiQuestionsSaved'));
      
      // 根据来源决定返回路径
      if (bid) {
        navigate(`/question-banks/${selectedBankId}`);
      } else {
        navigate('/questions');
      }
    } catch (error) {
      // 创建题目失败
      showErrorRightSlide(t('questionBankPage.CreateQuestionPage.errors.saveFailed'), t('questionBankPage.CreateQuestionPage.errors.saveFailed'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleSimilarityCancel = () => {
    setShowSimilarityModal(false);
    setSimilarQuestions([]);
    setPendingQuestionData(null);
  };

  // 实时相似度检测函数
  const detectSimilarityRealTime = async (stem: string) => {
    if (!stem.trim() || stem.trim().length < 10) {
      setSimilarityWarning(null);
      return;
    }

    setIsDetectingSimilarity(true);
    try {
      const response = await questionAPI.detectSimilarityRealTime({
        stem: stem.trim(),
        type: 'choice', // 固定值，不影响检测
        difficulty: 3   // 固定值，不影响检测
      });

      if (response.data?.hasSimilar && response.data?.maxSimilarity > 0.6) {
        setSimilarityWarning({
          hasSimilar: true,
          similarCount: response.data.similarCount,
          maxSimilarity: response.data.maxSimilarity
        });
        
        // 显示相似度警告
        showRightSlide(
          t('questionBankPage.CreateQuestionPage.status.similarityWarning', { count: response.data.similarCount, percentage: (response.data.maxSimilarity * 100).toFixed(1) }), 
          t('questionBankPage.CreateQuestionPage.status.similarityWarning', { count: response.data.similarCount, percentage: (response.data.maxSimilarity * 100).toFixed(1) }),
          { type: 'warning' }
        );
      } else {
        setSimilarityWarning(null);
      }
    } catch (error) {
      // 实时相似度检测失败
      setSimilarityWarning(null);
      showErrorRightSlide(t('questionBankPage.CreateQuestionPage.errors.similarityDetectionFailed'), t('questionBankPage.CreateQuestionPage.errors.similarityDetectionFailed'));
    } finally {
      setIsDetectingSimilarity(false);
    }
  };

  // 显示详细相似度检测结果
  const showDetailedSimilarity = async () => {
    if (!content.stem.trim()) return;

    setIsLoadingDetailedSimilarity(true);
    try {
      // 先准备题目数据，这样模态框可以立即显示
      const questionData = {
        type: questionType,
        content: {
          stem: content.stem,
          answer: content.answer,
          options: (questionType === 'choice' || questionType === 'multiple-choice') ? content.options?.map((option, index) => ({
            text: option,
            isCorrect: content.answer.includes(String.fromCharCode(65 + index))
          })) : undefined
        },
        category: content.category || [],
        tags: content.tags,
        difficulty: content.difficulty || 3,
        source: content.source
      };

      setPendingQuestionData(questionData);
      
      // 立即显示模态框，让用户看到加载状态
      setShowSimilarityModal(true);

      const response = await questionAPI.detectSimilarity({
        stem: content.stem.trim(),
        type: 'choice', // 固定值，不影响检测
        difficulty: 3,  // 固定值，不影响检测
        category: [],   // 固定值，不影响检测
        tags: content.tags || [],
        threshold: 0.6
      });

      if (response.data?.similarQuestions && response.data.similarQuestions.length > 0) {
        setSimilarQuestions(response.data.similarQuestions);
      } else {
        // 如果没有相似题目，关闭模态框
        setShowSimilarityModal(false);
        setPendingQuestionData(null);
      }
    } catch (error) {
      // 获取详细相似度检测失败
      // 错误时关闭模态框
      setShowSimilarityModal(false);
      setPendingQuestionData(null);
      showErrorRightSlide(t('questionBankPage.CreateQuestionPage.errors.similarityDetectionFailed'), t('questionBankPage.CreateQuestionPage.errors.similarityDetectionFailed'));
    } finally {
      setIsLoadingDetailedSimilarity(false);
    }
  };

  // 退出多题目模式
  const handleExitMultiMode = () => {
    if (multiQuestions.length > 0) {
      showConfirm(
        t('questionBankPage.CreateQuestionPage.confirm.exitMultiMode'),
        t('questionBankPage.CreateQuestionPage.confirm.exitMultiModeMessage'),
        () => {
          // 先关闭模态框
          closeConfirm();
          // 然后执行操作
          setIsMultiMode(false);
          setMultiQuestions([]);
        }
      );
    } else {
      setIsMultiMode(false);
      setMultiQuestions([]);
    }
  };

  // 快捷键处理
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl/Cmd + Shift + A: 智能分析
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'A') {
        event.preventDefault();
        if (content.stem.trim() && !isAnalyzing) {
          handleSmartAnalysis();
        }
      }
      // Ctrl/Cmd + Shift + O: OCR扫描
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'O') {
        event.preventDefault();
        setShowOCRUploader(!showOCRUploader);
      }
      // Ctrl/Cmd + Shift + M: 切换多题目模式
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'M') {
        event.preventDefault();
        if (isMultiMode) {
          handleExitMultiMode();
        } else {
          setIsMultiMode(true);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [content.stem, isAnalyzing, showOCRUploader, isMultiMode]);

  // 获取用户可用的题库列表
  useEffect(() => {
    const fetchQuestionBanks = async () => {
      setLoadingBanks(true);
      try {
        const response = await questionBankAPI.getQuestionBanks();
        setQuestionBanks(response.data.questionBanks || []);
      } catch (error) {
        // 获取题库列表失败
        showErrorRightSlide(t('questionBankPage.CreateQuestionPage.errors.loadFailed'), t('questionBankPage.CreateQuestionPage.errors.loadFailed'));
      } finally {
        setLoadingBanks(false);
      }
    };

    fetchQuestionBanks();
  }, []);

  // 计算可用题库 - 只根据userRole字段判断权限
  const availableBanks = questionBanks.filter(bank => 
    bank.userRole === 'creator' || bank.userRole === 'manager' || bank.userRole === 'collaborator'
  );

  // 当前选择题库 - 只从有权限的题库中选择
  const selectedBank = availableBanks.find(bank => bank.bid === selectedBankId);

  // 处理URL中的bid参数和题库选择
  useEffect(() => {
    if (!loadingBanks && availableBanks.length > 0) {
      // 如果有URL中的bid参数，检查是否有权限
      if (bid) {
        const hasPermission = availableBanks.find(bank => bank.bid === bid);
        if (hasPermission) {
          setSelectedBankId(bid);
        } else {
          // 没有权限，设置为第一个可用题库
          setSelectedBankId(availableBanks[0].bid);
        }
      } else {
        // 没有URL参数，设置为第一个可用题库
        setSelectedBankId(availableBanks[0].bid);
      }
    }
  }, [availableBanks, loadingBanks, bid]);

  // 如果当前选择的题库不在可用题库列表中，重置选择
  useEffect(() => {
    if (selectedBankId && !availableBanks.find(bank => bank.bid === selectedBankId)) {
      setSelectedBankId('');
    }
  }, [availableBanks, selectedBankId]);



  // 选择题库
  const handleBankSelect = (bankId: string) => {
    // 确保只能选择有权限的题库
    const bank = availableBanks.find(b => b.bid === bankId);
    if (bank) {
      setSelectedBankId(bankId);
      setShowBankDropdown(false);
    }
  };

  // OCR结果处理
  const handleOCRResult = async (latex: string, isChoiceQuestion?: boolean, questionContent?: string, options?: string[]) => {
    
    
    // 优先使用DeepSeek AI处理后的内容，因为它经过了LaTeX矫正
    let finalContent = latex;
    
    // 如果有经过AI处理的questionContent，且内容更丰富，则使用它
    if (questionContent && questionContent.trim().length > 0) {
      
      finalContent = questionContent;
      
      // 如果识别为选择题且有选项，设置为选择题类型
      if (isChoiceQuestion && options && options.length > 0) {

        setQuestionType('choice');
        setContent(prev => ({
          ...prev,
          stem: finalContent,
          options: options.length >= 4 ? options.slice(0, 4) : [...options, ...Array(4 - options.length).fill('')]
        }));
      } else {
        // 不是选择题，但使用AI处理后的内容
        setContent(prev => ({
          ...prev,
          stem: finalContent
        }));
      }
    } else {
      
      // 使用原始的latex内容
      setContent(prev => ({
        ...prev,
        stem: finalContent
      }));
    }
    
    setShowOCRUploader(false);
    setOcrError('');
    
    // 显示成功提示
    showSuccessRightSlide(t('questionBankPage.CreateQuestionPage.success.ocrComplete'), t('questionBankPage.CreateQuestionPage.success.ocrComplete'));
  };

  // 智能分析
  const handleSmartAnalysis = async () => {
    if (!content.stem.trim()) return;

    setIsAnalyzing(true);
    setAnalysisError('');

    try {
      const response = await questionAnalysisAPI.analyzeQuestion(content.stem);
      
      if (response.data.success) {
        const analysis = response.data.analysis;
        setContent(prev => ({
          ...prev,
          category: analysis.category ? [analysis.category] : prev.category,
          tags: analysis.tags || prev.tags,
          difficulty: analysis.difficulty || prev.difficulty
        }));
        
        // 显示成功提示
        showSuccessRightSlide(t('questionBankPage.CreateQuestionPage.success.analysisComplete'), t('questionBankPage.CreateQuestionPage.success.analysisComplete'));
      } else {
        setAnalysisError(t('questionBankPage.CreateQuestionPage.errors.analysisFailed'));
      }
    } catch (error: any) {
      // 智能分析失败
      const errorMessage = error.response?.data?.error || t('questionBankPage.CreateQuestionPage.errors.analysisFailed');
      setAnalysisError(errorMessage);
      showErrorRightSlide(t('questionBankPage.CreateQuestionPage.errors.analysisFailed'), errorMessage);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // OCR错误处理
  const handleOCRError = (error: string) => {
    setOcrError(error);
    showErrorRightSlide(t('questionBankPage.CreateQuestionPage.errors.ocrFailed'), error);
  };

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.bank-dropdown')) {
        setShowBankDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 处理题干变化
  const handleStemChange = (value: string) => {
    setContent(prev => ({ ...prev, stem: value }));
    
    // 实时相似度检测（只有登录用户才检测）
    if (isAuthenticated && value.trim().length > 10) {
      // 清除之前的定时器
      if (detectionTimeout) {
        clearTimeout(detectionTimeout);
      }
      
      // 设置新的定时器，延迟1秒后检测（减少延迟）
      const timeout = setTimeout(() => {
        detectSimilarityRealTime(value);
      }, 1000);
      
      setDetectionTimeout(timeout);
    } else {
      // 内容太短或未登录，清除警告
      setSimilarityWarning(null);
    }
  };

  // 处理选项变化
  const handleOptionChange = (index: number, value: string) => {
    setContent(prev => {
      const newOptions = [...(prev.options || [])];
      newOptions[index] = value;
      return { ...prev, options: newOptions };
    });
  };

  // 添加选项
  const addOption = () => {
    setContent(prev => ({
      ...prev,
      options: [...(prev.options || []), '']
    }));
  };

  // 删除选项
  const removeOption = (index: number) => {
    setContent(prev => ({
      ...prev,
      options: prev.options?.filter((_, i) => i !== index)
    }));
  };



  // 处理解析变化
  const handleSolutionChange = (value: string) => {
    setContent(prev => ({ ...prev, solution: value }));
  };

  // 处理难度变化
  const handleDifficultyChange = (difficulty: number) => {
    setContent(prev => ({ ...prev, difficulty }));
  };

  // 处理小题型变化
  const handleCategoryChange = (categories: string[]) => {
    setContent(prev => ({ ...prev, category: categories }));
  };

  // 处理来源变化
  const handleSourceChange = (value: string) => {
    setContent(prev => ({ ...prev, source: value }));
  };

  // 计算填空题的空格数量
  const getFillCount = (stem: string) => {
    const matches = stem.match(/\\fill/g);
    return matches ? matches.length : 0;
  };

  // 计算解答题的答案数量和标签
  const getSolutionAnswerInfo = (stem: string) => {
    const lines = stem.split('\n');
    const answers: { label: string; index: number }[] = [];
    let subpCount = 0;
    let subsubpCount = 0;
    const subpWithSubsubp = new Set<number>();
    
    for (const line of lines) {
      if (line.includes('\\subp')) {
        subpCount++;
        subsubpCount = 0;
      } else if (line.includes('\\subsubp')) {
        subsubpCount++;
        subpWithSubsubp.add(subpCount);
        const romanNumerals = ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii', 'ix', 'x'];
        const romanNum = romanNumerals[subsubpCount - 1] || subsubpCount.toString();
        answers.push({
          label: `(${subpCount}) ${romanNum}.`,
          index: answers.length
        });
      }
    }
    
    for (let i = 1; i <= subpCount; i++) {
      if (!subpWithSubsubp.has(i)) {
        answers.push({
          label: `(${i})`,
          index: answers.length
        });
      }
    }
    
    if (answers.length === 0) {
      answers.push({
        label: '答案',
        index: 0
      });
    }
    
    return answers;
  };

  // 处理填空题答案变化
  const handleFillAnswerChange = (index: number, value: string) => {
    setContent(prev => {
      const newFillAnswers = [...(prev.fillAnswers || [])];
      newFillAnswers[index] = value;
      return { ...prev, fillAnswers: newFillAnswers };
    });
  };

  // 处理解答题答案变化
  const handleSolutionAnswerChange = (index: number, value: string) => {
    setContent(prev => {
      const newSolutionAnswers = [...(prev.solutionAnswers || [])];
      newSolutionAnswers[index] = value;
      return { ...prev, solutionAnswers: newSolutionAnswers };
    });
  };

  // 自动判断选择题类型
  const detectChoiceType = (answer: string) => {
    return answer.length > 1 ? 'multiple-choice' : 'choice';
  };

  // 处理选择题切换 - 自动判断单选/多选
  const handleChoiceToggle = (index: number) => {
    const optionLetter = String.fromCharCode(65 + index);
    setContent(prev => {
      let newAnswer = prev.answer;
      
      if (newAnswer.includes(optionLetter)) {
        // 移除选项
        newAnswer = newAnswer.replace(new RegExp(optionLetter, 'g'), '');
      } else {
        // 添加选项 - 不再区分单选/多选，统一处理
        newAnswer += optionLetter;
      }
      
      // 自动更新题目类型
      const newQuestionType = detectChoiceType(newAnswer);
      setQuestionType(newQuestionType as 'choice' | 'multiple-choice');
      
      return { ...prev, answer: newAnswer };
    });
  };

  // 保存题目
  const handleSave = async () => {
    if (!selectedBankId) {
      showErrorRightSlide(t('questionBankPage.CreateQuestionPage.errors.selectBank'), t('questionBankPage.CreateQuestionPage.errors.selectBank'));
      return;
    }

    // 权限检查：确保用户对当前选择题库有创建题目的权限
    const selectedBank = questionBanks.find(bank => bank.bid === selectedBankId);
    if (!selectedBank || (selectedBank.userRole !== 'creator' && selectedBank.userRole !== 'manager' && selectedBank.userRole !== 'collaborator')) {
      const errorMessage = t('questionBankPage.CreateQuestionPage.permissions.noPermissionForBank');
      setPermissionError(errorMessage);
      showErrorRightSlide(t('questionBankPage.CreateQuestionPage.permissions.insufficient'), errorMessage);
      // 3秒后自动清除错误提示
      setTimeout(() => setPermissionError(''), 3000);
      return;
    }

    if (!content.stem.trim()) {
      showErrorRightSlide(t('questionBankPage.CreateQuestionPage.errors.enterContent'), t('questionBankPage.CreateQuestionPage.errors.enterContent'));
      return;
    }

    // 根据题目类型验证答案
    if (questionType === 'choice' || questionType === 'multiple-choice') {
      // 选择题：验证答案和选项
      if (!content.answer.trim()) {
        showErrorRightSlide(t('questionBankPage.CreateQuestionPage.errors.selectAnswer'), t('questionBankPage.CreateQuestionPage.errors.selectAnswer'));
        return;
      }
      if (!content.options || content.options.some(option => !option.trim())) {
        showErrorRightSlide(t('questionBankPage.CreateQuestionPage.errors.completeOptions'), t('questionBankPage.CreateQuestionPage.errors.completeOptions'));
        return;
      }
    } else if (questionType === 'fill') {
      // 填空题：验证填空题答案
      if (!content.fillAnswers || content.fillAnswers.some(answer => !answer.trim())) {
        showErrorRightSlide(t('questionBankPage.CreateQuestionPage.errors.completeFillAnswers'), t('questionBankPage.CreateQuestionPage.errors.completeFillAnswers'));
        return;
      }
    } else if (questionType === 'solution') {
      // 解答题：验证解答题答案
      if (!content.solutionAnswers || content.solutionAnswers.some(answer => !answer.trim())) {
        showErrorRightSlide(t('questionBankPage.CreateQuestionPage.errors.completeSolutionAnswers'), t('questionBankPage.CreateQuestionPage.errors.completeSolutionAnswers'));
        return;
      }
    }

    setIsSaving(true);
    try {
      // 转换内容格式
      let answerContent = content.answer;
      
      // 根据题目类型设置答案内容
      if (questionType === 'fill') {
        // 填空题：将fillAnswers合并为答案字符串
        answerContent = content.fillAnswers?.join('; ') || '';
      } else if (questionType === 'solution') {
        // 解答题：将solutionAnswers合并为答案字符串
        answerContent = content.solutionAnswers?.join('; ') || '';
    }
    
      const questionData: CreateQuestionRequest = {
        type: questionType,
        content: {
          stem: content.stem,
          answer: answerContent,
          options: (questionType === 'choice' || questionType === 'multiple-choice') ? content.options?.map((option, index) => ({
            text: option,
            isCorrect: content.answer.includes(String.fromCharCode(65 + index))
          })) : undefined,
          fillAnswers: questionType === 'fill' ? content.fillAnswers : undefined,
          solutionAnswers: questionType === 'solution' ? content.solutionAnswers : undefined,
          solution: content.solution
        },
        category: content.category || [],
        tags: content.tags,
        difficulty: content.difficulty || 3,
        source: content.source,
        images: images.length > 0 ? images.map(img => ({
          ...img,
          bid: selectedBankId,
          format: 'png', // 默认格式
          uploadedAt: new Date(),
          uploadedBy: user?._id || 'unknown-user'
        })) : undefined,
        tikzCodes: tikzCodes.length > 0 ? tikzCodes.map(tikz => ({
          ...tikz,
          bid: selectedBankId,
          createdAt: new Date(),
          createdBy: user?._id || 'unknown-user'
        })) : undefined
      };

      await questionAPI.createQuestion(selectedBankId, questionData);
      
      // 显示成功提示
      showSuccessRightSlide(t('questionBankPage.CreateQuestionPage.success.saved'), t('questionBankPage.CreateQuestionPage.success.saved'));
      
      // 根据来源决定返回路径
      if (bid) {
        // 从题库详情页进入，返回题库详情页
        navigate(`/question-banks/${selectedBankId}`);
      } else {
        // 从题目管理进入，返回题目管理页
        navigate('/questions');
      }
    } catch (error) {
      // 保存题目失败
      showErrorRightSlide(t('questionBankPage.CreateQuestionPage.errors.saveFailed'), t('questionBankPage.CreateQuestionPage.errors.saveFailed'));
    } finally {
      setIsSaving(false);
    }
  };

  // 权限检查：如果用户没有任何可用的题库，显示权限不足提示
  if (!loadingBanks && availableBanks.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg dark:shadow-gray-900/50 p-8"
          >
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, duration: 0.3, type: "spring", stiffness: 200 }}
              className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center"
            >
              <motion.div
                initial={{ rotate: -10 }}
                animate={{ rotate: 0 }}
                transition={{ delay: 0.4, duration: 0.2 }}
              >
                <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
              </motion.div>
            </motion.div>
            <motion.h2 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.3 }}
              className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2"
            >
              {t('questionBankPage.CreateQuestionPage.permissions.insufficient')}
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.3 }}
              className="text-gray-600 dark:text-gray-300 mb-4"
            >
              {t('questionBankPage.CreateQuestionPage.permissions.noPermission')}
            </motion.p>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.3 }}
              className="space-y-2"
            >
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  onClick={() => navigate('/question-banks')}
                  className="w-full"
                >
                  {t('common.backToQuestionBanks')}
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  variant="outline"
                  onClick={() => navigate('/')}
                  className="w-full"
                >
                  {t('common.backToHome')}
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    );
  }

  if (loadingBanks) {
    return (
      <LoadingPage
        type="loading"
        title={t('questionBankPage.CreateQuestionPage.status.loadingBanks')}
        description={t('questionBankPage.CreateQuestionPage.status.loadingBanksDesc')}
        animation="spinner"
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* 页面头部 */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => {
                  if (isMultiMode) {
                    // 批量模式下退出批量编辑
                    handleExitMultiMode();
                  } else {
                    // 单题目模式下返回上一页
                    if (bid) {
                      // 从题库详情页进入，返回题库详情页
                      navigate(`/question-banks/${selectedBankId || bid}`);
                    } else {
                      // 从题目管理进入，返回题目管理页
                      navigate('/questions');
                    }
                  }
                }}
                className="flex items-center space-x-1"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{isMultiMode ? t('questionBankPage.CreateQuestionPage.navigation.exitBatch') : t('questionBankPage.CreateQuestionPage.navigation.back')}</span>
              </Button>
              
              <div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  {isMultiMode ? t('questionBankPage.CreateQuestionPage.batchTitle') : t('questionBankPage.CreateQuestionPage.title')}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {isMultiMode ? t('questionBankPage.CreateQuestionPage.batchDescription') : t('questionBankPage.CreateQuestionPage.description')}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {/* 题库选择 - 在批量模式下显示 */}
              {isMultiMode && (
                <div className="relative bank-dropdown">
                  <button
                    onClick={() => setShowBankDropdown(!showBankDropdown)}
                    className="flex items-center space-x-2 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                  >
                    <BookOpen className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {selectedBank ? selectedBank.name : t('questionBankPage.CreateQuestionPage.placeholders.category')}
                    </span>
                    <ChevronDown className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  </button>
                  
                  {showBankDropdown && (
                    <div className="absolute z-50 mt-1 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg dark:shadow-gray-900/50 max-h-60 overflow-y-auto">
                      {loadingBanks ? (
                        <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">{t('common.loading')}</div>
                      ) : availableBanks.length === 0 ? (
                        <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                          {t('questionBankPage.CreateQuestionPage.status.noAvailableBanks', { total: questionBanks.length, available: availableBanks.length })}
                        </div>
                      ) : (
                        availableBanks.map((bank) => (
                          <button
                            key={bank.bid}
                            onClick={() => handleBankSelect(bank.bid)}
                            className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700 focus:outline-none ${
                              selectedBankId === bank.bid ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' : ''
                            }`}
                          >
                            <div className="font-medium text-gray-900 dark:text-gray-100">{bank.name}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">{bank.description}</div>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* 题库选择 - 在单题目模式下显示 */}
              {!isMultiMode && (
                <div className="relative bank-dropdown">
                  <button
                    onClick={() => setShowBankDropdown(!showBankDropdown)}
                    className="flex items-center space-x-2 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                  >
                    <BookOpen className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {selectedBank ? selectedBank.name : t('questionBankPage.CreateQuestionPage.placeholders.category')}
                    </span>
                    <ChevronDown className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  </button>
                  
                  {showBankDropdown && (
                    <div className="absolute z-50 mt-1 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg dark:shadow-gray-900/50 max-h-60 overflow-y-auto">
                      {loadingBanks ? (
                        <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">{t('common.loading')}</div>
                      ) : availableBanks.length === 0 ? (
                        <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                          {t('questionBankPage.CreateQuestionPage.status.noAvailableBanks', { total: questionBanks.length, available: availableBanks.length })}
                        </div>
                      ) : (
                        availableBanks.map((bank) => (
                          <button
                            key={bank.bid}
                            onClick={() => handleBankSelect(bank.bid)}
                            className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700 focus:outline-none ${
                              selectedBankId === bank.bid ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' : ''
                            }`}
                          >
                            <div className="font-medium text-gray-900 dark:text-gray-100">{bank.name}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">{bank.description}</div>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* 题目类型选择 - 仅在单题目模式下显示 */}
              {!isMultiMode && (
                <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                  <button
                    onClick={() => setQuestionType('choice')}
                    className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                      questionType === 'choice'
                        ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm'
                        : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
                    }`}
                  >
                    {t('questionBankPage.CreateQuestionPage.questionTypes.choice')}
                  </button>
                  <button
                    onClick={() => setQuestionType('fill')}
                    className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                      questionType === 'fill'
                        ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm'
                        : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
                    }`}
                  >
                    {t('questionBankPage.CreateQuestionPage.questionTypes.fill')}
                  </button>
                  <button
                    onClick={() => setQuestionType('solution')}
                    className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                      questionType === 'solution'
                        ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm'
                        : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
                    }`}
                  >
                    {t('questionBankPage.CreateQuestionPage.questionTypes.solution')}
                  </button>
                </div>
              )}

              {/* 伸缩按钮 - 仅在单题目模式下显示 */}
              {!isMultiMode && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsHeaderExpanded(!isHeaderExpanded)}
                  className="flex items-center space-x-1"
                >
                  {isHeaderExpanded ? (
                    <>
                      <ChevronUp className="w-4 h-4" />
                      <span>{t('questionBankPage.CreateQuestionPage.buttons.collapse')}</span>
                    </>
                  ) : (
                    <>
                      <ChevronDownIcon className="w-4 h-4" />
                      <span>{t('questionBankPage.CreateQuestionPage.buttons.expand')}</span>
                    </>
                  )}
                </Button>
              )}

              {/* 权限错误提示 */}
              <AnimatePresence>
                {permissionError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center space-x-2"
                  >
                    <motion.div
                      initial={{ rotate: -10 }}
                      animate={{ rotate: 0 }}
                      transition={{ delay: 0.1, duration: 0.2 }}
                    >
                      <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
                    </motion.div>
                    <p className="text-sm text-red-700">{permissionError}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* 保存按钮 - 仅在单题目模式下显示 */}
              {!isMultiMode && (
                <Button
                  variant="primary"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center space-x-1"
                >
                  {isSaving ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : null}
                  <span>{isSaving ? t('questionBankPage.CreateQuestionPage.buttons.saving') : t('questionBankPage.CreateQuestionPage.buttons.save')}</span>
                </Button>
              )}
            </div>
          </div>

          {/* 可伸缩的操作栏 - 仅在单题目模式下显示 */}
          {!isMultiMode && (
            <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
              isHeaderExpanded ? 'max-h-32 opacity-100 pb-4' : 'max-h-0 opacity-0'
            }`}>
              <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                <div className="flex items-center space-x-3">
                  {/* 多题目上传按钮 */}
                  <Button
                    onClick={() => setIsMultiMode(true)}
                    variant="outline"
                    size="sm"
                    className="flex items-center space-x-1"
                  >
                    <Upload className="w-4 h-4" />
                    <span>{t('questionBankPage.CreateQuestionPage.actions.multiUpload')}</span>
                    <span className="text-xs text-gray-400 ml-1">{t('questionBankPage.CreateQuestionPage.shortcuts.multiMode')}</span>
                  </Button>

                  {/* OCR扫描按钮 */}
                  <Button
                    onClick={() => setShowOCRUploader(!showOCRUploader)}
                    variant="outline"
                    size="sm"
                    className="flex items-center space-x-1"
                  >
                    <Camera className="w-4 h-4" />
                    <span>{t('questionBankPage.CreateQuestionPage.actions.ocrScan')}</span>
                    <span className="text-xs text-gray-400 ml-1">{t('questionBankPage.CreateQuestionPage.shortcuts.ocr')}</span>
                  </Button>

                  {/* 智能分析按钮 */}
                  <Button
                    onClick={handleSmartAnalysis}
                    variant="outline"
                    size="sm"
                    disabled={isAnalyzing || !content.stem.trim()}
                    className="flex items-center space-x-1"
                  >
                    {isAnalyzing ? (
                      <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Brain className="w-4 h-4" />
                    )}
                    <span>{isAnalyzing ? t('questionBankPage.CreateQuestionPage.actions.analyzing') : t('questionBankPage.CreateQuestionPage.actions.smartAnalysis')}</span>
                    <span className="text-xs text-gray-400 ml-1">{t('questionBankPage.CreateQuestionPage.shortcuts.analysis')}</span>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 主要内容 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isMultiMode ? (
          // 多题目模式
          <div className="space-y-6">
            {multiQuestions.length === 0 ? (
              // 上传阶段
              <MultiQuestionUploader
                onQuestionsGenerated={handleMultiQuestionsGenerated}
              />
            ) : (
              // 编辑阶段
              <MultiQuestionEditor
                questions={multiQuestions}
                onQuestionsUpdate={handleMultiQuestionsUpdate}
                onSaveAll={handleMultiQuestionsSave}
                onExit={handleExitMultiMode}
                selectedBankId={selectedBankId}
              />
            )}
          </div>
        ) : (
          // 单题目模式（原有内容）
          <div className={`grid grid-cols-1 gap-8 transition-all duration-300 ${
            isRightPanelCollapsed ? 'lg:grid-cols-1' : 'lg:grid-cols-3'
          }`}>
            {/* 左侧：题目内容 */}
            <div className={`space-y-6 transition-all duration-300 ${
              isRightPanelCollapsed ? 'lg:col-span-1' : 'lg:col-span-2'
            }`}>
              {/* 题干/解析切换 */}
              <Card>
                <div className="p-4 border-b bg-gray-50 dark:bg-gray-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => setActiveTab('stem')}
                        className={`px-4 py-2 rounded-lg transition-colors ${
                          activeTab === 'stem'
                            ? 'bg-blue-500 text-white'
                            : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                        }`}
                      >
                        {t('questionBankPage.CreateQuestionPage.tabs.stem')}
                      </button>
                      <button
                        onClick={() => setActiveTab('media')}
                        className={`px-4 py-2 rounded-lg transition-colors ${
                          activeTab === 'media'
                            ? 'bg-blue-500 text-white'
                            : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                        }`}
                      >
                        {t('questionBankPage.CreateQuestionPage.tabs.media')}
                      </button>
                      <button
                        onClick={() => setActiveTab('solution')}
                        className={`px-4 py-2 rounded-lg transition-colors ${
                          activeTab === 'solution'
                            ? 'bg-blue-500 text-white'
                            : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                        }`}
                      >
                        {t('questionBankPage.CreateQuestionPage.tabs.solution')}
                      </button>
                    </div>
                    {/* 右侧标签区域缩放按钮 */}
                    <button
                      onClick={() => setIsRightPanelCollapsed(!isRightPanelCollapsed)}
                      className="flex items-center space-x-1 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                      title={isRightPanelCollapsed ? t('questionBankPage.CreateQuestionPage.buttons.expandTags') : t('questionBankPage.CreateQuestionPage.buttons.collapseTags')}
                    >
                      {isRightPanelCollapsed ? (
                        <>
                          <ChevronLeft className="w-4 h-4" />
                          <span>{t('questionBankPage.CreateQuestionPage.buttons.expandTags')}</span>
                        </>
                      ) : (
                        <>
                          <ChevronRight className="w-4 h-4" />
                          <span>{t('questionBankPage.CreateQuestionPage.buttons.collapseTags')}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  {activeTab === 'stem' ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-gray-700 dark:text-gray-200">{t('questionBankPage.CreateQuestionPage.form.questionContent')}</h4>
                        <div className="flex items-center space-x-2">
                          {/* 实时相似度检测状态 */}
                          {isAuthenticated && isDetectingSimilarity && (
                            <div className="flex items-center space-x-1 text-sm text-blue-600 dark:text-blue-400">
                              <div className="w-3 h-3 border-2 border-blue-600 dark:border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                              <span>{t('questionBankPage.CreateQuestionPage.status.detecting')}</span>
                            </div>
                          )}
                          {isAuthenticated && similarityWarning && (
                            <button
                              onClick={showDetailedSimilarity}
                              disabled={isLoadingDetailedSimilarity}
                              className={`flex items-center space-x-1 text-sm transition-colors px-2 py-1 rounded-md border ${
                                isLoadingDetailedSimilarity 
                                  ? 'text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 cursor-not-allowed' 
                                  : 'text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 bg-orange-50 dark:bg-orange-900/30 border-orange-200 dark:border-orange-700'
                              }`}
                            >
                              {isLoadingDetailedSimilarity ? (
                                <>
                                  <div className="w-4 h-4 border-2 border-gray-400 dark:border-gray-500 border-t-transparent rounded-full animate-spin"></div>
                                  <span>{t('common.loading')}</span>
                                </>
                              ) : (
                                <>
                                  <AlertTriangle className="w-4 h-4" />
                                  <span>{t('questionBankPage.CreateQuestionPage.status.similarityFound', { count: similarityWarning.similarCount, percentage: Math.round(similarityWarning.maxSimilarity * 100) })}</span>
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </div>

                      {/* OCR错误提示 */}
                      {ocrError && (
                        <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
                          <p className="text-red-700 dark:text-red-300 text-sm">{ocrError}</p>
                        </div>
                      )}

                      {/* 智能分析错误提示 */}
                      {analysisError && (
                        <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
                          <p className="text-red-700 dark:text-red-300 text-sm">{analysisError}</p>
                        </div>
                      )}

                      {/* OCR上传器 */}
                      {showOCRUploader && (
                        <OCRUploader
                          onOCRResult={handleOCRResult}
                          onError={handleOCRError}
                          className="mb-4"
                        />
                      )}

                      {/* LaTeX编辑器 */}
                      <LaTeXEditor
                        value={content.stem}
                        onChange={handleStemChange}
                        placeholder={t('questionBankPage.CreateQuestionPage.placeholders.questionContent')}
                        showPreview={true}
                        enableHoverPreview={true}
                        questionType={questionType === 'multiple-choice' ? 'choice' : questionType}
                      />
                    </div>
                  ) : activeTab === 'solution' ? (
                    <div className="space-y-4">
                      {/* 题目预览 */}
                      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                        <h4 className="font-medium text-gray-700 dark:text-gray-200 mb-2">{t('questionBankPage.CreateQuestionPage.preview.title')}</h4>
                        <div 
                          className="prose prose-sm max-w-none dark:prose-invert"
                          dangerouslySetInnerHTML={{ 
                            __html: content.stem ? renderContent(content.stem) : ''
                          }}
                        />
                        
                        {/* 题目图形预览 */}
                        {tikzCodes.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                                                            <SimpleMediaPreview tikzCodes={tikzCodes} images={images} />
                          </div>
                        )}
                      </div>

                      {/* 解析编辑器 */}
                      <div>
                        <h4 className="font-medium text-gray-700 dark:text-gray-200 mb-2">{t('questionBankPage.CreateQuestionPage.form.solution')}</h4>
                        <LaTeXEditor
                          value={content.solution || ''}
                          onChange={handleSolutionChange}
                          placeholder={t('questionBankPage.CreateQuestionPage.placeholders.solution')}
                          showPreview={true}
                          enableHoverPreview={true}
                          questionType="solution"
                          displayType="solution"
                        />
                      </div>
                      {/* 媒体内容预览在解析中 */}
                      <MediaContentPreview tikzCodes={tikzCodes} images={images} />
                    </div>
                  ) : activeTab === 'media' ? (
                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-700 dark:text-gray-200">{t('questionBankPage.CreateQuestionPage.media.title')}</h4>
                      <IntegratedMediaEditor
                        bid={selectedBankId}
                        tikzCodes={tikzCodes}
                        onTikzCodesChange={setTikzCodes}
                        images={images}
                        onImagesChange={setImages}
                      />
                    </div>
                  ) : null}
                </div>
              </Card>

              {/* 选项编辑（选择题） */}
              {(questionType === 'choice' || questionType === 'multiple-choice') && (
                <Card>
                  <div className="p-4 border-b bg-gray-50 dark:bg-gray-800">
                    <h3 className="font-medium text-gray-900 dark:text-gray-100">{t('questionBankPage.CreateQuestionPage.options.title')}</h3>
                  </div>
                  <div className="p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        {t('questionBankPage.CreateQuestionPage.options.questionType')}：{questionType === 'choice' ? t('questionBankPage.CreateQuestionPage.questionTypes.singleChoice') : t('questionBankPage.CreateQuestionPage.questionTypes.multipleChoice')} 
                        <span className="text-xs text-gray-400 dark:text-gray-500 ml-2">（{t('questionBankPage.CreateQuestionPage.options.autoDetected')}）</span>
                      </span>
                    </div>

                    <div className="space-y-3">
                      {(content.options || []).map((option, index) => (
                        <div key={index} className="flex items-center space-x-3">
                          <button
                            onClick={() => handleChoiceToggle(index)}
                            className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                              content.answer.includes(String.fromCharCode(65 + index))
                                ? 'bg-blue-500 border-blue-500 text-white'
                                : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-400'
                            }`}
                            title={content.answer.includes(String.fromCharCode(65 + index)) ? '取消选择' : '选择答案'}
                          >
                            {content.answer.includes(String.fromCharCode(65 + index)) && <Check className="w-3 h-3" />}
                          </button>
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-200 w-6">
                            {String.fromCharCode(65 + index)}.
                          </span>
                          <HoverTooltip content={option} config={{ mode: 'lightweight' }}>
                            <Input
                              value={option}
                              onChange={(e) => handleOptionChange(index, e.target.value)}
                              placeholder={`选项 ${String.fromCharCode(65 + index)}`}
                              className="flex-1"
                              enableLatexAutoComplete={true}
                            />
                          </HoverTooltip>
                          <Button
                            onClick={() => removeOption(index)}
                            variant="outline"
                            size="sm"
                            disabled={(content.options || []).length <= 2}
                            title="删除选项"
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                    {content.answer && (
                      <div className="mt-3 p-2 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {t('questionBankPage.CreateQuestionPage.options.selectedAnswer')}：<span className="font-medium text-gray-900 dark:text-gray-100">{content.answer}</span>
                          <span className="text-xs text-gray-400 dark:text-gray-500 ml-2">
                            （{questionType === 'choice' ? t('questionBankPage.CreateQuestionPage.questionTypes.singleChoice') : t('questionBankPage.CreateQuestionPage.questionTypes.multipleChoice')}）
                          </span>
                        </p>
                      </div>
                    )}

                    <Button
                      onClick={addOption}
                      variant="outline"
                      size="sm"
                      disabled={(content.options || []).length >= 6}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      {t('questionBankPage.CreateQuestionPage.buttons.addOption')}
                    </Button>
                  </div>
                </Card>
              )}

              {/* 答案编辑（非选择题） */}
              {(questionType === 'fill' || questionType === 'solution') && (
                <Card>
                  <div className="p-4 border-b bg-gray-50 dark:bg-gray-800">
                    <h3 className="font-medium text-gray-900 dark:text-gray-100">{t('questionBankPage.CreateQuestionPage.answers.title')}</h3>
                  </div>
                  <div className="p-4">
                    {questionType === 'fill' ? (
                      <div className="space-y-3">
                        <p className="text-sm text-gray-600 dark:text-gray-300">{t('questionBankPage.CreateQuestionPage.answers.fillInstructions')}</p>
                        {Array.from({ length: getFillCount(content.stem) }, (_, index) => (
                          <div key={`fill-answer-${index}`} className="space-y-2">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{t('questionBankPage.CreateQuestionPage.answers.fillNumber', { number: index + 1 })}：</span>
                            <HoverTooltip content={content.fillAnswers?.[index] || ''} config={{ mode: 'lightweight' }}>
                              <Input
                                value={content.fillAnswers?.[index] || ''}
                                onChange={(e) => handleFillAnswerChange(index, e.target.value)}
                                placeholder={t('questionBankPage.CreateQuestionPage.placeholders.answer', { number: index + 1 })}
                                className="w-full"
                                enableLatexAutoComplete={true}
                                enableLatexHighlight={true}
                              />
                            </HoverTooltip>
                          </div>
                        ))}
                        {getFillCount(content.stem) === 0 && (
                          <p className="text-sm text-gray-500 dark:text-gray-400">{t('questionBankPage.CreateQuestionPage.answers.noFillFound')}</p>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <p className="text-sm text-gray-600 dark:text-gray-300">{t('questionBankPage.CreateQuestionPage.answers.solutionInstructions')}</p>
                        {(() => {
                          const answerInfo = getSolutionAnswerInfo(content.stem);
                          return answerInfo.map((info, index) => (
                            <div key={`solution-answer-${index}-${info.label}`} className="space-y-2">
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{info.label}：</span>
                              <HoverTooltip content={content.solutionAnswers?.[index] || ''} config={{ mode: 'lightweight' }}>
                                <Input
                                  value={content.solutionAnswers?.[index] || ''}
                                  onChange={(e) => handleSolutionAnswerChange(index, e.target.value)}
                                  placeholder={t('questionBankPage.CreateQuestionPage.placeholders.answer', { number: index + 1 })}
                                  className="w-full"
                                  enableLatexAutoComplete={true}
                                enableLatexHighlight={true}
                                />
                              </HoverTooltip>
                            </div>
                          ));
                        })()}
                      </div>
                    )}
                  </div>
                </Card>
              )}
            </div>

            {/* 右侧：题目属性 */}
            <div className={`space-y-6 transition-all duration-300 ${
              isRightPanelCollapsed ? 'hidden lg:hidden' : 'lg:col-span-1'
            }`}>
              {/* 难度设置 */}
              <Card>
                <div className="p-4 border-b bg-gray-50 dark:bg-gray-800">
                  <div className="flex items-center space-x-2">
                    <Target className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    <h3 className="font-medium text-gray-900 dark:text-gray-100">{t('questionBankPage.CreateQuestionPage.difficulty.title')}</h3>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center space-x-2">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <button
                        key={level}
                        onClick={() => handleDifficultyChange(level)}
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                          content.difficulty === level
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    {content.difficulty === 1 && t('questionBankPage.CreateQuestionPage.difficulty.veryEasy')}
                    {content.difficulty === 2 && t('questionBankPage.CreateQuestionPage.difficulty.easy')}
                    {content.difficulty === 3 && t('questionBankPage.CreateQuestionPage.difficulty.medium')}
                    {content.difficulty === 4 && t('questionBankPage.CreateQuestionPage.difficulty.hard')}
                    {content.difficulty === 5 && t('questionBankPage.CreateQuestionPage.difficulty.veryHard')}
                  </p>
                </div>
              </Card>

              {/* 小题型设置 */}
              <QuestionTypeSelector
                selectedTypes={content.category || []}
                onTypesChange={handleCategoryChange}
                maxCount={3}
              />

              {/* 知识点标签 */}
              <KnowledgeTagSelector
                selectedTags={content.tags || []}
                onTagsChange={(tags) => setContent(prev => ({ ...prev, tags }))}
                maxCount={5}
              />

              {/* 题目出处 */}
              <QuestionSourceSelector
                source={content.source || ''}
                onSourceChange={handleSourceChange}
              />
            </div>
          </div>
        )}
      </div>

      {/* 相似度检测弹窗 */}
      <SimilarityDetectionModal
        isOpen={showSimilarityModal}
        onClose={() => setShowSimilarityModal(false)}
        similarQuestions={similarQuestions}
        onContinue={handleSimilarityContinue}
        onCancel={handleSimilarityCancel}
        questionData={pendingQuestionData}
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
  );
};

export default CreateQuestionPage; 