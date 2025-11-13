import { Router } from 'express';
import {
  uploadAttachmentController,
  getAttachmentsController,
  deleteAttachmentController,
  downloadAttachmentController,
  upload,
} from '../controllers/attachment.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.post('/titles/:id/attachments', upload.single('file'), uploadAttachmentController);
router.get('/titles/:id/attachments', getAttachmentsController);
router.delete('/attachments/:id', deleteAttachmentController);
router.get('/attachments/:id/download', downloadAttachmentController);

export default router;

