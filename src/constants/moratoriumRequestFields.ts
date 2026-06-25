export const MORATORIUM_TYPE_OPTIONS = [
  { value: 'principal_amount_only', label: 'Principal amount only' },
  { value: 'full', label: 'Full moratorium' },
] as const;

export const MORATORIUM_TYPE_LABELS: Record<string, string> = {
  principal_amount_only: 'Principal amount only',
  full: 'Full moratorium',
};

export const MORATORIUM_STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  verification_pending: 'Verification pending',
  approved: 'Approved',
  rejected: 'Rejected',
};
