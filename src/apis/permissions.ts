import { api } from '../utils/apiClient';
import type { Permission } from './types';

type AssignPermissionsPayload = {
  user_eid: string;
  user_username: string;
  user_permissions: Permission[];
};

export const permissionsApi = {
  // Stubs as per documentation
  list: () => 
    api.get('/permissions/'),

  getUserPermissions: () => 
    api.get('/permissions/user_permissions'),

  assignToUser: (data: AssignPermissionsPayload) =>
    api.post('/permissions/user_permissions', data),
};
