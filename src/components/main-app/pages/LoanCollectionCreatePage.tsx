// @ts-nocheck
import { useCallback, useEffect, useState } from 'react';
import { ArrowLeftIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { useNavigate, useParams } from 'react-router-dom';
import { loanApplicationsApi } from '../../../apis/loanApplications';
import { loanCollectionsApi } from '../../../apis/loanCollections';
import type { LoanApplicationDetail, PaymentMode } from '../../../apis/types';
import {
  combineDateAndTime,
  nowTimeValue,
  todayDateValue,
} from '../../../utils/dateTime';
import { PageShell } from '../shared/PageShell';
import { FormField, FormInput, FormSelect } from '../shared/FormModal';

const PAYMENT_MODE_OPTIONS: { value: PaymentMode; label: string }[] = [
  { value: 'UPI', label: 'UPI' },
  { value: 'NEFT', label: 'NEFT' },
  { value: 'RTGS', label: 'RTGS' },
  { value: 'CHEQUE', label: 'Cheque' },
  { value: 'CASH', label: 'Cash' },
];

function buildBreadcrumbs(loanApplicationEid: string, navigate: ReturnType<typeof useNavigate>) {
  return [
    {
      label: 'Loan Application',
      onClick: () => navigate(`/app/loans/${loanApplicationEid}`),
    },
    { label: 'New Collection' },
  ];
}

export function LoanCollectionCreatePage() {
  const navigate = useNavigate();
  const { eid } = useParams<{ eid: string }>();
  const [application, setApplication] = useState<LoanApplicationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [pageError, setPageError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [form, setForm] = useState({
    amount: '',
    collection_date: todayDateValue(),
    collection_time: nowTimeValue(),
    payment_mode: '' as PaymentMode | '',
    utr: '',
  });

  const loadApplication = useCallback(async () => {
    if (!eid) {
      setPageError('Invalid loan application id.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setPageError(null);
    try {
      const detail = await loanApplicationsApi.get(eid);
      setApplication(detail);
    } catch (err: any) {
      setPageError(err.message || 'Failed to load loan application');
    } finally {
      setLoading(false);
    }
  }, [eid]);

  useEffect(() => {
    loadApplication();
  }, [loadApplication]);

  const handleCreate = async () => {
    if (!eid || !application) return;

    const amount = Number(form.amount);
    if (!amount || amount <= 0) {
      setActionError('Amount must be greater than 0.');
      return;
    }
    if (!form.collection_date) {
      setActionError('Collection date is required.');
      return;
    }
    const collectionDatetime = combineDateAndTime(
      form.collection_date,
      form.collection_time,
    );
    if (!collectionDatetime) {
      setActionError('Collection date and time are invalid.');
      return;
    }
    if (!form.payment_mode) {
      setActionError('Payment mode is required.');
      return;
    }

    setSubmitting(true);
    setActionError(null);
    try {
      await loanCollectionsApi.create(eid, {
        amount,
        collection_datetime: collectionDatetime,
        payment_mode: form.payment_mode,
        utr: form.utr || null,
      });
      navigate(`/app/loans/${eid}`);
    } catch (err: any) {
      setActionError(err?.message || 'Failed to create collection');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <PageShell title="New Collection">
        <div className="flex items-center justify-center h-40 text-[#6B7280]">
          <ArrowPathIcon className="w-5 h-5 animate-spin mr-2" />
          Loading…
        </div>
      </PageShell>
    );
  }

  if (pageError || !application) {
    return (
      <PageShell title="New Collection">
        <p className="text-sm text-red-600">{pageError || 'Loan application not found.'}</p>
        <button
          onClick={() => navigate('/app/loans')}
          className="mt-4 text-sm text-[#2563EB] hover:underline"
        >
          Back to list
        </button>
      </PageShell>
    );
  }

  return (
    <PageShell
      title="New Collection"
      breadcrumbs={buildBreadcrumbs(eid, navigate)}
    >
      {actionError && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-4">
          {actionError}
        </p>
      )}

      <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 shadow-sm space-y-5 max-w-2xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Amount" required>
            <FormInput
              type="number"
              value={form.amount}
              onChange={(v) => setForm((prev) => ({ ...prev, amount: v }))}
            />
          </FormField>

          <FormField label="Collection Date" required>
            <FormInput
              type="date"
              value={form.collection_date}
              onChange={(v) => setForm((prev) => ({ ...prev, collection_date: v }))}
            />
          </FormField>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Collection Time" required>
            <FormInput
              type="time"
              step={1}
              value={form.collection_time}
              onChange={(v) => setForm((prev) => ({ ...prev, collection_time: v }))}
            />
          </FormField>

          <FormField label="Payment Mode" required>
            <FormSelect
              value={form.payment_mode}
              onChange={(v) => setForm((prev) => ({ ...prev, payment_mode: v as PaymentMode }))}
              options={PAYMENT_MODE_OPTIONS}
              placeholder="Select payment mode"
            />
          </FormField>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="UTR">
            <FormInput
              type="text"
              value={form.utr}
              onChange={(v) => setForm((prev) => ({ ...prev, utr: v }))}
            />
          </FormField>
        </div>

        <div className="flex items-center justify-between gap-3 pt-2">
          <button
            onClick={() => navigate(`/app/loans/${eid}`)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#374151] border border-[#E5E7EB] rounded-lg hover:bg-[#F9FAFB]"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Back
          </button>
          <button
            onClick={handleCreate}
            disabled={submitting}
            className="px-4 py-2 text-sm font-medium text-white bg-[#2563EB] rounded-lg hover:bg-[#1D4ED8] disabled:opacity-50"
          >
            {submitting ? 'Creating…' : 'Create Collection'}
          </button>
        </div>
      </div>
    </PageShell>
  );
}
