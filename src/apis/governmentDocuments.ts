import { api } from '../utils/apiClient';
import type { GovernmentDocument } from './types';
import { normalizeGovernmentDocumentsList } from './kycMappers';

export const governmentDocumentsApi = {
  list: async (): Promise<GovernmentDocument[]> => {
    const response = await api.get<GovernmentDocument[] | { data: GovernmentDocument[] }>(
      '/government_documents/',
    );
    return normalizeGovernmentDocumentsList(response);
  },
};
