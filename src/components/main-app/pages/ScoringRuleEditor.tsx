// @ts-nocheck
import { useState } from 'react';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { FormInput, FormModal, FormSelect } from '../shared/FormModal';
import { fromDatetimeLocalValue, toDatetimeLocalValue } from '../../../utils/dateTime';
import {
    coerceConditionValue,
    defaultConditionValue,
    filterRuleFieldOptions,
    findRuleFieldOption,
    ruleFieldOptionValue,
    ruleValueInputKind,
    type RuleFieldOption,
} from '../../../utils/scoringRuleFieldOptions';
import {
    emptyFormulaGroup,
    formatFormulaExpr,
    formatFormulaOp,
    FORMULA_OPS,
    groupToPostfix,
    postfixToGroup,
    validateFormulaGroup,
    type FormulaExpr,
    type FormulaGroup,
    type FormulaOp,
} from '../../../utils/formulaExpression';
import {
    createEmptyConditionalNode,
    createEmptyFormulaNode,
    isConstantFormula,
    MAX_CONDITIONAL_DEPTH,
    normalizeConditionalRule,
    type ConditionDict,
    type ScoringRuleNode,
} from '../../../utils/scoringRuleValidation';

type ScoringRuleEditorProps = {
    nodes: ScoringRuleNode[];
    groupType: 'verification' | 'scoring';
    fieldOptions: RuleFieldOption[];
    onChange: (nodes: ScoringRuleNode[]) => void;
    readOnly?: boolean;
};

type ScoringRuleNodeEditorProps = {
    node: ScoringRuleNode;
    groupType: 'verification' | 'scoring';
    fieldOptions: RuleFieldOption[];
    depth: number;
    onChange: (node: ScoringRuleNode) => void;
    onRemove?: () => void;
    readOnly?: boolean;
};

const OPERATORS = ['==', '!=', '>', '<', '>=', '<='] as const;
const OPERATOR_LABELS: Record<(typeof OPERATORS)[number], string> = {
    '==': 'equals',
    '!=': 'not equals',
    '>': 'greater than',
    '<': 'less than',
    '>=': 'greater than or equal to',
    '<=': 'less than or equal to',
};
function operatorLabel(operator: string): string {
    return OPERATOR_LABELS[operator as (typeof OPERATORS)[number]] || operator;
}

function ParameterFieldSelect({
    value,
    options,
    onChange,
    disabled = false,
    placeholder = 'Select parameter',
}: {
    value: string;
    options: RuleFieldOption[];
    onChange: (value: string) => void;
    disabled?: boolean;
    placeholder?: string;
}) {
    const selectOptions = options.map((option) => ({
        value: ruleFieldOptionValue(option),
        label: option.name,
    }));
    if (value && !selectOptions.some((option) => option.value === value)) {
        selectOptions.unshift({ value, label: value });
    }

    return (
        <FormSelect
            value={value}
            onChange={onChange}
            options={selectOptions}
            placeholder={placeholder}
            disabled={disabled}
        />
    );
}

function ConditionValueInput({
    dataType,
    value,
    onChange,
    disabled = false,
}: {
    dataType: string | undefined;
    value: string | number | boolean;
    onChange: (value: string | number | boolean) => void;
    disabled?: boolean;
}) {
    const kind = ruleValueInputKind(dataType);

    if (kind === 'boolean') {
        const boolValue = coerceConditionValue('boolean', value);
        return (
            <select
                value={boolValue ? 'true' : 'false'}
                disabled={disabled}
                onChange={(event) => onChange(event.target.value === 'true')}
                className="w-full px-3 py-2 text-sm border border-[#D1D5DB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all disabled:bg-[#F9FAFB] disabled:text-[#9CA3AF]"
            >
                <option value="true">true</option>
                <option value="false">false</option>
            </select>
        );
    }

    if (kind === 'number') {
        return (
            <FormInput
                type="number"
                inputMode="decimal"
                value={String(coerceConditionValue('number', value))}
                onChange={(next) => onChange(next === '' ? 0 : Number(next))}
                placeholder="Number"
                disabled={disabled}
            />
        );
    }

    if (kind === 'datetime') {
        return (
            <FormInput
                type="datetime-local"
                value={toDatetimeLocalValue(String(value ?? ''))}
                onChange={(next) => onChange(fromDatetimeLocalValue(next))}
                disabled={disabled}
            />
        );
    }

    return (
        <FormInput
            type="text"
            value={String(value ?? '')}
            onChange={onChange}
            placeholder="Value"
            disabled={disabled}
        />
    );
}

