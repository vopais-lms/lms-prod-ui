import { api } from '../utils/apiClient';
import type {
  LoanCollection,
  PaginatedListResponse,
} from './types';

export type PaymentMode = 'UPI' | 'NEFT' | 'RTGS' | 'CHEQUE' | 'CASH';

export type LoanCollectionCreatePayload = {
  amount: number;
  collection_datetime: string;
  payment_mode: PaymentMode;
  utr?: string | null;
};

export type LoanCollectionUpdatePayload = {
  amount?: number;
  collection_datetime?: string;
  payment_mode?: PaymentMode;
  utr?: string | null;
};

export const loanCollectionsApi = {
  list: (loanApplicationEid: string, params?: { page?: number; per_page?: number }) =>
    api.get<PaginatedListResponse<LoanCollection>>(
      `/loan_applications/${loanApplicationEid}/collections`,
      { params },
    ),

  get: (loanApplicationEid: string, collectionId: number) =>
    api.get<LoanCollection>(
      `/loan_applications/${loanApplicationEid}/collections/${collectionId}`,
    ),

  create: (loanApplicationEid: string, data: LoanCollectionCreatePayload) =>
    api.post<LoanCollection>(
      `/loan_applications/${loanApplicationEid}/collections`,
      data,
    ),

  update: (loanApplicationEid: string, collectionId: number, data: LoanCollectionUpdatePayload) =>
    api.patch<void>(
      `/loan_applications/${loanApplicationEid}/collections/${collectionId}`,
      data,
    ),

  approve: (loanApplicationEid: string, collectionId: number) =>
    api.patch<void>(
      `/loan_applications/${loanApplicationEid}/collections/${collectionId}/approve`,
      {},
    ),

  reject: (loanApplicationEid: string, collectionId: number) =>
    api.patch<void>(
      `/loan_applications/${loanApplicationEid}/collections/${collectionId}/reject`,
      {},
    ),
};
