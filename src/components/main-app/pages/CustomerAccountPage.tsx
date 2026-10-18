import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageShell } from '../shared/PageShell';
import { StatusBadge } from '../shared/StatusBadge';
import { customersApi } from '../../../apis/customers';
import type { Customer } from '../../../apis/types';
import { getStoredCustomerEid } from '../../../utils/authSession';

const formatTimestamp = (value: string | null): string => {
    if (!value) return 'Not verified';
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return value;
    return parsed.toLocaleString();
};

export function CustomerAccountPage() {
    const navigate = useNavigate();
    const customerEid = getStoredCustomerEid();
    const [customer, setCustomer] = useState<Customer | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!customerEid) {
            setError('Customer details are not available for this session.');
            setLoading(false);
            return;
        }
        let cancelled = false;
        customersApi
            .get(customerEid)
            .then((record) => {
                if (!cancelled) setCustomer(record);
            })
            .catch((err: unknown) => {
                if (!cancelled) {
                    setError(err instanceof Error ? err.message : 'Failed to load customer details');
                }
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, [customerEid]);

    const rows: Array<[string, string]> = customer
        ? [
              ['Name', customer.name],
              ['Email', customer.email],
              ['Phone', customer.linked_phone_number],
              ['Secondary phone', customer.secondary_phone || '—'],
              ['Address line 1', customer.first_line_address],
              ['Address line 2', customer.second_line_address || '—'],
              ['Phone verified', formatTimestamp(customer.verified_phone_number_timestamp)],
              ['Email verified', formatTimestamp(customer.verified_email_timestamp)],
          ]
        : [];

    return (
        <PageShell title="Customer Details" subtitle="Your account details">
            {loading && <p className="text-sm text-[#6B7280]">Loading customer details...</p>}
            {error && <p className="text-sm text-red-600">{error}</p>}
            {customer && (
                <div className="bg-white border border-[#E5E7EB] rounded-2xl shadow-sm max-w-2xl">
                    <div className="px-6 py-4 border-b border-[#E5E7EB] flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-[#111827]">Details</h2>
                        <StatusBadge status={customer.is_active ? 'active' : 'inactive'} />
                    </div>
                    <div className="p-6 space-y-1">
                        {rows.map(([label, value]) => (
                            <div key={label} className="flex justify-between gap-4 py-2 border-b border-[#F3F4F6]">
                                <span className="text-sm text-[#6B7280]">{label}</span>
                                <span className="text-sm font-medium text-[#111827] text-right">{value}</span>
                            </div>
                        ))}
                    </div>
                    <div className="px-6 pb-6">
                        <button
                            type="button"
                            onClick={() => navigate(`/app/customer-kyc/${customer.eid}`)}
                            className="px-4 py-2.5 text-sm font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100"
                        >
                            KYC Documents
                        </button>
                    </div>
                </div>
            )}
        </PageShell>
    );
}
