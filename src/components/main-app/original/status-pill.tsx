// @ts-nocheck
import React from 'react';

export type StatusType = 
  | 'active' 
  | 'pending' 
  | 'overdue' 
  | 'npa' 
  | 'sma_1' 
  | 'sma_2' 
  | 'closed' 
  | 'restructured';

interface StatusPillProps {
  status: StatusType;
  label?: string;
}

const statusStyles: Record<StatusType, { bg: string; text: string }> = {
  active: { bg: '#DCFCE7', text: '#166534' },
  pending: { bg: '#FEF3C7', text: '#92400E' },
  overdue: { bg: '#FEE2E2', text: '#991B1B' },
  npa: { bg: '#991B1B', text: '#FFFFFF' },
  sma_1: { bg: '#FEF3C7', text: '#92400E' },
  sma_2: { bg: '#FFEDD5', text: '#9A3412' },
  closed: { bg: '#F3F4F6', text: '#374151' },
  restructured: { bg: '#EDE9FE', text: '#5B21B6' },
};

const statusLabels: Record<StatusType, string> = {
  active: 'Active',
  pending: 'Pending',
  overdue: 'Overdue',
  npa: 'NPA',
  sma_1: 'SMA-1',
  sma_2: 'SMA-2',
  closed: 'Closed',
  restructured: 'Restructured',
};

export function StatusPill({ status, label }: StatusPillProps) {
  const style = statusStyles[status];
  const displayLabel = label || statusLabels[status];

  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
      style={{ backgroundColor: style.bg, color: style.text }}
    >
      {displayLabel}
    </span>
  );
}

