import { Response } from 'express';
import {
  getPatentsByTitle,
  getPatentById,
  createPatent,
  updatePatent,
  updatePatentStatus,
  deletePatent,
  getPatentsByCompany,
} from '../services/patent.service';
import { AuthRequest } from '../middleware/auth.middleware';
import { logActivity } from '../middleware/logger.middleware';

export const getPatentsByTitleController = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const filters = {
      status: req.query.status as 'evaluated' | 'unevaluated' | undefined,
      search: req.query.search as string | undefined,
      applicant: req.query.applicant as string | undefined,
    };

    const result = await getPatentsByTitle(req.params.id, filters);
    res.json({ data: result });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      error: error.message || 'Failed to get patents',
    });
  }
};

export const getPatentByIdController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const patent = await getPatentById(req.params.id);
    res.json({ data: patent });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      error: error.message || 'Failed to get patent',
    });
  }
};

export const createPatentController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const patent = await createPatent(req.body);
    
    await logActivity(
      req.user.id,
      'create',
      'patent',
      patent.id,
      `Created patent: ${patent.patentNo || patent.id}`,
      req.ip,
      patent.titleId
    );

    res.status(201).json({
      data: {
        id: patent.id,
        message: 'Patent created successfully',
      },
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      error: error.message || 'Failed to create patent',
    });
  }
};

export const updatePatentController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const patent = await updatePatent(req.params.id, req.body);
    
    await logActivity(
      req.user.id,
      'update',
      'patent',
      patent.id,
      `Updated patent: ${patent.patentNo || patent.id}`,
      req.ip,
      patent.titleId
    );

    res.json({
      data: {
        message: 'Patent updated successfully',
      },
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      error: error.message || 'Failed to update patent',
    });
  }
};

export const updatePatentStatusController = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { status } = req.body;
    const patent = await updatePatentStatus(req.params.id, status);
    
    await logActivity(
      req.user.id,
      'update',
      'patent',
      patent.id,
      `Updated patent status to: ${status}`,
      req.ip,
      patent.titleId
    );

    res.json({
      data: {
        message: 'Patent status updated successfully',
      },
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      error: error.message || 'Failed to update patent status',
    });
  }
};

export const deletePatentController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    await deletePatent(req.params.id);
    
    await logActivity(
      req.user.id,
      'delete',
      'patent',
      req.params.id,
      'Deleted patent',
      req.ip
    );

    res.json({
      data: {
        message: 'Patent deleted successfully',
      },
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      error: error.message || 'Failed to delete patent',
    });
  }
};

export const getPatentsByCompanyController = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const companyName = decodeURIComponent(req.params.name);
    const filters = {
      status: req.query.status as 'evaluated' | 'unevaluated' | undefined,
    };

    const result = await getPatentsByCompany(companyName, filters);
    res.json({ data: result });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      error: error.message || 'Failed to get patents by company',
    });
  }
};

