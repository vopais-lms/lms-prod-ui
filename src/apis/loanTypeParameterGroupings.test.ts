import { describe, expect, it, vi, beforeEach } from 'vitest';
import { loanTypeParameterGroupingsApi } from './loanTypeParameterGroupings';

vi.mock('../utils/apiClient', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

import { api } from '../utils/apiClient';

const mockedApi = vi.mocked(api);

describe('loanTypeParameterGroupingsApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('lists parameter groupings with pagination', async () => {
    mockedApi.get.mockResolvedValueOnce({
      data: [{ id: 1, type_of_group: 'scoring', parent_parameter_group_id: null, group_scoring_weight: 100, created_at: '', updated_at: '' }],
      page: 1,
      per_page: 50,
      total: 1,
    });

    const result = await loanTypeParameterGroupingsApi.list(5, { page: 1, per_page: 50 });
    expect(mockedApi.get).toHaveBeenCalledWith('/loan_types/5/parameter_groupings', {
      params: { page: 1, per_page: 50 },
    });
    expect(result.data).toHaveLength(1);
  });

  it('creates a parameter grouping', async () => {
    mockedApi.post.mockResolvedValueOnce({ id: 2 });
    await loanTypeParameterGroupingsApi.create(5, {
      name: 'Verification gate',
      type_of_group: 'verification',
      group_scoring_weight: 100,
      scoring_rule_json: [],
    });
    expect(mockedApi.post).toHaveBeenCalledWith('/loan_types/5/parameter_groupings', {
      name: 'Verification gate',
      type_of_group: 'verification',
      group_scoring_weight: 100,
      scoring_rule_json: [],
    });
  });

  it('links parent group', async () => {
    mockedApi.post.mockResolvedValueOnce({});
    await loanTypeParameterGroupingsApi.linkParent(5, 10, {
      parent_parameter_group_id: 3,
      group_scoring_weight: 50,
    });
    expect(mockedApi.post).toHaveBeenCalledWith(
      '/loan_types/5/parameter_groupings/10/add_parent_group',
      { parent_parameter_group_id: 3, group_scoring_weight: 50 },
    );
  });

  it('unlinks parent group', async () => {
    mockedApi.post.mockResolvedValueOnce({});
    await loanTypeParameterGroupingsApi.unlinkParent(5, 10);
    expect(mockedApi.post).toHaveBeenCalledWith(
      '/loan_types/5/parameter_groupings/10/remove_parent_group',
    );
  });
});
