// @ts-nocheck
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowLeftIcon, ArrowPathIcon, CheckIcon } from '@heroicons/react/24/outline';
import { useNavigate, useParams } from 'react-router-dom';
import { PageShell } from '../shared/PageShell';
import { FormField, FormInput, FormSelect } from '../shared/FormModal';
import { StatusBadge } from '../shared/StatusBadge';
import { LmsFormioForm } from '../shared/LmsFormioForm';
import { LoanApplicationSubmittedSections } from './LoanApplicationSubmittedSections';
import { loanApplicationsApi } from '../../../apis/loanApplications';
import type { LoanApplicationDetail, LoanApplicationStatus } from '../../../apis/types';
import {
  LOAN_BPI_CALCULATION_OPTIONS,
  LOAN_EMI_SCHEDULE_OPTIONS,
  LOAN_PENALTY_BASIS_OPTIONS,
  LOAN_PENALTY_CALCULATION_TYPE_OPTIONS,
  LOAN_PENALTY_FREQUENCY_OPTIONS,
  LOAN_SINGLE_DISBURSEMENT_OPTIONS,
  LOAN_TIME_UNIT_OPTIONS,
} from '../../../constants/loanApplicationFields';

function loanApplicationStatusBadge(status: LoanApplicationStatus) {
  switch (status) {
    case 'inactive':
      return <StatusBadge status="inactive" label="Inactive" />;
    case 'initiated':
      return <StatusBadge status="pending" label="Initiated" />;
    case 'submitted':
      return <StatusBadge status="pending" label="Submitted" />;
    case 'approval_pending':
      return <StatusBadge status="pending" label="Approval Pending" />;
    case 'approved':
      return <StatusBadge status="active" label="Approved" />;
    case 'rejected':
      return <StatusBadge status="error" label="Rejected" />;
    case 'start_disbursement':
      return <StatusBadge status="active" label="Disbursement" />;
    default:
      return <StatusBadge status="inactive" label={status} />;
  }
}

function termsToFormState(app: LoanApplicationDetail) {
  return {
    principal_disbursement_amount: String(app.principal_disbursement_amount ?? ''),
    interest_rate: String(app.interest_rate ?? ''),
    emi_schedule: app.emi_schedule || 'month',
    time_unit: app.time_unit || 'months',
    no_of_units: String(app.no_of_units ?? ''),
    emi_start_date: app.emi_start_date || '',
    max_moratorium_period_in_days: String(app.max_moratorium_period_in_days ?? 0),
    is_single_disbursement: String(app.is_single_disbursement ?? true),
    bpi_interest_rate: String(app.bpi_interest_rate ?? ''),
    bpi_calculation_type: app.bpi_calculation_type || '',
    bpi_amount: String(app.bpi_amount ?? ''),
    penalty_basis: app.penalty_basis || 'overdue_emi',
    penalty_calculation_type: app.penalty_calculation_type || 'fixed',
    penalty_calculation_value: String(app.penalty_calculation_value ?? 0),
    penalty_calculation_frequency: app.penalty_calculation_frequency || 'daily',
  };
}

function buildTermsPayload(form: ReturnType<typeof termsToFormState>) {
  return {
    principal_disbursement_amount: Number(form.principal_disbursement_amount),
    interest_rate: Number(form.interest_rate),
    emi_schedule: form.emi_schedule,
    time_unit: form.time_unit,
    no_of_units: Number(form.no_of_units),
    emi_start_date: form.emi_start_date || null,
    max_moratorium_period_in_days: Number(form.max_moratorium_period_in_days) || 0,
    is_single_disbursement: form.is_single_disbursement === 'true',
    bpi_interest_rate: form.bpi_interest_rate ? Number(form.bpi_interest_rate) : null,
    bpi_calculation_type: form.bpi_calculation_type || null,
    bpi_amount: form.bpi_amount ? Number(form.bpi_amount) : null,
    penalty_basis: form.penalty_basis,
    penalty_calculation_type: form.penalty_calculation_type,
    penalty_calculation_value: Number(form.penalty_calculation_value) || 0,
    penalty_calculation_frequency: form.penalty_calculation_frequency,
  };
}

