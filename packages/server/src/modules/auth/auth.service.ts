import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { signToken } from '../../utils/jwt';
import { AppError } from '../../middleware/errorHandler';
import type { RegisterInput, LoginInput, AuthResponse } from './auth.types';

const prisma = new PrismaClient();
const BCRYPT_ROUNDS = 12;

/**
 * Registers a new user account.
 * @param input - Registration data (name, email, password)
 * @returns Auth response with JWT token and user info
 * @throws AppError 409 if email already exists
 */
export async function register(input: RegisterInput): Promise<AuthResponse> {
  const existingUser = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (existingUser) {
    throw new AppError(409, 'An account with this email already exists', 'EMAIL_EXISTS');
  }

  const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      passwordHash,
    },
    select: { id: true, email: true, name: true },
  });

  const token = signToken(user.id);

  return { token, user };
}

/**
 * Authenticates a user with email and password.
 * @param input - Login credentials
 * @returns Auth response with JWT token and user info
 * @throws AppError 401 if credentials are invalid
 */
export async function login(input: LoginInput): Promise<AuthResponse> {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (!user) {
    throw new AppError(401, 'Invalid email or password', 'INVALID_CREDENTIALS');
  }

  const isPasswordValid = await bcrypt.compare(input.password, user.passwordHash);

  if (!isPasswordValid) {
    throw new AppError(401, 'Invalid email or password', 'INVALID_CREDENTIALS');
  }

  const token = signToken(user.id);

  return {
    token,
    user: { id: user.id, email: user.email, name: user.name },
  };
}
