import { api } from '../utils/apiClient';
import type { AppModule } from './types';

export const modulesApi = {
  list: () =>
    api.get<{ module_listing: AppModule[] }>('/modules/'),
};
