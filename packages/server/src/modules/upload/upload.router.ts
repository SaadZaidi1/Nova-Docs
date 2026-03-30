import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authMiddleware } from '../../middleware/auth';
import { config } from '../../config';
import { processUpload } from './upload.service';
import { SUPPORTED_EXTENSIONS, SUPPORTED_MIMETYPES } from './upload.types';

const router = Router();

// Ensure upload directory exists
const uploadDir = path.resolve(config.UPLOAD_DIR);
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure Multer
const upload = multer({
  dest: uploadDir,
  limits: {
    fileSize: config.MAX_FILE_SIZE_MB * 1024 * 1024,
  },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const mimeOk = SUPPORTED_MIMETYPES.includes(file.mimetype);
    const extOk = SUPPORTED_EXTENSIONS.includes(ext);

    if (mimeOk || extOk) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type. Accepted types: ${SUPPORTED_EXTENSIONS.join(', ')}`));
    }
  },
});

/**
 * POST /upload
 * Uploads a file and creates a new document from its content.
 */
router.post(
  '/',
  authMiddleware,
  (req: Request, res: Response, next: NextFunction) => {
    upload.single('file')(req, res, (err) => {
      if (err) {
        if (err.message === 'File too large') {
          res.status(413).json({
            error: `File exceeds the maximum size of ${config.MAX_FILE_SIZE_MB}MB`,
            code: 'FILE_TOO_LARGE',
          });
          return;
        }
        if (err.message.startsWith('Unsupported file type')) {
          res.status(400).json({
            error: err.message,
            code: 'UNSUPPORTED_FILE_TYPE',
          });
          return;
        }
        next(err);
        return;
      }
      next();
    });
  },
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        res.status(400).json({
          error: 'No file uploaded',
          code: 'NO_FILE',
        });
        return;
      }

      const result = await processUpload(req.file, req.user!.id);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  }
);

export { router as uploadRouter };
