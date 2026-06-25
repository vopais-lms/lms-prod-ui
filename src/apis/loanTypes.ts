import { api } from '../utils/apiClient';
import type { LoanType, LoanTypeDetail, LoanTypeFormPurpose, LoanTypeListResponse } from './types';

export const loanTypesApi = {
  list: (params?: { page?: number; per_page?: number }) =>
    api.get<LoanTypeListResponse>('/loan-types/', { params }),

  get: (loanTypeId: number, purpose: LoanTypeFormPurpose) =>
    api.get<LoanTypeDetail>(`/loan-types/${loanTypeId}`, { params: { purpose } }),

  create: (data: { name: string }) =>
    api.post<LoanType>('/loan-types/', data),

  update: (loanTypeId: number, data: { name: string }) =>
    api.patch<void>(`/loan-types/${loanTypeId}`, data),

  changeStatus: (loanTypeId: number, data: { status: boolean }) =>
    api.patch<void>(`/loan-types/${loanTypeId}/change_status`, data),

  saveFormJson: (
    loanTypeId: number,
    data: { form_json: Record<string, unknown>; purpose: LoanTypeFormPurpose },
  ) => api.patch<void>(`/loan-types/${loanTypeId}/form_json_save`, data),
};
