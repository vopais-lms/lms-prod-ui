import { api } from '../utils/apiClient';
import type {
  MoratoriumRequestDetail,
  MoratoriumRequestListItem,
  PaginatedListResponse,
} from './types';

export type MoratoriumRequestCreatePayload = {
  moratorium_type: 'principal_amount_only' | 'full';
  moratorium_period_in_days: number;
  moratorium_start_date?: string | null;
  keep_tenured_fixed?: boolean;
};

export type MoratoriumRequestUpdatePayload = {
  moratorium_type?: 'principal_amount_only' | 'full';
  moratorium_period_in_days?: number;
  moratorium_start_date?: string | null;
  keep_tenured_fixed?: boolean;
};

export type MoratoriumRequestStatusAction =
  | 'move_to_verification'
  | 'approve'
  | 'reject';

export const moratoriumRequestsApi = {
  list: (loanApplicationEid: string, params?: { page?: number; per_page?: number }) =>
    api.get<PaginatedListResponse<MoratoriumRequestListItem>>(
      `/loan_applications/${loanApplicationEid}/moratorium_requests/list`,
      { params },
    ),

  get: (loanApplicationEid: string, moratoriumRequestEid: string) =>
    api.get<MoratoriumRequestDetail>(
      `/loan_applications/${loanApplicationEid}/moratorium_requests/${moratoriumRequestEid}`,
    ),

  create: (loanApplicationEid: string, data: MoratoriumRequestCreatePayload) =>
    api.post<MoratoriumRequestDetail>(
      `/loan_applications/${loanApplicationEid}/moratorium_requests/add`,
      data,
    ),

  update: (
    loanApplicationEid: string,
    moratoriumRequestEid: string,
    data: MoratoriumRequestUpdatePayload,
  ) =>
    api.put<void>(
      `/loan_applications/${loanApplicationEid}/moratorium_requests/${moratoriumRequestEid}/update`,
      data,
    ),

  saveForm: (
    loanApplicationEid: string,
    moratoriumRequestEid: string,
    data: Record<string, unknown>,
  ) =>
    api.put<void>(
      `/loan_applications/${loanApplicationEid}/moratorium_requests/${moratoriumRequestEid}/save_form`,
      { data },
    ),

  submit: (
    loanApplicationEid: string,
    moratoriumRequestEid: string,
    data: Record<string, unknown>,
  ) =>
    api.patch<void>(
      `/loan_applications/${loanApplicationEid}/moratorium_requests/${moratoriumRequestEid}/submit`,
      { data },
    ),

  changeStatus: (
    loanApplicationEid: string,
    moratoriumRequestEid: string,
    data: { status: MoratoriumRequestStatusAction },
  ) =>
    api.patch<void>(
      `/loan_applications/${loanApplicationEid}/moratorium_requests/${moratoriumRequestEid}/change_status`,
      data,
    ),
};
