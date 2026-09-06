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

export type RuleValueInputKind = 'boolean' | 'number' | 'string' | 'datetime';

export function findRuleFieldOption(
    options: RuleFieldOption[],
    fieldId: string,
): RuleFieldOption | undefined {
    return options.find((option) => ruleFieldOptionValue(option) === String(fieldId));
}

export function ruleValueInputKind(dataType: string | undefined): RuleValueInputKind {
    const normalized = normalizeRuleDataType(dataType || 'string');
    if (normalized === 'boolean' || normalized === 'bool') return 'boolean';
    if (
        normalized === 'number' ||
        normalized === 'float' ||
        normalized === 'int' ||
        normalized === 'integer'
    ) {
        return 'number';
    }
    if (normalized === 'datetime' || normalized === 'date') return 'datetime';
    return 'string';
}

export function defaultConditionValue(kind: RuleValueInputKind): string | number | boolean {
    if (kind === 'boolean') return false;
    if (kind === 'number') return 0;
    return '';
}

export function coerceConditionValue(
    kind: RuleValueInputKind,
    raw: string | number | boolean,
): string | number | boolean {
    if (kind === 'boolean') {
        if (typeof raw === 'boolean') return raw;
        if (typeof raw === 'number') return raw !== 0;
        const normalized = String(raw).trim().toLowerCase();
        return normalized === 'true' || normalized === '1';
    }
    if (kind === 'number') {
        if (typeof raw === 'number' && Number.isFinite(raw)) return raw;
        const parsed = Number(raw);
        return Number.isFinite(parsed) ? parsed : 0;
    }
    return String(raw ?? '');
}
