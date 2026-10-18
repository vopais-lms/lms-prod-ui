import { useEffect, useState } from 'react';
import { Building2, Mail, Phone, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { customersApi } from '../apis/customers';
import { ApiError } from '../utils/apiClient';
import {
    fetchAndStoreMenuItems,
    getDefaultAppRoute,
    getStoredCustomerEid,
    isCustomerPendingActivation,
    markCustomerActivated,
} from '../utils/authSession';

const acceptAlreadyVerified = async (request: Promise<void>) => {
    try {
        await request;
    } catch (err) {
        if (err instanceof ApiError && err.status === 409) return;
        throw err;
    }
};

export function ActivateCustomerPage() {
    const navigate = useNavigate();
    const customerEid = getStoredCustomerEid();
    const [allowed] = useState(() =>
        Boolean(
            isCustomerPendingActivation() &&
                customerEid &&
                localStorage.getItem('auth_token'),
        ),
    );
    const [phoneOtp, setPhoneOtp] = useState('');
    const [emailOtp, setEmailOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!allowed) navigate('/customer-login', { replace: true });
    }, [allowed, navigate]);

    if (!allowed || !customerEid) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await acceptAlreadyVerified(
                customersApi.verifyLinkedPhone(customerEid, { otp: phoneOtp.trim() }),
            );
            await acceptAlreadyVerified(
                customersApi.verifyEmail(customerEid, { otp: emailOtp.trim() }),
            );
            markCustomerActivated();
            const menuItems = await fetchAndStoreMenuItems();
            navigate(`/app${getDefaultAppRoute(menuItems)}`, { replace: true });
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Verification failed';
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50 p-8">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
                <div className="flex items-center gap-3 text-emerald-600 mb-6">
                    <Building2 className="size-8" />
                    <div>
                        <h1 className="text-xl font-semibold">LoanFlow</h1>
                        <p className="text-gray-600 text-sm">Customer Portal</p>
                    </div>
                </div>

                <div className="mb-6">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-2">Activate your account</h2>
                    <p className="text-gray-600 text-sm">
                        Enter the OTP sent by SMS and the OTP sent by email. Both must be accepted before the account becomes active.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label htmlFor="sms-otp" className="block text-sm font-medium text-gray-700 mb-2">
                            OTP from SMS
                        </label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
                            <input
                                id="sms-otp"
                                type="text"
                                value={phoneOtp}
                                onChange={(e) => setPhoneOtp(e.target.value)}
                                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-center text-lg tracking-[0.5em] font-mono"
                                placeholder="• • • • • •"
                                maxLength={6}
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="email-otp" className="block text-sm font-medium text-gray-700 mb-2">
                            OTP from email
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
                            <input
                                id="email-otp"
                                type="text"
                                value={emailOtp}
                                onChange={(e) => setEmailOtp(e.target.value)}
                                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-center text-lg tracking-[0.5em] font-mono"
                                placeholder="• • • • • •"
                                maxLength={6}
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-emerald-600 text-white py-3 rounded-lg font-medium hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        <ShieldCheck className="size-4" />
                        {loading ? 'Verifying...' : 'Verify and activate'}
                    </button>

                    {error && <p className="text-sm text-red-600 text-center">{error}</p>}
                </form>
            </div>
        </div>
    );
}
