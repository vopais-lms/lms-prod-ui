// @ts-nocheck
import { useCallback, useEffect, useState } from 'react';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { loanApplicationsApi } from '../../../apis/loanApplications';
import { loanTypesApi } from '../../../apis/loanTypes';
import type { LoanApplication, LoanType, RepaymentSchedule } from '../../../apis/types';
import { DataTable } from '../shared/DataTable';
import { PageShell } from '../shared/PageShell';
import { StatusBadge } from '../shared/StatusBadge';
import { repaymentScheduleTableColumns } from '../shared/repaymentScheduleColumns';

const LOAN_APPLICATION_STATUS_LABELS: Record<string, string> = {
  inactive: 'Inactive',
  initiated: 'Initiated',
  submitted: 'Submitted',
  approval_pending: 'Approval Pending',
  approved: 'Approved',
  rejected: 'Rejected',
  start_disbursement: 'Start Disbursement',
};

function loanApplicationStatusBadge(status: string) {
  switch (status) {
    case 'approved':
    case 'start_disbursement':
      return <StatusBadge status="active" label={LOAN_APPLICATION_STATUS_LABELS[status]} />;
    case 'rejected':
      return <StatusBadge status="error" label="Rejected" />;
    case 'inactive':
      return <StatusBadge status="inactive" label="Inactive" />;
    default:
      return (
        <StatusBadge
          status="pending"
          label={LOAN_APPLICATION_STATUS_LABELS[status] || status}
        />
      );
  }
}

export function RepaymentsPage() {
  const [selectedLoan, setSelectedLoan] = useState<LoanApplication | null>(null);

  const [applications, setApplications] = useState<LoanApplication[]>([]);
  const [loanTypes, setLoanTypes] = useState<Record<number, string>>({});
  const [loansLoading, setLoansLoading] = useState(true);
  const [loansPage, setLoansPage] = useState(1);
  const [loansTotalRecords, setLoansTotalRecords] = useState(0);
  const [loansError, setLoansError] = useState<string | null>(null);

  const [schedules, setSchedules] = useState<RepaymentSchedule[]>([]);
  const [schedulesLoading, setSchedulesLoading] = useState(false);
  const [schedulesPage, setSchedulesPage] = useState(1);
  const [schedulesTotalRecords, setSchedulesTotalRecords] = useState(0);
  const [schedulesError, setSchedulesError] = useState<string | null>(null);

  const fetchApplications = useCallback(async () => {
    setLoansLoading(true);
    setLoansError(null);
    try {
      const res = await loanApplicationsApi.list({ page: loansPage, per_page: 10 });
      setApplications(res.data);
      setLoansTotalRecords(res.total_records);
    } catch (err: any) {
      setLoansError(err.message || 'Failed to load loan applications');
    } finally {
      setLoansLoading(false);
    }
  }, [loansPage]);

  const fetchRepaymentSchedules = useCallback(async () => {
    if (!selectedLoan) {
      return;
    }

    setSchedulesLoading(true);
    setSchedulesError(null);
    try {
      const res = await loanApplicationsApi.listRepaymentSchedules(selectedLoan.eid, {
        page: schedulesPage,
        per_page: 10,
      });
      setSchedules(res.data);
      setSchedulesTotalRecords(res.total_records);
    } catch (err: any) {
      setSchedulesError(err.message || 'Failed to load repayment schedule');
    } finally {
      setSchedulesLoading(false);
    }
  }, [selectedLoan, schedulesPage]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  useEffect(() => {
    const loadLoanTypes = async () => {
      try {
        const res = await loanTypesApi.list({ page: 1, per_page: 100 });
        const map: Record<number, string> = {};
        res.data.forEach((lt: LoanType) => {
          map[lt.id] = lt.name;
        });
        setLoanTypes(map);
      } catch (err) {
        console.error('Failed to load loan types', err);
      }
    };
    loadLoanTypes();
  }, []);

  useEffect(() => {
    if (selectedLoan) {
      fetchRepaymentSchedules();
    }
  }, [fetchRepaymentSchedules, selectedLoan]);

  const handleSelectLoan = (loan: LoanApplication) => {
    setSelectedLoan(loan);
    setSchedulesPage(1);
    setSchedules([]);
    setSchedulesError(null);
  };

  const handleBackToLoans = () => {
    setSelectedLoan(null);
    setSchedules([]);
    setSchedulesPage(1);
    setSchedulesError(null);
  };

  const loanColumns = [
    {
      key: 'eid',
      label: 'Application ID',
      render: (item: LoanApplication) => (
        <span className="font-mono text-xs text-[#374151]">{item.eid.slice(0, 8)}…</span>
      ),
    },
    {
      key: 'loan_type_id',
      label: 'Loan Type',
      render: (item: LoanApplication) => (
        <span>{loanTypes[item.loan_type_id] || `Type #${item.loan_type_id}`}</span>
      ),
    },
    {
      key: 'customer_eid',
      label: 'Customer',
      render: (item: LoanApplication) => (
        <span className="font-mono text-xs">{item.customer_eid.slice(0, 8)}…</span>
      ),
    },
    {
      key: 'principal_disbursement_amount',
      label: 'Principal',
      render: (item: LoanApplication) => (
        <span>₹{item.principal_disbursement_amount.toLocaleString()}</span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      className: 'w-40',
      render: (item: LoanApplication) => loanApplicationStatusBadge(item.status),
    },
    {
      key: 'created_at',
      label: 'Created',
      render: (item: LoanApplication) => (
        <span className="text-[#6B7280] text-sm">
          {new Date(item.created_at).toLocaleDateString()}
        </span>
      ),
    },
  ];

  if (selectedLoan) {
    return (
      <PageShell
        title="Repayment schedule"
        subtitle={`Loan ${selectedLoan.eid.slice(0, 8)}… · ${loanTypes[selectedLoan.loan_type_id] || 'Loan'}`}
        breadcrumbs={[
          { label: 'Repayments', onClick: handleBackToLoans },
          { label: 'Repayment schedule' },
        ]}
        actions={
          <button
            type="button"
            onClick={handleBackToLoans}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg border border-[#E5E7EB] text-[#374151] hover:bg-[#F9FAFB] transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Back to loans
          </button>
        }
      >
        {schedulesError && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {schedulesError}
          </p>
        )}

        <DataTable
          columns={repaymentScheduleTableColumns}
          data={schedules}
          loading={schedulesLoading}
          page={schedulesPage}
          perPage={10}
          totalRecords={schedulesTotalRecords}
          onPageChange={setSchedulesPage}
          serverSidePagination
          rowKey={(item) => item.id}
          emptyMessage="No repayment schedule entries for this loan"
        />
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Repayments"
      subtitle="Select a loan to view its repayment schedule"
    >
      {loansError && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-4">
          {loansError}
        </p>
      )}

      <DataTable
        columns={loanColumns}
        data={applications}
        loading={loansLoading}
        page={loansPage}
        perPage={10}
        totalRecords={loansTotalRecords}
        onPageChange={setLoansPage}
        serverSidePagination
        onRowClick={handleSelectLoan}
        rowKey={(item) => item.eid}
        emptyMessage="No loan applications found"
      />
    </PageShell>
  );
}
