import { api } from '../utils/apiClient';
import type { TenantDetails } from './types';

// Omit 'eid' for registration body
type RegisterTenantPayload = Omit<TenantDetails, 'eid'>;
type UpdateTenantPayload = Partial<RegisterTenantPayload>;

export const tenantApi = {
  register: (data: RegisterTenantPayload) =>
    api.post<TenantDetails>('/tenant_details/register', data),

  verify: (tenantEid: string) =>
    api.post<void>(`/tenant_details/${tenantEid}/verify`),

  update: (tenantEid: string, data: UpdateTenantPayload) =>
    api.patch<TenantDetails>(`/tenant_details/${tenantEid}`, data),

  getDetails: (tenantEid: string) =>
    api.get<TenantDetails>(`/tenant_details/${tenantEid}`),
};
