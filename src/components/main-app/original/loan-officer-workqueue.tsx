// @ts-nocheck
import React, { useState } from 'react';
import { KPICard } from './kpi-card';
import { AlertBanner } from './alert-banner';
import { FilterBar } from './filter-bar';
import type { FilterValues } from './filter-bar';
import { DataTable } from './data-table';
import type { LoanData } from './data-table';
import { DetailSlideOut } from './detail-slideout';

const mockLoans: LoanData[] = [
  {
    id: '1',
    loanId: 'LN-10234',
    customer: 'Raj Kumar',
    product: 'Business Loan',
    outstanding: '₹4.2L',
    dpd: 78,
    status: 'overdue',
    emi: '₹24,500',
    assignedTo: 'Rajesh K.',
    lastAction: '2 days ago',
    flags: ['risk', 'collection'],
  },
  {
    id: '2',
    loanId: 'LN-10456',
    customer: 'Priya Singh',
    product: 'Personal Loan',
    outstanding: '₹2.1L',
    dpd: 45,
    status: 'sma_1',
    emi: '₹12,800',
    assignedTo: 'Rajesh K.',
    lastAction: '1 day ago',
    flags: ['operational'],
  },
  {
    id: '3',
    loanId: 'LN-10567',
    customer: 'Amit Patel',
    product: 'Vehicle Loan',
    outstanding: '₹5.8L',
    dpd: 15,
    status: 'active',
    emi: '₹18,200',
    assignedTo: 'Rajesh K.',
    lastAction: '3 hours ago',
  },
  {
    id: '4',
    loanId: 'LN-10789',
    customer: 'Sunita Devi',
    product: 'Gold Loan',
    outstanding: '₹1.2L',
    dpd: 62,
    status: 'sma_2',
    emi: '₹8,500',
    assignedTo: 'Rajesh K.',
    lastAction: '5 days ago',
    flags: ['collection'],
  },
  {
    id: '5',
    loanId: 'LN-10890',
    customer: 'Vikram Reddy',
    product: 'Business Loan',
    outstanding: '₹8.5L',
    dpd: 8,
    status: 'active',
    emi: '₹32,000',
    assignedTo: 'Rajesh K.',
    lastAction: '1 hour ago',
  },
  {
    id: '6',
    loanId: 'LN-10912',
    customer: 'Neha Sharma',
    product: 'Personal Loan',
    outstanding: '₹3.2L',
    dpd: 92,
    status: 'npa',
    emi: '₹15,600',
    assignedTo: 'Rajesh K.',
    lastAction: '1 week ago',
    flags: ['risk'],
  },
];

export function LoanOfficerWorkQueue() {
  const [filters, setFilters] = useState<FilterValues>({
    product: 'All',
    status: 'All',
    dpd: 'All',
    branch: 'All',
    riskFlag: 'All',
    officer: 'All',
  });

  const [selectedLoan, setSelectedLoan] = useState<LoanData | null>(null);

  const handleReset = () => {
    setFilters({
      product: 'All',
      status: 'All',
      dpd: 'All',
      branch: 'All',
      riskFlag: 'All',
      officer: 'All',
    });
  };

  return (
    <div className="space-y-6">
      <AlertBanner
        tier="tier2"
        message="5 EMIs bounced today. 2 are repeat bouncers requiring immediate follow-up."
        actions={[
          { label: 'View Bounced', onClick: () => console.log('View') },
        ]}
        onSnooze={() => console.log('Snoozed')}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <KPICard
          label="MY PORTFOLIO"
          primaryMetric="₹4.8 Cr"
          secondaryMetric="42 loans"
          trend={{ value: '2% MoM', direction: 'up' }}
          actionLabel="View All"
        />
        <KPICard
          label="OVERDUE"
          primaryMetric="₹32 L"
          secondaryMetric="7 accounts"
          trend={{ value: '1 new', direction: 'up' }}
          danger
          actionLabel="View All"
        />
        <KPICard
          label="DUE TODAY"
          primaryMetric="₹8.4 L"
          secondaryMetric="12 EMIs"
          actionLabel="View List"
        />
        <KPICard
          label="PENDING ACTIONS"
          primaryMetric="8"
          secondaryMetric="3 urgent"
          actionLabel="View Actions"
        />
      </div>

      <FilterBar
        filters={filters}
        onFilterChange={setFilters}
        onReset={handleReset}
        onSaveView={() => console.log('Save view')}
        showBranch={false}
        showOfficer={false}
      />

      <DataTable
        data={mockLoans}
        onRowClick={(loan) => setSelectedLoan(loan)}
        onBulkAction={(ids, action) => console.log('Bulk action:', action, ids)}
      />

      <DetailSlideOut
        loan={selectedLoan}
        onClose={() => setSelectedLoan(null)}
      />
    </div>
  );
}

