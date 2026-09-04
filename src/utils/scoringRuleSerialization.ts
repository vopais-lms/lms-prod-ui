import {
  normalizeConditionalRule,
  normalizeCondition,
  normalizeLeafRule,
  type ScoringRuleNode,
} from './scoringRuleValidation';

export function serializeScoringRuleNode(node: ScoringRuleNode): Record<string, unknown> {
  if (node.type === 'conditional') {
    return {
      type: 'conditional',
      rule: normalizeConditionalRule(node.rule).map((orGroup) =>
        orGroup.map((cond) => ({
          field: cond.field,
          operator: cond.operator,
          value: cond.value,
        })),
      ),
      child_rule: node.child_rule.map(serializeScoringRuleNode),
    };
  }

  return {
    type: 'formula',
    rule: Array.isArray(node.rule) ? [...node.rule] : node.rule,
    child_rule: [],
  };
}

export function serializeScoringRules(nodes: ScoringRuleNode[]): Record<string, unknown>[] {
  return nodes.map(serializeScoringRuleNode);
}

export function parseScoringRuleNode(raw: unknown): ScoringRuleNode {
  const obj = raw as Record<string, unknown>;
  const rawType = String(obj.type);
  const childRaw = Array.isArray(obj.child_rule) ? obj.child_rule : [];

  if (rawType === 'conditional') {
    return {
      type: 'conditional',
      rule: normalizeConditionalRule(obj.rule),
      child_rule: childRaw.map(parseScoringRuleNode),
    };
  }

  return {
    type: 'formula',
    rule: normalizeLeafRule(obj.rule),
    child_rule: [],
  };
}

export function parseScoringRules(raw: unknown): ScoringRuleNode[] {
  if (!Array.isArray(raw)) return [];
  return raw.map(parseScoringRuleNode);
}

export function parseApiConditionList(rule: unknown): ReturnType<typeof normalizeConditionalRule> {
  return normalizeConditionalRule(rule);
}

export function conditionToDisplay(cond: ReturnType<typeof normalizeCondition>) {
  if (!cond) return '';
  return `${cond.field} ${cond.operator} ${String(cond.value)}`;
}
