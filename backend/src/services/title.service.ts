import prisma from '../config/database';
import { AppError } from '../middleware/error.middleware';
import { canViewTitle, canEditTitle, validateMainResponsible } from '../utils/permissions';
import { generateClassifications } from '../utils/classification';

export interface CreateTitleData {
  titleName: string;
  dataType?: string;
  markColor?: string;
  parentTitleId?: string;
  saveDate: string;
  disallowEvaluation?: boolean;
  allowEvaluation?: boolean;
  viewPermission?: string;
  editPermission?: string;
  mainEvaluation?: boolean;
  singlePatentMultipleEvaluations?: boolean;
  users?: Array<{
    userId: string;
    isMainResponsible?: boolean;
    permission?: string;
    evalEmail?: boolean;
    confirmEmail?: boolean;
    displayOrder?: number;
  }>;
}

export const getAllTitles = async (
  filters: {
    department?: string;
    search?: string;
    page?: number;
    limit?: number;
  },
  userId: string,
  userPermission: string
) => {
  const page = filters.page || 1;
  const limit = filters.limit || 20;
  const skip = (page - 1) * limit;

  const where: any = {};

  if (filters.search) {
    where.OR = [
      { titleName: { contains: filters.search } },
      { titleNo: { contains: filters.search } },
    ];
  }

  // Get titles user can view
  const titles = await prisma.title.findMany({
    where,
    include: {
      titleUsers: {
        include: {
          user: {
            select: {
              userId: true,
              name: true,
              department: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      },
      patents: {
        select: {
          id: true,
          evaluationStatus: true,
        },
      },
      _count: {
        select: {
          patents: true,
        },
      },
    },
    skip,
    take: limit,
    orderBy: { createdAt: 'desc' },
  });

  // Filter by permission
  const accessibleTitles = [];
  for (const title of titles) {
    const canView = await canViewTitle(userId, title.id, userPermission as any);
    if (canView) {
      accessibleTitles.push(title);
    }
  }

  // Calculate stats
  const titlesWithStats = accessibleTitles.map((title) => {
    const patents = title.patents;
    const total = patents.length;
    const evaluated = patents.filter((p) => p.evaluationStatus !== '未評価').length;
    const notEvaluated = patents.filter((p) => p.evaluationStatus === '未評価').length;
    const progressRate = total > 0 ? (evaluated / total) * 100 : 0;

    return {
      id: title.id,
      no: title.titleNo,
      title: title.titleName,
      department: title.titleUsers.find((tu) => tu.isMainResponsible)?.user.department?.name || '',
      responsible: title.titleUsers.find((tu) => tu.isMainResponsible)?.user.name || '',
      dataCount: total,
      evaluated,
      notEvaluated,
      trash: 0, // TODO: Implement trash functionality
      progressRate: Math.round(progressRate * 10) / 10,
      date: title.saveDate,
      dataType: title.dataType,
      attachments: 0, // TODO: Count attachments
      markColor: title.markColor || '',
    };
  });

  const total = await prisma.title.count({ where });

  return {
    titles: titlesWithStats,
    total,
    page,
    limit,
  };
};

export const getTitleById = async (id: string, userId: string, userPermission: string) => {
  const title = await prisma.title.findUnique({
    where: { id },
    include: {
      titleUsers: {
        include: {
          user: {
            include: {
              department: true,
            },
          },
        },
        orderBy: { displayOrder: 'asc' },
      },
      patents: {
        select: {
          id: true,
          evaluationStatus: true,
        },
      },
      parentTitle: {
        select: {
          id: true,
          titleNo: true,
          titleName: true,
        },
      },
    },
  });

  if (!title) {
    throw new AppError('Title not found', 404);
  }

  const canView = await canViewTitle(userId, id, userPermission as any);
  if (!canView) {
    throw new AppError('Access denied', 403);
  }

  const total = title.patents.length;
  const evaluated = title.patents.filter((p) => p.evaluationStatus !== '未評価').length;
  const notEvaluated = title.patents.filter((p) => p.evaluationStatus === '未評価').length;
  const progressRate = total > 0 ? (evaluated / total) * 100 : 0;

  return {
    ...title,
    stats: {
      total,
      evaluated,
      notEvaluated,
      progressRate: Math.round(progressRate * 10) / 10,
    },
  };
};

export const createTitle = async (data: CreateTitleData, createdBy: string) => {
  // Generate title number
  const lastTitle = await prisma.title.findFirst({
    orderBy: { createdAt: 'desc' },
    select: { titleNo: true },
  });

  let titleNo = '000001';
  if (lastTitle) {
    const lastNum = parseInt(lastTitle.titleNo);
    titleNo = String(lastNum + 1).padStart(6, '0');
  }

  // Validate main responsible
  if (data.users && data.users.length > 0) {
    const mainResponsible = data.users.find((u) => u.isMainResponsible);
    if (mainResponsible) {
      // Will be validated after title creation
    }
  }

  const title = await prisma.title.create({
    data: {
      titleNo,
      titleName: data.titleName,
      dataType: data.dataType || '特許',
      markColor: data.markColor,
      parentTitleId: data.parentTitleId,
      saveDate: data.saveDate,
      disallowEvaluation: data.disallowEvaluation || false,
      allowEvaluation: data.allowEvaluation !== false,
      viewPermission: data.viewPermission || 'all',
      editPermission: data.editPermission || 'creator',
      mainEvaluation: data.mainEvaluation !== false,
      singlePatentMultipleEvaluations: data.singlePatentMultipleEvaluations || false,
      createdBy,
      titleUsers: data.users
        ? {
            create: data.users.map((u) => ({
              userId: u.userId,
              isMainResponsible: u.isMainResponsible || false,
              permission: (u.permission as any) || '一般',
              evalEmail: u.evalEmail || false,
              confirmEmail: u.confirmEmail || false,
              displayOrder: u.displayOrder || 0,
            })),
          }
        : undefined,
    },
    include: {
      titleUsers: {
        include: {
          user: true,
        },
      },
    },
  });

  // Validate only one main responsible
  const mainResponsibles = title.titleUsers.filter((tu) => tu.isMainResponsible);
  if (mainResponsibles.length > 1) {
    // Keep only the first one as main
    const firstMain = mainResponsibles[0];
    for (let i = 1; i < mainResponsibles.length; i++) {
      await prisma.titleUser.update({
        where: { id: mainResponsibles[i].id },
        data: { isMainResponsible: false },
      });
    }
  }

  return title;
};

export const updateTitle = async (
  id: string,
  data: Partial<CreateTitleData>,
  userId: string,
  userPermission: string
) => {
  const canEdit = await canEditTitle(userId, id, userPermission as any);
  if (!canEdit) {
    throw new AppError('Access denied', 403);
  }

  const title = await prisma.title.update({
    where: { id },
    data: {
      titleName: data.titleName,
      dataType: data.dataType,
      markColor: data.markColor,
      parentTitleId: data.parentTitleId,
      saveDate: data.saveDate,
      disallowEvaluation: data.disallowEvaluation,
      allowEvaluation: data.allowEvaluation,
      viewPermission: data.viewPermission,
      editPermission: data.editPermission,
      mainEvaluation: data.mainEvaluation,
      singlePatentMultipleEvaluations: data.singlePatentMultipleEvaluations,
    },
    include: {
      titleUsers: true,
    },
  });

  // Update users if provided
  if (data.users) {
    // Delete existing users
    await prisma.titleUser.deleteMany({
      where: { titleId: id },
    });

    // Create new users
    await prisma.titleUser.createMany({
      data: data.users.map((u) => ({
        titleId: id,
        userId: u.userId,
        isMainResponsible: u.isMainResponsible || false,
        permission: (u.permission as any) || '一般',
        evalEmail: u.evalEmail || false,
        confirmEmail: u.confirmEmail || false,
        displayOrder: u.displayOrder || 0,
      })),
    });

    // Validate only one main responsible
    const mainResponsibles = data.users.filter((u) => u.isMainResponsible);
    if (mainResponsibles.length > 1) {
      // Keep only the first one
      const firstMain = mainResponsibles[0];
      await prisma.titleUser.updateMany({
        where: {
          titleId: id,
          userId: { not: firstMain.userId },
          isMainResponsible: true,
        },
        data: { isMainResponsible: false },
      });
    }
  }

  return title;
};

export const deleteTitle = async (id: string, userId: string, userPermission: string) => {
  const canEdit = await canEditTitle(userId, id, userPermission as any);
  if (!canEdit) {
    throw new AppError('Access denied', 403);
  }

  await prisma.title.delete({
    where: { id },
  });

  return { message: 'Title deleted successfully' };
};

export const copyTitle = async (
  id: string,
  newTitleName: string,
  userId: string,
  userPermission: string
) => {
  const originalTitle = await prisma.title.findUnique({
    where: { id },
    include: {
      titleUsers: true,
      patents: true,
    },
  });

  if (!originalTitle) {
    throw new AppError('Title not found', 404);
  }

  const canView = await canViewTitle(userId, id, userPermission as any);
  if (!canView) {
    throw new AppError('Access denied', 403);
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

  // Create new title
  const newTitle = await prisma.title.create({
    data: {
      titleNo,
      titleName: newTitleName,
      dataType: originalTitle.dataType,
      markColor: originalTitle.markColor,
      parentTitleId: originalTitle.parentTitleId,
      saveDate: originalTitle.saveDate,
      disallowEvaluation: originalTitle.disallowEvaluation,
      allowEvaluation: originalTitle.allowEvaluation,
      viewPermission: originalTitle.viewPermission,
      editPermission: originalTitle.editPermission,
      mainEvaluation: originalTitle.mainEvaluation,
      singlePatentMultipleEvaluations: originalTitle.singlePatentMultipleEvaluations,
      createdBy: userId,
      titleUsers: {
        create: originalTitle.titleUsers.map((tu) => ({
          userId: tu.userId,
          isMainResponsible: tu.isMainResponsible,
          permission: tu.permission as any,
          evalEmail: tu.evalEmail,
          confirmEmail: tu.confirmEmail,
          displayOrder: tu.displayOrder,
        })),
      },
    },
  });

  // Copy patents
  if (originalTitle.patents.length > 0) {
    await prisma.patent.createMany({
      data: originalTitle.patents.map((patent) => ({
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
    id: newTitle.id,
    message: 'Title copied successfully',
  };
};

export const searchTitles = async (query: string, userId: string, userPermission: string) => {
  const titles = await prisma.title.findMany({
    where: {
      OR: [
        { titleName: { contains: query } },
        { titleNo: { contains: query } },
      ],
    },
    take: 50,
  });

  // Filter by permission
  const accessibleTitles = [];
  for (const title of titles) {
    const canView = await canViewTitle(userId, title.id, userPermission as any);
    if (canView) {
      accessibleTitles.push(title);
    }
  }

  return { titles: accessibleTitles };
};

