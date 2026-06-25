// @ts-nocheck
import { useState, useEffect, useCallback, useMemo } from 'react';
import { ArrowPathIcon, PlusIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { PageShell } from '../shared/PageShell';
import { DataTable } from '../shared/DataTable';
import { FormField, FormModal, FormSelect } from '../shared/FormModal';
import { StatusBadge } from '../shared/StatusBadge';
import { loanApplicationsApi } from '../../../apis/loanApplications';
import { loanTypesApi } from '../../../apis/loanTypes';
import type { LoanApplication, LoanApplicationStatus, LoanType } from '../../../apis/types';

type ChangeStatusTarget = Extract<
  LoanApplicationStatus,
  'initiated' | 'submitted' | 'approval_pending' | 'approved' | 'rejected'
>;

const LOAN_APPLICATION_STATUS_LABELS: Record<LoanApplicationStatus, string> = {
  inactive: 'Inactive',
  initiated: 'Initiated',
  submitted: 'Submitted',
  approval_pending: 'Approval Pending',
  approved: 'Approved',
  rejected: 'Rejected',
  start_disbursement: 'Start Disbursement',
};

const ALLOWED_STATUS_TRANSITIONS: Record<LoanApplicationStatus, ChangeStatusTarget[]> = {
  inactive: ['initiated'],
  initiated: ['submitted'],
  submitted: ['approval_pending', 'approved', 'rejected'],
  approval_pending: ['approved', 'rejected'],
  approved: ['rejected'],
  rejected: ['approved', 'approval_pending'],
  start_disbursement: [],
};

function loanApplicationStatusBadge(status: LoanApplicationStatus) {
  switch (status) {
    case 'inactive':
      return <StatusBadge status="inactive" label="Inactive" />;
    case 'initiated':
      return <StatusBadge status="pending" label="Initiated" />;
    case 'submitted':
      return <StatusBadge status="pending" label="Submitted" />;
    case 'approval_pending':
      return <StatusBadge status="pending" label="Approval Pending" />;
    case 'approved':
      return <StatusBadge status="active" label="Approved" />;
    case 'rejected':
      return <StatusBadge status="error" label="Rejected" />;
    case 'start_disbursement':
      return <StatusBadge status="active" label="Disbursement" />;
    default:
      return <StatusBadge status="inactive" label={status} />;
  }
}

export function LoanApplicationsPage() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState<LoanApplication[]>([]);
  const [loanTypes, setLoanTypes] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [statusModalItem, setStatusModalItem] = useState<LoanApplication | null>(null);
  const [selectedNewStatus, setSelectedNewStatus] = useState<ChangeStatusTarget | ''>('');
  const [statusChangeLoading, setStatusChangeLoading] = useState(false);
  const [statusChangeError, setStatusChangeError] = useState<string | null>(null);
  const [disbursementLoadingEid, setDisbursementLoadingEid] = useState<string | null>(null);
  const [disbursementError, setDisbursementError] = useState<string | null>(null);

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await loanApplicationsApi.list({ page, per_page: 10 });
      setApplications(res.data);
      setTotalRecords(res.total_records);
    } catch (err) {
      console.error('Failed to load loan applications', err);
    } finally {
      setLoading(false);
    }
  }, [page]);

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

  const statusOptions = useMemo(() => {
    if (!statusModalItem) {
      return [];
    }
    return ALLOWED_STATUS_TRANSITIONS[statusModalItem.status].map((status) => ({
      value: status,
      label: LOAN_APPLICATION_STATUS_LABELS[status],
    }));
  }, [statusModalItem]);

  const openStatusModal = (item: LoanApplication) => {
    const options = ALLOWED_STATUS_TRANSITIONS[item.status];
    setStatusModalItem(item);
    setSelectedNewStatus(options[0] || '');
    setStatusChangeError(null);
  };

  const closeStatusModal = () => {
    setStatusModalItem(null);
    setSelectedNewStatus('');
    setStatusChangeError(null);
  };

  const handleStartDisbursement = async (item: LoanApplication) => {
    setDisbursementLoadingEid(item.eid);
    setDisbursementError(null);
    try {
      await loanApplicationsApi.startDisbursement(item.eid);
      await fetchApplications();
    } catch (err: any) {
      setDisbursementError(err.message || 'Failed to start disbursement');
    } finally {
      setDisbursementLoadingEid(null);
    }
  };

  const handleChangeStatus = async () => {
    if (!statusModalItem || !selectedNewStatus) {
      return;
    }

    setStatusChangeLoading(true);
    setStatusChangeError(null);
    try {
      await loanApplicationsApi.changeStatus(statusModalItem.eid, {
        new_status: selectedNewStatus,
      });
      closeStatusModal();
      await fetchApplications();
    } catch (err: any) {
      setStatusChangeError(err.message || 'Failed to change status');
    } finally {
      setStatusChangeLoading(false);
    }
  };

  const columns = [
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
    {
      key: 'actions',
      label: 'Actions',
      className: 'w-56',
      render: (item: LoanApplication) => {
        const canChangeStatus = ALLOWED_STATUS_TRANSITIONS[item.status].length > 0;
        const canStartDisbursement =
          item.status === 'approved' && item.is_single_disbursement !== false;
        const isStartingDisbursement = disbursementLoadingEid === item.eid;
        return (
          <div className="flex flex-col gap-1.5">
            {canStartDisbursement && (
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  handleStartDisbursement(item);
                }}
                disabled={isStartingDisbursement}
                className="px-2.5 py-1.5 text-xs font-medium rounded-lg text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isStartingDisbursement ? 'Starting…' : 'Start disbursement'}
              </button>
            )}
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                openStatusModal(item);
              }}
              disabled={!canChangeStatus}
              className="px-2.5 py-1.5 text-xs font-medium rounded-lg border border-[#E5E7EB] text-[#374151] hover:bg-[#F9FAFB] disabled:opacity-50 disabled:cursor-not-allowed"
              title={canChangeStatus ? 'Change loan application status' : 'No status changes available'}
            >
              Change status
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <PageShell
      title="Loan Applications"
      subtitle="Create and manage loan applications"
      actions={
        <button
          onClick={() => navigate('/app/loans/new')}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#2563EB] text-white text-sm font-medium rounded-lg hover:bg-[#1D4ED8] transition-colors"
        >
          <PlusIcon className="w-4 h-4" />
          New Application
        </button>
      }
    >
      {disbursementError && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-4">
          {disbursementError}
        </p>
      )}

      <DataTable
        columns={columns}
        data={applications}
        loading={loading}
        page={page}
        perPage={10}
        totalRecords={totalRecords}
        onPageChange={setPage}
        serverSidePagination
        onRowClick={(item) => navigate(`/app/loans/${item.eid}`)}
        rowKey={(item) => item.eid}
        emptyMessage="No loan applications found"
      />

      <FormModal
        isOpen={Boolean(statusModalItem)}
        onClose={closeStatusModal}
        title="Change loan application status"
        onSubmit={handleChangeStatus}
        submitLabel="Update status"
        loading={statusChangeLoading}
        error={statusChangeError}
      >
        {statusModalItem && (
          <div className="space-y-4">
            <p className="text-sm text-[#6B7280]">
              Application{' '}
              <span className="font-mono text-[#111827]">{statusModalItem.eid.slice(0, 8)}…</span>
            </p>
            <FormField label="Current status">
              <p className="text-sm font-medium text-[#111827]">
                {LOAN_APPLICATION_STATUS_LABELS[statusModalItem.status]}
              </p>
            </FormField>
            <FormField label="New status" required>
              <FormSelect
                value={selectedNewStatus}
                onChange={(value) => setSelectedNewStatus(value as ChangeStatusTarget)}
                options={statusOptions}
                placeholder="Select new status"
              />
            </FormField>
            {statusChangeLoading && (
              <p className="text-xs text-[#6B7280] flex items-center gap-1.5">
                <ArrowPathIcon className="w-3.5 h-3.5 animate-spin" />
                Updating status…
              </p>
            )}
          </div>
        )}
      </FormModal>
    </PageShell>
  );
}
