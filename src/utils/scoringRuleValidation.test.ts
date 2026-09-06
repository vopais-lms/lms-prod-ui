import { describe, expect, it } from 'vitest';
import {
  getConditionalDepth,
  normalizeCondition,
  validateScoringRules,
  type ScoringRuleNode,
} from './scoringRuleValidation';

describe('normalizeCondition', () => {
  it('parses dict format', () => {
    expect(normalizeCondition({ field: 'income', operator: '>', value: 5000 })).toEqual({
      field: 'income',
      operator: '>',
      value: 5000,
    });
  });

  it('parses positional format', () => {
    expect(normalizeCondition(['>', 'monthly_income', 50000])).toEqual({
      field: 'monthly_income',
      operator: '>',
      value: 50000,
    });
  });
});

describe('validateScoringRules', () => {
  const scoringTree: ScoringRuleNode[] = [
    {
      type: 'conditional',
      rule: [[{ field: 'age', operator: '>=', value: 21 }]],
      child_rule: [{ type: 'formula', rule: [10], child_rule: [] }],
    },
  ];

  it('accepts valid scoring tree', () => {
    expect(validateScoringRules(scoringTree, 'scoring')).toBeNull();
  });

  it('accepts verification conditional gate without children', () => {
    const gate: ScoringRuleNode[] = [
      {
        type: 'conditional',
        rule: [[{ field: 'age', operator: '>=', value: 21 }]],
        child_rule: [],
      },
    ];
    expect(validateScoringRules(gate, 'verification')).toBeNull();
  });

  it('rejects formula on verification group', () => {
    expect(validateScoringRules(scoringTree, 'verification')).toMatch(/conditional/i);
  });

  it('rejects scoring condition without a formula', () => {
    const missingFormula: ScoringRuleNode[] = [
      {
        type: 'conditional',
        rule: [[{ field: 'age', operator: '>=', value: 21 }]],
        child_rule: [],
      },
    ];
    expect(validateScoringRules(missingFormula, 'scoring')).toMatch(/formula/i);
  });

  it('rejects nested scoring condition without a formula', () => {
    const missingNested: ScoringRuleNode[] = [
      {
        type: 'conditional',
        rule: [[{ field: 'age', operator: '>=', value: 21 }]],
        child_rule: [
          { type: 'formula', rule: [10], child_rule: [] },
          {
            type: 'conditional',
            rule: [[{ field: 'income', operator: '>', value: 0 }]],
            child_rule: [],
          },
        ],
      },
    ];
    expect(validateScoringRules(missingNested, 'scoring')).toMatch(/formula/i);
  });

  it('rejects depth over 10', () => {
    let node: ScoringRuleNode = {
      type: 'formula',
      rule: [1],
      child_rule: [],
    };
    for (let i = 0; i < 11; i += 1) {
      node = {
        type: 'conditional',
        rule: [[{ field: 'x', operator: '==', value: 1 }]],
        child_rule: [node],
      };
    }
    expect(validateScoringRules([node], 'scoring')).toMatch(/10 levels/);
  });
});

describe('getConditionalDepth', () => {
  it('counts nested conditionals', () => {
    const nodes: ScoringRuleNode[] = [
      {
        type: 'conditional',
        rule: [],
        child_rule: [
          {
            type: 'conditional',
            rule: [],
            child_rule: [{ type: 'formula', rule: [1], child_rule: [] }],
          },
        ],
      },
    ];
    expect(getConditionalDepth(nodes)).toBe(2);
  });
});
