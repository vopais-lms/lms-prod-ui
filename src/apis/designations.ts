import { api } from '../utils/apiClient';
import type { EmployeeDesignation, PaginatedResponse } from './types';

type CreateDesignationPayload = Omit<EmployeeDesignation, 'id'>;

export const designationsApi = {
  list: (params?: { page?: number; per_page?: number }) =>
    api.get<PaginatedResponse<EmployeeDesignation>>('/employee_designations/', { params }),

  get: (designationId: number) =>
    api.get<EmployeeDesignation>(`/employee_designations/${designationId}`),

  create: (data: CreateDesignationPayload) =>
    api.post<EmployeeDesignation>('/employee_designations/', data),

  update: (designationId: number, data: CreateDesignationPayload) =>
    api.patch<EmployeeDesignation>(`/employee_designations/${designationId}`, data),

  delete: (designationId: number) =>
    api.delete<void>(`/employee_designations/${designationId}`),
};
