// @ts-nocheck
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowLeftIcon, ArrowPathIcon, CheckIcon } from '@heroicons/react/24/outline';
import { useNavigate, useParams } from 'react-router-dom';
import { loanApplicationsApi } from '../../../apis/loanApplications';
import { moratoriumRequestsApi } from '../../../apis/moratoriumRequests';
import type { LoanApplicationDetail, MoratoriumRequestDetail } from '../../../apis/types';
import {
  MORATORIUM_STATUS_LABELS,
  MORATORIUM_TYPE_OPTIONS,
} from '../../../constants/moratoriumRequestFields';
import { PageShell } from '../shared/PageShell';
import { FormField, FormInput, FormSelect } from '../shared/FormModal';
import { StatusBadge } from '../shared/StatusBadge';
import { LmsFormioForm } from '../shared/LmsFormioForm';
import { LmsFormioReadOnlyForm } from '../shared/LmsFormioReadOnlyForm';
import { KeyValueGrid } from '../shared/KeyValueGrid';

function buildMoratoriumBreadcrumbs(loanApplicationEid: string, navigate: ReturnType<typeof useNavigate>) {
  return [
    {
      label: 'Loan Application',
      onClick: () => navigate(`/app/loans/${loanApplicationEid}`),
    },
    { label: 'Moratorium Request' },
  ];
}

