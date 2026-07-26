import { api } from '../utils/apiClient';
import type { AnalyticsRatiosResponse, AnalyticsSeriesResponse } from './types';

export type AnalyticsMonthRangeParams = {
  start_month?: string;
  end_month?: string;
};

export const analyticsApi = {
  disbursementsByMonth: (params?: AnalyticsMonthRangeParams) =>
    api.get<AnalyticsSeriesResponse>('/analytics/disbursements_by_month', { params }),

  npaByMonth: (params?: AnalyticsMonthRangeParams) =>
    api.get<AnalyticsSeriesResponse>('/analytics/npa_by_month', { params }),

  collectionsByMonth: (params?: AnalyticsMonthRangeParams) =>
    api.get<AnalyticsSeriesResponse>('/analytics/collections_by_month', { params }),

  ratios: () => api.get<AnalyticsRatiosResponse>('/analytics/ratios'),
};
