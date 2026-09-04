export type ScoringRuleNodeType = 'conditional' | 'formula';

export interface ConditionDict {
  field: string;
  operator: string;
  value: string | number | boolean;
}

export interface ScoringRuleNode {
  type: ScoringRuleNodeType;
  rule: ConditionDict[][] | Array<string | number>;
  child_rule: ScoringRuleNode[];
}

export const MAX_CONDITIONAL_DEPTH = 10;

const VALID_OPERATORS = new Set(['==', '!=', '>', '<', '>=', '<=']);
const FORMULA_OPERATORS = new Set(['+', '-', '*', '/', '%']);

export function isConstantFormula(rule: Array<string | number>): boolean {
  return rule.length === 1 && typeof rule[0] === 'number';
}

export function normalizeLeafNodeType(type: string): ScoringRuleNodeType {
  return type === 'conditional' ? 'conditional' : 'formula';
}

export function normalizeLeafRule(rule: unknown): Array<string | number> {
  if (!Array.isArray(rule)) return [0];
  if (rule.length === 1 && Array.isArray(rule[0])) {
    return [...rule[0]] as Array<string | number>;
  }
  return [...rule] as Array<string | number>;
}

export function normalizeCondition(raw: unknown): ConditionDict | null {
  if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
    const obj = raw as Record<string, unknown>;
    if (
      typeof obj.field === 'string' &&
      typeof obj.operator === 'string' &&
      obj.value !== undefined
    ) {
      return {
        field: obj.field,
        operator: obj.operator,
        value: obj.value as string | number | boolean,
      };
    }
  }
  if (Array.isArray(raw) && raw.length >= 3) {
    const [a, b, c] = raw;
    if (typeof b === 'string' && VALID_OPERATORS.has(b)) {
      return { field: String(c), operator: b, value: a as string | number | boolean };
    }
    if (typeof a === 'string' && VALID_OPERATORS.has(a)) {
      return { field: String(b), operator: a, value: c as string | number | boolean };
    }
  }
  return null;
}

export function normalizeConditionalRule(rule: unknown): ConditionDict[][] {
  if (!Array.isArray(rule)) return [];
  return rule.map((orGroup) => {
    if (!Array.isArray(orGroup)) return [];
    if (
      orGroup.length >= 3 &&
      (VALID_OPERATORS.has(String(orGroup[0])) || VALID_OPERATORS.has(String(orGroup[1])))
    ) {
      const cond = normalizeCondition(orGroup);
      return cond ? [cond] : [];
    }
    return orGroup
      .map((item) => normalizeCondition(item))
      .filter((item): item is ConditionDict => item != null);
  });
}

export function getConditionalDepth(nodes: ScoringRuleNode[], currentDepth = 0): number {
  let maxDepth = currentDepth;
  for (const node of nodes) {
    if (node.type === 'conditional') {
      const depthHere = currentDepth + 1;
      maxDepth = Math.max(maxDepth, depthHere);
      maxDepth = Math.max(maxDepth, getConditionalDepth(node.child_rule, depthHere));
    }
  }
  return maxDepth;
}

function isValidFormulaRule(rule: Array<string | number>): boolean {
  if (isConstantFormula(rule)) return true;
  if (rule.length < 3) return false;
  return rule.some((token) => FORMULA_OPERATORS.has(String(token)));
}

export function validateScoringRules(
  nodes: ScoringRuleNode[],
  groupType: 'verification' | 'scoring',
): string | null {
  if (getConditionalDepth(nodes) > MAX_CONDITIONAL_DEPTH) {
    return `Conditional nesting cannot exceed ${MAX_CONDITIONAL_DEPTH} levels`;
  }

  const walk = (node: ScoringRuleNode, isRoot: boolean): string | null => {
    if (node.type === 'conditional') {
      const conditions = normalizeConditionalRule(node.rule);
      if (!isRoot && conditions.length === 0) {
        return 'Conditional branches must include at least one condition';
      }
      if (node.child_rule.length === 0) {
        return null;
      }
      for (const child of node.child_rule) {
        const err = walk(child, false);
        if (err) return err;
      }
      return null;
    }

    if (groupType === 'verification') {
      return 'Verification groups only support conditional rules';
    }

    if (node.child_rule.length > 0) {
      return 'Formula rules must be terminal nodes';
    }

    const rule = normalizeLeafRule(node.rule);
    if (!isValidFormulaRule(rule)) {
      return 'Formula must be a fixed score or a valid expression';
    }
    return null;
  };

  for (const node of nodes) {
    const err = walk(node, true);
    if (err) return err;
  }
  return null;
}

export function createEmptyConditionalNode(): ScoringRuleNode {
  return {
    type: 'conditional',
    rule: [[{ field: '', operator: '==', value: '' }]],
    child_rule: [],
  };
}

export function createEmptyFormulaNode(score = 0): ScoringRuleNode {
  return { type: 'formula', rule: [score], child_rule: [] };
}
