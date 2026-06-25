import type { LoanApplicationDetail } from '../apis/types';
import {
  LOAN_BPI_CALCULATION_OPTIONS,
  LOAN_PENALTY_BASIS_OPTIONS,
  LOAN_PENALTY_CALCULATION_TYPE_OPTIONS,
  LOAN_PENALTY_FREQUENCY_OPTIONS,
} from './loanApplicationFields';

export const LOAN_APPLICATION_STANDARD_FIELD_KEYS = [
  'eid',
  'loan_type_id',
  'customer_eid',
  'loan_officer_eid',
  'status',
  'created_at',
  'updated_at',
  'principal_disbursement_amount',
  'amount_disbursed',
  'interest_rate',
  'emi_schedule',
  'time_unit',
  'no_of_units',
  'emi_start_date',
  'pre_emi_type',
  'pre_emi_last_date',
  'calculated_current_emi',
  'max_moratorium_period_in_days',
  'moratorium_active',
  'is_single_disbursement',
  'bpi_interest_rate',
  'bpi_calculation_type',
  'bpi_amount',
  'penalty_amount',
  'penalty_amount_paid',
  'penalty_basis',
  'penalty_calculation_type',
  'penalty_calculation_value',
  'penalty_calculation_frequency',
] as const;

export type LoanApplicationStandardFieldKey =
  (typeof LOAN_APPLICATION_STANDARD_FIELD_KEYS)[number];

export const LOAN_APPLICATION_FIELD_LABELS: Record<LoanApplicationStandardFieldKey, string> = {
  eid: 'Application ID',
  loan_type_id: 'Loan Type ID',
  customer_eid: 'Customer',
  loan_officer_eid: 'Loan Officer',
  status: 'Status',
  created_at: 'Created At',
  updated_at: 'Updated At',
  principal_disbursement_amount: 'Principal Amount',
  amount_disbursed: 'Amount Disbursed',
  interest_rate: 'Interest Rate (%)',
  emi_schedule: 'EMI Schedule',
  time_unit: 'Time Unit',
  no_of_units: 'No. of Units',
  emi_start_date: 'EMI Start Date',
  pre_emi_type: 'Pre-EMI Type',
  pre_emi_last_date: 'Pre-EMI Last Date',
  calculated_current_emi: 'Current EMI',
  max_moratorium_period_in_days: 'Max Moratorium (days)',
  moratorium_active: 'Moratorium Active',
  is_single_disbursement: 'Disbursement Type',
  bpi_interest_rate: 'BPI Interest Rate',
  bpi_calculation_type: 'BPI Calculation Type',
  bpi_amount: 'BPI Amount',
  penalty_amount: 'Penalty Amount',
  penalty_amount_paid: 'Penalty Paid',
  penalty_basis: 'Penalty Basis',
  penalty_calculation_type: 'Penalty Calculation Type',
  penalty_calculation_value: 'Penalty Calculation Value',
  penalty_calculation_frequency: 'Penalty Frequency',
};

const MONEY_FIELDS: LoanApplicationStandardFieldKey[] = [
  'principal_disbursement_amount',
  'amount_disbursed',
  'calculated_current_emi',
  'bpi_amount',
  'penalty_amount',
  'penalty_amount_paid',
];

const DATE_FIELDS: LoanApplicationStandardFieldKey[] = [
  'emi_start_date',
  'pre_emi_last_date',
  'created_at',
  'updated_at',
];

const BOOLEAN_FIELDS: LoanApplicationStandardFieldKey[] = ['moratorium_active'];

const OPTION_LABEL_FIELDS: Partial<
  Record<LoanApplicationStandardFieldKey, readonly { value: string; label: string }[]>
> = {
  bpi_calculation_type: LOAN_BPI_CALCULATION_OPTIONS,
  penalty_basis: LOAN_PENALTY_BASIS_OPTIONS,
  penalty_calculation_type: LOAN_PENALTY_CALCULATION_TYPE_OPTIONS,
  penalty_calculation_frequency: LOAN_PENALTY_FREQUENCY_OPTIONS,
};

function formatOptionLabel(
  key: LoanApplicationStandardFieldKey,
  value: unknown,
): string | null {
  const options = OPTION_LABEL_FIELDS[key];
  if (!options || typeof value !== 'string') {
    return null;
  }
  return options.find((option) => option.value === value)?.label ?? null;
}

