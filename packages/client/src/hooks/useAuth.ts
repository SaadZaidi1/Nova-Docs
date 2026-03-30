import { useAuthStore } from '../store/authStore';
import { me } from '../api/auth.api';
import { useEffect } from 'react';

/**
 * Hook that provides auth state and actions.
 * Validates the token on mount if user is not loaded.
 */
export function useAuth() {
  const { user, token, login, logout, setUser } = useAuthStore();

  useEffect(() => {
    if (token && !user) {
      me()
        .then((data) => setUser(data.user))
        .catch(() => logout());
    }
  }, [token, user, setUser, logout]);

  return {
    user,
    token,
    isAuthenticated: !!token,
    login,
    logout,
  };
}
