// @ts-nocheck
import 'bootstrap/dist/css/bootstrap.min.css';
import '@formio/js/dist/formio.full.min.css';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowLeftIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { FormBuilder } from '@formio/react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageShell } from '../shared/PageShell';
import { StatusBadge } from '../shared/StatusBadge';
import { loanTypesApi } from '../../../apis/loanTypes';
import {
  DEFAULT_LOAN_TYPE_FORM_PURPOSE,
  EMPTY_FORMIO_SCHEMA,
  LOAN_TYPE_FORM_BUILDER_OPTIONS,
  LOAN_TYPE_FORM_PURPOSES,
  patchLoanTypeFormBuilder,
} from '../../../apis/loanTypeForms';
import { ApiError } from '../../../utils/apiClient';
import type { LoanType, LoanTypeFormPurpose } from '../../../apis/types';
import {
  LOAN_TYPE_DETAIL_SECTIONS,
  type LoanTypeDetailSectionId,
} from '../../../constants/loanTypeDetailSections';
import { LoanTypeApprovalsSection } from './LoanTypeApprovalsSection';

export function LoanTypeDetailPage() {
  const navigate = useNavigate();
  const { loanTypeId } = useParams<{ loanTypeId: string }>();
  const parsedLoanTypeId = Number(loanTypeId);

  const [loanType, setLoanType] = useState<LoanType | null>(null);
  const [activeSection, setActiveSection] = useState<LoanTypeDetailSectionId>('forms');
  const [selectedPurpose, setSelectedPurpose] = useState<LoanTypeFormPurpose>(
    DEFAULT_LOAN_TYPE_FORM_PURPOSE,
  );
  const [initialForm, setInitialForm] = useState(EMPTY_FORMIO_SCHEMA);
  const [draftForm, setDraftForm] = useState(EMPTY_FORMIO_SCHEMA);
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [pageError, setPageError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const builderKey = useMemo(
    () => `${parsedLoanTypeId}-${selectedPurpose}`,
    [parsedLoanTypeId, selectedPurpose],
  );

  const loadFormForPurpose = useCallback(async () => {
    if (!Number.isFinite(parsedLoanTypeId)) {
      setPageError('Invalid loan type id.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setPageError(null);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      const detail = await loanTypesApi.get(parsedLoanTypeId, selectedPurpose);
      setLoanType({
        id: detail.id,
        name: detail.name,
        status: detail.status,
      });
      const schema = detail.form_json ?? EMPTY_FORMIO_SCHEMA;
      setInitialForm(schema);
      setDraftForm(schema);
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        if (err.message?.toLowerCase().includes('loan type not found')) {
          setPageError('Loan type not found.');
          return;
        }

        if (!loanType) {
          try {
            const list = await loanTypesApi.list({ page: 1, per_page: 100 });
            const meta = list.data.find((item) => item.id === parsedLoanTypeId);
            if (meta) {
              setLoanType(meta);
            }
          } catch (listErr) {
            console.error('Failed to load loan type metadata', listErr);
          }
        }

        setInitialForm(EMPTY_FORMIO_SCHEMA);
        setDraftForm(EMPTY_FORMIO_SCHEMA);
        return;
      }

      setPageError(err instanceof ApiError ? err.message : 'Failed to load form');
    } finally {
      setLoading(false);
    }
  }, [parsedLoanTypeId, selectedPurpose]);

  useEffect(() => {
    if (!Number.isFinite(parsedLoanTypeId)) {
      return;
    }

    const loadLoanTypeMeta = async () => {
      try {
        const list = await loanTypesApi.list({ page: 1, per_page: 100 });
        const meta = list.data.find((item) => item.id === parsedLoanTypeId);
        if (meta) {
          setLoanType(meta);
        }
      } catch (err) {
        console.error('Failed to load loan type metadata', err);
      }
    };

    loadLoanTypeMeta();
  }, [parsedLoanTypeId]);

  useEffect(() => {
    if (activeSection === 'forms') {
      loadFormForPurpose();
    }
  }, [loadFormForPurpose, activeSection]);

  const handleSectionSelect = (sectionId: LoanTypeDetailSectionId) => {
    if (sectionId === activeSection) return;
    setActiveSection(sectionId);
    setSaveError(null);
    setSaveSuccess(false);
  };

  const handlePurposeSelect = (purpose: LoanTypeFormPurpose) => {
    if (purpose === selectedPurpose) return;
    setSelectedPurpose(purpose);
  };

  const handleSaveForm = async () => {
    if (!Number.isFinite(parsedLoanTypeId)) return;

    setSaveLoading(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      await loanTypesApi.saveFormJson(parsedLoanTypeId, {
        purpose: selectedPurpose,
        form_json: draftForm,
      });
      setSaveSuccess(true);
      setInitialForm(draftForm);
    } catch (err: any) {
      setSaveError(err.message || 'Failed to save form');
    } finally {
      setSaveLoading(false);
    }
  };

  if (loading && !loanType) {
    return (
      <PageShell title="Loan Type Forms" subtitle="Loading...">
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-12 text-center text-sm text-[#6B7280]">
          Loading loan type details...
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Loan Type Forms"
      subtitle={loanType ? `Configure dynamic forms for ${loanType.name}` : 'Configure dynamic forms'}
      actions={
        <button
          onClick={() => navigate('/app/loan-types')}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-[#6B7280] bg-white border border-[#E5E7EB] rounded-lg hover:bg-[#F9FAFB] transition-colors"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Back to Loan Types
        </button>
      }
    >
      {pageError && (
        <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          {pageError}
        </p>
      )}

      {loanType && (
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs text-[#6B7280] uppercase tracking-wide mb-1">Loan type</p>
              <h2 className="text-lg font-semibold text-[#111827]">{loanType.name}</h2>
              <p className="text-sm text-[#6B7280] mt-1">ID: {loanType.id}</p>
            </div>
            <StatusBadge status={loanType.status ? 'active' : 'inactive'} />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)] gap-6">
        <aside className="bg-white rounded-xl border border-[#E5E7EB] p-4 h-fit space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-[#111827] mb-3">Configuration</h3>
            <nav className="space-y-2">
              {LOAN_TYPE_DETAIL_SECTIONS.map((section) => {
                const isActive = section.id === activeSection;
                return (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => handleSectionSelect(section.id)}
                    className={`w-full text-left rounded-lg px-3 py-2.5 transition-colors ${
                      isActive
                        ? 'bg-[#EFF6FF] border border-[#BFDBFE] text-[#1D4ED8]'
                        : 'border border-transparent text-[#374151] hover:bg-[#F9FAFB]'
                    }`}
                  >
                    <p className="text-sm font-medium">{section.label}</p>
                    <p className="text-xs text-[#6B7280] mt-1">{section.description}</p>
                  </button>
                );
              })}
            </nav>
          </div>

          {activeSection === 'forms' && (
            <div>
              <h3 className="text-sm font-semibold text-[#111827] mb-3">Form purpose</h3>
              <nav className="space-y-2">
                {LOAN_TYPE_FORM_PURPOSES.map((item) => {
                  const isActive = item.purpose === selectedPurpose;
                  return (
                    <button
                      key={item.purpose}
                      type="button"
                      onClick={() => handlePurposeSelect(item.purpose)}
                      className={`w-full text-left rounded-lg px-3 py-2.5 transition-colors ${
                        isActive
                          ? 'bg-[#F3F4F6] border border-[#E5E7EB] text-[#111827]'
                          : 'border border-transparent text-[#374151] hover:bg-[#F9FAFB]'
                      }`}
                    >
                      <p className="text-sm font-medium">{item.label}</p>
                      <p className="text-xs text-[#6B7280] mt-1">{item.description}</p>
                    </button>
                  );
                })}
              </nav>
            </div>
          )}
        </aside>

        <section className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm">
          {activeSection === 'forms' ? (
            <>
              <div className="px-6 py-4 border-b border-[#E5E7EB] flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-semibold text-[#111827]">
                    {LOAN_TYPE_FORM_PURPOSES.find((item) => item.purpose === selectedPurpose)?.label}
                  </h3>
                  <p className="text-sm text-[#6B7280]">Design the Form.io schema for this workflow</p>
                </div>
                <button
                  type="button"
                  onClick={handleSaveForm}
                  disabled={saveLoading || loading}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#2563EB] rounded-lg hover:bg-[#1D4ED8] disabled:opacity-50"
                >
                  {saveLoading ? <ArrowPathIcon className="w-4 h-4 animate-spin" /> : null}
                  {saveLoading ? 'Saving...' : 'Save Form'}
                </button>
              </div>

              {saveError && (
                <p className="mx-6 mt-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {saveError}
                </p>
              )}
              {saveSuccess && (
                <p className="mx-6 mt-4 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                  Form saved successfully.
                </p>
              )}

              <div className="loan-type-formio relative min-h-[75vh] p-0 sm:p-1">
                {loading ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/70 z-10 text-sm text-[#6B7280]">
                    Loading form builder...
                  </div>
                ) : null}
                {!loading && (
                  <FormBuilder
                    key={builderKey}
                    initialForm={initialForm}
                    options={LOAN_TYPE_FORM_BUILDER_OPTIONS}
                    onBuilderReady={patchLoanTypeFormBuilder}
                    onChange={(schema) => setDraftForm(schema)}
                  />
                )}
              </div>
            </>
          ) : (
            <div className="p-6">
              <div className="mb-4">
                <h3 className="text-base font-semibold text-[#111827]">Loan approvals</h3>
                <p className="text-sm text-[#6B7280]">
                  Manage approval steps and allowed employee designations for this loan type.
                </p>
              </div>
              <LoanTypeApprovalsSection loanTypeId={parsedLoanTypeId} />
            </div>
          )}
        </section>
      </div>
    </PageShell>
  );
}
