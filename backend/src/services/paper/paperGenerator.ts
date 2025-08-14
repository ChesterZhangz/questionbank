import { Question } from '../../models/Question';
import { FilterQuery } from 'mongoose';

export interface GenerateRules {
  bankId: string;
  countsByType?: Partial<Record<'choice'|'multiple-choice'|'fill'|'solution', number>>;
  difficultyDistribution?: { easy?: number; medium?: number; hard?: number }; // 1-2 / 3 / 4-5
  tags?: string[];
  totalCount?: number;
  excludeQids?: string[];
  includeQids?: string[];
  randomSeed?: number;
}

export interface GeneratedItem {
  questionId: string;
  qid: string;
  type: string;
  difficulty: number;
}

function seededRandom(seed: number) {
  let x = Math.sin(seed) * 10000;
  return () => {
    x = Math.sin(x) * 10000;
    return x - Math.floor(x);
  };
}

export async function generateQuestionList(rules: GenerateRules): Promise<GeneratedItem[]> {
  const { bankId, tags, excludeQids = [], includeQids = [], randomSeed = Date.now() } = rules;

  const filter: FilterQuery<any> = {
    bid: bankId,
    status: 'published'
  };
  if (tags && tags.length > 0) filter.tags = { $in: tags };
  if (excludeQids && excludeQids.length > 0) filter.qid = { $nin: excludeQids };

  const base = await Question.find(filter)
    .select('_id qid type difficulty')
    .lean();

  // includeQids 优先加入
  const includeSet = new Set(includeQids);
  const included = base.filter(q => includeSet.has(q.qid));

  // 按类型/难度做简单的分组与配额分配（后续可细化为严格分布）
  const remainingPool = base.filter(q => !includeSet.has(q.qid));

  // 简单随机打乱（可重现）
  const rand = seededRandom(randomSeed);
  remainingPool.sort(() => rand() - 0.5);

  const items: GeneratedItem[] = [];
  for (const q of [...included, ...remainingPool]) {
    items.push({ questionId: String(q._id), qid: q.qid, type: q.type, difficulty: q.difficulty });
  }

  return items;
}


