// @ts-nocheck
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowLeftIcon, ArrowPathIcon, CheckIcon } from '@heroicons/react/24/outline';
import { useNavigate, useParams } from 'react-router-dom';
import { disbursementRequestsApi } from '../../../apis/disbursementRequests';
import { loanApplicationsApi } from '../../../apis/loanApplications';
import type { DisbursementRequestDetail, LoanApplicationDetail } from '../../../apis/types';
import { DISBURSEMENT_REQUEST_STATUS_LABELS } from '../../../constants/disbursementRequestFields';
import {
  LOAN_AMORTIZATION_STRATEGY_OPTIONS,
  amortizationStrategyLabel,
  todayIsoDate,
} from '../../../constants/loanDisbursementFields';
import { PageShell } from '../shared/PageShell';
import { FormField, FormInput, FormModal, FormSelect } from '../shared/FormModal';
import { StatusBadge } from '../shared/StatusBadge';
import { LmsFormioForm } from '../shared/LmsFormioForm';
import { LmsFormioReadOnlyForm } from '../shared/LmsFormioReadOnlyForm';
import { KeyValueGrid } from '../shared/KeyValueGrid';

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

function disbursementStatusBadge(status: string) {
  switch (status) {
    case 'pending':
      return <StatusBadge status="pending" label="Pending" />;
    case 'verification_pending':
      return <StatusBadge status="pending" label="Verification pending" />;
    case 'approved':
      return <StatusBadge status="active" label="Approved" />;
    case 'rejected':
      return <StatusBadge status="error" label="Rejected" />;
    default:
      return <StatusBadge status="inactive" label={status} />;
  }
}

function formatMoney(value: number | string | undefined): string {
  const num = Number(value);
  if (Number.isNaN(num)) {
    return '—';
  }
  return `₹${num.toLocaleString()}`;
}