function emptyCondition(): ConditionDict {
    return { field: '', operator: '==', value: '' };
}

function configuredConditionGroups(rule: ScoringRuleNode['rule']): ConditionDict[][] {
    return normalizeConditionalRule(rule)
        .map((group) => group.filter((cond) => String(cond.field ?? '').trim() !== ''))
        .filter((group) => group.length > 0);
}

function formatConditionValue(value: string | number | boolean): string {
    if (typeof value === 'boolean') return value ? 'true' : 'false';
    return String(value ?? '');
}

function formatConditionChip(cond: ConditionDict, options: RuleFieldOption[]): string {
    const parameter = findRuleFieldOption(options, String(cond.field ?? ''))?.name || cond.field || 'Parameter';
    return `${parameter} ${operatorLabel(cond.operator)} ${formatConditionValue(cond.value)}`;
}

function defaultExpressionGroup(options: RuleFieldOption[]): FormulaGroup {
    const first = options[0] ? ruleFieldOptionValue(options[0]) : '';
    const second = options[1] ? ruleFieldOptionValue(options[1]) : first;
    return {
        kind: 'group',
        items: [
            { expr: { kind: 'parameter', field: first }, op: '+' },
            { expr: { kind: 'parameter', field: second } },
        ],
    };
}

function parameterDisplayName(field: string, options: RuleFieldOption[]): string {
    return findRuleFieldOption(options, field)?.name || field || 'parameter';
}

function cloneFormulaGroup(group: FormulaGroup): FormulaGroup {
    return structuredClone(group);
}

function FormulaGroupEditor({
    group,
    fieldOptions,
    onChange,
}: {
    group: FormulaGroup;
    fieldOptions: RuleFieldOption[];
    onChange: (next: FormulaGroup) => void;
}) {
    const setItems = (items: FormulaGroup['items']) => onChange({ kind: 'group', items });

    const updateItemExpr = (index: number, expr: FormulaExpr) => {
        setItems(group.items.map((item, i) => (i === index ? { ...item, expr } : item)));
    };

    const updateItemOp = (index: number, op: FormulaOp) => {
        setItems(group.items.map((item, i) => (i === index ? { ...item, op } : item)));
    };

    const addItem = (expr: FormulaExpr) => {
        const items = group.items.map((item) => ({ ...item }));
        if (items.length > 0 && !items[items.length - 1].op) {
            items[items.length - 1].op = '+';
        }
        items.push({ expr });
        setItems(items);
    };

    const removeLast = () => {
        if (group.items.length <= 1) {
            onChange(emptyFormulaGroup());
            return;
        }
        const items = group.items.slice(0, -1).map((item) => ({ ...item }));
        delete items[items.length - 1].op;
        setItems(items);
    };

    return (
        <div className="rounded-md border border-[#FDE68A] bg-[#FFFBEB] p-3 space-y-3">
            <p className="text-xs font-medium text-[#92400E]">(</p>
            <div className="space-y-3">
                {group.items.map((item, index) => (
                    <div key={`formula-item-${index}`} className="space-y-2">
                        {item.expr.kind === 'group' ? (
                            <FormulaGroupEditor
                                group={item.expr}
                                fieldOptions={fieldOptions}
                                onChange={(next) => updateItemExpr(index, next)}
                            />
                        ) : item.expr.kind === 'parameter' ? (
                            <ParameterFieldSelect
                                value={item.expr.field}
                                options={fieldOptions}
                                onChange={(next) =>
                                    updateItemExpr(index, { kind: 'parameter', field: next })
                                }
                            />
                        ) : (
                            <FormInput
                                type="number"
                                inputMode="decimal"
                                value={String(item.expr.value)}
                                onChange={(next) =>
                                    updateItemExpr(index, {
                                        kind: 'number',
                                        value: next === '' ? 0 : Number(next),
                                    })
                                }
                                placeholder="Number"
                            />
                        )}
                        {index < group.items.length - 1 ? (
                            <select
                                value={item.op || '+'}
                                onChange={(event) =>
                                    updateItemOp(index, event.target.value as FormulaOp)
                                }
                                className="rounded-md border border-[#D1D5DB] px-3 py-2 text-sm"
                            >
                                {FORMULA_OPS.map((op) => (
                                    <option key={op} value={op}>
                                        {formatFormulaOp(op)}
                                    </option>
                                ))}
                            </select>
                        ) : null}
                    </div>
                ))}
            </div>
            <div className="flex flex-wrap gap-2">
                <button
                    type="button"
                    onClick={() => addItem({ kind: 'parameter', field: '' })}
                    className="rounded-md border border-[#FDE68A] bg-white px-2.5 py-1 text-xs font-medium text-[#B45309]"
                >
                    + Parameter
                </button>
                <button
                    type="button"
                    onClick={() => addItem({ kind: 'number', value: 0 })}
                    className="rounded-md border border-[#FDE68A] bg-white px-2.5 py-1 text-xs font-medium text-[#B45309]"
                >
                    + Number
                </button>
                <button
                    type="button"
                    onClick={() => addItem(emptyFormulaGroup())}
                    className="rounded-md border border-[#FDE68A] bg-white px-2.5 py-1 text-xs font-medium text-[#B45309]"
                >
                    + Group
                </button>
                <button
                    type="button"
                    onClick={removeLast}
                    className="rounded-md border border-[#FECACA] bg-[#FEF2F2] px-2.5 py-1 text-xs font-medium text-[#B91C1C]"
                >
                    − Remove last
                </button>
            </div>
            <p className="text-xs font-medium text-[#92400E]">)</p>
        </div>
    );
}

