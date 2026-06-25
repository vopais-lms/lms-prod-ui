// @ts-nocheck
import { useState, useEffect } from 'react';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { PageShell } from '../shared/PageShell';
import { FormField, FormInput, FormSelect } from '../shared/FormModal';
import { loanApplicationsApi } from '../../../apis/loanApplications';
import { loanTypesApi } from '../../../apis/loanTypes';
import { customersApi } from '../../../apis/customers';
import {
  LOAN_BPI_CALCULATION_OPTIONS,
  LOAN_EMI_SCHEDULE_OPTIONS,
  LOAN_PENALTY_BASIS_OPTIONS,
  LOAN_PENALTY_CALCULATION_TYPE_OPTIONS,
  LOAN_PENALTY_FREQUENCY_OPTIONS,
  LOAN_SINGLE_DISBURSEMENT_OPTIONS,
  LOAN_TIME_UNIT_OPTIONS,
} from '../../../constants/loanApplicationFields';
import type { Customer, LoanType } from '../../../apis/types';

const emptyForm = {
  loan_type_id: '',
  customer_eid: '',
  principal_disbursement_amount: '',
  interest_rate: '',
  emi_schedule: 'month',
  time_unit: 'months',
  no_of_units: '',
  emi_start_date: '',
  max_moratorium_period_in_days: '0',
  is_single_disbursement: 'true',
  bpi_interest_rate: '',
  bpi_calculation_type: '',
  bpi_amount: '',
  penalty_basis: 'overdue_emi',
  penalty_calculation_type: 'fixed',
  penalty_calculation_value: '0',
  penalty_calculation_frequency: 'daily',
};

