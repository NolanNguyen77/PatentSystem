import prisma from '../config/database';
import { AppError } from '../middleware/error.middleware';
import { canViewTitle } from '../utils/permissions';

export interface MergeTitlesData {
  newTitleName: string;
  department: string;
  sourceTitleIds: string[];
  extractionCondition: {
    type: 'evaluation' | 'monitoring';
    selectedEvaluations: string[];
  };
}

export const mergeTitles = async (
  data: MergeTitlesData,
  userId: string,
  userPermission: string
) => {
  // Validate all source titles exist and user can view them
  for (const titleId of data.sourceTitleIds) {
    const canView = await canViewTitle(userId, titleId, userPermission as any);
    if (!canView) {
      throw new AppError(`Access denied to title ${titleId}`, 403);
    }
  }

  const sourceTitles = await prisma.title.findMany({
    where: {
      id: { in: data.sourceTitleIds },
    },
    include: {
      patents: {
        include: {
          evaluations: {
            where: {
              isDeleted: false,
            },
          },
        },
      },
      titleUsers: true,
    },
  });

  if (sourceTitles.length !== data.sourceTitleIds.length) {
    throw new AppError('Some titles not found', 404);
  }

  // Generate new title number
  const lastTitle = await prisma.title.findFirst({
    orderBy: { createdAt: 'desc' },
    select: { titleNo: true },
  });

  let titleNo = '000001';
  if (lastTitle) {
    const lastNum = parseInt(lastTitle.titleNo);
    titleNo = String(lastNum + 1).padStart(6, '0');
  }

  // Determine save date (use latest)
  const saveDate = sourceTitles
    .map((t) => t.saveDate)
    .sort()
    .reverse()[0];

  // Merge title users (unique by userId)
  const mergedUsers = new Map();
  sourceTitles.forEach((title) => {
    title.titleUsers.forEach((tu) => {
      if (!mergedUsers.has(tu.userId)) {
        mergedUsers.set(tu.userId, tu);
      }
    });
  });

  // Filter patents based on extraction condition
  let patentsToMerge: any[] = [];
  
  if (data.extractionCondition.type === 'evaluation') {
    // Get patents with selected evaluations
    sourceTitles.forEach((title) => {
      title.patents.forEach((patent) => {
                const hasSelectedEvaluation = patent.evaluations.some((evaluation) =>
                  data.extractionCondition.selectedEvaluations.includes(evaluation.status)
                );
        if (hasSelectedEvaluation) {
          patentsToMerge.push(patent);
        }
      });
    });
  } else {
    // Merge all patents
    sourceTitles.forEach((title) => {
      patentsToMerge.push(...title.patents);
    });
  }

  // Remove duplicates by patentNo
  const uniquePatents = new Map();
  patentsToMerge.forEach((patent) => {
    const key = patent.patentNo || patent.id;
    if (!uniquePatents.has(key)) {
      uniquePatents.set(key, patent);
    }
  });

  // Create new merged title
  const newTitle = await prisma.title.create({
    data: {
      titleNo,
      titleName: data.newTitleName,
      dataType: sourceTitles[0].dataType, // Use first title's data type
      saveDate,
      createdBy: userId,
      titleUsers: {
        create: Array.from(mergedUsers.values()).map((tu: any) => ({
          userId: tu.userId,
          isMainResponsible: tu.isMainResponsible,
          permission: tu.permission,
          evalEmail: tu.evalEmail,
          confirmEmail: tu.confirmEmail,
          displayOrder: tu.displayOrder,
        })),
      },
    },
  });

  // Copy patents
  const mergedCount = Array.from(uniquePatents.values()).length;
  
  if (mergedCount > 0) {
    await prisma.patent.createMany({
      data: Array.from(uniquePatents.values()).map((patent: any) => ({
        titleId: newTitle.id,
        patentNo: patent.patentNo,
        applicationNo: patent.applicationNo,
        applicationDate: patent.applicationDate,
        publicationDate: patent.publicationDate,
        publicationNo: patent.publicationNo,
        registrationNo: patent.registrationNo,
        announcementNo: patent.announcementNo,
        trialNo: patent.trialNo,
        caseNo: patent.caseNo,
        knownDate: patent.knownDate,
        inventionName: patent.inventionName,
        applicant: patent.applicant,
        inventor: patent.inventor,
        ipc: patent.ipc,
        abstract: patent.abstract,
        claims: patent.claims,
        stage: patent.stage,
        eventType: patent.eventType,
        other: patent.other,
        documentUrl: patent.documentUrl,
        evaluationStatus: '未評価', // Reset evaluation status
      })),
    });
  }

  return {
    newTitleId: newTitle.id,
    mergedCount,
    message: `${mergedCount}件の特許データをマージしました`,
  };
};

