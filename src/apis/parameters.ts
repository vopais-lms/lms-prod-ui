import { api } from '../utils/apiClient';
import type {
  Parameter,
  ParameterAllAdaptersCapabilitiesResponse,
  ParameterCapabilityOption,
  ParameterCreateRequest,
  ParameterDetail,
  ParameterLinkExistingFormFieldRequest,
  ParameterListResponse,
  ParameterLoanTypeLinkRequest,
  ParameterLoanTypesResponse,
  ParameterUpdateRequest,
} from './types';

export const parametersApi = {
  list: (params: { page: number; per_page: number }) =>
    api.get<ParameterListResponse>('/parameters/', { params }),

  get: (id: number) => api.get<ParameterDetail>(`/parameters/${id}`),

  create: (data: ParameterCreateRequest) =>
    api.post<Parameter>('/parameters/', data),

  update: (id: number, data: ParameterUpdateRequest) =>
    api.patch<void>(`/parameters/${id}`, data),

  getLoanTypes: (id: number) =>
    api.get<ParameterLoanTypesResponse>(`/parameters/${id}/loan_types`),

  addLoanTypes: (id: number, data: ParameterLoanTypeLinkRequest) =>
    api.post<ParameterLoanTypesResponse>(`/parameters/${id}/add_loan_type`, data),

  linkNewFormField: (id: number, data: { form_json: Record<string, unknown> }) =>
    api.post<{ form_fields: Record<string, unknown> }>(
      `/parameters/${id}/link_new_form_field`,
      data,
    ),

  linkExistingFormField: (id: number, data: ParameterLinkExistingFormFieldRequest) =>
    api.post<void>(`/parameters/${id}/link_existing_form_field`, data),

  /** Aggregated capabilities across all adapters (preferred for FE pickers). */
  allAdapterCapabilities: () =>
    api.get<ParameterAllAdaptersCapabilitiesResponse>(
      '/parameters/adapters/capabilities',
    ),

  adapterCapabilities: (adapter: 'Decentro' | 'Finbox') =>
    api.get<{ data: { label: string; api_adapter_fetch_method: string }[]; name: string }>(
      `/parameters/adapter/${adapter}/capabilities`,
    ),
};

/** Flatten nested adapter capabilities into label-only picker options. */
export function flattenCapabilityOptions(
  groups: ParameterAllAdaptersCapabilitiesResponse['data'] | undefined,
): ParameterCapabilityOption[] {
  if (!groups?.length) return [];
  const options: ParameterCapabilityOption[] = [];
  for (const group of groups) {
    for (const cap of group.capabilities || []) {
      options.push({
        label: cap.label,
        api_adapter: group.adapter_name,
        api_adapter_fetch_method: cap.api_adapter_fetch_method,
      });
    }
  }
  return options;
}

/** Stable select value that encodes adapter + method without showing either. */
export function capabilityOptionValue(opt: ParameterCapabilityOption): string {
  return `${opt.api_adapter}::${opt.api_adapter_fetch_method}`;
}

export function parseCapabilityOptionValue(
  value: string,
  options: ParameterCapabilityOption[],
): ParameterCapabilityOption | null {
  return options.find((o) => capabilityOptionValue(o) === value) || null;
}
