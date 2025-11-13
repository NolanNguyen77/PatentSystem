import { Response } from 'express';
import { getAllUsers, getUserById, getDepartments, getUsersByDepartment } from '../services/user.service';
import { AuthRequest } from '../middleware/auth.middleware';

export const getAllUsersController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const users = await getAllUsers();
    res.json({ data: { users } });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      error: error.message || 'Failed to get users',
    });
  }
};

export const getUserByIdController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await getUserById(req.params.id);
    res.json({ data: user });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      error: error.message || 'Failed to get user',
    });
  }
};

export const getDepartmentsController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const departments = await getDepartments();
    res.json({ data: { departments } });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      error: error.message || 'Failed to get departments',
    });
  }
};

export const getUsersByDepartmentController = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const users = await getUsersByDepartment(req.params.id);
    res.json({ data: { users } });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      error: error.message || 'Failed to get users by department',
    });
  }
};

