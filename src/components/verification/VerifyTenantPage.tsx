// @ts-nocheck
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Building2, ShieldCheck } from 'lucide-react';
import { verificationApi } from '../../apis/verification';

export function VerifyTenantPage() {
  const [searchParams] = useSearchParams();
  const tenantEid = searchParams.get('id') || '';
  const [token, setToken] = useState(tenantEid);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantEid) {
      setError('Missing tenant id in link.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await verificationApi.verifyTenant(tenantEid, token.trim());
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
            <p className="text-gray-600 text-sm">Tenant Verification</p>
          </div>
        </div>

        {success ? (
          <div className="text-center space-y-4 py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <ShieldCheck className="size-8 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Tenant Verified</h2>
            <p className="text-gray-600">Your account is pending internal approval.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Verify Your NBFC</h2>
              <p className="text-gray-600 text-sm mb-4">
                Enter the verification token from your email to confirm tenant registration.
              </p>
              <label className="block text-sm font-medium text-gray-700 mb-2">Verification Token</label>
              <input
                type="text"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Tenant EID token"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Verify Tenant'}
            </button>
            {error && <p className="text-sm text-red-600 text-center">{error}</p>}
          </form>
        )}
      </div>
    </div>
  );
}