function FormulaExpressionModal({
    isOpen,
    draft,
    fieldOptions,
    error,
    onClose,
    onSave,
    onChangeDraft,
}: {
    isOpen: boolean;
    draft: FormulaGroup;
    fieldOptions: RuleFieldOption[];
    error: string | null;
    onClose: () => void;
    onSave: () => void;
    onChangeDraft: (next: FormulaGroup) => void;
}) {
    return (
        <FormModal
            isOpen={isOpen}
            onClose={onClose}
            title="Edit formula"
            onSubmit={onSave}
            submitLabel="Save formula"
            error={error}
            width="max-w-2xl"
        >
            <p className="mb-3 rounded-lg border border-[#FEF3C7] bg-[#FFFBEB] px-3 py-2 text-sm text-[#92400E]">
                Parameters and numbers in one group become one bracket. Add another group to
                combine expressions. Nest a group to add more brackets. Multiplication, division,
                and exponents follow BODMAS.
            </p>
            <p className="mb-4 text-sm font-medium text-[#111827]">
                {formatFormulaExpr(draft, (field) => parameterDisplayName(field, fieldOptions))}
            </p>
            <FormulaGroupEditor group={draft} fieldOptions={fieldOptions} onChange={onChangeDraft} />
        </FormModal>
    );
}

