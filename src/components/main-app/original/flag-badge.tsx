// @ts-nocheck
import React from 'react';
import { AlertTriangle, Clipboard, Phone, ShieldAlert } from 'lucide-react';

export type FlagType = 'risk' | 'operational' | 'collection' | 'fraud';

interface FlagBadgeProps {
  type: FlagType;
  onClick?: () => void;
}

const flagConfig: Record<FlagType, { color: string; Icon: typeof AlertTriangle; outline?: string }> = {
  risk: { color: '#DC2626', Icon: AlertTriangle },
  operational: { color: '#F59E0B', Icon: Clipboard },
  collection: { color: '#EA580C', Icon: Phone },
  fraud: { color: '#DC2626', Icon: ShieldAlert, outline: '2px solid #000' },
};

export function FlagBadge({ type, onClick }: FlagBadgeProps) {
  const { color, Icon } = flagConfig[type];

  return (
    <button
      onClick={onClick}
      className="inline-flex items-center justify-center w-5 h-5 rounded-full hover:scale-110 transition-transform"
      style={{ backgroundColor: `${color}20`, color }}
      title={`${type} flag`}
    >
      <Icon className="w-3 h-3" />
    </button>
  );
}

export function FlagBadgeDot({ type }: { type: FlagType }) {
  const { color } = flagConfig[type];

  return (
    <span
      className="inline-block w-2 h-2 rounded-full"
      style={{ backgroundColor: color }}
      title={`${type} flag`}
    />
  );
}

