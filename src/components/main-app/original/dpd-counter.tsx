// @ts-nocheck
import React from 'react';

interface DPDCounterProps {
  dpd: number;
  className?: string;
}

function getDPDColor(dpd: number): string {
  if (dpd <= 30) return '#16A34A';
  if (dpd <= 60) return '#F59E0B';
  if (dpd <= 90) return '#EA580C';
  return '#DC2626';
}

export function DPDCounter({ dpd, className = '' }: DPDCounterProps) {
  const color = getDPDColor(dpd);

  return (
    <span
      className={`font-semibold ${className}`}
      style={{ color }}
    >
      {dpd}
    </span>
  );
}

