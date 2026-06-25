// @ts-nocheck
import { useState, useEffect, useCallback } from 'react';
import { PlusIcon, PencilIcon, ArrowPathIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { PageShell } from '../shared/PageShell';
import { DataTable } from '../shared/DataTable';
import { FormModal, FormField, FormInput } from '../shared/FormModal';
import { StatusBadge } from '../shared/StatusBadge';
import { loanTypesApi } from '../../../apis/loanTypes';
import type { LoanType } from '../../../apis/types';

export function LoanTypesPage() {
  const navigate = useNavigate();
  const [loanTypes, setLoanTypes] = useState<LoanType[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<LoanType | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [statusLoadingId, setStatusLoadingId] = useState<number | null>(null);
  const [name, setName] = useState('');

  const fetchLoanTypes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await loanTypesApi.list({ page, per_page: 10 });
      setLoanTypes(res.data);
      setTotalRecords(res.total);
    } catch (err) {
      console.error('Failed to load loan types', err);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchLoanTypes();
  }, [fetchLoanTypes]);

  const openCreate = () => {
    setEditItem(null);
    setName('');
    setSubmitError(null);
    setModalOpen(true);
  };

  const openEdit = (item: LoanType) => {
    setEditItem(item);
    setName(item.name);
    setSubmitError(null);
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      setSubmitError('Name is required.');
      return;
    }

    setSubmitLoading(true);
    setSubmitError(null);
    try {
      if (editItem) {
        await loanTypesApi.update(editItem.id, { name: trimmedName });
      } else {
        await loanTypesApi.create({ name: trimmedName });
      }
      setModalOpen(false);
      fetchLoanTypes();
    } catch (err: any) {
      setSubmitError(err.message || 'Operation failed');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleToggleStatus = async (item: LoanType) => {
    setStatusLoadingId(item.id);
    setStatusError(null);
    try {
      await loanTypesApi.changeStatus(item.id, { status: !item.status });
      await fetchLoanTypes();
    } catch (err: any) {
      setStatusError(err.message || 'Failed to change status');
    } finally {
      setStatusLoadingId(null);
    }
  };

  const columns = [
    { key: 'id', label: 'ID', className: 'w-20' },
    {
      key: 'name',
      label: 'Loan Type',
      render: (item: LoanType) => <span className="font-medium">{item.name}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      className: 'w-32',
      render: (item: LoanType) => (
        <StatusBadge status={item.status ? 'active' : 'inactive'} />
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      className: 'w-56',
      render: (item: LoanType) => {
        const isLoading = statusLoadingId === item.id;
        return (
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/app/loan-types/${item.id}`);
              }}
              className="p-1.5 rounded-lg text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#111827] transition-colors"
              title="Configure forms"
            >
              <DocumentTextIcon className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                openEdit(item);
              }}
              className="p-1.5 rounded-lg text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#111827] transition-colors"
              title="Edit name"
            >
              <PencilIcon className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleToggleStatus(item);
              }}
              disabled={isLoading}
              className="px-2.5 py-1.5 text-xs font-medium rounded-lg border border-[#E5E7EB] text-[#374151] hover:bg-[#F9FAFB] disabled:opacity-50 flex items-center gap-1.5"
              title={item.status ? 'Deactivate' : 'Activate'}
            >
              {isLoading ? (
                <ArrowPathIcon className="w-3.5 h-3.5 animate-spin" />
              ) : null}
              {item.status ? 'Deactivate' : 'Activate'}
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <PageShell
      title="Loan Types"
      subtitle="Configure loan products and application forms"
      actions={
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#2563EB] text-white text-sm font-medium rounded-lg hover:bg-[#1D4ED8] transition-colors"
        >
          <PlusIcon className="w-4 h-4" />
          Add Loan Type
        </button>
      }
    >
      {statusError && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {statusError}
        </p>
      )}

      <DataTable
        columns={columns}
        data={loanTypes}
        loading={loading}
        page={page}
        perPage={10}
        totalRecords={totalRecords}
        onPageChange={setPage}
        serverSidePagination
        rowKey={(item) => item.id}
        emptyMessage="No loan types found"
      />

      <FormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editItem ? 'Edit Loan Type' : 'Add Loan Type'}
        onSubmit={handleSubmit}
        submitLabel={editItem ? 'Update' : 'Create'}
        loading={submitLoading}
        error={submitError}
      >
        <FormField label="Loan Type Name" required>
          <FormInput value={name} onChange={setName} placeholder="e.g. Personal Loan, Business Loan" />
        </FormField>
      </FormModal>
    </PageShell>
  );
}
