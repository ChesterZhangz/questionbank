import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SortableQuestionCard from './SortableQuestionCard';
import type { Question } from '../../types';

interface QuestionListProps {
  questions: Question[];
  selectedQuestions: Question[];
  analyzingQuestions: string[];
  onSelect: (questionId: string, selected: boolean) => void;
  onEdit: (questionId: string) => void;
  onAnalyze: (questionId: string) => void;
  onDelete: (questionId: string) => void;
  onSplit?: (questionId: string) => void;
}

const QuestionList: React.FC<QuestionListProps> = ({
  questions,
  selectedQuestions,
  analyzingQuestions,
  onSelect,
  onEdit,
  onAnalyze,
  onDelete,
  onSplit
}) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-4 w-full"
    >
      <AnimatePresence>
        {questions.map((question, index) => (
          <motion.div
            key={question.id}
            variants={itemVariants}
            layout
            className="w-full"
          >
            <SortableQuestionCard
              question={{
                ...question,
                isSelected: selectedQuestions.some(q => q.id === question.id)
              }}
              index={index}
              viewMode="list"
              onSelect={(selected: boolean) => onSelect(question.id || question._id, selected)}
              onEdit={() => onEdit(question.id || question._id)}
              onAnalyze={() => onAnalyze(question.id || question._id)}
              onSplit={onSplit ? () => onSplit(question.id || question._id) : undefined}
              onDelete={() => onDelete(question.id || question._id)}
              isAnalyzing={question.id ? analyzingQuestions.includes(question.id) : false}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
};

export default QuestionList; 