function FormulaNodeEditor({
    node,
    fieldOptions,
    onChange,
    onRemove,
    readOnly = false,
}: {
    node: ScoringRuleNode;
    fieldOptions: RuleFieldOption[];
    onChange: (node: ScoringRuleNode) => void;
    onRemove?: () => void;
    readOnly?: boolean;
}) {
    const rule = (Array.isArray(node.rule) ? node.rule : []) as Array<string | number>;
    const constantMode = isConstantFormula(rule);
    const formulaOptions = filterRuleFieldOptions(fieldOptions, 'formula');
    const [modalOpen, setModalOpen] = useState(false);
    const [draft, setDraft] = useState<FormulaGroup>(emptyFormulaGroup());
    const [modalError, setModalError] = useState<string | null>(null);

    const expressionGroup = constantMode ? emptyFormulaGroup() : postfixToGroup(rule);
    const expressionLabel = formatFormulaExpr(expressionGroup, (field) =>
        parameterDisplayName(field, formulaOptions),
    );

    const openModal = (nextRule?: Array<string | number>) => {
        const tokens = nextRule ?? rule;
        setDraft(
            cloneFormulaGroup(
                isConstantFormula(tokens) ? defaultExpressionGroup(formulaOptions) : postfixToGroup(tokens),
            ),
        );
        setModalError(null);
        setModalOpen(true);
    };

    const saveModal = () => {
        const error = validateFormulaGroup(draft);
        if (error) {
            setModalError(error);
            return;
        }
        onChange({ ...node, rule: groupToPostfix(draft) });
        setModalOpen(false);
    };

    return (
        <div className="rounded-lg border border-[#FDE68A] bg-[#FFFBEB] p-4 space-y-3">
            <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-[#B45309]">Formula</p>
                {onRemove && !readOnly ? (
                    <button type="button" onClick={onRemove} className="text-red-600">
                        <TrashIcon className="h-4 w-4" />
                    </button>
                ) : null}
            </div>
            <p className="text-xs text-[#92400E]">
                Use a fixed score or a formula.
            </p>

            {!readOnly ? (
                <div className="flex flex-wrap gap-2">
                    <button
                        type="button"
                        onClick={() => onChange({ ...node, rule: [Number(rule[0]) || 0] })}
                        className={`rounded-md px-2.5 py-1 text-xs font-medium ${constantMode
                                ? 'bg-[#B45309] text-white'
                                : 'border border-[#FDE68A] text-[#B45309] hover:bg-[#FEF3C7]'
                            }`}
                    >
                        Fixed score
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            const next = constantMode
                                ? groupToPostfix(defaultExpressionGroup(formulaOptions))
                                : rule;
                            if (constantMode) onChange({ ...node, rule: next });
                            openModal(next);
                        }}
                        className={`rounded-md px-2.5 py-1 text-xs font-medium ${!constantMode
                                ? 'bg-[#B45309] text-white'
                                : 'border border-[#FDE68A] text-[#B45309] hover:bg-[#FEF3C7]'
                            }`}
                    >
                        Expression
                    </button>
                </div>
            ) : null}

            {constantMode ? (
                <input
                    type="number"
                    value={Number(rule[0]) || 0}
                    disabled={readOnly}
                    onChange={(event) =>
                        onChange({ ...node, rule: [Number(event.target.value)] })
                    }
                    className="w-full rounded-md border border-[#D1D5DB] px-3 py-2 text-sm"
                    placeholder="Score value"
                />
            ) : (
                <div className="space-y-2">
                    <p className="rounded-md border border-[#FDE68A] bg-white px-3 py-2 text-sm text-[#111827]">
                        {expressionLabel}
                    </p>
                    {!readOnly ? (
                        <button
                            type="button"
                            onClick={() => openModal()}
                            className="rounded-md border border-[#FDE68A] bg-white px-3 py-1.5 text-xs font-medium text-[#B45309]"
                        >
                            Edit formula
                        </button>
                    ) : null}
                </div>
            )}

            <FormulaExpressionModal
                isOpen={modalOpen}
                draft={draft}
                fieldOptions={formulaOptions}
                error={modalError}
                onClose={() => setModalOpen(false)}
                onSave={saveModal}
                onChangeDraft={setDraft}
            />
        </div>
    );
}

