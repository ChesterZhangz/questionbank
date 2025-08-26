import axios from 'axios';

interface QuestionAnalysis {
  category: string; // 小题型
  tags: string[]; // 知识点标签
  options?: string[]; // 选择题选项
  difficulty: number; // 难度等级 1-5
  questionType: 'choice' | 'multiple-choice' | 'fill' | 'solution'; // 题目类型
  confidence?: number; // 分析置信度
  alternativeTags?: string[]; // 替代标签建议
  difficultyRange?: [number, number]; // 难度范围
  skillRequirements?: string[]; // 技能要求
}

interface DeepSeekConfig {
  apiKey: string;
  baseURL?: string;
}

class QuestionAnalysisService {
  private config: DeepSeekConfig;
  private baseURL: string;

  constructor() {
    this.config = {
      apiKey: process.env.DEEPSEEK_API_KEY || '',
      baseURL: process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com/v1'
    };
    this.baseURL = this.config.baseURL || 'https://api.deepseek.com/v1';
  }

  // 难度评级：直接使用AI评级，不做额外调整
  private enforceStrictDifficulty(
    input: { difficulty: number; questionType?: string; options?: any },
    content: string
  ): number {
    // 直接返回AI的评级，不做额外调整
    const raw = Number.isFinite(input.difficulty) ? Math.round(input.difficulty) : 3;
    return Math.max(1, Math.min(5, raw));
  }

