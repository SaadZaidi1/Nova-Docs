import { Router, Request, Response, NextFunction } from 'express';
import { RegisterInputSchema, LoginInputSchema } from '../../utils/validation';
import { register, login } from './auth.service';
import { authMiddleware } from '../../middleware/auth';

const router = Router();

/**
 * POST /auth/register
 * Creates a new user account and returns a JWT token.
 */
router.post('/register', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = RegisterInputSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: parsed.error.errors[0]?.message || 'Invalid input',
        code: 'VALIDATION_ERROR',
      });
      return;
    }

    const result = await register(parsed.data);

    // Set httpOnly cookie
    res.cookie('nova_token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /auth/login
 * Authenticates a user and returns a JWT token.
 */
router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = LoginInputSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: parsed.error.errors[0]?.message || 'Invalid input',
        code: 'VALIDATION_ERROR',
      });
      return;
    }

    const result = await login(parsed.data);

    // Set httpOnly cookie
    res.cookie('nova_token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /auth/me
 * Returns the currently authenticated user's info.
 */
router.get('/me', authMiddleware, (req: Request, res: Response) => {
  res.json({ user: req.user });
});

export { router as authRouter };
