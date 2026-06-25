// @ts-nocheck
import React from 'react';
import { X, ChevronDown } from 'lucide-react';
import { StatusPill } from './status-pill';
import { FlagBadge } from './flag-badge';
import type { LoanData } from './data-table';

interface DetailSlideOutProps {
  loan: LoanData | null;
  onClose: () => void;
}

export function DetailSlideOut({ loan, onClose }: DetailSlideOutProps) {
  if (!loan) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/20 z-[45]"
        onClick={onClose}
      />
      <div
        className="fixed right-0 top-[56px] bottom-0 w-[480px] bg-white z-[45] overflow-y-auto animate-in slide-in-from-right duration-200"
        style={{ boxShadow: '-4px 0 15px rgba(0,0,0,0.1)' }}
      >
        <div className="sticky top-0 bg-white border-b border-[#E5E7EB] px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div>
              <h2 className="text-xl font-semibold text-[#111827]">Loan {loan.loanId}</h2>
              <p className="text-sm text-[#6B7280] mt-0.5">{loan.customer}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <StatusPill status={loan.status} />
            <button
              onClick={onClose}
              className="p-1.5 text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6] rounded"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {loan.flags && loan.flags.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-[#6B7280] uppercase mb-2">Active Flags</p>
              <div className="flex gap-2">
                {loan.flags.map((flag, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-[#FEE2E2] text-[#991B1B] rounded-full"
                  >
                    <FlagBadge type={flag} />
                    {flag}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div>
            <p className="text-xs font-semibold text-[#6B7280] uppercase mb-3">Key Metrics</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-[#F9FAFB] rounded-lg border border-[#E5E7EB]">
                <p className="text-xs text-[#6B7280] mb-1">Outstanding</p>
                <p className="text-lg font-semibold text-[#111827]">{loan.outstanding}</p>
              </div>
              <div className="p-3 bg-[#F9FAFB] rounded-lg border border-[#E5E7EB]">
                <p className="text-xs text-[#6B7280] mb-1">DPD</p>
                <p className="text-lg font-semibold" style={{ color: loan.dpd > 60 ? '#DC2626' : loan.dpd > 30 ? '#F59E0B' : '#16A34A' }}>
                  {loan.dpd}
                </p>
              </div>
              <div className="p-3 bg-[#F9FAFB] rounded-lg border border-[#E5E7EB]">
                <p className="text-xs text-[#6B7280] mb-1">EMI</p>
                <p className="text-lg font-semibold text-[#111827]">{loan.emi}</p>
              </div>
              <div className="p-3 bg-[#F9FAFB] rounded-lg border border-[#E5E7EB]">
                <p className="text-xs text-[#6B7280] mb-1">Next Due</p>
                <p className="text-lg font-semibold text-[#111827]">Mar 5</p>
              </div>
              <div className="p-3 bg-[#F9FAFB] rounded-lg border border-[#E5E7EB]">
                <p className="text-xs text-[#6B7280] mb-1">Product</p>
                <p className="text-sm font-medium text-[#111827]">{loan.product}</p>
              </div>
              <div className="p-3 bg-[#F9FAFB] rounded-lg border border-[#E5E7EB]">
                <p className="text-xs text-[#6B7280] mb-1">Branch</p>
                <p className="text-sm font-medium text-[#111827]">Jaipur</p>
              </div>
            </div>
          </div>

          <div>
            <button className="w-full px-4 py-2 text-sm font-medium text-[#2563EB] border border-[#2563EB] rounded-lg hover:bg-[#EFF6FF] flex items-center justify-between">
              Quick Actions
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          <div>
            <p className="text-xs font-semibold text-[#6B7280] uppercase mb-3">Recent Activity</p>
            <div className="space-y-4">
              {[
                { action: 'EMI payment received', time: '2 hours ago', type: 'success' },
                { action: 'Follow-up call completed', time: '1 day ago', type: 'neutral' },
                { action: 'Flag raised: Collection', time: '3 days ago', type: 'warning' },
              ].map((activity, idx) => (
                <div key={idx} className="flex gap-3">
                  <div className="relative">
                    <div
                      className={`w-2 h-2 rounded-full mt-1.5 ${
                        activity.type === 'success'
                          ? 'bg-[#16A34A]'
                          : activity.type === 'warning'
                          ? 'bg-[#F59E0B]'
                          : 'bg-[#6B7280]'
                      }`}
                    />
                    {idx < 2 && (
                      <div className="absolute top-3 left-1/2 -translate-x-1/2 w-px h-8 bg-[#E5E7EB]" />
                    )}
                  </div>
                  <div className="flex-1 pb-4">
                    <p className="text-sm text-[#111827]">{activity.action}</p>
                    <p className="text-xs text-[#6B7280] mt-0.5">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button className="w-full px-4 py-3 bg-[#2563EB] text-white rounded-lg font-medium hover:bg-[#1D4ED8] flex items-center justify-center gap-2">
            Open Full Detail →
          </button>
        </div>
      </div>
    </>
  );
}

