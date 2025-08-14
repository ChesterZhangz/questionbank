import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

export interface QuestionInfo {
  questionIndex: number;
  lineNumber: number;
  content: string;
  estimatedHeight: number; // 估算的内容高度（行数）
}

export interface SmartPageBreakResult {
  success: boolean;
  pdfPath?: string;
  log?: string;
}

export async function generatePaperWithSmartPageBreaks(
  paper: any, 
  options: { includeAnswers?: boolean } = {}
): Promise<SmartPageBreakResult> {
  const paperId = `smart-pagebreak-${Date.now()}`;
  
  try {
    // 第一步：生成初始LaTeX
    const { buildLatexFromPaper, writeLatexToWorkspace } = await import('./latexExportService');
    const initialLatex = buildLatexFromPaper(paper, { ...options, templateName: 'test' });
    const { dir, texPath } = writeLatexToWorkspace(paperId, initialLatex, 'test');
    
    // 第二步：编译初始版本并分析页面分布
    console.log('📄 编译初始版本分析页面分布...');
    const initialCompileResult = await compileXeLaTeX(texPath);
    
    if (initialCompileResult.code !== 0) {
      return {
        success: false,
        log: initialCompileResult.stdout + initialCompileResult.stderr
      };
    }
    
    // 第三步：分析题目分布并添加智能分页
    const adjustedLatex = addSmartPageBreaks(initialLatex);
    
    // 第四步：重新编译最终版本（编译两次以解析页码引用）
    const finalTexPath = path.join(dir, `paper-${paperId}-final.tex`);
    fs.writeFileSync(finalTexPath, adjustedLatex, 'utf8');
    
    const compileResult = await compileXeLaTeX(finalTexPath, true);
    
    return {
      success: compileResult.code === 0,
      pdfPath: compileResult.pdfPath,
      log: compileResult.stdout + compileResult.stderr
    };
    
  } catch (error) {
    return {
      success: false,
      log: error instanceof Error ? error.message : String(error)
    };
  }
}

function addSmartPageBreaks(latex: string): string {
  const lines = latex.split('\n');
  const questions: QuestionInfo[] = [];
  
  // 分析题目位置和内容
  let questionIndex = 0;
  let currentQuestionStart = -1;
  let currentQuestionContent: string[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // 检测新题目的开始（解答题部分）
    if (line.includes('\\item \\textbf{（本大题满分$') && line.includes('分') && line.includes('）}')) {
      // 保存前一个题目
      if (currentQuestionStart !== -1) {
        questions.push({
          questionIndex: questionIndex,
          lineNumber: currentQuestionStart,
          content: currentQuestionContent.join('\n'),
          estimatedHeight: estimateQuestionHeight(currentQuestionContent)
        });
        questionIndex++;
      }
      
      // 开始新题目
      currentQuestionStart = i;
      currentQuestionContent = [line];
    } else if (currentQuestionStart !== -1) {
      // 继续当前题目内容
      currentQuestionContent.push(line);
      
      // 检测题目结束（下一个题目开始或文档结束）
      if (i < lines.length - 1) {
        const nextLine = lines[i + 1];
        if (nextLine.includes('\\item \\textbf{（本大题满分$') && nextLine.includes('分') && nextLine.includes('）}')) {
          // 保存当前题目
          questions.push({
            questionIndex: questionIndex,
            lineNumber: currentQuestionStart,
            content: currentQuestionContent.join('\n'),
            estimatedHeight: estimateQuestionHeight(currentQuestionContent)
          });
          questionIndex++;
          
          // 重置
          currentQuestionStart = -1;
          currentQuestionContent = [];
        }
      }
    }
  }
  
  // 保存最后一个题目
  if (currentQuestionStart !== -1) {
    questions.push({
      questionIndex: questionIndex,
      lineNumber: currentQuestionStart,
      content: currentQuestionContent.join('\n'),
      estimatedHeight: estimateQuestionHeight(currentQuestionContent)
    });
  }
  
  console.log(`检测到${questions.length}道解答题`);
  questions.forEach((q, idx) => {
    console.log(`  题目${idx + 1}: 第${q.lineNumber + 1}行, 估算高度${q.estimatedHeight}行`);
  });
  
  // 分析页面分布并添加分页符
  let adjustedLatex = latex;
  let currentPageHeight = 0;
  const maxPageHeight = 40; // 估算每页最大行数
  const pageBreaks: number[] = []; // 记录需要添加分页符的位置
  
  for (let i = 0; i < questions.length; i++) {
    const question = questions[i];
    
    // 检查当前题目是否会跨页
    if (currentPageHeight + question.estimatedHeight > maxPageHeight) {
      console.log(`  题目${i + 1}可能跨页，将在第${question.lineNumber + 1}行前添加分页符`);
      pageBreaks.push(question.lineNumber);
      
      // 重置页面高度
      currentPageHeight = question.estimatedHeight;
    } else {
      currentPageHeight += question.estimatedHeight;
    }
  }
  
  // 从后往前添加分页符，避免行号变化影响前面的位置
  if (pageBreaks.length > 0) {
    const newLines = [...lines];
    pageBreaks.reverse().forEach(breakLine => {
      newLines.splice(breakLine, 0, '\\newpage');
    });
    adjustedLatex = newLines.join('\n');
  }
  
  return adjustedLatex;
}

