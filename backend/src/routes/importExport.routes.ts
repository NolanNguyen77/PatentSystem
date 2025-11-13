import { Router } from 'express';
import {
  importCSVController,
  exportDataController,
  getExportFieldsController,
  upload,
} from '../controllers/importExport.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.post('/csv', upload.single('file'), importCSVController);
router.post('/data', exportDataController);
router.get('/fields', getExportFieldsController);

export default router;

