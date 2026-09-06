import { describe, expect, it } from 'vitest';
import {
    emptyFormulaGroup,
    formatFormulaExpr,
    groupToPostfix,
    postfixToGroup,
    validateFormulaGroup,
    type FormulaGroup,
} from './formulaExpression';

function param(field: string) {
    return { kind: 'parameter' as const, field };
}

function num(value: number) {
    return { kind: 'number' as const, value };
}

describe('groupToPostfix', () => {
    it('converts a simple sum', () => {
        const group: FormulaGroup = {
            kind: 'group',
            items: [
                { expr: param('10'), op: '+' },
                { expr: param('9') },
            ],
        };
        expect(groupToPostfix(group)).toEqual(['10', '9', '+']);
    });

    it('applies BODMAS inside a flat group', () => {
        const group: FormulaGroup = {
            kind: 'group',
            items: [
                { expr: param('a'), op: '+' },
                { expr: param('b'), op: '*' },
                { expr: param('c') },
            ],
        };
        expect(groupToPostfix(group)).toEqual(['a', 'b', 'c', '*', '+']);
    });

    it('keeps bracketed groups before multiplication', () => {
        const group: FormulaGroup = {
            kind: 'group',
            items: [
                {
                    expr: {
                        kind: 'group',
                        items: [
                            { expr: param('a'), op: '+' },
                            { expr: param('b') },
                        ],
                    },
                    op: '*',
                },
                { expr: param('c') },
            ],
        };
        expect(groupToPostfix(group)).toEqual(['a', 'b', '+', 'c', '*']);
    });

    it('treats exponent as right-associative', () => {
        const group: FormulaGroup = {
            kind: 'group',
            items: [
                { expr: num(2), op: '**' },
                { expr: num(3), op: '**' },
                { expr: num(2) },
            ],
        };
        expect(groupToPostfix(group)).toEqual([2, 3, 2, '**', '**']);
    });
});

describe('postfixToGroup', () => {
    it('round-trips a grouped product', () => {
        const postfix = ['a', 'b', '+', 'c', '*'];
        expect(groupToPostfix(postfixToGroup(postfix))).toEqual(postfix);
    });

    it('wraps a single field', () => {
        expect(postfixToGroup(['score'])).toEqual({
            kind: 'group',
            items: [{ expr: param('score') }],
        });
    });
});

describe('formatFormulaExpr', () => {
    it('shows ^ for exponents and names for parameters', () => {
        const group = postfixToGroup(['10', 2, '**']);
        expect(formatFormulaExpr(group, (field) => (field === '10' ? 'Income' : field))).toBe(
            '(Income ^ 2)',
        );
    });
});

describe('validateFormulaGroup', () => {
    it('rejects an empty parameter', () => {
        expect(validateFormulaGroup(emptyFormulaGroup())).toMatch(/parameter/i);
    });

    it('accepts a complete group', () => {
        expect(
            validateFormulaGroup({
                kind: 'group',
                items: [
                    { expr: param('10'), op: '+' },
                    { expr: num(5) },
                ],
            }),
        ).toBeNull();
    });
});
