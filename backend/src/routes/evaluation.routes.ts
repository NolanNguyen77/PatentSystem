import { Router } from 'express';
import {
  getEvaluationsByPatentController,
  createEvaluationController,
  updateEvaluationController,
  deleteEvaluationController,
} from '../controllers/evaluation.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { createEvaluationSchema, updateEvaluationSchema } from '../utils/validators';

const router = Router();

router.use(authenticate);

router.get('/patent/:id', getEvaluationsByPatentController);
router.post('/', validate(createEvaluationSchema), createEvaluationController);
router.put('/:id', validate(updateEvaluationSchema), updateEvaluationController);
router.delete('/:id', deleteEvaluationController);

export default router;

