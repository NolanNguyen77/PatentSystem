import prisma from '../config/database';
import { AppError } from '../middleware/error.middleware';

export const getAllUsers = async () => {
  const users = await prisma.user.findMany({
    where: { isActive: true },
    include: {
      department: {
        select: {
          id: true,
          name: true,
          no: true,
        },
      },
    },
    orderBy: { displayOrder: 'asc' },
  });

  return users.map((user) => ({
    id: user.id,
    userId: user.userId,
    name: user.name,
    email: user.email,
    department: user.department?.name || '',
    role: user.permission,
  }));
};

export const getUserById = async (id: string) => {
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      department: true,
    },
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  return user;
};

export const getDepartments = async () => {
  const departments = await prisma.department.findMany({
    where: { isActive: true },
    include: {
      _count: {
        select: {
          users: true,
        },
      },
    },
    orderBy: { displayOrder: 'asc' },
  });

  return departments.map((dept) => ({
    id: dept.id,
    no: dept.no,
    name: dept.name,
    abbreviation: dept.abbreviation,
    displayOrder: dept.displayOrder,
    userCount: dept._count.users,
  }));
};

export const getUsersByDepartment = async (departmentId: string) => {
  const users = await prisma.user.findMany({
    where: {
      departmentId,
      isActive: true,
    },
    select: {
      id: true,
      userId: true,
      name: true,
      email: true,
      permission: true, // Explicitly include permission
      departmentId: true,
      section: true,
      displayOrder: true,
      department: {
        select: {
          id: true,
          no: true,
          name: true,
          abbreviation: true,
        }
      }
    },
    orderBy: { displayOrder: 'asc' },
  });

  return users;
};

