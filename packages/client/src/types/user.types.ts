/** User type from API responses */
export interface User {
  id: string;
  email: string;
  name: string;
}

/** Auth response from login/register */
export interface AuthResponse {
  token: string;
  user: User;
}
