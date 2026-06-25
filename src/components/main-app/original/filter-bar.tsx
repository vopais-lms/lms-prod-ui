// @ts-nocheck
import React from 'react';
import { ChevronDown, X, RotateCcw, Save } from 'lucide-react';

export interface FilterValues {
  product: string;
  status: string;
  dpd: string;
  branch: string;
  riskFlag: string;
  officer: string;
}

interface FilterBarProps {
  filters: FilterValues;
  onFilterChange: (filters: FilterValues) => void;
  onReset: () => void;
  onSaveView: () => void;
  showBranch?: boolean;
  showOfficer?: boolean;
}

export function FilterBar({
  filters,
  onFilterChange,
  onReset,
  onSaveView,
  showBranch = true,
  showOfficer = true,
}: FilterBarProps) {
  const activeFilters = Object.entries(filters).filter(([key, value]) => value !== 'All');

  const removeFilter = (key: string) => {
    onFilterChange({ ...filters, [key]: 'All' });
  };

  return (
    <div className="sticky top-[56px] z-40 bg-white border-b border-[#E5E7EB] px-4 py-2">
      <div className="flex items-center gap-2 flex-wrap">
        <select
          value={filters.product}
          onChange={(e) => onFilterChange({ ...filters, product: e.target.value })}
          className="h-8 px-3 text-xs text-[#6B7280] border border-[#E5E7EB] rounded-lg cursor-pointer hover:border-[#D1D5DB]"
        >
          <option>Product: All</option>
          <option>Personal</option>
          <option>Business</option>
          <option>Vehicle</option>
          <option>Gold</option>
        </select>

        <select
          value={filters.status}
          onChange={(e) => onFilterChange({ ...filters, status: e.target.value })}
          className="h-8 px-3 text-xs text-[#6B7280] border border-[#E5E7EB] rounded-lg cursor-pointer hover:border-[#D1D5DB]"
        >
          <option>Status: All</option>
          <option>Active</option>
          <option>Overdue</option>
          <option>NPA</option>
          <option>Closed</option>
          <option>Pending</option>
        </select>

        <select
          value={filters.dpd}
          onChange={(e) => onFilterChange({ ...filters, dpd: e.target.value })}
          className="h-8 px-3 text-xs text-[#6B7280] border border-[#E5E7EB] rounded-lg cursor-pointer hover:border-[#D1D5DB]"
        >
          <option>DPD: All</option>
          <option>0-30</option>
          <option>31-60</option>
          <option>61-90</option>
          <option>90+</option>
        </select>

        {showBranch && (
          <select
            value={filters.branch}
            onChange={(e) => onFilterChange({ ...filters, branch: e.target.value })}
            className="h-8 px-3 text-xs text-[#6B7280] border border-[#E5E7EB] rounded-lg cursor-pointer hover:border-[#D1D5DB]"
          >
            <option>Branch: All</option>
            <option>Jaipur</option>
            <option>Delhi</option>
            <option>Mumbai</option>
            <option>Bangalore</option>
          </select>
        )}

        <select
          value={filters.riskFlag}
          onChange={(e) => onFilterChange({ ...filters, riskFlag: e.target.value })}
          className="h-8 px-3 text-xs text-[#6B7280] border border-[#E5E7EB] rounded-lg cursor-pointer hover:border-[#D1D5DB]"
        >
          <option>Risk Flag: All</option>
          <option>No Flag</option>
          <option>Risk</option>
          <option>Operational</option>
          <option>Collection</option>
          <option>Fraud</option>
        </select>

        {showOfficer && (
          <select
            value={filters.officer}
            onChange={(e) => onFilterChange({ ...filters, officer: e.target.value })}
            className="h-8 px-3 text-xs text-[#6B7280] border border-[#E5E7EB] rounded-lg cursor-pointer hover:border-[#D1D5DB]"
          >
            <option>Officer: All</option>
            <option>Rajesh K.</option>
            <option>Neha M.</option>
            <option>Amit P.</option>
          </select>
        )}

        {activeFilters.length > 0 && (
          <div className="flex items-center gap-2 ml-2">
            {activeFilters.map(([key, value]) => (
              <span
                key={key}
                className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-[#DBEAFE] text-[#1E40AF] rounded-full"
              >
                {value}
                <button
                  onClick={() => removeFilter(key)}
                  className="hover:text-[#1E3A8A]"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}

        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={onReset}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6] rounded-lg"
          >
            <RotateCcw className="w-3 h-3" />
            Reset
          </button>
          <button
            onClick={onSaveView}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6] rounded-lg"
          >
            <Save className="w-3 h-3" />
            Save View
          </button>
        </div>
      </div>
    </div>
  );
}