function ConditionGroupModal({
    isOpen,
    isEditing,
    draft,
    fieldOptions,
    error,
    onClose,
    onSave,
    onChangeDraft,
}: {
    isOpen: boolean;
    isEditing: boolean;
    draft: ConditionDict[];
    fieldOptions: RuleFieldOption[];
    error: string | null;
    onClose: () => void;
    onSave: () => void;
    onChangeDraft: (next: ConditionDict[]) => void;
}) {
    const updateRow = (index: number, patch: Partial<ConditionDict>) => {
        onChangeDraft(draft.map((row, i) => (i === index ? { ...row, ...patch } : row)));
    };

    return (
        <FormModal
            isOpen={isOpen}
            onClose={onClose}
            title={isEditing ? 'Edit condition group' : 'Add condition group'}
            onSubmit={onSave}
            submitLabel="Save group"
            error={error}
            width="max-w-2xl"
        >
            <p className="mb-4 rounded-lg border border-[#DBEAFE] bg-[#EFF6FF] px-3 py-2 text-sm text-[#1E3A8A]">
                You can add more than one check. If any check in this group is true, the whole group
                is true.
            </p>
            <div className="space-y-3">
                {draft.map((cond, index) => (
                    <div
                        key={`draft-${index}`}
                        className="grid grid-cols-1 gap-2 md:grid-cols-[1fr_auto_1fr_auto]"
                    >
                        <ParameterFieldSelect
                            value={String(cond.field ?? '')}
                            options={fieldOptions}
                            onChange={(next) => {
                                const previous = findRuleFieldOption(fieldOptions, String(cond.field ?? ''));
                                const selected = findRuleFieldOption(fieldOptions, next);
                                const previousKind = ruleValueInputKind(previous?.dataType);
                                const nextKind = ruleValueInputKind(selected?.dataType);
                                updateRow(index, {
                                    field: next,
                                    ...(previousKind === nextKind ? {} : { value: defaultConditionValue(nextKind) }),
                                });
                            }}
                        />
                        <select
                            value={cond.operator}
                            onChange={(event) => updateRow(index, { operator: event.target.value })}
                            className="rounded-md border border-[#D1D5DB] px-3 py-2 text-sm"
                        >
                            {OPERATORS.map((op) => (
                                <option key={op} value={op}>
                                    {operatorLabel(op)}
                                </option>
                            ))}
                        </select>
                        <ConditionValueInput
                            dataType={findRuleFieldOption(fieldOptions, String(cond.field ?? ''))?.dataType}
                            value={cond.value}
                            onChange={(next) => updateRow(index, { value: next })}
                        />
                        {draft.length > 1 ? (
                            <button
                                type="button"
                                onClick={() => onChangeDraft(draft.filter((_, i) => i !== index))}
                                className="rounded p-2 text-red-600 hover:bg-red-50"
                                aria-label="Remove check"
                            >
                                <TrashIcon className="h-4 w-4" />
                            </button>
                        ) : (
                            <span />
                        )}
                    </div>
                ))}
                <button
                    type="button"
                    onClick={() => onChangeDraft([...draft, emptyCondition()])}
                    className="rounded-md border border-[#BFDBFE] bg-[#EFF6FF] px-3 py-1.5 text-sm font-medium text-[#1D4ED8]"
                >
                    +
                </button>
            </div>
        </FormModal>
    );
}

