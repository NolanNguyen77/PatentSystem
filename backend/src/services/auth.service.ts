import bcrypt from 'bcrypt';
import prisma from '../config/database';
import { generateToken, generateRefreshToken, JWTPayload } from '../config/jwt';
import { AppError } from '../middleware/error.middleware';
import { logActivity } from '../middleware/logger.middleware';

export interface LoginResult {
  token: string;
  refreshToken: string;
  user: {
    id: string;
    userId: string;
    name: string;
    email: string | null;
    department: string | null;
    permission: string;
  };
}

export const login = async (
  username: string,
  password: string,
  ipAddress?: string
): Promise<LoginResult> => {
  const user = await prisma.user.findUnique({
    where: { userId: username },
    include: { department: true },
  });

  if (!user || !user.isActive) {
    throw new AppError('Invalid username or password', 401);
  }

  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    throw new AppError('Invalid username or password', 401);
  }

  const payload: JWTPayload = {
    userId: user.userId,
    username: user.name,
    permission: user.permission,
  };

  const token = generateToken(payload);
  const refreshToken = generateRefreshToken(payload);

  // Log login activity
  await logActivity(user.id, 'login', 'user', user.id, 'User logged in', ipAddress);

  return {
    token,
    refreshToken,
    user: {
      id: user.id,
      userId: user.userId,
      name: user.name,
      email: user.email,
      department: user.department?.name || null,
      permission: user.permission,
    },
  };
};

export const logout = async (userId: string, ipAddress?: string): Promise<void> => {
  await logActivity(userId, 'logout', 'user', userId, 'User logged out', ipAddress);
};

export const getCurrentUser = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { userId },
    select: {
      id: true,
      userId: true,
      name: true,
      email: true,
      department: {
        select: {
          id: true,
          name: true,
          no: true,
        },
      },
      permission: true,
      section: true,
      isActive: true,
    },
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  return user;
};

