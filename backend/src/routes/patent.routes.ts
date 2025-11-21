import { Router } from 'express';
import {
  getPatentsByTitleController,
  getPatentByIdController,
  createPatentController,
  updatePatentController,
  updatePatentStatusController,
  deletePatentController,
  deletePatentsController,
  getPatentsByCompanyController,
  importPatentsController,
} from '../controllers/patent.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { createPatentSchema, updatePatentSchema } from '../utils/validators';

const router = Router();

router.use(authenticate);

router.post('/import', importPatentsController);
router.post('/delete-batch', deletePatentsController);
router.get('/:id', getPatentByIdController);
router.post('/', validate(createPatentSchema), createPatentController);
router.put('/:id', validate(updatePatentSchema), updatePatentController);
router.put('/:id/status', updatePatentStatusController);
router.delete('/:id', deletePatentController);

// Company patents
router.get('/companies/:name/patents', getPatentsByCompanyController);

export default router;

