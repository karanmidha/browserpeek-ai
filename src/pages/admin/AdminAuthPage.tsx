import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { adminAuth } from '../../lib/admin/auth';
import { Shield, Eye, EyeOff, AlertTriangle } from 'lucide-react';

interface LoginForm {
  email: string;
  password: string;
}

interface MFAForm {
  token: string;
}

export const AdminAuthPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [formState, setFormState] = useState<'login' | 'mfa'>('login');
  const [loginForm, setLoginForm] = useState<LoginForm>({ email: '', password: '' });
  const [mfaForm, setMFAForm] = useState<MFAForm>({ token: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Redirect if already authenticated
    if (adminAuth.isAuthenticated()) {
      const from = (location.state as any)?.from?.pathname || '/admin/dashboard';
      navigate(from, { replace: true });
    }
  }, [navigate, location]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await adminAuth.signIn(loginForm.email, loginForm.password);

      if (result.success) {
        const from = (location.state as any)?.from?.pathname || '/admin/dashboard';
        navigate(from, { replace: true });
      } else if (result.requiresMFA) {
        setFormState('mfa');
      } else {
        setError(result.error || 'Authentication failed');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleMFASubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await adminAuth.verifyMFA(mfaForm.token);

      if (result.success) {
        const from = (location.state as any)?.from?.pathname || '/admin/dashboard';
        navigate(from, { replace: true });
      } else {
        setError(result.error || 'Invalid verification code');
        setMFAForm({ token: '' });
      }
    } catch (err) {
      setError('Verification failed');
      setMFAForm({ token: '' });
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    setFormState('login');
    setMFAForm({ token: '' });
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream to-forest-green/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-forest-green rounded-full mb-4">
              <Shield className="w-8 h-8 text-cream" />
            </div>
            <h1 className="text-2xl font-bold text-forest-green mb-2">Admin Access</h1>
            <p className="text-gray-600">
              {formState === 'login' ? 'Secure administration portal' : 'Two-factor authentication required'}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 rounded-md">
              <div className="flex items-center">
                <AlertTriangle className="w-5 h-5 text-red-400 mr-2" />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Login Form */}
          {formState === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest-green focus:border-transparent transition-colors"
                  placeholder="admin@omyogvidya.com"
                  disabled={loading}
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest-green focus:border-transparent transition-colors pr-12"
                    placeholder="Enter your secure password"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    disabled={loading}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !loginForm.email || !loginForm.password}
                className="w-full bg-forest-green text-white py-3 px-4 rounded-lg font-medium hover:bg-forest-green/90 focus:outline-none focus:ring-2 focus:ring-forest-green focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Authenticating...
                  </div>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>
          )}

          {/* MFA Form */}
          {formState === 'mfa' && (
            <form onSubmit={handleMFASubmit} className="space-y-6">
              <div>
                <label htmlFor="mfa-token" className="block text-sm font-medium text-gray-700 mb-2">
                  Authentication Code
                </label>
                <input
                  id="mfa-token"
                  type="text"
                  required
                  value={mfaForm.token}
                  onChange={(e) => setMFAForm({ token: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest-green focus:border-transparent transition-colors text-center text-xl tracking-wider"
                  placeholder="000000"
                  maxLength={6}
                  disabled={loading}
                  autoComplete="one-time-code"
                />
                <p className="text-sm text-gray-500 mt-2">
                  Enter the 6-digit code from your authenticator app
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleBackToLogin}
                  disabled={loading}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading || mfaForm.token.length !== 6}
                  className="flex-1 bg-forest-green text-white py-3 px-4 rounded-lg font-medium hover:bg-forest-green/90 focus:outline-none focus:ring-2 focus:ring-forest-green focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Verifying...
                    </div>
                  ) : (
                    'Verify'
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Security Notice */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex items-start space-x-2 text-sm text-gray-600">
              <Shield className="w-4 h-4 mt-0.5 text-forest-green" />
              <div>
                <p className="font-medium">Security Notice</p>
                <p className="text-xs mt-1">
                  All admin activities are logged and monitored. Sessions expire after 30 minutes of inactivity.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};