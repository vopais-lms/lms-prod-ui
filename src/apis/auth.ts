import { api } from '../utils/apiClient';
import { customerAuthHeaders } from '../utils/authSession';
import type { LoginResponse, CustomerLoginResponse, MenuItem } from './types';

export const authApi = {
  login: (credentials: { username: string; password: string }) =>
    api.post<LoginResponse>('/auth/login', credentials),

  customerLogin: (data: { linked_phone_number: string }) =>
    api.post<CustomerLoginResponse>('/auth/customer_login', data, {
      headers: customerAuthHeaders(),
    }),

  authenticateCustomerOtp: (data: { otp: string; linked_phone_number: string }) =>
    api.post<LoginResponse>('/auth/authenticate_customer_otp', data, {
      headers: customerAuthHeaders(),
    }),

  refreshToken: (data: { refresh_token: string }) =>
    api.post<LoginResponse>('/auth/refresh_token', data),

  resetPassword: (data: { new_password: string }) =>
    api.post<void>('/auth/reset_password', data),

  getMenuItems: () =>
    api.get<{ data: MenuItem[] }>('/auth/menu_items'),
};
