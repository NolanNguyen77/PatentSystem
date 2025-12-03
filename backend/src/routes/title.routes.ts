import { Router } from 'express';
import {
  getAllTitlesController,
  getTitleByIdController,
  createTitleController,
  updateTitleController,
  deleteTitleController,
  copyTitleController,
  searchTitlesController,
  getMergeCandidatesController,
  mergeTitlesController,
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
router.post('/merge/candidates', getMergeCandidatesController);
router.post('/merge', mergeTitlesController);

export default router;
