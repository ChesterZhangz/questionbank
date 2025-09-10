import mongoose from 'mongoose';
import { Paper, IPaper, IQuestionSnapshot } from '../../models/Paper';
import { Question } from '../../models/Question';

// 试卷服务 - 业务逻辑处理
export class PaperService {
  // 试卷相关业务逻辑
  async createPaper(data: any) {
    // 创建试卷逻辑
  }

  async updatePaper(id: string, data: any) {
    // 更新试卷逻辑
  }
}

export async function createDraft(input: Partial<IPaper> & { owner: string }): Promise<IPaper> {
  const doc = new Paper({
    name: input.name,
    type: input.type,
    subject: input.subject,
    grade: input.grade,
    timeLimit: input.timeLimit,
    totalScore: input.totalScore ?? 0,
    bank: new mongoose.Types.ObjectId(String(input.bank)),
    owner: new mongoose.Types.ObjectId(String(input.owner)),
    libraryId: input.libraryId ? new mongoose.Types.ObjectId(String(input.libraryId)) : undefined,
    sections: input.sections ?? [],
    status: 'draft',
    version: 1
  });
  return await doc.save();
}

export async function updateDraft(id: string, input: Partial<IPaper>): Promise<IPaper | null> {
  const doc = await Paper.findByIdAndUpdate(id, { $set: input }, { new: true });
  return doc;
}

export async function getPaper(id: string): Promise<IPaper | null> {
  return Paper.findById(id)
    .populate('owner', 'name email')
    .populate('bank', 'name')
    .populate({
      path: 'sections.items.question',
      model: 'Question'
    });
}

export async function listPapers(query: { 
  owner?: string; 
  status?: 'draft'|'published'|'modified'; 
  keyword?: string; 
  page?: number; 
  limit?: number; 
  libraryId?: string;
}) {
  const { owner, status, keyword, page = 1, limit = 20, libraryId } = query;
  const filter: any = {};
  if (owner) filter.owner = new mongoose.Types.ObjectId(String(owner));
  if (status) filter.status = status;
  if (libraryId) filter.libraryId = new mongoose.Types.ObjectId(String(libraryId));
  if (keyword) filter.$text = { $search: keyword };
  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    Paper.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Paper.countDocuments(filter)
  ]);
  return { items, total, page, limit, pages: Math.ceil(total / limit) };
}

export async function publishPaper(id: string): Promise<IPaper | null> {
  const paper = await Paper.findById(id);
  if (!paper) return null;
  if (paper.status === 'published') return paper;

  // 生成快照
  for (const section of paper.sections) {
    for (const item of section.items) {
      if (!item.snapshot) {
        let q = await Question.findById(item.question).lean();
        if (!q && item.qid) {
          q = await Question.findOne({ qid: item.qid }).lean();
        }
        if (!q && typeof (item as any).question === 'string' && /^MT-[A-Z]{2,}/.test(String((item as any).question))) {
          q = await Question.findOne({ qid: String((item as any).question) }).lean();
        }
        if (q) {
          const snap: IQuestionSnapshot = {
            stem: q.content.stem,
            options: q.content.options?.map(o => o.text),
            answer: q.content.answer ?? q.content.fillAnswers ?? q.content.solutionAnswers,
            analysis: q.content.solution,
            difficulty: q.difficulty,
            type: q.type as any,
            tags: q.tags,
            source: q.source
          };
          item.snapshot = snap;
          if (!item.qid && (q as any).qid) item.qid = (q as any).qid;
        }
      }
    }
  }

  paper.status = 'published';
  paper.version = paper.version + 1;
  paper.publishedAt = new Date();
  await paper.save();
  return paper;
}

export async function deletePaper(id: string): Promise<boolean> {
  const result = await Paper.findByIdAndDelete(id);
  return !!result;
}

// 新增：标记试卷为已修改
export async function markPaperAsModified(id: string, modifiedBy: string): Promise<IPaper | null> {
  const paper = await Paper.findById(id);
  if (!paper) return null;
  
  // 只有已发布的试卷才能标记为已修改
  if (paper.status !== 'published') {
    throw new Error('只有已发布的试卷才能标记为已修改');
  }
  
  paper.status = 'modified';
  paper.modifiedAt = new Date();
  paper.modifiedBy = new mongoose.Types.ObjectId(modifiedBy);
  paper.version += 1;
  
  await paper.save();
  return paper;
}