function StepIndicator({ currentStep }: { currentStep: number }) {
  const steps = [
    { num: 1, label: 'Core Terms' },
    { num: 2, label: 'Additional Details' },
    { num: 3, label: 'Application Form' },
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
          {idx < steps.length - 1 && (
            <div className="w-8 h-px bg-[#E5E7EB]" />
          )}
        </div>
      ))}
    </div>
  );
}

export function LoanApplicationDetailPage() {
  const navigate = useNavigate();
  const { eid } = useParams<{ eid: string }>();
  const [application, setApplication] = useState<LoanApplicationDetail | null>(null);
  const [termsForm, setTermsForm] = useState<ReturnType<typeof termsToFormState> | null>(null);
  const [formValues, setFormValues] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);
  const [termsSaving, setTermsSaving] = useState(false);
  const [initiating, setInitiating] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [startingDisbursement, setStartingDisbursement] = useState(false);

  const loadApplication = useCallback(async () => {
    if (!eid) {
      setPageError('Invalid application id.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setPageError(null);
    try {
      const detail = await loanApplicationsApi.get(eid);
      setApplication(detail);
      setTermsForm(termsToFormState(detail));
      setFormValues((detail.form_values as Record<string, unknown>) || {});
    } catch (err: any) {
      setPageError(err.message || 'Failed to load loan application');
    } finally {
      setLoading(false);
    }
  }, [eid]);

  useEffect(() => {
    loadApplication();
  }, [loadApplication]);

  const currentStep = useMemo(() => {
    if (!application) return 1;
    if (application.status === 'inactive') return 2;
    if (application.status === 'initiated') return 3;
    return 3;
  }, [application]);

  const uploadContext = useMemo(
    () =>
      eid
        ? { purpose: 'loan_application_form_json' as const, loanApplicationEid: eid }
        : null,
    [eid],
  );

  const handleSaveTerms = async () => {
    if (!eid || !termsForm) return;
    setTermsSaving(true);
    setActionError(null);
    setActionSuccess(null);
    try {
      await loanApplicationsApi.updateTerms(eid, buildTermsPayload(termsForm));
      setActionSuccess('Loan terms saved.');
      await loadApplication();
    } catch (err: any) {
      setActionError(err.message || 'Failed to save loan terms');
    } finally {
      setTermsSaving(false);
    }
  };

  const handleInitiate = async () => {
    if (!eid || !termsForm) return;
    setInitiating(true);
    setActionError(null);
    setActionSuccess(null);
    try {
      await loanApplicationsApi.updateTerms(eid, buildTermsPayload(termsForm));
      await loanApplicationsApi.changeStatus(eid, { new_status: 'initiated' });
      setActionSuccess('Application form is now open for filling.');
      await loadApplication();
    } catch (err: any) {
      setActionError(err.message || 'Failed to start application form');
    } finally {
      setInitiating(false);
    }
  };

  const handleSaveFormDraft = useCallback(
    async (data: Record<string, unknown>) => {
      if (!eid) return;
      await loanApplicationsApi.saveForm(eid, data);
    },
    [eid],
  );

  const handleStartDisbursement = async () => {
    if (!eid) return;
    setStartingDisbursement(true);
    setActionError(null);
    setActionSuccess(null);
    try {
      await loanApplicationsApi.startDisbursement(eid);
      setActionSuccess(
        'Disbursement started. First disbursement and repayment schedule have been created.',
      );
      await loadApplication();
    } catch (err: any) {
      setActionError(err.message || 'Failed to start disbursement');
    } finally {
      setStartingDisbursement(false);
    }
  };

  const handleSubmitForm = useCallback(
    async (data: Record<string, unknown>) => {
      if (!eid) return;
      setFormSubmitting(true);
      setActionError(null);
      setActionSuccess(null);
      try {
        await loanApplicationsApi.saveForm(eid, data);
        await loanApplicationsApi.submit(eid, data);
        setFormValues(data);
        setActionSuccess('Application submitted successfully.');
        await loadApplication();
      } catch (err: any) {
        setActionError(err.message || 'Failed to submit application');
        throw err;
      } finally {
        setFormSubmitting(false);
      }
    },
    [eid, loadApplication],
  );

  const formHandlers = useMemo(
    () =>
      eid
        ? {
            onSaveDraft: handleSaveFormDraft,
            onSubmit: handleSubmitForm,
          }
        : undefined,
    [eid, handleSaveFormDraft, handleSubmitForm],
  );

  if (loading) {
    return (
      <PageShell title="Loan Application" subtitle="Loading…">
        <div className="flex items-center justify-center h-40 text-[#6B7280]">
          <ArrowPathIcon className="w-5 h-5 animate-spin mr-2" />
          Loading application…
        </div>
      </PageShell>
    );
  }

  if (pageError || !application || !termsForm) {
    return (
      <PageShell title="Loan Application">
        <p className="text-sm text-red-600">{pageError || 'Application not found.'}</p>
        <button
          onClick={() => navigate('/app/loans')}
          className="mt-4 text-sm text-[#2563EB] hover:underline"
        >
          Back to list
        </button>
      </PageShell>
    );
  }

  const canEditTerms = application.status === 'inactive';
  const canFillForm = application.status === 'initiated';
  const canStartDisbursement =
    application.status === 'approved' && application.is_single_disbursement !== false;
  const isSubmitted = !['inactive', 'initiated'].includes(application.status);

  return (
    <PageShell
      title="Loan Application"
      subtitle={`${application.eid.slice(0, 8)}…`}
      actions={
        <div className="flex items-center gap-3">
          {loanApplicationStatusBadge(application.status)}
          {canStartDisbursement && (
            <button
              type="button"
              onClick={handleStartDisbursement}
              disabled={startingDisbursement}
              className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50"
            >
              {startingDisbursement ? 'Starting…' : 'Start disbursement'}
            </button>
          )}
          <button
            onClick={() => navigate('/app/loans')}
            className="flex items-center gap-2 px-3 py-2 text-sm text-[#6B7280] hover:text-[#111827] transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Back
          </button>
        </div>
      }
    >
      {!isSubmitted && <StepIndicator currentStep={currentStep} />}

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

      {canEditTerms && (
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 shadow-sm space-y-5">
          <h2 className="text-lg font-semibold text-[#111827]">Step 2 — Additional Loan Details</h2>
          <p className="text-sm text-[#6B7280]">
            Review and update loan terms before opening the application form.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Principal Amount" required>
              <FormInput
                type="number"
                value={termsForm.principal_disbursement_amount}
                onChange={(v) => setTermsForm((prev) => ({ ...prev, principal_disbursement_amount: v }))}
              />
            </FormField>
            <FormField label="Interest Rate (%)" required>
              <FormInput
                type="number"
                value={termsForm.interest_rate}
                onChange={(v) => setTermsForm((prev) => ({ ...prev, interest_rate: v }))}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FormField label="EMI Schedule" required>
              <FormSelect
                value={termsForm.emi_schedule}
                onChange={(v) => setTermsForm((prev) => ({ ...prev, emi_schedule: v }))}
                options={[...LOAN_EMI_SCHEDULE_OPTIONS]}
              />
            </FormField>
            <FormField label="Time Unit" required>
              <FormSelect
                value={termsForm.time_unit}
                onChange={(v) => setTermsForm((prev) => ({ ...prev, time_unit: v }))}
                options={[...LOAN_TIME_UNIT_OPTIONS]}
              />
            </FormField>
            <FormField label="No. of Units" required>
              <FormInput
                type="number"
                value={termsForm.no_of_units}
                onChange={(v) => setTermsForm((prev) => ({ ...prev, no_of_units: v }))}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="EMI Start Date">
              <FormInput
                type="date"
                value={termsForm.emi_start_date}
                onChange={(v) => setTermsForm((prev) => ({ ...prev, emi_start_date: v }))}
              />
            </FormField>
            <FormField label="Max Moratorium (days)">
              <FormInput
                type="number"
                value={termsForm.max_moratorium_period_in_days}
                onChange={(v) => setTermsForm((prev) => ({ ...prev, max_moratorium_period_in_days: v }))}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FormField label="BPI Interest Rate">
              <FormInput
                type="number"
                value={termsForm.bpi_interest_rate}
                onChange={(v) => setTermsForm((prev) => ({ ...prev, bpi_interest_rate: v }))}
              />
            </FormField>
            <FormField label="BPI Calculation Type">
              <FormSelect
                value={termsForm.bpi_calculation_type}
                onChange={(v) => setTermsForm((prev) => ({ ...prev, bpi_calculation_type: v }))}
                options={[...LOAN_BPI_CALCULATION_OPTIONS]}
                placeholder="None"
              />
            </FormField>
            <FormField label="BPI Amount">
              <FormInput
                type="number"
                value={termsForm.bpi_amount}
                onChange={(v) => setTermsForm((prev) => ({ ...prev, bpi_amount: v }))}
              />
            </FormField>
          </div>

          <div className="border-t border-[#E5E7EB] pt-5 space-y-4">
            <h3 className="text-sm font-semibold text-[#374151]">Penalty</h3>

            {(application.penalty_amount > 0 || application.penalty_amount_paid > 0) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-[#374151]">
                <div>
                  <span className="text-[#6B7280]">Penalty accrued: </span>
                  ₹{(application.penalty_amount ?? 0).toLocaleString()}
                </div>
                <div>
                  <span className="text-[#6B7280]">Penalty paid: </span>
                  ₹{(application.penalty_amount_paid ?? 0).toLocaleString()}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Penalty Basis">
                <FormSelect
                  value={termsForm.penalty_basis}
                  onChange={(v) => setTermsForm((prev) => ({ ...prev, penalty_basis: v }))}
                  options={[...LOAN_PENALTY_BASIS_OPTIONS]}
                />
              </FormField>
              <FormField label="Penalty Calculation Type">
                <FormSelect
                  value={termsForm.penalty_calculation_type}
                  onChange={(v) =>
                    setTermsForm((prev) => ({ ...prev, penalty_calculation_type: v }))
                  }
                  options={[...LOAN_PENALTY_CALCULATION_TYPE_OPTIONS]}
                />
              </FormField>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                label={
                  termsForm.penalty_calculation_type === 'percent'
                    ? 'Penalty Rate (%)'
                    : 'Penalty Fixed Charge'
                }
              >
                <FormInput
                  type="number"
                  value={termsForm.penalty_calculation_value}
                  onChange={(v) =>
                    setTermsForm((prev) => ({ ...prev, penalty_calculation_value: v }))
                  }
                />
              </FormField>
              <FormField label="Penalty Frequency">
                <FormSelect
                  value={termsForm.penalty_calculation_frequency}
                  onChange={(v) =>
                    setTermsForm((prev) => ({ ...prev, penalty_calculation_frequency: v }))
                  }
                  options={[...LOAN_PENALTY_FREQUENCY_OPTIONS]}
                />
              </FormField>
            </div>
          </div>

          <FormField label="Disbursement Type">
            <FormSelect
              value={termsForm.is_single_disbursement}
              onChange={(v) => setTermsForm((prev) => ({ ...prev, is_single_disbursement: v }))}
              options={[...LOAN_SINGLE_DISBURSEMENT_OPTIONS]}
            />
          </FormField>

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={handleSaveTerms}
              disabled={termsSaving || initiating}
              className="px-4 py-2 text-sm font-medium text-[#374151] border border-[#E5E7EB] rounded-lg hover:bg-[#F9FAFB] disabled:opacity-50"
            >
              {termsSaving ? 'Saving…' : 'Save Terms'}
            </button>
            <button
              onClick={handleInitiate}
              disabled={termsSaving || initiating}
              className="px-4 py-2 text-sm font-medium text-white bg-[#2563EB] rounded-lg hover:bg-[#1D4ED8] disabled:opacity-50"
            >
              {initiating ? 'Starting…' : 'Proceed to Application Form'}
            </button>
          </div>
        </div>
      )}

      {canFillForm && uploadContext && (
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 shadow-sm space-y-5">
          <h2 className="text-lg font-semibold text-[#111827]">Step 3 — Application Form</h2>
          <p className="text-sm text-[#6B7280]">
            Fill in the loan application form. Files upload immediately when selected.
          </p>

          {application.form ? (
            <LmsFormioForm
              form={application.form}
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
              No application form is configured for this loan type.
            </p>
          )}

          {formSubmitting && (
            <p className="text-sm text-[#6B7280]">Submitting application…</p>
          )}
        </div>
      )}

      {isSubmitted && (
        <LoanApplicationSubmittedSections eid={eid!} application={application} onApplicationReload={loadApplication} />
      )}
    </PageShell>
  );
}
