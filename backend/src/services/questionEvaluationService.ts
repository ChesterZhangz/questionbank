import axios from 'axios';

// 题目评价请求接口
export interface QuestionEvaluationRequest {
  content: string;           // 题目内容
  solution?: string;         // 解析内容
  solutionAnswers?: string[]; // 解答步骤
  tags: string[];            // 知识点标签
  difficulty: number;        // 难度等级
  category: string[];        // 题目分类
  questionType: string;      // 题目类型
}

// 题目评价结果接口
export interface QuestionEvaluationResult {
  overallRating: number;     // 综合评分（1-10）
  evaluationReasoning: string; // 评价理由
  lastUpdated: string;       // 最后更新时间
}

// 核心能力评估接口
export interface CoreAbilities {
  logicalThinking: number;         // 逻辑思维 (1-10)
  mathematicalIntuition: number;   // 数学直观 (1-10)
  problemSolving: number;          // 问题解决 (1-10)
  analyticalSkills: number;        // 分析能力 (1-10)
  creativeThinking: number;        // 创造性思维 (1-10)
  computationalSkills: number;     // 计算技能 (1-10)
}

// 完整分析结果接口
export interface CompleteAnalysisResult {
  evaluation: QuestionEvaluationResult;
  coreAbilities: CoreAbilities;
  analysisTimestamp: string;
  analysisVersion: string;
}

// DeepSeek配置接口
interface DeepSeekConfig {
  apiKey: string;
  baseURL: string;
}

class QuestionEvaluationService {
  private config: DeepSeekConfig;
  private baseURL: string;

  constructor() {
    this.config = {
      apiKey: process.env.DEEPSEEK_API_KEY || '',
      baseURL: process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com/v1'
    };
    this.baseURL = this.config.baseURL;
  }

