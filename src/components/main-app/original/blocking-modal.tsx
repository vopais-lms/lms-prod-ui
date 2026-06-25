// @ts-nocheck
import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';

interface BlockingModalProps {
  alerts: {
    loanId: string;
    customer: string;
    dpd: number;
    outstanding: string;
    flag: string;
  }[];
  onAcknowledge: (action: string) => void;
  onEscalate: () => void;
}

export function BlockingModal({ alerts, onAcknowledge, onEscalate }: BlockingModalProps) {
  const [selectedAction, setSelectedAction] = useState<string>('');

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
    >
      <div
        className="bg-white rounded-xl w-[560px] max-h-[80vh] overflow-auto"
        style={{ boxShadow: '0 25px 50px rgba(0,0,0,0.25)' }}
      >
        <div className="p-6 border-b border-[#E5E7EB]">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-[#DC2626]" />
            <h2 className="text-xl font-semibold text-[#DC2626]">CRITICAL ALERT</h2>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-sm text-[#111827]">
            <strong>{alerts.length} accounts</strong> have crossed the SMA-2 threshold and require
            immediate action. These accounts are at imminent risk of becoming NPAs.
          </p>

          <div className="border border-[#E5E7EB] rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-[#F9FAFB]">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-[#6B7280]">Loan ID</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-[#6B7280]">Customer</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-[#6B7280]">DPD</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-[#6B7280]">Outstanding</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-[#6B7280]">Flag</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {alerts.map((alert) => (
                  <tr key={alert.loanId} className="bg-white">
                    <td className="px-3 py-2 text-[#2563EB]">{alert.loanId}</td>
                    <td className="px-3 py-2 text-[#111827]">{alert.customer}</td>
                    <td className="px-3 py-2 text-[#DC2626] font-semibold">{alert.dpd}</td>
                    <td className="px-3 py-2 text-[#111827]">{alert.outstanding}</td>
                    <td className="px-3 py-2">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#FEE2E2] text-[#991B1B]">
                        {alert.flag}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-semibold text-[#111827]">Required Action:</p>
            <div className="space-y-2">
              <label className="flex items-start gap-3 p-3 border border-[#E5E7EB] rounded-lg cursor-pointer hover:bg-[#F9FAFB]">
                <input
                  type="radio"
                  name="action"
                  value="acknowledge"
                  checked={selectedAction === 'acknowledge'}
                  onChange={(e) => setSelectedAction(e.target.value)}
                  className="mt-0.5"
                />
                <span className="text-sm text-[#111827]">
                  Acknowledge & assign collection follow-up
                </span>
              </label>
              <label className="flex items-start gap-3 p-3 border border-[#E5E7EB] rounded-lg cursor-pointer hover:bg-[#F9FAFB]">
                <input
                  type="radio"
                  name="action"
                  value="escalate"
                  checked={selectedAction === 'escalate'}
                  onChange={(e) => setSelectedAction(e.target.value)}
                  className="mt-0.5"
                />
                <span className="text-sm text-[#111827]">
                  Escalate to Branch Manager
                </span>
              </label>
              <label className="flex items-start gap-3 p-3 border border-[#E5E7EB] rounded-lg cursor-pointer hover:bg-[#F9FAFB]">
                <input
                  type="radio"
                  name="action"
                  value="override"
                  checked={selectedAction === 'override'}
                  onChange={(e) => setSelectedAction(e.target.value)}
                  className="mt-0.5"
                />
                <span className="text-sm text-[#111827]">
                  Request override (requires BM/SA approval)
                </span>
              </label>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => selectedAction && onAcknowledge(selectedAction)}
              disabled={!selectedAction}
              className="flex-1 px-4 py-2 bg-[#2563EB] text-white rounded-lg font-medium hover:bg-[#1D4ED8] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Acknowledge & Act
            </button>
            <button
              onClick={onEscalate}
              className="px-4 py-2 border border-[#E5E7EB] text-[#111827] rounded-lg font-medium hover:bg-[#F9FAFB]"
            >
              Escalate ↑
            </button>
          </div>

          <div className="flex items-start gap-2 p-3 bg-[#FEF3C7] rounded-lg">
            <AlertCircle className="w-4 h-4 text-[#F59E0B] flex-shrink-0 mt-0.5" />
            <p className="text-xs text-[#92400E]">
              ⚠️ Cannot be closed without action. Override requires Super Admin / Branch Manager approval.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

