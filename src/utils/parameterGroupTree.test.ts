import { describe, expect, it } from 'vitest';
import {
  buildParameterGroupTree,
  flattenParameterGroupTree,
  isDescendant,
  wouldCreateCycle,
  type ParameterGroupListItem,
} from './parameterGroupTree';

const base = (overrides: Partial<ParameterGroupListItem>): ParameterGroupListItem => ({
  id: 1,
  name: 'Group 1',
  type_of_group: 'scoring',
  parent_parameter_group_id: null,
  group_scoring_weight: 100,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
  ...overrides,
});

describe('buildParameterGroupTree', () => {
  it('builds nested tree from flat list', () => {
    const items = [
      base({ id: 1, parent_parameter_group_id: null }),
      base({ id: 2, parent_parameter_group_id: 1, group_scoring_weight: 50 }),
      base({ id: 3, parent_parameter_group_id: null, type_of_group: 'verification' }),
    ];
    const tree = buildParameterGroupTree(items);
    expect(tree).toHaveLength(2);
    expect(tree[0].children).toHaveLength(1);
    expect(tree[0].children[0].id).toBe(2);
  });

  it('treats missing parent as root', () => {
    const items = [base({ id: 5, parent_parameter_group_id: 99 })];
    const tree = buildParameterGroupTree(items);
    expect(tree).toHaveLength(1);
    expect(tree[0].id).toBe(5);
  });
});

describe('flattenParameterGroupTree', () => {
  it('assigns depth to nested rows', () => {
    const tree = buildParameterGroupTree([
      base({ id: 1 }),
      base({ id: 2, parent_parameter_group_id: 1 }),
    ]);
    const rows = flattenParameterGroupTree(tree);
    expect(rows.map((r) => r.depth)).toEqual([0, 1]);
  });
});

describe('wouldCreateCycle', () => {
  const items = [
    base({ id: 1 }),
    base({ id: 2, parent_parameter_group_id: 1 }),
    base({ id: 3, parent_parameter_group_id: 2 }),
  ];

  it('detects self-parent', () => {
    expect(wouldCreateCycle(2, 2, items)).toBe(true);
  });

  it('detects ancestor cycle', () => {
    expect(wouldCreateCycle(1, 3, items)).toBe(true);
  });

  it('allows valid reparent', () => {
    expect(wouldCreateCycle(3, 1, items)).toBe(false);
  });
});

describe('isDescendant', () => {
  const items = [
    base({ id: 1 }),
    base({ id: 2, parent_parameter_group_id: 1 }),
  ];

  it('returns true for direct child', () => {
    expect(isDescendant(1, 2, items)).toBe(true);
  });

  it('returns false for unrelated node', () => {
    expect(isDescendant(2, 1, items)).toBe(false);
  });
});
