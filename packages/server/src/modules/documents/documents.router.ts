import { Router, Request, Response, NextFunction } from 'express';
import { PatchDocumentInputSchema } from '../../utils/validation';
import { authMiddleware } from '../../middleware/auth';
import {
  listDocuments,
  createDocument,
  getDocument,
  updateDocument,
  deleteDocument,
} from './documents.service';

const router = Router();

// All document routes require authentication
router.use(authMiddleware);

/**
 * GET /documents
 * Lists all documents accessible to the authenticated user.
 */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const documents = await listDocuments(req.user!.id);
    res.json({ documents });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /documents
 * Creates a new blank document.
 */
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const document = await createDocument(req.user!.id);
    res.status(201).json({ document });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /documents/:id
 * Retrieves a single document if the user has access.
 */
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const document = await getDocument(req.params.id, req.user!.id);
    res.json({ document });
  } catch (err) {
    next(err);
  }
});

/**
 * PATCH /documents/:id
 * Updates a document's title and/or content.
 */
router.patch('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = PatchDocumentInputSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: parsed.error.errors[0]?.message || 'Invalid input',
        code: 'VALIDATION_ERROR',
      });
      return;
    }

    const document = await updateDocument(req.params.id, req.user!.id, parsed.data);
    res.json({ document });
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /documents/:id
 * Deletes a document. Owner only.
 */
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await deleteDocument(req.params.id, req.user!.id);
    res.json({ message: 'Document deleted successfully' });
  } catch (err) {
    next(err);
  }
});

export { router as documentsRouter };
