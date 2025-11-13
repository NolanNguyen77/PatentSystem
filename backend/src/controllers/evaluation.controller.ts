import { Response } from 'express';
import {
  getEvaluationsByPatent,
  createEvaluation,
  updateEvaluation,
  deleteEvaluation,
} from '../services/evaluation.service';
import { AuthRequest } from '../middleware/auth.middleware';
import { logActivity } from '../middleware/logger.middleware';

export const getEvaluationsByPatentController = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const evaluations = await getEvaluationsByPatent(req.params.id);
    res.json({ data: { evaluations } });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      error: error.message || 'Failed to get evaluations',
    });
  }
};

export const createEvaluationController = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const evaluation = await createEvaluation(req.body, req.user.id, req.user.permission);
    
    await logActivity(
      req.user.id,
      'create',
      'evaluation',
      evaluation.id,
      `Created evaluation: ${evaluation.status}`,
      req.ip,
      evaluation.titleId
    );

    res.status(201).json({
      data: {
        id: evaluation.id,
        message: 'Evaluation created successfully',
      },
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      error: error.message || 'Failed to create evaluation',
    });
  }
};

export const updateEvaluationController = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const evaluation = await updateEvaluation(req.params.id, req.body, req.user.id);
    
    await logActivity(
      req.user.id,
      'update',
      'evaluation',
      evaluation.id,
      `Updated evaluation: ${evaluation.status}`,
      req.ip,
      evaluation.titleId
    );

    res.json({
      data: {
        message: 'Evaluation updated successfully',
      },
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      error: error.message || 'Failed to update evaluation',
    });
  }
};

export const deleteEvaluationController = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    await deleteEvaluation(req.params.id, req.user.id);
    
    await logActivity(
      req.user.id,
      'delete',
      'evaluation',
      req.params.id,
      'Deleted evaluation',
      req.ip
    );

    res.json({
      data: {
        message: 'Evaluation deleted successfully',
      },
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      error: error.message || 'Failed to delete evaluation',
    });
  }
};

