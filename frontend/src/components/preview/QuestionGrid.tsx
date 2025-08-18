import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SortableQuestionCard from './SortableQuestionCard';
import type { Question } from '../../types';

interface QuestionGridProps {
  questions: Question[];
  selectedQuestions: Question[];
  analyzingQuestions: string[];
  answerGeneratingQuestions?: string[];
  onSelect: (questionId: string, selected: boolean) => void;
  onEdit: (questionId: string) => void;
  onAnalyze: (questionId: string) => void;
  onDelete: (questionId: string) => void;
  onSplit?: (questionId: string) => void;
}

const QuestionGrid: React.FC<QuestionGridProps> = ({
  questions,
  selectedQuestions,
  analyzingQuestions,
  answerGeneratingQuestions = [],
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
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full"
    >
      <AnimatePresence>
        {questions.map((question, index) => (
          <motion.div
            key={question.id}
            variants={itemVariants}
            layout
            className="h-full w-full"
          >
            <SortableQuestionCard
              question={{
                ...question,
                isSelected: selectedQuestions.some(q => q.id === question.id)
              }}
              index={index}
              viewMode="grid"
              onSelect={(selected) => onSelect(question.id || question._id, selected)}
              onEdit={() => onEdit(question.id || question._id)}
              onAnalyze={() => onAnalyze(question.id || question._id)}
              onSplit={onSplit ? () => onSplit(question.id || question._id) : undefined}
              onDelete={() => onDelete(question.id || question._id)}
              isAnalyzing={question.id ? analyzingQuestions.includes(question.id) : false}
              isAnswerGenerating={question.id ? answerGeneratingQuestions.includes(question.id) : false}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
};

export default QuestionGrid; 