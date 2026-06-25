// @ts-nocheck
import { useState, useEffect, useCallback } from 'react';
import { PlusIcon, PencilIcon, EyeIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import { PageShell } from '../shared/PageShell';
import { DataTable } from '../shared/DataTable';
import { FormModal, FormField, FormInput, FormSelect } from '../shared/FormModal';
import { StatusBadge } from '../shared/StatusBadge';
import { employeesApi } from '../../../apis/employees';
import { branchesApi } from '../../../apis/branches';
import { designationsApi } from '../../../apis/designations';
import type { Branch, Employee, EmployeeDesignation } from '../../../apis/types';

const LOOKUP_PAGE_SIZE = 100;

export function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [designations, setDesignations] = useState<EmployeeDesignation[]>([]);
  const [loading, setLoading] = useState(true);
  const [optionsLoading, setOptionsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Employee | null>(null);
  const [detailItem, setDetailItem] = useState<Employee | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [supervisorModalOpen, setSupervisorModalOpen] = useState(false);
  const [supervisorTarget, setSupervisorTarget] = useState<Employee | null>(null);
  const [supervisorOptions, setSupervisorOptions] = useState<Employee[]>([]);
  const [selectedSupervisorEid, setSelectedSupervisorEid] = useState('');
  const [supervisorLoading, setSupervisorLoading] = useState(false);
  const [supervisorError, setSupervisorError] = useState<string | null>(null);

  const [form, setForm] = useState({
    employee_id: '',
    branch_id: '',
    designation_id: '',
    date_of_joining: '',
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
  });

  const loadLookupOptions = useCallback(async () => {
    setOptionsLoading(true);
    try {
      const [branchesRes, designationsRes] = await Promise.all([
        branchesApi.list({ page: 1, per_page: LOOKUP_PAGE_SIZE }),
        designationsApi.list({ page: 1, per_page: LOOKUP_PAGE_SIZE }),
      ]);
      setBranches(branchesRes.data);
      setDesignations(designationsRes.data);
    } catch (err) {
      console.error('Failed to load branch/designation options', err);
    } finally {
      setOptionsLoading(false);
    }
  }, []);

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    try {
      const res = await employeesApi.list({ page, per_page: 10 });
      setEmployees(res.data);
      setTotalRecords(res.total_records ?? res.total_employee_records ?? 0);
    } catch (err) {
      console.error('Failed to load employees', err);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { fetchEmployees(); }, [fetchEmployees]);
  useEffect(() => { loadLookupOptions(); }, [loadLookupOptions]);

  const getBranchLabel = (branchId: number) => {
    const branch = branches.find((item) => item.id === branchId);
    return branch ? `${branch.name} (${branch.code})` : `ID ${branchId}`;
  };

  const getDesignationLabel = (designationId: number) => {
    const designation = designations.find((item) => item.id === designationId);
    return designation ? designation.name : `ID ${designationId}`;
  };

  const getEmployeeLabel = (employee: Employee) =>
    `${employee.first_name} ${employee.last_name} (${employee.employee_id})`;

  const getSupervisorLabel = (supervisorEid: string | null) => {
    if (!supervisorEid) return 'None';
    const supervisor = employees.find((item) => item.eid === supervisorEid)
      || supervisorOptions.find((item) => item.eid === supervisorEid);
    return supervisor ? getEmployeeLabel(supervisor) : supervisorEid;
  };

  const openManageSupervisor = async (item: Employee) => {
    setSupervisorTarget(item);
    setSelectedSupervisorEid(item.supervisor_eid || '');
    setSupervisorError(null);
    setSupervisorModalOpen(true);
    setSupervisorLoading(true);
    try {
      const res = await employeesApi.list({ page: 1, per_page: LOOKUP_PAGE_SIZE });
      setSupervisorOptions(res.data);
    } catch (err) {
      console.error('Failed to load supervisor options', err);
      setSupervisorError('Failed to load employees for supervisor selection.');
    } finally {
      setSupervisorLoading(false);
    }
  };

  const handleSaveSupervisor = async () => {
    if (!supervisorTarget) return;

    setSupervisorLoading(true);
    setSupervisorError(null);
    try {
      await employeesApi.manageSupervisor(
        supervisorTarget.eid,
        selectedSupervisorEid || null,
      );
      setSupervisorModalOpen(false);
      setSupervisorTarget(null);
      fetchEmployees();
      if (detailItem?.eid === supervisorTarget.eid) {
        setDetailItem({
          ...detailItem,
          supervisor_eid: selectedSupervisorEid || null,
        });
      }
    } catch (err: any) {
      setSupervisorError(err.message || 'Failed to update supervisor');
    } finally {
      setSupervisorLoading(false);
    }
  };

  const openCreate = async () => {
    setEditItem(null);
    setForm({ employee_id: '', branch_id: '', designation_id: '', date_of_joining: '', first_name: '', last_name: '', email: '', phone_number: '' });
    setSubmitError(null);
    setModalOpen(true);
    await loadLookupOptions();
  };

  const openEdit = async (item: Employee) => {
    setEditItem(item);
    setForm({
      employee_id: item.employee_id,
      branch_id: String(item.branch_id),
      designation_id: String(item.designation_id),
      date_of_joining: item.date_of_joining,
      first_name: item.first_name,
      last_name: item.last_name,
      email: item.email,
      phone_number: item.phone_number,
    });
    setSubmitError(null);
    setModalOpen(true);
    await loadLookupOptions();
  };

  const handleSubmit = async () => {
    if (!form.branch_id || !form.designation_id) {
      setSubmitError('Please select a branch and designation.');
      return;
    }

    setSubmitLoading(true);
    setSubmitError(null);
    try {
      const data = {
        ...form,
        branch_id: Number(form.branch_id),
        designation_id: Number(form.designation_id),
      };
      if (editItem) {
        await employeesApi.update(editItem.eid, data);
      } else {
        await employeesApi.create(data);
      }
      setModalOpen(false);
      fetchEmployees();
    } catch (err: any) {
      setSubmitError(err.message || 'Operation failed');
    } finally {
      setSubmitLoading(false);
    }
  };

  const toggleStatus = async (emp: Employee) => {
    try {
      await employeesApi.updateStatus(emp.eid, !emp.is_active);
      fetchEmployees();
    } catch (err) {
      console.error('Status update failed', err);
    }
  };

  const branchOptions = branches.map((branch) => ({
    value: String(branch.id),
    label: `${branch.name} (${branch.code})`,
  }));

  const designationOptions = designations.map((designation) => ({
    value: String(designation.id),
    label: designation.name,
  }));

  const supervisorSelectOptions = supervisorOptions
    .filter((employee) => {
      if (employee.eid === supervisorTarget?.eid) return false;
      if (employee.eid === selectedSupervisorEid) return true;
      return employee.is_active;
    })
    .map((employee) => ({
      value: employee.eid,
      label: getEmployeeLabel(employee),
    }));

  const columns = [
    { key: 'employee_id', label: 'Emp ID' },
    {
      key: 'name',
      label: 'Name',
      render: (item: Employee) => (
        <span className="font-medium">{item.first_name} {item.last_name}</span>
      ),
    },
    { key: 'email', label: 'Email' },
    { key: 'phone_number', label: 'Phone' },
    {
      key: 'is_active',
      label: 'Status',
      render: (item: Employee) => (
        <StatusBadge status={item.is_active ? 'active' : 'inactive'} />
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (item: Employee) => (
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); openEdit(item); }}
            className="p-1.5 rounded-lg text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#111827] transition-colors"
            title="Edit"
          >
            <PencilIcon className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setDetailItem(item); }}
            className="p-1.5 rounded-lg text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#111827] transition-colors"
            title="View"
          >
            <EyeIcon className="w-4 h-4" />
          </button>
          {item.is_active && (
            <button
              onClick={(e) => { e.stopPropagation(); openManageSupervisor(item); }}
              className="p-1.5 rounded-lg text-[#6B7280] hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
              title="Manage Supervisor"
            >
              <UserGroupIcon className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); toggleStatus(item); }}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
              item.is_active
                ? 'text-red-700 bg-red-50 hover:bg-red-100'
                : 'text-green-700 bg-green-50 hover:bg-green-100'
            }`}
          >
            {item.is_active ? 'Deactivate' : 'Activate'}
          </button>
        </div>
      ),
    },
  ];

  const updateForm = (field: string, value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  return (
    <PageShell
      title="Employees"
      subtitle="Manage employee records, assign branches and designations"
      actions={
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#2563EB] text-white text-sm font-medium rounded-lg hover:bg-[#1D4ED8] transition-colors"
        >
          <PlusIcon className="w-4 h-4" />
          Add Employee
        </button>
      }
    >
      <DataTable
        columns={columns}
        data={employees}
        loading={loading}
        page={page}
        perPage={10}
        totalRecords={totalRecords}
        onPageChange={setPage}
        serverSidePagination
        onRowClick={(item) => setDetailItem(item)}
        rowKey={(item) => item.eid}
      />

      <FormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editItem ? 'Edit Employee' : 'Add Employee'}
        onSubmit={handleSubmit}
        submitLabel={editItem ? 'Update' : 'Create'}
        loading={submitLoading}
        error={submitError}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="First Name" required>
              <FormInput value={form.first_name} onChange={(v) => updateForm('first_name', v)} placeholder="First name" />
            </FormField>
            <FormField label="Last Name" required>
              <FormInput value={form.last_name} onChange={(v) => updateForm('last_name', v)} placeholder="Last name" />
            </FormField>
          </div>
          <FormField label="Employee ID" required>
            <FormInput value={form.employee_id} onChange={(v) => updateForm('employee_id', v)} placeholder="EMP-001" />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Email" required>
              <FormInput value={form.email} onChange={(v) => updateForm('email', v)} placeholder="email@company.com" type="email" />
            </FormField>
            <FormField label="Phone" required>
              <FormInput value={form.phone_number} onChange={(v) => updateForm('phone_number', v)} placeholder="+91..." />
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Branch" required>
              <FormSelect
                value={form.branch_id}
                onChange={(v) => updateForm('branch_id', v)}
                options={branchOptions}
                placeholder={branches.length === 0 && !optionsLoading ? 'No branches available' : 'Select branch'}
                disabled={optionsLoading}
              />
            </FormField>
            <FormField label="Designation" required>
              <FormSelect
                value={form.designation_id}
                onChange={(v) => updateForm('designation_id', v)}
                options={designationOptions}
                placeholder={designations.length === 0 && !optionsLoading ? 'No designations available' : 'Select designation'}
                disabled={optionsLoading}
              />
            </FormField>
          </div>
          <FormField label="Date of Joining" required>
            <FormInput value={form.date_of_joining} onChange={(v) => updateForm('date_of_joining', v)} placeholder="YYYY-MM-DD" type="date" />
          </FormField>
        </div>
      </FormModal>

      <FormModal
        isOpen={supervisorModalOpen}
        onClose={() => {
          setSupervisorModalOpen(false);
          setSupervisorTarget(null);
          setSupervisorError(null);
        }}
        title={`Manage Supervisor${supervisorTarget ? ` — ${supervisorTarget.first_name} ${supervisorTarget.last_name}` : ''}`}
        onSubmit={handleSaveSupervisor}
        submitLabel="Save Supervisor"
        loading={supervisorLoading}
        error={supervisorError}
      >
        <FormField label="Supervisor">
          <FormSelect
            value={selectedSupervisorEid}
            onChange={setSelectedSupervisorEid}
            options={supervisorSelectOptions}
            placeholder={supervisorLoading ? 'Loading employees...' : 'No supervisor'}
            disabled={supervisorLoading}
          />
        </FormField>
        <p className="text-xs text-[#6B7280]">
          Only active employees can be assigned as supervisors. Choose &quot;No supervisor&quot; to remove the current assignment.
        </p>
      </FormModal>

      {detailItem && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/30" onClick={() => setDetailItem(null)} />
          <div className="relative w-full max-w-md bg-white shadow-2xl overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-[#E5E7EB] px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[#111827]">Employee Details</h2>
              <button onClick={() => setDetailItem(null)} className="p-1.5 rounded-lg text-[#6B7280] hover:bg-[#F3F4F6]">
                ✕
              </button>
            </div>
            <div className="p-6 space-y-4">
              {[
                ['Name', `${detailItem.first_name} ${detailItem.last_name}`],
                ['Employee ID', detailItem.employee_id],
                ['Email', detailItem.email],
                ['Phone', detailItem.phone_number],
                ['Branch', getBranchLabel(detailItem.branch_id)],
                ['Designation', getDesignationLabel(detailItem.designation_id)],
                ['Date of Joining', detailItem.date_of_joining],
                ['Supervisor', getSupervisorLabel(detailItem.supervisor_eid)],
              ].map(([label, value]) => (
                <div key={String(label)} className="flex justify-between py-2 border-b border-[#F3F4F6]">
                  <span className="text-sm text-[#6B7280]">{label}</span>
                  <span className="text-sm font-medium text-[#111827]">{String(value)}</span>
                </div>
              ))}
              <div className="flex justify-between py-2">
                <span className="text-sm text-[#6B7280]">Status</span>
                <StatusBadge status={detailItem.is_active ? 'active' : 'inactive'} />
              </div>
              {detailItem.is_active && (
                <button
                  onClick={() => openManageSupervisor(detailItem)}
                  className="w-full mt-4 px-4 py-2.5 text-sm font-medium text-indigo-700 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
                >
                  Manage Supervisor
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </PageShell>
  );
}
