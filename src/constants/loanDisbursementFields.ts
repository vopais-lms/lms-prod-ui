export const LOAN_AMORTIZATION_STRATEGY_OPTIONS = [
  {
    value: 'keep_tenured_fixed',
    label: 'Keep tenure fixed — higher subsequent EMIs',
  },
  {
    value: 'adjust_tenure',
    label: 'Adjust tenure — extend repayment schedule',
  },
] as const;

export const LOAN_DISBURSEMENT_STATUS_LABELS: Record<string, string> = {
  disbursement_pending: 'Pending',
  disbursed: 'Disbursed',
  negated: 'Negated',
};

export function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

export function isoDateFromValue(value?: string | null): string {
  if (!value) {
    return todayIsoDate();
  }
  return value.slice(0, 10);
}

export function amortizationStrategyLabel(value?: string | null): string {
  if (!value) {
    return '—';
  }
  return (
    LOAN_AMORTIZATION_STRATEGY_OPTIONS.find((option) => option.value === value)?.label ??
    value
  );
}