function DisbursementStepIndicator({ currentStep }: { currentStep: number }) {
  const steps = [
    { num: 1, label: 'Amount' },
    { num: 2, label: 'Disbursement form' },
  ];

  return (
    <div className="flex items-center gap-2 mb-6">
      {steps.map((step, idx) => (
        <div key={step.num} className="flex items-center gap-2">
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
              currentStep === step.num
                ? 'bg-[#2563EB] text-white'
                : currentStep > step.num
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-[#F3F4F6] text-[#6B7280]'
            }`}
          >
            {currentStep > step.num ? (
              <CheckIcon className="w-3.5 h-3.5" />
            ) : (
              <span>{step.num}</span>
            )}
            {step.label}
          </div>
          {idx < steps.length - 1 && <div className="w-8 h-px bg-[#E5E7EB]" />}
        </div>
      ))}
    </div>
  );
}

export function DisbursementRequestDetailPage() {
  const navigate = useNavigate();
  const { eid, disbursementRequestEid } = useParams<{
    eid: string;
    disbursementRequestEid: string;
  }>();

  const [application, setApplication] = useState<LoanApplicationDetail | null>(null);
  const [request, setRequest] = useState<DisbursementRequestDetail | null>(null);
  const [disbursementAmount, setDisbursementAmount] = useState('');
  const [amortizationType, setAmortizationType] = useState('keep_tenured_fixed');
  const [formValues, setFormValues] = useState<Record<string, unknown>>({});
  const [formStepOpen, setFormStepOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [coreSaving, setCoreSaving] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [disbursementDueDate, setDisbursementDueDate] = useState(todayIsoDate());

  const loadData = useCallback(async () => {
    if (!eid || !disbursementRequestEid) {
      setPageError('Invalid disbursement request route.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setPageError(null);
    try {
      const [appDetail, requestDetail] = await Promise.all([
        loanApplicationsApi.get(eid),
        disbursementRequestsApi.get(eid, disbursementRequestEid),
      ]);
      setApplication(appDetail);
      setRequest(requestDetail);
      setDisbursementAmount(String(requestDetail.disbursement_amount ?? ''));
      setAmortizationType(requestDetail.amortization_type || 'keep_tenured_fixed');
      setFormValues((requestDetail.form_values as Record<string, unknown>) || {});
      setFormStepOpen(
        requestDetail.status !== 'pending' || Boolean(requestDetail.form_values),
      );
    } catch (err: any) {
      setPageError(err.message || 'Failed to load disbursement request');
    } finally {
      setLoading(false);
    }
  }, [eid, disbursementRequestEid]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const uploadContext = useMemo(
    () =>
      eid && disbursementRequestEid
        ? {
            purpose: 'disbursement_request_form_json' as const,
            loanApplicationEid: eid,
            disbursementRequestEid,
          }
        : null,
    [eid, disbursementRequestEid],
  );

  const validateAmount = () => {
    if (!application) return 'Loan application not loaded.';

    const amount = Number(disbursementAmount);
    if (!amount || amount <= 0) {
      return 'Disbursement amount must be greater than zero.';
    }

    const principal = Number(application.principal_disbursement_amount ?? 0);
    const alreadyDisbursed = Number(application.amount_disbursed ?? 0);
    const remaining = principal - alreadyDisbursed;
    if (remaining > 0 && amount > remaining) {
      return `Disbursement amount cannot exceed the remaining principal (${formatMoney(remaining)}).`;
    }

    return null;
  };

  const handleSaveAmount = async () => {
    if (!eid || !disbursementRequestEid) return;

    const validationError = validateAmount();
    if (validationError) {
      setActionError(validationError);
      return;
    }

    setCoreSaving(true);
    setActionError(null);
    setActionSuccess(null);
    try {
      await disbursementRequestsApi.update(eid, disbursementRequestEid, {
        disbursement_amount: Number(disbursementAmount),
        amortization_type: amortizationType,
      });
      setActionSuccess('Disbursement amount saved.');
      await loadData();
    } catch (err: any) {
      setActionError(err.message || 'Failed to save disbursement amount');
    } finally {
      setCoreSaving(false);
    }
  };

  const handleProceedToForm = async () => {
    if (!eid || !disbursementRequestEid) return;

    const validationError = validateAmount();
    if (validationError) {
      setActionError(validationError);
      return;
    }

    setCoreSaving(true);
    setActionError(null);
    setActionSuccess(null);
    try {
      await disbursementRequestsApi.update(eid, disbursementRequestEid, {
        disbursement_amount: Number(disbursementAmount),
        amortization_type: amortizationType,
      });
      setFormStepOpen(true);
      setActionSuccess('Disbursement amount saved. Complete the disbursement form below.');
      await loadData();
    } catch (err: any) {
      setActionError(err.message || 'Failed to save disbursement amount');
    } finally {
      setCoreSaving(false);
    }
  };

  const handleSaveFormDraft = useCallback(
    async (data: Record<string, unknown>) => {
      if (!eid || !disbursementRequestEid) return;
      await disbursementRequestsApi.saveForm(eid, disbursementRequestEid, data);
    },
    [eid, disbursementRequestEid],
  );

  const handleSubmitForm = useCallback(
    async (data: Record<string, unknown>) => {
      if (!eid || !disbursementRequestEid) return;
      setFormSubmitting(true);
      setActionError(null);
      setActionSuccess(null);
      try {
        await disbursementRequestsApi.submit(eid, disbursementRequestEid, data);
        navigate(`/app/loans/${eid}`);
      } catch (err: any) {
        setActionError(err.message || 'Failed to submit disbursement request');
        throw err;
      } finally {
        setFormSubmitting(false);
      }
    },
    [eid, disbursementRequestEid, navigate],
  );

  const formHandlers = useMemo(
    () =>
      eid && disbursementRequestEid
        ? {
            onSaveDraft: handleSaveFormDraft,
            onSubmit: handleSubmitForm,
          }
        : undefined,
    [eid, disbursementRequestEid, handleSaveFormDraft, handleSubmitForm],
  );

  const handleOfficerAction = async (
    status: 'approve' | 'reject',
    dueDate?: string,
  ) => {
    if (!eid || !disbursementRequestEid) return;
    if (status === 'approve' && !dueDate) {
      setActionError('Disbursement due date is required.');
      return;
    }
    setStatusUpdating(true);
    setActionError(null);
    setActionSuccess(null);
    try {
      await disbursementRequestsApi.changeStatus(eid, disbursementRequestEid, {
        status,
        ...(status === 'approve' ? { disbursement_due_date: dueDate } : {}),
      });
      setActionSuccess(
        status === 'approve'
          ? 'Disbursement request approved.'
          : 'Disbursement request rejected.',
      );
      if (status === 'approve') {
        setApproveModalOpen(false);
      }
      await loadData();
    } catch (err: any) {
      setActionError(err.message || 'Failed to update disbursement request status');
    } finally {
      setStatusUpdating(false);
    }
  };

  if (loading) {
    return (
      <PageShell title="Disbursement Request" subtitle="Loading…">
        <div className="flex items-center justify-center h-40 text-[#6B7280]">
          <ArrowPathIcon className="w-5 h-5 animate-spin mr-2" />
          Loading disbursement request…
        </div>
      </PageShell>
    );
  }

  if (pageError || !application || !request || !eid || !disbursementRequestEid) {
    return (
      <PageShell title="Disbursement Request">
        <p className="text-sm text-red-600">{pageError || 'Disbursement request not found.'}</p>
        <button
          onClick={() => navigate(`/app/loans/${eid || ''}`)}
          className="mt-4 text-sm text-[#2563EB] hover:underline"
        >
          Back to loan application
        </button>
      </PageShell>
    );
  }

  const isPending = request.status === 'pending';
  const isVerificationPending = request.status === 'verification_pending';
  const isFinalized = ['approved', 'rejected'].includes(request.status);
  const currentStep = isPending && !formStepOpen ? 1 : 2;

  const readOnlyGroups = [
    {
      title: 'Disbursement request details',
      fields: [
        { label: 'Request ID', value: request.disbursement_request_eid },
        { label: 'Amount', value: formatMoney(request.disbursement_amount) },
        {
          label: 'Repayment strategy',
          value: amortizationStrategyLabel(request.amortization_type),
        },
        {
          label: 'Status',
          value: DISBURSEMENT_REQUEST_STATUS_LABELS[request.status] || request.status,
        },
      ],
    },
  ];

  return (
    <>
    <PageShell
      title="Disbursement Request"
      subtitle={`${request.disbursement_request_eid.slice(0, 8)}…`}
      breadcrumbs={buildDisbursementBreadcrumbs(eid, navigate)}
      actions={
        <div className="flex items-center gap-3">
          {disbursementStatusBadge(request.status)}
          {isVerificationPending && (
            <>
              <button
                type="button"
                onClick={() => {
                  setDisbursementDueDate(todayIsoDate());
                  setApproveModalOpen(true);
                }}
                disabled={statusUpdating}
                className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50"
              >
                Approve
              </button>
              <button
                type="button"
                onClick={() => handleOfficerAction('reject')}
                disabled={statusUpdating}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                Reject
              </button>
            </>
          )}
          <button
            onClick={() => navigate(`/app/loans/${eid}`)}
            className="flex items-center gap-2 px-3 py-2 text-sm text-[#6B7280] hover:text-[#111827] transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Back
          </button>
        </div>
      }
    >
      {isPending && <DisbursementStepIndicator currentStep={currentStep} />}

      {actionError && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {actionError}
        </p>
      )}
      {actionSuccess && (
        <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
          {actionSuccess}
        </p>
      )}

      {isPending && !formStepOpen && (
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 shadow-sm space-y-5">
          <h2 className="text-lg font-semibold text-[#111827]">Step 1 — Disbursement amount</h2>
          <p className="text-sm text-[#6B7280]">
            Update the disbursement amount before opening the disbursement request form.
          </p>

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

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={handleSaveAmount}
              disabled={coreSaving || formSubmitting}
              className="px-4 py-2 text-sm font-medium text-[#374151] border border-[#E5E7EB] rounded-lg hover:bg-[#F9FAFB] disabled:opacity-50"
            >
              {coreSaving ? 'Saving…' : 'Save amount'}
            </button>
            <button
              onClick={handleProceedToForm}
              disabled={coreSaving || formSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-[#2563EB] rounded-lg hover:bg-[#1D4ED8] disabled:opacity-50"
            >
              Proceed to disbursement form
            </button>
          </div>
        </div>
      )}

      {isPending && formStepOpen && uploadContext && (
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 shadow-sm space-y-5">
          <h2 className="text-lg font-semibold text-[#111827]">Step 2 — Disbursement request form</h2>
          <p className="text-sm text-[#6B7280]">
            Complete the disbursement request form configured on the loan type. Submitting sends
            the request to the loan officer for approval.
          </p>

          {request.form_json ? (
            <LmsFormioForm
              form={request.form_json}
              uploadContext={uploadContext}
              submission={formValues}
              handlers={formHandlers}
              onChange={setFormValues}
              onError={(err) => {
                console.error('Form.io validation error', err);
                setActionError('Please fix form validation errors before submitting.');
              }}
            />
          ) : (
            <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              No disbursement request form is configured for this loan type.
            </p>
          )}

          {formSubmitting && (
            <p className="text-sm text-[#6B7280]">Submitting disbursement request…</p>
          )}
        </div>
      )}

      {!isPending && (
        <div className="space-y-6">
          <KeyValueGrid groups={readOnlyGroups} />

          {request.form_json ? (
            <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 shadow-sm space-y-4">
              <h2 className="text-lg font-semibold text-[#111827]">Disbursement request form</h2>
              <LmsFormioReadOnlyForm
                form={request.form_json}
                submission={(request.form_values as Record<string, unknown>) || {}}
              />
            </div>
          ) : null}

          {isFinalized && (
            <p className="text-sm text-[#6B7280]">
              This disbursement request is{' '}
              {DISBURSEMENT_REQUEST_STATUS_LABELS[request.status]?.toLowerCase()}.
            </p>
          )}
        </div>
      )}
    </PageShell>

    <FormModal
      isOpen={approveModalOpen}
      onClose={() => {
        if (statusUpdating) return;
        setApproveModalOpen(false);
      }}
      title="Approve disbursement request"
      submitLabel="Approve"
      loading={statusUpdating}
      error={actionError}
      onSubmit={() => handleOfficerAction('approve', disbursementDueDate)}
    >
      <div className="space-y-4">
        <p className="text-sm text-[#6B7280]">
          Amount: {formatMoney(request.disbursement_amount)}
        </p>
        <FormField label="Disbursement due date" required>
          <FormInput
            type="date"
            value={disbursementDueDate}
            onChange={setDisbursementDueDate}
          />
        </FormField>
      </div>
    </FormModal>
    </>
  );
}
