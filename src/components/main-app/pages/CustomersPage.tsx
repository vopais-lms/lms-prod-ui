// @ts-nocheck
import { useState, useEffect, useCallback } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { PageShell } from '../shared/PageShell';
import { DataTable } from '../shared/DataTable';
import { FormModal, FormField, FormInput } from '../shared/FormModal';
import { StatusBadge } from '../shared/StatusBadge';
import { customersApi } from '../../../apis/customers';
import type { Customer } from '../../../apis/types';

export function CustomersPage() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Customer | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Customer | null>(null);

  const emptyForm = {
    name: '', email: '', linked_phone_number: '',
    first_line_address: '', second_line_address: '', secondary_phone: '',
  };
  const [form, setForm] = useState(emptyForm);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await customersApi.list({ page, per_page: 10 });
      setCustomers(res.data);
      setTotalRecords(res.total_records);
    } catch (err) {
      console.error('Failed to load customers', err);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

  const openCreate = () => {
    setEditItem(null);
    setForm(emptyForm);
    setSubmitError(null);
    setModalOpen(true);
  };

  const openEdit = (item: Customer) => {
    setEditItem(item);
    setForm({
      name: item.name,
      email: item.email,
      linked_phone_number: item.linked_phone_number,
      first_line_address: item.first_line_address,
      second_line_address: item.second_line_address,
      secondary_phone: item.secondary_phone || '',
    });
    setSubmitError(null);
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    setSubmitLoading(true);
    setSubmitError(null);
    try {
      if (editItem) {
        await customersApi.update(editItem.eid, form);
      } else {
        const created = await customersApi.create(form);
        await customersApi.sendOtpsForVerification(created.eid);
      }
      setModalOpen(false);
      fetchCustomers();
    } catch (err: any) {
      setSubmitError(err.message || 'Operation failed');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await customersApi.delete(deleteConfirm.eid);
      setDeleteConfirm(null);
      fetchCustomers();
    } catch (err) {
      console.error('Delete failed', err);
    }
  };

  const updateForm = (field: string, value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  const columns = [
    { key: 'name', label: 'Name', render: (item: Customer) => <span className="font-medium">{item.name}</span> },
    { key: 'email', label: 'Email' },
    { key: 'linked_phone_number', label: 'Phone' },
    {
      key: 'is_active',
      label: 'Status',
      render: (item: Customer) => <StatusBadge status={item.is_active ? 'active' : 'inactive'} />,
    },
    {
      key: 'verified_phone',
      label: 'Phone Verified',
      render: (item: Customer) => (
        <StatusBadge
          status={item.verified_phone_number_timestamp ? 'verified' : 'unverified'}
        />
      ),
    },
    {
      key: 'verified_email',
      label: 'Email Verified',
      render: (item: Customer) => (
        <StatusBadge
          status={item.verified_email_timestamp ? 'verified' : 'unverified'}
        />
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (item: Customer) => (
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); openEdit(item); }}
            className="p-1.5 rounded-lg text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#111827] transition-colors"
            title="Edit"
          >
            <PencilIcon className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); navigate(`/app/customer-kyc/${item.eid}`); }}
            className="p-1.5 rounded-lg text-[#6B7280] hover:bg-blue-50 hover:text-blue-600 transition-colors"
            title="KYC Documents"
          >
            <DocumentTextIcon className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setDeleteConfirm(item); }}
            className="p-1.5 rounded-lg text-[#6B7280] hover:bg-red-50 hover:text-red-600 transition-colors"
            title="Delete"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <PageShell
      title="Customers"
      subtitle="Manage customer records and KYC verification"
      actions={
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#2563EB] text-white text-sm font-medium rounded-lg hover:bg-[#1D4ED8] transition-colors"
        >
          <PlusIcon className="w-4 h-4" />
          Add Customer
        </button>
      }
    >
      <DataTable
        columns={columns}
        data={customers}
        loading={loading}
        page={page}
        perPage={10}
        totalRecords={totalRecords}
        onPageChange={setPage}
        serverSidePagination
        rowKey={(item) => item.eid}
        emptyMessage="No customers found"
      />

      <FormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editItem ? 'Edit Customer' : 'Add Customer'}
        onSubmit={handleSubmit}
        submitLabel={editItem ? 'Update' : 'Create'}
        loading={submitLoading}
        error={submitError}
        width="max-w-xl"
      >
        <div className="space-y-4">
          <FormField label="Full Name" required>
            <FormInput value={form.name} onChange={(v) => updateForm('name', v)} placeholder="Customer name" />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Email" required>
              <FormInput value={form.email} onChange={(v) => updateForm('email', v)} placeholder="email@example.com" type="email" />
            </FormField>
            <FormField label="Phone" required>
              <FormInput value={form.linked_phone_number} onChange={(v) => updateForm('linked_phone_number', v)} placeholder="+91..." />
            </FormField>
          </div>
          <FormField label="Secondary Phone">
            <FormInput value={form.secondary_phone} onChange={(v) => updateForm('secondary_phone', v)} placeholder="Optional phone" />
          </FormField>
          <FormField label="Address Line 1" required>
            <FormInput value={form.first_line_address} onChange={(v) => updateForm('first_line_address', v)} placeholder="Street address" />
          </FormField>
          <FormField label="Address Line 2">
            <FormInput value={form.second_line_address} onChange={(v) => updateForm('second_line_address', v)} placeholder="Suite, floor" />
          </FormField>
        </div>
      </FormModal>

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDeleteConfirm(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full mx-4 p-6">
            <h3 className="text-lg font-semibold text-[#111827] mb-2">Delete Customer</h3>
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
