// @ts-nocheck
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowLeftIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { useNavigate, useParams } from 'react-router-dom';
import { loanApplicationsApi } from '../../../apis/loanApplications';
import { loanCollectionsApi } from '../../../apis/loanCollections';
import type { LoanApplicationDetail, LoanCollection, PaymentMode } from '../../../apis/types';
import { combineDateAndTime, splitDatetimeValue } from '../../../utils/dateTime';
import { PageShell } from '../shared/PageShell';
import { FormField, FormInput, FormSelect } from '../shared/FormModal';
import { StatusBadge } from '../shared/StatusBadge';
import { KeyValueGrid } from '../shared/KeyValueGrid';

const PAYMENT_MODE_OPTIONS: { value: PaymentMode; label: string }[] = [
  { value: 'UPI', label: 'UPI' },
  { value: 'NEFT', label: 'NEFT' },
  { value: 'RTGS', label: 'RTGS' },
  { value: 'CHEQUE', label: 'Cheque' },
  { value: 'CASH', label: 'Cash' },
];

function buildBreadcrumbs(loanApplicationEid: string, navigate: ReturnType<typeof useNavigate>) {
  return [
    {
      label: 'Loan Application',
      onClick: () => navigate(`/app/loans/${loanApplicationEid}`),
    },
    { label: 'Collection Detail' },
  ];
}

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

