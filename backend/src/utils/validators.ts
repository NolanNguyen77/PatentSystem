import { z } from 'zod';

// Auth validators
export const loginSchema = z.object({
  body: z.object({
    username: z.string().min(1, 'Username is required'),
    password: z.string().min(1, 'Password is required'),
  }),
  query: z.object({}).strict().optional(),
  params: z.object({}).strict().optional(),
});

const titleBodySchema = z.object({
  titleName: z.string().min(1, 'Title name is required'),
  dataType: z.enum(['特許', '論文', '意匠', '商標', 'フリー']).default('特許'),
  markColor: z.string().optional(),
  parentTitleId: z.string().uuid().optional(),
  saveDate: z.string().regex(/^\d{4}\/\d{2}$/, 'Save date must be in YYYY/MM format'),
  disallowEvaluation: z.boolean().default(false),
  allowEvaluation: z.boolean().default(true),
  viewPermission: z.enum(['all', 'creator', 'assigned']).default('all'),
  editPermission: z.enum(['all', 'creator', 'assigned']).default('creator'),
  mainEvaluation: z.boolean().default(true),
  singlePatentMultipleEvaluations: z.boolean().default(false),
  users: z.array(
    z.object({
      userId: z.string(),
      isMainResponsible: z.boolean().default(false),
      permission: z.enum(['管理者', '一般', '閲覧']).default('一般'),
      evalEmail: z.boolean().default(false),
      confirmEmail: z.boolean().default(false),
      displayOrder: z.number().default(0),
    })
  ).optional(),
});

export const createTitleSchema = z.object({
  body: titleBodySchema,
  query: z.object({}).strict().optional(),
  params: z.object({}).strict().optional(),
});

export const updateTitleSchema = z.object({
  body: titleBodySchema.partial(),
  query: z.object({}).strict().optional(),
  params: z.object({}).strict().optional(),
});

const patentBodySchema = z.object({
  titleId: z.string().uuid(),
  patentNo: z.string().optional(),
  applicationNo: z.string().optional(),
  applicationDate: z.string().datetime().optional(),
  publicationDate: z.string().datetime().optional(),
  publicationNo: z.string().optional(),
  registrationNo: z.string().optional(),
  announcementNo: z.string().optional(),
  trialNo: z.string().optional(),
  caseNo: z.string().optional(),
  knownDate: z.string().datetime().optional(),
  inventionName: z.string().optional(),
  applicant: z.string().optional(),
  inventor: z.string().optional(),
  ipc: z.string().optional(),
  abstract: z.string().optional(),
  claims: z.string().optional(),
  stage: z.string().optional(),
  eventType: z.string().optional(),
  other: z.string().optional(),
  documentUrl: z.string().url().optional(),
  evaluationStatus: z.string().default('未評価'),
});

export const createPatentSchema = z.object({
  body: patentBodySchema,
  query: z.object({}).strict().optional(),
  params: z.object({}).strict().optional(),
});

export const updatePatentSchema = z.object({
  body: patentBodySchema.partial().omit({ titleId: true }),
  query: z.object({}).strict().optional(),
  params: z.object({}).strict().optional(),
});

const evaluationBodySchema = z.object({
  patentId: z.string().uuid(),
  titleId: z.string().uuid(),
  status: z.string().min(1, 'Status is required'),
  comment: z.string().optional(),
  score: z.number().int().min(0).max(100).optional(),
  isPublic: z.boolean().default(false),
});

export const createEvaluationSchema = z.object({
  body: evaluationBodySchema,
  query: z.object({}).strict().optional(),
  params: z.object({}).strict().optional(),
});

export const updateEvaluationSchema = z.object({
  body: evaluationBodySchema.partial(),
  query: z.object({}).strict().optional(),
  params: z.object({}).strict().optional(),
});


