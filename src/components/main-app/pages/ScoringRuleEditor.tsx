// @ts-nocheck
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { FormSelect } from '../shared/FormModal';
import {
  filterRuleFieldOptions,
  ruleFieldOptionValue,
  type RuleFieldOption,
} from '../../../utils/scoringRuleFieldOptions';
import {
  createEmptyConditionalNode,
  createEmptyFormulaNode,
  isConstantFormula,
  MAX_CONDITIONAL_DEPTH,
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

const OPERATORS = ['==', '!=', '>', '<', '>=', '<='];
const FORMULA_OPERATORS = ['+', '-', '*', '/', '%'];

function updateCondition(
  node: ScoringRuleNode,
  andIndex: number,
  orIndex: number,
  patch: Partial<ConditionDict>,
): ScoringRuleNode {
  const rule = normalizeRuleMatrix(node.rule);
  const next = rule.map((group, gi) =>
    gi === andIndex
      ? group.map((cond, oi) => (oi === orIndex ? { ...cond, ...patch } : cond))
      : group,
  );
  return { ...node, rule: next };
}

function normalizeRuleMatrix(rule: ScoringRuleNode['rule']): ConditionDict[][] {
  if (!Array.isArray(rule)) return [[{ field: '', operator: '==', value: '' }]];
  if (rule.length === 0) return [[{ field: '', operator: '==', value: '' }]];
  if (Array.isArray(rule[0])) {
    return (rule as ConditionDict[][]).map((group) =>
      group.length > 0 ? group : [{ field: '', operator: '==', value: '' }],
    );
  }
  return [[{ field: '', operator: '==', value: '' }]];
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

function defaultExpressionRule(options: RuleFieldOption[]): Array<string | number> {
  const first = options[0] ? ruleFieldOptionValue(options[0]) : '';
  const second = options[1]
    ? ruleFieldOptionValue(options[1])
    : first;
  return [first, second, '+'];
}

function isFormulaOperator(token: string | number): boolean {
  return FORMULA_OPERATORS.includes(String(token));
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

  const updateToken = (index: number, token: string | number) => {
    const next = [...rule];
    next[index] = token;
    onChange({ ...node, rule: next });
  };

  const removeToken = (index: number) => {
    onChange({ ...node, rule: rule.filter((_, i) => i !== index) });
  };

  const addToken = (token: string | number) => {
    onChange({ ...node, rule: [...rule, token] });
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

      {!readOnly ? (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onChange({ ...node, rule: [Number(rule[0]) || 0] })}
            className={`rounded-md px-2.5 py-1 text-xs font-medium ${
              constantMode
                ? 'bg-[#B45309] text-white'
                : 'border border-[#FDE68A] text-[#B45309] hover:bg-[#FEF3C7]'
            }`}
          >
            Fixed score
          </button>
          <button
            type="button"
            onClick={() =>
              onChange({ ...node, rule: defaultExpressionRule(formulaOptions) })
            }
            className={`rounded-md px-2.5 py-1 text-xs font-medium ${
              !constantMode
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
          {rule.map((token, index) => {
            const tokenKey = `formula-token-${index}`;
            if (isFormulaOperator(token)) {
              return (
                <div key={tokenKey} className="flex items-center gap-2">
                  <select
                    value={String(token)}
                    disabled={readOnly}
                    onChange={(event) => updateToken(index, event.target.value)}
                    className="w-full rounded-md border border-[#D1D5DB] px-3 py-2 text-sm"
                  >
                    {FORMULA_OPERATORS.map((op) => (
                      <option key={op} value={op}>
                        {op}
                      </option>
                    ))}
                  </select>
                  {!readOnly ? (
                    <button
                      type="button"
                      onClick={() => removeToken(index)}
                      className="rounded p-2 text-red-600 hover:bg-red-50"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  ) : null}
                </div>
              );
            }

            if (typeof token === 'number') {
              return (
                <div key={tokenKey} className="flex items-center gap-2">
                  <input
                    type="number"
                    value={token}
                    disabled={readOnly}
                    onChange={(event) =>
                      updateToken(index, Number(event.target.value))
                    }
                    className="w-full rounded-md border border-[#D1D5DB] px-3 py-2 text-sm"
                  />
                  {!readOnly ? (
                    <button
                      type="button"
                      onClick={() => removeToken(index)}
                      className="rounded p-2 text-red-600 hover:bg-red-50"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  ) : null}
                </div>
              );
            }

            return (
              <div key={tokenKey} className="flex items-center gap-2">
                <ParameterFieldSelect
                  value={String(token)}
                  options={formulaOptions}
                  onChange={(next) => updateToken(index, next)}
                  disabled={readOnly}
                />
                {!readOnly ? (
                  <button
                    type="button"
                    onClick={() => removeToken(index)}
                    className="rounded p-2 text-red-600 hover:bg-red-50"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                ) : null}
              </div>
            );
          })}
          {!readOnly ? (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => addToken(formulaOptions[0] ? ruleFieldOptionValue(formulaOptions[0]) : '')}
                className="text-xs font-medium text-[#B45309] hover:underline"
              >
                + Parameter
              </button>
              <button
                type="button"
                onClick={() => addToken(0)}
                className="text-xs font-medium text-[#B45309] hover:underline"
              >
                + Number
              </button>
              <button
                type="button"
                onClick={() => addToken('+')}
                className="text-xs font-medium text-[#B45309] hover:underline"
              >
                + Operator
              </button>
            </div>
          ) : null}
        </div>
      )}
      <p className="text-xs text-[#92400E]">
        Use a fixed score or a postfix expression. Formula parameters exclude boolean and string types.
      </p>
    </div>
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

  if (node.type === 'conditional') {
    const conditions = normalizeRuleMatrix(node.rule);

    const setConditions = (next: ConditionDict[][]) => {
      onChange({ ...node, rule: next });
    };

    const addAndGroup = () => {
      setConditions([...conditions, [{ field: '', operator: '==', value: '' }]]);
    };

    const addOrCondition = (andIndex: number) => {
      const next = conditions.map((group, index) =>
        index === andIndex
          ? [...group, { field: '', operator: '==', value: '' }]
          : group,
      );
      setConditions(next);
    };

    const removeOrCondition = (andIndex: number, orIndex: number) => {
      const next = conditions
        .map((group, index) =>
          index === andIndex ? group.filter((_, oi) => oi !== orIndex) : group,
        )
        .filter((group) => group.length > 0);
      setConditions(next.length > 0 ? next : [[{ field: '', operator: '==', value: '' }]]);
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
        type === 'conditional' ? createEmptyConditionalNode() : createEmptyFormulaNode();
      onChange({ ...node, child_rule: [...node.child_rule, child] });
    };

    return (
      <div className="rounded-lg border border-[#E5E7EB] bg-[#FAFAFA] p-4 space-y-4">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-semibold text-[#111827]">
            Condition
          </p>
          {onRemove && !readOnly ? (
            <button type="button" onClick={onRemove} className="text-red-600 hover:text-red-700">
              <TrashIcon className="h-4 w-4" />
            </button>
          ) : null}
        </div>

        <div className="space-y-3">
          {conditions.map((orGroup, andIndex) => (
            <div key={`and-${andIndex}`} className="rounded-md border border-[#E5E7EB] bg-white p-3">
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-[#6B7280]">
                AND group {andIndex + 1}
              </p>
              <div className="space-y-2">
                {orGroup.map((cond, orIndex) => (
                  <div key={`or-${andIndex}-${orIndex}`} className="grid grid-cols-1 gap-2 md:grid-cols-[1fr_auto_1fr_auto]">
                    <ParameterFieldSelect
                      value={String(cond.field ?? '')}
                      options={conditionOptions}
                      onChange={(next) =>
                        onChange(updateCondition(node, andIndex, orIndex, { field: next }))
                      }
                      disabled={readOnly}
                    />
                    <select
                      value={cond.operator}
                      disabled={readOnly}
                      onChange={(event) =>
                        onChange(
                          updateCondition(node, andIndex, orIndex, { operator: event.target.value }),
                        )
                      }
                      className="rounded-md border border-[#D1D5DB] px-3 py-2 text-sm"
                    >
                      {OPERATORS.map((op) => (
                        <option key={op} value={op}>
                          {op}
                        </option>
                      ))}
                    </select>
                    <input
                      value={String(cond.value ?? '')}
                      disabled={readOnly}
                      onChange={(event) =>
                        onChange(updateCondition(node, andIndex, orIndex, { value: event.target.value }))
                      }
                      placeholder="Value"
                      className="rounded-md border border-[#D1D5DB] px-3 py-2 text-sm"
                    />
                    {!readOnly ? (
                      <button
                        type="button"
                        onClick={() => removeOrCondition(andIndex, orIndex)}
                        className="rounded p-2 text-red-600 hover:bg-red-50"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    ) : null}
                  </div>
                ))}
              </div>
              {!readOnly ? (
                <button
                  type="button"
                  onClick={() => addOrCondition(andIndex)}
                  className="mt-2 text-xs font-medium text-[#2563EB] hover:underline"
                >
                  + OR condition
                </button>
              ) : null}
            </div>
          ))}
        </div>

        {!readOnly ? (
          <button
            type="button"
            onClick={addAndGroup}
            className="text-xs font-medium text-[#2563EB] hover:underline"
          >
            + AND group
          </button>
        ) : null}

        <div className="space-y-3">
          {node.child_rule.map((child, index) => (
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
          {!readOnly ? (
            <div className="flex flex-wrap gap-2">
              {!atMaxDepth ? (
                <button
                  type="button"
                  onClick={() => addChild('conditional')}
                  className="rounded-md border border-[#BFDBFE] bg-[#EFF6FF] px-3 py-1.5 text-xs font-medium text-[#1D4ED8]"
                >
                  Add Condition
                </button>
              ) : null}
              {groupType === 'scoring' ? (
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
        </div>
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

  const addRootNode = () => {
    onChange([...nodes, createEmptyConditionalNode()]);
  };

  return (
    <div className="space-y-4">
      {nodes.length === 0 ? (
        <p className="rounded-lg border border-dashed border-[#E5E7EB] px-4 py-6 text-sm text-[#6B7280]">
          No rules defined yet.
        </p>
      ) : null}

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
        <button
          type="button"
          onClick={addRootNode}
          className="inline-flex items-center gap-2 rounded-lg border border-[#E5E7EB] px-4 py-2 text-sm font-medium text-[#374151] hover:bg-[#F9FAFB]"
        >
          <PlusIcon className="h-4 w-4" />
          Add Condition
        </button>
      ) : null}
    </div>
  );
}
