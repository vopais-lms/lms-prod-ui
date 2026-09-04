import { api } from '../utils/apiClient';
import type {
  ParameterGroupingCreatePayload,
  ParameterGroupingDetail,
  ParameterGroupingLinkParentPayload,
  ParameterGroupingListResponse,
  ParameterGroupingUpdatePayload,
} from './types';

export const loanTypeParameterGroupingsApi = {
  list: (loanTypeId: number, params?: { page?: number; per_page?: number }) =>
    api.get<ParameterGroupingListResponse>(`/loan_types/${loanTypeId}/parameter_groupings`, {
      params,
    }),

  get: (loanTypeId: number, groupId: number) =>
    api.get<ParameterGroupingDetail>(
      `/loan_types/${loanTypeId}/parameter_groupings/${groupId}`,
    ),

  create: (loanTypeId: number, data: ParameterGroupingCreatePayload) =>
    api.post<ParameterGroupingDetail>(`/loan_types/${loanTypeId}/parameter_groupings`, data),

  update: (loanTypeId: number, groupId: number, data: ParameterGroupingUpdatePayload) =>
    api.put<void>(`/loan_types/${loanTypeId}/parameter_groupings/${groupId}`, data),

  remove: (loanTypeId: number, groupId: number) =>
    api.delete<void>(`/loan_types/${loanTypeId}/parameter_groupings/${groupId}`),

  linkParent: (
    loanTypeId: number,
    groupId: number,
    data: ParameterGroupingLinkParentPayload,
  ) =>
    api.post<void>(
      `/loan_types/${loanTypeId}/parameter_groupings/${groupId}/add_parent_group`,
      data,
    ),

  unlinkParent: (loanTypeId: number, groupId: number) =>
    api.post<void>(
      `/loan_types/${loanTypeId}/parameter_groupings/${groupId}/remove_parent_group`,
    ),
};
