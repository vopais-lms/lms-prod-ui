// @ts-nocheck
import { useState, useEffect, useCallback } from 'react';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { PageShell } from '../shared/PageShell';
import { DataTable } from '../shared/DataTable';
import { FormModal, FormField, FormInput } from '../shared/FormModal';
import { designationsApi } from '../../../apis/designations';
import type { EmployeeDesignation } from '../../../apis/types';

export function DesignationsPage() {
  const [designations, setDesignations] = useState<EmployeeDesignation[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<EmployeeDesignation | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<EmployeeDesignation | null>(null);
  const [name, setName] = useState('');

  const fetchDesignations = useCallback(async () => {
    setLoading(true);
    try {
      const res = await designationsApi.list({ page, per_page: 10 });
      setDesignations(res.data);
      setTotalRecords(res.total_records);
    } catch (err) {
      console.error('Failed to load designations', err);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { fetchDesignations(); }, [fetchDesignations]);

  const openCreate = () => {
    setEditItem(null);
    setName('');
    setSubmitError(null);
    setModalOpen(true);
  };

  const openEdit = (item: EmployeeDesignation) => {
    setEditItem(item);
    setName(item.name);
    setSubmitError(null);
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    setSubmitLoading(true);
    setSubmitError(null);
    try {
      if (editItem) {
        await designationsApi.update(editItem.id, { name });
      } else {
        await designationsApi.create({ name });
      }
      setModalOpen(false);
      fetchDesignations();
    } catch (err: any) {
      setSubmitError(err.message || 'Operation failed');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await designationsApi.delete(deleteConfirm.id);
      setDeleteConfirm(null);
      fetchDesignations();
    } catch (err) {
      console.error('Delete failed', err);
    }
  };

  const columns = [
    { key: 'id', label: 'ID', className: 'w-20' },
    { key: 'name', label: 'Designation Name', render: (item: EmployeeDesignation) => <span className="font-medium">{item.name}</span> },
    {
      key: 'actions',
      label: 'Actions',
      className: 'w-32',
      render: (item: EmployeeDesignation) => (
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); openEdit(item); }}
            className="p-1.5 rounded-lg text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#111827] transition-colors"
          >
            <PencilIcon className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setDeleteConfirm(item); }}
            className="p-1.5 rounded-lg text-[#6B7280] hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <PageShell
      title="Employee Designations"
      subtitle="Manage designation types for your organization"
      actions={
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#2563EB] text-white text-sm font-medium rounded-lg hover:bg-[#1D4ED8] transition-colors"
        >
          <PlusIcon className="w-4 h-4" />
          Add Designation
        </button>
      }
    >
      <DataTable
        columns={columns}
        data={designations}
        loading={loading}
        page={page}
        perPage={10}
        totalRecords={totalRecords}
        onPageChange={setPage}
        serverSidePagination
        rowKey={(item) => item.id}
        emptyMessage="No designations found"
      />

      <FormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editItem ? 'Edit Designation' : 'Add Designation'}
        onSubmit={handleSubmit}
        submitLabel={editItem ? 'Update' : 'Create'}
        loading={submitLoading}
        error={submitError}
      >
        <FormField label="Designation Name" required>
          <FormInput value={name} onChange={setName} placeholder="e.g. Manager, Senior Officer" />
        </FormField>
      </FormModal>

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDeleteConfirm(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full mx-4 p-6">
            <h3 className="text-lg font-semibold text-[#111827] mb-2">Delete Designation</h3>
            <p className="text-sm text-[#6B7280] mb-6">
              Are you sure you want to delete <strong>{deleteConfirm.name}</strong>? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-sm font-medium text-[#6B7280] bg-white border border-[#E5E7EB] rounded-lg hover:bg-[#F9FAFB]"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </PageShell>
  );
}
