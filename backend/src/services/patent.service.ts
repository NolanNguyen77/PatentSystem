import prisma from '../config/database';
import { AppError } from '../middleware/error.middleware';
import { generateClassifications } from '../utils/classification';

export interface CreatePatentData {
  titleId: string;
  patentNo?: string;
  applicationNo?: string;
  applicationDate?: string | Date;
  publicationDate?: string | Date;
  publicationNo?: string;
  registrationNo?: string;
  announcementNo?: string;
  trialNo?: string;
  caseNo?: string;
  knownDate?: string | Date;
  inventionName?: string;
  applicant?: string;
  inventor?: string;
  ipc?: string;
  abstract?: string;
  claims?: string;
  stage?: string;
  eventType?: string;
  other?: string;
  documentUrl?: string;
  evaluationStatus?: string;
}

const parseDate = (value?: string | Date | null) => {
  if (!value) {
    return undefined;
  }

  const date = value instanceof Date ? value : new Date(value);

  if (isNaN(date.getTime())) {
    throw new AppError(`Invalid date format: ${value}`, 400);
  }

  return date;
};

const upsertPatentClassifications = async (patentId: string, titleId: string, date: Date) => {
  const classifications = generateClassifications(date);

  await Promise.all(
    classifications.map((c) =>
      prisma.patentClassification.upsert({
        where: {
          patentId_titleId_classificationType_classificationValue: {
            patentId,
            titleId,
            classificationType: c.type,
            classificationValue: c.value,
          },
        },
        update: {},
        create: {
          patentId,
          titleId,
          classificationType: c.type,
          classificationValue: c.value,
        },
      })
    )
  );
};

export const getPatentsByTitle = async (
  titleId: string,
  filters: {
    status?: 'evaluated' | 'unevaluated';
    search?: string;
    applicant?: string;
  }
) => {
  const where: any = {
    titleId,
  };

  if (filters.status === 'evaluated') {
    where.evaluationStatus = { not: '未評価' };
  } else if (filters.status === 'unevaluated') {
    where.evaluationStatus = '未評価';
  }

  if (filters.search) {
    where.OR = [
      { patentNo: { contains: filters.search } },
      { inventionName: { contains: filters.search } },
      { applicant: { contains: filters.search } },
      { inventor: { contains: filters.search } },
    ];
  }

  if (filters.applicant) {
    where.applicant = filters.applicant;
  }

  const patents = await prisma.patent.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });

  const total = patents.length;
  const evaluated = patents.filter((p) => p.evaluationStatus !== '未評価').length;
  const unevaluated = patents.filter((p) => p.evaluationStatus === '未評価').length;
  const progressRate = total > 0 ? (evaluated / total) * 100 : 0;

  return {
    patents,
    total,
    evaluatedCount: evaluated,
    unevaluatedCount: unevaluated,
    progressRate: Math.round(progressRate * 10) / 10,
  };
};

export const getPatentById = async (id: string) => {
  const patent = await prisma.patent.findUnique({
    where: { id },
    include: {
      title: {
        select: {
          id: true,
          titleNo: true,
          titleName: true,
        },
      },
      evaluations: {
        include: {
          user: {
            select: {
              userId: true,
              name: true,
            },
          },
        },
        where: {
          isDeleted: false,
        },
      },
    },
  });

  if (!patent) {
    throw new AppError('Patent not found', 404);
  }

  return patent;
};

export const createPatent = async (data: CreatePatentData) => {
  const applicationDate = parseDate(data.applicationDate);
  const publicationDate = parseDate(data.publicationDate);
  const knownDate = parseDate(data.knownDate);

  const patent = await prisma.patent.create({
    data: {
      titleId: data.titleId,
      patentNo: data.patentNo,
      applicationNo: data.applicationNo,
      applicationDate,
      publicationDate,
      publicationNo: data.publicationNo,
      registrationNo: data.registrationNo,
      announcementNo: data.announcementNo,
      trialNo: data.trialNo,
      caseNo: data.caseNo,
      knownDate,
      inventionName: data.inventionName,
      applicant: data.applicant,
      inventor: data.inventor,
      ipc: data.ipc,
      abstract: data.abstract,
      claims: data.claims,
      stage: data.stage,
      eventType: data.eventType,
      other: data.other,
      documentUrl: data.documentUrl,
      evaluationStatus: data.evaluationStatus || '未評価',
    },
  });

  // Auto-classify patent
  if (applicationDate || publicationDate) {
    const date = applicationDate || publicationDate;
    if (date) {
      await upsertPatentClassifications(patent.id, data.titleId, date);
    }
  }

  return patent;
};

export const updatePatent = async (id: string, data: Partial<CreatePatentData>) => {
  const applicationDate = parseDate(data.applicationDate);
  const publicationDate = parseDate(data.publicationDate);
  const knownDate = parseDate(data.knownDate);

  const patent = await prisma.patent.update({
    where: { id },
    data: {
      patentNo: data.patentNo,
      applicationNo: data.applicationNo,
      applicationDate,
      publicationDate,
      publicationNo: data.publicationNo,
      registrationNo: data.registrationNo,
      announcementNo: data.announcementNo,
      trialNo: data.trialNo,
      caseNo: data.caseNo,
      knownDate,
      inventionName: data.inventionName,
      applicant: data.applicant,
      inventor: data.inventor,
      ipc: data.ipc,
      abstract: data.abstract,
      claims: data.claims,
      stage: data.stage,
      eventType: data.eventType,
      other: data.other,
      documentUrl: data.documentUrl,
      evaluationStatus: data.evaluationStatus,
    },
  });

  // Re-classify if date changed
  if (applicationDate || publicationDate) {
    // Delete old classifications to keep data consistent
    await prisma.patentClassification.deleteMany({
      where: { patentId: id },
    });

    const date = applicationDate || publicationDate;
    if (date) {
      await upsertPatentClassifications(id, patent.titleId, date);
    }
  }

  return patent;
};

export const updatePatentStatus = async (id: string, status: 'evaluated' | 'unevaluated') => {
  const evaluationStatus = status === 'evaluated' ? '評価済' : '未評価';
  
  return await prisma.patent.update({
    where: { id },
    data: { evaluationStatus },
  });
};

export const deletePatent = async (id: string) => {
  await prisma.patent.delete({
    where: { id },
  });

  return { message: 'Patent deleted successfully' };
};

export const getPatentsByCompany = async (
  companyName: string,
  filters: {
    status?: 'evaluated' | 'unevaluated';
  }
) => {
  const where: any = {
    applicant: companyName,
  };

  if (filters.status === 'evaluated') {
    where.evaluationStatus = { not: '未評価' };
  } else if (filters.status === 'unevaluated') {
    where.evaluationStatus = '未評価';
  }

  const patents = await prisma.patent.findMany({
    where,
    include: {
      title: {
        select: {
          id: true,
          titleNo: true,
          titleName: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const total = patents.length;
  const evaluated = patents.filter((p) => p.evaluationStatus !== '未評価').length;
  const unevaluated = patents.filter((p) => p.evaluationStatus === '未評価').length;
  const progressRate = total > 0 ? (evaluated / total) * 100 : 0;

  return {
    companyName,
    patents,
    total,
    evaluatedCount: evaluated,
    unevaluatedCount: unevaluated,
    progressRate: Math.round(progressRate * 10) / 10,
  };
};

