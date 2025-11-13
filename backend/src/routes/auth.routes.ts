import { Router } from 'express';
import {
  loginController,
  logoutController,
  getMeController,
} from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { loginSchema } from '../utils/validators';

const router = Router();

router.post('/login', validate(loginSchema), loginController);
router.post('/logout', authenticate, logoutController);
router.get('/me', authenticate, getMeController);

export default router;

