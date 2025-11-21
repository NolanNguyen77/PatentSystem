import { Response } from 'express';
import {
  getAllTitles,
  getTitleById,
  createTitle,
  updateTitle,
  deleteTitle,
  copyTitle,
  searchTitles,
} from '../services/title.service';
import { AuthRequest } from '../middleware/auth.middleware';
import { logActivity } from '../middleware/logger.middleware';

export const getAllTitlesController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const filters = {
      department: req.query.department as string | undefined,
      search: req.query.search as string | undefined,
      page: req.query.page ? parseInt(req.query.page as string) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
    };

    const result = await getAllTitles(filters, req.user.id, req.user.permission);
    res.json({ data: result });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      error: error.message || 'Failed to get titles',
    });
  }
};

export const getTitleByIdController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const title = await getTitleById(req.params.id, req.user.id, req.user.permission);
    res.json({ data: title });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      error: error.message || 'Failed to get title',
    });
  }
};

export const createTitleController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    // Gọi service để tạo title
    const title = await createTitle(req.body, req.user.userId);

    // Log activity vào database
    await logActivity(
      req.user.id,
      'create',
      'title',
      title.id,
      `Created title: ${title.titleName}`,
      req.ip,
      title.id
    );

    res.status(201).json({
      data: {
        id: title.id,
        message: 'Title created successfully',
      },
    });
  } catch (error: any) {
    console.error('❌ Error in createTitleController:', error);
    res.status(error.statusCode || 500).json({
      error: error.message || 'Failed to create title',
      details: error.stack // Optional: include stack trace for debugging (remove in production)
    });
  }
};

export const updateTitleController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const title = await updateTitle(req.params.id, req.body, req.user.id, req.user.permission);

    await logActivity(
      req.user.id,
      'update',
      'title',
      title.id,
      `Updated title: ${title.titleName}`,
      req.ip,
      title.id
    );

    res.json({
      data: {
        message: 'Title updated successfully',
      },
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      error: error.message || 'Failed to update title',
    });
  }
};

export const deleteTitleController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    await deleteTitle(req.params.id, req.user.id, req.user.permission);

    await logActivity(
      req.user.id,
      'delete',
      'title',
      req.params.id,
      'Deleted title',
      req.ip
    );

    res.json({
      data: {
        message: 'Title deleted successfully',
      },
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      error: error.message || 'Failed to delete title',
    });
  }
};

export const copyTitleController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { newTitleName } = req.body;
    const result = await copyTitle(req.params.id, newTitleName, req.user.id, req.user.permission);

    await logActivity(
      req.user.id,
      'create',
      'title',
      result.id,
      `Copied title to: ${newTitleName}`,
      req.ip,
      result.id
    );

    res.status(201).json({ data: result });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      error: error.message || 'Failed to copy title',
    });
  }
};

export const searchTitlesController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const query = req.query.q as string;
    if (!query) {
      res.status(400).json({ error: 'Query parameter is required' });
      return;
    }

    const result = await searchTitles(query, req.user.id, req.user.permission);
    res.json({ data: result });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      error: error.message || 'Failed to search titles',
    });
  }
};

