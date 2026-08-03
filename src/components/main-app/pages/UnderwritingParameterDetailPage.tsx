// @ts-nocheck
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useNavigate, useParams } from 'react-router-dom';
import { FormModal, FormField, FormInput } from '../shared/FormModal';
import { loanTypesApi } from '../../../apis/loanTypes';
import { parametersApi } from '../../../apis/parameters';
import type {
  LoanType,
  ParameterDetail,
  ParameterFormField,
  ParameterLinkedLoanType,
} from '../../../apis/types';

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
  const [newFormJsonText, setNewFormJsonText] = useState(
    '{\n  "forms": {\n    "main": {\n      "type": "form",\n      "components": [\n        {\n          "type": "textfield",\n          "key": "field1",\n          "label": "Field 1",\n          "input": true\n        }\n      ]\n    }\n  }\n}',
  );
  const [newFieldLoading, setNewFieldLoading] = useState(false);

  const [adapterName, setAdapterName] = useState<'Decentro' | 'Finbox'>('Decentro');
  const [adapterResult, setAdapterResult] = useState<string | null>(null);

  const activeLoanTypes = useMemo(
    () => allLoanTypes.filter((lt) => lt.status === true),
    [allLoanTypes],
  );

  const load = useCallback(async () => {
    if (!Number.isFinite(id)) {
      setError('Invalid parameter id');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [d, loans, loanTypes] = await Promise.all([
        parametersApi.get(id),
        parametersApi.getLoanTypes(id),
        loanTypesApi.list({ page: 1, per_page: 100 }),
      ]);
      setDetail(d);
      setName(d.name);
      setTopic(d.topic);
      setLinkedLoanTypes(loans.linked_loan_types);
      setAllLoanTypes(loanTypes.data);
    } catch (err: any) {
      setError(err.message || 'Failed to load parameter');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const formFieldApiPreview = useMemo(() => {
    const settings = detail?.parameter_setting || {};
    return JSON.stringify(settings.form_field_api ?? settings, null, 2);
  }, [detail]);

  const closeLinkLoanModal = () => {
    setLinkLoanModal(false);
    setLinkAllActive(false);
    setSelectedLoanTypeIds([]);
    setError(null);
  };

  const closeExistingModal = () => {
    setExistingModal(false);
    setError(null);
  };

  const closeNewFieldModal = () => {
    setNewFieldModal(false);
    setError(null);
  };

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
      setError(err.message || 'Failed to link loan types');
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
      setError(err.message || 'Failed to load form components');
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
      setError(err.message || 'Failed to link existing fields');
    } finally {
      setExistingLoading(false);
    }
  };

  const handleLinkNew = async () => {
    setNewFieldLoading(true);
    setError(null);
    try {
      const form_json = JSON.parse(newFormJsonText);
      await parametersApi.linkNewFormField(id, { form_json });
      closeNewFieldModal();
      await load();
    } catch (err: any) {
      setError(err.message || 'Failed to link new form fields');
    } finally {
      setNewFieldLoading(false);
    }
  };

  const loadAdapterCapabilities = async () => {
    try {
      const res = await parametersApi.adapterCapabilities(adapterName);
      setAdapterResult(JSON.stringify(res, null, 2));
    } catch (err: any) {
      setAdapterResult(err.message || 'Failed to load capabilities');
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
            {detail?.eid} · type {detail?.parameter_type}
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
            <FormInput value={topic} onChange={setTopic} />
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
          <h3 className="text-sm font-semibold text-[#111827]">Linked loan types</h3>
          <button
            onClick={() => {
              setLinkAllActive(false);
              setSelectedLoanTypeIds([]);
              setError(null);
              setLinkLoanModal(true);
            }}
            className="text-sm font-medium text-[#2563EB]"
          >
            Add loan types
          </button>
        </div>
        {linkedLoanTypes.length === 0 ? (
          <p className="text-sm text-[#6B7280]">No loan types linked yet.</p>
        ) : (
          <ul className="text-sm space-y-1">
            {linkedLoanTypes.map((lt) => (
              <li key={lt.loan_type_id}>
                {lt.loan_type_name} (#{lt.loan_type_id})
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-3 border border-[#E5E7EB] rounded-xl p-4 bg-white">
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => {
              setError(null);
              setExistingModal(true);
            }}
            className="px-3 py-2 text-sm rounded-lg border border-[#E5E7EB] hover:bg-[#F9FAFB]"
          >
            Link existing form fields
          </button>
          <button
            onClick={() => {
              setError(null);
              setNewFieldModal(true);
            }}
            className="px-3 py-2 text-sm rounded-lg border border-[#E5E7EB] hover:bg-[#F9FAFB]"
          >
            Link new form fields
          </button>
        </div>
        <h3 className="text-sm font-semibold text-[#111827]">
          form_field_api settings
        </h3>
        <pre className="text-xs bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg p-3 overflow-auto max-h-72">
          {formFieldApiPreview}
        </pre>
      </section>

      <section className="space-y-3 border border-[#E5E7EB] rounded-xl p-4 bg-white">
        <h3 className="text-sm font-semibold text-[#111827]">
          Adapter capabilities
        </h3>
        <div className="flex items-center gap-2">
          <select
            value={adapterName}
            onChange={(e) => setAdapterName(e.target.value)}
            className="border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm"
          >
            <option value="Decentro">Decentro</option>
            <option value="Finbox">Finbox</option>
          </select>
          <button
            onClick={loadAdapterCapabilities}
            className="px-3 py-2 text-sm rounded-lg border border-[#E5E7EB] hover:bg-[#F9FAFB]"
          >
            Load
          </button>
        </div>
        {adapterResult && (
          <pre className="text-xs bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg p-3 overflow-auto">
            {adapterResult}
          </pre>
        )}
      </section>

      <FormModal
        isOpen={linkLoanModal}
        onClose={closeLinkLoanModal}
        title="Link loan types"
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
              All active loan types
              <span className="block text-xs font-normal text-[#6B7280] mt-0.5">
                Links every loan type with status active ({activeLoanTypes.length}{' '}
                available).
              </span>
            </span>
          </label>

          <div
            className={`space-y-2 max-h-64 overflow-auto ${
              linkAllActive ? 'opacity-50 pointer-events-none' : ''
            }`}
          >
            {activeLoanTypes.length === 0 ? (
              <p className="text-xs text-[#6B7280]">No active loan types available.</p>
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
        title="Link existing form fields"
        onSubmit={handleLinkExisting}
        submitLabel="Link fields"
        loading={existingLoading}
      >
        <FormField label="Loan type">
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
            <option value="">Select loan type</option>
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
              {field.form_field_label} ({field.form_field_api})
            </label>
          ))}
          {existingLoanTypeId && availableFields.length === 0 && (
            <p className="text-xs text-[#6B7280]">No input fields found on this form.</p>
          )}
        </div>
      </FormModal>

      <FormModal
        isOpen={newFieldModal}
        onClose={closeNewFieldModal}
        title="Link new form fields"
        onSubmit={handleLinkNew}
        submitLabel="Add to linked loan types"
        loading={newFieldLoading}
      >
        <FormField label="Form.io JSON">
          <textarea
            className="w-full min-h-48 border border-[#E5E7EB] rounded-lg px-3 py-2 text-xs font-mono"
            value={newFormJsonText}
            onChange={(e) => setNewFormJsonText(e.target.value)}
          />
        </FormField>
        <p className="text-xs text-[#6B7280]">
          Fields are appended to every loan type currently linked to this parameter.
        </p>
      </FormModal>
    </div>
  );
}
