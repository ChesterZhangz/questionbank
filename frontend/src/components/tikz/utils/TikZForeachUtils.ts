/**
 * TikZ Foreach 循环处理工具类
 * 统一处理 \foreach 命令的解析、展开和执行
 */

export interface ForeachContext {
  variable: string;
  values: (string | number)[];
  currentIndex: number;
  command: string;
  lineNumber: number;
}

export class TikZForeachUtils {
  /**
   * 解析foreach循环命令
   */
  static parseForeach(line: string, lineNumber: number): ForeachContext | null {
    try {
      // 匹配 \foreach \x in {values} 格式
      const foreachMatch = line.match(/\\foreach\s*\\([a-zA-Z])\s+in\s*\{([^}]+)\}/);
      
      if (foreachMatch) {
        const [, variable, valuesStr] = foreachMatch;
        
        // 解析值列表
        const values = this.parseForeachValues(valuesStr);
        
        // 获取foreach后面的命令部分
        const afterForeach = line.substring(line.indexOf('}') + 1).trim();
        
        return {
          variable,
          values,
          currentIndex: 0,
          command: afterForeach,
          lineNumber
        };
      } else {
        throw new Error(`无法解析foreach命令: ${line}`);
      }
    } catch (error) {
      throw new Error(`第${lineNumber + 1}行: foreach命令解析失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * 解析foreach值列表
   */
  static parseForeachValues(valuesStr: string): (string | number)[] {
    const values: (string | number)[] = [];
    
    // 处理范围表达式，如 {1,...,5} 或 {0,2,...,10}
    const rangeMatch = valuesStr.match(/^([^,]+),\.\.\.,([^,]+)$/);
    if (rangeMatch) {
      const start = parseFloat(rangeMatch[1]);
      const end = parseFloat(rangeMatch[2]);
      if (!isNaN(start) && !isNaN(end)) {
        // 默认步长为1
        for (let i = start; i <= end; i++) {
          values.push(i);
        }
        return values;
      }
    }
    
    // 处理带步长的范围表达式，如 {0,2,...,10}
    const stepRangeMatch = valuesStr.match(/^([^,]+),([^,]+),\.\.\.,([^,]+)$/);
    if (stepRangeMatch) {
      const start = parseFloat(stepRangeMatch[1]);
      const step = parseFloat(stepRangeMatch[2]) - start;
      const end = parseFloat(stepRangeMatch[3]);
      if (!isNaN(start) && !isNaN(step) && !isNaN(end)) {
        for (let i = start; i <= end; i += step) {
          values.push(Math.round(i * 1000) / 1000); // 避免浮点精度问题
        }
        return values;
      }
    }
    
    // 处理普通逗号分隔的值
    const parts = valuesStr.split(',').map(v => v.trim());
    for (const part of parts) {
      const num = parseFloat(part);
      if (!isNaN(num)) {
        values.push(num);
      } else {
        values.push(part);
      }
    }
    
    return values;
  }

  /**
   * 展开foreach命令中的变量
   */
  static expandForeachCommand(command: string, variable: string, value: string | number): string {
    // 使用正则表达式替换变量，确保只替换完整的变量名
    // 但是要特别处理数学表达式中的变量
    let expandedCommand = command;
    
    // 首先处理数学表达式中的变量，如 $\x$ 或 $\y$
    const mathRegex = new RegExp(`\\$\\\\${variable}\\$`, 'g');
    expandedCommand = expandedCommand.replace(mathRegex, `$${value}$`);
    
    // 然后处理其他地方的变量，如 (\x,0) 或 \x
    const varRegex = new RegExp(`\\\\${variable}\\b`, 'g');
    expandedCommand = expandedCommand.replace(varRegex, String(value));
    

    
    return expandedCommand;
  }

  /**
   * 处理foreach命令 - 为每个值执行一次命令
   * @param context foreach上下文
   * @param commandProcessor 命令处理器函数
   */
  static processForeachCommand(
    context: ForeachContext, 
    commandProcessor: (expandedCommand: string, lineNumber: number) => void
  ): void {
    // 为每个值执行一次命令
    for (let i = 0; i < context.values.length; i++) {
      const currentValue = context.values[i];
      
      // 替换命令中的变量
      const expandedCommand = this.expandForeachCommand(context.command, context.variable, currentValue);
      
      // 执行展开后的命令
      try {
        commandProcessor(expandedCommand, context.lineNumber);
      } catch (error) {
        console.warn(`foreach展开命令解析失败: ${expandedCommand}`, error);
      }
    }
  }

  /**
   * 检查命令是否包含foreach
   */
  static containsForeach(line: string): boolean {
    return line.includes('\\foreach');
  }

  /**
   * 验证foreach语法
   */
  static validateForeachSyntax(line: string): { isValid: boolean; error?: string } {
    const foreachMatch = line.match(/\\foreach\s*\\([a-zA-Z])\s+in\s*\{([^}]+)\}/);
    
    if (!foreachMatch) {
      return {
        isValid: false,
        error: 'foreach语法错误：应为 \\foreach \\变量 in {值列表}'
      };
    }

    const [, variable, valuesStr] = foreachMatch;
    
    if (!variable) {
      return {
        isValid: false,
        error: 'foreach变量名不能为空'
      };
    }

    if (!valuesStr.trim()) {
      return {
        isValid: false,
        error: 'foreach值列表不能为空'
      };
    }

    return { isValid: true };
  }
}
