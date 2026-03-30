/** Input shape for user registration */
export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

/** Input shape for user login */
export interface LoginInput {
  email: string;
  password: string;
}

/** Response shape for auth endpoints */
export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
}

/** JWT token payload */
export interface JWTPayload {
  userId: string;
  iat?: number;
  exp?: number;
}
