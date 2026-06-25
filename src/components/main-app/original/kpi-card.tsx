// @ts-nocheck
import React from 'react';
import { TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';

interface KPICardProps {
  label: string;
  primaryMetric: string;
  trend?: {
    value: string;
    direction: 'up' | 'down';
  };
  secondaryMetric?: string;
  actionLabel?: string;
  onAction?: () => void;
  onClick?: () => void;
  danger?: boolean;
  active?: boolean;
}

export function KPICard({
  label,
  primaryMetric,
  trend,
  secondaryMetric,
  actionLabel,
  onAction,
  onClick,
  danger = false,
  active = false,
}: KPICardProps) {
  return (
    <div
      onClick={onClick}
      className={`
        min-w-[200px] h-[110px] bg-white rounded-lg p-4 
        border transition-all cursor-pointer
        ${active ? 'border-2 border-[#2563EB]' : 'border border-[#E5E7EB] hover:border-[#D1D5DB]'}
        ${danger ? 'border-l-4 border-l-[#DC2626]' : ''}
        hover:shadow-[0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_rgba(0,0,0,0.06)]
      `}
    >
      <div className="flex flex-col h-full justify-between">
        <div className="space-y-1">
          <p className="text-[11px] font-semibold uppercase text-[#6B7280] tracking-wide">
            {label}
          </p>
          <p className={`text-[28px] font-bold leading-9 ${danger ? 'text-[#DC2626]' : 'text-[#111827]'}`}>
            {primaryMetric}
          </p>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            {trend && (
              <div className={`flex items-center gap-1 text-xs font-medium ${
                trend.direction === 'up' ? 'text-[#16A34A]' : 'text-[#DC2626]'
              }`}>
                {trend.direction === 'up' ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                <span>{trend.value}</span>
              </div>
            )}
            {secondaryMetric && (
              <p className="text-xs text-[#6B7280]">{secondaryMetric}</p>
            )}
          </div>
          
          {actionLabel && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAction?.();
              }}
              className="text-xs text-[#2563EB] hover:underline flex items-center gap-1"
            >
              {actionLabel}
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

