// @ts-nocheck
import React from 'react';
import { Info, AlertTriangle, AlertCircle, X } from 'lucide-react';

type AlertTier = 'tier1' | 'tier2' | 'tier3';

interface AlertBannerProps {
  tier: AlertTier;
  message: string;
  actions?: {
    label: string;
    onClick: () => void;
  }[];
  onDismiss?: () => void;
  onSnooze?: () => void;
  snoozeCountdown?: string;
}

const tierConfig = {
  tier1: {
    bg: '#FEF2F2',
    border: '#DC2626',
    icon: AlertCircle,
    iconColor: '#DC2626',
  },
  tier2: {
    bg: '#FFFBEB',
    border: '#F59E0B',
    icon: AlertTriangle,
    iconColor: '#F59E0B',
  },
  tier3: {
    bg: '#EFF6FF',
    border: '#2563EB',
    icon: Info,
    iconColor: '#2563EB',
  },
};

export function AlertBanner({
  tier,
  message,
  actions = [],
  onDismiss,
  onSnooze,
  snoozeCountdown,
}: AlertBannerProps) {
  const config = tierConfig[tier];
  const Icon = config.icon;

  return (
    <div
      className="min-h-[48px] px-4 py-3 flex items-center gap-3"
      style={{
        backgroundColor: config.bg,
        borderLeft: `4px solid ${config.border}`,
      }}
    >
      <Icon className="w-5 h-5 flex-shrink-0" style={{ color: config.iconColor }} />
      
      <p className="flex-1 text-sm text-[#111827]">
        {message}
        {snoozeCountdown && (
          <span className="ml-2 text-xs text-[#6B7280]">({snoozeCountdown})</span>
        )}
      </p>

      <div className="flex items-center gap-2">
        {actions.map((action, idx) => (
          <button
            key={idx}
            onClick={action.onClick}
            className="px-3 py-1 text-sm font-medium text-[#2563EB] hover:underline"
          >
            {action.label}
          </button>
        ))}
        
        {onSnooze && tier === 'tier2' && (
          <button
            onClick={onSnooze}
            className="px-3 py-1 text-sm font-medium text-[#6B7280] border border-[#E5E7EB] rounded hover:bg-white"
          >
            Snooze 4h
          </button>
        )}
        
        {onDismiss && tier === 'tier3' && (
          <button
            onClick={onDismiss}
            className="p-1 text-[#6B7280] hover:text-[#111827]"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