  private validateApiKey() {
    // 重新读取环境变量，确保dotenv.config()已执行
    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey || apiKey.trim() === '') {
      console.error('DEEPSEEK_API_KEY 未配置或为空');
      console.error('当前环境变量:', {
        NODE_ENV: process.env.NODE_ENV,
        DEEPSEEK_API_KEY: process.env.DEEPSEEK_API_KEY ? '已配置' : '未配置'
      });
      throw new Error('DeepSeek API密钥未配置，请在.env文件中设置DEEPSEEK_API_KEY');
    }
    return apiKey;
  }

  async analyzeQuestion(content: string): Promise<QuestionAnalysis> {
    try {
      // 检查DeepSeek API密钥
      const apiKey = process.env.DEEPSEEK_API_KEY;
      if (!apiKey) {
        throw new Error('DeepSeek API密钥未配置');
      }

      // 调用DeepSeek API进行智能分析
      const analysis = await this.performAnalysis(content);

      return analysis;
    } catch (error) {
      console.error('题目分析失败:', error);
      throw error;
    }
  }

  private async performAnalysis(content: string): Promise<QuestionAnalysis> {
    // 验证API密钥
    const apiKey = this.validateApiKey();
    
          const prompt = `你是一个专业的数学题目分析专家.请分析以下数学题目，并返回JSON格式的分析结果.
题目内容：${content}

## 分析要求：

### 1. 题目类型判断（questionType）
请根据以下规则判断题目类型：
- 如果题目包含选项（A、B、C、D等），判断为选择题(choice)
- 如果题目包含下划线"_"或"\\fill"，判断为填空题(fill)
- 如果题目包含"\\subp"或"\\subsubp"，判断为解答题(solution)
- 如果题目包含"求...的值"、"求...的范围"、"求...的最大值"、"求...的最小值"等表述，判断为解答题(solution)
- 如果题目没有明确的分问结构（\\subp、\\subsubp），但要求求解某个值或范围，也判断为解答题(solution)

### 2. 小题型分类（category）
从以下选项中最多选取3个相关的，返回为数组格式：
- '计算题', '创新题', '新定义题', '应用题', '综合题', 
  '实验题', '探究题', '开放题', '竞赛题', '判断题', '连线题', '排序题', '匹配题',
  '论述题', '分析题', '设计题', '评价题', '比较题', '归纳题',
  '概念题'

注意：category字段必须是数组格式，例如：["新定义题", "综合题"]，不要用逗号分隔的字符串

### 3. 知识点标签（tags）
从以下选项中选择最多5个相关的，你也可以添加额外的标签，比如函数之下还有函数的定义，函数的性质等，：
- 函数、导数、积分、函数的性质、奇偶函数、周期函数、函数的变换、函数的图像、抽象函数、极限、数列、概率、统计、几何、代数、三角、向量、矩阵、复数、不等式、方程、解析几何、立体几何

### 4. 选择题选项识别
- 如果题目包含选项，提取所有选项内容，格式为\\choice 选项内容（不加大括号）
- 选项格式通常是：A. 内容 B. 内容 C. 内容 D. 内容

### 5. 难度判断（difficulty）
根据题目复杂程度判断难度等级（1-5）.请客观、准确地评估题目难度：
| **星级** | **难度系数范围** | **题目类型**                  | **认知能力要求**               | **典型特征**                                                                 |
|----------|------------------|-------------------------------|--------------------------------|----------------------------------------------------------------------------|
| ★☆☆☆☆ (1星) | 0.9以上         | 最基础题（如选择题前3题）     | 计算、思维非常简单               | 简单计算，直接套用公式，或者简单分类讨论，或者非常直白的思路 |
| ★★☆☆☆ (2星) | 0.7-0.9         | 基础题（简单填空、基础解答）  | 理解、简单应用，计算量可以增加，                | 1-2个知识点，简单变换，计算量小，步骤不超过3步 |
| ★★★☆☆ (3星) | 0.5-0.7         | 中等题（常规解答题）          | 分析、综合应用，计算量非常大，一般需要通过技巧化简计算量  |可以有不同知识板块的组合，需要一定推理，步骤5步以内 |
| ★★★★☆ (4星) | 0.2-0.5         | 较难题（压轴题前部）          | 评价、复杂推理                 | 多知识点综合，需要创新思路，计算复杂，步骤较多 |
| ★★★★★ (5星) | 0.2以下         | 极难题（压轴题最后一问）      | 创造、思维很难，具有创新性               | 需要特殊技巧，计算极其复杂，区分度极高 |

**评级原则**：
- 根据题目实际复杂程度客观评级，不要刻意压低或抬高
- 选择题：简单题1-2星，中等题3星，复杂题4星，极难题5星
- 填空题：简单题1-2星，中等题3星，复杂题4星，极难题5星  
- 解答题：简单题2-3星，中等题3-4星，复杂题4-5星
- 如果题目的计算量偏大，但是思维量偏小，则最多三星. 四星一定要是有比较深的思维程度的题. 
- 多小题题目（含\\subp/\\subsubp）根据整体复杂度评级
- 竞赛题、压轴题等特殊题型可给到4-5星

### 6. 返回格式
请严格按照以下JSON格式返回，不要添加任何其他内容，不要添加任何解释，不要进行LaTeX转换：

{
  "category": ["小题型1", "小题型2"],
  "tags": ["知识点1", "知识点2", "知识点3"],
  "options": ["选项A内容", "选项B内容", "选项C内容", "选项D内容"],
  "difficulty": 3,
  "questionType": "choice"
}

注意：
- 如果题目不是选择题，options字段为空数组
- category字段必须是数组格式，最多包含3个元素
- tags数组最多包含5个元素
- difficulty必须是1-5的整数
- questionType必须是"choice"、"multiple-choice"、"fill"、"solution"之一
- 只返回JSON，不要有任何其他文字
- 不要对题目内容进行LaTeX转换，保持原始格式
- 确保所有标签都来自标准选项列表

分析结果：`;

    const response = await axios.post(`${this.baseURL}/chat/completions`, {
              model: 'deepseek-reasoner',
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.1,
      max_tokens: 1000,
      stream: false
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      timeout: 180000 // 3分钟超时 = 180000毫秒
    });

    if (response.data && response.data.choices && response.data.choices.length > 0) {
      const content = response.data.choices[0].message.content;
      
      // 尝试从响应中提取JSON部分
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const analysis = JSON.parse(jsonMatch[0]);
        console.log('DeepSeek分析结果:', analysis);

        // 直接使用AI评级，不做额外调整
        const rawDifficulty = Number.isInteger(analysis.difficulty) ? analysis.difficulty : parseInt(String(analysis.difficulty || 3), 10);
        const normalizedDifficulty = this.enforceStrictDifficulty({
          difficulty: rawDifficulty,
          questionType: analysis.questionType,
          options: analysis.options
        }, content);

        // 处理category字段：如果是字符串且包含逗号，则分割为数组
        let processedCategory = analysis.category || '综合题';
        if (typeof processedCategory === 'string' && processedCategory.includes(',')) {
          processedCategory = processedCategory.split(',').map(cat => cat.trim()).filter(cat => cat.length > 0);
        } else if (typeof processedCategory === 'string') {
          processedCategory = [processedCategory];
        } else if (!Array.isArray(processedCategory)) {
          processedCategory = ['综合题'];
        }

        return {
          category: processedCategory,
          tags: Array.isArray(analysis.tags) ? analysis.tags.slice(0, 5) : [],
          options: Array.isArray(analysis.options) ? analysis.options : [],
          difficulty: normalizedDifficulty,
          questionType: analysis.questionType || 'choice',
          confidence: 0.85, // 默认置信度
          alternativeTags: [], // 暂时为空
          difficultyRange: [Math.max(1, normalizedDifficulty - 1), Math.min(5, normalizedDifficulty + 1)] as [number, number],
          skillRequirements: [], // 暂时为空
        };
      } else {
        console.error('未找到JSON格式的响应:', content);
        throw new Error('DeepSeek返回的响应格式不正确');
      }
    } else {
      console.warn('DeepSeek返回结果为空');
      throw new Error('DeepSeek返回结果为空');
    }
  }
}

export const questionAnalysisService = new QuestionAnalysisService(); 