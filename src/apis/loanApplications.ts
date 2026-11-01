import { api } from '../utils/apiClient';
import type {
  DisbursementRequestListItem,
  LoanApplication,
  CustomerLoanApplicationCreatePayload,
  CustomerLoanApplicationCreateResponse,
  LoanApplicationCreatePayload,
  LoanApplicationDetail,
  LoanApplicationListResponse,
  LoanApplicationTermsUpdatePayload,
  LoanApplicationApproval,
  LoanApplicationPenalty,
  LoanApplicationUploadedFile,
  LoanCollection,
  LoanDisbursement,
  LoanLedger,
  MoratoriumRequestListItem,
  RepaymentSchedule,
  PaginatedListResponse,
} from './types';

export type LoanAmortizationStrategy = 'adjust_tenure' | 'keep_tenured_fixed';

export type DisburseLoanPayload = {
  loan_amortization_strategy?: LoanAmortizationStrategy;
  disbursement_due_date: string;
};

export const loanApplicationsApi = {
  list: (params?: { page?: number; per_page?: number }) =>
    api.get<LoanApplicationListResponse>('/loan_applications/', { params }),

  get: (loanApplicationEid: string) =>
    api.get<LoanApplicationDetail>(`/loan_applications/${loanApplicationEid}`),

  create: (data: LoanApplicationCreatePayload) =>
    api.post<LoanApplication>('/loan_applications/', data),

  customerCreate: (data: CustomerLoanApplicationCreatePayload) =>
    api.post<CustomerLoanApplicationCreateResponse>('/loan_applications/customer_create', data),

  generateCustomerOtp: (customerEid: string) =>
    api.post<{ redis_key: string }>('/loan_applications/customer_otp', {
      customer_eid: customerEid,
    }),

  verifyCustomerOtp: (data: { customer_eid: string; redis_key: string; otp: string }) =>
    api.post<void>('/loan_applications/customer_otp/verify', data),

  downloadReport: (params?: { format?: string; status?: string }) =>
    api.get<string>('/loan_applications/report', { params }),

  updateTerms: (loanApplicationEid: string, data: LoanApplicationTermsUpdatePayload) =>
    api.patch<void>(`/loan_applications/${loanApplicationEid}/loan_terms`, data),

  changeStatus: (loanApplicationEid: string, data: { new_status: string }) =>
    api.patch<void>(`/loan_applications/${loanApplicationEid}/change_status`, data),

  startDisbursement: (loanApplicationEid: string) =>
    api.post<void>(`/loan_applications/${loanApplicationEid}/start_disbursement`),

  saveForm: (loanApplicationEid: string, data: Record<string, unknown>) =>
    api.put<void>(`/loan_applications/${loanApplicationEid}/save_form`, { data }),

  submitToLoanOfficer: (loanApplicationEid: string, data: Record<string, unknown>) =>
    api.post<void>(`/loan_applications/${loanApplicationEid}/submit_to_loan_officer`, { data }),

  submit: (loanApplicationEid: string, data: Record<string, unknown>) =>
    api.patch<void>(`/loan_applications/${loanApplicationEid}/submit`, { data }),

  listUploadedFiles: (loanApplicationEid: string, params?: { page?: number; per_page?: number }) =>
    api.get<PaginatedListResponse<LoanApplicationUploadedFile>>(
      `/loan_applications/${loanApplicationEid}/uploaded_files`,
      { params },
    ),

  downloadUploadedFile: (loanApplicationEid: string, uploadedFileId: number) =>
    api.post<{ url: string }>(
      `/loan_applications/${loanApplicationEid}/download_uploaded_file/${uploadedFileId}`,
    ),

  listDisbursements: (loanApplicationEid: string, params?: { page?: number; per_page?: number }) =>
    api.get<PaginatedListResponse<LoanDisbursement>>(
      `/loan_applications/${loanApplicationEid}/disbursements`,
      { params },
    ),

  disburseLoan: (
    loanApplicationEid: string,
    disbursementId: number,
    data: DisburseLoanPayload,
  ) =>
    api.post<void>(
      `/loan_applications/${loanApplicationEid}/disbursements/${disbursementId}`,
      data,
    ),

  listRepaymentSchedules: (
    loanApplicationEid: string,
    params?: { page?: number; per_page?: number },
  ) =>
    api.get<PaginatedListResponse<RepaymentSchedule>>(
      `/loan_applications/${loanApplicationEid}/repayment_schedules`,
      { params },
    ),

  listLedgers: (loanApplicationEid: string, params?: { page?: number; per_page?: number }) =>
    api.get<PaginatedListResponse<LoanLedger>>(
      `/loan_applications/${loanApplicationEid}/ledgers`,
      { params },
    ),

  listLoanApplicationPenalties: (
    loanApplicationEid: string,
    params?: { page?: number; per_page?: number },
  ) =>
    api.get<PaginatedListResponse<LoanApplicationPenalty>>(
      `/loan_applications/${loanApplicationEid}/loan_application_penalties`,
      { params },
    ),

  listCollections: (loanApplicationEid: string, params?: { page?: number; per_page?: number }) =>
    api.get<PaginatedListResponse<LoanCollection>>(
      `/loan_applications/${loanApplicationEid}/collections`,
      { params },
    ),

  listMoratoriumRequests: (
    loanApplicationEid: string,
    params?: { page?: number; per_page?: number },
  ) =>
    api.get<PaginatedListResponse<MoratoriumRequestListItem>>(
      `/loan_applications/${loanApplicationEid}/moratorium_requests/list`,
      { params },
    ),

  listDisbursementRequests: (
    loanApplicationEid: string,
    params?: { page?: number; per_page?: number },
  ) =>
    api.get<PaginatedListResponse<DisbursementRequestListItem>>(
      `/loan_applications/${loanApplicationEid}/disbursement_requests/list`,
      { params },
    ),

  listApprovals: (loanApplicationEid: string, params?: { page?: number; per_page?: number }) =>
    api.get<PaginatedListResponse<LoanApplicationApproval>>(
      `/loan_applications/${loanApplicationEid}/approvals`,
      { params },
    ),

  assignApprover: (
    loanApplicationEid: string,
    approvalId: number,
    data: { approver_eid: string },
  ) =>
    api.patch<void>(
      `/loan_applications/${loanApplicationEid}/approvals/${approvalId}/assign_approver`,
      data,
    ),

  sendApprovalRequest: (loanApplicationEid: string, approvalId: number) =>
    api.post<void>(
      `/loan_applications/${loanApplicationEid}/approvals/${approvalId}/send_approval_request`,
    ),

  approvalAction: (
    loanApplicationEid: string,
    approvalId: number,
    data: { action: 'approve' | 'reject'; comments?: string },
  ) =>
    api.patch<void>(
      `/loan_applications/${loanApplicationEid}/approvals/${approvalId}/approval_action`,
      data,
    ),
};
