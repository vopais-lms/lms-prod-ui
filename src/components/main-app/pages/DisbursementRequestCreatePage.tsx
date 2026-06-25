// @ts-nocheck
import { useCallback, useEffect, useState } from 'react';
import { ArrowLeftIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { useNavigate, useParams } from 'react-router-dom';
import { disbursementRequestsApi } from '../../../apis/disbursementRequests';
import { loanApplicationsApi } from '../../../apis/loanApplications';
import type { LoanApplicationDetail } from '../../../apis/types';
import { PageShell } from '../shared/PageShell';
import { FormField, FormInput, FormSelect } from '../shared/FormModal';
import { LOAN_AMORTIZATION_STRATEGY_OPTIONS } from '../../../constants/loanDisbursementFields';

function buildDisbursementBreadcrumbs(
  loanApplicationEid: string,
  navigate: ReturnType<typeof useNavigate>,
) {
  return [
    {
      label: 'Loan Application',
      onClick: () => navigate(`/app/loans/${loanApplicationEid}`),
    },
    { label: 'Disbursement Request' },
  ];
}

function formatMoney(value: number | undefined): string {
  const num = Number(value);
  if (Number.isNaN(num)) {
    return '—';
  }
  return `₹${num.toLocaleString()}`;
}

export function DisbursementRequestCreatePage() {
  const navigate = useNavigate();
  const { eid } = useParams<{ eid: string }>();
  const [application, setApplication] = useState<LoanApplicationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [pageError, setPageError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [disbursementAmount, setDisbursementAmount] = useState('');
  const [amortizationType, setAmortizationType] = useState('keep_tenured_fixed');

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
      if (detail.is_single_disbursement !== false) {
        setPageError('Disbursement requests are only available for multiple-disbursement loans.');
        return;
      }
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

    const amount = Number(disbursementAmount);
    if (!amount || amount <= 0) {
      setActionError('Disbursement amount must be greater than zero.');
      return;
    }

    const principal = Number(application.principal_disbursement_amount ?? 0);
    const alreadyDisbursed = Number(application.amount_disbursed ?? 0);
    const remaining = principal - alreadyDisbursed;
    if (remaining > 0 && amount > remaining) {
      setActionError(
        `Disbursement amount cannot exceed the remaining principal (${formatMoney(remaining)}).`,
      );
      return;
    }

    setSubmitting(true);
    setActionError(null);
    try {
      const created = await disbursementRequestsApi.create(eid, {
        disbursement_amount: amount,
        amortization_type: amortizationType,
      });
      navigate(
        `/app/loans/${eid}/disbursement-requests/${created.disbursement_request_eid}`,
      );
    } catch (err: any) {
      setActionError(err.message || 'Failed to create disbursement request');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <PageShell title="Disbursement Request" subtitle="Loading…">
        <div className="flex items-center justify-center h-40 text-[#6B7280]">
          <ArrowPathIcon className="w-5 h-5 animate-spin mr-2" />
          Loading…
        </div>
      </PageShell>
    );
  }

  if (pageError || !application || !eid) {
    return (
      <PageShell title="Disbursement Request">
        <p className="text-sm text-red-600">{pageError || 'Loan application not found.'}</p>
        {eid && (
          <button
            onClick={() => navigate(`/app/loans/${eid}`)}
            className="mt-4 text-sm text-[#2563EB] hover:underline"
          >
            Back to loan application
          </button>
        )}
      </PageShell>
    );
  }

  const principal = Number(application.principal_disbursement_amount ?? 0);
  const alreadyDisbursed = Number(application.amount_disbursed ?? 0);
  const remaining = Math.max(principal - alreadyDisbursed, 0);

  return (
    <PageShell
      title="Disbursement Request"
      subtitle="Step 1 — Disbursement amount"
      breadcrumbs={buildDisbursementBreadcrumbs(eid, navigate)}
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

      <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 shadow-sm space-y-5">
        <p className="text-sm text-[#6B7280]">
          Enter the disbursement amount, then continue to the disbursement request form.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-[#6B7280]">Principal amount</p>
            <p className="font-medium text-[#111827]">{formatMoney(principal)}</p>
          </div>
          <div>
            <p className="text-[#6B7280]">Already disbursed</p>
            <p className="font-medium text-[#111827]">{formatMoney(alreadyDisbursed)}</p>
          </div>
          <div>
            <p className="text-[#6B7280]">Remaining</p>
            <p className="font-medium text-[#111827]">{formatMoney(remaining)}</p>
          </div>
        </div>

        <FormField label="Disbursement amount" required>
          <FormInput
            type="number"
            value={disbursementAmount}
            onChange={setDisbursementAmount}
          />
        </FormField>

        <FormField label="Repayment strategy" required>
          <FormSelect
            value={amortizationType}
            onChange={setAmortizationType}
            options={[...LOAN_AMORTIZATION_STRATEGY_OPTIONS]}
          />
        </FormField>

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
