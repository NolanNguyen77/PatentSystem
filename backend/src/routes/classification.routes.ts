import { Router } from 'express';
import {
  getClassificationController,
  autoClassifyController,
} from '../controllers/classification.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/titles/:id/classification', getClassificationController);
router.post('/classifications/auto-classify/:id', autoClassifyController);

export default router;

