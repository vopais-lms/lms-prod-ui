import { api } from '../utils/apiClient';
import type {
  AnalyticsLoansByOfficerResponse,
  AnalyticsRatiosResponse,
  AnalyticsSeriesResponse,
  AnalyticsSummaryResponse,
} from './types';

export type AnalyticsMonthRangeParams = {
  start_month?: string;
  end_month?: string;
};

export const analyticsApi = {
  disbursementsByMonth: (params?: AnalyticsMonthRangeParams) =>
    api.get<AnalyticsSeriesResponse>('/analytics/disbursements_by_month', { params }),

  disbursementAmountsByMonth: (params?: AnalyticsMonthRangeParams) =>
    api.get<AnalyticsSeriesResponse>('/analytics/disbursement_amounts_by_month', { params }),

  npaByMonth: (params?: AnalyticsMonthRangeParams) =>
    api.get<AnalyticsSeriesResponse>('/analytics/npa_by_month', { params }),

  collectionsByMonth: (params?: AnalyticsMonthRangeParams) =>
    api.get<AnalyticsSeriesResponse>('/analytics/collections_by_month', { params }),

  ratios: () => api.get<AnalyticsRatiosResponse>('/analytics/ratios'),

  summary: () => api.get<AnalyticsSummaryResponse>('/analytics/summary'),

  loansByOfficer: (loanOfficerEid?: string) =>
    api.get<AnalyticsLoansByOfficerResponse>('/analytics/loans_by_officer', {
      params: loanOfficerEid ? { loan_officer_eid: loanOfficerEid } : undefined,
    }),
};
