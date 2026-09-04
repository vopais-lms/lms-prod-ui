import { describe, expect, it } from 'vitest';
import { parseScoringRules, serializeScoringRules } from './scoringRuleSerialization';

describe('scoringRuleSerialization', () => {
  it('round-trips conditional with dict conditions', () => {
    const apiPayload = [
      {
        type: 'conditional',
        rule: [[{ field: 'age', operator: '>=', value: 21 }]],
        child_rule: [{ type: 'formula', rule: [25], child_rule: [] }],
      },
    ];
    const parsed = parseScoringRules(apiPayload);
    const serialized = serializeScoringRules(parsed);
    expect(serialized).toEqual([
      {
        type: 'conditional',
        rule: [[{ field: 'age', operator: '>=', value: 21 }]],
        child_rule: [{ type: 'formula', rule: [25], child_rule: [] }],
      },
    ]);
  });

  it('parses positional conditions from API', () => {
    const parsed = parseScoringRules([
      {
        type: 'conditional',
        rule: [['>', 'monthly_income', 50000]],
        child_rule: [{ type: 'formula', rule: [10], child_rule: [] }],
      },
    ]);
    expect(parsed[0].rule).toEqual([
      [{ field: 'monthly_income', operator: '>', value: 50000 }],
    ]);
  });

  it('serializes formula leaf', () => {
    const parsed = parseScoringRules([
      { type: 'formula', rule: ['a', 'b', '+'], child_rule: [] },
    ]);
    expect(serializeScoringRules(parsed)).toEqual([
      { type: 'formula', rule: ['a', 'b', '+'], child_rule: [] },
    ]);
  });
});
