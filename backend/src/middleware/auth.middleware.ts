import { Request, Response, NextFunction } from 'express';
import { verifyToken, JWTPayload } from '../config/jwt';
import prisma from '../config/database';

export interface AuthRequest extends Request {
  user?: JWTPayload & { id: string };
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'No token provided' });
      return;
    }
     // Extract token
    const token = authHeader.substring(7);
    const payload = verifyToken(token);
    
    // Verify user still exists and is active
    const user = await prisma.user.findUnique({
      where: { userId: payload.userId },
      select: { id: true, userId: true, isActive: true, permission: true },
    });
    
    if (!user || !user.isActive) {
      res.status(401).json({ error: 'User not found or inactive' });
      return;
    }
    
    req.user = {
      ...payload,
      id: user.id,
    };
    
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

export const requirePermission = (requiredPermission: '管理者' | '一般' | '閲覧') => {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }
    
    const permissionHierarchy: Record<string, number> = {
      閲覧: 1,
      一般: 2,
      管理者: 3,
    };
    
    const userPermission = req.user.permission as string;
    
    if (permissionHierarchy[userPermission] < permissionHierarchy[requiredPermission]) {
      res.status(403).json({ error: 'Insufficient permissions' });
      return;
    }
    
    next();
  };
};

