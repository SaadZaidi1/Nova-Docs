import { Router, Request, Response, NextFunction } from 'express';
import { ShareInputSchema } from '../../utils/validation';
import { authMiddleware } from '../../middleware/auth';
import { getShares, createShare, revokeShare } from './sharing.service';

const router = Router({ mergeParams: true });

// All sharing routes require authentication
router.use(authMiddleware);

/**
 * GET /documents/:id/shares
 * Lists all shares for a document. Owner only.
 */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const shares = await getShares(req.params.id, req.user!.id);
    res.json({ shares });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /documents/:id/shares
 * Grants access to another user by email.
 */
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = ShareInputSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: parsed.error.errors[0]?.message || 'Invalid input',
        code: 'VALIDATION_ERROR',
      });
      return;
    }

    const share = await createShare(
      req.params.id,
      req.user!.id,
      parsed.data.email,
      parsed.data.permission
    );
    res.status(201).json({ share });
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /documents/:id/shares/:userId
 * Revokes access for a specific user. Owner only.
 */
router.delete('/:userId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await revokeShare(req.params.id, req.user!.id, req.params.userId);
    res.json({ message: 'Share revoked successfully' });
  } catch (err) {
    next(err);
  }
});

export { router as sharingRouter };
