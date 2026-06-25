import { api } from '../utils/apiClient';

export const verificationApi = {
  verifyTenant: (tenantEid: string, tenantInputEid: string) =>
    api.post<void>(`/tenant_details/${tenantEid}/verify`, undefined, {
      params: { tenant_input_eid: tenantInputEid },
    }),

  approveTenantInternally: (tenantEid: string, token: string) =>
    api.post<void>(`/tenant_details/${tenantEid}/verify_via_internal_user/approve`, undefined, {
      params: { token },
    }),

  rejectTenantInternally: (tenantEid: string, token: string) =>
    api.post<void>(`/tenant_details/${tenantEid}/verify_via_internal_user/reject`, undefined, {
      params: { token },
    }),

  publicVerifyCustomerPhone: (customerEid: string, data: { otp: string; token: string }) =>
    api.post<void>(`/customers/${customerEid}/public_verify_linked_phone`, data),

  publicVerifyCustomerEmail: (customerEid: string, data: { otp: string; token: string }) =>
    api.post<void>(`/customers/${customerEid}/public_verify_email`, data),
};
