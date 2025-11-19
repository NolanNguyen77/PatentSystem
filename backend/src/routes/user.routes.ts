import { Router } from 'express';
import {
  getAllUsersController,
  getUserByIdController,
  getDepartmentsController,
  getUsersByDepartmentController,
} from '../controllers/user.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

// static routes first
router.get('/departments', getDepartmentsController);
router.get('/departments/:id/users', getUsersByDepartmentController);

// dynamic routes last
router.get('/', getAllUsersController);
router.get('/:id', getUserByIdController);

export default router;

