// @ts-nocheck
import { useCallback, useEffect, useMemo, useState } from 'react';
import { loanApplicationsApi } from '../../../apis/loanApplications';
import { designationsApi } from '../../../apis/designations';
import { employeesApi } from '../../../apis/employees';
import type {
  Employee,
  EmployeeDesignation,
  LoanApplicationApproval,
} from '../../../apis/types';
import { FormField, FormSelect } from '../shared/FormModal';

type LoanApplicationApprovalsPanelProps = {
  eid: string;
  approvals: LoanApplicationApproval[];
  loading: boolean;
  error: string | null;
  onReload: () => Promise<void>;
  onApplicationReload?: () => Promise<void>;
};

export function LoanApplicationApprovalsPanel({
  eid,
  approvals,
  loading,
  error,
  onReload,
  onApplicationReload,
}: LoanApplicationApprovalsPanelProps) {
  const [designations, setDesignations] = useState<EmployeeDesignation[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
  const [assignSelections, setAssignSelections] = useState<Record<number, string>>({});
  const [commentSelections, setCommentSelections] = useState<Record<number, string>>({});
  const [approverDetails, setApproverDetails] = useState<Record<number, Employee>>({});
  const [assignedApproverEids, setAssignedApproverEids] = useState<Record<number, string>>({});

  useEffect(() => {
    setAssignedApproverEids((prev) => {
      const next = { ...prev };
      approvals.forEach((approval) => {
        if (approval.approver_eid) {
          next[approval.id] = approval.approver_eid;
        }
      });
      return next;
    });

    setAssignSelections((prev) => {
      const next = { ...prev };
      approvals.forEach((approval) => {
        if (approval.approver_eid) {
          next[approval.id] = approval.approver_eid;
        }
      });
      return next;
    });
  }, [approvals]);

  useEffect(() => {
    let cancelled = false;

    const hydrateApproverDetails = async () => {
      const pending = approvals.filter(
        (approval) => approval.approver_eid && !approverDetails[approval.id],
      );
      if (pending.length === 0) {
        return;
      }

      const results = await Promise.all(
        pending.map(async (approval) => {
          try {
            const employee = await employeesApi.get(approval.approver_eid!);
            return { approvalId: approval.id, employee };
          } catch (err) {
            console.error('Failed to load approver details', err);
            return null;
          }
        }),
      );

      if (cancelled) {
        return;
      }

      const updates = results.filter(Boolean);
      if (updates.length === 0) {
        return;
      }

      setApproverDetails((prev) => {
        const next = { ...prev };
        updates.forEach((item) => {
          next[item.approvalId] = item.employee;
        });
        return next;
      });
    };

    hydrateApproverDetails();

    return () => {
      cancelled = true;
    };
  }, [approvals]);

  const getAssignedApproverEid = useCallback(
    (approval: LoanApplicationApproval) =>
      approval.approver_eid ||
      assignedApproverEids[approval.id] ||
      approverDetails[approval.id]?.eid ||
      null,
    [assignedApproverEids, approverDetails],
  );

  useEffect(() => {
    const loadLookups = async () => {
      try {
        const [designationRes, employeeRes] = await Promise.all([
          designationsApi.list({ page: 1, per_page: 100 }),
          employeesApi.list({ page: 1, per_page: 200 }),
        ]);
        setDesignations(designationRes.data);
        setEmployees(employeeRes.data);
      } catch (err) {
        console.error('Failed to load approval lookups', err);
      }
    };
    loadLookups();
  }, []);

  const designationNameById = useMemo(() => {
    const map: Record<number, string> = {};
    designations.forEach((item) => {
      map[item.id] = item.name;
    });
    return map;
  }, [designations]);

  const employeesForApproval = useCallback(
    (approval: LoanApplicationApproval) =>
      employees.filter(
        (employee) =>
          employee.is_active &&
          approval.employee_designation_ids.includes(employee.designation_id),
      ),
    [employees],
  );

  const runAction = async (approvalId: number, action: () => Promise<void>) => {
    setActionLoadingId(approvalId);
    setActionError(null);
    try {
      await action();
      await onReload();
      await onApplicationReload?.();
    } catch (err: any) {
      setActionError(err.message || 'Action failed');
    } finally {
      setActionLoadingId(null);
    }
  };

  if (loading && approvals.length === 0) {
    return <p className="text-sm text-[#6B7280]">Loading approvals…</p>;
  }

  if (error) {
    return (
      <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
        {error}
      </p>
    );
  }

  if (approvals.length === 0) {
    return (
      <p className="text-sm text-[#6B7280]">
        No approval steps yet. They are created automatically when the application is submitted.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {loading && approvals.length > 0 && (
        <p className="text-xs text-[#6B7280]">Refreshing approvals…</p>
      )}

      {actionError && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {actionError}
        </p>
      )}

      {approvals.map((approval) => {
        const eligibleEmployees = employeesForApproval(approval);
        const isBusy = actionLoadingId === approval.id;
        const assignedApproverEid = getAssignedApproverEid(approval);
        const isPending = approval.approval_status === 'pending';
        const designationLabels = approval.employee_designation_ids
          .map((id) => designationNameById[id] || `Designation #${id}`)
          .join(', ');

        return (
          <div
            key={approval.id}
            className="border border-[#E5E7EB] rounded-xl p-4 space-y-4 bg-[#FAFAFA]"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-[#111827]">
                  Step {approval.approval_sequence}
                </p>
                <p className="text-xs text-[#6B7280] mt-1">
                  Allowed designations: {designationLabels || '—'}
                </p>
              </div>
              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-white border border-[#E5E7EB] text-[#374151]">
                {approval.approval_status}
              </span>
            </div>

            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-[#6B7280]">Approver</dt>
                {approverDetails[approval.id] ? (
                  <>
                    <dd className="font-medium text-[#111827]">
                      {`${approverDetails[approval.id].first_name} ${approverDetails[approval.id].last_name}`.trim()}
                    </dd>
                    <dd className="text-xs text-[#6B7280] mt-0.5">
                      {approverDetails[approval.id].email}
                    </dd>
                    <dd className="text-xs text-[#6B7280]">
                      {approverDetails[approval.id].phone_number}
                    </dd>
                  </>
                ) : (
                  <dd className="font-medium text-[#111827]">
                    {approval.approver_name || approval.approver_eid || 'Not assigned'}
                  </dd>
                )}
              </div>
              <div>
                <dt className="text-[#6B7280]">Comments</dt>
                <dd className="font-medium text-[#111827]">{approval.comments || '—'}</dd>
              </div>
            </dl>

            {['pending', 'approval_request_sent'].includes(approval.approval_status) && (
              <div
                className={`grid grid-cols-1 gap-4 pt-2 border-t border-[#E5E7EB] lg:items-end ${
                  isPending ? 'lg:grid-cols-2' : ''
                }`}
              >
                {isPending && (
                  <FormField label="Assign approver">
                    <FormSelect
                      value={assignSelections[approval.id] || ''}
                      onChange={(value) =>
                        setAssignSelections((prev) => ({ ...prev, [approval.id]: value }))
                      }
                      placeholder="Select employee"
                      options={eligibleEmployees.map((employee) => ({
                        value: employee.eid,
                        label: `${employee.first_name} ${employee.last_name}`.trim(),
                      }))}
                    />
                    <button
                      type="button"
                      disabled={isBusy || !assignSelections[approval.id]}
                      onClick={() => {
                        const approverEid = assignSelections[approval.id];
                        runAction(approval.id, async () => {
                          await loanApplicationsApi.assignApprover(eid, approval.id, {
                            approver_eid: approverEid,
                          });
                          setAssignedApproverEids((prev) => ({
                            ...prev,
                            [approval.id]: approverEid,
                          }));
                          try {
                            const employee = await employeesApi.get(approverEid);
                            setApproverDetails((prev) => ({ ...prev, [approval.id]: employee }));
                          } catch (err) {
                            console.error('Failed to load approver details', err);
                          }
                        });
                      }}
                      className="mt-2 px-3 py-1.5 text-sm font-medium text-white bg-[#2563EB] rounded-lg hover:bg-[#1D4ED8] disabled:opacity-50"
                    >
                      Assign
                    </button>
                  </FormField>
                )}

                <div className="space-y-4">
                  <FormField label="Send approval request">
                    <button
                      type="button"
                      disabled={isBusy || !assignedApproverEid}
                      onClick={() =>
                        runAction(approval.id, () =>
                          loanApplicationsApi.sendApprovalRequest(eid, approval.id),
                        )
                      }
                      className="w-full px-3 py-1.5 text-sm font-medium text-[#374151] border border-[#E5E7EB] rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Send approval request
                    </button>
                  </FormField>

                  {approval.can_act && (
                    <div className="space-y-2">
                      <FormField label="Comments (optional)">
                        <textarea
                          value={commentSelections[approval.id] || ''}
                          onChange={(event) =>
                            setCommentSelections((prev) => ({
                              ...prev,
                              [approval.id]: event.target.value,
                            }))
                          }
                          rows={2}
                          className="w-full px-3 py-2 text-sm border border-[#D1D5DB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
                        />
                      </FormField>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() =>
                            runAction(approval.id, () =>
                              loanApplicationsApi.approvalAction(eid, approval.id, {
                                action: 'approve',
                                comments: commentSelections[approval.id] || undefined,
                              }),
                            )
                          }
                          className="px-3 py-1.5 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() =>
                            runAction(approval.id, () =>
                              loanApplicationsApi.approvalAction(eid, approval.id, {
                                action: 'reject',
                                comments: commentSelections[approval.id] || undefined,
                              }),
                            )
                          }
                          className="px-3 py-1.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
