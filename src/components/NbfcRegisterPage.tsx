// @ts-nocheck
import { useState } from 'react';
import { Building2, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { tenantApi } from '../apis/tenant';

export function NbfcRegisterPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    name: '',
    contact_email: '',
    phone_number: '',
    first_line_address: '',
    second_line_address: '',
    city: '',
    state: '',
    country: 'India',
    pincode: '',
  });

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const normalizePhone = (value: string) => value.replace(/\D/g, '').slice(-10);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await tenantApi.register({
        ...form,
        phone_number: normalizePhone(form.phone_number),
        pincode: form.pincode.replace(/\D/g, '').slice(0, 6),
      });
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-8">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 text-blue-600 mb-4">
            <Building2 className="size-10" />
            <div className="text-left">
              <h1 className="text-2xl font-semibold">LoanFlow</h1>
              <p className="text-gray-600 text-sm">NBFC Registration</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
          {success ? (
            <div className="text-center space-y-4 py-12">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="size-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900">Registration Submitted!</h2>
              <p className="text-gray-600 max-w-md mx-auto">
                Your NBFC registration has been submitted for review. You'll receive credentials at your registered email once approved.
              </p>
              <button
                onClick={() => navigate('/login')}
                className="mt-4 px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Go to Login
              </button>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">Register Your NBFC</h2>
                <p className="text-gray-600 text-sm">
                  Fill in your organization details to get started with LoanFlow.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Company Info */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wide border-b border-gray-200 pb-2">
                    Organization Info
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Company Name *</label>
                      <input
                        type="text"
                        value={form.name}
                        onChange={(e) => updateField('name', e.target.value)}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        placeholder="Your NBFC name"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Contact Email *</label>
                      <input
                        type="email"
                        value={form.contact_email}
                        onChange={(e) => updateField('contact_email', e.target.value)}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        placeholder="admin@company.com"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number *</label>
                    <input
                      type="tel"
                      value={form.phone_number}
                      onChange={(e) => updateField('phone_number', e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      placeholder="+91 9876543210"
                      required
                    />
                  </div>
                </div>

                {/* Address */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wide border-b border-gray-200 pb-2">
                    Address
                  </h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Address Line 1 *</label>
                    <input
                      type="text"
                      value={form.first_line_address}
                      onChange={(e) => updateField('first_line_address', e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      placeholder="Street address"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Address Line 2</label>
                    <input
                      type="text"
                      value={form.second_line_address}
                      onChange={(e) => updateField('second_line_address', e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      placeholder="Suite, floor, etc."
                    />
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">City *</label>
                      <input
                        type="text"
                        value={form.city}
                        onChange={(e) => updateField('city', e.target.value)}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">State *</label>
                      <input
                        type="text"
                        value={form.state}
                        onChange={(e) => updateField('state', e.target.value)}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Country *</label>
                      <input
                        type="text"
                        value={form.country}
                        onChange={(e) => updateField('country', e.target.value)}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Pincode *</label>
                      <input
                        type="text"
                        value={form.pincode}
                        onChange={(e) => updateField('pincode', e.target.value)}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        required
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  {loading ? 'Submitting...' : 'Register NBFC'}
                </button>

                {error && <p className="text-sm text-red-600 text-center">{error}</p>}
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Already registered?{' '}
                  <button
                    onClick={() => navigate('/login')}
                    className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
                  >
                    Sign in
                  </button>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
