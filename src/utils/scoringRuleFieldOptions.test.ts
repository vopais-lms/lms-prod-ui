import { describe, expect, it } from 'vitest';
import {
  filterRuleFieldOptions,
  isFormulaEligibleDataType,
  toRuleFieldOptions,
  type RuleFieldOption,
} from './scoringRuleFieldOptions';

const options: RuleFieldOption[] = [
  { id: 1, name: 'Age', dataType: 'number' },
  { id: 2, name: 'PAN verified', dataType: 'boolean' },
  { id: 3, name: 'City', dataType: 'string' },
  { id: 4, name: 'Applied at', dataType: 'datetime' },
];

describe('filterRuleFieldOptions', () => {
  it('keeps every datatype for conditions', () => {
    expect(filterRuleFieldOptions(options, 'condition')).toEqual(options);
  });

  it('drops boolean and string datatypes for formulas', () => {
    expect(filterRuleFieldOptions(options, 'formula')).toEqual([
      { id: 1, name: 'Age', dataType: 'number' },
      { id: 4, name: 'Applied at', dataType: 'datetime' },
    ]);
  });
});

describe('isFormulaEligibleDataType', () => {
  it('rejects boolean and string aliases', () => {
    expect(isFormulaEligibleDataType('Boolean')).toBe(false);
    expect(isFormulaEligibleDataType('STR')).toBe(false);
    expect(isFormulaEligibleDataType('number')).toBe(true);
  });
});

describe('toRuleFieldOptions', () => {
  it('maps list rows and sorts by name', () => {
    expect(
      toRuleFieldOptions([
        { id: 2, name: 'Zebra', data_type: 'number' },
        { id: 1, name: 'Alpha', data_type: 'string' },
      ]),
    ).toEqual([
      { id: 1, name: 'Alpha', dataType: 'string' },
      { id: 2, name: 'Zebra', dataType: 'number' },
    ]);
  });
});
