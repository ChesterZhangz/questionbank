import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Eye
} from 'lucide-react';
import { questionAPI } from '../../services/api';
import type { Question } from '../../types';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import LoadingPage from '../../components/ui/LoadingPage';
import ConfirmModal from '../../components/ui/ConfirmModal';
import RightSlideModal from '../../components/ui/RightSlideModal';
import { useModal } from '../../hooks/useModal';
import { renderContentWithCache } from '../../lib/latex/utils/renderContent';

const QuestionViewPage: React.FC = () => {
  const { qid } = useParams<{ qid: string }>();
  const navigate = useNavigate();

  // 弹窗状态管理
  const { 
    showConfirm, 
    confirmModal, 
    closeConfirm,
    rightSlideModal,
    closeRightSlide
  } = useModal();
  
  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (qid) {
      fetchQuestion();
    }
  }, [qid]);

  const fetchQuestion = async () => {
    try {
      setLoading(true);
      const response = await questionAPI.getQuestion(qid!);
      
      if (response.data.success && response.data.question) {
        setQuestion(response.data.question);
      } else {
        setError(response.data.error || '获取题目失败');
      }
    } catch (error: any) {
      setError(error.response?.data?.error || '获取题目失败');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    if (question) {
      navigate(`/questions/${question._id}/edit`);
    }
  };

  const handleDelete = async () => {
    if (!question) {
      return;
    }
    
    showConfirm(
      '确认删除',
      '确定要删除这道题目吗？',
      async () => {
        try {
          // 先关闭模态框
          closeConfirm();
          
          const response = await questionAPI.batchOperation({
            operation: 'delete',
            questionIds: [question.qid] // 使用qid而不是_id
          });
          
          if (response.data.success) {
            navigate('/questions');
          } else {
            setError(response.data.error || '删除失败');
          }
        } catch (error: any) {
          setError(error.response?.data?.error || '删除失败');
        }
      }
    );
  };

  if (loading) {
    return (
      <LoadingPage
        type="loading"
        title="加载中..."
        description="正在获取题目信息，请稍候"
        animation="spinner"
      />
    );
  }

  if (error || !question) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <div className="p-8 text-center">
            <p className="text-red-600 mb-4">{error || '题目不存在'}</p>
            <Button onClick={() => navigate('/questions')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回题目列表
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* 页面头部 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={() => navigate('/questions')}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            返回
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">查看题目</h1>
            <p className="text-gray-600">题目详情</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={handleEdit}
            className="flex items-center space-x-2"
          >
            <Edit className="h-4 w-4" />
            编辑
          </Button>
          <Button
            variant="outline"
            onClick={handleDelete}
            className="flex items-center space-x-2 text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
            删除
          </Button>
        </div>
      </div>

      {/* 题目信息 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 题目内容 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 题目题干 */}
          <Card>
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">题目题干</h2>
              <div 
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ 
                  __html: renderContentWithCache(question.content.stem) 
                }}
              />
            </div>
          </Card>

          {/* 题目选项 */}
          {(question.type === 'choice' || question.type === 'multiple-choice') && question.content.options && (
            <Card>
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  {question.type === 'choice' ? '选项' : '选项（多选题）'}
                </h2>
                <div className="space-y-3">
                  {question.content.options.map((option, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg border ${
                        option.isCorrect 
                          ? 'bg-green-50 border-green-200' 
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium ${
                          option.isCorrect 
                            ? 'bg-green-500 text-white' 
                            : 'bg-gray-300 text-gray-700'
                        }`}>
                          {String.fromCharCode(65 + index)}
                        </div>
                        <div 
                          className="flex-1"
                          dangerouslySetInnerHTML={{ 
                            __html: renderContentWithCache(option.text) 
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}

          {/* 答案 */}
          <Card>
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">答案</h2>
              <div 
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ 
                  __html: renderContentWithCache(question.content.answer) 
                }}
              />
            </div>
          </Card>

          {/* 解析 */}
          {question.content.solution && (
            <Card>
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">解析</h2>
                <div 
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ 
                    __html: renderContentWithCache(question.content.solution) 
                  }}
                />
              </div>
            </Card>
          )}
        </div>

        {/* 题目信息侧边栏 */}
        <div className="space-y-6">
          {/* 基本信息 */}
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">基本信息</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">题目类型:</span>
                  <span className="font-medium">
                    {question.type === 'choice' ? '选择题' : 
                     question.type === 'multiple-choice' ? '多选题' :
                     question.type === 'fill' ? '填空题' : 
                     question.type === 'solution' ? '解答题' : question.type}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">难度等级:</span>
                  <span className="font-medium">{question.difficulty}/5</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">访问次数:</span>
                  <span className="font-medium flex items-center">
                    <Eye className="h-4 w-4 mr-1 text-gray-400" />
                    {question.views || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">创建时间:</span>
                  <span className="font-medium">
                    {new Date(question.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">更新时间:</span>
                  <span className="font-medium">
                    {new Date(question.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* 标签 */}
          {question.tags && question.tags.length > 0 && (
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">知识点标签</h3>
                <div className="flex flex-wrap gap-2">
                  {question.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </Card>
          )}

          {/* 来源信息 */}
          {question.source && (
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">来源信息</h3>
                <p className="text-gray-700">{question.source}</p>
              </div>
            </Card>
          )}

          {/* 创建者信息 */}
          {question.creator && (
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">创建者</h3>
                <div className="space-y-2">
                  <p className="text-gray-700">
                    <span className="font-medium">姓名:</span> {question.creator.name}
                  </p>
                  <p className="text-gray-700">
                    <span className="font-medium">邮箱:</span> {question.creator.email}
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>
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

export default QuestionViewPage; 