import prisma from '../config/database';
import { AppError } from '../middleware/error.middleware';
import { generateClassifications } from '../utils/classification';
import { SearchExpressionParser } from '../utils/searchParser';
import { Prisma } from '@prisma/client';

export interface CreatePatentData {
  titleId: string;
  documentNum?: string;
  applicationNum?: string;
  applicationDate?: string | Date;
  publicationDate?: string | Date;
  inventionTitle?: string;
  applicantName?: string;
  fiClassification?: string;
  publicationNum?: string;
  announcementNum?: string;
  registrationNum?: string;
  appealNum?: string;
  otherInfo?: string;
  statusStage?: string;
  eventDetail?: string;
  documentUrl?: string;
  evaluationStatus?: string;
}

const parseDate = (value?: string | Date | null) => {
  if (!value) {
    return undefined;
  }

  const date = value instanceof Date ? value : new Date(value);

  if (isNaN(date.getTime())) {
    // throw new AppError(`Invalid date format: ${value}`, 400);
    return undefined; // Return undefined instead of throwing to avoid breaking import
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
  titleIdentifier: string,
  filters: {
    status?: 'evaluated' | 'unevaluated';
    search?: string;
    applicant?: string;
    includeFullText?: boolean; // New parameter to control if we include abstract/claims
    userId?: string;
  }
) => {
  let titleId = titleIdentifier;
  const titleById = await prisma.title.findUnique({ where: { id: titleIdentifier } });
  if (!titleById) {
    const titleByNo = await prisma.title.findUnique({ where: { titleNo: titleIdentifier } as any });
    if (!titleByNo) {
      return {
        patents: [],
        total: 0,
        evaluatedCount: 0,
        unevaluatedCount: 0,
        progressRate: 0,
      };
    }
    titleId = titleByNo.id;
  }

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
      { documentNum: { contains: filters.search } },
      { inventionTitle: { contains: filters.search } },
      { applicantName: { contains: filters.search } },
    ];
  }

  if (filters.applicant) {
    where.applicantName = filters.applicant;
  }

  const includeEvaluations = filters.userId ? {
    where: { userId: filters.userId, isDeleted: false },
    select: { status: true, comment: true }
  } : undefined;

  // Fetch patents with or without full text based on flag
  const patents = filters.includeFullText
    ? await prisma.patent.findMany({
      where,
      include: {
        evaluations: includeEvaluations
      },
      orderBy: { createdAt: 'desc' },
    })
    : await prisma.patent.findMany({
      where,
      select: {
        id: true,
        titleId: true,
        documentNum: true,
        applicationNum: true,
        applicationDate: true,
        publicationDate: true,
        inventionTitle: true,
        applicantName: true,
        fiClassification: true,
        publicationNum: true,
        announcementNum: true,
        registrationNum: true,
        appealNum: true,
        // Exclude abstract and claims for performance
        otherInfo: true,
        statusStage: true,
        eventDetail: true,
        documentUrl: true,
        evaluationStatus: true,
        createdAt: true,
        updatedAt: true,
        evaluations: includeEvaluations ? {
          where: { userId: filters.userId, isDeleted: false },
          select: { status: true, comment: true }
        } : undefined,
      },
      orderBy: { createdAt: 'desc' },
    });

  const total = patents.length;
  const evaluated = patents.filter((p: any) => p.evaluationStatus !== '未評価').length;
  const unevaluated = patents.filter((p: any) => p.evaluationStatus === '未評価').length;
  const progressRate = total > 0 ? (evaluated / total) * 100 : 0;

  return {
    titleId,
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

  let titleIdToUse = data.titleId;
  if (!titleIdToUse) {
    throw new AppError('titleId is required', 400);
  }

  const existingTitleById = await prisma.title.findUnique({ where: { id: titleIdToUse } });
  if (!existingTitleById) {
    const existingByNo = await prisma.title.findUnique({ where: { titleNo: titleIdToUse } as any });
    if (existingByNo) {
      titleIdToUse = existingByNo.id;
    } else {
      throw new AppError('Title not found for provided titleId/titleNo', 400);
    }
  }

  try {
    const patent = await prisma.patent.create({
      data: {
        titleId: titleIdToUse,
        documentNum: data.documentNum,
        applicationNum: data.applicationNum,
        applicationDate,
        publicationDate,
        inventionTitle: data.inventionTitle,
        applicantName: data.applicantName,
        fiClassification: data.fiClassification,
        publicationNum: data.publicationNum,
        announcementNum: data.announcementNum,
        registrationNum: data.registrationNum,
        appealNum: data.appealNum,
        otherInfo: data.otherInfo,
        statusStage: data.statusStage,
        eventDetail: data.eventDetail,
        documentUrl: data.documentUrl,
        evaluationStatus: data.evaluationStatus || '未評価',
      },
    });

    if (applicationDate || publicationDate) {
      const date = applicationDate || publicationDate;
      if (date) {
        await upsertPatentClassifications(patent.id, titleIdToUse, date);
      }
    }

    return patent;
  } catch (err: any) {
    if (err && err.code === 'P2003') {
      throw new AppError('Foreign key constraint violated: related record not found', 400);
    }
    throw err;
  }
};

