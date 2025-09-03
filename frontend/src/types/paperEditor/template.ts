// 模板相关类型定义
export interface Template {
  id: string;
  name: string;
  type: 'lecture' | 'exercise' | 'exam';
  structure: any;
  // 更多字段...
}
