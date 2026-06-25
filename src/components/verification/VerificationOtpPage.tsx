// @ts-nocheck
import { useState } from 'react';
import { Building2, ShieldCheck } from 'lucide-react';

type VerificationOtpPageProps = {
  title: string;
  subtitle: string;
  onSubmit: (otp: string) => Promise<void>;
  successTitle?: string;
  successMessage?: string;
};

export function VerificationOtpPage({
  title,
  subtitle,
  onSubmit,
  successTitle = 'Verification Successful',
  successMessage = 'Your verification is complete.',
}: VerificationOtpPageProps) {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await onSubmit(otp.trim());
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-8">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
        <div className="flex items-center gap-3 text-blue-600 mb-6">
          <Building2 className="size-8" />
          <div>
            <h1 className="text-xl font-semibold">LoanFlow</h1>
            <p className="text-gray-600 text-sm">Verification</p>
          </div>
        </div>

        {success ? (
          <div className="text-center space-y-4 py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <ShieldCheck className="size-8 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">{successTitle}</h2>
            <p className="text-gray-600">{successMessage}</p>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">{title}</h2>
              <p className="text-gray-600 text-sm">{subtitle}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="verification-otp" className="block text-sm font-medium text-gray-700 mb-2">
                  One-Time Password
                </label>
                <input
                  id="verification-otp"
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-lg tracking-[0.5em] font-mono"
                  placeholder="• • • • • •"
                  maxLength={6}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Verifying...' : 'Verify'}
              </button>

              {error && <p className="text-sm text-red-600 text-center">{error}</p>}
            </form>
          </>
        )}
      </div>
    </div>
  );
}
