// @ts-nocheck
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { LoanApplicationDetail, MoratoriumRequestListItem } from '../../../apis/types';
import { moratoriumRequestsApi } from '../../../apis/moratoriumRequests';
import { DataTable } from '../shared/DataTable';
import {
  MORATORIUM_STATUS_LABELS,
  MORATORIUM_TYPE_LABELS,
} from '../../../constants/moratoriumRequestFields';

type LoanApplicationMoratoriumRequestsPanelProps = {
  loanApplicationEid: string;
  application: LoanApplicationDetail;
  requests: MoratoriumRequestListItem[];
  loading: boolean;
  error: string | null;
  onReload: () => Promise<void>;
};

function formatDateTime(value: string | undefined | null): string {
  if (!value) return '—';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }
  return parsed.toLocaleString();
}

export function LoanApplicationMoratoriumRequestsPanel({
  loanApplicationEid,
  application,
  requests,
  loading,
  error,
  onReload,
}: LoanApplicationMoratoriumRequestsPanelProps) {
  const navigate = useNavigate();
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const handleStatusAction = async (
    item: MoratoriumRequestListItem,
    status: 'approve' | 'reject',
  ) => {
    setActionLoadingId(item.id);
    setActionError(null);
    try {
      await moratoriumRequestsApi.changeStatus(
        loanApplicationEid,
        item.moratorium_request_eid,
        { status },
      );
      await onReload();
    } catch (err: any) {
      setActionError(err?.message || 'Failed to update moratorium request status');
    } finally {
      setActionLoadingId(null);
    }
  };

  if (error) {
    return (
      <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
        {error}
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {actionError && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {actionError}
        </p>
      )}
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-[#6B7280]">
          Max moratorium allowed: {application.max_moratorium_period_in_days ?? 0} days
        </p>
        <button
          type="button"
          onClick={() =>
            navigate(`/app/loans/${loanApplicationEid}/moratorium-requests/new`)
          }
          className="px-4 py-2 text-sm font-medium text-white bg-[#2563EB] rounded-lg hover:bg-[#1D4ED8]"
        >
          New moratorium request
        </button>
      </div>

      <DataTable
        columns={[
          {
            key: 'moratorium_request_eid',
            label: 'Request ID',
            render: (item) => (
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  navigate(
                    `/app/loans/${loanApplicationEid}/moratorium-requests/${item.moratorium_request_eid}`,
                  );
                }}
                className="font-mono text-xs text-[#2563EB] hover:underline"
              >
                {item.moratorium_request_eid.slice(0, 8)}…
              </button>
            ),
          },
          {
            key: 'moratorium_type',
            label: 'Type',
            render: (item) => MORATORIUM_TYPE_LABELS[item.moratorium_type] || item.moratorium_type,
          },
          {
            key: 'moratorium_period_in_days',
            label: 'Period (days)',
          },
          {
            key: 'moratorium_start_date',
            label: 'Start date',
            render: (item) => formatDateTime(item.moratorium_start_date),
          },
          {
            key: 'status',
            label: 'Status',
            render: (item) => MORATORIUM_STATUS_LABELS[item.status] || item.status,
          },
          {
            key: 'actions',
            label: 'Actions',
            render: (item) => (
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    navigate(
                      `/app/loans/${loanApplicationEid}/moratorium-requests/${item.moratorium_request_eid}`,
                    );
                  }}
                  className="text-sm text-[#2563EB] hover:underline"
                >
                  View
                </button>
                {item.status === 'verification_pending' && (
                  <>
                    <button
                      type="button"
                      disabled={actionLoadingId === item.id}
                      onClick={(event) => {
                        event.stopPropagation();
                        handleStatusAction(item, 'approve');
                      }}
                      className="text-sm text-emerald-600 hover:underline disabled:opacity-50"
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      disabled={actionLoadingId === item.id}
                      onClick={(event) => {
                        event.stopPropagation();
                        handleStatusAction(item, 'reject');
                      }}
                      className="text-sm text-red-600 hover:underline disabled:opacity-50"
                    >
                      Reject
                    </button>
                  </>
                )}
              </div>
            ),
          },
        ]}
        data={requests}
        loading={loading}
        totalRecords={requests.length}
        rowKey={(item) => item.id}
        emptyMessage="No moratorium requests"
      />
    </div>
  );
}