export function LoanCollectionDetailPage() {
  const navigate = useNavigate();
  const { eid, collectionId } = useParams<{ eid: string; collectionId: string }>();
  const [application, setApplication] = useState<LoanApplicationDetail | null>(null);
  const [collection, setCollection] = useState<LoanCollection | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [pageError, setPageError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    amount: '',
    collection_date: '',
    collection_time: '',
    payment_mode: '' as PaymentMode | '',
    utr: '',
  });

  const loadApplication = useCallback(async () => {
    if (!eid) {
      setPageError('Invalid loan application id.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setPageError(null);
    try {
      const detail = await loanApplicationsApi.get(eid);
      setApplication(detail);
    } catch (err: any) {
      setPageError(err.message || 'Failed to load loan application');
    }
  }, [eid]);

  const loadCollection = useCallback(async () => {
    if (!eid || !collectionId) return;
    try {
      const data = await loanCollectionsApi.get(eid, Number(collectionId));
      setCollection(data);
      setEditForm({
        amount: String(data.amount ?? ''),
        ...splitDatetimeValue(data.collection_datetime),
        payment_mode: (data.payment_mode as PaymentMode) || '',
        utr: data.utr || '',
      });
    } catch (err: any) {
      setPageError(err?.message || 'Failed to load collection');
    }
  }, [eid, collectionId]);

  useEffect(() => {
    async function load() {
      await loadApplication();
      await loadCollection();
      setLoading(false);
    }
    load();
  }, [loadApplication, loadCollection]);

  const canEdit = useMemo(
    () => collection?.collection_status === 'draft',
    [collection],
  );

  const detailGroups = useMemo(
    () =>
      collection
        ? [
            {
              title: 'Collection Details',
              fields: [
                { label: 'ID', value: String(collection.id) },
                { label: 'Amount', value: formatMoney(collection.amount) },
                {
                  label: 'Collection Date',
                  value: formatDateTime(collection.collection_datetime),
                },
                {
                  label: 'Status',
                  value: <StatusBadge status={collection.collection_status} label={collection.collection_status} />,
                },
                { label: 'Payment Mode', value: collection.payment_mode },
                { label: 'UTR', value: collection.utr || '—' },
                {
                  label: 'Created',
                  value: formatDateTime(collection.created_at),
                },
                {
                  label: 'Updated',
                  value: formatDateTime(collection.updated_at),
                },
              ],
            },
          ]
        : [],
    [collection],
  );

  const handleStatusAction = async (action: 'approve' | 'reject') => {
    if (!eid || !collection) return;
    setActionLoading(true);
    setActionError(null);
    setActionSuccess(null);
    try {
      if (action === 'approve') {
        await loanCollectionsApi.approve(eid, collection.id);
        setActionSuccess('Collection approved successfully.');
      } else {
        await loanCollectionsApi.reject(eid, collection.id);
        setActionSuccess('Collection rejected successfully.');
      }
      await loadCollection();
    } catch (err: any) {
      setActionError(err?.message || `Failed to ${action} collection`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!eid || !collection) return;

    const amount = Number(editForm.amount);
    if (!amount || amount <= 0) {
      setActionError('Amount must be greater than 0.');
      return;
    }
    if (!editForm.collection_date) {
      setActionError('Collection date is required.');
      return;
    }
    const collectionDatetime = combineDateAndTime(
      editForm.collection_date,
      editForm.collection_time,
    );
    if (!collectionDatetime) {
      setActionError('Collection date and time are invalid.');
      return;
    }
    if (!editForm.payment_mode) {
      setActionError('Payment mode is required.');
      return;
    }

    setEditLoading(true);
    setActionError(null);
    setActionSuccess(null);
    try {
      await loanCollectionsApi.update(eid, collection.id, {
        amount,
        collection_datetime: collectionDatetime,
        payment_mode: editForm.payment_mode,
        utr: editForm.utr || null,
      });
      setActionSuccess('Collection updated successfully.');
      setIsEditing(false);
      await loadCollection();
    } catch (err: any) {
      setActionError(err?.message || 'Failed to update collection');
    } finally {
      setEditLoading(false);
    }
  };

  if (loading) {
    return (
      <PageShell title="Collection">
        <div className="flex items-center justify-center h-40 text-[#6B7280]">
          <ArrowPathIcon className="w-5 h-5 animate-spin mr-2" />
          Loading…
        </div>
      </PageShell>
    );
  }

  if (pageError || !application || !collection) {
    return (
      <PageShell title="Collection">
        <p className="text-sm text-red-600">{pageError || 'Collection not found.'}</p>
        <button
          onClick={() => navigate(`/app/loans/${eid}`)}
          className="mt-4 text-sm text-[#2563EB] hover:underline"
        >
          Back
        </button>
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Collection Detail"
      breadcrumbs={buildBreadcrumbs(eid, navigate)}
    >
      {actionError && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-4">
          {actionError}
        </p>
      )}
      {actionSuccess && (
        <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 mb-4">
          {actionSuccess}
        </p>
      )}

      <div className="space-y-6 max-w-2xl">
        {isEditing ? (
          <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 shadow-sm space-y-5">
            <h2 className="text-lg font-semibold text-[#111827]">Edit Collection</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Amount" required>
                <FormInput
                  type="number"
                  value={editForm.amount}
                  onChange={(v) => setEditForm((prev) => ({ ...prev, amount: v }))}
                />
              </FormField>

              <FormField label="Collection Date" required>
                <FormInput
                  type="date"
                  value={editForm.collection_date}
                  onChange={(v) => setEditForm((prev) => ({ ...prev, collection_date: v }))}
                />
              </FormField>

              <FormField label="Collection Time" required>
                <FormInput
                  type="time"
                  step={1}
                  value={editForm.collection_time}
                  onChange={(v) => setEditForm((prev) => ({ ...prev, collection_time: v }))}
                />
              </FormField>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Payment Mode" required>
                <FormSelect
                  value={editForm.payment_mode}
                  onChange={(v) => setEditForm((prev) => ({ ...prev, payment_mode: v as PaymentMode }))}
                  options={PAYMENT_MODE_OPTIONS}
                  placeholder="Select payment mode"
                />
              </FormField>

              <FormField label="UTR">
                <FormInput
                  type="text"
                  value={editForm.utr}
                  onChange={(v) => setEditForm((prev) => ({ ...prev, utr: v }))}
                />
              </FormField>
            </div>

            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 text-sm font-medium text-[#374151] border border-[#E5E7EB] rounded-lg hover:bg-[#F9FAFB]"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                disabled={editLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-[#2563EB] rounded-lg hover:bg-[#1D4ED8] disabled:opacity-50"
              >
                {editLoading ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-[#111827]">Collection Details</h2>
              {canEdit && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-3 py-1.5 text-sm font-medium text-[#374151] border border-[#E5E7EB] rounded-lg hover:bg-[#F9FAFB]"
                >
                  Edit
                </button>
              )}
            </div>
            <KeyValueGrid groups={detailGroups} />
          </div>
        )}

        <div className="flex items-center justify-between gap-3">
          <button
            onClick={() => navigate(`/app/loans/${eid}`)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#374151] border border-[#E5E7EB] rounded-lg hover:bg-[#F9FAFB]"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Back
          </button>

          {canEdit && !isEditing && (
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleStatusAction('reject')}
                disabled={actionLoading}
                className="px-4 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 disabled:opacity-50"
              >
                {actionLoading ? 'Processing…' : 'Reject'}
              </button>
              <button
                onClick={() => handleStatusAction('approve')}
                disabled={actionLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50"
              >
                {actionLoading ? 'Processing…' : 'Approve'}
              </button>
            </div>
          )}
        </div>
      </div>
    </PageShell>
  );
}
