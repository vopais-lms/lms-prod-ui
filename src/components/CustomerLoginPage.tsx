// @ts-nocheck
import { useState } from 'react';
import { Building2, Phone, ArrowRight, ShieldCheck, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../apis/auth';
import { completeLogin, getDefaultAppRoute } from '../utils/authSession';

export function CustomerLoginPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await authApi.customerLogin({ linked_phone_number: phone.trim() });
      setMessage(res.message || 'If the number is registered, an OTP has been sent.');
      setStep('otp');
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await authApi.authenticateCustomerOtp({
        otp: otp.trim(),
        linked_phone_number: phone.trim(),
      });
      const menuItems = await completeLogin(res);
      navigate(`/app${getDefaultAppRoute(menuItems)}`);
    } catch (err: any) {
      setError(err.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-emerald-600 to-teal-800 p-12 flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 text-white">
            <Building2 className="size-10" />
            <div>
              <h1 className="text-3xl font-semibold">LoanFlow</h1>
              <p className="text-emerald-100 text-sm">Customer Portal</p>
            </div>
          </div>
        </div>

        <div className="space-y-6 text-white">
          <h2 className="text-4xl font-semibold leading-tight">
            Access Your
            <br />
            Loan Dashboard
          </h2>
          <p className="text-emerald-100 text-lg max-w-md">
            Track your loans, manage payments, and access all your financial documents in one place.
          </p>
        </div>

        <div className="text-emerald-100 text-sm">
          © 2026 LoanFlow. All rights reserved.
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8 text-emerald-600">
            <Building2 className="size-8" />
            <div>
              <h1 className="text-2xl font-semibold">LoanFlow</h1>
              <p className="text-gray-600 text-sm">Customer Portal</p>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-semibold text-gray-900 mb-2">
              {step === 'phone' ? 'Customer Login' : 'Verify OTP'}
            </h2>
            <p className="text-gray-600">
              {step === 'phone'
                ? 'Enter your registered phone number to receive an OTP'
                : message || 'Enter the OTP sent to your phone'}
            </p>
          </div>

          {step === 'phone' ? (
            <form onSubmit={handleSendOtp} className="space-y-5">
              <div>
                <label htmlFor="customer-phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
                  <input
                    id="customer-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    placeholder="Enter your phone number"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-600 text-white py-3 rounded-lg font-medium hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? 'Sending OTP...' : 'Send OTP'}
                {!loading && <ArrowRight className="size-4" />}
              </button>

              {error && <p className="text-sm text-red-600 text-center">{error}</p>}
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div>
                <label htmlFor="customer-otp" className="block text-sm font-medium text-gray-700 mb-2">
                  One-Time Password
                </label>
                <div className="relative">
                  <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
                  <input
                    id="customer-otp"
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-center text-lg tracking-[0.5em] font-mono"
                    placeholder="• • • • • •"
                    maxLength={6}
                    required
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  OTP sent to {phone}
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-600 text-white py-3 rounded-lg font-medium hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? 'Verifying...' : 'Verify & Sign In'}
              </button>

              <button
                type="button"
                onClick={() => { setStep('phone'); setOtp(''); setError(''); }}
                className="w-full text-sm text-gray-600 hover:text-gray-800 flex items-center justify-center gap-1 transition-colors"
              >
                <ArrowLeft className="size-4" />
                Change phone number
              </button>

              {error && <p className="text-sm text-red-600 text-center">{error}</p>}
            </form>
          )}

          {/* Divider */}
          <div className="mt-8 flex items-center">
            <div className="flex-1 border-t border-gray-300" />
            <span className="px-4 text-sm text-gray-500">Or</span>
            <div className="flex-1 border-t border-gray-300" />
          </div>

          {/* Switch to NBFC Login */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              NBFC Employee?{' '}
              <button
                onClick={() => navigate('/login')}
                className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                Sign in here
              </button>
            </p>
          </div>

          {/* Security Notice */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-xs text-gray-600 text-center">
              🔒 Your data is encrypted and protected with bank-grade security.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
