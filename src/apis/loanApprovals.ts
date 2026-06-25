import { api } from '../utils/apiClient';
import type { LoanApproval, PaginatedListResponse } from './types';

export const loanApprovalsApi = {
  list: (loanTypeId: number, params?: { page?: number; per_page?: number }) =>
    api.get<PaginatedListResponse<LoanApproval>>(
      `/loan_types/${loanTypeId}/loan_approvals/list`,
      { params },
    ),

  get: (loanTypeId: number, loanApprovalId: number) =>
    api.get<LoanApproval>(`/loan_types/${loanTypeId}/loan_approvals/${loanApprovalId}`),

  create: (loanTypeId: number, data: { employee_designation_ids: number[] }) =>
    api.post<LoanApproval>(`/loan_types/${loanTypeId}/loan_approvals/add`, data),

  update: (
    loanTypeId: number,
    loanApprovalId: number,
    data: { employee_designation_ids: number[]; approval_sequence: number },
  ) =>
    api.put<void>(
      `/loan_types/${loanTypeId}/loan_approvals/${loanApprovalId}/update`,
      data,
    ),

  remove: (loanTypeId: number, loanApprovalId: number) =>
    api.delete<void>(`/loan_types/${loanTypeId}/loan_approvals/${loanApprovalId}`),
};
