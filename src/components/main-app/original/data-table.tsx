// @ts-nocheck
import React, { useState } from 'react';
import { StatusPill } from './status-pill';
import type { StatusType } from './status-pill';
import { FlagBadge } from './flag-badge';
import type { FlagType } from './flag-badge';
import { DPDCounter } from './dpd-counter';

export interface LoanData {
  id: string;
  loanId: string;
  customer: string;
  product: string;
  outstanding: string;
  dpd: number;
  status: StatusType;
  emi: string;
  assignedTo: string;
  lastAction: string;
  flags?: FlagType[];
}

interface DataTableProps {
  data: LoanData[];
  onRowClick: (loan: LoanData) => void;
  onBulkAction?: (selectedIds: string[], action: string) => void;
}

export function DataTable({ data, onRowClick, onBulkAction }: DataTableProps) {
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(data.map((row) => row.id)));
    }
    setSelectAll(!selectAll);
  };

  const handleSelectRow = (id: string) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedRows(newSelected);
    setSelectAll(newSelected.size === data.length);
  };

  return (
    <div className="bg-white rounded-lg border border-[#E5E7EB] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-[#F9FAFB] sticky top-0">
            <tr>
              <th className="w-12 px-4 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={handleSelectAll}
                  className="w-4 h-4 rounded border-[#E5E7EB]"
                />
              </th>
              <th className="w-16 px-3 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase">
                Flag
              </th>
              <th className="px-3 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase">
                Loan ID
              </th>
              <th className="px-3 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase">
                Customer
              </th>
              <th className="px-3 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase">
                Product
              </th>
              <th className="px-3 py-3 text-right text-xs font-semibold text-[#6B7280] uppercase">
                Outstanding
              </th>
              <th className="px-3 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase">
                DPD
              </th>
              <th className="px-3 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase">
                Status
              </th>
              <th className="px-3 py-3 text-right text-xs font-semibold text-[#6B7280] uppercase">
                EMI
              </th>
              <th className="px-3 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase">
                Assigned
              </th>
              <th className="px-3 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase">
                Last Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E7EB]">
            {data.map((row) => (
              <tr
                key={row.id}
                onClick={() => onRowClick(row)}
                className="hover:bg-[#F9FAFB] cursor-pointer group"
              >
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedRows.has(row.id)}
                    onChange={() => handleSelectRow(row.id)}
                    onClick={(e) => e.stopPropagation()}
                    className="w-4 h-4 rounded border-[#E5E7EB]"
                  />
                </td>
                <td className="px-3 py-3">
                  <div className="flex gap-1">
                    {row.flags?.map((flag, idx) => (
                      <FlagBadge key={idx} type={flag} />
                    ))}
                  </div>
                </td>
                <td className="px-3 py-3">
                  <span className="text-[#2563EB] font-medium hover:underline">
                    {row.loanId}
                  </span>
                </td>
                <td className="px-3 py-3 font-medium text-[#111827]">{row.customer}</td>
                <td className="px-3 py-3 text-[#6B7280]">{row.product}</td>
                <td className="px-3 py-3 text-right font-medium text-[#111827]">
                  {row.outstanding}
                </td>
                <td className="px-3 py-3">
                  <DPDCounter dpd={row.dpd} />
                </td>
                <td className="px-3 py-3">
                  <StatusPill status={row.status} />
                </td>
                <td className="px-3 py-3 text-right text-[#6B7280]">{row.emi}</td>
                <td className="px-3 py-3 text-xs text-[#6B7280]">{row.assignedTo}</td>
                <td className="px-3 py-3 text-xs text-[#6B7280]">{row.lastAction}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="px-4 py-3 border-t border-[#E5E7EB] flex items-center justify-between bg-[#F9FAFB]">
        <p className="text-sm text-[#6B7280]">
          Showing 1-{Math.min(data.length, 25)} of {data.length}
        </p>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1 text-sm text-[#6B7280] hover:text-[#111827] disabled:opacity-50">
            Previous
          </button>
          <button className="px-3 py-1 text-sm bg-[#2563EB] text-white rounded">1</button>
          <button className="px-3 py-1 text-sm text-[#6B7280] hover:text-[#111827]">2</button>
          <button className="px-3 py-1 text-sm text-[#6B7280] hover:text-[#111827]">3</button>
          <button className="px-3 py-1 text-sm text-[#6B7280] hover:text-[#111827]">Next</button>
        </div>
      </div>

      {selectedRows.size > 0 && (
        <div 
          className="fixed bottom-0 right-0 bg-[#1F2937] text-white px-4 py-3 flex items-center gap-4 z-50 transition-all duration-200"
          style={{ left: '240px' }}
        >
          <span className="text-sm font-medium">{selectedRows.size} selected</span>
          <div className="flex gap-2">
            <button
              onClick={() => onBulkAction?.(Array.from(selectedRows), 'reassign')}
              className="px-4 py-1.5 text-sm font-medium bg-white/10 hover:bg-white/20 rounded"
            >
              Reassign
            </button>
            <button
              onClick={() => onBulkAction?.(Array.from(selectedRows), 'escalate')}
              className="px-4 py-1.5 text-sm font-medium bg-white/10 hover:bg-white/20 rounded"
            >
              Escalate
            </button>
            <button
              onClick={() => onBulkAction?.(Array.from(selectedRows), 'export')}
              className="px-4 py-1.5 text-sm font-medium bg-white/10 hover:bg-white/20 rounded"
            >
              Export
            </button>
            <button
              onClick={() => onBulkAction?.(Array.from(selectedRows), 'flag')}
              className="px-4 py-1.5 text-sm font-medium bg-white/10 hover:bg-white/20 rounded"
            >
              Flag
            </button>
          </div>
          <button
            onClick={() => setSelectedRows(new Set())}
            className="ml-auto text-sm text-white/70 hover:text-white"
          >
            Clear selection
          </button>
        </div>
      )}
    </div>
  );
}
