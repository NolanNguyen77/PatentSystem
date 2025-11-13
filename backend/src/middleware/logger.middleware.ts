import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';
import prisma from '../config/database';
import { AuthRequest } from './auth.middleware';

export const requestLogger = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info({
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      userId: req.user?.userId,
      ip: req.ip,
    });
  });
  
  next();
};

export const logActivity = async (
  userId: string | undefined,
  action: string,
  targetType: string,
  targetId: string | undefined,
  details?: string,
  ipAddress?: string,
  titleId?: string
): Promise<void> => {
  try {
    await prisma.activityLog.create({
      data: {
        userId: userId || null,
        titleId: titleId || null,
        action,
        targetType,
        targetId: targetId || null,
        details,
        ipAddress: ipAddress || null,
      },
    });
  } catch (error) {
    logger.error('Failed to log activity', error);
  }
};

