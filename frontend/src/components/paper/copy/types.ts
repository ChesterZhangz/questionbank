// 复制模式类型定义
export type CopyMode = 'mareate' | 'normal';

// 题目类型
export interface Question {
  _id: string;
  type: string;
  content: {
    stem: string;
    options?: Array<{ text: string; isCorrect: boolean }>;
    answer: string;
    fillAnswers?: string[];
    solutionAnswers?: string[];
    solution?: string; // 详细解答
  };
  category?: string[];
  tags?: string[];
  difficulty?: number;
  source?: string;
  // 图片和TikZ支持
  images?: Array<{
    id: string;
    url: string;
    filename: string;
    order: number;
    bid?: string;
    format?: string;
    uploadedAt?: Date;
    uploadedBy?: string;
    cosKey?: string;
  }>;
  tikzCodes?: Array<{
    id: string;
    code: string;
    format: 'svg' | 'png';
    order: number;
    bid?: string;
    createdAt?: Date;
    createdBy?: string;
  }>;
}

// 试卷部分
export interface PaperSection {
  title: string;
  items: Array<{ 
    question: Question;
  }>;
}

// 试卷数据
export interface Paper {
  _id: string;
  name: string;
  type: 'practice';
  tags: string[];
  sections: PaperSection[];
  bank: {
    _id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
  owner: {
    username: string;
  };
}

// 复制配置
export interface CopyConfig {
  mode: CopyMode;
  addVspace: boolean;
  vspaceAmount: {
    choice: string;
    fill: string;
    solution: string;
    default: string;
  };
  // 复制方式选择
  copyMethod: 'clipboard' | 'overleaf';
  // 常规模式特有配置
  normalConfig?: {
    addDocumentEnvironment: boolean;
    paperSize: 'A4' | 'B5' | 'custom';
    customGeometry?: string;
  };
}
