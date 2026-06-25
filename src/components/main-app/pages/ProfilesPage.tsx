// @ts-nocheck
import { useState, useEffect, useCallback } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';
import { PageShell } from '../shared/PageShell';
import { DataTable } from '../shared/DataTable';
import { FormModal, FormField, FormInput } from '../shared/FormModal';
import { StatusBadge } from '../shared/StatusBadge';
import { profilesApi } from '../../../apis/profiles';
import { modulesApi } from '../../../apis/modules';
import type { Profile, AppModule } from '../../../apis/types';

export function ProfilesPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Profile | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Profile | null>(null);

  // Module mapping state
  const [moduleModalOpen, setModuleModalOpen] = useState(false);
  const [moduleProfile, setModuleProfile] = useState<Profile | null>(null);
  const [allModules, setAllModules] = useState<AppModule[]>([]);
  const [selectedModuleIds, setSelectedModuleIds] = useState<Set<number>>(new Set());
  const [modulesLoading, setModulesLoading] = useState(false);

  const [form, setForm] = useState({ name: '', is_internal: true });

  const fetchProfiles = useCallback(async () => {
    setLoading(true);
    try {
      const res = await profilesApi.list({ page, per_page: 10 });
      setProfiles(res.data);
      setTotalRecords(res.total_records);
    } catch (err) {
      console.error('Failed to load profiles', err);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { fetchProfiles(); }, [fetchProfiles]);

  const openCreate = () => {
    setEditItem(null);
    setForm({ name: '', is_internal: true });
    setSubmitError(null);
    setModalOpen(true);
  };

  const openEdit = (item: Profile) => {
    setEditItem(item);
    setForm({ name: item.name, is_internal: item.is_internal });
    setSubmitError(null);
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    setSubmitLoading(true);
    setSubmitError(null);
    try {
      if (editItem) {
        await profilesApi.update(editItem.id, form);
      } else {
        await profilesApi.create(form);
      }
      setModalOpen(false);
      fetchProfiles();
    } catch (err: any) {
      setSubmitError(err.message || 'Operation failed');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await profilesApi.delete(deleteConfirm.id);
      setDeleteConfirm(null);
      fetchProfiles();
    } catch (err) {
      console.error('Delete failed', err);
    }
  };

  const openModuleMapping = async (profile: Profile) => {
    setModuleProfile(profile);
    setModulesLoading(true);
    setModuleModalOpen(true);
    try {
      const [modulesRes, profileRes] = await Promise.all([
        modulesApi.list(),
        profilesApi.getModules(profile.id),
      ]);
      setAllModules(modulesRes.module_listing || []);
      const existingIds = new Set((profileRes.modules || []).map((m: AppModule) => m.id));
      setSelectedModuleIds(existingIds);
    } catch (err) {
      console.error('Failed to load modules', err);
    } finally {
      setModulesLoading(false);
    }
  };

  const toggleModule = (id: number) => {
    setSelectedModuleIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const saveModuleMappings = async () => {
    if (!moduleProfile) return;
    setModulesLoading(true);
    try {
      await profilesApi.createModuleMappings(moduleProfile.id, Array.from(selectedModuleIds));
      setModuleModalOpen(false);
      fetchProfiles();
    } catch (err) {
      console.error('Module mapping failed', err);
    } finally {
      setModulesLoading(false);
    }
  };

  const columns = [
    { key: 'id', label: 'ID', className: 'w-16' },
    { key: 'name', label: 'Profile Name', render: (item: Profile) => <span className="font-medium">{item.name}</span> },
    {
      key: 'is_internal',
      label: 'Type',
      render: (item: Profile) => (
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
          item.is_internal ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'
        }`}>
          {item.is_internal ? 'Internal' : 'External'}
        </span>
      ),
    },
    {
      key: 'modules',
      label: 'Modules',
      render: (item: Profile) => (
        <span className="text-sm text-[#6B7280]">{item.modules?.length ?? '—'} assigned</span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (item: Profile) => (
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); openModuleMapping(item); }}
            className="p-1.5 rounded-lg text-[#6B7280] hover:bg-blue-50 hover:text-blue-600 transition-colors"
            title="Manage Modules"
          >
            <Cog6ToothIcon className="w-4 h-4" />
          </button>
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
      title="Profiles"
      subtitle="Manage access profiles and module assignments"
      actions={
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#2563EB] text-white text-sm font-medium rounded-lg hover:bg-[#1D4ED8] transition-colors"
        >
          <PlusIcon className="w-4 h-4" />
          Add Profile
        </button>
      }
    >
      <DataTable
        columns={columns}
        data={profiles}
        loading={loading}
        page={page}
        perPage={10}
        totalRecords={totalRecords}
        onPageChange={setPage}
        serverSidePagination
        rowKey={(item) => item.id}
        emptyMessage="No profiles found"
      />

      {/* Create/Edit Profile */}
      <FormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editItem ? 'Edit Profile' : 'Add Profile'}
        onSubmit={handleSubmit}
        submitLabel={editItem ? 'Update' : 'Create'}
        loading={submitLoading}
        error={submitError}
      >
        <div className="space-y-4">
          <FormField label="Profile Name" required>
            <FormInput value={form.name} onChange={(v) => setForm({ ...form, name: v })} placeholder="e.g. Admin, Support, Customer" />
          </FormField>
          <FormField label="Profile Type">
            <div className="flex items-center gap-4 mt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={form.is_internal}
                  onChange={() => setForm({ ...form, is_internal: true })}
                  className="text-[#2563EB]"
                />
                <span className="text-sm text-[#374151]">Internal (Employee)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={!form.is_internal}
                  onChange={() => setForm({ ...form, is_internal: false })}
                  className="text-[#2563EB]"
                />
                <span className="text-sm text-[#374151]">External (Customer)</span>
              </label>
            </div>
          </FormField>
        </div>
      </FormModal>

      {/* Module Mapping Modal */}
      <FormModal
        isOpen={moduleModalOpen}
        onClose={() => setModuleModalOpen(false)}
        title={`Manage Modules — ${moduleProfile?.name || ''}`}
        onSubmit={saveModuleMappings}
        submitLabel="Save Mappings"
        loading={modulesLoading}
        width="max-w-xl"
      >
        {modulesLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-10 bg-[#F3F4F6] rounded-lg animate-pulse" />
            ))}
          </div>
        ) : allModules.length === 0 ? (
          <p className="text-sm text-[#6B7280] text-center py-8">No modules available</p>
        ) : (
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {allModules.map((mod) => (
              <label
                key={mod.id}
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                  selectedModuleIds.has(mod.id)
                    ? 'border-[#2563EB] bg-blue-50'
                    : 'border-[#E5E7EB] hover:border-[#D1D5DB]'
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedModuleIds.has(mod.id)}
                  onChange={() => toggleModule(mod.id)}
                  className="w-4 h-4 text-[#2563EB] rounded"
                />
                <div>
                  <p className="text-sm font-medium text-[#111827]">{mod.label || mod.name}</p>
                  {mod.link && <p className="text-xs text-[#6B7280]">{mod.link}</p>}
                </div>
              </label>
            ))}
          </div>
        )}
      </FormModal>

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDeleteConfirm(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full mx-4 p-6">
            <h3 className="text-lg font-semibold text-[#111827] mb-2">Delete Profile</h3>
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
