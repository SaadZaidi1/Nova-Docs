import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuthStore } from './store/authStore';
import { me } from './api/auth.api';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import EditorPage from './pages/EditorPage';
import { ToastContainer } from './components/ui/Toast';
import Spinner from './components/ui/Spinner';

/**
 * Auth guard component that protects routes requiring authentication.
 * Checks for stored token and validates it against the API.
 */
function AuthGuard({ children }: { children: React.ReactNode }) {
  const { token, user, setUser, logout } = useAuthStore();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!token) {
      setChecking(false);
      return;
    }
    if (user) {
      setChecking(false);
      return;
    }

    // Validate token
    me()
      .then((data) => {
        setUser(data.user);
      })
      .catch(() => {
        logout();
      })
      .finally(() => {
        setChecking(false);
      });
  }, [token, user, setUser, logout]);

  if (checking) {
    return (
      <div className="min-h-screen bg-surface-secondary flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

/**
 * Main application component with React Router configuration.
 */
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/"
          element={
            <AuthGuard>
              <DashboardPage />
            </AuthGuard>
          }
        />
        <Route
          path="/documents/:id"
          element={
            <AuthGuard>
              <EditorPage />
            </AuthGuard>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <ToastContainer />
    </BrowserRouter>
  );
}