function moratoriumStatusBadge(status: string) {
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

function requestToFormState(request: MoratoriumRequestDetail) {
  return {
    moratorium_type: request.moratorium_type || 'principal_amount_only',
    moratorium_period_in_days: String(request.moratorium_period_in_days ?? ''),
    moratorium_start_date: request.moratorium_start_date || '',
    keep_tenured_fixed: String(request.keep_tenured_fixed ?? false),
  };
}

function MoratoriumStepIndicator({ currentStep }: { currentStep: number }) {
  const steps = [
    { num: 1, label: 'Core details' },
    { num: 2, label: 'Moratorium form' },
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

export function MoratoriumRequestDetailPage() {
  const navigate = useNavigate();
  const { eid, moratoriumRequestEid } = useParams<{
    eid: string;
    moratoriumRequestEid: string;
  }>();

  const [application, setApplication] = useState<LoanApplicationDetail | null>(null);
  const [request, setRequest] = useState<MoratoriumRequestDetail | null>(null);
  const [coreForm, setCoreForm] = useState<ReturnType<typeof requestToFormState> | null>(null);
  const [formValues, setFormValues] = useState<Record<string, unknown>>({});
  const [formStepOpen, setFormStepOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [coreSaving, setCoreSaving] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);

  const loadData = useCallback(async () => {
    if (!eid || !moratoriumRequestEid) {
      setPageError('Invalid moratorium request route.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setPageError(null);
    try {
      const [appDetail, requestDetail] = await Promise.all([
        loanApplicationsApi.get(eid),
        moratoriumRequestsApi.get(eid, moratoriumRequestEid),
      ]);
      setApplication(appDetail);
      setRequest(requestDetail);
      setCoreForm(requestToFormState(requestDetail));
      setFormValues((requestDetail.form_values as Record<string, unknown>) || {});
      setFormStepOpen(requestDetail.status !== 'pending' || Boolean(requestDetail.form_values));
    } catch (err: any) {
      setPageError(err.message || 'Failed to load moratorium request');
    } finally {
      setLoading(false);
    }
  }, [eid, moratoriumRequestEid]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const uploadContext = useMemo(
    () =>
      eid && moratoriumRequestEid
        ? {
            purpose: 'moratorium_request_form_json' as const,
            loanApplicationEid: eid,
            moratoriumRequestEid,
          }
        : null,
    [eid, moratoriumRequestEid],
  );

  const handleSaveCore = async () => {
    if (!eid || !moratoriumRequestEid || !coreForm || !application) return;

    const period = Number(coreForm.moratorium_period_in_days);
    if (!period || period < 1) {
      setActionError('Moratorium period must be at least 1 day.');
      return;
    }
    if (period > (application.max_moratorium_period_in_days ?? 0)) {
      setActionError(
        `Moratorium period cannot exceed ${application.max_moratorium_period_in_days} days.`,
      );
      return;
    }

    setCoreSaving(true);
    setActionError(null);
    setActionSuccess(null);
    try {
      await moratoriumRequestsApi.update(eid, moratoriumRequestEid, {
        moratorium_type: coreForm.moratorium_type,
        moratorium_period_in_days: period,
        moratorium_start_date: coreForm.moratorium_start_date || null,
        keep_tenured_fixed: coreForm.keep_tenured_fixed === 'true',
      });
      setActionSuccess('Moratorium details saved.');
      await loadData();
    } catch (err: any) {
      setActionError(err.message || 'Failed to save moratorium details');
    } finally {
      setCoreSaving(false);
    }
  };

  const handleProceedToForm = async () => {
    if (!eid || !moratoriumRequestEid || !coreForm || !application) return;

    const period = Number(coreForm.moratorium_period_in_days);
    if (!period || period < 1) {
      setActionError('Moratorium period must be at least 1 day.');
      return;
    }
    if (period > (application.max_moratorium_period_in_days ?? 0)) {
      setActionError(
        `Moratorium period cannot exceed ${application.max_moratorium_period_in_days} days.`,
      );
      return;
    }

    setCoreSaving(true);
    setActionError(null);
    setActionSuccess(null);
    try {
      await moratoriumRequestsApi.update(eid, moratoriumRequestEid, {
        moratorium_type: coreForm.moratorium_type,
        moratorium_period_in_days: period,
        moratorium_start_date: coreForm.moratorium_start_date || null,
        keep_tenured_fixed: coreForm.keep_tenured_fixed === 'true',
      });
      setFormStepOpen(true);
      setActionSuccess('Moratorium details saved. Complete the moratorium form below.');
      await loadData();
    } catch (err: any) {
      setActionError(err.message || 'Failed to save moratorium details');
    } finally {
      setCoreSaving(false);
    }
  };

  const handleSaveFormDraft = useCallback(
    async (data: Record<string, unknown>) => {
      if (!eid || !moratoriumRequestEid) return;
      await moratoriumRequestsApi.saveForm(eid, moratoriumRequestEid, data);
    },
    [eid, moratoriumRequestEid],
  );

  const handleSubmitForm = useCallback(
    async (data: Record<string, unknown>) => {
      if (!eid || !moratoriumRequestEid) return;
      setFormSubmitting(true);
      setActionError(null);
      setActionSuccess(null);
      try {
        await moratoriumRequestsApi.submit(eid, moratoriumRequestEid, data);
        navigate(`/app/loans/${eid}`);
      } catch (err: any) {
        setActionError(err.message || 'Failed to submit moratorium request');
        throw err;
      } finally {
        setFormSubmitting(false);
      }
    },
    [eid, moratoriumRequestEid, navigate],
  );

  const formHandlers = useMemo(
    () =>
      eid && moratoriumRequestEid
        ? {
            onSaveDraft: handleSaveFormDraft,
            onSubmit: handleSubmitForm,
          }
        : undefined,
    [eid, moratoriumRequestEid, handleSaveFormDraft, handleSubmitForm],
  );

  const handleOfficerAction = async (status: 'approve' | 'reject') => {
    if (!eid || !moratoriumRequestEid) return;
    setStatusUpdating(true);
    setActionError(null);
    setActionSuccess(null);
    try {
      await moratoriumRequestsApi.changeStatus(eid, moratoriumRequestEid, { status });
      setActionSuccess(status === 'approve' ? 'Moratorium request approved.' : 'Moratorium request rejected.');
      await loadData();
    } catch (err: any) {
      setActionError(err.message || 'Failed to update moratorium request status');
    } finally {
      setStatusUpdating(false);
    }
  };

  if (loading) {
    return (
      <PageShell title="Moratorium Request" subtitle="Loading…">
        <div className="flex items-center justify-center h-40 text-[#6B7280]">
          <ArrowPathIcon className="w-5 h-5 animate-spin mr-2" />
          Loading moratorium request…
        </div>
      </PageShell>
    );
  }

  if (pageError || !application || !request || !coreForm || !eid || !moratoriumRequestEid) {
    return (
      <PageShell title="Moratorium Request">
        <p className="text-sm text-red-600">{pageError || 'Moratorium request not found.'}</p>
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
      title: 'Moratorium details',
      fields: [
        { label: 'Request ID', value: request.moratorium_request_eid },
        {
          label: 'Type',
          value:
            MORATORIUM_TYPE_OPTIONS.find((opt) => opt.value === request.moratorium_type)?.label ||
            request.moratorium_type,
        },
        { label: 'Period (days)', value: String(request.moratorium_period_in_days) },
        { label: 'Start date', value: request.moratorium_start_date || '—' },
        {
          label: 'Keep tenure fixed',
          value: request.keep_tenured_fixed ? 'Yes' : 'No',
        },
        {
          label: 'Status',
          value: MORATORIUM_STATUS_LABELS[request.status] || request.status,
        },
      ],
    },
  ];

  return (
    <PageShell
      title="Moratorium Request"
      subtitle={`${request.moratorium_request_eid.slice(0, 8)}…`}
      breadcrumbs={buildMoratoriumBreadcrumbs(eid, navigate)}
      actions={
        <div className="flex items-center gap-3">
          {moratoriumStatusBadge(request.status)}
          {isVerificationPending && (
            <>
              <button
                type="button"
                onClick={() => handleOfficerAction('approve')}
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
      {isPending && <MoratoriumStepIndicator currentStep={currentStep} />}

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

      <p className="text-sm text-blue-700 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
        Note: Moratorium is calculated based on repayment schedule cycle and not exact dates.
      </p>

      {isPending && !formStepOpen && (
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 shadow-sm space-y-5">
          <h2 className="text-lg font-semibold text-[#111827]">Step 1 — Core moratorium details</h2>
          <p className="text-sm text-[#6B7280]">
            Update the standard moratorium fields before opening the moratorium request form.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Moratorium type" required>
              <FormSelect
                value={coreForm.moratorium_type}
                onChange={(v) => setCoreForm((prev) => ({ ...prev, moratorium_type: v }))}
                options={[...MORATORIUM_TYPE_OPTIONS]}
              />
            </FormField>
            <FormField label="Period (days)" required>
              <FormInput
                type="number"
                value={coreForm.moratorium_period_in_days}
                onChange={(v) =>
                  setCoreForm((prev) => ({ ...prev, moratorium_period_in_days: v }))
                }
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Start date">
              <FormInput
                type="date"
                value={coreForm.moratorium_start_date}
                onChange={(v) => setCoreForm((prev) => ({ ...prev, moratorium_start_date: v }))}
              />
            </FormField>
            <FormField label="Keep tenure fixed">
              <FormSelect
                value={coreForm.keep_tenured_fixed}
                onChange={(v) => setCoreForm((prev) => ({ ...prev, keep_tenured_fixed: v }))}
                options={[
                  { value: 'false', label: 'No — shift repayment schedule' },
                  { value: 'true', label: 'Yes — higher subsequent EMIs' },
                ]}
              />
            </FormField>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={handleSaveCore}
              disabled={coreSaving || formSubmitting}
              className="px-4 py-2 text-sm font-medium text-[#374151] border border-[#E5E7EB] rounded-lg hover:bg-[#F9FAFB] disabled:opacity-50"
            >
              {coreSaving ? 'Saving…' : 'Save details'}
            </button>
            <button
              onClick={handleProceedToForm}
              disabled={coreSaving || formSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-[#2563EB] rounded-lg hover:bg-[#1D4ED8] disabled:opacity-50"
            >
              Proceed to moratorium form
            </button>
          </div>
        </div>
      )}

      {isPending && formStepOpen && uploadContext && (
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 shadow-sm space-y-5">
          <h2 className="text-lg font-semibold text-[#111827]">Step 2 — Moratorium request form</h2>
          <p className="text-sm text-[#6B7280]">
            Complete the moratorium request form configured on the loan type. Submitting sends the
            request to the loan officer for approval.
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
              No moratorium request form is configured for this loan type.
            </p>
          )}

          {formSubmitting && (
            <p className="text-sm text-[#6B7280]">Submitting moratorium request…</p>
          )}
        </div>
      )}

      {!isPending && (
        <div className="space-y-6">
          <KeyValueGrid groups={readOnlyGroups} />

          {request.form_json ? (
            <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 shadow-sm space-y-4">
              <h2 className="text-lg font-semibold text-[#111827]">Moratorium request form</h2>
              <LmsFormioReadOnlyForm
                form={request.form_json}
                submission={(request.form_values as Record<string, unknown>) || {}}
              />
            </div>
          ) : null}

          {isFinalized && (
            <p className="text-sm text-[#6B7280]">
              This moratorium request is {MORATORIUM_STATUS_LABELS[request.status]?.toLowerCase()}.
            </p>
          )}
        </div>
      )}
    </PageShell>
  );
}
