import type { ParameterType } from '../apis/types';

/** Product topics from API docstring — stable values sent to the backend. */
export const PRODUCT_TOPICS = [
  'Customer profile',
  'Employment details',
  'Loan details',
  'Credit Bureau',
  'Banking Analyses',
] as const;

export type ProductTopic = (typeof PRODUCT_TOPICS)[number];

/**
 * Backend enum → human labels for NBFC ops/admin users.
 * API payloads still use the enum values.
 */
export const PARAMETER_TYPE_LABELS: Record<ParameterType, string> = {
  form_field_api: 'Form Fields',
  loan_application_column: 'Core loan terms',
  api_settings: 'External data check',
  reference: 'Linked record',
};

/** Types exposed in create/edit flows (hide Linked record for this UX). */
export const PARAMETER_TYPE_OPTIONS: { value: ParameterType; label: string }[] = [
  { value: 'form_field_api', label: PARAMETER_TYPE_LABELS.form_field_api },
  {
    value: 'loan_application_column',
    label: PARAMETER_TYPE_LABELS.loan_application_column,
  },
  { value: 'api_settings', label: PARAMETER_TYPE_LABELS.api_settings },
];

/** Core loan terms from product topics docstring → loan_application columns. */
export const CORE_LOAN_TERM_OPTIONS: { value: string; label: string }[] = [
  { value: 'principal_disbursement_amount', label: 'Principal amount' },
  { value: 'interest_rate', label: 'Interest' },
  { value: 'no_of_units', label: 'Time period' },
  { value: 'emi_schedule', label: 'Repayment schedule' },
];

export function parameterTypeLabel(type: string | null | undefined): string {
  if (!type) return '—';
  return PARAMETER_TYPE_LABELS[type as ParameterType] || type;
}

export function coreLoanTermLabel(column: string | null | undefined): string {
  if (!column) return '—';
  const match = CORE_LOAN_TERM_OPTIONS.find((o) => o.value === column);
  return match?.label || column;
}
