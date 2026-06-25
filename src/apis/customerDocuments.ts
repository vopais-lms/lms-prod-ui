import { api, apiClient } from '../utils/apiClient';
import type { PaginatedResponse } from './types';
import { normalizeCustomerDocument, normalizeCustomerDocumentsList } from './kycMappers';

type CustomerDocumentApiItem = Parameters<typeof normalizeCustomerDocument>[0];

export const customerDocumentsApi = {
  list: async (customerEid: string, params?: { page?: number; per_page?: number }) => {
    const response = await api.get<PaginatedResponse<CustomerDocumentApiItem>>(
      `/customer_documents/${customerEid}`,
      { params },
    );
    return normalizeCustomerDocumentsList(response);
  },

  upload: async (customerEid: string, file: File, governmentDocumentId: number) => {
    const formData = new FormData();
    formData.append('file_obj', file);
    formData.append('government_document_id', String(governmentDocumentId));

    const response = await apiClient<CustomerDocumentApiItem>(
      `/customer_documents/${customerEid}/upload`,
      {
        method: 'POST',
        body: formData,
      },
    );
    return normalizeCustomerDocument(response);
  },

  replaceFile: async (customerEid: string, mappingId: number, file: File) => {
    const formData = new FormData();
    formData.append('file_obj', file);

    const response = await apiClient<CustomerDocumentApiItem>(
      `/customer_documents/${customerEid}/${mappingId}/replace_file`,
      {
        method: 'POST',
        body: formData,
      },
    );
    return normalizeCustomerDocument(response);
  },

  manualValueAdd: (customerEid: string, mappingId: number, data: { user_input_value: string }) =>
    api.patch<void>(`/customer_documents/${customerEid}/${mappingId}/manual_value_add`, data),

  manualVerify: (customerEid: string, mappingId: number, data: { note?: string | null }) =>
    api.patch<void>(`/customer_documents/${customerEid}/${mappingId}/manual_verify`, data),

  delete: (customerEid: string, mappingId: number) =>
    api.delete<void>(`/customer_documents/${customerEid}/${mappingId}`),
};

export const customerVerificationsApi = {
  startExtraction: (customerEid: string, mappingId: number, data: { type_of_document: string; document_id: number }) =>
    api.post<{ status: string }>(`/customer_automated_verifications/extraction/${customerEid}/${mappingId}/start`, data),

  checkExtractionStatus: (customerEid: string, mappingId: number) =>
    api.get<{ extraction_status: string }>(`/customer_automated_verifications/extraction/${customerEid}/${mappingId}/check`),
};
