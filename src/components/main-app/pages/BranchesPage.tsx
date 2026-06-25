// @ts-nocheck
import { useState, useEffect, useCallback } from 'react';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { PageShell } from '../shared/PageShell';
import { DataTable } from '../shared/DataTable';
import { FormModal, FormField, FormInput } from '../shared/FormModal';
import { StatusBadge } from '../shared/StatusBadge';
import { branchesApi } from '../../../apis/branches';
import type { Branch } from '../../../apis/types';

export function BranchesPage() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Branch | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Branch | null>(null);

  const emptyForm = {
    name: '', code: '', first_line_address: '', second_line_address: '',
    city: '', state: '', country: 'India', pincode: '', phone_number: '', is_active: true,
  };
  const [form, setForm] = useState(emptyForm);

  const fetchBranches = useCallback(async () => {
    setLoading(true);
    try {
      const res = await branchesApi.list({ page, per_page: 10 });
      setBranches(res.data);
      setTotalRecords(res.total_records);
    } catch (err) {
      console.error('Failed to load branches', err);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { fetchBranches(); }, [fetchBranches]);

  const openCreate = () => {
    setEditItem(null);
    setForm(emptyForm);
    setSubmitError(null);
    setModalOpen(true);
  };

  const openEdit = (item: Branch) => {
    setEditItem(item);
    setForm({
      name: item.name, code: item.code,
      first_line_address: item.first_line_address, second_line_address: item.second_line_address,
      city: item.city, state: item.state, country: item.country,
      pincode: item.pincode, phone_number: item.phone_number, is_active: item.is_active,
    });
    setSubmitError(null);
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    setSubmitLoading(true);
    setSubmitError(null);
    try {
      if (editItem) {
        await branchesApi.update(editItem.id, form);
      } else {
        await branchesApi.create(form);
      }
      setModalOpen(false);
      fetchBranches();
    } catch (err: any) {
      setSubmitError(err.message || 'Operation failed');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await branchesApi.delete(deleteConfirm.id);
      setDeleteConfirm(null);
      fetchBranches();
    } catch (err) {
      console.error('Delete failed', err);
    }
  };

  const updateForm = (field: string, value: any) => setForm((prev) => ({ ...prev, [field]: value }));

  const columns = [
    { key: 'name', label: 'Branch Name', render: (item: Branch) => <span className="font-medium">{item.name}</span> },
    { key: 'code', label: 'Code' },
    { key: 'city', label: 'City' },
    { key: 'state', label: 'State' },
    { key: 'phone_number', label: 'Phone' },
    {
      key: 'is_active',
      label: 'Status',
      render: (item: Branch) => <StatusBadge status={item.is_active ? 'active' : 'inactive'} />,
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (item: Branch) => (
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
      title="Branches"
      subtitle="Manage your organization's branch network"
      actions={
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#2563EB] text-white text-sm font-medium rounded-lg hover:bg-[#1D4ED8] transition-colors"
        >
          <PlusIcon className="w-4 h-4" />
          Add Branch
        </button>
      }
    >
      <DataTable
        columns={columns}
        data={branches}
        loading={loading}
        page={page}
        perPage={10}
        totalRecords={totalRecords}
        onPageChange={setPage}
        serverSidePagination
        rowKey={(item) => item.id}
        emptyMessage="No branches found"
      />

      <FormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editItem ? 'Edit Branch' : 'Add Branch'}
        onSubmit={handleSubmit}
        submitLabel={editItem ? 'Update' : 'Create'}
        loading={submitLoading}
        error={submitError}
        width="max-w-2xl"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Branch Name" required>
              <FormInput value={form.name} onChange={(v) => updateForm('name', v)} placeholder="Jaipur Main" />
            </FormField>
            <FormField label="Branch Code" required>
              <FormInput value={form.code} onChange={(v) => updateForm('code', v)} placeholder="JPR-001" />
            </FormField>
          </div>
          <FormField label="Address Line 1" required>
            <FormInput value={form.first_line_address} onChange={(v) => updateForm('first_line_address', v)} placeholder="Street address" />
          </FormField>
          <FormField label="Address Line 2">
            <FormInput value={form.second_line_address} onChange={(v) => updateForm('second_line_address', v)} placeholder="Suite, floor" />
          </FormField>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <FormField label="City" required>
              <FormInput value={form.city} onChange={(v) => updateForm('city', v)} />
            </FormField>
            <FormField label="State" required>
              <FormInput value={form.state} onChange={(v) => updateForm('state', v)} />
            </FormField>
            <FormField label="Country" required>
              <FormInput value={form.country} onChange={(v) => updateForm('country', v)} />
            </FormField>
            <FormField label="Pincode" required>
              <FormInput value={form.pincode} onChange={(v) => updateForm('pincode', v)} />
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Phone" required>
              <FormInput value={form.phone_number} onChange={(v) => updateForm('phone_number', v)} placeholder="+91..." />
            </FormField>
            <FormField label="Status">
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => updateForm('is_active', !form.is_active)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.is_active ? 'bg-[#2563EB]' : 'bg-gray-300'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${form.is_active ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
                <span className="text-sm text-[#6B7280]">{form.is_active ? 'Active' : 'Inactive'}</span>
              </div>
            </FormField>
          </div>
        </div>
      </FormModal>

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDeleteConfirm(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full mx-4 p-6">
            <h3 className="text-lg font-semibold text-[#111827] mb-2">Delete Branch</h3>
            <p className="text-sm text-[#6B7280] mb-6">
              Are you sure you want to delete <strong>{deleteConfirm.name}</strong>?
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 text-sm font-medium text-[#6B7280] bg-white border border-[#E5E7EB] rounded-lg hover:bg-[#F9FAFB]">Cancel</button>
              <button onClick={handleDelete} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700">Delete</button>
            </div>
          </div>
        </div>
      )}
    </PageShell>
  );
}
