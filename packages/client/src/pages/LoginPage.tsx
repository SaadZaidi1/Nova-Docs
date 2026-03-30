import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { login } from '../api/auth.api';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

/**
 * Login page with Google-style clean design.
 */
export default function LoginPage() {
  const navigate = useNavigate();
  const { login: storeLogin } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const result = await login({ email, password });
      storeLogin(result.user, result.token);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-secondary flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-white font-bold text-2xl">N</span>
          </div>
          <h1 className="text-2xl font-semibold text-gray-900">Sign in to Nova Docs</h1>
          <p className="text-sm text-gray-500 mt-2">Collaborate on documents in real-time</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alice@demo.com"
              id="login-email"
              autoComplete="email"
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              id="login-password"
              autoComplete="current-password"
            />

            {error && (
              <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg">{error}</div>
            )}

            <Button type="submit" loading={loading} className="w-full" size="lg">
              Sign in
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary-600 hover:text-primary-700 font-medium">
                Create one
              </Link>
            </p>
          </div>
        </div>

        {/* Demo credentials hint */}
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-400">
            Demo: alice@demo.com / demo1234 or bob@demo.com / demo1234
          </p>
        </div>
      </div>
    </div>
  );
}
