import jwt from 'jsonwebtoken';
import { config } from '../config';

/** JWT payload shape stored in the token */
export interface JWTPayload {
  userId: string;
  iat?: number;
  exp?: number;
}

/**
 * Signs a JWT token for the given user ID.
 * @param userId - The user's unique identifier
 * @returns A signed JWT string
 */
export function signToken(userId: string): string {
  return jwt.sign({ userId }, config.JWT_SECRET, {
    expiresIn: config.JWT_EXPIRES_IN,
  });
}

/**
 * Verifies a JWT token and returns the decoded payload.
 * @param token - The JWT string to verify
 * @returns The decoded JWT payload
 * @throws JsonWebTokenError if token is invalid or expired
 */
export function verifyToken(token: string): JWTPayload {
  return jwt.verify(token, config.JWT_SECRET) as JWTPayload;
}
