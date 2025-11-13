import prisma from '../config/database';
import { AppError } from '../middleware/error.middleware';
import { ClassificationType } from '../utils/classification';

export interface ClassificationMatrix {
  [key: string]: {
    total: number;
    evaluated: number;
    unevaluated: number;
  };
}

export const getClassificationData = async (
  titleId: string,
  type: ClassificationType,
  dateFilter: 'application' | 'publication' = 'application'
): Promise<ClassificationMatrix> => {
  const title = await prisma.title.findUnique({
    where: { id: titleId },
  });

  if (!title) {
    throw new AppError('Title not found', 404);
  }

  // Get all classifications for this title and type
  const classifications = await prisma.patentClassification.findMany({
    where: {
      titleId,
      classificationType: type,
    },
    include: {
      patent: {
        select: {
          evaluationStatus: true,
        },
      },
    },
  });

  // Group by classification value
  const matrix: ClassificationMatrix = {};

  classifications.forEach((classification) => {
    const value = classification.classificationValue;
    if (!matrix[value]) {
      matrix[value] = {
        total: 0,
        evaluated: 0,
        unevaluated: 0,
      };
    }

    matrix[value].total++;
    if (classification.patent.evaluationStatus === '未評価') {
      matrix[value].unevaluated++;
    } else {
      matrix[value].evaluated++;
    }
  });

  return matrix;
};

export const autoClassifyPatents = async (titleId: string): Promise<number> => {
  const title = await prisma.title.findUnique({
    where: { id: titleId },
  });

  if (!title) {
    throw new AppError('Title not found', 404);
  }

  // Get all patents without classifications
  const patents = await prisma.patent.findMany({
    where: {
      titleId,
      classifications: {
        none: {},
      },
    },
  });

  let classified = 0;

  for (const patent of patents) {
    const date = patent.applicationDate || patent.publicationDate;
    if (!date) continue;

    const { generateClassifications } = await import('../utils/classification');
    const classifications = generateClassifications(date);

    await prisma.patentClassification.createMany({
      data: classifications.map((c) => ({
        patentId: patent.id,
        titleId,
        classificationType: c.type,
        classificationValue: c.value,
      })),
      skipDuplicates: true,
    } as any);

    classified++;
  }

  return classified;
};

