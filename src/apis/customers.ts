import { api } from '../utils/apiClient';
import type { Customer, PaginatedResponse } from './types';

type CreateCustomerPayload = {
  name: string;
  email: string;
  linked_phone_number: string;
  first_line_address: string;
  second_line_address: string;
  secondary_phone?: string;
};

type UpdateCustomerPayload = Partial<CreateCustomerPayload>;

export const customersApi = {
  list: (params?: { page?: number; per_page?: number }) =>
    api.get<PaginatedResponse<Customer>>('/customers/', { params }),

  get: (customerEid: string) =>
    api.get<Customer>(`/customers/${customerEid}`),

  create: (data: CreateCustomerPayload) =>
    api.post<Customer>('/customers/', data),

  update: (customerEid: string, data: UpdateCustomerPayload) =>
    api.patch<Customer>(`/customers/${customerEid}`, data),

  delete: (customerEid: string) =>
    api.delete<void>(`/customers/${customerEid}`),

  sendOtpsForVerification: (customerEid: string) =>
    api.post<void>(`/customers/${customerEid}/send_otps_for_verification`),

  verifyLinkedPhone: (customerEid: string, data: { otp: string }) =>
    api.post<void>(`/customers/${customerEid}/verify_linked_phone`, data),

  verifyEmail: (customerEid: string, data: { otp: string }) =>
    api.post<void>(`/customers/${customerEid}/verify_email`, data),
};
