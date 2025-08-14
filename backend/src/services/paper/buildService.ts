import path from 'path';
import fs from 'fs';
import { IPaper } from '../../models/Paper';
import { buildLatexFromPaper, writeLatexToWorkspace } from './latexExportService';
import { compileXeLaTeX } from './latexCompileService';
// 移除 Practice 智能排版链路

export type JobStatus = 'queued' | 'running' | 'success' | 'failed';

export interface BuildJob {
  id: string;
  paperId: string;
  includeAnswers: boolean;
  templateName: string;
  status: JobStatus;
  progress: number; // 0-100
  pdfPath?: string;
  error?: string;
  createdAt: number;
  updatedAt: number;
}

const jobs = new Map<string, BuildJob>();

export function getJob(jobId: string): BuildJob | undefined {
  return jobs.get(jobId);
}

export async function startBuildJob(paper: IPaper, opts: { includeAnswers?: boolean; templateName?: string }): Promise<BuildJob> {
  const jobId = `job-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const job: BuildJob = {
    id: jobId,
    paperId: String((paper as any)._id || ''),
    includeAnswers: Boolean(opts.includeAnswers),
    templateName: opts.templateName || 'practice',
    status: 'queued',
    progress: 0,
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
  jobs.set(jobId, job);

  (async () => {
    try {
      job.status = 'running'; job.progress = 5; job.updatedAt = Date.now();
      const templateName = job.templateName;
      const includeAnswers = job.includeAnswers;

      // 统一走常规导出，不做 Practice 智能排版

      // 常规导出
      job.progress = 15; job.updatedAt = Date.now();
      const latex = buildLatexFromPaper(paper as any, { includeAnswers, templateName });
      const { texPath } = writeLatexToWorkspace(String((paper as any)._id || ''), latex, templateName);
      job.progress = 50; job.updatedAt = Date.now();
      const result = await compileXeLaTeX(texPath, templateName === 'test');
      if (result.code === 0 && result.pdfPath) {
        job.progress = 100; job.status = 'success'; job.pdfPath = result.pdfPath; job.updatedAt = Date.now();
      } else {
        job.status = 'failed'; job.error = result.stderr || 'compile failed'; job.updatedAt = Date.now();
      }
    } catch (e: any) {
      job.status = 'failed'; job.error = e?.message || String(e); job.updatedAt = Date.now();
    }
  })();

  return job;
}


