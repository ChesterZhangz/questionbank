import axios from 'axios';




interface DeepSeekResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// 选择题识别结果接口
interface ChoiceQuestionResult {
  isChoiceQuestion: boolean;
  questionContent: string;
  options: string[];
}

// 填空题识别结果接口
interface FillQuestionResult {
  isFillQuestion: boolean;
  questionContent: string;
  blanks: number[]; // 下划线位置信息
}

// 题目分割结果接口
interface QuestionSplitResult {
  questions: string[];
  totalCount: number;
}

// 题目处理结果接口
interface ProcessedQuestion {
  type: 'choice' | 'fill' | 'solution';
  content: string;
  options?: string[];
  blanks?: number[];
}

interface DeepSeekConfig {
  apiKey: string;
  baseURL?: string;
}

class DeepSeekAIService {
  private config: DeepSeekConfig;
  private baseURL: string;

  constructor(config: DeepSeekConfig) {
    this.config = config;
    this.baseURL = config.baseURL || 'https://api.deepseek.com/v1';
  }

  // 智能JSON解析方法，处理包含LaTeX公式的JSON
  private parseJsonWithLatex(content: string): any {
    try {
      // 直接使用正则表达式提取，不尝试JSON解析
      const result: any = {};
      
      // 提取布尔值
      const isChoiceMatch = content.match(/"isChoiceQuestion"\s*:\s*(true|false)/i);
      if (isChoiceMatch) {
        result.isChoiceQuestion = isChoiceMatch[1].toLowerCase() === 'true';
      }
      
      const isFillMatch = content.match(/"isFillQuestion"\s*:\s*(true|false)/i);
      if (isFillMatch) {
        result.isFillQuestion = isFillMatch[1].toLowerCase() === 'true';
      }
      
      // 提取questionContent - 处理转义字符
      const contentMatch = content.match(/"questionContent"\s*:\s*"((?:[^"\\\\]|\\\\.)*)"/);
      if (contentMatch) {
        // 解码转义字符
        result.questionContent = contentMatch[1]
          .replace(/\\\\/g, '\\')  // 双反斜杠变单反斜杠
          .replace(/\\"/g, '"')    // 转义双引号变普通双引号
          .replace(/\\n/g, '\n')   // 转义换行符
          .replace(/\\t/g, '\t');  // 转义制表符
      }
      
      // 提取options数组 - 处理转义字符
      const optionsMatch = content.match(/"options"\s*:\s*\[(.*?)\]/s);
      if (optionsMatch) {
        const optionsStr = optionsMatch[1];
        // 匹配每个选项，处理转义字符
        const optionMatches = optionsStr.match(/"((?:[^"\\\\]|\\\\.)*)"/g);
        if (optionMatches) {
          result.options = optionMatches.map(opt => {
            const content = opt.slice(1, -1); // 去掉引号
            return content
              .replace(/\\\\/g, '\\')
              .replace(/\\"/g, '"')
              .replace(/\\n/g, '\n')
              .replace(/\\t/g, '\t');
          });
        }
      }
      
      // 提取blanks数组
      const blanksMatch = content.match(/"blanks"\s*:\s*\[(.*?)\]/);
      if (blanksMatch) {
        const blanksStr = blanksMatch[1];
        const blankMatches = blanksStr.match(/\d+/g);
        if (blankMatches) {
          result.blanks = blankMatches.map(Number);
        }
      }
      
