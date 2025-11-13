import { Response } from 'express';
import { mergeTitles } from '../services/merge.service';
import { AuthRequest } from '../middleware/auth.middleware';
import { logActivity } from '../middleware/logger.middleware';

export const mergeTitlesController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const result = await mergeTitles(req.body, req.user.id, req.user.permission);
    
    await logActivity(
      req.user.id,
      'create',
      'title',
      result.newTitleId,
      `Merged ${result.mergedCount} patents from ${req.body.sourceTitleIds.length} titles`,
      req.ip,
      result.newTitleId
    );

    res.status(201).json({ data: result });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      error: error.message || 'Failed to merge titles',
    });
  }
};

