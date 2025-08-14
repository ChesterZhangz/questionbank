import { spawn } from 'child_process';
import path from 'path';

export interface CompileResult {
  code: number | null;
  stdout: string;
  stderr: string;
  pdfPath?: string;
}

export async function compileXeLaTeX(texPath: string, compileTwice: boolean = false): Promise<CompileResult> {
  const workdir = path.dirname(texPath);
  const filename = path.basename(texPath);

  return new Promise((resolve) => {
    let totalStdout = '';
    let totalStderr = '';
    let finalCode = 0;

    // 第一次编译
    compileOnce(workdir, filename).then(firstResult => {
      totalStdout += firstResult.stdout;
      totalStderr += firstResult.stderr;
      finalCode = firstResult.code || 0;

      // 如果需要编译两次且第一次成功
      if (compileTwice && finalCode === 0) {
        return compileOnce(workdir, filename);
      } else {
        return null;
      }
    }).then(secondResult => {
      if (secondResult) {
        totalStdout += '\n' + secondResult.stdout;
        totalStderr += '\n' + secondResult.stderr;
        finalCode = secondResult.code || 0;
      }

      const pdfPath = path.join(workdir, filename.replace(/\.tex$/i, '.pdf'));
      resolve({ code: finalCode, stdout: totalStdout, stderr: totalStderr, pdfPath });
    });
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


