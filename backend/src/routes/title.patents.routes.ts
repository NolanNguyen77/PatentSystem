import { Router } from 'express';
import { getPatentsByTitleController } from '../controllers/patent.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/:id/patents', getPatentsByTitleController);

export default router;

