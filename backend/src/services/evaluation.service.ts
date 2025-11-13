import prisma from '../config/database';
import { AppError } from '../middleware/error.middleware';
import { canEvaluate } from '../utils/permissions';

export interface CreateEvaluationData {
  patentId: string;
  titleId: string;
  status: string;
  comment?: string;
  score?: number;
  isPublic?: boolean;
}

export const getEvaluationsByPatent = async (patentId: string) => {
  const evaluations = await prisma.evaluation.findMany({
    where: {
      patentId,
      isDeleted: false,
    },
    include: {
      user: {
        select: {
          userId: true,
          name: true,
          department: {
            select: {
              name: true,
            },
          },
        },
      },
      title: {
        select: {
          id: true,
          titleNo: true,
          titleName: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return evaluations;
};

export const createEvaluation = async (
  data: CreateEvaluationData,
  userId: string,
  userPermission: string
) => {
  // Check permission
  const canEval = await canEvaluate(userId, data.titleId, userPermission as any);
  if (!canEval) {
    throw new AppError('You do not have permission to evaluate this patent', 403);
  }

  // Check if patent exists
  const patent = await prisma.patent.findUnique({
    where: { id: data.patentId },
    include: { title: true },
  });

  if (!patent) {
    throw new AppError('Patent not found', 404);
  }

  // Check if single patent multiple evaluations is allowed
  if (!patent.title.singlePatentMultipleEvaluations) {
    // Check if user already has an evaluation
    const existing = await prisma.evaluation.findFirst({
      where: {
        patentId: data.patentId,
        userId,
        isDeleted: false,
      },
    });

    if (existing) {
      throw new AppError('You already have an evaluation for this patent', 400);
    }
  }

  const evaluation = await prisma.evaluation.create({
    data: {
      patentId: data.patentId,
      titleId: data.titleId,
      userId,
      status: data.status,
      comment: data.comment,
      score: data.score,
      isPublic: data.isPublic || false,
    },
  });

  // Update patent status if main evaluation
  if (patent.title.mainEvaluation && data.status !== '未評価') {
    await prisma.patent.update({
      where: { id: data.patentId },
      data: { evaluationStatus: data.status },
    });
  }

  return evaluation;
};

export const updateEvaluation = async (
  id: string,
  data: Partial<CreateEvaluationData>,
  userId: string
) => {
  const evaluation = await prisma.evaluation.findUnique({
    where: { id },
    include: { patent: { include: { title: true } } },
  });

  if (!evaluation) {
    throw new AppError('Evaluation not found', 404);
  }

  // Only owner can update
  if (evaluation.userId !== userId) {
    throw new AppError('You can only update your own evaluations', 403);
  }

  const updated = await prisma.evaluation.update({
    where: { id },
    data: {
      status: data.status,
      comment: data.comment,
      score: data.score,
      isPublic: data.isPublic,
    },
  });

  // Update patent status if main evaluation
  if (evaluation.patent.title.mainEvaluation && data.status) {
    await prisma.patent.update({
      where: { id: evaluation.patentId },
      data: { evaluationStatus: data.status },
    });
  }

  return updated;
};

export const deleteEvaluation = async (id: string, userId: string) => {
  const evaluation = await prisma.evaluation.findUnique({
    where: { id },
  });

  if (!evaluation) {
    throw new AppError('Evaluation not found', 404);
  }

  // Only owner can delete
  if (evaluation.userId !== userId) {
    throw new AppError('You can only delete your own evaluations', 403);
  }

  // Soft delete
  await prisma.evaluation.update({
    where: { id },
    data: { isDeleted: true },
  });

  return { message: 'Evaluation deleted successfully' };
};

