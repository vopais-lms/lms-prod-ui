// @ts-nocheck
import { useState } from 'react';
import { Building2, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../apis/auth';
import { completeLogin, getDefaultAppRoute } from '../utils/authSession';

type LoginPageProps = {
  errorMessage?: string;
};

export function LoginPage({ errorMessage: externalError }: LoginPageProps) {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(externalError || '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await authApi.login({ username: username.trim(), password });
      const menuItems = await completeLogin(res);
      if (rememberMe) {
        localStorage.setItem('remember_me', 'true');
      }
      navigate(`/app${getDefaultAppRoute(menuItems)}`);
    } catch (err: any) {
      if (err.status === 403 || err.data?.requires_password_reset) {
        if (err.data?.access_token) {
          localStorage.setItem('auth_token', err.data.access_token);
        }
        navigate('/reset-password');
        return;
      }
      setError(err.message || 'Invalid credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-blue-600 to-blue-800 p-12 flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 text-white">
            <Building2 className="size-10" />
            <div>
              <h1 className="text-3xl font-semibold">LoanFlow</h1>
              <p className="text-blue-100 text-sm">Banking System</p>
            </div>
          </div>
        </div>

        <div className="space-y-6 text-white">
          <h2 className="text-4xl font-semibold leading-tight">
            Streamline Your
            <br />
            Loan Management
          </h2>
          <p className="text-blue-100 text-lg max-w-md">
            Secure, efficient, and comprehensive loan processing platform designed for modern banking institutions.
          </p>
        </div>

        <div className="text-blue-100 text-sm">
          © 2026 LoanFlow. All rights reserved.
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8 text-blue-600">
            <Building2 className="size-8" />
            <div>
              <h1 className="text-2xl font-semibold">LoanFlow</h1>
              <p className="text-gray-600 text-sm">Banking System</p>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-semibold text-gray-900 mb-2">
              Welcome Back
            </h2>
            <p className="text-gray-600">
              Sign in to access your loan management dashboard
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username Field */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Enter your username"
                required
              />
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all pr-12"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="size-5" />
                  ) : (
                    <Eye className="size-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="size-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-2 cursor-pointer"
                />
                <span className="ml-2 text-sm text-gray-700">Remember me</span>
              </label>
              <button
                type="button"
                onClick={() => navigate('/reset-password')}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                Forgot password?
              </button>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
            {error ? (
              <p className="text-sm text-red-600 text-center">{error}</p>
            ) : null}
          </form>

          {/* Divider */}
          <div className="mt-8 flex items-center">
            <div className="flex-1 border-t border-gray-300"></div>
            <span className="px-4 text-sm text-gray-500">Or</span>
            <div className="flex-1 border-t border-gray-300"></div>
          </div>

          {/* Additional Options */}
          <div className="mt-6 space-y-3 text-center">
            <p className="text-sm text-gray-600">
              Customer?{' '}
              <button
                onClick={() => navigate('/customer-login')}
                className="text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
              >
                Login with OTP
              </button>
            </p>
            <p className="text-sm text-gray-600">
              New NBFC?{' '}
              <button
                onClick={() => navigate('/register')}
                className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                Register here
              </button>
            </p>
          </div>

          {/* Security Notice */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-xs text-gray-600 text-center">
              🔒 This is a secure banking system. Your credentials are encrypted and protected.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
