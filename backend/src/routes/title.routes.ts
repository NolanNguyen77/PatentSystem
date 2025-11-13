import { Router } from 'express';
import {
  getAllTitlesController,
  getTitleByIdController,
  createTitleController,
  updateTitleController,
  deleteTitleController,
  copyTitleController,
  searchTitlesController,
} from '../controllers/title.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { createTitleSchema, updateTitleSchema } from '../utils/validators';

const router = Router();

router.use(authenticate);

router.get('/', getAllTitlesController);
router.get('/search', searchTitlesController);
router.get('/:id', getTitleByIdController);
router.post('/', validate(createTitleSchema), createTitleController);
router.put('/:id', validate(updateTitleSchema), updateTitleController);
router.delete('/:id', deleteTitleController);
router.post('/:id/copy', copyTitleController);

export default router;
