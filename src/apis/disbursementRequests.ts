import { api } from '../utils/apiClient';
import type {
  DisbursementRequestDetail,
  DisbursementRequestListItem,
  PaginatedListResponse,
} from './types';
import type { LoanAmortizationStrategy } from './loanApplications';

export type DisbursementRequestCreatePayload = {
  disbursement_amount: number;
  amortization_type?: LoanAmortizationStrategy;
};

export type DisbursementRequestUpdatePayload = {
  disbursement_amount?: number;
  amortization_type?: LoanAmortizationStrategy;
};

export type DisbursementRequestStatusAction =
  | 'move_to_verification'
  | 'approve'
  | 'reject';

export const disbursementRequestsApi = {
  list: (loanApplicationEid: string, params?: { page?: number; per_page?: number }) =>
    api.get<PaginatedListResponse<DisbursementRequestListItem>>(
      `/loan_applications/${loanApplicationEid}/disbursement_requests/list`,
      { params },
    ),

  get: (loanApplicationEid: string, disbursementRequestEid: string) =>
    api.get<DisbursementRequestDetail>(
      `/loan_applications/${loanApplicationEid}/disbursement_requests/${disbursementRequestEid}`,
    ),

  create: (loanApplicationEid: string, data: DisbursementRequestCreatePayload) =>
    api.post<DisbursementRequestDetail>(
      `/loan_applications/${loanApplicationEid}/disbursement_requests/add`,
      data,
    ),

  update: (
    loanApplicationEid: string,
    disbursementRequestEid: string,
    data: DisbursementRequestUpdatePayload,
  ) =>
    api.put<void>(
      `/loan_applications/${loanApplicationEid}/disbursement_requests/${disbursementRequestEid}/update`,
      data,
    ),

  saveForm: (
    loanApplicationEid: string,
    disbursementRequestEid: string,
    data: Record<string, unknown>,
  ) =>
    api.put<void>(
      `/loan_applications/${loanApplicationEid}/disbursement_requests/${disbursementRequestEid}/save_form`,
      { data },
    ),

  submit: (
    loanApplicationEid: string,
    disbursementRequestEid: string,
    data: Record<string, unknown>,
  ) =>
    api.patch<void>(
      `/loan_applications/${loanApplicationEid}/disbursement_requests/${disbursementRequestEid}/submit`,
      { data },
    ),

  changeStatus: (
    loanApplicationEid: string,
    disbursementRequestEid: string,
    data: {
      status: DisbursementRequestStatusAction;
      disbursement_due_date?: string;
    },
  ) =>
    api.patch<void>(
      `/loan_applications/${loanApplicationEid}/disbursement_requests/${disbursementRequestEid}/change_status`,
      data,
    ),
};
