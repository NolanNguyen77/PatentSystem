import { Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import prisma from '../config/database';
import { AppError } from '../middleware/error.middleware';
import { AuthRequest } from '../middleware/auth.middleware';
import { logActivity } from '../middleware/logger.middleware';
import env from '../config/env';

// Ensure upload directory exists
const uploadDir = env.UPLOAD_DIR;
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  },
});

export const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(env.MAX_FILE_SIZE),
  },
});

export const uploadAttachmentController = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    const titleId = req.params.id;

    // Verify title exists
    const title = await prisma.title.findUnique({
      where: { id: titleId },
    });

    if (!title) {
      // Delete uploaded file
      fs.unlinkSync(req.file.path);
      throw new AppError('Title not found', 404);
    }

    const attachment = await prisma.attachment.create({
      data: {
        titleId,
        filename: req.file.filename,
        originalName: Buffer.from(req.file.originalname, 'latin1').toString('utf8'),
        size: BigInt(req.file.size),
        mimeType: req.file.mimetype,
        filePath: req.file.path,
        uploadedBy: req.user.userId,
      },
    });

    await logActivity(
      req.user.id,
      'create',
      'attachment',
      attachment.id,
      `Uploaded attachment: ${req.file.originalname}`,
      req.ip,
      titleId
    );

    res.status(201).json({
      data: {
        id: attachment.id,
        filename: attachment.filename,
        url: `/api/attachments/${attachment.id}/download`,
      },
    });
  } catch (error: any) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(error.statusCode || 500).json({
      error: error.message || 'Failed to upload attachment',
    });
  }
};

export const getAttachmentsController = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const titleId = req.params.id;
    const attachments = await prisma.attachment.findMany({
      where: { titleId },
      orderBy: { uploadedAt: 'desc' },
    });

    res.json({
      data: {
        attachments: attachments.map((att) => ({
          id: att.id,
          titleId: att.titleId,
          filename: att.filename,
          originalName: att.originalName,
          size: att.size.toString(),
          mimeType: att.mimeType,
          uploadedBy: att.uploadedBy,
          uploadedAt: att.uploadedAt,
          url: `/api/attachments/${att.id}/download`,
        })),
      },
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      error: error.message || 'Failed to get attachments',
    });
  }
};

export const deleteAttachmentController = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const attachment = await prisma.attachment.findUnique({
      where: { id: req.params.id },
    });

    if (!attachment) {
      throw new AppError('Attachment not found', 404);
    }

    // Delete file from filesystem
    if (fs.existsSync(attachment.filePath)) {
      fs.unlinkSync(attachment.filePath);
    }

    await prisma.attachment.delete({
      where: { id: req.params.id },
    });

    await logActivity(
      req.user.id,
      'delete',
      'attachment',
      attachment.id,
      `Deleted attachment: ${attachment.originalName}`,
      req.ip,
      attachment.titleId
    );

    res.json({
      data: {
        message: 'Attachment deleted successfully',
      },
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      error: error.message || 'Failed to delete attachment',
    });
  }
};

export const downloadAttachmentController = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const attachment = await prisma.attachment.findUnique({
      where: { id: req.params.id },
    });

    if (!attachment) {
      throw new AppError('Attachment not found', 404);
    }

    if (!fs.existsSync(attachment.filePath)) {
      throw new AppError('File not found on server', 404);
    }

    res.download(path.resolve(attachment.filePath), attachment.originalName, (err) => {
      if (err) {
        if (!res.headersSent) {
          res.status(500).json({
            error: 'Failed to download attachment',
          });
        }
      }
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      error: error.message || 'Failed to download attachment',
    });
  }
};