  private validateApiKey() {
    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey || apiKey.trim() === '') {
      throw new Error('DeepSeek API密钥未配置，请在.env文件中设置DEEPSEEK_API_KEY');
    }
    return apiKey;
  }

  // 生成题目评价
  async evaluateQuestion(request: QuestionEvaluationRequest): Promise<QuestionEvaluationResult> {
    try {
      const apiKey = this.validateApiKey();
      
      const prompt = this.generateEvaluationPrompt(request);
      
      const response = await axios.post(`${this.baseURL}/chat/completions`, {
        model: 'deepseek-reasoner',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 2000,
        stream: false
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        timeout: 120000 // 2分钟超时
      });

      if (response.data && response.data.choices && response.data.choices.length > 0) {
        const content = response.data.choices[0].message.content;
        
        // 尝试从响应中提取JSON部分
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            const result = JSON.parse(jsonMatch[0]);
            console.log('DeepSeek评价结果:', result);
            
            return {
              overallRating: result.overallRating || 5,
              evaluationReasoning: result.evaluationReasoning || '题目评价生成中...',
              lastUpdated: new Date().toISOString()
            };
          } catch (parseError) {
            console.error('JSON解析失败:', parseError);
            throw new Error('DeepSeek返回的响应格式不正确');
          }
        } else {
          throw new Error('DeepSeek返回的响应格式不正确');
        }
      } else {
        throw new Error('DeepSeek返回结果为空');
      }
    } catch (error) {
      console.error('题目评价生成失败:', error);
      throw error;
    }
  }

  // 获取题目完整分析
  async getCompleteAnalysis(questionId: string, questionData: any): Promise<CompleteAnalysisResult> {
    try {
      // 生成题目评价
      const evaluation = await this.evaluateQuestion({
        content: questionData.content.stem,
        solution: questionData.content.solution,
        solutionAnswers: questionData.content.solutionAnswers,
        tags: questionData.tags || [],
        difficulty: questionData.difficulty || 3,
        category: questionData.category ? (Array.isArray(questionData.category) ? questionData.category : [questionData.category]) : ['综合题'],
        questionType: questionData.type || 'solution'
      });

      // 生成核心能力评估
      const coreAbilities = await this.generateCoreAbilities(questionData);

      return {
        evaluation,
        coreAbilities,
        analysisTimestamp: new Date().toISOString(),
        analysisVersion: '1.0.0'
      };
    } catch (error) {
      console.error('获取完整分析失败:', error);
      throw error;
    }
  }

  // 批量评价题目
  async batchEvaluateQuestions(questions: any[]): Promise<Array<{questionId: string, success: boolean, evaluation?: QuestionEvaluationResult, error?: string}>> {
    const results = [];
    
    for (const question of questions) {
      try {
        const evaluation = await this.evaluateQuestion({
          content: question.content.stem,
          solution: question.content.solution,
          solutionAnswers: question.content.solutionAnswers,
          tags: question.tags || [],
          difficulty: question.difficulty || 3,
          category: question.category ? (Array.isArray(question.category) ? question.category : [question.category]) : ['综合题'],
          questionType: question.type || 'solution'
        });
        
        results.push({
          questionId: question.qid || question._id,
          success: true,
          evaluation
        });
      } catch (error) {
        results.push({
          questionId: question.qid || question._id,
          success: false,
          error: error instanceof Error ? error.message : '未知错误'
        });
      }
    }
    
    return results;
  }

  // 更新评价结果
  async updateEvaluation(questionId: string, evaluation: Partial<QuestionEvaluationResult>): Promise<void> {
    // 这里可以实现评价结果的更新逻辑
    // 暂时只是日志记录
    console.log(`更新题目 ${questionId} 的评价结果:`, evaluation);
  }

  // 生成核心能力评估
  private async generateCoreAbilities(questionData: any): Promise<CoreAbilities> {
    try {
      const apiKey = this.validateApiKey();
      
      const prompt = this.generateAbilityAssessmentPrompt(questionData);
      
      const response = await axios.post(`${this.baseURL}/chat/completions`, {
        model: 'deepseek-reasoner',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1500,
        stream: false
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        timeout: 90000 // 1.5分钟超时
      });

      if (response.data && response.data.choices && response.data.choices.length > 0) {
        const content = response.data.choices[0].message.content;
        
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            const result = JSON.parse(jsonMatch[0]);
            console.log('DeepSeek能力评估结果:', result);
            
            return {
              logicalThinking: result.logicalThinking || 5,
              mathematicalIntuition: result.mathematicalIntuition || 5,
              problemSolving: result.problemSolving || 5,
              analyticalSkills: result.analyticalSkills || 5,
              creativeThinking: result.creativeThinking || 5,
              computationalSkills: result.computationalSkills || 5
            };
          } catch (parseError) {
            console.error('能力评估JSON解析失败:', parseError);
            return this.getDefaultCoreAbilities();
          }
        } else {
          return this.getDefaultCoreAbilities();
        }
      } else {
        return this.getDefaultCoreAbilities();
      }
    } catch (error) {
      console.error('能力评估生成失败:', error);
      return this.getDefaultCoreAbilities();
    }
  }

  // 生成评价提示词
  private generateEvaluationPrompt(request: QuestionEvaluationRequest): string {
    const { content, solution, solutionAnswers, tags, difficulty, category, questionType } = request;
    
    return `你是一个专业的数学题目评价专家。请分析以下数学题目，并给出综合评价。

题目内容：${content}
题目类型：${questionType}
难度等级：${difficulty}星
小题型：${category.join(', ')}
知识点：${tags.join(', ')}
${solution ? `解析：${solution}` : ''}
${solutionAnswers && solutionAnswers.length > 0 ? `解答步骤：${solutionAnswers.join('; ')}` : ''}

## 评价要求：

### 1. 综合评分（overallRating）
请根据以下维度综合评分（1-10分）：
- 题目的质量：题目涉及到的思维量较大，同时计算量不大，则能够给到不错的分数. 如果题目涉及的计算量太大，但是计算的化简没有思维量，则给低分. 如果题目涉及到的思维量与计算量都很大，并且计算不能很有效地化简，那么最多给7分. 题目的质量需要保证题目的思维量（创新思维）、计算量以及题目知识点的融合非常成功，越是这样的题目给的分数越高. 
- 题目对学生的适合程度：学生对题目需要有理解性，越难读懂，但是有跨领域性意义的题目越可以给高分，相反题目给低分. 
- 题目叙述：题目的叙述是简约的，是有数学风范与深度的. 

### 2. 题目评价：
请简要说明题目，包括以下内容：
- 题目的优点和特色，指出该题目用到了哪些技巧与方法.
- 题目考察的具体方向.
- 对学习者的价值评估，具体指适合怎样水平的学习者，适合怎样的学习阶段.

### 3. 返回格式
请严格按照以下JSON格式返回，不要添加任何其他内容：

{
  "overallRating": 2,
  "evaluationReasoning": "这是一道思维性...的题目，整体的难度大/中/小，... ......"
}

注意：
- overallRating必须是1-10的整数
- evaluationReasoning要简洁明了，不超过300字，关于题目本身的评价，不要关注到题目解析. 
- 只返回JSON格式，不要有任何其他文字
- 评价要客观公正，基于题目本身的质量

请开始分析题目：`;
  }

  // 生成能力评估提示词
  private generateAbilityAssessmentPrompt(questionData: any): string {
    const { content, solution, tags, difficulty, type } = questionData;
    
    return `你是一个专业的数学能力评估专家。请分析以下数学题目对各项核心能力的培养价值。

题目内容：${content}
题目类型：${type}
难度等级：${difficulty}星
知识点：${tags ? tags.join(', ') : '数学'}
${solution ? `解析：${solution}` : ''}

## 能力评估要求：

请评估这道题目对以下6项核心能力的培养价值（1-10分）：

1. **逻辑思维（logicalThinking）**：题目对逻辑推理、思维严密性的要求
2. **数学直观（mathematicalIntuition）**：题目对数学直觉、几何直观的培养
3. **问题解决（problemSolving）**：题目对问题分析、解决策略的要求
4. **分析能力（analyticalSkills）**：题目对数据分析和模式识别的要求
5. **创造性思维（creativeThinking）**：题目对创新思路、灵活思维的要求
6. **计算技能（computationalSkills）**：题目对计算能力和技巧的要求
---

### 1. **逻辑思维 (logicalThinking)**
评估题目本身在逻辑结构、推理链条严密性、以及证明过程中的内在要求。

| 分数 | 标准描述|
| :--- | :--- |
| **0** | 题目不需要逻辑性思考，一般可以直接看出答案来。如：已知某个条件，就直接可以求出答案. |
| **1-3** | 逻辑思维的步骤非常少，完全不需要自己组织逻辑框架，基本可以在3-5步解决问题（当步骤是五步时，给出3分难度）.|
| **4-6** | 需要在做题之前有一个清晰的逻辑框架与思路，需要有对题目的不同条件进行处理后，将条件整合在一起的逻辑. 包含一个清晰的、多步骤（6-8步）的逻辑推理链条。|
| **7-8** | 逻辑结构复杂，包含多个子推理链条或需要处理多个相互关联的条件. 比如数学归纳法、反证法等数学基本方法只是完成题目的一部分，更多需要学生通过题目与自身的思维组织一套完整的框架出来. |
| **9-10** | 逻辑极其严密且复杂，如同一篇微型证明。要求处理隐藏极深的前提、多种可能性或极其复杂的条件关系。任何一步的逻辑瑕疵都会导致失败。 |

### 2. **数学直观 (mathematicalIntuition)**
评估题目在构建数学结构、发现模式、形成猜想或几何想象方面的内在要求。

| 分数 | 标准描述 (针对题目本身) |
| :--- | :--- |
| **0** | 题目是纯粹的机械计算或信息检索，不涉及任何模式、结构或空间关系。 |
| **1-3** | 模式极其明显且单一（如简单数列），几何图形为标准图形且无需辅助线或想象。 |
| **4-6** | 需要识别一个不太明显的模式或一个标准数学结构的性质（如函数性质、基本几何定理的应用）。 |
| **7-8** | 题目的核心难点在于洞察一个非平凡的模式、关系或几何构造。解题的关键一步依赖于“灵光一现”的直观猜想。 |
| **9-10** | 题目本身设计旨在考验非凡的数学洞察力，其解答依赖于发现极其深刻或反直觉的数学结构、对称性、或拓扑/空间关系。 |

### 3. **问题解决 (problemSolving)**
评估题目在定义问题、制定策略、整合资源及规划步骤方面的综合要求。

| 分数 | 标准描述 (针对题目本身) |
| :--- | :--- |
| **0** | 问题已被完全定义，解决方法单一、直接且明确给出，无需任何策略规划。 |
| **1-3** | 解决路径是线性的、唯一的，且已被题目暗示。只需简单应用一种标准方法。 |
| **4-6** | 需要从2-3种已知策略中选择合适的一种，或需要将问题分解为几个明确的子任务。 |
| **7-8** | 解决策略非平凡，需要自主设计多步骤方案，灵活组合多种技巧，或需要克服一个关键的“瓶颈”。 |
| **9-10** | 题目是开放性的或策略极其复杂。需要创造性地定义问题边界、设计全新的解决框架，或管理多个并行、迭代的解决路径。 |

### 4. **分析能力 (analyticalSkills)**
评估题目在处理数据、解析信息、比较、对比和进行系统性剖析方面的要求。

| 分数 | 标准描述 (针对题目本身) |
| :--- | :--- |
| **0** | 无数据、文本或信息需要处理；或所需信息可直接使用，无需任何分析。 |
| **1-2** | 题目条件简单明确，无需深入分析。 |
| **3-4** | 需要处理2-3个条件或数据点，进行简单的比较或计算，但分析路径仍然较短，逻辑链条在3-5步内可以完成。 |
| **5-6** | 需要分析多个相关条件，进行中等复杂度的数据处理，逻辑链条需要6-8步，需要学生有一定的分析思维。 |
| **7-8** | 题目包含多个维度的信息，需要系统性分析，逻辑链条复杂（8-12步），需要结合不同数学领域进行分析，分析路径较长。 |
| **9-10** | 题目包含大量、复杂或模糊的数据集/信息，其核心要求是进行高阶分析，如推断潜在变量、构建预测模型、或进行严密的系统优化分析。分析路径必须超过12步，需要有创新性的分析与非常独到的理解！ |

### 5. **创造性思维 (creativeThinking)**
评估题目在鼓励突破常规、采用非常规方法或产生新颖解决方案方面的内在潜力。

| 分数 | 标准描述 (针对题目本身) |
| :--- | :--- |
| **0** | 不需要任何创造性思维，通过概念或公式可以在一步内完成解答 |
| **1-3** | 学生需要将题目对应知识点的公式熟练运用，并且该题目一定是简单题，如果是2/5星，最多给出3分.学生不必要将公式组合在一起创造出新的公式. |
| **4-6** | 解决该问题时，学生需要从问题出发有自己的想法，不拘泥于固定的套路，有一步自己的思考即可（如果对思维的能力较难度可以给高），一般是3/5星题的创造性程度，但是需要将一些公式组合在一起，产生出新的公式，这样的话给6分. |
| **7-8** | 一定需要读者有自己的构造或者其他数学能力。需要读者避免用常规的方法增加计算量，而是有“巧妙”的捷径或非常规方法，并且学生需要自己思考出两步即以上，这些方法是出题者意图的一部分。 |
| **9-10** | 题目的设计初衷就是激发创造性解答。其可能有多解（且均有效），或要求打破思维定势，以一种全新的视角看待问题，甚至可能产生出题者都未预料到的解法。 |

### 6. **计算技能 (computationalSkills)**
评估题目在数值计算、符号运算、算法执行及技术复杂度方面的要求。

| 分数 | 标准描述 (针对题目本身) |
| :--- | :--- |
| **0** | 计算能力要求很低，基本不会计算错误. |
| **1-3** | 涉及简单的算术运算或直接代入公式，基本三步运算到六步很显然的运算（依据步骤区分难度） |
| **4-6** | 对解方程与根式运算有一定要求，需要一定的计算能力，越复杂难度越高（取决于方程的复杂以及每一步之间计算量的堆积） |
| **7-8** | 计算过程复杂且繁琐，是解题的主要负担，涉及到比较多的代数化简，需要用到一定的技巧来完成运算化简，从而才能解决问题。 |
| **9-10** | 计算要求极高，近乎于“体力劳动”。可能需要极其复杂的符号运算、大规模迭代或数值计算，其本身就是一个重大的挑战。 |

重点中的重点：你可以针对于你收到的题目与题目对应的解析进行综合评估，如果你发现题目的解析中有大量的运算，那么这道题的重点肯定是有计算能力的！！！你不要自顾自瞎评分，有些过程虽然长但是思维的跨度很小！！！请你仔细认真评分！！！

## 返回格式
请严格按照以下JSON格式返回：

{
  "logicalThinking": 2,
  "mathematicalIntuition": 2,
  "problemSolving": 1,
  "analyticalSkills": 0,
  "creativeThinking": 1,
  "computationalSkills": 1
}

注意：
- 所有分数必须是1-10的整数
- 基于题目内容客观评估，不要主观臆断
- 只返回JSON格式，不要有任何其他文字

请开始评估：`;
  }

  // 获取默认核心能力评估
  private getDefaultCoreAbilities(): CoreAbilities {
    // 返回中等水平的默认值，表示基础能力要求
    return {
      logicalThinking: 3,
      mathematicalIntuition: 3,
      problemSolving: 3,
      analyticalSkills: 3,
      creativeThinking: 3,
      computationalSkills: 3
    };
  }
}

export const questionEvaluationService = new QuestionEvaluationService();
