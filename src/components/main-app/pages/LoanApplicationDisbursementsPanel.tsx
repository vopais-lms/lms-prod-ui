// @ts-nocheck
import { useState } from 'react';
import { loanApplicationsApi } from '../../../apis/loanApplications';
import type { LoanApplicationDetail, LoanDisbursement } from '../../../apis/types';
import {
  LOAN_AMORTIZATION_STRATEGY_OPTIONS,
  LOAN_DISBURSEMENT_STATUS_LABELS,
  amortizationStrategyLabel,
  isoDateFromValue,
  todayIsoDate,
} from '../../../constants/loanDisbursementFields';
import { DataTable } from '../shared/DataTable';
import { FormField, FormInput, FormModal, FormSelect } from '../shared/FormModal';

type LoanApplicationDisbursementsPanelProps = {
  loanApplicationEid: string;
  application: LoanApplicationDetail;
  disbursements: LoanDisbursement[];
  loading: boolean;
  error: string | null;
  onReload: () => Promise<void>;
  onApplicationReload?: () => Promise<void>;
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

export function LoanApplicationDisbursementsPanel({
  loanApplicationEid,
  application,
  disbursements,
  loading,
  error,
  onReload,
  onApplicationReload,
}: LoanApplicationDisbursementsPanelProps) {
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDisbursement, setSelectedDisbursement] = useState<LoanDisbursement | null>(
    null,
  );
  const [strategy, setStrategy] = useState('keep_tenured_fixed');
  const [disbursementDueDate, setDisbursementDueDate] = useState(todayIsoDate());

  const showActions = application.is_single_disbursement === false;

  const openStartModal = (item: LoanDisbursement) => {
    setSelectedDisbursement(item);
    setStrategy(item.amortization_type || 'keep_tenured_fixed');
    setDisbursementDueDate(isoDateFromValue(item.disbursement_due_date));
    setActionError(null);
    setModalOpen(true);
  };

  const closeModal = () => {
    if (actionLoadingId !== null) return;
    setModalOpen(false);
    setSelectedDisbursement(null);
  };

  const handleStartDisbursement = async () => {
    if (!selectedDisbursement) return;

    if (!disbursementDueDate) {
      setActionError('Disbursement due date is required.');
      return;
    }

    setActionLoadingId(selectedDisbursement.id);
    setActionError(null);
    try {
      await loanApplicationsApi.disburseLoan(loanApplicationEid, selectedDisbursement.id, {
        loan_amortization_strategy: strategy,
        disbursement_due_date: disbursementDueDate,
      });
      setModalOpen(false);
      setSelectedDisbursement(null);
      await onReload();
      if (onApplicationReload) {
        await onApplicationReload();
      }
    } catch (err: any) {
      setActionError(err?.message || 'Failed to start disbursement');
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
      {actionError && !modalOpen && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {actionError}
        </p>
      )}

      {showActions && (
        <p className="text-sm text-[#6B7280]">
          Start disbursement on pending rows after a disbursement request is approved. Set the
          disbursement date and choose how repayment should be recalculated.
        </p>
      )}

      <DataTable
        columns={[
          { key: 'id', label: 'ID' },
          {
            key: 'disbursement_amount',
            label: 'Amount',
            render: (item) => formatMoney(item.disbursement_amount),
          },
          {
            key: 'disbursement_due_date',
            label: 'Due date',
            render: (item) => formatDateTime(item.disbursement_due_date),
          },
          {
            key: 'amortization_type',
            label: 'Strategy',
            render: (item) => amortizationStrategyLabel(item.amortization_type),
          },
          {
            key: 'status',
            label: 'Status',
            render: (item) => LOAN_DISBURSEMENT_STATUS_LABELS[item.status] || item.status,
          },
          {
            key: 'loan_disbursement_external_txn_id',
            label: 'External txn ID',
            render: (item) => item.loan_disbursement_external_txn_id || '—',
          },
          {
            key: 'description',
            label: 'Description',
            render: (item) => item.description || '—',
          },
          ...(showActions
            ? [
                {
                  key: 'actions',
                  label: 'Actions',
                  render: (item) =>
                    item.status === 'disbursement_pending' ? (
                      <button
                        type="button"
                        disabled={actionLoadingId === item.id}
                        onClick={(event) => {
                          event.stopPropagation();
                          openStartModal(item);
                        }}
                        className="text-sm text-emerald-600 hover:underline disabled:opacity-50"
                      >
                        Start disbursement
                      </button>
                    ) : (
                      '—'
                    ),
                },
              ]
            : []),
        ]}
        data={disbursements}
        loading={loading}
        totalRecords={disbursements.length}
        rowKey={(item) => item.id}
        emptyMessage="No disbursements"
      />

      <FormModal
        isOpen={modalOpen}
        onClose={closeModal}
        title="Start disbursement"
        submitLabel="Start disbursement"
        loading={actionLoadingId !== null}
        error={actionError}
        onSubmit={handleStartDisbursement}
      >
        {selectedDisbursement && (
          <div className="space-y-4">
            <p className="text-sm text-[#6B7280]">
              Disbursement #{selectedDisbursement.id} —{' '}
              {formatMoney(selectedDisbursement.disbursement_amount)}
            </p>
            <FormField label="Disbursement due date" required>
              <FormInput
                type="date"
                value={disbursementDueDate}
                onChange={setDisbursementDueDate}
              />
            </FormField>
            <FormField label="Disbursement strategy" required>
              <FormSelect
                value={strategy}
                onChange={setStrategy}
                options={[...LOAN_AMORTIZATION_STRATEGY_OPTIONS]}
              />
            </FormField>
          </div>
        )}
      </FormModal>
    </div>
  );
}
