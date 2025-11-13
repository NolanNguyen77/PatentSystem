import { Response } from 'express';
import { login, logout, getCurrentUser } from '../services/auth.service';
import { AuthRequest } from '../middleware/auth.middleware';
import { logActivity } from '../middleware/logger.middleware';

export const loginController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;
    const ipAddress = req.ip || req.socket.remoteAddress;

    const result = await login(username, password, ipAddress);

    res.json({
      success: true,
      token: result.token,
      refreshToken: result.refreshToken,
      user: result.user,
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      error: error.message || 'Login failed',
    });
  }
};

export const logoutController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (req.user) {
      const ipAddress = req.ip || req.socket.remoteAddress;
      await logout(req.user.userId, ipAddress);
    }

    res.json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      error: error.message || 'Logout failed',
    });
  }
};

export const getMeController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const user = await getCurrentUser(req.user.userId);
    res.json({ data: user });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      error: error.message || 'Failed to get user',
    });
  }
};