function formatDate(value: string): string {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }
  return parsed.toLocaleDateString();
}

function formatDateTime(value: string): string {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }
  return parsed.toLocaleString();
}

export function formatLoanApplicationField(
  key: LoanApplicationStandardFieldKey,
  value: unknown,
): string {
  if (value === null || value === undefined || value === '') {
    return '—';
  }

  if (key === 'is_single_disbursement') {
    return value ? 'Single disbursement' : 'Multiple disbursements';
  }

  if (BOOLEAN_FIELDS.includes(key)) {
    return value ? 'Yes' : 'No';
  }

  const optionLabel = formatOptionLabel(key, value);
  if (optionLabel) {
    return optionLabel;
  }

  if (MONEY_FIELDS.includes(key) && typeof value === 'number') {
    return `₹${value.toLocaleString()}`;
  }

  if (DATE_FIELDS.includes(key) && typeof value === 'string') {
    return key === 'created_at' || key === 'updated_at'
      ? formatDateTime(value)
      : formatDate(value);
  }

  if (typeof value === 'number') {
    return String(value);
  }

  return String(value);
}

export function buildStandardFieldGroups(application: LoanApplicationDetail) {
  const groups: { title: string; fields: { label: string; value: string }[] }[] = [
    {
      title: 'Identity',
      fields: ['eid', 'loan_type_id', 'customer_eid', 'loan_officer_eid', 'status', 'created_at', 'updated_at'].map(
        (key) => ({
          label: LOAN_APPLICATION_FIELD_LABELS[key as LoanApplicationStandardFieldKey],
          value: formatLoanApplicationField(
            key as LoanApplicationStandardFieldKey,
            application[key as keyof LoanApplicationDetail],
          ),
        }),
      ),
    },
    {
      title: 'Loan Terms',
      fields: [
        'principal_disbursement_amount',
        'amount_disbursed',
        'interest_rate',
        'emi_schedule',
        'time_unit',
        'no_of_units',
        'calculated_current_emi',
      ].map((key) => ({
        label: LOAN_APPLICATION_FIELD_LABELS[key as LoanApplicationStandardFieldKey],
        value: formatLoanApplicationField(
          key as LoanApplicationStandardFieldKey,
          application[key as keyof LoanApplicationDetail],
        ),
      })),
    },
    {
      title: 'Schedule & Moratorium',
      fields: [
        'emi_start_date',
        'pre_emi_type',
        'pre_emi_last_date',
        'max_moratorium_period_in_days',
        'moratorium_active',
        'is_single_disbursement',
      ].map((key) => ({
        label: LOAN_APPLICATION_FIELD_LABELS[key as LoanApplicationStandardFieldKey],
        value: formatLoanApplicationField(
          key as LoanApplicationStandardFieldKey,
          application[key as keyof LoanApplicationDetail],
        ),
      })),
    },
    {
      title: 'BPI',
      fields: ['bpi_interest_rate', 'bpi_calculation_type', 'bpi_amount'].map((key) => ({
        label: LOAN_APPLICATION_FIELD_LABELS[key as LoanApplicationStandardFieldKey],
        value: formatLoanApplicationField(
          key as LoanApplicationStandardFieldKey,
          application[key as keyof LoanApplicationDetail],
        ),
      })),
    },
    {
      title: 'Penalty',
      fields: [
        'penalty_amount',
        'penalty_amount_paid',
        'penalty_basis',
        'penalty_calculation_type',
        'penalty_calculation_value',
        'penalty_calculation_frequency',
      ].map((key) => ({
        label: LOAN_APPLICATION_FIELD_LABELS[key as LoanApplicationStandardFieldKey],
        value:
          key === 'penalty_calculation_value' &&
          typeof application.penalty_calculation_value === 'number'
            ? application.penalty_calculation_type === 'percent'
              ? `${application.penalty_calculation_value}%`
              : formatLoanApplicationField(
                  'penalty_calculation_value',
                  application.penalty_calculation_value,
                )
            : formatLoanApplicationField(
                key as LoanApplicationStandardFieldKey,
                application[key as keyof LoanApplicationDetail],
              ),
      })),
    },
  ];

  return groups;
}
