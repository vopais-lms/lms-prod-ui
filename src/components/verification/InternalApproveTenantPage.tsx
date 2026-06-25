// @ts-nocheck
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Building2, ShieldCheck } from 'lucide-react';
import { verificationApi } from '../../apis/verification';

export function InternalApproveTenantPage() {
  const [searchParams] = useSearchParams();
  const tenantEid = searchParams.get('id') || '';
  const token = searchParams.get('token') || '';
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState<string | null>(null);

  const handleAction = async (action: 'approve' | 'reject') => {
    if (!tenantEid || !token) {
      setError('Invalid verification link.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      if (action === 'approve') {
        await verificationApi.approveTenantInternally(tenantEid, token);
        setSuccess('approved');
      } else {
        await verificationApi.rejectTenantInternally(tenantEid, token);
        setSuccess('rejected');
      }
    } catch (err: any) {
      setError(err.message || 'Action failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-gray-100 p-8">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
        <div className="flex items-center gap-3 text-slate-700 mb-6">
          <Building2 className="size-8" />
          <div>
            <h1 className="text-xl font-semibold">LoanFlow</h1>
            <p className="text-gray-600 text-sm">Internal Tenant Review</p>
          </div>
        </div>

        {success ? (
          <div className="text-center space-y-4 py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <ShieldCheck className="size-8 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">
              Tenant {success === 'approved' ? 'Approved' : 'Rejected'}
            </h2>
            <p className="text-gray-600">
              {success === 'approved'
                ? 'Tenant provisioning has been initiated.'
                : 'Tenant registration was rejected.'}
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Review Tenant</h2>
              <p className="text-gray-600 text-sm">
                Tenant EID: <strong>{tenantEid || '—'}</strong>
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => handleAction('approve')}
                disabled={loading}
                className="flex-1 bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50"
              >
                Approve
              </button>
              <button
                onClick={() => handleAction('reject')}
                disabled={loading}
                className="flex-1 bg-red-600 text-white py-3 rounded-lg font-medium hover:bg-red-700 disabled:opacity-50"
              >
                Reject
              </button>
            </div>
            {error && <p className="text-sm text-red-600 text-center">{error}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
