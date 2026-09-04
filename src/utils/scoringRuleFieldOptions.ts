export type RuleFieldUsage = 'condition' | 'formula';

export interface RuleFieldOption {
  id: number;
  name: string;
  dataType: string;
}

const FORMULA_EXCLUDED_DATA_TYPES = new Set(['boolean', 'bool', 'string', 'str']);

export function normalizeRuleDataType(dataType: string): string {
  return dataType.trim().toLowerCase();
}

export function isFormulaEligibleDataType(dataType: string): boolean {
  return !FORMULA_EXCLUDED_DATA_TYPES.has(normalizeRuleDataType(dataType));
}

export function filterRuleFieldOptions(
  options: RuleFieldOption[],
  usage: RuleFieldUsage,
): RuleFieldOption[] {
  if (usage === 'condition') return options;
  return options.filter((option) => isFormulaEligibleDataType(option.dataType));
}

export function ruleFieldOptionValue(option: RuleFieldOption): string {
  return String(option.id);
}

export function toRuleFieldOptions(
  rows: Array<{ id: number; name: string; data_type: string }>,
): RuleFieldOption[] {
  return [...rows]
    .map((row) => ({
      id: row.id,
      name: row.name,
      dataType: row.data_type,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}