      // 提取questions数组 - 处理转义字符
      const questionsMatch = content.match(/"questions"\s*:\s*\[(.*?)\]/s);
      if (questionsMatch) {
        const questionsStr = questionsMatch[1];
        const questionMatches = questionsStr.match(/"((?:[^"\\\\]|\\\\.)*)"/g);
        if (questionMatches) {
          result.questions = questionMatches.map(q => {
            const content = q.slice(1, -1); // 去掉引号
            return content
              .replace(/\\\\/g, '\\')
              .replace(/\\"/g, '"')
              .replace(/\\n/g, '\n')
              .replace(/\\t/g, '\t');
          });
        }
      }
      
      // 提取totalCount
      const totalCountMatch = content.match(/"totalCount"\s*:\s*(\d+)/);
      if (totalCountMatch) {
        result.totalCount = parseInt(totalCountMatch[1]);
      }
      
      if (Object.keys(result).length > 0) {
        console.log('正则表达式提取成功:', result);
        return result;
      }
      
      console.log('正则表达式提取失败，返回null');
      return null;
    } catch (error) {
      console.error('正则表达式提取失败:', error);
      return null;
    }
  }

  // 调用DeepSeek API
  async correctLatex(rawText: string): Promise<string> {
    try {
      // 验证API密钥
      if (!this.config.apiKey || this.config.apiKey.trim() === '') {
        throw new Error('DeepSeek API密钥未配置');
      }

      const url = `${this.baseURL}/chat/completions`;

      const prompt = `你是一个专业的数学LaTeX格式转换专家.请将以下数学题目文本转换为规范的LaTeX格式.

原始文本：${rawText}

## 转换规则（必须严格遵守）：

### 1. 基本原则
- 避免过度分割，尽量将相关的数学内容放在同一个$...$内
- 不要为每个单独的符号都加$...$
- 保持文本的自然流畅性

### 2. 数学变量和函数
- 将函数和其参数作为一个整体：f(x) → $f(x)$
- 将变量和其下标作为一个整体：x_1, x_2 → $x_1$, $x_2$
- 将极值变量作为一个整体：M, N → $M$, $N$

### 3. 区间符号
- 将整个区间作为一个整体：[-2023, 2023] → $[-2023, 2023]$
- 不要分割区间内的内容

### 4. 数学公式和等式
- 将整个等式作为一个整体：f(x_1 + x_2) = f(x_1) + f(x_2) - 2024 → $f(x_1 + x_2) = f(x_1) + f(x_2) - 2024$
- 不要将等式的左右两边分开

### 6. 将所有的数学符号写在美刀符号之间，如果遇到括号，则必须要写成$\left($与$\right)$（中括号、大括号都行）的形式.如果遇到$\\sum$或一些大写的符号，则需要添加$\\displaystyle$让符号变成大写. 

### 7. 分数格式（严格使用\\dfrac）
- 普通分数：1/2 → $\\dfrac{1}{2}$
- 复杂分数：x/(x+1) → $\\dfrac{x}{x+1}$
- 嵌套分数：1/(1+1/2) → $\\dfrac{1}{1+\\dfrac{1}{2}}$
- 绝对不允许使用 \\frac，必须使用 \\dfrac

### 8. 数学环境
- 方程组使用：$\\left\\{\\begin{aligned} ... \\end{aligned}\\right.$
- 示例：
  $\\left\\{\\begin{aligned} 
  x + y &= 1 \\\\ 
  x - y &= 2 
  \\end{aligned}\\right.$

### 9. 题目专用语法
- 选择题问题使用 \\choice
  - 示例：则$x$的值为（）-> 则$x$的值为 \\choice 
- 填空题：使用 \\fill（注意：\\fill 不需要$...$包裹，直接使用\\fill）
  - 示例：值为 _ → 值为 \\fill
  - 示例：答案是 _ → 答案是 \\fill
- 小题：使用 \\subp 内容（注意：不使用花括号，用空格分隔）
  - 示例：(1) 求x → \\subp 求x
  - 示例：(2) 求y → \\subp 求y
- 子小题：使用 \\subsubp 内容（注意：不使用花括号，用空格分隔）
  - 示例：i. 第一步 → \\subsubp 第一步
  - 示例：ii. 第二步 → \\subsubp 第二步
- 使用\\textit{...}表示任何新定义（如 称...为...等）内容
- 数学符号：自然底数用$\\mathbf{e}$，虚数用$\\mathbf{i}$
- 如果表示数字的集合，使用$\\mathbb{}$，如$\\mathbb{Z}$等

### 10. 填空题处理
- 独立的下划线"_"转换为"\\fill"（注意：\\fill 不需要$...$包裹，直接使用\\fill）
- 变量下标中的下划线保持不变：x_1 → $x_1$

### 11. 中文描述
- 保持中文描述的自然性
- 适当添加中文标点符号
- 避免过度格式化中文文本
- **重要**：将所有句号"."改为句点"."
- **重要**：去掉题目开头的难度标签，如"简单"、"中等"、"困难"等

【重要规则】
1. 如果题目内容中包含类似"2025年浙江八校联考高一期中·$T11$"等来源信息，请直接删除，不要出现在分析结果中.
2. 选择题选项格式必须为：\\choice 选项内容（不加大括号，不要写成\\choice{内容}，而是\\choice 内容）.
3. 将所有enumerate环境去掉

### 12. 格式要求
- 只返回转换后的LaTeX文本
- 不要添加任何解释或注释
- 确保文本的完整性和可读性
- 选择题中的\\ldots 或者 \\dots 全部去掉
- 避免重复或多余的$符号
- **标点符号**：使用句点"."而不是句号"."
- **难度标签**：删除开头的"简单"、"中等"、"困难"等标签
- 如果题目有分值，全部去除，不要保留任何分值的地方. 

### 13. 示例转换
输入：中等若定义区间[-2023, 2023]上的函数 f(x)满足:对任意的x_1,x_2∈[-2023,2023]，均成立 f(x_1+x_2)=f(x_1)+f(x_2)-2024 记f(x)的最大值为 M,最小值为 N,则 M+N的值为 _.
输出：若定义区间$[-2023, 2023]$上的函数$f(x)$满足：对任意的$x_1, x_2 \in [-2023, 2023]$，均成立$$f(x_1 + x_2) = f(x_1) + f(x_2) - 2024$$记$f(x)$的最大值为$M$，最小值为$N$，则$M + N$的值为\\fill.

输入：解方程组 x+y=1, x-y=2
输出：解方程组 $\\left\\{\\begin{aligned} x + y &= 1 \\\\ x - y &= 2 \\end{aligned}\\right.$

### 14. 数学符号格式要求
- **重要**：所有数学符号用$...$表示，例如：$\\dfrac{1}{2}$、$x^2$、$\\sqrt{3}$等
- 确保所有数学表达式都被正确包裹在$符号中
- 避免在$符号外出现数学符号
- 对$\\sum$、$\\prod$等有大写的数学内容使用$\\displaystyle \\sum$的样式
- 使用$\\dfrac$而不要使用$\\frac$
- 虚数单位i使用$\\mathbf{i}$，自然底数e使用$\\mathbf{e}$
- 数学环境不使用cases，而是使用$\\left\\{ \\begin{aligned}...\\end{aligned}\\right.$的形式
- 在编写的时候保留题目，不要留下任何分值与题目的序号
- 去除所有图片引用与\\tikz的使用
- 如果表示数字的集合，使用$\\mathbb{}$，如$\\mathbb{Z}$等

转换结果：`;

      const response = await axios.post<DeepSeekResponse>(url, {
        model: 'deepseek-chat',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.1,
        max_tokens: 8000,
        stream: false
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`
        },
        timeout: 180000 // 3分钟超时 = 180000毫秒
      });

      if (response.data && response.data.choices && response.data.choices.length > 0) {
        const content = response.data.choices[0].message.content;
        return content.trim();
      } else {
        console.warn('DeepSeek返回结果为空，使用原始文本');
        return rawText;
      }
    } catch (error: any) {
      console.error('DeepSeek AI矫正失败:', error.response?.data || error.message);
      console.log('使用原始转换结果');
      return rawText;
    }
  }

  // 识别选择题并提取选项
  async recognizeChoiceQuestion(rawText: string): Promise<ChoiceQuestionResult> {
    try {
      // 验证API密钥
      if (!this.config.apiKey || this.config.apiKey.trim() === '') {
        throw new Error('DeepSeek API密钥未配置');
      }

      const url = `${this.baseURL}/chat/completions`;

      const prompt = `你是一个专业的数学题目分析专家.请分析以下数学题目，判断是否为选择题，如果是选择题，请提取题目内容和选项.

原始文本：${rawText}

## 分析要求：

### 1. 选择题判断
- 如果题目包含"下列说法正确的是"、"下列选项正确的是"、"选择正确的选项"等表述
- 如果题目包含A、B、C、D等选项标记
- 如果题目有选项，则判断为选择题

### 2. 内容提取原则
- **重要**：questionContent应该包含完整的题目描述，包含题目的核心内容
- 如果是选择题，将明确的选项（如A. xxx B. xxx C. xxx D. xxx）单独提取到options中
- 如果题目很长或包含多个部分，确保questionContent包含完整的题意

### 3. 转换规则：

“
### 1. 基本原则
- 避免过度分割，尽量将相关的数学内容放在同一个$...$内
- 不要为每个单独的符号都加$...$
- 保持文本的自然流畅性

### 2. 数学变量和函数
- 将函数和其参数作为一个整体：f(x) → $f(x)$
- 将变量和其下标作为一个整体：x_1, x_2 → $x_1$, $x_2$
- 将极值变量作为一个整体：M, N → $M$, $N$

### 3. 区间符号
- 将整个区间作为一个整体：[-2023, 2023] → $[-2023, 2023]$
- 不要分割区间内的内容

### 4. 数学公式和等式
- 将整个等式作为一个整体：f(x_1 + x_2) = f(x_1) + f(x_2) - 2024 → $f(x_1 + x_2) = f(x_1) + f(x_2) - 2024$
- 不要将等式的左右两边分开

### 6. 将所有的数学符号写在美刀符号之间，如果遇到括号，则必须要写成$\\left($与$\\right)$（中括号、大括号都行）的形式.如果遇到$\\sum$或一些大写的符号，则需要添加$\\displaystyle$让符号变成大写. 

### 7. 分数格式（严格使用\\dfrac）
- 普通分数：1/2 → $\\dfrac{1}{2}$
- 复杂分数：x/(x+1) → $\\dfrac{x}{x+1}$
- 嵌套分数：1/(1+1/2) → $\\dfrac{1}{1+\\dfrac{1}{2}}$
- 绝对不允许使用 \\frac，必须使用 \\dfrac

### 8. 数学环境
- 方程组使用：$\\left\\{\\begin{aligned} ... \\end{aligned}\\right.$
- 示例：
  $\\left\\{\\begin{aligned} 
  x + y &= 1 \\\\ 
  x - y &= 2 
  \\end{aligned}\\right.$

### 9. 题目专用语法
- 数学符号：自然底数用$\\mathbf{e}$，虚数用$\\mathbf{i}$

### 10. 填空题处理
- 独立的下划线"_"转换为"\\fill"（注意：\\fill 不需要$...$包裹，直接使用\\fill）
- 变量下标中的下划线保持不变：x_1 → $x_1$

### 11. 中文描述
- 保持中文描述的自然性
- 适当添加中文标点符号
- 避免过度格式化中文文本
- **重要**：将所有句号"."改为句点"."
- **重要**：去掉题目开头的难度标签，如"简单"、"中等"、"困难"等

【重要规则】
1. 如果题目内容中包含类似"2025年浙江八校联考高一期中·$T11$"等来源信息，请直接删除，不要出现在分析结果中.
2. 选择题选项格式必须为：\\choice 选项内容（不加大括号，不要写成\\choice{内容}，而是\\choice 内容）.
3. 将所有enumerate环境去掉

### 12. 格式要求
- 只返回转换后的LaTeX文本
- 不要添加任何解释或注释
- 确保文本的完整性和可读性
- 选择题中的\\ldots 或者 \\dots 全部去掉
- 避免重复或多余的$符号
- **标点符号**：使用句点"."而不是句号"."
- **难度标签**：删除开头的"简单"、"中等"、"困难"等标签
- 如果题目有分值，全部去除，不要保留任何分值的地方. 
“

### 4. 返回格式
请严格按照以下JSON格式返回，不要添加任何其他内容：

{
  "isChoiceQuestion": true/false,
  "questionContent": "完整的题目内容（如果是选择题，包含题目描述但不包含ABCD选项）",
  "options": ["选项A内容", "选项B内容", "选项C内容", "选项D内容"]
}

注意：
- 如果不是选择题，isChoiceQuestion为false，questionContent为完整原文，options为空数组
- 如果是选择题，isChoiceQuestion为true，questionContent包含完整的题目描述
- 确保questionContent不丢失题目的任何关键信息
- **重要**：所有数学符号用$...$表示，例如：$\\dfrac{1}{2}$、$x^2$、$\\sqrt{3}$等
- 只返回JSON，不要有任何其他文字

分析结果：`;

      const response = await axios.post<DeepSeekResponse>(url, {
        model: 'deepseek-chat',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.1,
        max_tokens: 8000,
        stream: false
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`
        },
        timeout: 180000 // 3分钟超时 = 180000毫秒
      });

      if (response.data && response.data.choices && response.data.choices.length > 0) {
        const content = response.data.choices[0].message.content;
        
        // 使用智能JSON解析方法
        const result = this.parseJsonWithLatex(content);
        if (result) {
          return {
            isChoiceQuestion: result.isChoiceQuestion || false,
            questionContent: result.questionContent || '',
            options: result.options || []
          };
        } else {
          console.error('JSON解析失败，无法提取选择题信息');
        }
        
        return {
          isChoiceQuestion: false,
          questionContent: rawText,
          options: []
        };
      } else {
        console.warn('DeepSeek返回结果为空');
        return {
          isChoiceQuestion: false,
          questionContent: rawText,
          options: []
        };
      }
    } catch (error: any) {
      console.error('DeepSeek选择题识别失败:', error.response?.data || error.message);
      return {
        isChoiceQuestion: false,
        questionContent: rawText,
        options: []
      };
    }
  }

  // 识别填空题
  async recognizeFillQuestion(rawText: string): Promise<FillQuestionResult> {
    try {
      if (!this.config.apiKey || this.config.apiKey.trim() === '') {
        throw new Error('DeepSeek API密钥未配置');
      }

      const url = `${this.baseURL}/chat/completions`;

      const prompt = `你是一个专业的数学题目分析专家.请分析以下数学题目，判断是否为填空题，如果是填空题，请提取题目内容和填空位置.

原始文本：${rawText}

## 分析要求：

### 1. 填空题判断
- 如果题目包含下划线"_"、括号"()"、方括号"[]"等填空标记
- 如果题目要求填写答案或数值
- 如果题目有明确的填空位置

### 2. 内容提取原则
- questionContent应该包含完整的题目描述
- 填空题的空用 "\\fill"代替，不需要添加是数学环境

### 3. 基本规则

“
### 1. 基本原则
- 避免过度分割，尽量将相关的数学内容放在同一个$...$内
- 不要为每个单独的符号都加$...$
- 保持文本的自然流畅性

### 2. 数学变量和函数
- 将函数和其参数作为一个整体：f(x) → $f(x)$
- 将变量和其下标作为一个整体：x_1, x_2 → $x_1$, $x_2$
- 将极值变量作为一个整体：M, N → $M$, $N$

### 3. 区间符号
- 将整个区间作为一个整体：[-2023, 2023] → $[-2023, 2023]$
- 不要分割区间内的内容

### 4. 数学公式和等式
- 将整个等式作为一个整体：f(x_1 + x_2) = f(x_1) + f(x_2) - 2024 → $f(x_1 + x_2) = f(x_1) + f(x_2) - 2024$
- 不要将等式的左右两边分开

### 6. 将所有的数学符号写在美刀符号之间，如果遇到括号，则必须要写成$\left($与$\right)$（中括号、大括号都行）的形式.如果遇到$\\sum$或一些大写的符号，则需要添加$\\displaystyle$让符号变成大写. 

### 7. 分数格式（严格使用\\dfrac）
- 普通分数：1/2 → $\\dfrac{1}{2}$
- 复杂分数：x/(x+1) → $\\dfrac{x}{x+1}$
- 嵌套分数：1/(1+1/2) → $\\dfrac{1}{1+\\dfrac{1}{2}}$
- 绝对不允许使用 \\frac，必须使用 \\dfrac

### 8. 数学环境
- 方程组使用：$\\left\\{\\begin{aligned} ... \\end{aligned}\\right.$
- 示例：
  $\\left\\{\\begin{aligned} 
  x + y &= 1 \\\\ 
  x - y &= 2 
  \\end{aligned}\\right.$

### 10. 填空题处理
- 独立的下划线"_"转换为"\\fill"（注意：\\fill 不需要$...$包裹，直接使用\\fill）
- 变量下标中的下划线保持不变：x_1 → $x_1$

### 11. 中文描述
- 保持中文描述的自然性
- 适当添加中文标点符号
- 避免过度格式化中文文本
- **重要**：将所有句号"."改为句点"."
- **重要**：去掉题目开头的难度标签，如"简单"、"中等"、"困难"等

【重要规则】
1. 如果题目内容中包含类似"2025年浙江八校联考高一期中·$T11$"等来源信息，请直接删除，不要出现在分析结果中.
2. 选择题选项格式必须为：\\choice 选项内容（不加大括号，不要写成\\choice{内容}，而是\\choice 内容）.
3. 将所有enumerate环境去掉

### 12. 格式要求
- 只返回转换后的LaTeX文本
- 不要添加任何解释或注释
- 确保文本的完整性和可读性
- 选择题中的\\ldots 或者 \\dots 全部去掉
- 避免重复或多余的$符号
- **标点符号**：使用句点"."而不是句号"."
- **难度标签**：删除开头的"简单"、"中等"、"困难"等标签
- 如果题目有分值，全部去除，不要保留任何分值的地方. 

### 13. 示例转换
输入：中等若定义区间[-2023, 2023]上的函数 f(x)满足:对任意的x_1,x_2∈[-2023,2023]，均成立 f(x_1+x_2)=f(x_1)+f(x_2)-2024 记f(x)的最大值为 M,最小值为 N,则 M+N的值为 _.
输出：若定义区间$[-2023, 2023]$上的函数$f(x)$满足：对任意的$x_1, x_2 \in [-2023, 2023]$，均成立$$f(x_1 + x_2) = f(x_1) + f(x_2) - 2024$$记$f(x)$的最大值为$M$，最小值为$N$，则$M + N$的值为\\fill.

输入：解方程组 x+y=1, x-y=2
输出：解方程组 $\\left\\{\\begin{aligned} x + y &= 1 \\\\ x - y &= 2 \\end{aligned}\\right.$

### 14. 数学符号格式要求
- **重要**：所有数学符号用$...$表示，例如：$\\dfrac{1}{2}$、$x^2$、$\\sqrt{3}$等
- 避免在$符号外出现数学符号
”

### 3. 返回格式
请严格按照以下JSON格式返回：

{
  "isFillQuestion": true/false,
  "questionContent": "完整的题目内容",
  "blanks": [1, 2, 3] // 填空位置编号
}

注意：
- **重要**：所有数学符号用$...$表示，例如：$\\dfrac{1}{2}$、$x^2$、$\\sqrt{3}$等
- 只返回JSON，不要有任何其他文字

分析结果：`;

      const response = await axios.post<DeepSeekResponse>(url, {
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1,
        max_tokens: 8000,
        stream: false
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`
        },
        timeout: 180000
      });

              if (response.data?.choices?.[0]?.message?.content) {
          const content = response.data.choices[0].message.content;
          // 使用智能JSON解析方法
          const result = this.parseJsonWithLatex(content);
          if (result) {
            return {
              isFillQuestion: result.isFillQuestion || false,
              questionContent: result.questionContent || '',
              blanks: result.blanks || []
            };
          } else {
            console.error('JSON解析失败，无法提取填空题信息');
          }
        }

      return {
        isFillQuestion: false,
        questionContent: rawText,
        blanks: []
      };
    } catch (error: any) {
      console.error('DeepSeek填空题识别失败:', error.response?.data || error.message);
      return {
        isFillQuestion: false,
        questionContent: rawText,
        blanks: []
      };
    }
  }

  // 分割题目
  async splitQuestions(rawText: string): Promise<QuestionSplitResult> {
    try {
      if (!this.config.apiKey || this.config.apiKey.trim() === '') {
        throw new Error('DeepSeek API密钥未配置');
      }

      const url = `${this.baseURL}/chat/completions`;

      const prompt = `你是一个专业的数学题目分割专家.请将以下包含多个题目的文本分割成单独的题目.

原始文本：${rawText}

## 分割要求：

### 1. 分割原则
- 严格按照题目编号进行分割（如1．、2．、3．、13．、14．、15．、16．、17．、18．、19．、20．、21．等）
- 每个题目必须包含完整的题干、选项（如果有）、小题（如果有）
- 保持题目的完整性和原始格式
- 不要遗漏任何题目内容

### 2. 分割规则
- 选择题：包含题干和A、B、C、D选项
- 填空题：包含题干和空白位置标记
- 解答题：包含题干和所有小题（1）、（2）、（3）等

### 3. 返回格式
请严格按照以下JSON格式返回：

{
  "questions": [
    "题目1的完整内容（包含所有选项和格式）",
    "题目2的完整内容（包含所有选项和格式）",
    "题目3的完整内容（包含所有选项和格式）"
  ],
  "totalCount": 实际题目数量
}

### 4. 重要注意事项
- **保持完整性**：每个题目必须包含所有原始内容，不能截断
- **数学符号**：所有数学符号用$...$表示，例如：$\\dfrac{1}{2}$、$x^2$、$\\sqrt{3}$等
- **格式保持**：保持原始的LaTeX格式和换行
- **编号保持**：保持原始的题目编号
- **只返回JSON**：不要有任何其他文字或说明

分割结果：`;

      const response = await axios.post<DeepSeekResponse>(url, {
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1,
        max_tokens: 8000, // 增加token限制
        stream: false
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`
        },
        timeout: 180000
      });

              if (response.data?.choices?.[0]?.message?.content) {
          const content = response.data.choices[0].message.content;
          // 使用智能JSON解析方法
          const result = this.parseJsonWithLatex(content);
          if (result) {
            return {
              questions: result.questions || [],
              totalCount: result.totalCount || 0
            };
          } else {
            console.error('JSON解析失败，无法提取题目分割信息');
          }
        }

      return {
        questions: [rawText],
        totalCount: 1
      };
    } catch (error: any) {
      console.error('DeepSeek题目分割失败:', error.response?.data || error.message);
      return {
        questions: [rawText],
        totalCount: 1
      };
    }
  }

  // 过滤画图相关内容
  async filterDrawingContent(rawText: string): Promise<string> {
    try {
      if (!this.config.apiKey || this.config.apiKey.trim() === '') {
        throw new Error('DeepSeek API密钥未配置');
      }

      const url = `${this.baseURL}/chat/completions`;

      const prompt = `你是一个专业的数学题目处理专家.请从以下数学题目中删除所有与画图、作图、绘制图形相关的内容.

原始文本：${rawText}

## 过滤要求：

### 1. 需要删除的内容
- "画图"、"作图"、"绘制"、"画出"等指令
- "在坐标系中"、"在平面直角坐标系中"等画图环境描述
- "画出函数图像"、"绘制图形"等具体画图要求
- 与图形绘制相关的所有描述

### 2. 保留的内容
- 数学计算和推理过程
- 函数表达式和方程
- 数值计算和结果
- 数学概念和定义

### 3. 处理原则
- 保持题目的数学逻辑完整性
- 确保删除画图内容后题目仍然有意义
- 保持文本的连贯性
- **重要**：所有数学符号用$...$表示，例如：$\\dfrac{1}{2}$、$x^2$、$\\sqrt{3}$等

请直接返回处理后的文本，不要添加任何解释：`;

      const response = await axios.post<DeepSeekResponse>(url, {
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1,
        max_tokens: 8000,
        stream: false
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`
        },
        timeout: 180000
      });

      if (response.data?.choices?.[0]?.message?.content) {
        return response.data.choices[0].message.content.trim();
      }

      return rawText;
    } catch (error: any) {
      console.error('DeepSeek画图内容过滤失败:', error.response?.data || error.message);
      return rawText;
    }
  }

  // 处理选择题内容
  async processChoiceQuestions(rawText: string): Promise<ProcessedQuestion[]> {
    try {
      console.log('开始处理选择题内容...');
      
      // 1. 过滤画图内容
      const filteredText = await this.filterDrawingContent(rawText);
      
      // 2. 分割题目
      const splitResult = await this.splitQuestions(filteredText);
      
      // 3. 处理每个题目（都是选择题）
      const processedQuestions: ProcessedQuestion[] = [];
      
      for (const questionText of splitResult.questions) {
        // 4. 识别选择题选项
        const choiceResult = await this.recognizeChoiceQuestion(questionText);
        
        // 5. 矫正LaTeX格式
        const correctedContent = await this.correctLatex(questionText);
        
        processedQuestions.push({
          type: 'choice',
          content: correctedContent,
          options: choiceResult.options.length > 0 ? choiceResult.options : undefined,
          blanks: undefined
        });
      }
      
      console.log(`选择题处理完成，共 ${processedQuestions.length} 道题目`);
      return processedQuestions;
    } catch (error: any) {
      console.error('选择题处理失败:', error);
      return [{
        type: 'choice',
        content: rawText
      }];
    }
  }

  // 处理填空题内容
  async processFillQuestions(rawText: string): Promise<ProcessedQuestion[]> {
    try {
      console.log('开始处理填空题内容...');
      
      // 1. 过滤画图内容
      const filteredText = await this.filterDrawingContent(rawText);
      
      // 2. 分割题目
      const splitResult = await this.splitQuestions(filteredText);
      
      // 3. 处理每个题目（都是填空题）
      const processedQuestions: ProcessedQuestion[] = [];
      
      for (const questionText of splitResult.questions) {
        // 4. 识别填空题空白位置
        const fillResult = await this.recognizeFillQuestion(questionText);
        
        // 5. 矫正LaTeX格式
        const correctedContent = await this.correctLatex(questionText);
        
        processedQuestions.push({
          type: 'fill',
          content: correctedContent,
          options: undefined,
          blanks: fillResult.blanks.length > 0 ? fillResult.blanks : undefined
        });
      }
      
      console.log(`填空题处理完成，共 ${processedQuestions.length} 道题目`);
      return processedQuestions;
    } catch (error: any) {
      console.error('填空题处理失败:', error);
      return [{
        type: 'fill',
        content: rawText
      }];
    }
  }

  // 处理解答题内容
  async processSolutionQuestions(rawText: string): Promise<ProcessedQuestion[]> {
    try {
      console.log('开始处理解答题内容...');
      
      // 1. 过滤画图内容
      const filteredText = await this.filterDrawingContent(rawText);
      
      // 2. 分割题目
      const splitResult = await this.splitQuestions(filteredText);
      
      // 3. 处理每个题目（都是解答题）
      const processedQuestions: ProcessedQuestion[] = [];
      
      for (const questionText of splitResult.questions) {
        // 4. 矫正LaTeX格式
        const correctedContent = await this.correctLatex(questionText);
        
        processedQuestions.push({
          type: 'solution',
          content: correctedContent,
          options: undefined,
          blanks: undefined
        });
      }
      
      console.log(`解答题处理完成，共 ${processedQuestions.length} 道题目`);
      return processedQuestions;
    } catch (error: any) {
      console.error('解答题处理失败:', error);
      return [{
        type: 'solution',
        content: rawText
      }];
    }
  }

  // 批量处理题目（通用方法）
  async processBatchQuestions(rawText: string): Promise<ProcessedQuestion[]> {
    try {
      // 1. 过滤画图内容
      const filteredText = await this.filterDrawingContent(rawText);
      
      // 2. 分割题目
      const splitResult = await this.splitQuestions(filteredText);
      
      // 3. 处理每个题目
      const processedQuestions: ProcessedQuestion[] = [];
      
      for (const questionText of splitResult.questions) {
        // 4. 识别题目类型
        const choiceResult = await this.recognizeChoiceQuestion(questionText);
        const fillResult = await this.recognizeFillQuestion(questionText);
        
        // 5. 确定题目类型
        let questionType: 'choice' | 'fill' | 'solution' = 'solution';
        let options: string[] = [];
        let blanks: number[] = [];
        
        if (choiceResult.isChoiceQuestion) {
          questionType = 'choice';
          options = choiceResult.options;
        } else if (fillResult.isFillQuestion) {
          questionType = 'fill';
          blanks = fillResult.blanks;
        }
        
        // 6. 矫正LaTeX格式
        const correctedContent = await this.correctLatex(questionText);
        
        processedQuestions.push({
          type: questionType,
          content: correctedContent,
          options: options.length > 0 ? options : undefined,
          blanks: blanks.length > 0 ? blanks : undefined
        });
      }
      
      return processedQuestions;
    } catch (error: any) {
      console.error('批量处理题目失败:', error);
      return [{
        type: 'solution',
        content: rawText
      }];
    }
  }
}

// 获取DeepSeek配置
function getDeepSeekConfig(): DeepSeekConfig {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  
  if (!apiKey) {
    throw new Error('DeepSeek配置缺失：请设置DEEPSEEK_API_KEY');
  }
  
  return { apiKey };
}

// 创建DeepSeek AI服务实例
let deepseekAIService: DeepSeekAIService | null = null;

export function getDeepSeekAIService(): DeepSeekAIService {
  if (!deepseekAIService) {
    const config = getDeepSeekConfig();
    deepseekAIService = new DeepSeekAIService(config);
  }
  return deepseekAIService;
}

// 导出矫正函数
export async function correctLatexWithDeepSeek(rawText: string): Promise<string> {
  try {
    const service = getDeepSeekAIService();
    return await service.correctLatex(rawText);
  } catch (error) {
    console.error('DeepSeek AI服务初始化失败:', error);
    return rawText;
  }
}

// 导出选择题识别函数
export async function recognizeChoiceQuestionWithDeepSeek(rawText: string): Promise<ChoiceQuestionResult> {
  try {
    const service = getDeepSeekAIService();
    return await service.recognizeChoiceQuestion(rawText);
  } catch (error) {
    console.error('DeepSeek AI服务初始化失败:', error);
    return {
      isChoiceQuestion: false,
      questionContent: rawText,
      options: []
    };
  }
}

// 导出填空题识别函数
export async function recognizeFillQuestionWithDeepSeek(rawText: string): Promise<FillQuestionResult> {
  try {
    const service = getDeepSeekAIService();
    return await service.recognizeFillQuestion(rawText);
  } catch (error) {
    console.error('DeepSeek AI服务初始化失败:', error);
    return {
      isFillQuestion: false,
      questionContent: rawText,
      blanks: []
    };
  }
}

// 导出题目分割函数
export async function splitQuestionsWithDeepSeek(rawText: string): Promise<QuestionSplitResult> {
  try {
    const service = getDeepSeekAIService();
    return await service.splitQuestions(rawText);
  } catch (error) {
    console.error('DeepSeek AI服务初始化失败:', error);
    return {
      questions: [rawText],
      totalCount: 1
    };
  }
}

// 导出画图内容过滤函数
export async function filterDrawingContentWithDeepSeek(rawText: string): Promise<string> {
  try {
    const service = getDeepSeekAIService();
    return await service.filterDrawingContent(rawText);
  } catch (error) {
    console.error('DeepSeek AI服务初始化失败:', error);
    return rawText;
  }
}

// 导出选择题处理函数
export async function processChoiceQuestionsWithDeepSeek(rawText: string): Promise<ProcessedQuestion[]> {
  try {
    const service = getDeepSeekAIService();
    return await service.processChoiceQuestions(rawText);
  } catch (error) {
    console.error('DeepSeek AI服务初始化失败:', error);
    return [{
      type: 'choice',
      content: rawText
    }];
  }
}

// 导出填空题处理函数
export async function processFillQuestionsWithDeepSeek(rawText: string): Promise<ProcessedQuestion[]> {
  try {
    const service = getDeepSeekAIService();
    return await service.processFillQuestions(rawText);
  } catch (error) {
    console.error('DeepSeek AI服务初始化失败:', error);
    return [{
      type: 'fill',
      content: rawText
    }];
  }
}

// 导出解答题处理函数
export async function processSolutionQuestionsWithDeepSeek(rawText: string): Promise<ProcessedQuestion[]> {
  try {
    const service = getDeepSeekAIService();
    return await service.processSolutionQuestions(rawText);
  } catch (error) {
    console.error('DeepSeek AI服务初始化失败:', error);
    return [{
      type: 'solution',
      content: rawText
    }];
  }
}

// 导出批量处理题目函数（通用方法）
export async function processBatchQuestionsWithDeepSeek(rawText: string): Promise<ProcessedQuestion[]> {
  try {
    const service = getDeepSeekAIService();
    return await service.processBatchQuestions(rawText);
  } catch (error) {
    console.error('DeepSeek AI服务初始化失败:', error);
    return [{
      type: 'solution',
      content: rawText
    }];
  }
} 