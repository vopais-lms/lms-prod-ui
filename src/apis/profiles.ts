import { api } from '../utils/apiClient';
import type { Profile, PaginatedResponse } from './types';

type CreateProfilePayload = Omit<Profile, 'id' | 'modules'>;
type UpdateProfilePayload = Partial<CreateProfilePayload>;

export const profilesApi = {
  list: (params?: { page?: number; per_page?: number }) =>
    api.get<PaginatedResponse<Profile>>('/profiles/', { params }),

  get: (profileId: number) =>
    api.get<Profile>(`/profiles/${profileId}`),

  getModules: (profileId: number) =>
    api.get<Profile>(`/profiles/${profileId}/modules`),

  create: (data: CreateProfilePayload) =>
    api.post<Profile>('/profiles/', data),

  update: (profileId: number, data: UpdateProfilePayload) =>
    api.patch<Profile>(`/profiles/${profileId}`, data),

  delete: (profileId: number) =>
    api.delete<void>(`/profiles/${profileId}`),

  createModuleMappings: (profileId: number, moduleIds: number[]) =>
    api.post<void>(`/profiles/${profileId}/create_module_mappings`, {
      modules: moduleIds.map((id) => ({ id })),
    }),
};
