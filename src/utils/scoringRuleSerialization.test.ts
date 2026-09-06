import { describe, expect, it } from 'vitest';
import { parseScoringRules, serializeScoringRules } from './scoringRuleSerialization';

describe('scoringRuleSerialization', () => {
    it('serializes editor dicts as positional tokens for the API schema', () => {
        const parsed = parseScoringRules([
            {
                type: 'conditional',
                rule: [[{ field: 'age', operator: '>=', value: 21 }]],
                child_rule: [{ type: 'formula', rule: [25], child_rule: [] }],
            },
        ]);
        expect(serializeScoringRules(parsed)).toEqual([
            {
                type: 'conditional',
                rule: [['>=', 'age', 21]],
                child_rule: [{ type: 'formula', rule: [25], child_rule: [] }],
            },
        ]);
    });

    it('serializes boolean values as strings and flattens conditions', () => {
        expect(
            serializeScoringRules([
                {
                    type: 'conditional',
                    rule: [
                        [
                            { field: '16', operator: '==', value: true },
                            { field: '22', operator: '==', value: true },
                        ],
                    ],
                    child_rule: [{ type: 'formula', rule: ['10', '9', '+', '10'], child_rule: [] }],
                },
            ]),
        ).toEqual([
            {
                type: 'conditional',
                rule: [
                    ['==', '16', 'true'],
                    ['==', '22', 'true'],
                ],
                child_rule: [{ type: 'formula', rule: ['10', '9', '+', '10'], child_rule: [] }],
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
