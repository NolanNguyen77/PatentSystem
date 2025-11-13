import { Router } from 'express';
import { mergeTitlesController } from '../controllers/merge.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.post('/titles/merge', mergeTitlesController);

export default router;

