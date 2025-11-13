import { Response } from 'express';
import { getClassificationData, autoClassifyPatents } from '../services/classification.service';
import { AuthRequest } from '../middleware/auth.middleware';

export const getClassificationController = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const titleId = req.params.id;
    const type = req.query.type as 'year' | 'month' | 'week';
    const dateFilter = (req.query.dateFilter as 'application' | 'publication') || 'application';

    if (!type || !['year', 'month', 'week'].includes(type)) {
      res.status(400).json({ error: 'Invalid classification type' });
      return;
    }

    const data = await getClassificationData(titleId, type, dateFilter);
    res.json({ data });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      error: error.message || 'Failed to get classification data',
    });
  }
};

export const autoClassifyController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const titleId = req.params.id;
    const classified = await autoClassifyPatents(titleId);
    
    res.json({
      data: {
        classified,
        message: `${classified} patents classified successfully`,
      },
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      error: error.message || 'Failed to auto-classify patents',
    });
  }
};

