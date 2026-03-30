import { Request, Response, NextFunction } from 'express';

/** Application error with HTTP status code */
export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

/**
 * Global Express error handler.
 * Returns `{ error: message, code?: string }` with appropriate HTTP status.
 */
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: err.message,
      ...(err.code && { code: err.code }),
    });
    return;
  }

  // Multer file size error
  if (err.message === 'File too large') {
    res.status(413).json({ error: 'File exceeds the maximum allowed size', code: 'FILE_TOO_LARGE' });
    return;
  }

  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
}