function estimateQuestionHeight(content: string[]): number {
  // 估算题目内容的高度（行数）
  let height = 0;
  
  for (const line of content) {
    // 基础行数
    height += 1;
    
    // 根据内容类型增加额外高度
    if (line.includes('\\begin{enumerate}')) {
      // 枚举环境，每项大约1.5行
      const itemCount = (line.match(/\\item/g) || []).length;
      height += itemCount * 0.5;
    }
    
    if (line.includes('\\begin{enumerate}[label=\\textcircled{\\arabic*}]')) {
      // 嵌套枚举环境，每项大约1行
      const itemCount = (line.match(/\\item/g) || []).length;
      height += itemCount * 0.3;
    }
    
    // 长公式或复杂内容
    if (line.includes('$') && line.length > 80) {
      height += 0.5;
    }
    
    // 空行
    if (line.trim() === '') {
      height += 0.3;
    }
  }
  
  return Math.ceil(height);
}

async function compileXeLaTeX(texPath: string, compileTwice: boolean = false): Promise<{ code: number | null; stdout: string; stderr: string; pdfPath?: string }> {
  const workdir = path.dirname(texPath);
  const filename = path.basename(texPath);

  return new Promise(async (resolve) => {
    let totalStdout = '';
    let totalStderr = '';
    let finalCode = 0;

    // 第一次编译
    const firstResult = await compileOnce(workdir, filename);
    totalStdout += firstResult.stdout;
    totalStderr += firstResult.stderr;
    finalCode = firstResult.code || 0;

    // 如果需要编译两次且第一次成功
    if (compileTwice && finalCode === 0) {
      console.log('  进行第二次编译以解析页码引用...');
      const secondResult = await compileOnce(workdir, filename);
      totalStdout += '\n' + secondResult.stdout;
      totalStderr += '\n' + secondResult.stderr;
      finalCode = secondResult.code || 0;
    }

    const pdfPath = path.join(workdir, filename.replace(/\.tex$/i, '.pdf'));
    resolve({ code: finalCode, stdout: totalStdout, stderr: totalStderr, pdfPath });
  });
}

function compileOnce(workdir: string, filename: string): Promise<{ code: number | null; stdout: string; stderr: string }> {
  return new Promise((resolve) => {
    const proc = spawn('xelatex', ['-interaction=nonstopmode', '-halt-on-error', filename], {
      cwd: workdir
    });
    
    let stdout = '';
    let stderr = '';
    
    proc.stdout.on('data', (d) => (stdout += d.toString()));
    proc.stderr.on('data', (d) => (stderr += d.toString()));
    
    proc.on('close', (code) => {
      resolve({ code, stdout, stderr });
    });
  });
}
