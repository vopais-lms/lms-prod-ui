// @ts-nocheck
interface StatusBadgeProps {
  status: 'active' | 'inactive' | 'verified' | 'unverified' | 'pending' | 'extracted' | 'error' | 'draft' | 'approved' | 'rejected' | 'negated';
  label?: string;
}

const statusConfig: Record<StatusBadgeProps['status'], { bg: string; text: string; dot: string; defaultLabel: string }> = {
  active: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500', defaultLabel: 'Active' },
  inactive: { bg: 'bg-gray-50', text: 'text-gray-600', dot: 'bg-gray-400', defaultLabel: 'Inactive' },
  verified: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500', defaultLabel: 'Verified' },
  unverified: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500', defaultLabel: 'Unverified' },
  pending: { bg: 'bg-orange-50', text: 'text-orange-700', dot: 'bg-orange-500', defaultLabel: 'Pending' },
  extracted: { bg: 'bg-purple-50', text: 'text-purple-700', dot: 'bg-purple-500', defaultLabel: 'Extracted' },
  error: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500', defaultLabel: 'Error' },
  draft: { bg: 'bg-gray-50', text: 'text-gray-600', dot: 'bg-gray-400', defaultLabel: 'Draft' },
  approved: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500', defaultLabel: 'Approved' },
  rejected: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500', defaultLabel: 'Rejected' },
  negated: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500', defaultLabel: 'Negated' },
};

export function StatusBadge({ status, label }: StatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {label || config.defaultLabel}
    </span>
  );
}
