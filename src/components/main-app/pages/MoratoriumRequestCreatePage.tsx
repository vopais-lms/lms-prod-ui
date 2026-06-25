// @ts-nocheck
import { useCallback, useEffect, useState } from 'react';
import { ArrowLeftIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { useNavigate, useParams } from 'react-router-dom';
import { loanApplicationsApi } from '../../../apis/loanApplications';
import { moratoriumRequestsApi } from '../../../apis/moratoriumRequests';
import type { LoanApplicationDetail } from '../../../apis/types';
import { MORATORIUM_TYPE_OPTIONS } from '../../../constants/moratoriumRequestFields';
import { PageShell } from '../shared/PageShell';
import { FormField, FormInput, FormSelect } from '../shared/FormModal';

function buildMoratoriumBreadcrumbs(loanApplicationEid: string, navigate: ReturnType<typeof useNavigate>) {
  return [
    {
      label: 'Loan Application',
      onClick: () => navigate(`/app/loans/${loanApplicationEid}`),
    },
    { label: 'Moratorium Request' },
  ];
}

export function MoratoriumRequestCreatePage() {
  const navigate = useNavigate();
  const { eid } = useParams<{ eid: string }>();
  const [application, setApplication] = useState<LoanApplicationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [pageError, setPageError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [form, setForm] = useState({
    moratorium_type: 'principal_amount_only',
    moratorium_period_in_days: '',
    moratorium_start_date: '',
    keep_tenured_fixed: 'false',
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

    const period = Number(form.moratorium_period_in_days);
    if (!period || period < 1) {
      setActionError('Moratorium period must be at least 1 day.');
      return;
    }
    if (period > (application.max_moratorium_period_in_days ?? 0)) {
      setActionError(
        `Moratorium period cannot exceed ${application.max_moratorium_period_in_days} days for this loan.`,
      );
      return;
    }

    setSubmitting(true);
    setActionError(null);
    try {
      const created = await moratoriumRequestsApi.create(eid, {
        moratorium_type: form.moratorium_type,
        moratorium_period_in_days: period,
        moratorium_start_date: form.moratorium_start_date || null,
        keep_tenured_fixed: form.keep_tenured_fixed === 'true',
      });
      navigate(`/app/loans/${eid}/moratorium-requests/${created.moratorium_request_eid}`);
    } catch (err: any) {
      setActionError(err.message || 'Failed to create moratorium request');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <PageShell title="Moratorium Request" subtitle="Loading…">
        <div className="flex items-center justify-center h-40 text-[#6B7280]">
          <ArrowPathIcon className="w-5 h-5 animate-spin mr-2" />
          Loading…
        </div>
      </PageShell>
    );
  }

  if (pageError || !application || !eid) {
    return (
      <PageShell title="Moratorium Request">
        <p className="text-sm text-red-600">{pageError || 'Loan application not found.'}</p>
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Moratorium Request"
      subtitle="Step 1 — Core moratorium details"
      breadcrumbs={buildMoratoriumBreadcrumbs(eid, navigate)}
      actions={
        <button
          onClick={() => navigate(`/app/loans/${eid}`)}
          className="flex items-center gap-2 px-3 py-2 text-sm text-[#6B7280] hover:text-[#111827] transition-colors"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Back
        </button>
      }
    >
      {actionError && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {actionError}
        </p>
      )}

      <p className="text-sm text-blue-700 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
        Note: Moratorium is calculated based on repayment schedule cycle and not exact dates.
      </p>

      <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 shadow-sm space-y-5">
        <p className="text-sm text-[#6B7280]">
          Enter the standard moratorium fields, then continue to the moratorium request form.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Moratorium type" required>
            <FormSelect
              value={form.moratorium_type}
              onChange={(v) => setForm((prev) => ({ ...prev, moratorium_type: v }))}
              options={[...MORATORIUM_TYPE_OPTIONS]}
            />
          </FormField>
          <FormField label="Period (days)" required>
            <FormInput
              type="number"
              value={form.moratorium_period_in_days}
              onChange={(v) => setForm((prev) => ({ ...prev, moratorium_period_in_days: v }))}
            />
          </FormField>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Start date">
            <FormInput
              type="date"
              value={form.moratorium_start_date}
              onChange={(v) => setForm((prev) => ({ ...prev, moratorium_start_date: v }))}
            />
          </FormField>
          <FormField label="Keep tenure fixed">
            <FormSelect
              value={form.keep_tenured_fixed}
              onChange={(v) => setForm((prev) => ({ ...prev, keep_tenured_fixed: v }))}
              options={[
                { value: 'false', label: 'No — shift repayment schedule' },
                { value: 'true', label: 'Yes — higher subsequent EMIs' },
              ]}
            />
          </FormField>
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleCreate}
            disabled={submitting}
            className="px-4 py-2 text-sm font-medium text-white bg-[#2563EB] rounded-lg hover:bg-[#1D4ED8] disabled:opacity-50"
          >
            {submitting ? 'Creating…' : 'Create and continue to form'}
          </button>
        </div>
      </div>
    </PageShell>
  );
}