export function LoanApplicationCreatePage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyForm);
  const [loanTypes, setLoanTypes] = useState<LoanType[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    const loadOptions = async () => {
      setLoadingOptions(true);
      try {
        const [loanTypesRes, customersRes] = await Promise.all([
          loanTypesApi.list({ page: 1, per_page: 100 }),
          customersApi.list({ page: 1, per_page: 100 }),
        ]);
        setLoanTypes(loanTypesRes.data.filter((lt) => lt.status));
        setCustomers(customersRes.data);
      } catch (err) {
        console.error('Failed to load form options', err);
        setSubmitError('Failed to load loan types or customers.');
      } finally {
        setLoadingOptions(false);
      }
    };
    loadOptions();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!form.loan_type_id || !form.customer_eid) {
      setSubmitError('Loan type and customer are required.');
      return;
    }

    const principal = Number(form.principal_disbursement_amount);
    const interestRate = Number(form.interest_rate);
    const noOfUnits = Number(form.no_of_units);
    const maxMoratorium = Number(form.max_moratorium_period_in_days);

    if (!principal || principal <= 0) {
      setSubmitError('Principal disbursement amount must be greater than zero.');
      return;
    }
    if (interestRate < 0) {
      setSubmitError('Interest rate cannot be negative.');
      return;
    }
    if (!noOfUnits || noOfUnits <= 0) {
      setSubmitError('Number of units must be greater than zero.');
      return;
    }
    if (maxMoratorium < 0) {
      setSubmitError('Max moratorium period cannot be negative.');
      return;
    }

    const bpiInterestRate = form.bpi_interest_rate ? Number(form.bpi_interest_rate) : null;
    const bpiAmount = form.bpi_amount ? Number(form.bpi_amount) : null;
    const penaltyCalculationValue = Number(form.penalty_calculation_value);

    if (form.bpi_interest_rate && bpiInterestRate < 0) {
      setSubmitError('BPI interest rate cannot be negative.');
      return;
    }
    if (form.bpi_amount && bpiAmount < 0) {
      setSubmitError('BPI amount cannot be negative.');
      return;
    }
    if (penaltyCalculationValue < 0) {
      setSubmitError('Penalty calculation value cannot be negative.');
      return;
    }

    setSubmitLoading(true);
    try {
      const created = await loanApplicationsApi.create({
        loan_type_id: Number(form.loan_type_id),
        customer_eid: form.customer_eid,
        principal_disbursement_amount: principal,
        interest_rate: interestRate,
        emi_schedule: form.emi_schedule,
        time_unit: form.time_unit,
        no_of_units: noOfUnits,
        emi_start_date: form.emi_start_date || null,
        max_moratorium_period_in_days: maxMoratorium || 0,
        is_single_disbursement: form.is_single_disbursement === 'true',
        bpi_interest_rate: bpiInterestRate,
        bpi_calculation_type: form.bpi_calculation_type || null,
        bpi_amount: bpiAmount,
        penalty_basis: form.penalty_basis,
        penalty_calculation_type: form.penalty_calculation_type,
        penalty_calculation_value: penaltyCalculationValue,
        penalty_calculation_frequency: form.penalty_calculation_frequency,
      });
      navigate(`/app/loans/${created.eid}`);
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to create loan application');
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <PageShell
      title="New Loan Application"
      subtitle="Step 1 — Enter core loan terms"
      actions={
        <button
          onClick={() => navigate('/app/loans')}
          className="flex items-center gap-2 px-3 py-2 text-sm text-[#6B7280] hover:text-[#111827] transition-colors"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Back to list
        </button>
      }
    >
      <div className="max-w-3xl bg-white border border-[#E5E7EB] rounded-xl p-6 shadow-sm">
        {submitError && (
          <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {submitError}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <FormField label="Loan Type" required>
            <FormSelect
              value={form.loan_type_id}
              onChange={(v) => setForm((prev) => ({ ...prev, loan_type_id: v }))}
              options={loanTypes.map((lt) => ({ value: String(lt.id), label: lt.name }))}
              placeholder="Select loan type"
              disabled={loadingOptions}
            />
          </FormField>

          <FormField label="Customer" required>
            <FormSelect
              value={form.customer_eid}
              onChange={(v) => setForm((prev) => ({ ...prev, customer_eid: v }))}
              options={customers.map((c) => ({
                value: c.eid,
                label: `${c.name} (${c.email})`,
              }))}
              placeholder="Select customer"
              disabled={loadingOptions}
            />
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Principal Amount" required>
              <FormInput
                type="number"
                value={form.principal_disbursement_amount}
                onChange={(v) => setForm((prev) => ({ ...prev, principal_disbursement_amount: v }))}
                placeholder="e.g. 500000"
              />
            </FormField>

            <FormField label="Interest Rate (% p.a.)" required>
              <FormInput
                type="number"
                value={form.interest_rate}
                onChange={(v) => setForm((prev) => ({ ...prev, interest_rate: v }))}
                placeholder="e.g. 12"
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FormField label="EMI Schedule" required>
              <FormSelect
                value={form.emi_schedule}
                onChange={(v) => setForm((prev) => ({ ...prev, emi_schedule: v }))}
                options={[...LOAN_EMI_SCHEDULE_OPTIONS]}
              />
            </FormField>

            <FormField label="Time Unit" required>
              <FormSelect
                value={form.time_unit}
                onChange={(v) => setForm((prev) => ({ ...prev, time_unit: v }))}
                options={[...LOAN_TIME_UNIT_OPTIONS]}
              />
            </FormField>

            <FormField label="No. of Units" required>
              <FormInput
                type="number"
                value={form.no_of_units}
                onChange={(v) => setForm((prev) => ({ ...prev, no_of_units: v }))}
                placeholder="e.g. 36"
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="EMI Start Date">
              <FormInput
                type="date"
                value={form.emi_start_date}
                onChange={(v) => setForm((prev) => ({ ...prev, emi_start_date: v }))}
              />
            </FormField>

            <FormField label="Max Moratorium (days)">
              <FormInput
                type="number"
                value={form.max_moratorium_period_in_days}
                onChange={(v) => setForm((prev) => ({ ...prev, max_moratorium_period_in_days: v }))}
                placeholder="0"
              />
            </FormField>
          </div>

          <FormField label="Disbursement Type">
            <FormSelect
              value={form.is_single_disbursement}
              onChange={(v) => setForm((prev) => ({ ...prev, is_single_disbursement: v }))}
              options={[...LOAN_SINGLE_DISBURSEMENT_OPTIONS]}
            />
          </FormField>

          <div className="border-t border-[#E5E7EB] pt-5 space-y-4">
            <h3 className="text-sm font-semibold text-[#374151]">BPI (Broken Period Interest)</h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FormField label="BPI Interest Rate (%)">
                <FormInput
                  type="number"
                  value={form.bpi_interest_rate}
                  onChange={(v) => setForm((prev) => ({ ...prev, bpi_interest_rate: v }))}
                  placeholder="Optional"
                />
              </FormField>

              <FormField label="BPI Calculation Type">
                <FormSelect
                  value={form.bpi_calculation_type}
                  onChange={(v) => setForm((prev) => ({ ...prev, bpi_calculation_type: v }))}
                  options={[...LOAN_BPI_CALCULATION_OPTIONS]}
                  placeholder="None"
                />
              </FormField>

              <FormField label="BPI Amount">
                <FormInput
                  type="number"
                  value={form.bpi_amount}
                  onChange={(v) => setForm((prev) => ({ ...prev, bpi_amount: v }))}
                  placeholder="Optional"
                />
              </FormField>
            </div>
          </div>

          <div className="border-t border-[#E5E7EB] pt-5 space-y-4">
            <h3 className="text-sm font-semibold text-[#374151]">Penalty</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Penalty Basis">
                <FormSelect
                  value={form.penalty_basis}
                  onChange={(v) => setForm((prev) => ({ ...prev, penalty_basis: v }))}
                  options={[...LOAN_PENALTY_BASIS_OPTIONS]}
                />
              </FormField>

              <FormField label="Penalty Calculation Type">
                <FormSelect
                  value={form.penalty_calculation_type}
                  onChange={(v) => setForm((prev) => ({ ...prev, penalty_calculation_type: v }))}
                  options={[...LOAN_PENALTY_CALCULATION_TYPE_OPTIONS]}
                />
              </FormField>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                label={
                  form.penalty_calculation_type === 'percent'
                    ? 'Penalty Rate (%)'
                    : 'Penalty Fixed Charge'
                }
              >
                <FormInput
                  type="number"
                  value={form.penalty_calculation_value}
                  onChange={(v) => setForm((prev) => ({ ...prev, penalty_calculation_value: v }))}
                  placeholder="0"
                />
              </FormField>

              <FormField label="Penalty Frequency">
                <FormSelect
                  value={form.penalty_calculation_frequency}
                  onChange={(v) =>
                    setForm((prev) => ({ ...prev, penalty_calculation_frequency: v }))
                  }
                  options={[...LOAN_PENALTY_FREQUENCY_OPTIONS]}
                />
              </FormField>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={submitLoading || loadingOptions}
              className="px-5 py-2.5 text-sm font-medium text-white bg-[#2563EB] rounded-lg hover:bg-[#1D4ED8] transition-colors disabled:opacity-50"
            >
              {submitLoading ? 'Saving…' : 'Save & Continue'}
            </button>
          </div>
        </form>
      </div>
    </PageShell>
  );
}
