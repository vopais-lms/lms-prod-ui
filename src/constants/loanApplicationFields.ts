/** Canonical lowercase values stored on ``LoanApplication`` (see model comments). */

export const LOAN_EMI_SCHEDULE_OPTIONS = [
  { value: 'week', label: 'Weekly' },
  { value: 'month', label: 'Monthly' },
  { value: 'quarter', label: 'Quarterly' },
  { value: 'semi_annual', label: 'Semi-annual (6 months)' },
  { value: 'year', label: 'Yearly' },
] as const;

export const LOAN_TIME_UNIT_OPTIONS = [
  { value: 'days', label: 'Days' },
  { value: 'months', label: 'Months' },
  { value: 'years', label: 'Years' },
] as const;

/** ``bpi_calculation_type`` — see ``LoanApplication.bpi_calculation_type`` comment. */
export const LOAN_BPI_CALCULATION_OPTIONS = [
  { value: 'upfront', label: 'Deduct from principal (upfront)' },
  { value: 'adjust_first_amount_disbursed', label: 'Add to first disbursement amount' },
  { value: 'separate_payment', label: 'Separate BPI payment / disbursement' },
  { value: 'add_to_first_emi_payment', label: 'Add to first EMI payment' },
] as const;

export const LOAN_SINGLE_DISBURSEMENT_OPTIONS = [
  { value: 'true', label: 'Yes — single disbursement' },
  { value: 'false', label: 'No — multiple disbursements' },
] as const;

/** ``penalty_basis`` — see ``LoanApplication.penalty_basis`` comment. */
export const LOAN_PENALTY_BASIS_OPTIONS = [
  { value: 'overdue_emi', label: 'Overdue EMI' },
  { value: 'overdue_principal', label: 'Overdue principal' },
  { value: 'overdue_interest', label: 'Overdue interest' },
] as const;

/** ``penalty_calculation_type`` — fixed charge or percent rate. */
export const LOAN_PENALTY_CALCULATION_TYPE_OPTIONS = [
  { value: 'fixed', label: 'Fixed charge' },
  { value: 'percent', label: 'Percent rate' },
] as const;

export const LOAN_PENALTY_FREQUENCY_OPTIONS = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
] as const;

export type LoanEmiSchedule = (typeof LOAN_EMI_SCHEDULE_OPTIONS)[number]['value'];
export type LoanTimeUnit = (typeof LOAN_TIME_UNIT_OPTIONS)[number]['value'];
export type LoanBpiCalculationType = (typeof LOAN_BPI_CALCULATION_OPTIONS)[number]['value'];
export type LoanPenaltyBasis = (typeof LOAN_PENALTY_BASIS_OPTIONS)[number]['value'];
export type LoanPenaltyCalculationType =
  (typeof LOAN_PENALTY_CALCULATION_TYPE_OPTIONS)[number]['value'];
export type LoanPenaltyFrequency = (typeof LOAN_PENALTY_FREQUENCY_OPTIONS)[number]['value'];
