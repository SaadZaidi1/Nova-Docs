import apiClient from './client';
import type { AuthResponse } from '../types/user.types';
import type { User } from '../types/user.types';

/** Register a new user account */
export async function register(data: { name: string; email: string; password: string }): Promise<AuthResponse> {
  const res = await apiClient.post<AuthResponse>('/auth/register', data);
  return res.data;
}

/** Login with email and password */
export async function login(data: { email: string; password: string }): Promise<AuthResponse> {
  const res = await apiClient.post<AuthResponse>('/auth/login', data);
  return res.data;
}

/** Get current authenticated user */
export async function me(): Promise<{ user: User }> {
  const res = await apiClient.get<{ user: User }>('/auth/me');
  return res.data;
}
