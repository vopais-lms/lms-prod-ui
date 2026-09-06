// @ts-nocheck
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowLeftIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { useNavigate, useParams } from 'react-router-dom';
import { loanTypeParameterGroupingsApi } from '../../../apis/loanTypeParameterGroupings';
import { parametersApi } from '../../../apis/parameters';
import type { ParameterGroupType } from '../../../apis/types';
import { PageShell } from '../shared/PageShell';
import { parseScoringRules, serializeScoringRules } from '../../../utils/scoringRuleSerialization';
import {
  toRuleFieldOptions,
  type RuleFieldOption,
} from '../../../utils/scoringRuleFieldOptions';
import { validateScoringRules, type ScoringRuleNode } from '../../../utils/scoringRuleValidation';
import { ScoringRuleEditor } from './ScoringRuleEditor';

export function LoanTypeParameterGroupRulesPage() {
  const navigate = useNavigate();
  const { loanTypeId, groupId } = useParams<{ loanTypeId: string; groupId: string }>();
  const parsedLoanTypeId = Number(loanTypeId);
  const parsedGroupId = Number(groupId);

  const [groupType, setGroupType] = useState<ParameterGroupType>('scoring');
  const [loanTypeName, setLoanTypeName] = useState('');
  const [groupLabel, setGroupLabel] = useState('');
  const [rules, setRules] = useState<ScoringRuleNode[]>([]);
  const [fieldOptions, setFieldOptions] = useState<RuleFieldOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [hasChildren, setHasChildren] = useState(false);

  const loadData = useCallback(async () => {
    if (!Number.isFinite(parsedLoanTypeId) || !Number.isFinite(parsedGroupId)) {
      setError('Invalid route parameters.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    setSaveSuccess(false);
    try {
      const [detail, parameterRows] = await Promise.all([
        loanTypeParameterGroupingsApi.get(parsedLoanTypeId, parsedGroupId),
        parametersApi.listAll(),
      ]);

      setGroupType((detail.type_of_group as ParameterGroupType) || 'scoring');
      setLoanTypeName(detail.loan_type_name);
      setGroupLabel(detail.name || `Group #${detail.id}`);
      setRules(parseScoringRules(detail.scoring_rule_json));
      setHasChildren((detail.children_parameter_groupings || []).length > 0);
      setFieldOptions(toRuleFieldOptions(parameterRows));
    } catch (err: any) {
      setError(err.message || 'Failed to load parameter group rules');
    } finally {
      setLoading(false);
    }
  }, [parsedGroupId, parsedLoanTypeId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const validationError = useMemo(
    () => validateScoringRules(rules, groupType),
    [rules, groupType],
  );

  const handleSave = async () => {
    if (hasChildren) {
      setSaveError('Rules can only be defined on groups without nested groups.');
      return;
    }
    if (validationError) {
      setSaveError(validationError);
      return;
    }

    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);
    try {
      await loanTypeParameterGroupingsApi.update(parsedLoanTypeId, parsedGroupId, {
        scoring_rule_json: serializeScoringRules(rules),
      });
      setSaveSuccess(true);
    } catch (err: any) {
      setSaveError(err.message || 'Failed to save scoring rules');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <PageShell title="Parameter group rules" subtitle="Loading...">
        <div className="rounded-xl border border-[#E5E7EB] bg-white p-12 text-center text-sm text-[#6B7280]">
          Loading rules...
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Parameter group rules"
      subtitle={`${loanTypeName} · ${groupLabel} · ${groupType}`}
      actions={
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate(`/app/loan-types/${parsedLoanTypeId}`)}
            className="flex items-center gap-2 rounded-lg border border-[#E5E7EB] bg-white px-4 py-2.5 text-sm font-medium text-[#6B7280] hover:bg-[#F9FAFB]"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back to loan type
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || Boolean(hasChildren) || Boolean(validationError)}
            className="flex items-center gap-2 rounded-lg bg-[#2563EB] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#1D4ED8] disabled:opacity-50"
          >
            {saving ? <ArrowPathIcon className="h-4 w-4 animate-spin" /> : null}
            {saving ? 'Saving...' : 'Save rules'}
          </button>
        </div>
      }
    >
      {error && (
        <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      {hasChildren && (
        <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          This group has nested groups. Define rules on groups that are not parents.
        </p>
      )}

      {saveError && (
        <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {saveError}
        </p>
      )}

      {validationError && !hasChildren && (
        <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          {validationError}
        </p>
      )}

      {saveSuccess && (
        <p className="mb-4 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
          Rules saved successfully.
        </p>
      )}

      <div className="rounded-xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
        <ScoringRuleEditor
          nodes={rules}
          groupType={groupType}
          fieldOptions={fieldOptions}
          onChange={setRules}
          readOnly={hasChildren}
        />
      </div>
    </PageShell>
  );
}