function ScoringRuleNodeEditor({
    node,
    groupType,
    fieldOptions,
    depth,
    onChange,
    onRemove,
    readOnly = false,
}: ScoringRuleNodeEditorProps) {
    const atMaxDepth = depth >= MAX_CONDITIONAL_DEPTH;
    const conditionOptions = filterRuleFieldOptions(fieldOptions, 'condition');
    const [modalOpen, setModalOpen] = useState(false);
    const [editingGroupIndex, setEditingGroupIndex] = useState<number | null>(null);
    const [draft, setDraft] = useState<ConditionDict[]>([emptyCondition()]);
    const [modalError, setModalError] = useState<string | null>(null);

    if (node.type === 'conditional') {
        const groups = configuredConditionGroups(node.rule);

        const openAddGroup = () => {
            setEditingGroupIndex(null);
            setDraft([emptyCondition()]);
            setModalError(null);
            setModalOpen(true);
        };

        const openEditGroup = (index: number) => {
            setEditingGroupIndex(index);
            setDraft(groups[index].map((cond) => ({ ...cond })));
            setModalError(null);
            setModalOpen(true);
        };

        const closeModal = () => {
            setModalOpen(false);
            setModalError(null);
        };

        const saveGroup = () => {
            const cleaned = draft.filter((cond) => String(cond.field ?? '').trim() !== '');
            if (cleaned.length === 0) {
                setModalError('Add at least one check with a parameter.');
                return;
            }
            const next =
                editingGroupIndex == null
                    ? [...groups, cleaned]
                    : groups.map((group, index) => (index === editingGroupIndex ? cleaned : group));
            const nextChildren =
                groupType === 'scoring' && !node.child_rule.some((child) => child.type === 'formula')
                    ? [...node.child_rule, createEmptyFormulaNode()]
                    : node.child_rule;
            onChange({ ...node, rule: next, child_rule: nextChildren });
            closeModal();
        };

        const removeLastCondition = () => {
            if (groups.length === 0) return;
            const next = groups.map((group) => group.map((cond) => ({ ...cond })));
            const lastGroup = next[next.length - 1];
            lastGroup.pop();
            if (lastGroup.length === 0) next.pop();
            onChange({ ...node, rule: next });
        };

        const updateChild = (index: number, child: ScoringRuleNode) => {
            const nextChildren = [...node.child_rule];
            nextChildren[index] = child;
            onChange({ ...node, child_rule: nextChildren });
        };

        const removeChild = (index: number) => {
            onChange({ ...node, child_rule: node.child_rule.filter((_, i) => i !== index) });
        };

        const addChild = (type: ScoringRuleNode['type']) => {
            const child =
                type === 'conditional'
                    ? createEmptyConditionalNode(groupType)
                    : createEmptyFormulaNode();
            onChange({ ...node, child_rule: [...node.child_rule, child] });
        };

        const formulaChildren = node.child_rule
            .map((child, index) => ({ child, index }))
            .filter(({ child }) => child.type === 'formula');
        const nestedConditions = node.child_rule
            .map((child, index) => ({ child, index }))
            .filter(({ child }) => child.type === 'conditional');

        return (
            <div className="rounded-lg border border-[#E5E7EB] bg-[#FAFAFA] p-4 space-y-4">
                <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-[#111827]">Condition</p>
                    {onRemove && !readOnly ? (
                        <button type="button" onClick={onRemove} className="text-red-600 hover:text-red-700">
                            <TrashIcon className="h-4 w-4" />
                        </button>
                    ) : null}
                </div>

                {groups.length === 0 ? (
                    <p className="text-sm text-[#111827]">
                        if{' '}
                        {!readOnly ? (
                            <button
                                type="button"
                                onClick={openAddGroup}
                                className="rounded-md border border-[#BFDBFE] bg-[#EFF6FF] px-2.5 py-1 text-sm font-medium text-[#1D4ED8]"
                            >
                                Add condition group
                            </button>
                        ) : (
                            <span className="text-[#6B7280]">(no checks yet)</span>
                        )}
                    </p>
                ) : (
                    <div className="space-y-4">
                        {groups.map((group, groupIndex) => (
                            <div key={`group-${groupIndex}`} className="text-sm text-[#111827]">
                                {groupIndex > 0 ? (
                                    <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
                                        and
                                    </p>
                                ) : null}
                                <p className="flex flex-wrap items-center gap-1.5">
                                    <span>if (</span>
                                    {group.map((cond, condIndex) => (
                                        <span key={`chip-${groupIndex}-${condIndex}`} className="contents">
                                            {condIndex > 0 ? (
                                                <span className="font-medium text-[#6B7280]">OR</span>
                                            ) : null}
                                            <button
                                                type="button"
                                                onClick={() => !readOnly && openEditGroup(groupIndex)}
                                                className="rounded-md border border-[#E5E7EB] bg-white px-2 py-1 text-sm text-[#111827] hover:bg-[#F9FAFB]"
                                            >
                                                {formatConditionChip(cond, conditionOptions)}
                                            </button>
                                        </span>
                                    ))}
                                    <span>)</span>
                                </p>
                            </div>
                        ))}
                        {!readOnly ? (
                            <div className="flex flex-wrap gap-2">
                                <button
                                    type="button"
                                    onClick={openAddGroup}
                                    className="rounded-md border border-[#BFDBFE] bg-[#EFF6FF] px-3 py-1.5 text-xs font-medium text-[#1D4ED8]"
                                >
                                    + Add another condition group
                                </button>
                                <button
                                    type="button"
                                    onClick={removeLastCondition}
                                    className="rounded-md border border-[#FECACA] bg-[#FEF2F2] px-3 py-1.5 text-xs font-medium text-[#B91C1C]"
                                >
                                    − Remove last condition
                                </button>
                            </div>
                        ) : null}

                        {groupType === 'scoring' ? (
                            <div className="space-y-2">
                                <p className="text-xs text-[#6B7280]">
                                    Add a formula to calculate the score when this condition is met.
                                </p>
                                {formulaChildren.map(({ child, index }) => (
                                    <ScoringRuleNodeEditor
                                        key={`formula-${depth}-${index}`}
                                        node={child}
                                        groupType={groupType}
                                        fieldOptions={fieldOptions}
                                        depth={depth + 1}
                                        onChange={(next) => updateChild(index, next)}
                                        readOnly={readOnly}
                                    />
                                ))}
                                {!readOnly && formulaChildren.length === 0 ? (
                                    <button
                                        type="button"
                                        onClick={() => addChild('formula')}
                                        className="rounded-md border border-[#FDE68A] bg-[#FFFBEB] px-3 py-1.5 text-xs font-medium text-[#B45309]"
                                    >
                                        Add Formula
                                    </button>
                                ) : null}
                            </div>
                        ) : null}

                        {nestedConditions.map(({ child, index }) => (
                            <ScoringRuleNodeEditor
                                key={`nested-${depth}-${index}`}
                                node={child}
                                groupType={groupType}
                                fieldOptions={fieldOptions}
                                depth={depth + 1}
                                onChange={(next) => updateChild(index, next)}
                                onRemove={() => removeChild(index)}
                                readOnly={readOnly}
                            />
                        ))}

                        {!readOnly && !atMaxDepth ? (
                            <button
                                type="button"
                                onClick={() => addChild('conditional')}
                                className="rounded-md border border-[#BFDBFE] bg-[#EFF6FF] px-3 py-1.5 text-xs font-medium text-[#1D4ED8]"
                            >
                                Add Condition
                            </button>
                        ) : null}
                    </div>
                )}

                <ConditionGroupModal
                    isOpen={modalOpen}
                    isEditing={editingGroupIndex != null}
                    draft={draft}
                    fieldOptions={conditionOptions}
                    error={modalError}
                    onClose={closeModal}
                    onSave={saveGroup}
                    onChangeDraft={setDraft}
                />
            </div>
        );
    }

    return (
        <FormulaNodeEditor
            node={node}
            fieldOptions={fieldOptions}
            onChange={onChange}
            onRemove={onRemove}
            readOnly={readOnly}
        />
    );
}

export function ScoringRuleEditor({
    nodes,
    groupType,
    fieldOptions,
    onChange,
    readOnly = false,
}: ScoringRuleEditorProps) {
    const updateNode = (index: number, node: ScoringRuleNode) => {
        const next = [...nodes];
        next[index] = node;
        onChange(next);
    };

    const removeNode = (index: number) => {
        onChange(nodes.filter((_, i) => i !== index));
    };

    const addRootNode = (type: ScoringRuleNode['type']) => {
        const next =
            type === 'conditional'
                ? createEmptyConditionalNode(groupType)
                : createEmptyFormulaNode();
        onChange([...nodes, next]);
    };

    return (
        <div className="space-y-4">
            {nodes.map((node, index) => (
                <ScoringRuleNodeEditor
                    key={`root-${index}`}
                    node={node}
                    groupType={groupType}
                    fieldOptions={fieldOptions}
                    depth={1}
                    onChange={(next) => updateNode(index, next)}
                    onRemove={() => removeNode(index)}
                    readOnly={readOnly}
                />
            ))}

            {!readOnly ? (
                <div className="flex flex-wrap gap-2">
                    <button
                        type="button"
                        onClick={() => addRootNode('conditional')}
                        className="inline-flex items-center gap-2 rounded-lg border border-[#BFDBFE] bg-[#EFF6FF] px-4 py-2 text-sm font-medium text-[#1D4ED8] hover:bg-[#DBEAFE]"
                    >
                        <PlusIcon className="h-4 w-4" />
                        Add Condition
                    </button>
                    {groupType === 'scoring' ? (
                        <button
                            type="button"
                            onClick={() => addRootNode('formula')}
                            className="inline-flex items-center gap-2 rounded-lg border border-[#FDE68A] bg-[#FFFBEB] px-4 py-2 text-sm font-medium text-[#B45309] hover:bg-[#FEF3C7]"
                        >
                            <PlusIcon className="h-4 w-4" />
                            Add Formula
                        </button>
                    ) : null}
                </div>
            ) : null}
        </div>
    );
}
