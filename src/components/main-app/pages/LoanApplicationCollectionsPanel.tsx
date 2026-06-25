// @ts-nocheck
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { LoanCollection, LoanApplicationDetail } from '../../../apis/types';
import { loanCollectionsApi } from '../../../apis/loanCollections';
import { DataTable } from '../shared/DataTable';
import { StatusBadge } from '../shared/StatusBadge';

type LoanApplicationCollectionsPanelProps = {
  loanApplicationEid: string;
  application: LoanApplicationDetail;
  collections: LoanCollection[];
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

function formatMoney(value: number | string | undefined): string {
  const num = Number(value);
  if (Number.isNaN(num)) {
    return '—';
  }
  return `₹${num.toLocaleString()}`;
}

export function LoanApplicationCollectionsPanel({
  loanApplicationEid,
  collections,
  loading,
  error,
  onReload,
}: LoanApplicationCollectionsPanelProps) {
  const navigate = useNavigate();
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const handleStatusAction = async (
    item: LoanCollection,
    action: 'approve' | 'reject',
  ) => {
    setActionLoadingId(item.id);
    setActionError(null);
    try {
      if (action === 'approve') {
        await loanCollectionsApi.approve(loanApplicationEid, item.id);
      } else {
        await loanCollectionsApi.reject(loanApplicationEid, item.id);
      }
      await onReload();
    } catch (err: any) {
      setActionError(err?.message || `Failed to ${action} collection`);
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
      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() =>
            navigate(`/app/loans/${loanApplicationEid}/collections/new`)
          }
          className="px-4 py-2 text-sm font-medium text-white bg-[#2563EB] rounded-lg hover:bg-[#1D4ED8]"
        >
          New collection
        </button>
      </div>

      <DataTable
        columns={[
          { key: 'id', label: 'ID' },
          {
            key: 'amount',
            label: 'Amount',
            render: (item) => formatMoney(item.amount),
          },
          {
            key: 'collection_datetime',
            label: 'Date',
            render: (item) => formatDateTime(item.collection_datetime),
          },
          {
            key: 'collection_status',
            label: 'Status',
            render: (item) => <StatusBadge status={item.collection_status} label={item.collection_status} />,
          },
          { key: 'payment_mode', label: 'Payment mode' },
          {
            key: 'utr',
            label: 'UTR',
            render: (item) => item.utr || '—',
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
                      `/app/loans/${loanApplicationEid}/collections/${item.id}`,
                    );
                  }}
                  className="text-sm text-[#2563EB] hover:underline"
                >
                  View
                </button>
                {item.collection_status === 'draft' && (
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
        data={collections}
        loading={loading}
        page={page}
        totalRecords={collections.length}
        onPageChange={setPage}
        rowKey={(item) => item.id}
        emptyMessage="No collections"
      />
    </div>
  );
}
