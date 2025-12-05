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
              id: true,
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
          attachments: true,
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
    const responsibleId = mainOwner?.id || title.titleUsers.find((tu: any) => tu.isMainResponsible)?.user.id || '';
    const departmentName = mainOwner?.department?.name || title.titleUsers.find((tu: any) => tu.isMainResponsible)?.user.department?.name || '';

    return {
      id: title.id,
      no: title.titleNo,
      title: title.titleName,
      titleName: title.titleName,
      department: departmentName,
      responsible: responsibleName,
      responsibleId: responsibleId,
      dataCount: total,
      evaluated,
      notEvaluated,
      trash: 0, // TODO: Implement trash functionality
      progressRate: Math.round(progressRate * 10) / 10,
      date: title.saveDate,
      dataType: title.dataType,
      attachments: title._count.attachments || 0,
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

  // Calculate assigned count for each user
  const patentIds = title.patents.map((p: any) => p.id);

  const assignmentCounts = await prisma.patentAssignment.groupBy({
    by: ['userId'],
    where: {
      patentId: { in: patentIds }
    },
    _count: {
      patentId: true
    }
  });

  const countMap = new Map();
  assignmentCounts.forEach((item: any) => {
    countMap.set(item.userId, item._count.patentId);
  });

  const titleUsersWithCounts = title.titleUsers.map((tu: any) => ({
    ...tu,
    assignedCount: countMap.get(tu.userId) || 0
  }));

  return {
    ...title,
    titleUsers: titleUsersWithCounts,
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

    // Resolve users: accept either DB id or userId (username). Map to DB UUIDs.
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

      const permissionString = (u.permission as any) || '一般';
      const permissionFlags =
        permissionString === '管理者'
          ? { isAdmin: true, isGeneral: false, isViewer: false }
          : permissionString === '閲覧'
            ? { isAdmin: false, isGeneral: false, isViewer: true }
            : { isAdmin: false, isGeneral: true, isViewer: false };

      resolvedUsers.push({
        titleId: id,
        userId: userRecord.id,
        isMainResponsible: u.isMainResponsible || false,
        ...permissionFlags,
        evalEmail: u.evalEmail || false,
        confirmEmail: u.confirmEmail || false,
        displayOrder: u.displayOrder || 0,
      });
    }

    // Create new users
    if (resolvedUsers.length > 0) {
      await prisma.titleUser.createMany({
        data: resolvedUsers,
      });
    }

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
  userPermission: string,
  copyPatents: boolean = true // Default to true for backward compatibility
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

  // Copy patents if requested
  if (copyPatents && originalTitle.patents.length > 0) {
    await prisma.patent.createMany({
      data: originalTitle.patents.map((patent: any) => ({
        titleId: newTitle.id,
        documentNum: patent.documentNum,
        applicationNum: patent.applicationNum,
        applicationDate: patent.applicationDate,
        publicationDate: patent.publicationDate,
        publicationNum: patent.publicationNum,
        registrationNum: patent.registrationNum,
        announcementNum: patent.announcementNum,
        appealNum: patent.appealNum,
        inventionTitle: patent.inventionTitle,
        applicantName: patent.applicantName,
        fiClassification: patent.fiClassification,
        statusStage: patent.statusStage,
        eventDetail: patent.eventDetail,
        otherInfo: patent.otherInfo,
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

export const getMergeCandidates = async (titleIds: string[], userId: string, userPermission: string) => {
  // 1. Fetch titles with their patents
  const titles = await prisma.title.findMany({
    where: {
      id: { in: titleIds },
    },
    include: {
      patents: true,
    },
  });

  // 2. Filter accessible titles and check for valid data
  const validTitles = [];
  const evaluations = [];

  for (const title of titles) {
    const canView = await canViewTitle(userId, title.id, userPermission as any);
    if (!canView) continue;

    // Filter out titles with no evaluated patents? Or just fetch evaluated patents.
    // The requirement says "loại bỏ 未評価" (remove unevaluated). 
    // We will filter patents that are NOT '未評価' and have a value.
    console.log(`Checking title ${title.titleName} (${title.id}) with ${title.patents.length} patents`);
    const evaluatedPatents = title.patents.filter((p: any) => {
      const isValid = p.evaluationStatus && p.evaluationStatus !== '未評価';
      if (!isValid) {
        // console.log(`Skipping patent ${p.documentNum}: status is '${p.evaluationStatus}'`);
      }
      return isValid;
    });
    console.log(`Found ${evaluatedPatents.length} evaluated patents for ${title.titleName}`);

    // Always add the title to validTitles so it appears in the priority list
    validTitles.push({
      id: title.id,
      titleName: title.titleName,
      titleNo: title.titleNo,
    });

    if (evaluatedPatents.length > 0) {
      for (const p of evaluatedPatents) {
        evaluations.push({
          id: p.id,
          code: title.titleNo, // User requested: 評価記号 = Data No of the title
          titleId: title.id,
          titleName: title.titleName,
          itemName: p.evaluationStatus, // User requested: 項目名 = Evaluation (A, B, C...)
          evaluationStatus: p.evaluationStatus,
          titleNo: title.titleNo
        });
      }
    }
  }

  return {
    titles: validTitles,
    evaluations: evaluations,
  };
};

export const mergeTitles = async (
  data: {
    newTitleName: string;
    department: string; // Not used in Title model directly but maybe for user assignment? 
    // For now we just create the title. 
    // If department implies assigning to a user in that department, we might need more logic.
    // We'll assume it's just metadata or we assign to current user.
    priorityList: string[]; // List of titleIds in priority order
    selectedEvaluations: string[]; // List of patent IDs to include
  },
  userId: string,
  userPermission: string
) => {
  // 1. Create new Title
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

  // Create the title transactionally with patents
  const result = await prisma.$transaction(async (tx) => {
    const newTitle = await tx.title.create({
      data: {
        titleNo,
        titleName: data.newTitleName,
        dataType: '特許', // Default
        saveDate: new Date().toISOString().slice(0, 7).replace('-', '/'), // Current YYYY/MM
        createdBy: userId,
        // We could set mainOwner based on department if we had logic for it.
        // For now, assign to creator.
        titleUsers: {
          create: {
            userId: userId,
            isMainResponsible: true,
            isAdmin: true, // Creator is admin
          },
        },
      },
    });

    // 2. Process patents based on priority
    const addedDocumentNums = new Set<string>();

    // Iterate through priority list
    for (const titleId of data.priorityList) {
      // Find patents for this title that are in selectedEvaluations
      // We need to fetch them from DB to get full data
      const patentsToCopy = await tx.patent.findMany({
        where: {
          titleId: titleId,
          id: { in: data.selectedEvaluations },
        },
      });

      for (const patent of patentsToCopy) {
        const docNum = patent.documentNum || patent.applicationNum; // Unique identifier

        // If we haven't added this patent yet (from a higher priority title)
        if (docNum && !addedDocumentNums.has(docNum)) {
          await tx.patent.create({
            data: {
              titleId: newTitle.id,
              documentNum: patent.documentNum,
              applicationNum: patent.applicationNum,
              applicationDate: patent.applicationDate,
              publicationDate: patent.publicationDate,
              publicationNum: patent.publicationNum,
              registrationNum: patent.registrationNum,
              announcementNum: patent.announcementNum,
              appealNum: patent.appealNum,
              inventionTitle: patent.inventionTitle,
              applicantName: patent.applicantName,
              fiClassification: patent.fiClassification,
              statusStage: patent.statusStage,
              eventDetail: patent.eventDetail,
              otherInfo: patent.otherInfo,
              abstract: patent.abstract,
              claims: patent.claims,
              documentUrl: patent.documentUrl,
              // Copy evaluation data
              evaluationStatus: patent.evaluationStatus,
              // We might want to copy other evaluation fields if they exist in Patent model
              // But Patent model mainly has evaluationStatus. 
              // Actual detailed evaluation might be in 'Evaluation' table?
              // Let's check schema if needed. For now assuming Patent model holds the main status.
            },
          });
          addedDocumentNums.add(docNum);
        }
      }
    }

    return newTitle;
  });

  return {
    id: result.id,
    message: 'Titles merged successfully',
  };
};
