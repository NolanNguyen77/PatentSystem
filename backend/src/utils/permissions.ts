import prisma from '../config/database';
import { JWTPayload } from '../config/jwt';

export type Permission = '管理者' | '一般' | '閲覧';

const permissionHierarchy: Record<Permission, number> = {
  管理者: 3,
  一般: 2,
  閲覧: 1,
};

export const hasPermission = (userPermission: Permission, requiredPermission: Permission): boolean => {
  return permissionHierarchy[userPermission] >= permissionHierarchy[requiredPermission];
};

// Helper function to check if user is 主担当 of a title
const isMainResponsibleForTitle = (titleUsers: any[], userId: string): boolean => {
  return titleUsers.some(tu => tu.userId === userId && tu.isMainResponsible === true);
};

// Helper function to check if user is Admin (管理者) for a title
const isAdminForTitle = (titleUsers: any[], userId: string): boolean => {
  return titleUsers.some(tu => tu.userId === userId && tu.isAdmin === true);
};

export const canViewTitle = async (
  userId: string,
  titleId: string,
  userPermission: Permission
): Promise<boolean> => {
  const title = await prisma.title.findUnique({
    where: { id: titleId },
    include: { titleUsers: true },
  });

  if (!title) return false;

  // システム管理者 can view all
  if (userPermission === '管理者') return true;

  // 主担当 (Main Responsible) of this title can view everything
  if (isMainResponsibleForTitle(title.titleUsers, userId)) return true;

  // タイトル管理者 (Admin of this title) can view everything
  if (isAdminForTitle(title.titleUsers, userId)) return true;

  // Check view permission setting
  if (title.viewPermission === 'all') return true;
  if (title.viewPermission === 'creator' && title.createdBy === userId) return true;
  if (title.viewPermission === 'assigned') {
    return title.titleUsers.some(tu => tu.userId === userId);
  }

  return false;
};

export const canEditTitle = async (
  userId: string,
  titleId: string,
  userPermission: Permission
): Promise<boolean> => {
  const title = await prisma.title.findUnique({
    where: { id: titleId },
    include: { titleUsers: true },
  });

  if (!title) return false;

  // システム管理者 can edit all
  if (userPermission === '管理者') return true;

  // 主担当 (Main Responsible) of this title has FULL edit access
  if (isMainResponsibleForTitle(title.titleUsers, userId)) return true;

  // タイトル管理者 (Admin of this title) has full edit access
  if (isAdminForTitle(title.titleUsers, userId)) return true;

  // Check edit permission setting
  if (title.editPermission === 'all') return true;
  if (title.editPermission === 'creator' && title.createdBy === userId) return true;
  if (title.editPermission === 'assigned') {
    return title.titleUsers.some(tu => tu.userId === userId);
  }

  return false;
};

export const canEvaluate = async (
  userId: string,
  titleId: string,
  userPermission: Permission
): Promise<boolean> => {
  const title = await prisma.title.findUnique({
    where: { id: titleId },
    include: { titleUsers: true },
  });

  if (!title) return false;

  // Check if evaluation is allowed for this title
  if (!title.allowEvaluation) return false;

  // システム管理者 can always evaluate
  if (userPermission === '管理者') return true;

  // 主担当 (Main Responsible) of this title can always evaluate
  if (isMainResponsibleForTitle(title.titleUsers, userId)) return true;

  // タイトル管理者 (Admin of this title) can always evaluate
  if (isAdminForTitle(title.titleUsers, userId)) return true;

  // 一般 users assigned to this title can evaluate
  return title.titleUsers.some(tu => tu.userId === userId);
};

export const validateMainResponsible = async (
  titleId: string,
  newMainResponsibleUserId: string
): Promise<boolean> => {
  const existingMain = await prisma.titleUser.findFirst({
    where: {
      titleId,
      isMainResponsible: true,
    },
  });

  // If no main responsible exists, allow setting
  if (!existingMain) return true;

  // If same user, allow
  if (existingMain.userId === newMainResponsibleUserId) return true;

  // Only one main responsible allowed
  return false;
};

