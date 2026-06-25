import { api } from '../utils/apiClient';
import type { Branch, PaginatedResponse } from './types';

// Omit 'id' for creation body
type CreateBranchPayload = Omit<Branch, 'id'> & { is_active?: boolean };
type UpdateBranchPayload = Partial<CreateBranchPayload>;

export const branchesApi = {
  list: (params?: { page?: number; per_page?: number }) =>
    api.get<PaginatedResponse<Branch>>('/branches/', { params }),

  get: (branchId: number) =>
    api.get<Branch>(`/branches/${branchId}`),

  create: (data: CreateBranchPayload) =>
    api.post<Branch>('/branches/', data),

  update: (branchId: number, data: UpdateBranchPayload) =>
    api.patch<Branch>(`/branches/${branchId}`, data),

  delete: (branchId: number) =>
    api.delete<void>(`/branches/${branchId}`),
};
