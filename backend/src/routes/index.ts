import { Router } from 'express';
import authRoutes from './auth.routes';
import titleRoutes from './title.routes';
import titlePatentsRoutes from './title.patents.routes';
import patentRoutes from './patent.routes';
import evaluationRoutes from './evaluation.routes';
import userRoutes from './user.routes';
import importExportRoutes from './importExport.routes';
import classificationRoutes from './classification.routes';
import mergeRoutes from './merge.routes';
import attachmentRoutes from './attachment.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/titles', titleRoutes);
router.use('/titles', titlePatentsRoutes);
router.use('/patents', patentRoutes);
router.use('/evaluations', evaluationRoutes);
router.use('/users', userRoutes);
router.use('/import', importExportRoutes);
router.use('/export', importExportRoutes);
router.use('/', classificationRoutes);
router.use('/', mergeRoutes);
router.use('/', attachmentRoutes);

export default router;

