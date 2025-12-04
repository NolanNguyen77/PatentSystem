import { Response } from 'express';
import multer from 'multer';
import { importCSV, exportData, getExportFields, exportSearchResults } from '../services/importExport.service';
import { AuthRequest } from '../middleware/auth.middleware';
import { logActivity } from '../middleware/logger.middleware';
import env from '../config/env';
import path from 'path';
import fs from 'fs';

// Configure multer for file uploads
const storage = multer.memoryStorage();
export const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(env.MAX_FILE_SIZE),
  },
  fileFilter: (req, file, cb) => {
    const allowedExtensions = ['.csv', '.xlsx', '.xls'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedExtensions.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only CSV and Excel files are allowed.'));
    }
  },
});

export const importCSVController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    const { titleId, mapping } = req.body;
    if (!titleId) {
      res.status(400).json({ error: 'Title ID is required' });
      return;
    }

    const columnMapping = typeof mapping === 'string' ? JSON.parse(mapping) : mapping;

    const result = await importCSV(
      req.file.buffer,
      titleId,
      columnMapping,
      req.file.originalname
    );

    await logActivity(
      req.user.id,
      'import',
      'patent',
      titleId,
      `Imported ${result.imported} patents, ${result.failed} failed`,
      req.ip,
      titleId
    );

    res.json({ data: result });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      error: error.message || 'Failed to import file',
    });
  }
};

export const exportDataController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const config = req.body;
    const result = await exportData(config);

    await logActivity(
      req.user.id,
      'export',
      'patent',
      config.titleId,
      `Exported data in ${config.format} format`,
      req.ip,
      config.titleId
    );

    if (config.format === 'excel') {
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=patent_export_${Date.now()}.xlsx`);
      res.send(result);
    } else {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=patent_export_${Date.now()}.csv`);
      res.send(result);
    }
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      error: error.message || 'Failed to export data',
    });
  }
};

export const getExportFieldsController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const fields = await getExportFields();
    res.json({ data: fields });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      error: error.message || 'Failed to get export fields',
    });
  }
};

export const exportSearchResultsController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { criteria, format } = req.body;
    const result = await exportSearchResults(criteria, req.user.id, format);

    await logActivity(
      req.user.id,
      'export',
      'patent',
      'search_results',
      `Exported search results in ${format} format`,
      req.ip
    );

    if (format === 'excel') {
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=search_results_${Date.now()}.xlsx`);
      res.send(result);
    } else {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=search_results_${Date.now()}.csv`);
      res.send(result);
    }
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      error: error.message || 'Failed to export search results',
    });
  }
};

