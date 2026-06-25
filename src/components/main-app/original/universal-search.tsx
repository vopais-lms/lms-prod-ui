// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';

interface SearchResult {
  id: string;
  name: string;
  type: 'loan' | 'customer' | 'application';
  status: string;
  assignedTo?: string;
  flag?: string;
}

interface UniversalSearchProps {
  isOpen: boolean;
  onClose: () => void;
  userRole: string;
}

const mockResults: SearchResult[] = [
  { id: 'LN-10234', name: 'Raj Kumar', type: 'loan', status: 'Active', assignedTo: 'Rajesh K.', flag: 'risk' },
  { id: 'LN-10456', name: 'Priya Singh', type: 'loan', status: 'Overdue', assignedTo: 'Rajesh K.' },
  { id: 'CU-5678', name: 'Amit Patel', type: 'customer', status: 'Active' },
  { id: 'AP-3421', name: 'Sunita Devi', type: 'application', status: 'Pending', assignedTo: 'Rajesh K.' },
  { id: 'LN-10789', name: 'Vikram Reddy', type: 'loan', status: 'Active', assignedTo: 'Neha M.' },
];

export function UniversalSearch({ isOpen, onClose, userRole }: UniversalSearchProps) {
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'loans' | 'customers' | 'applications' | 'dashboard'>('loans');
  const [results, setResults] = useState<SearchResult[]>(mockResults);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setResults(mockResults);
      setActiveTab(userRole === 'MD' ? 'dashboard' : 'loans');
    }
  }, [isOpen, userRole]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (!isOpen) {
          // Parent should handle opening
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const tabs = userRole === 'MD' 
    ? ['dashboard', 'loans', 'customers'] 
    : ['loans', 'customers', 'applications'];

  const filteredResults = results.filter(r => {
    if (activeTab === 'dashboard') return true;
    return r.type === activeTab.slice(0, -1);
  });

  return (
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center pt-20"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-[640px] bg-white rounded-xl overflow-hidden"
        style={{ boxShadow: '0 25px 50px rgba(0,0,0,0.25)', maxHeight: '70vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-[#E5E7EB]">
          <div className="flex items-center gap-3">
            <Search className="w-5 h-5 text-[#6B7280]" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search loans, customers, PAN..."
              className="flex-1 text-sm outline-none"
              autoFocus
            />
            <button onClick={onClose} className="p-1 text-[#6B7280] hover:text-[#111827]">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex border-b border-[#E5E7EB]">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`flex-1 px-4 py-3 text-sm font-medium capitalize transition-colors ${
                activeTab === tab
                  ? 'text-[#2563EB] border-b-2 border-[#2563EB]'
                  : 'text-[#6B7280] hover:text-[#111827]'
              }`}
            >
              {tab === 'dashboard' ? 'Dashboard View' : tab}
            </button>
          ))}
        </div>

        <div className="overflow-y-auto" style={{ maxHeight: 'calc(70vh - 140px)' }}>
          {activeTab === 'dashboard' && userRole === 'MD' ? (
            <div className="p-4 space-y-4">
              <p className="text-sm text-[#6B7280]">
                Try: "overdue business loans above 10L in Rajasthan"
              </p>
              <div className="grid grid-cols-4 gap-3">
                <div className="p-3 bg-[#F9FAFB] rounded-lg border border-[#E5E7EB]">
                  <p className="text-xs text-[#6B7280]">Matching</p>
                  <p className="text-xl font-bold text-[#111827]">23</p>
                </div>
                <div className="p-3 bg-[#F9FAFB] rounded-lg border border-[#E5E7EB]">
                  <p className="text-xs text-[#6B7280]">Total</p>
                  <p className="text-xl font-bold text-[#111827]">₹3.4Cr</p>
                </div>
                <div className="p-3 bg-[#F9FAFB] rounded-lg border border-[#E5E7EB]">
                  <p className="text-xs text-[#6B7280]">Avg DPD</p>
                  <p className="text-xl font-bold text-[#F59E0B]">47</p>
                </div>
                <div className="p-3 bg-[#F9FAFB] rounded-lg border border-[#E5E7EB]">
                  <p className="text-xs text-[#6B7280]">NPA Risk</p>
                  <p className="text-xl font-bold text-[#DC2626]">8</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="px-4 py-2 text-sm font-medium bg-[#2563EB] text-white rounded-lg hover:bg-[#1D4ED8]">
                  Save as Dashboard View
                </button>
                <button className="px-4 py-2 text-sm font-medium border border-[#E5E7EB] text-[#111827] rounded-lg hover:bg-[#F9FAFB]">
                  Export
                </button>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-[#E5E7EB]">
              {filteredResults.length > 0 ? (
                filteredResults.slice(0, 8).map((result) => (
                  <button
                    key={result.id}
                    className="w-full px-4 py-3 flex items-center gap-3 hover:bg-[#F9FAFB] text-left"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-[#111827]">{result.name}</span>
                        <span className="text-xs text-[#6B7280]">{result.id}</span>
                        {result.flag && (
                          <span className="px-2 py-0.5 text-xs font-medium bg-[#FEE2E2] text-[#991B1B] rounded-full">
                            {result.flag}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#6B7280] mt-0.5">
                        {result.status}
                        {result.assignedTo && ` • ${result.assignedTo}`}
                      </p>
                    </div>
                  </button>
                ))
              ) : (
                <div className="p-8 text-center text-sm text-[#6B7280]">
                  No results found
                </div>
              )}
            </div>
          )}
        </div>

        <div className="px-4 py-3 border-t border-[#E5E7EB] bg-[#F9FAFB]">
          <p className="text-xs text-[#6B7280] text-center">
            Press <kbd className="px-1.5 py-0.5 bg-white border border-[#E5E7EB] rounded text-xs">Enter</kbd> to select · <kbd className="px-1.5 py-0.5 bg-white border border-[#E5E7EB] rounded text-xs">Esc</kbd> to close
          </p>
        </div>
      </div>
    </div>
  );
}

