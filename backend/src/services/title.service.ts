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
  const titles = (await prisma.title.findMany({
    where,
    include: {
      mainOwner: {
        select: {
          id: true,
          name: true,
          userId: true,
          department: {
            select: { name: true }
          }
        }
      },
      parentTitle: {
        select: {
          id: true,
          titleNo: true,
          titleName: true,
        }
      },
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
    } as any,
    skip,
    take: limit,
    orderBy: { createdAt: 'desc' },
  })) as any;

  // Filter by permission
  const accessibleTitles = [];
  for (const title of titles) {
    const canView = await canViewTitle(userId, title.id, userPermission as any);
    if (canView) {
      accessibleTitles.push(title);
    }
  }

  // Calculate stats
  const titlesWithStats = accessibleTitles.map((title: any) => {
    const patents = title.patents;
    const total = patents.length;
    const evaluated = patents.filter((p: any) => p.evaluationStatus !== '未評価').length;
    const notEvaluated = patents.filter((p: any) => p.evaluationStatus === '未評価').length;
    const progressRate = total > 0 ? (evaluated / total) * 100 : 0;

    // Prefer explicit mainOwner relation when present
    const mainOwner = (title as any).mainOwner;
    const responsibleName = mainOwner?.name || title.titleUsers.find((tu: any) => tu.isMainResponsible)?.user.name || '';
    const departmentName = mainOwner?.department?.name || title.titleUsers.find((tu: any) => tu.isMainResponsible)?.user.department?.name || '';

    return {
      id: title.id,
      no: title.titleNo,
      title: title.titleName,
      titleName: title.titleName,
      department: departmentName,
      responsible: responsibleName,
      dataCount: total,
      evaluated,
      notEvaluated,
      trash: 0, // TODO: Implement trash functionality
      progressRate: Math.round(progressRate * 10) / 10,
      date: title.saveDate,
      dataType: title.dataType,
      attachments: 0, // TODO: Count attachments
      markColor: title.markColor || '',
      parentTitleId: title.parentTitleId,
      parentTitle: title.parentTitle ? {
        id: title.parentTitle.id,
        no: title.parentTitle.titleNo,
        name: title.parentTitle.titleName,
      } : null,
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
  const title = (await prisma.title.findUnique({
    where: { id },
    include: {
      mainOwner: {
        select: {
          id: true,
          name: true,
          userId: true,
          department: { select: { name: true } }
        }
      },
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
    } as any,
  })) as any;

  if (!title) {
    throw new AppError('Title not found', 404);
  }

  const canView = await canViewTitle(userId, id, userPermission as any);
  if (!canView) {
    throw new AppError('Access denied', 403);
  }

  const total = title.patents.length;
  const evaluated = title.patents.filter((p: any) => p.evaluationStatus !== '未評価').length;
  const notEvaluated = title.patents.filter((p: any) => p.evaluationStatus === '未評価').length;
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
  // Resolve parentTitleId if provided (accept title id or titleNo)
  let parentTitleIdToUse = data.parentTitleId;
  if (parentTitleIdToUse) {
    const parentById = await prisma.title.findUnique({ where: { id: parentTitleIdToUse } });
    if (!parentById) {
      const parentByNo = await prisma.title.findUnique({ where: { titleNo: parentTitleIdToUse } as any });
      if (parentByNo) {
        parentTitleIdToUse = parentByNo.id;
      } else {
        // If parent not found, clear it (don't block creation)
        parentTitleIdToUse = undefined as any;
      }
    }
  }

  // Resolve users: accept either DB id or userId (username). Map to DB UUIDs.
  // Validate: only 管理者 can be mainResponsible (主担当)
  let titleUsersCreate: any = undefined;
  let mainOwnerFromResolved: string | undefined = undefined;

  if (data.users && data.users.length > 0) {
    const resolvedUsers: any[] = [];
    for (const u of data.users) {
      if (!u.userId) continue;
      // Try find by id first
      let userRecord = await prisma.user.findUnique({ where: { id: u.userId } });
      if (!userRecord) {
        // Try find by userId (username)
        userRecord = await prisma.user.findUnique({ where: { userId: u.userId } as any });
      }
      if (!userRecord) {
        throw new AppError(`User not found: ${u.userId}`, 400);
      }

      // Validate: only 管理者 can be mainResponsible
      const permissionString = u.permission || '一般';
      const isAdmin = permissionString === '管理者';
      if (u.isMainResponsible && !isAdmin) {
        throw new AppError(
          `Only 管理者 can be main responsible (主担当). User ${userRecord.userId} has permission: ${permissionString}`,
          400
        );
      }

      // Map permission to bit flags
      const permissionFlags =
        permissionString === '管理者'
          ? { isAdmin: true, isGeneral: false, isViewer: false }
          : permissionString === '閲覧'
            ? { isAdmin: false, isGeneral: false, isViewer: true }
            : { isAdmin: false, isGeneral: true, isViewer: false };

      resolvedUsers.push({
        userId: userRecord.id,
        isMainResponsible: u.isMainResponsible || false,
        ...permissionFlags,
        evalEmail: u.evalEmail || false,
        confirmEmail: u.confirmEmail || false,
        displayOrder: u.displayOrder || 0,
      });

      // Track main owner
      if (u.isMainResponsible) {
        mainOwnerFromResolved = userRecord.id;
      }
    }
    if (resolvedUsers.length > 0) {
      titleUsersCreate = { create: resolvedUsers };
    }
  }

  const title = await prisma.title.create({
    data: {
      titleNo,
      titleName: data.titleName,
      dataType: data.dataType || '特許',
      markColor: data.markColor,
      parentTitleId: parentTitleIdToUse,
      saveDate: data.saveDate,
      disallowEvaluation: data.disallowEvaluation || false,
      allowEvaluation: data.allowEvaluation !== false,
      viewPermission: data.viewPermission || 'all',
      editPermission: data.editPermission || 'creator',
      mainEvaluation: data.mainEvaluation !== false,
      singlePatentMultipleEvaluations: data.singlePatentMultipleEvaluations || false,
      createdBy,
      mainOwnerId: mainOwnerFromResolved, // Set mainOwnerId directly during creation
      titleUsers: titleUsersCreate,
    },
    include: {
      titleUsers: {
        include: {
          user: true,
        },
      },
    },
  });

  // No need for separate update call anymore

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

    // After creating TitleUser records, set mainOwnerId on Title based on title_users
    const mainTu = await prisma.titleUser.findFirst({ where: { titleId: id, isMainResponsible: true } });
    const mainOwnerIdToSet = mainTu ? mainTu.userId : null;
    if (mainOwnerIdToSet) {
      await prisma.title.update({ where: { id }, data: { mainOwnerId: mainOwnerIdToSet } as any });
    }
  }

  return title;
};

export const deleteTitle = async (id: string, userId: string, userPermission: string) => {
  const canEdit = await canEditTitle(userId, id, userPermission as any);
  if (!canEdit) {
    throw new AppError('Access denied', 403);
  }

  // Delete in order of dependencies (reverse of creation order)
  // to avoid FK constraint violations (since we use onDelete: NoAction on some relations)
  try {
    await prisma.$transaction(async (tx) => {
      // 1. Delete activity logs referencing this title (has NoAction on titleId)
      await tx.activityLog.deleteMany({
        where: { titleId: id },
      });

      // 2. Delete evaluations (has NoAction on titleId)
      await tx.evaluation.deleteMany({
        where: { titleId: id },
      });

      // 3. Delete patent classifications (has NoAction on patentId)
      // Get all patents for this title first
      const patents = await tx.patent.findMany({
        where: { titleId: id },
        select: { id: true },
      });
      for (const patent of patents) {
        await tx.patentClassification.deleteMany({
          where: { patentId: patent.id },
        });
      }

      // 4. Delete patents
      await tx.patent.deleteMany({
        where: { titleId: id },
      });

      // 5. Delete title-user relationships (auto-cascades but delete explicitly for clarity)
      await tx.titleUser.deleteMany({
        where: { titleId: id },
      });

      // 6. Delete attachments (auto-cascades but delete explicitly)
      await tx.attachment.deleteMany({
        where: { titleId: id },
      });

      // 7. Delete orphaned patent classifications (if any)
      await tx.patentClassification.deleteMany({
        where: { titleId: id },
      });

      // 8. Finally, delete the title
      await tx.title.delete({
        where: { id },
      });
    });
  } catch (err: any) {
    console.error('Error deleting title:', err);
    throw new AppError(`Failed to delete title: ${err?.message || 'Unknown error'}`, 500);
  }

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
        create: originalTitle.titleUsers.map((tu: any) => ({
          userId: tu.userId,
          isMainResponsible: tu.isMainResponsible,
          isAdmin: tu.isAdmin,
          isGeneral: tu.isGeneral,
          isViewer: tu.isViewer,
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

