import dotenv from 'dotenv';
import path from 'path';

// Load .env from server package root
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

/** Type-safe configuration with validation */
interface Config {
  DATABASE_URL: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  PORT: number;
  UPLOAD_DIR: string;
  MAX_FILE_SIZE_MB: number;
  CLIENT_URL: string;
}

/**
 * Retrieves a required environment variable or throws an error.
 * @param key - The environment variable key
 * @returns The environment variable value
 * @throws Error if the variable is not set
 */
function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const config: Config = {
  DATABASE_URL: requireEnv('DATABASE_URL'),
  JWT_SECRET: requireEnv('JWT_SECRET'),
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  PORT: parseInt(process.env.PORT || '3001', 10),
  UPLOAD_DIR: process.env.UPLOAD_DIR || './uploads',
  MAX_FILE_SIZE_MB: parseInt(process.env.MAX_FILE_SIZE_MB || '5', 10),
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
};
