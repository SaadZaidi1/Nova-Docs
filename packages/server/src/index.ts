import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { config } from './config';
import { errorHandler } from './middleware/errorHandler';
import { authRouter } from './modules/auth/auth.router';
import { documentsRouter } from './modules/documents/documents.router';
import { sharingRouter } from './modules/sharing/sharing.router';
import { uploadRouter } from './modules/upload/upload.router';

const app = express();

// Middleware
app.use(cors({
  origin: config.CLIENT_URL,
  credentials: true,
}));
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/documents', documentsRouter);
app.use('/api/documents/:id/shares', sharingRouter);
app.use('/api/upload', uploadRouter);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Global error handler (must be last)
app.use(errorHandler);

// Start server
if (process.env.NODE_ENV !== 'test') {
  app.listen(config.PORT, () => {
    console.log(`🚀 Nova Docs server running on http://localhost:${config.PORT}`);
  });
}

export { app };
