// @ts-nocheck
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowUturnLeftIcon,
  Bars3Icon,
  ClipboardDocumentListIcon,
  PencilSquareIcon,
  PlusIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { loanTypeParameterGroupingsApi } from '../../../apis/loanTypeParameterGroupings';
import type { ParameterGroupingListItem, ParameterGroupType } from '../../../apis/types';
import {
  buildParameterGroupTree,
  isDescendant,
  wouldCreateCycle,
  type ParameterGroupTreeNode,
} from '../../../utils/parameterGroupTree';
import { FormField, FormInput, FormModal, FormSelect } from '../shared/FormModal';
import { TreeGrid } from '../shared/TreeGrid';

type LoanTypeUnderwritingConfigSectionProps = {
  loanTypeId: number;
};

type GroupFormState = {
  name: string;
  type_of_group: ParameterGroupType;
  group_scoring_weight: string;
};

type LinkFormState = {
  group_scoring_weight: string;
};

const emptyGroupForm = (): GroupFormState => ({
  name: '',
  type_of_group: 'scoring',
  group_scoring_weight: '100',
});

const emptyLinkForm = (): LinkFormState => ({
  group_scoring_weight: '100',
});

export function LoanTypeUnderwritingConfigSection({
  loanTypeId,
}: LoanTypeUnderwritingConfigSectionProps) {
  const navigate = useNavigate();
  const [groups, setGroups] = useState<ParameterGroupingListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Set<number>>(() => new Set());
  const [modalOpen, setModalOpen] = useState(false);
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<ParameterGroupingListItem | null>(null);
  const [formState, setFormState] = useState<GroupFormState>(emptyGroupForm);
  const [linkFormState, setLinkFormState] = useState<LinkFormState>(emptyLinkForm);
  const [pendingLink, setPendingLink] = useState<{ childId: number; parentId: number } | null>(
    null,
  );

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await loanTypeParameterGroupingsApi.list(loanTypeId, {
        page: 1,
        per_page: 50,
      });
      setGroups(res.data);
      setExpandedIds((prev) => {
        const next = new Set<number>();
        res.data.forEach((item) => {
          if (prev.has(item.id)) next.add(item.id);
        });
        return next;
      });
    } catch (err: any) {
      setError(err.message || 'Failed to load parameter groups');
    } finally {
      setLoading(false);
    }
  }, [loanTypeId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const treeRows = useMemo(
    () => buildParameterGroupTree(groups) as ParameterGroupTreeNode[],
    [groups],
  );

  const groupById = useMemo(() => {
    const map = new Map<number, ParameterGroupingListItem>();
    groups.forEach((group) => map.set(group.id, group));
    return map;
  }, [groups]);

  const openCreateModal = () => {
    setEditingGroup(null);
    setFormState(emptyGroupForm());
    setActionError(null);
    setModalOpen(true);
  };

  const openEditModal = (group: ParameterGroupingListItem) => {
    setEditingGroup(group);
    setFormState({
      name: group.name || '',
      type_of_group: (group.type_of_group as ParameterGroupType) || 'scoring',
      group_scoring_weight: String(group.group_scoring_weight),
    });
    setActionError(null);
    setModalOpen(true);
  };

  const handleSaveGroup = async () => {
    const weight = Number(formState.group_scoring_weight);
    const name = formState.name.trim();
    if (!name) {
      setActionError('Name is required.');
      return;
    }
    if (!Number.isFinite(weight) || weight < 0 || weight > 100) {
      setActionError('Weight must be between 0 and 100.');
      return;
    }

    setSaving(true);
    setActionError(null);
    try {
      if (editingGroup) {
        const payload: Record<string, unknown> = {
          name,
          group_scoring_weight: weight,
        };
        if (!editingGroup.parent_parameter_group_id) {
          payload.type_of_group = formState.type_of_group;
        }
        await loanTypeParameterGroupingsApi.update(loanTypeId, editingGroup.id, payload);
      } else {
        await loanTypeParameterGroupingsApi.create(loanTypeId, {
          name,
          type_of_group: formState.type_of_group,
          group_scoring_weight: weight,
          scoring_rule_json: [],
        });
      }
      setModalOpen(false);
      await loadData();
    } catch (err: any) {
      setActionError(err.message || 'Failed to save parameter group');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (group: ParameterGroupingListItem) => {
    if (!window.confirm(`Delete parameter group #${group.id}?`)) return;
    setActionError(null);
    try {
      await loanTypeParameterGroupingsApi.remove(loanTypeId, group.id);
      await loadData();
    } catch (err: any) {
      setActionError(err.message || 'Failed to delete parameter group');
    }
  };

  const beginLink = (childId: number, parentId: number) => {
    const child = groupById.get(childId);
    const parent = groupById.get(parentId);
    if (!child || !parent) return;

    if (child.type_of_group !== parent.type_of_group) {
      setActionError('Parent and nested group must be the same group type.');
      return;
    }
    if (wouldCreateCycle(childId, parentId, groups)) {
      setActionError('Cannot create a circular parent relationship.');
      return;
    }
    if (isDescendant(childId, parentId, groups)) {
      setActionError('Cannot drop a parent onto its descendant.');
      return;
    }

    setPendingLink({ childId, parentId });
    setLinkFormState({ group_scoring_weight: String(child.group_scoring_weight || 100) });
    setLinkModalOpen(true);
  };

  const handleConfirmLink = async () => {
    if (!pendingLink) return;
    const weight = Number(linkFormState.group_scoring_weight);
    if (!Number.isFinite(weight) || weight < 0 || weight > 100) {
      setActionError('Weight must be between 0 and 100.');
      return;
    }

    setSaving(true);
    setActionError(null);
    try {
      await loanTypeParameterGroupingsApi.linkParent(loanTypeId, pendingLink.childId, {
        parent_parameter_group_id: pendingLink.parentId,
        group_scoring_weight: weight,
      });
      setLinkModalOpen(false);
      setPendingLink(null);
      setExpandedIds((prev) => new Set(prev).add(pendingLink.parentId));
      await loadData();
    } catch (err: any) {
      setActionError(err.message || 'Failed to link parameter group');
    } finally {
      setSaving(false);
    }
  };

  const unlinkGroup = async (group: ParameterGroupingListItem) => {
    if (!group.parent_parameter_group_id) return;
    setActionError(null);
    try {
      await loanTypeParameterGroupingsApi.unlinkParent(loanTypeId, group.id);
      await loadData();
    } catch (err: any) {
      setActionError(err.message || 'Failed to unlink parameter group');
    }
  };

  const handleUnlink = async (group: ParameterGroupingListItem) => {
    if (!group.parent_parameter_group_id) return;
    if (
      !window.confirm(
        `Unlink group #${group.id} from parent #${group.parent_parameter_group_id} and move it to root?`,
      )
    ) {
      return;
    }
    await unlinkGroup(group);
  };

  const navigateToRules = (
    group: ParameterGroupingListItem,
    event?: { metaKey?: boolean; ctrlKey?: boolean },
  ) => {
    const url = `/app/loan-types/${loanTypeId}/parameter-groupings/${group.id}/rules`;
    if (event?.metaKey || event?.ctrlKey) {
      window.open(url, '_blank', 'noopener,noreferrer');
      return;
    }
    navigate(url);
  };

  const handleRowClick = (group: ParameterGroupingListItem, event: React.MouseEvent) => {
    navigateToRules(group, event);
  };

  const toggleExpand = (id: number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (loading) {
    return (
      <div className="rounded-lg border border-[#E5E7EB] px-4 py-10 text-center text-sm text-[#6B7280]">
        Loading parameter groups...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
      {actionError && !modalOpen && !linkModalOpen && (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          {actionError}
        </p>
      )}

      <div className="flex flex-wrap items-center justify-end gap-3">
        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 rounded-lg bg-[#2563EB] px-4 py-2 text-sm font-medium text-white hover:bg-[#1D4ED8]"
        >
          <PlusIcon className="h-4 w-4" />
          Add group
        </button>
      </div>

      <TreeGrid
        rows={treeRows}
        expandedIds={expandedIds}
        onToggleExpand={toggleExpand}
        onRowClick={handleRowClick}
        onDropOnRow={beginLink}
        onDropOnRoot={(childId) => {
          const group = groupById.get(childId);
          if (group) unlinkGroup(group);
        }}
        renderDragHandle={() => <Bars3Icon className="h-4 w-4" />}
        emptyMessage="No parameter groups yet. Create a verification or scoring group to get started."
        columns={[
          {
            key: 'name',
            header: 'Name',
            render: (row) => row.name?.trim() || '—',
          },
          {
            key: 'id',
            header: 'ID',
            render: (row) => row.id,
          },
          {
            key: 'type',
            header: 'Type',
            render: (row) => (
              <span className="capitalize">{row.type_of_group}</span>
            ),
          },
          {
            key: 'weight',
            header: 'Weight',
            render: (row) => `${row.group_scoring_weight}%`,
          },
          {
            key: 'parent',
            header: 'Parent',
            render: (row) =>
              row.parent_parameter_group_id != null
                ? String(row.parent_parameter_group_id)
                : 'Root',
          },
          {
            key: 'actions',
            header: 'Actions',
            render: (row) => (
              <div className="flex items-center gap-2" onClick={(event) => event.stopPropagation()}>
                {row.parent_parameter_group_id ? (
                  <button
                    type="button"
                    onClick={() => handleUnlink(row)}
                    className="rounded p-1 text-[#6B7280] hover:bg-[#F3F4F6]"
                    title="Unlink from parent (move to root)"
                  >
                    <ArrowUturnLeftIcon className="h-4 w-4" />
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={(event) => navigateToRules(row, event)}
                  className="rounded p-1 text-[#7C3AED] hover:bg-[#F5F3FF]"
                  title="Edit scoring rules (Cmd/Ctrl+click opens new tab)"
                >
                  <ClipboardDocumentListIcon className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => openEditModal(row)}
                  className="rounded p-1 text-[#2563EB] hover:bg-[#EFF6FF]"
                  title="Edit"
                >
                  <PencilSquareIcon className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(row)}
                  className="rounded p-1 text-red-600 hover:bg-red-50"
                  title="Delete"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            ),
          },
        ]}
      />

      <p className="text-xs text-[#6B7280]">
        Click a row or the rules icon to edit scoring rules. Use Cmd/Ctrl + click to open in a new tab. Drag
        groups to reparent, use the unlink icon to move a child to root, or drop on the header zone.
      </p>

      <FormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingGroup ? 'Edit parameter group' : 'Create parameter group'}
        onSubmit={handleSaveGroup}
        loading={saving}
        error={actionError}
      >
        <div className="space-y-4">
          <FormField label="Name" required>
            <FormInput
              value={formState.name}
              onChange={(value) =>
                setFormState((prev) => ({
                  ...prev,
                  name: value,
                }))
              }
              placeholder="e.g. Income verification"
            />
          </FormField>
          <FormField label="Group type">
            <FormSelect
              value={formState.type_of_group}
              disabled={Boolean(editingGroup?.parent_parameter_group_id)}
              onChange={(value) =>
                setFormState((prev) => ({
                  ...prev,
                  type_of_group: value as ParameterGroupType,
                }))
              }
              options={[
                { value: 'verification', label: 'Verification' },
                { value: 'scoring', label: 'Scoring' },
              ]}
              placeholder="Select group type"
            />
          </FormField>
          <FormField label="Scoring weight (0–100)">
            <FormInput
              type="number"
              value={formState.group_scoring_weight}
              onChange={(value) =>
                setFormState((prev) => ({
                  ...prev,
                  group_scoring_weight: value,
                }))
              }
            />
          </FormField>
        </div>
      </FormModal>

      <FormModal
        isOpen={linkModalOpen}
        onClose={() => {
          setLinkModalOpen(false);
          setPendingLink(null);
        }}
        title="Link to parent group"
        onSubmit={handleConfirmLink}
        submitLabel="Link"
        loading={saving}
        error={actionError}
      >
        <div className="space-y-4">
          <p className="text-sm text-[#6B7280]">
            Group #{pendingLink?.childId} → parent #{pendingLink?.parentId}
          </p>
          <FormField label="Weight under parent (0–100)">
            <FormInput
              type="number"
              value={linkFormState.group_scoring_weight}
              onChange={(value) =>
                setLinkFormState({ group_scoring_weight: value })
              }
            />
          </FormField>
        </div>
      </FormModal>
    </div>
  );
}
