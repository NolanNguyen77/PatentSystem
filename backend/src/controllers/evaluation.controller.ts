import { Response } from 'express';
import {
  getEvaluationsByPatent,
  createEvaluation,
  updateEvaluation,
  deleteEvaluation,
  batchSaveEvaluations,
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

    if (!evaluation) {
      // Evaluation was skipped (e.g. status was '未評価')
      res.status(200).json({
        data: {
          message: 'Evaluation skipped (status is Unevaluated)',
        },
      });
      return;
    }

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

export const batchSaveEvaluationsController = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { titleId, evaluations } = req.body;

    if (!titleId || !evaluations || !Array.isArray(evaluations)) {
      res.status(400).json({ error: 'Invalid request body' });
      return;
    }

    const results = await batchSaveEvaluations(
      titleId,
      evaluations,
      req.user.id,
      req.user.permission
    );

    await logActivity(
      req.user.id,
      'update',
      'evaluation',
      titleId,
      `Batch saved ${results.created + results.updated} evaluations`,
      req.ip,
      titleId
    );

    res.json({
      data: {
        message: 'Evaluations saved successfully',
        ...results,
      },
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      error: error.message || 'Failed to save evaluations',
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

    const result = await updateEvaluation(req.params.id, req.body, req.user.id);

    if ('deleted' in result) {
      await logActivity(
        req.user.id,
        'delete',
        'evaluation',
        result.id,
        'Deleted evaluation (status changed to Unevaluated)',
        req.ip,
        result.titleId
      );

      res.json({
        data: {
          message: 'Evaluation deleted successfully (status changed to Unevaluated)',
        },
      });
      return;
    }

    const evaluation = result;

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


