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

/**
 * How a generic parameter gets its value. Topic is only a grouping label —
 * any topic can use either form fields or an external capability.
 * (Core loan terms kept for loan-application column parameters.)
 */
export const PARAMETER_TYPE_OPTIONS: { value: ParameterType; label: string }[] = [
  { value: 'form_field_api', label: 'Form fields on the loan application' },
  { value: 'api_settings', label: 'External data check' },
  {
    value: 'loan_application_column',
    label: PARAMETER_TYPE_LABELS.loan_application_column,
  },
];

/** Primary value sources shown on the parameter detail page. */
export const PARAMETER_VALUE_SOURCE_OPTIONS: {
  value: 'form_field_api' | 'api_settings';
  label: string;
  help: string;
}[] = [
  {
    value: 'form_field_api',
    label: 'Form fields',
    help: 'Read the value from fields on the loan application form (link existing or design new).',
  },
  {
    value: 'api_settings',
    label: 'External data check',
    help: 'Pull the value from a provider capability when scoring.',
  },
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
