// @ts-nocheck
import { useCallback, useEffect, useMemo, useState } from 'react';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { loanApprovalsApi } from '../../../apis/loanApprovals';
import { designationsApi } from '../../../apis/designations';
import type { EmployeeDesignation, LoanApproval } from '../../../apis/types';
import { DataTable } from '../shared/DataTable';
import { FormField, FormInput, FormModal, FormSelect } from '../shared/FormModal';

type LoanTypeApprovalsSectionProps = {
  loanTypeId: number;
};

type ApprovalFormState = {
  employee_designation_ids: string[];
  approval_sequence: string;
};

const emptyFormState = (): ApprovalFormState => ({
  employee_designation_ids: [],
  approval_sequence: '1',
});

export function LoanTypeApprovalsSection({ loanTypeId }: LoanTypeApprovalsSectionProps) {
  const [approvals, setApprovals] = useState<LoanApproval[]>([]);
  const [designations, setDesignations] = useState<EmployeeDesignation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingApproval, setEditingApproval] = useState<LoanApproval | null>(null);
  const [formState, setFormState] = useState<ApprovalFormState>(emptyFormState);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [approvalRes, designationRes] = await Promise.all([
        loanApprovalsApi.list(loanTypeId, { page: 1, per_page: 100 }),
        designationsApi.list({ page: 1, per_page: 100 }),
      ]);
      setApprovals(approvalRes.data);
      setDesignations(designationRes.data);
    } catch (err: any) {
      setError(err.message || 'Failed to load loan approvals');
    } finally {
      setLoading(false);
    }
  }, [loanTypeId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const designationNameById = useMemo(() => {
    const map: Record<number, string> = {};
    designations.forEach((item) => {
      map[item.id] = item.name;
    });
    return map;
  }, [designations]);

  const openCreateModal = () => {
    setEditingApproval(null);
    setFormState({
      ...emptyFormState(),
      approval_sequence: String(approvals.length + 1),
    });
    setActionError(null);
    setModalOpen(true);
  };

  const openEditModal = (approval: LoanApproval) => {
    setEditingApproval(approval);
    setFormState({
      approval_sequence: String(approval.approval_sequence),
      employee_designation_ids: approval.employee_designation_ids.map(String),
    });
    setActionError(null);
    setModalOpen(true);
  };

  const toggleDesignation = (designationId: string) => {
    setFormState((prev) => {
      const exists = prev.employee_designation_ids.includes(designationId);
      return {
        ...prev,
        employee_designation_ids: exists
          ? prev.employee_designation_ids.filter((id) => id !== designationId)
          : [...prev.employee_designation_ids, designationId],
      };
    });
  };

  const handleSave = async () => {
    const designationIds = formState.employee_designation_ids.map(Number);
    if (designationIds.length === 0) {
      setActionError('Select at least one designation.');
      return;
    }

    setSaving(true);
    setActionError(null);
    try {
      if (editingApproval) {
        await loanApprovalsApi.update(loanTypeId, editingApproval.id, {
          employee_designation_ids: designationIds,
          approval_sequence: Number(formState.approval_sequence),
        });
      } else {
        await loanApprovalsApi.create(loanTypeId, {
          employee_designation_ids: designationIds,
        });
      }
      setModalOpen(false);
      await loadData();
    } catch (err: any) {
      setActionError(err.message || 'Failed to save loan approval');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (approval: LoanApproval) => {
    if (!window.confirm(`Delete approval step ${approval.approval_sequence}?`)) {
      return;
    }
    setActionError(null);
    try {
      await loanApprovalsApi.remove(loanTypeId, approval.id);
      await loadData();
    } catch (err: any) {
      setActionError(err.message || 'Failed to delete loan approval');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-[#6B7280]">
          Configure sequential approval steps for loan applications of this loan type.
        </p>
        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#2563EB] rounded-lg hover:bg-[#1D4ED8]"
        >
          <PlusIcon className="w-4 h-4" />
          Add approval step
        </button>
      </div>

      {actionError && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {actionError}
        </p>
      )}

      {error ? (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </p>
      ) : (
        <DataTable
          columns={[
            { key: 'approval_sequence', label: 'Sequence' },
            {
              key: 'employee_designation_ids',
              label: 'Allowed designations',
              render: (item) =>
                item.employee_designation_ids
                  .map((id) => designationNameById[id] || `#${id}`)
                  .join(', ') || '—',
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
                      openEditModal(item);
                    }}
                    className="text-sm text-[#2563EB] hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      handleDelete(item);
                    }}
                    className="inline-flex items-center gap-1 text-sm text-red-600 hover:underline"
                  >
                    <TrashIcon className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              ),
            },
          ]}
          data={approvals}
          loading={loading}
          totalRecords={approvals.length}
          rowKey={(item) => item.id}
          emptyMessage="No approval steps configured"
        />
      )}

      <FormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingApproval ? 'Edit approval step' : 'Add approval step'}
        onSubmit={handleSave}
        submitLabel={editingApproval ? 'Update' : 'Create'}
        loading={saving}
        error={actionError}
        width="max-w-xl"
      >
        {editingApproval && (
          <FormField label="Approval sequence" required>
            <FormInput
              type="number"
              value={formState.approval_sequence}
              onChange={(value) => setFormState((prev) => ({ ...prev, approval_sequence: value }))}
            />
          </FormField>
        )}

        <FormField label="Allowed employee designations" required>
          <div className="space-y-2 max-h-56 overflow-y-auto border border-[#E5E7EB] rounded-lg p-3">
            {designations.map((designation) => {
              const checked = formState.employee_designation_ids.includes(String(designation.id));
              return (
                <label key={designation.id} className="flex items-center gap-2 text-sm text-[#374151]">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleDesignation(String(designation.id))}
                  />
                  {designation.name}
                </label>
              );
            })}
            {designations.length === 0 && (
              <p className="text-sm text-[#6B7280]">No designations available.</p>
            )}
          </div>
        </FormField>
      </FormModal>
    </div>
  );
}
