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
      console.warn('Auth failed: No Authorization header');
      res.status(401).json({ error: 'No token provided' });
      return;
    }
     // Extract token
    const token = authHeader.substring(7);
    let payload;
    try {
      payload = verifyToken(token);
    } catch (err: any) {
      console.warn('Auth failed: token verification error', err?.message || err);
      res.status(401).json({ error: 'Invalid or expired token' });
      return;
    }
    
    // Verify user still exists and is active
    const user = await prisma.user.findUnique({
      where: { userId: payload.userId },
      select: { id: true, userId: true, isActive: true, permission: true },
    });
    
    if (!user || !user.isActive) {
      console.warn('Auth failed: user not found or inactive', { payloadUserId: payload.userId, found: !!user });
      res.status(401).json({ error: 'User not found or inactive' });
      return;
    }
    
    req.user = {
      ...payload,
      id: user.id,
    };
    
    next();
  } catch (error) {
    console.error('Auth middleware unexpected error', error);
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

