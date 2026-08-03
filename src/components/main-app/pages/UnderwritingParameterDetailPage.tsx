// @ts-nocheck
import 'bootstrap/dist/css/bootstrap.min.css';
import '@formio/js/dist/formio.full.min.css';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { FormBuilder } from '@formio/react';
import { useNavigate, useParams } from 'react-router-dom';
import { FormModal, FormField, FormInput, FormSelect } from '../shared/FormModal';
import {
  createEmptyFormioSchema,
  getInputFormioComponents,
  LOAN_TYPE_FORM_BUILDER_OPTIONS,
  patchLoanTypeFormBuilder,
} from '../../../apis/loanTypeForms';
import { loanTypesApi } from '../../../apis/loanTypes';
import {
  capabilityOptionValue,
  flattenCapabilityOptions,
  parametersApi,
  parseCapabilityOptionValue,
} from '../../../apis/parameters';
import type {
  LoanType,
  ParameterCapabilityOption,
  ParameterDetail,
  ParameterFormField,
  ParameterLinkedLoanType,
} from '../../../apis/types';
import {
  PRODUCT_TOPICS,
  coreLoanTermLabel,
  parameterTypeLabel,
} from '../../../constants/underwritingParameterLabels';

type LinkedFieldsByLoanType = {
  loanTypeId: number | string;
  loanTypeName: string;
  fields: ParameterFormField[];
};

function parseLinkedFormFields(
  settings: Record<string, unknown> | null | undefined,
): LinkedFieldsByLoanType[] {
  const formFieldApi = settings?.form_field_api;
  if (!formFieldApi || typeof formFieldApi !== 'object' || Array.isArray(formFieldApi)) {
    return [];
  }
  return Object.entries(formFieldApi as Record<string, unknown>).map(
    ([key, entry]) => {
      const row = (entry && typeof entry === 'object' ? entry : {}) as Record<
        string,
        unknown
      >;
      const fields = Array.isArray(row.form_fields)
        ? (row.form_fields as ParameterFormField[])
        : [];
      return {
        loanTypeId: (row.loan_type_id as number | string) ?? key,
        loanTypeName:
          (row.loan_type_name as string) || `Loan product #${key}`,
        fields,
      };
    },
  );
}

