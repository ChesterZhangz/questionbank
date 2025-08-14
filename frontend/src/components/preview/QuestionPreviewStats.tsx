import React from 'react';
import { motion } from 'framer-motion';
import Card from '../ui/Card';
import { 
  FileText, 
  CheckCircle, 
  Brain
} from 'lucide-react';

interface QuestionPreviewStatsProps {
  totalQuestions: number;
  selectedCount: number;
  analyzedCount: number;
}

const QuestionPreviewStats: React.FC<QuestionPreviewStatsProps> = ({
  totalQuestions,
  selectedCount,
  analyzedCount
}) => {
  const stats = [
    {
      title: '总题目数',
      value: totalQuestions,
      icon: FileText,
      color: 'blue',
      bgColor: 'from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30',
      borderColor: 'border-blue-200 dark:border-blue-700',
      textColor: 'text-blue-700 dark:text-blue-300',
      iconBgColor: 'bg-white/80 dark:bg-blue-900/50',
      iconColor: 'text-blue-700 dark:text-blue-300'
    },
    {
      title: '已选择',
      value: selectedCount,
      icon: CheckCircle,
      color: 'green',
      bgColor: 'from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30',
      borderColor: 'border-green-200 dark:border-green-700',
      textColor: 'text-green-700 dark:text-green-300',
      iconBgColor: 'bg-white/80 dark:bg-green-900/50',
      iconColor: 'text-green-700 dark:text-green-300'
    },
    {
      title: '已分析',
      value: analyzedCount,
      icon: Brain,
      color: 'purple',
      bgColor: 'from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30',
      borderColor: 'border-purple-200 dark:border-purple-700',
      textColor: 'text-purple-700 dark:text-purple-300',
      iconBgColor: 'bg-white/80 dark:bg-purple-900/50',
      iconColor: 'text-purple-700 dark:text-purple-300'
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className={`p-6 bg-gradient-to-br ${stat.bgColor} ${stat.borderColor} transition-all duration-200 hover:shadow-lg`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${stat.textColor}`}>
                    {stat.title}
                  </p>
                  <p className={`text-2xl font-bold ${stat.textColor}`}>
                    {stat.value}
                  </p>
                </div>
                <div className={`p-3 rounded-full ${stat.iconBgColor} ${stat.iconColor}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default QuestionPreviewStats; 