import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Clock, Users, Eye, Edit, Play, FileText } from 'lucide-react';
import Button from '../../ui/Button';
import Card from '../../ui/Card';

interface PracticePaper {
  _id: string;
  name: string;
  type: 'practice';
  tags: string[];
  sections: Array<{
    title: string;
    items: Array<{ question: string }>;
  }>;
  bank?: {
    _id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
  owner?: {
    _id: string;
    name: string;
    email?: string;
  };
  userRole: string;
}

interface PracticePaperCardProps {
  paper: PracticePaper;
  index: number;
  onEdit: (paper: PracticePaper) => void;
  onPreview: (paper: PracticePaper) => void;
}

const PracticePaperCard: React.FC<PracticePaperCardProps> = ({ 
  paper, 
  index, 
  onEdit, 
  onPreview 
}) => {
  const canEdit = ['creator', 'manager', 'collaborator'].includes(paper.userRole);
  
  // 计算总题数
  const totalQuestions = paper.sections.reduce((total, section) => total + section.items.length, 0);
  
  // 计算部分数
  const sectionCount = paper.sections.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="group"
    >
      <Card className="h-full hover:shadow-lg transition-all duration-300 border border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-600">
        <div className="p-6 h-full flex flex-col">
          {/* 头部信息 */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-2">
                <div className="p-1.5 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <BookOpen className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                  {paper.name}
                </h3>
              </div>
              
              <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <p className="flex items-center space-x-1">
                  <FileText className="w-4 h-4" />
                  <span>试卷集: {paper.bank?.name || '未知试卷集'}</span>
                </p>
                <p className="flex items-center space-x-1">
                  <Play className="w-4 h-4" />
                  <span>{sectionCount}个部分 · {totalQuestions}道题</span>
                </p>
              </div>
            </div>
            
            <div className="flex flex-col items-end space-y-2 ml-4">
              <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                练习卷
              </span>
              <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                {paper.userRole === 'creator' ? '创建者' : 
                 paper.userRole === 'manager' ? '管理员' : 
                 paper.userRole === 'collaborator' ? '协作者' : '查看者'}
              </span>
            </div>
          </div>

          {/* 标签 */}
          {paper.tags && paper.tags.length > 0 && (
            <div className="mb-4">
              <div className="flex flex-wrap gap-1">
                {paper.tags.slice(0, 3).map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
                {paper.tags.length > 3 && (
                  <span className="px-2 py-1 text-xs text-gray-500 dark:text-gray-400">
                    +{paper.tags.length - 3}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* 统计信息 */}
          <div className="grid grid-cols-2 gap-4 mb-4 text-sm text-gray-600 dark:text-gray-300">
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>创建: {new Date(paper.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Users className="w-4 h-4" />
              <span>更新: {new Date(paper.updatedAt).toLocaleDateString()}</span>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPreview(paper)}
                  className="flex items-center space-x-1 text-green-600 hover:text-green-700 border-green-200 hover:border-green-300"
                >
                  <Eye className="w-4 h-4" />
                  <span>预览</span>
                </Button>
                
                {canEdit && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(paper)}
                    className="flex items-center space-x-1"
                  >
                    <Edit className="w-4 h-4" />
                    <span>编辑</span>
                  </Button>
                )}
              </div>
              
              <div className="text-right">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  创建者: {paper.owner?.name || '未知用户'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default PracticePaperCard;
