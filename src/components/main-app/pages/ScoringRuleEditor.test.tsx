import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import type { ScoringRuleNode } from '../../../utils/scoringRuleValidation';
import { ScoringRuleEditor } from './ScoringRuleEditor';

afterEach(() => {
    cleanup();
});

const formulaNodes: ScoringRuleNode[] = [
    { type: 'formula', rule: [10], child_rule: [] },
];

const expressionNodes: ScoringRuleNode[] = [
    { type: 'formula', rule: ['10', 2, '**'], child_rule: [] },
];

const nestedFormulaNodes: ScoringRuleNode[] = [
    {
        type: 'conditional',
        rule: [[{ field: 'age', operator: '>=', value: 21 }]],
        child_rule: [{ type: 'formula', rule: [25], child_rule: [] }],
    },
];

describe('ScoringRuleEditor expression visibility', () => {
    it('hides root Add Formula for non-support scoring editors', () => {
        render(
            <ScoringRuleEditor
                nodes={[]}
                groupType="scoring"
                fieldOptions={[]}
                onChange={() => {}}
                canUseExpression={false}
            />,
        );
        expect(screen.getByRole('button', { name: 'Add Condition' })).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Add Formula' })).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Expression' })).not.toBeInTheDocument();
    });

    it('shows root Add Formula and Expression for support scoring editors', () => {
        render(
            <ScoringRuleEditor
                nodes={[]}
                groupType="scoring"
                fieldOptions={[]}
                onChange={() => {}}
                canUseExpression
            />,
        );
        expect(screen.getByRole('button', { name: 'Add Condition' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Add Formula' })).toBeInTheDocument();
    });

    it('hides Expression for non-support profiles', () => {
        render(
            <ScoringRuleEditor
                nodes={formulaNodes}
                groupType="scoring"
                fieldOptions={[]}
                onChange={() => {}}
                canUseExpression={false}
            />,
        );
        expect(screen.queryByRole('button', { name: 'Expression' })).not.toBeInTheDocument();
        expect(screen.getByPlaceholderText('Score value')).toBeInTheDocument();
        expect(screen.getByText('Use a fixed score.')).toBeInTheDocument();
    });

    it('shows Expression for support profiles', () => {
        render(
            <ScoringRuleEditor
                nodes={formulaNodes}
                groupType="scoring"
                fieldOptions={[]}
                onChange={() => {}}
                canUseExpression
            />,
        );
        expect(screen.getByRole('button', { name: 'Expression' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Fixed score' })).toBeInTheDocument();
        expect(screen.getByText('Use a fixed score or a formula.')).toBeInTheDocument();
    });

    it('keeps Expression hidden on nested scoring formulas for non-support', () => {
        render(
            <ScoringRuleEditor
                nodes={nestedFormulaNodes}
                groupType="scoring"
                fieldOptions={[]}
                onChange={() => {}}
                canUseExpression={false}
            />,
        );
        expect(screen.queryByRole('button', { name: 'Expression' })).not.toBeInTheDocument();
        expect(screen.getByPlaceholderText('Score value')).toBeInTheDocument();
    });

    it('does not offer Edit formula when a stored expression is viewed without support', () => {
        render(
            <ScoringRuleEditor
                nodes={expressionNodes}
                groupType="scoring"
                fieldOptions={[]}
                onChange={() => {}}
                canUseExpression={false}
            />,
        );
        expect(screen.queryByRole('button', { name: 'Expression' })).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Edit formula' })).not.toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Fixed score' })).toBeInTheDocument();
    });
});
