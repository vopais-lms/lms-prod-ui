import type { CustomerDocument, GovernmentDocument, PaginatedResponse } from './types';

type CustomerDocumentApiItem = Partial<CustomerDocument> & {
  user_government_document_value_mapping_id: number;
  government_document_id?: number;
  government_document_name?: string;
  extraction_status?: string | null;
  extracted_value?: string | null;
  user_input_value?: string | null;
  manual_verified_timestamp?: string | null;
  extraction_verified_timestamp?: string | null;
  manual_verified_by_employee_eid?: string | null;
  kyc_verification_data?: { manual_verification_note?: string | null } | null;
};

export const normalizeGovernmentDocumentsList = (
  response: GovernmentDocument[] | { data?: GovernmentDocument[] },
): GovernmentDocument[] => {
  if (Array.isArray(response)) {
    return response;
  }
  return response.data ?? [];
};

export const normalizeCustomerDocument = (item: CustomerDocumentApiItem): CustomerDocument => {
  const mappingId = item.user_government_document_value_mapping_id;
  const documentId = item.document_id ?? item.government_document_id ?? 0;
  const documentName = item.document_name ?? item.government_document_name ?? `Document #${documentId}`;
  const isVerified = item.is_verified ?? Boolean(item.manual_verified_timestamp);
  const verificationNote =
    item.verification_note ??
    item.kyc_verification_data?.manual_verification_note ??
    null;

  return {
    id: item.id ?? mappingId,
    user_government_document_value_mapping_id: mappingId,
    document_name: documentName,
    document_id: documentId,
    file_url: item.file_url,
    user_input_value: item.user_input_value ?? undefined,
    extracted_value: item.extracted_value ?? undefined,
    is_verified: isVerified,
    verification_note: verificationNote,
    extraction_status: item.extraction_status ?? undefined,
  };
};

export const normalizeCustomerDocumentsList = (
  response: PaginatedResponse<CustomerDocumentApiItem>,
): PaginatedResponse<CustomerDocument> => ({
  ...response,
  data: (response.data ?? []).map(normalizeCustomerDocument),
});

export const hasUploadedCustomerDocumentFile = (doc: CustomerDocument): boolean => {
  if (doc.file_url) return true;
  if (!doc.extraction_status) return false;
  return doc.extraction_status !== 'upload pending' && doc.extraction_status !== 'pending';
};
