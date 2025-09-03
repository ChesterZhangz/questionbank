// 试卷相关类型定义
export interface Paper {
  id: string;
  name: string;
  type: 'lecture' | 'exercise' | 'exam';
  content: string;
  description?: string;
  tags: string[];
  status: 'draft' | 'published' | 'archived';
  createdAt: string;
  updatedAt: string;
  authorId: string;
  authorName: string;
  // 更多字段...
}

export interface PaperContent {
  type: 'text' | 'latex' | 'question' | 'image';
  id: string;
  content: string;
  startIndex: number;
  endIndex: number;
  metadata?: any;
}

export interface QuestionItem {
  id: string;
  title: string;
  content: string;
  type: 'choice' | 'fill' | 'solution';
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  bankName: string;
  createdAt: string;
  author: string;
  answer?: string;
  choices?: string[];
}
