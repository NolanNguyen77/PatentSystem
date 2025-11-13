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

  // 管理者 có thể xem tất cả
  if (userPermission === '管理者') return true;

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

  // 管理者 có thể edit tất cả
  if (userPermission === '管理者') return true;

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

  // Check if evaluation is allowed
  if (!title.allowEvaluation) return false;

  // 管理者 có thể evaluate
  if (userPermission === '管理者') return true;

  // Check if user is assigned to title
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