export const updatePatent = async (id: string, data: Partial<CreatePatentData>) => {
  const applicationDate = parseDate(data.applicationDate);
  const publicationDate = parseDate(data.publicationDate);

  const patent = await prisma.patent.update({
    where: { id },
    data: {
      documentNum: data.documentNum,
      applicationNum: data.applicationNum,
      applicationDate,
      publicationDate,
      inventionTitle: data.inventionTitle,
      applicantName: data.applicantName,
      fiClassification: data.fiClassification,
      publicationNum: data.publicationNum,
      announcementNum: data.announcementNum,
      registrationNum: data.registrationNum,
      appealNum: data.appealNum,
      otherInfo: data.otherInfo,
      statusStage: data.statusStage,
      eventDetail: data.eventDetail,
      documentUrl: data.documentUrl,
      evaluationStatus: data.evaluationStatus,
    },
  });

  if (applicationDate || publicationDate) {
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
  await prisma.$transaction([
    prisma.patentClassification.deleteMany({ where: { patentId: id } }),
    prisma.evaluation.deleteMany({ where: { patentId: id } }),
    prisma.patent.delete({ where: { id } })
  ]);

  return { message: 'Patent deleted successfully' };
};

export const deletePatents = async (ids: string[]) => {
  if (!ids.length) return { count: 0 };

  const result = await prisma.$transaction(async (tx) => {
    // Delete related records first
    await tx.patentClassification.deleteMany({
      where: { patentId: { in: ids } }
    });
    await tx.evaluation.deleteMany({
      where: { patentId: { in: ids } }
    });

    // Delete patents
    return await tx.patent.deleteMany({
      where: {
        id: { in: ids }
      }
    });
  });

  return { message: 'Patents deleted successfully', count: result.count };
};

export const deletePatentsByCompany = async (companyName: string) => {
  const result = await prisma.$transaction(async (tx) => {
    // Find all patents for this company
    const patents = await tx.patent.findMany({
      where: { applicantName: companyName },
      select: { id: true }
    });

    const patentIds = patents.map(p => p.id);

    if (patentIds.length === 0) {
      return { count: 0 };
    }

    // Delete related records first
    await tx.patentClassification.deleteMany({
      where: { patentId: { in: patentIds } }
    });
    await tx.evaluation.deleteMany({
      where: { patentId: { in: patentIds } }
    });

    // Delete patents
    return await tx.patent.deleteMany({
      where: { applicantName: companyName }
    });
  });

  return { message: `Deleted all patents for ${companyName}`, count: result.count };
};

export const getPatentsByCompany = async (
  companyName: string,
  filters: {
    status?: 'evaluated' | 'unevaluated';
    includeFullText?: boolean;
    userId?: string;
  }
) => {
  const where: any = {
    applicantName: companyName,
  };

  if (filters.status === 'evaluated') {
    where.evaluationStatus = { not: '未評価' };
  } else if (filters.status === 'unevaluated') {
    where.evaluationStatus = '未評価';
  }

  const includeEvaluations = filters.userId ? {
    where: { userId: filters.userId, isDeleted: false },
    select: { status: true, comment: true }
  } : undefined;

  const patents = filters.includeFullText
    ? await prisma.patent.findMany({
      where,
      include: {
        title: {
          select: {
            id: true,
            titleNo: true,
            titleName: true,
          },
        },
        evaluations: includeEvaluations
      },
      orderBy: { createdAt: 'desc' },
    })
    : await prisma.patent.findMany({
      where,
      select: {
        id: true,
        titleId: true,
        documentNum: true,
        applicationNum: true,
        applicationDate: true,
        publicationDate: true,
        inventionTitle: true,
        applicantName: true,
        fiClassification: true,
        publicationNum: true,
        announcementNum: true,
        registrationNum: true,
        appealNum: true,
        otherInfo: true,
        statusStage: true,
        eventDetail: true,
        documentUrl: true,
        evaluationStatus: true,
        createdAt: true,
        updatedAt: true,
        title: {
          select: {
            id: true,
            titleNo: true,
            titleName: true,
          },
        },
        evaluations: includeEvaluations ? {
          where: { userId: filters.userId, isDeleted: false },
          select: { status: true, comment: true }
        } : undefined,
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

export const importPatents = async (
  titleId: string,
  rows: Record<string, string>[],
  columnMapping: Record<string, string>
) => {
  let targetTitleId = titleId;
  const existingTitleById = await prisma.title.findUnique({ where: { id: titleId } });
  if (!existingTitleById) {
    const existingByNo = await prisma.title.findUnique({ where: { titleNo: titleId } as any });
    if (existingByNo) {
      targetTitleId = existingByNo.id;
    } else {
      throw new AppError('Title not found for provided titleId/titleNo', 400);
    }
  }

  let saved = 0;
  let updated = 0;
  let skipped = 0;

  for (const row of rows) {
    try {
      const getData = (key: string) => {
        const csvCol = columnMapping[key];
        const value = csvCol ? row[csvCol] : undefined;
        // Return undefined for empty strings to avoid storing empty values
        return value && value.trim() !== '' ? value.trim() : undefined;
      };

      const documentNum = getData('bunken'); // 文献番号
      if (!documentNum) {
        skipped++;
        continue;
      }

      const patentData: any = {
        titleId: targetTitleId,
        documentNum: documentNum,
        applicationNum: getData('shutsugan'),
        applicationDate: parseDate(getData('shutsuganDate')),
        publicationDate: parseDate(getData('kochiDate')),
        inventionTitle: getData('hatumei'),
        applicantName: getData('shutsuganNin'),
        fiClassification: getData('fi'),
        publicationNum: getData('kokai'),
        announcementNum: getData('kokoku'),
        registrationNum: getData('toroku'),
        appealNum: getData('shinpan'),
        abstract: getData('abstract'),
        claims: getData('claims'),
        otherInfo: getData('sonota'),
        statusStage: getData('stage'),
        eventDetail: getData('event'),
        documentUrl: getData('bunkenUrl'),
        evaluationStatus: '未評価'
      };

      // Debug: Log abstract and claims to verify they are being extracted
      console.log(`📝 Patent ${documentNum}:`, {
        abstractLength: patentData.abstract?.length || 0,
        claimsLength: patentData.claims?.length || 0,
        abstractPreview: patentData.abstract?.substring(0, 50) || 'NULL',
        claimsPreview: patentData.claims?.substring(0, 50) || 'NULL'
      });

      const existing = await prisma.patent.findFirst({
        where: {
          titleId: targetTitleId,
          documentNum: documentNum
        }
      });

      if (existing) {
        await prisma.patent.update({
          where: { id: existing.id },
          data: patentData
        });
        updated++;
      } else {
        const newPatent = await prisma.patent.create({
          data: patentData
        });

        if (patentData.applicationDate) {
          await upsertPatentClassifications(newPatent.id, targetTitleId, patentData.applicationDate);
        }
        saved++;
      }
    } catch (err) {
      console.error('Error importing row:', err);
      skipped++;
    }
  }

  return {
    total: rows.length,
    saved,
    updated,
    skipped
  };
};

export const assignPatents = async (
  mode: 'add' | 'replace' | 'remove',
  patentIds: string[],
  userIds: string[] = []
) => {
  if (patentIds.length === 0) return { count: 0 };

  return await prisma.$transaction(async (tx) => {
    if (mode === 'remove') {
      const result = await tx.patentAssignment.deleteMany({
        where: { patentId: { in: patentIds } }
      });
      return { count: result.count };
    }

    if (mode === 'replace') {
      // Delete existing assignments for these patents
      await tx.patentAssignment.deleteMany({
        where: { patentId: { in: patentIds } }
      });
    }

    // Prepare data for creation
    const dataToCreate: { patentId: string; userId: string }[] = [];
    for (const patentId of patentIds) {
      for (const userId of userIds) {
        dataToCreate.push({ patentId, userId });
      }
    }

    if (dataToCreate.length === 0) return { count: 0 };

    if (mode === 'replace') {
      // We can use createMany since we cleared conflicts
      const result = await tx.patentAssignment.createMany({
        data: dataToCreate
      });
      return { count: result.count };
    } else {
      // mode === 'add'
      // We need to avoid duplicates.
      // We can fetch existing assignments for these patents and users
      const existing = await tx.patentAssignment.findMany({
        where: {
          patentId: { in: patentIds },
          userId: { in: userIds }
        },
        select: { patentId: true, userId: true }
      });

      const existingSet = new Set(existing.map(e => `${e.patentId}:${e.userId}`));
      const newData = dataToCreate.filter(d => !existingSet.has(`${d.patentId}:${d.userId}`));

      if (newData.length > 0) {
        const result = await tx.patentAssignment.createMany({
          data: newData
        });
        return { count: result.count };
      }
      return { count: 0 };
    }
  });
};

export const searchPatents = async (
  criteria: {
    mode: 'number' | 'condition';
    searchOption?: 'exact' | 'partial';
    numbers?: string[];
    numberType?: string;
    expression?: string;
    conditions?: Record<string, { field: string; value: string }>;
    titleIds?: string[];
  },
  userId: string
) => {
  let where: Prisma.PatentWhereInput = {};

  console.log('🔍 searchPatents called with criteria:', JSON.stringify(criteria, null, 2));

  // 1. Scope by Title IDs
  if (criteria.titleIds && criteria.titleIds.length > 0) {
    where.titleId = { in: criteria.titleIds };
  }

  // 2. Mode Logic
  if (criteria.mode === 'number') {
    if (criteria.numbers && criteria.numbers.length > 0) {
      const fieldMap: Record<string, string> = {
        'publication': 'publicationNum', // 公開番号
        'application': 'applicationNum', // 出願番号
        'registration': 'registrationNum', // 登録番号
        'gazette': 'announcementNum', // 公報番号 (Assuming announcement)
        'idea': 'documentNum', // アイデア番号 (Assuming documentNum)
      };
      const dbField = fieldMap[criteria.numberType || 'publication'] || 'publicationNum';

      if (criteria.searchOption === 'partial') {
        // For partial match with multiple numbers, we use OR
        const orConditions = criteria.numbers.map(num => ({
          [dbField]: { contains: num }
        }));

        if (where.titleId) {
          where = {
            AND: [
              { titleId: where.titleId },
              { OR: orConditions }
            ]
          };
        } else {
          where.OR = orConditions;
        }
      } else {
        // Exact match
        const exactMatch = { [dbField]: { in: criteria.numbers } };
        if (where.titleId) {
          where = {
            AND: [
              { titleId: where.titleId },
              exactMatch
            ]
          };
        } else {
          Object.assign(where, exactMatch);
        }
      }
    }
  } else if (criteria.mode === 'condition') {
    if (criteria.expression && criteria.conditions) {
      try {
        const parser = new SearchExpressionParser(criteria.expression, criteria.conditions);
        const expressionWhere = parser.parse();

        // Combine with title scope
        if (where.titleId) {
          where = {
            AND: [
              { titleId: where.titleId },
              expressionWhere
            ]
          };
        } else {
          where = expressionWhere;
        }
      } catch (error: any) {
        throw new AppError(`Invalid search expression: ${error.message}`, 400);
      }
    }
  }

  // Execute Query
  console.log('🔍 Final Prisma Where Input:', JSON.stringify(where, null, 2));
  const patents = await prisma.patent.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      title: {
        select: {
          titleName: true,
          titleNo: true
        }
      },
      evaluations: {
        where: { userId: userId, isDeleted: false },
        select: { status: true }
      }
    }
  });

  return {
    count: patents.length,
    patents: patents
  };
};
