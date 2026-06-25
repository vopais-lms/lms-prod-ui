// @ts-nocheck
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { disbursementRequestsApi } from '../../../apis/disbursementRequests';
import type { DisbursementRequestListItem, LoanApplicationDetail } from '../../../apis/types';
import { DISBURSEMENT_REQUEST_STATUS_LABELS } from '../../../constants/disbursementRequestFields';
import { isoDateFromValue, amortizationStrategyLabel, todayIsoDate } from '../../../constants/loanDisbursementFields';
import { DataTable } from '../shared/DataTable';
import { FormField, FormInput, FormModal } from '../shared/FormModal';

type LoanApplicationDisbursementRequestsPanelProps = {
  loanApplicationEid: string;
  application: LoanApplicationDetail;
  requests: DisbursementRequestListItem[];
  loading: boolean;
  error: string | null;
  onReload: () => Promise<void>;
};

function formatMoney(value: number | string | undefined): string {
  const num = Number(value);
  if (Number.isNaN(num)) {
    return '—';
  }
  return `₹${num.toLocaleString()}`;
}

function formatDateTime(value: string | undefined | null): string {
  if (!value) return '—';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }
  return parsed.toLocaleString();
}

export function LoanApplicationDisbursementRequestsPanel({
  loanApplicationEid,
  application,
  requests,
  loading,
  error,
  onReload,
}: LoanApplicationDisbursementRequestsPanelProps) {
  const navigate = useNavigate();
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<DisbursementRequestListItem | null>(
    null,
  );
  const [disbursementDueDate, setDisbursementDueDate] = useState(todayIsoDate());

  const canCreate = application.is_single_disbursement === false;

  const openApproveModal = (item: DisbursementRequestListItem) => {
    setSelectedRequest(item);
    setDisbursementDueDate(todayIsoDate());
    setActionError(null);
    setApproveModalOpen(true);
  };

  const closeApproveModal = () => {
    if (actionLoadingId !== null) return;
    setApproveModalOpen(false);
    setSelectedRequest(null);
  };

  const handleStatusAction = async (
    item: DisbursementRequestListItem,
    status: 'approve' | 'reject',
    dueDate?: string,
  ) => {
    setActionLoadingId(item.id);
    setActionError(null);
    try {
      await disbursementRequestsApi.changeStatus(
        loanApplicationEid,
        item.disbursement_request_eid,
        {
          status,
          ...(status === 'approve' ? { disbursement_due_date: dueDate } : {}),
        },
      );
      if (status === 'approve') {
        setApproveModalOpen(false);
        setSelectedRequest(null);
      }
      await onReload();
    } catch (err: any) {
      setActionError(err?.message || 'Failed to update disbursement request status');
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

  const principal = Number(application.principal_disbursement_amount ?? 0);
  const alreadyDisbursed = Number(application.amount_disbursed ?? 0);
  const remaining = Math.max(principal - alreadyDisbursed, 0);

  return (
    <div className="space-y-4">
      {actionError && !approveModalOpen && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {actionError}
        </p>
      )}
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-[#6B7280]">
          Remaining principal: {formatMoney(remaining)}
        </p>
        {canCreate && (
          <button
            type="button"
            onClick={() =>
              navigate(`/app/loans/${loanApplicationEid}/disbursement-requests/new`)
            }
            className="px-4 py-2 text-sm font-medium text-white bg-[#2563EB] rounded-lg hover:bg-[#1D4ED8]"
          >
            New disbursement request
          </button>
        )}
      </div>

      <DataTable
        columns={[
          {
            key: 'disbursement_request_eid',
            label: 'Request ID',
            render: (item) => (
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  navigate(
                    `/app/loans/${loanApplicationEid}/disbursement-requests/${item.disbursement_request_eid}`,
                  );
                }}
                className="font-mono text-xs text-[#2563EB] hover:underline"
              >
                {item.disbursement_request_eid.slice(0, 8)}…
              </button>
            ),
          },
          {
            key: 'disbursement_amount',
            label: 'Amount',
            render: (item) => formatMoney(item.disbursement_amount),
          },
          {
            key: 'amortization_type',
            label: 'Strategy',
            render: (item) => amortizationStrategyLabel(item.amortization_type),
          },
          {
            key: 'status',
            label: 'Status',
            render: (item) =>
              DISBURSEMENT_REQUEST_STATUS_LABELS[item.status] || item.status,
          },
          {
            key: 'created_at',
            label: 'Created',
            render: (item) => formatDateTime(item.created_at),
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
                      `/app/loans/${loanApplicationEid}/disbursement-requests/${item.disbursement_request_eid}`,
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
                        openApproveModal(item);
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
        emptyMessage="No disbursement requests"
      />

      <FormModal
        isOpen={approveModalOpen}
        onClose={closeApproveModal}
        title="Approve disbursement request"
        submitLabel="Approve"
        loading={actionLoadingId !== null}
        error={actionError}
        onSubmit={() => {
          if (!selectedRequest) return;
          if (!disbursementDueDate) {
            setActionError('Disbursement due date is required.');
            return;
          }
          handleStatusAction(selectedRequest, 'approve', disbursementDueDate);
        }}
      >
        {selectedRequest && (
          <div className="space-y-4">
            <p className="text-sm text-[#6B7280]">
              Request {selectedRequest.disbursement_request_eid.slice(0, 8)}… —{' '}
              {formatMoney(selectedRequest.disbursement_amount)}
            </p>
            <p className="text-sm text-[#6B7280]">
              Repayment strategy:{' '}
              {amortizationStrategyLabel(selectedRequest.amortization_type)}
            </p>
            <FormField label="Disbursement due date" required>
              <FormInput
                type="date"
                value={disbursementDueDate}
                onChange={setDisbursementDueDate}
              />
            </FormField>
          </div>
        )}
      </FormModal>
    </div>
  );
}