export function UnderwritingParameterDetailPage() {
  const navigate = useNavigate();
  const { parameterId } = useParams<{ parameterId: string }>();
  const id = Number(parameterId);

  const [detail, setDetail] = useState<ParameterDetail | null>(null);
  const [linkedLoanTypes, setLinkedLoanTypes] = useState<ParameterLinkedLoanType[]>(
    [],
  );
  const [allLoanTypes, setAllLoanTypes] = useState<LoanType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [topic, setTopic] = useState('');
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const [linkLoanModal, setLinkLoanModal] = useState(false);
  const [linkAllActive, setLinkAllActive] = useState(false);
  const [selectedLoanTypeIds, setSelectedLoanTypeIds] = useState<number[]>([]);
  const [linkLoanLoading, setLinkLoanLoading] = useState(false);

  const [existingModal, setExistingModal] = useState(false);
  const [existingLoanTypeId, setExistingLoanTypeId] = useState<number | ''>('');
  const [availableFields, setAvailableFields] = useState<ParameterFormField[]>([]);
  const [selectedFieldKeys, setSelectedFieldKeys] = useState<string[]>([]);
  const [existingLoading, setExistingLoading] = useState(false);

  const [newFieldModal, setNewFieldModal] = useState(false);
  const [builderForm, setBuilderForm] = useState(createEmptyFormioSchema);
  const [builderKey, setBuilderKey] = useState(0);
  const [builderInitialForm, setBuilderInitialForm] = useState(createEmptyFormioSchema);
  const builderGenerationRef = useRef(0);
  const [newFieldLoading, setNewFieldLoading] = useState(false);
  const [newFieldError, setNewFieldError] = useState<string | null>(null);

  const topicOptions = useMemo(() => {
    const base = PRODUCT_TOPICS.map((t) => ({ value: t, label: t }));
    if (topic && !PRODUCT_TOPICS.includes(topic as (typeof PRODUCT_TOPICS)[number])) {
      return [{ value: topic, label: topic }, ...base];
    }
    return base;
  }, [topic]);

  const [capabilityOptions, setCapabilityOptions] = useState<ParameterCapabilityOption[]>(
    [],
  );
  const [selectedCapability, setSelectedCapability] = useState('');
  const [capabilitySaveLoading, setCapabilitySaveLoading] = useState(false);

  const activeLoanTypes = useMemo(
    () => allLoanTypes.filter((lt) => lt.status === true),
    [allLoanTypes],
  );

  const linkedFormFieldGroups = useMemo(
    () => parseLinkedFormFields(detail?.parameter_setting),
    [detail],
  );

  const apiSettings = useMemo(() => {
    const settings = detail?.parameter_setting || {};
    const raw = settings.api_settings;
    if (!raw || typeof raw !== 'object') return null;
    return raw as { api_adapter?: string; api_adapter_fetch_method?: string };
  }, [detail]);

  const loanApplicationColumn = useMemo(() => {
    const settings = detail?.parameter_setting || {};
    return typeof settings.loan_application_column === 'string'
      ? settings.loan_application_column
      : null;
  }, [detail]);

  const capabilityLabel = useMemo(() => {
    if (!apiSettings?.api_adapter || !apiSettings?.api_adapter_fetch_method) {
      return null;
    }
    const match = capabilityOptions.find(
      (o) =>
        o.api_adapter === apiSettings.api_adapter &&
        o.api_adapter_fetch_method === apiSettings.api_adapter_fetch_method,
    );
    return match?.label || null;
  }, [apiSettings, capabilityOptions]);

  const load = useCallback(async () => {
    if (!Number.isFinite(id)) {
      setError('Invalid parameter id');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [d, loans, loanTypes, caps] = await Promise.all([
        parametersApi.get(id),
        parametersApi.getLoanTypes(id),
        loanTypesApi.list({ page: 1, per_page: 100 }),
        parametersApi.allAdapterCapabilities().catch(() => ({ data: [] })),
      ]);
      setDetail(d);
      setName(d.name);
      setTopic(d.topic);
      setLinkedLoanTypes(loans.linked_loan_types);
      setAllLoanTypes(loanTypes.data);
      const options = flattenCapabilityOptions(caps.data);
      setCapabilityOptions(options);
      const settings = d.parameter_setting || {};
      const api = settings.api_settings as
        | { api_adapter?: string; api_adapter_fetch_method?: string }
        | undefined;
      if (api?.api_adapter && api?.api_adapter_fetch_method) {
        const current = options.find(
          (o) =>
            o.api_adapter === api.api_adapter &&
            o.api_adapter_fetch_method === api.api_adapter_fetch_method,
        );
        setSelectedCapability(current ? capabilityOptionValue(current) : '');
      } else {
        setSelectedCapability(options[0] ? capabilityOptionValue(options[0]) : '');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load parameter');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const closeLinkLoanModal = () => {
    setLinkLoanModal(false);
    setLinkAllActive(false);
    setSelectedLoanTypeIds([]);
    setError(null);
  };

  const closeExistingModal = () => {
    setExistingModal(false);
    setExistingLoanTypeId('');
    setAvailableFields([]);
    setSelectedFieldKeys([]);
    setError(null);
  };

  const resetNewFieldBuilder = () => {
    // Bump generation first so destroy/onChange from the previous FormBuilder
    // instance cannot write the prior canvas back into React state.
    builderGenerationRef.current += 1;
    const empty = createEmptyFormioSchema();
    setBuilderForm(empty);
    setBuilderInitialForm(empty);
    setBuilderKey((k) => k + 1);
  };

  const closeNewFieldModal = () => {
    setNewFieldModal(false);
    setNewFieldError(null);
    resetNewFieldBuilder();
  };

  const openNewFieldModal = () => {
    setNewFieldError(null);
    setError(null);
    resetNewFieldBuilder();
    setNewFieldModal(true);
  };

  const handleBuilderFormChange = useCallback((schema: Record<string, unknown>) => {
    const generation = builderGenerationRef.current;
    // Ignore late events from a FormBuilder that was just unmounted/replaced.
    queueMicrotask(() => {
      if (generation !== builderGenerationRef.current) return;
      setBuilderForm(schema && typeof schema === 'object' ? schema : createEmptyFormioSchema());
    });
  }, []);

  const handleSave = async () => {
    setSaveLoading(true);
    setSaveMessage(null);
    try {
      await parametersApi.update(id, { name: name.trim(), topic: topic.trim() });
      setSaveMessage('Saved');
      await load();
    } catch (err: any) {
      setSaveMessage(err.message || 'Save failed');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleLinkLoanTypes = async () => {
    if (!linkAllActive && selectedLoanTypeIds.length === 0) return;
    setLinkLoanLoading(true);
    setError(null);
    try {
      const res = await parametersApi.addLoanTypes(
        id,
        linkAllActive
          ? { all_loans: true }
          : { loan_type_ids: selectedLoanTypeIds },
      );
      setLinkedLoanTypes(res.linked_loan_types);
      closeLinkLoanModal();
    } catch (err: any) {
      setError(err.message || 'Failed to link loan products');
    } finally {
      setLinkLoanLoading(false);
    }
  };

  const loadFieldsForLoanType = async (loanTypeId: number) => {
    setExistingLoanTypeId(loanTypeId);
    setSelectedFieldKeys([]);
    try {
      const res = await loanTypesApi.getInputFormComponents(loanTypeId);
      const mapping = res.form_json?.form_component_mapping || {};
      const fields: ParameterFormField[] = [];
      Object.values(mapping).forEach((list) => {
        (list || []).forEach((component: any) => {
          if (component?.key) {
            fields.push({
              form_field_api: component.key,
              form_field_label: component.label || component.key,
              form_field_type: component.type || 'textfield',
            });
          }
        });
      });
      setAvailableFields(fields);
    } catch (err: any) {
      setError(err.message || 'Failed to load form fields');
      setAvailableFields([]);
    }
  };

  const handleLinkExisting = async () => {
    if (!existingLoanTypeId || selectedFieldKeys.length === 0) return;
    setExistingLoading(true);
    setError(null);
    try {
      const form_fields = availableFields.filter((f) =>
        selectedFieldKeys.includes(f.form_field_api),
      );
      await parametersApi.linkExistingFormField(id, {
        loan_type_forms: [
          { loan_type_id: Number(existingLoanTypeId), form_fields },
        ],
      });
      closeExistingModal();
      await load();
    } catch (err: any) {
      setError(err.message || 'Failed to link form fields');
    } finally {
      setExistingLoading(false);
    }
  };

  const handleLinkNew = async () => {
    const components = getInputFormioComponents(builderForm);
    if (components.length === 0) {
      setNewFieldError('Add at least one field in the form builder before saving.');
      return;
    }
    if (linkedLoanTypes.length === 0) {
      setNewFieldError(
        'Link at least one loan product before adding new form fields.',
      );
      return;
    }
    setNewFieldLoading(true);
    setNewFieldError(null);
    try {
      // Prefer nested forms shape; FormParser also accepts flat builder export.
      const form_json = {
        forms: {
          main: {
            type: 'form',
            key: 'main',
            display:
              typeof builderForm.display === 'string' ? builderForm.display : 'form',
            components,
          },
        },
      };
      const linked = await parametersApi.linkNewFormField(id, { form_json });
      // Apply server response immediately so the linked-fields list shows the
      // newly upserted labels even if a concurrent reload races.
      if (linked?.form_fields && detail) {
        setDetail({
          ...detail,
          parameter_setting: {
            ...(detail.parameter_setting || {}),
            form_field_api: linked.form_fields,
          },
        });
      }
      closeNewFieldModal();
      await load();
    } catch (err: any) {
      setNewFieldError(err.message || 'Failed to add form fields');
    } finally {
      setNewFieldLoading(false);
    }
  };

  const handleSaveCapability = async () => {
    const picked = parseCapabilityOptionValue(selectedCapability, capabilityOptions);
    if (!picked) {
      setError('Choose an external data check.');
      return;
    }
    setCapabilitySaveLoading(true);
    setError(null);
    try {
      await parametersApi.update(id, {
        parameter_type: 'api_settings',
        parameter_settings: {
          api_settings: {
            api_adapter: picked.api_adapter,
            api_adapter_fetch_method: picked.api_adapter_fetch_method,
          },
        },
      });
      setSaveMessage('External data check saved');
      await load();
    } catch (err: any) {
      setError(err.message || 'Failed to save data check');
    } finally {
      setCapabilitySaveLoading(false);
    }
  };

  if (loading) {
    return <p className="text-sm text-[#6B7280]">Loading parameter…</p>;
  }

  if (error && !detail) {
    return (
      <div className="space-y-3">
        <button
          onClick={() => navigate('/app/loan-types/underwriting')}
          className="inline-flex items-center gap-2 text-sm text-[#2563EB]"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Back
        </button>
        <p className="text-sm text-red-600">{error}</p>
      </div>
    );
  }

  const isFormFieldsType =
    !detail?.parameter_type || detail.parameter_type === 'form_field_api';
  const isApiSettingsType = detail?.parameter_type === 'api_settings';
  const isCoreTermsType = detail?.parameter_type === 'loan_application_column';

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <button
            onClick={() => navigate('/app/loan-types/underwriting')}
            className="inline-flex items-center gap-2 text-sm text-[#2563EB] mb-2"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Back to parameters
          </button>
          <h2 className="text-lg font-semibold text-[#111827]">
            {detail?.name || 'Parameter'}
          </h2>
          <p className="text-sm text-[#6B7280]">
            {parameterTypeLabel(detail?.parameter_type)}
            {detail?.eid ? ` · ${detail.eid}` : ''}
          </p>
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <section className="space-y-3 border border-[#E5E7EB] rounded-xl p-4 bg-white">
        <h3 className="text-sm font-semibold text-[#111827]">Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <FormField label="Name">
            <FormInput value={name} onChange={setName} />
          </FormField>
          <FormField label="Topic">
            <FormSelect
              value={topic}
              onChange={setTopic}
              options={topicOptions}
              placeholder="Select topic"
            />
          </FormField>
        </div>
        <button
          onClick={handleSave}
          disabled={saveLoading}
          className="px-4 py-2 text-sm font-medium rounded-lg bg-[#2563EB] text-white hover:bg-[#1D4ED8] disabled:opacity-50"
        >
          {saveLoading ? 'Saving…' : 'Save changes'}
        </button>
        {saveMessage && <p className="text-sm text-[#374151]">{saveMessage}</p>}
      </section>

      <section className="space-y-3 border border-[#E5E7EB] rounded-xl p-4 bg-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-[#111827]">Linked loan products</h3>
            <p className="text-xs text-[#6B7280] mt-0.5">
              Which loan products this parameter applies to
            </p>
          </div>
          <button
            onClick={() => {
              setLinkAllActive(false);
              setSelectedLoanTypeIds([]);
              setError(null);
              setLinkLoanModal(true);
            }}
            className="text-sm font-medium text-[#2563EB]"
          >
            Add loan products
          </button>
        </div>
        {linkedLoanTypes.length === 0 ? (
          <p className="text-sm text-[#6B7280]">No loan products linked yet.</p>
        ) : (
          <ul className="text-sm space-y-1">
            {linkedLoanTypes.map((lt) => (
              <li key={lt.loan_type_id}>{lt.loan_type_name}</li>
            ))}
          </ul>
        )}
      </section>

      {isCoreTermsType && (
        <section className="space-y-2 border border-[#E5E7EB] rounded-xl p-4 bg-white">
          <h3 className="text-sm font-semibold text-[#111827]">Core loan term</h3>
          <p className="text-sm text-[#374151]">
            {coreLoanTermLabel(loanApplicationColumn)}
          </p>
        </section>
      )}

      {isApiSettingsType && (
        <section className="space-y-3 border border-[#E5E7EB] rounded-xl p-4 bg-white">
          <div>
            <h3 className="text-sm font-semibold text-[#111827]">
              External data check
            </h3>
            <p className="text-xs text-[#6B7280] mt-0.5">
              Provider verification used when scoring this parameter
            </p>
          </div>
          {capabilityLabel && (
            <p className="text-sm text-[#374151]">
              Current: <span className="font-medium">{capabilityLabel}</span>
            </p>
          )}
          <FormField label="Data check">
            <FormSelect
              value={selectedCapability}
              onChange={setSelectedCapability}
              options={capabilityOptions.map((c) => ({
                value: capabilityOptionValue(c),
                label: c.label,
              }))}
              placeholder="Select a data check"
            />
          </FormField>
          <button
            onClick={handleSaveCapability}
            disabled={capabilitySaveLoading || !selectedCapability}
            className="px-3 py-2 text-sm rounded-lg bg-[#2563EB] text-white hover:bg-[#1D4ED8] disabled:opacity-50"
          >
            {capabilitySaveLoading ? 'Saving…' : 'Save data check'}
          </button>
        </section>
      )}

      {isFormFieldsType && (
        <section className="space-y-4 border border-[#E5E7EB] rounded-xl p-4 bg-white">
          <div>
            <h3 className="text-sm font-semibold text-[#111827]">Linked form fields</h3>
            <p className="text-xs text-[#6B7280] mt-0.5">
              Fields on each loan product’s application form that feed this parameter
            </p>
          </div>

          {linkedFormFieldGroups.length === 0 ? (
            <p className="text-sm text-[#6B7280]">No form fields linked yet.</p>
          ) : (
            <div className="space-y-4">
              {linkedFormFieldGroups.map((group) => (
                <div key={String(group.loanTypeId)} className="space-y-2">
                  <p className="text-sm font-medium text-[#111827]">
                    {group.loanTypeName}
                  </p>
                  {group.fields.length === 0 ? (
                    <p className="text-xs text-[#6B7280]">No fields linked.</p>
                  ) : (
                    <ul className="text-sm space-y-1.5 pl-1">
                      {group.fields.map((field) => (
                        <li
                          key={field.form_field_api}
                          className="flex flex-wrap items-baseline gap-x-2"
                        >
                          <span className="text-[#111827]">
                            {field.form_field_label || field.form_field_api}
                          </span>
                          {field.form_field_type ? (
                            <span className="text-xs text-[#9CA3AF]">
                              {field.form_field_type}
                            </span>
                          ) : null}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="pt-2 border-t border-[#E5E7EB] space-y-3">
            <p className="text-sm font-medium text-[#111827]">Add form fields</p>
            <p className="text-xs text-[#6B7280]">
              Choose existing fields from a loan application form, or design new
              fields with the drag-and-drop builder.
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => {
                  setError(null);
                  setExistingModal(true);
                }}
                className="px-3 py-2 text-sm rounded-lg border border-[#E5E7EB] hover:bg-[#F9FAFB]"
              >
                Link fields already on a loan application form
              </button>
              <button
                onClick={openNewFieldModal}
                className="px-3 py-2 text-sm rounded-lg border border-[#E5E7EB] hover:bg-[#F9FAFB]"
              >
                Design new form fields
              </button>
            </div>
          </div>
        </section>
      )}

      {!isFormFieldsType && !isApiSettingsType && !isCoreTermsType && (
        <section className="space-y-3 border border-[#E5E7EB] rounded-xl p-4 bg-white">
          <p className="text-sm text-[#6B7280]">
            This parameter uses type “{parameterTypeLabel(detail?.parameter_type)}”.
            Form-field linking is available for Form Fields parameters.
          </p>
        </section>
      )}

      <FormModal
        isOpen={linkLoanModal}
        onClose={closeLinkLoanModal}
        title="Link loan products"
        onSubmit={handleLinkLoanTypes}
        submitLabel="Link"
        loading={linkLoanLoading}
      >
        <div className="space-y-3">
          <label className="flex items-start gap-2 text-sm font-medium text-[#111827] border border-[#E5E7EB] rounded-lg px-3 py-2 bg-[#F9FAFB]">
            <input
              type="checkbox"
              className="mt-0.5"
              checked={linkAllActive}
              onChange={(e) => {
                const checked = e.target.checked;
                setLinkAllActive(checked);
                if (checked) setSelectedLoanTypeIds([]);
              }}
            />
            <span>
              All active loan products
              <span className="block text-xs font-normal text-[#6B7280] mt-0.5">
                Links every loan product that is currently active (
                {activeLoanTypes.length} available).
              </span>
            </span>
          </label>

          <div
            className={`space-y-2 max-h-64 overflow-auto ${
              linkAllActive ? 'opacity-50 pointer-events-none' : ''
            }`}
          >
            {activeLoanTypes.length === 0 ? (
              <p className="text-xs text-[#6B7280]">
                No active loan products available.
              </p>
            ) : (
              activeLoanTypes.map((lt) => (
                <label key={lt.id} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={selectedLoanTypeIds.includes(lt.id)}
                    disabled={linkAllActive}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedLoanTypeIds((prev) => [...prev, lt.id]);
                      } else {
                        setSelectedLoanTypeIds((prev) =>
                          prev.filter((x) => x !== lt.id),
                        );
                      }
                    }}
                  />
                  {lt.name}
                </label>
              ))
            )}
          </div>
        </div>
      </FormModal>

      <FormModal
        isOpen={existingModal}
        onClose={closeExistingModal}
        title="Link fields already on a loan application form"
        onSubmit={handleLinkExisting}
        submitLabel="Link fields"
        loading={existingLoading}
      >
        <FormField label="Loan product">
          <select
            className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm"
            value={existingLoanTypeId}
            onChange={(e) => {
              const value = e.target.value ? Number(e.target.value) : '';
              if (value) loadFieldsForLoanType(value);
              else {
                setExistingLoanTypeId('');
                setAvailableFields([]);
              }
            }}
          >
            <option value="">Select loan product</option>
            {(linkedLoanTypes.length
              ? linkedLoanTypes.map((l) => ({
                  id: l.loan_type_id,
                  name: l.loan_type_name,
                }))
              : activeLoanTypes
            ).map((lt) => (
              <option key={lt.id} value={lt.id}>
                {lt.name}
              </option>
            ))}
          </select>
        </FormField>
        <div className="space-y-2 max-h-56 overflow-auto">
          {availableFields.map((field) => (
            <label key={field.form_field_api} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={selectedFieldKeys.includes(field.form_field_api)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedFieldKeys((prev) => [...prev, field.form_field_api]);
                  } else {
                    setSelectedFieldKeys((prev) =>
                      prev.filter((k) => k !== field.form_field_api),
                    );
                  }
                }}
              />
              <span>
                {field.form_field_label}
                {field.form_field_type ? (
                  <span className="text-xs text-[#9CA3AF] ml-1">
                    ({field.form_field_type})
                  </span>
                ) : null}
              </span>
            </label>
          ))}
          {existingLoanTypeId && availableFields.length === 0 && (
            <p className="text-xs text-[#6B7280]">
              No input fields found on this form.
            </p>
          )}
        </div>
      </FormModal>

      <FormModal
        isOpen={newFieldModal}
        onClose={closeNewFieldModal}
        title="Design new form fields"
        onSubmit={handleLinkNew}
        submitLabel="Add to linked loan products"
        loading={newFieldLoading}
        width="max-w-5xl"
        error={newFieldError}
      >
        <p className="text-xs text-[#6B7280] mb-3">
          Drag fields onto the canvas. On save, they are added to every loan
          product currently linked to this parameter.
        </p>
        <div className="loan-type-formio relative min-h-[50vh] border border-[#E5E7EB] rounded-lg overflow-hidden">
          <FormBuilder
            key={builderKey}
            initialForm={builderInitialForm}
            options={LOAN_TYPE_FORM_BUILDER_OPTIONS}
            onBuilderReady={patchLoanTypeFormBuilder}
            onChange={handleBuilderFormChange}
          />
        </div>
      </FormModal>
    </div>
  );
}
