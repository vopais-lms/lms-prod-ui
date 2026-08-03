// @ts-nocheck
import { useCallback, useEffect, useState } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { DataTable } from '../shared/DataTable';
import { FormModal, FormField, FormInput, FormSelect } from '../shared/FormModal';
import { parametersApi } from '../../../apis/parameters';
import type {
  ParameterCreateRequest,
  ParameterListItem,
  ParameterSetting,
  ParameterType,
} from '../../../apis/types';

const PRODUCT_TOPICS = [
  'Customer profile',
  'Employment details',
  'Loan details',
  'Credit Bureau',
  'Banking Analyses',
] as const;

const PARAMETER_TYPE_OPTIONS: { value: ParameterType; label: string }[] = [
  { value: 'form_field_api', label: 'Form field API' },
  { value: 'reference', label: 'Reference' },
  { value: 'loan_application_column', label: 'Loan application column' },
  { value: 'api_settings', label: 'API settings' },
];

type AdapterName = 'Decentro' | 'Finbox';

export function UnderwritingParametersPage() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<ParameterListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [topic, setTopic] = useState<string>(PRODUCT_TOPICS[0]);
  const [scoreWeightage, setScoreWeightage] = useState('10');
  const [parameterType, setParameterType] = useState<ParameterType>('form_field_api');
  const [referenceType, setReferenceType] = useState('');
  const [referenceId, setReferenceId] = useState('');
  const [loanApplicationColumn, setLoanApplicationColumn] = useState('');
  const [adapterName, setAdapterName] = useState<AdapterName>('Decentro');
  const [fetchMethod, setFetchMethod] = useState('');
  const [capabilities, setCapabilities] = useState<
    { label: string; api_adapter_fetch_method: string }[]
  >([]);
  const [capabilitiesLoading, setCapabilitiesLoading] = useState(false);

  const fetchRows = useCallback(async () => {
    setLoading(true);
    try {
      const res = await parametersApi.list({ page, per_page: 10 });
      setRows(res.data);
      setTotalRecords(res.total_records);
    } catch (err) {
      console.error('Failed to load parameters', err);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchRows();
  }, [fetchRows]);

  const loadCapabilities = useCallback(async (adapter: AdapterName) => {
    setCapabilitiesLoading(true);
    try {
      const res = await parametersApi.adapterCapabilities(adapter);
      setCapabilities(res.data || []);
      setFetchMethod((prev) => {
        const methods = (res.data || []).map((c) => c.api_adapter_fetch_method);
        return methods.includes(prev) ? prev : methods[0] || '';
      });
    } catch (err: any) {
      setCapabilities([]);
      setFetchMethod('');
      setSubmitError(err.message || 'Failed to load adapter capabilities');
    } finally {
      setCapabilitiesLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!modalOpen || parameterType !== 'api_settings') return;
    loadCapabilities(adapterName);
  }, [modalOpen, parameterType, adapterName, loadCapabilities]);

  const resetCreateForm = () => {
    setName('');
    setTopic(PRODUCT_TOPICS[0]);
    setScoreWeightage('10');
    setParameterType('form_field_api');
    setReferenceType('');
    setReferenceId('');
    setLoanApplicationColumn('');
    setAdapterName('Decentro');
    setFetchMethod('');
    setCapabilities([]);
    setSubmitError(null);
  };

  const openCreate = () => {
    resetCreateForm();
    setModalOpen(true);
  };

  const closeCreate = () => {
    setModalOpen(false);
    setSubmitError(null);
  };

  const buildSettings = (): ParameterSetting | null => {
    if (parameterType === 'form_field_api') {
      return {};
    }
    if (parameterType === 'reference') {
      if (!referenceType.trim() || !referenceId.trim()) {
        setSubmitError('Reference type and reference id are required.');
        return null;
      }
      return {
        reference: {
          reference_type: referenceType.trim(),
          reference_id: referenceId.trim(),
        },
      };
    }
    if (parameterType === 'loan_application_column') {
      if (!loanApplicationColumn.trim()) {
        setSubmitError('Loan application column is required.');
        return null;
      }
      return { loan_application_column: loanApplicationColumn.trim() };
    }
    if (parameterType === 'api_settings') {
      if (!adapterName || !fetchMethod) {
        setSubmitError('Adapter and fetch method are required for API settings.');
        return null;
      }
      return {
        api_settings: {
          api_adapter: adapterName,
          api_adapter_fetch_method: fetchMethod,
        },
      };
    }
    return {};
  };

  const handleSubmit = async () => {
    const trimmedName = name.trim();
    const trimmedTopic = topic.trim();
    const weight = Number(scoreWeightage);
    if (!trimmedName || !trimmedTopic || !Number.isFinite(weight)) {
      setSubmitError('Name, topic, and score weightage are required.');
      return;
    }
    const parameter_settings = buildSettings();
    if (!parameter_settings) return;

    const body: ParameterCreateRequest = {
      name: trimmedName,
      topic: trimmedTopic,
      score_weightage: weight,
      parameter_settings,
    };
    // Backend create Literal omits form_field_api — omit type to get that flavour.
    if (parameterType !== 'form_field_api') {
      body.parameter_type = parameterType;
    }

    setSubmitLoading(true);
    setSubmitError(null);
    try {
      const created = await parametersApi.create(body);
      setModalOpen(false);
      navigate(`/app/loan-types/underwriting/${created.id}`);
    } catch (err: any) {
      setSubmitError(err.message || 'Create failed');
    } finally {
      setSubmitLoading(false);
    }
  };

  const columns = [
    { key: 'id', label: 'ID', className: 'w-20' },
    {
      key: 'name',
      label: 'Parameter',
      render: (item: ParameterListItem) => (
        <span className="font-medium">{item.name}</span>
      ),
    },
    { key: 'eid', label: 'EID' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-[#111827]">
            Underwriting configurations
          </h2>
          <p className="text-sm text-[#6B7280]">
            Parameters used for scoring and form-field linkage
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#2563EB] text-white text-sm font-medium rounded-lg hover:bg-[#1D4ED8] transition-colors"
        >
          <PlusIcon className="w-4 h-4" />
          Add Parameter
        </button>
      </div>

      <DataTable
        columns={columns}
        data={rows}
        loading={loading}
        page={page}
        perPage={10}
        totalRecords={totalRecords}
        onPageChange={setPage}
        serverSidePagination
        rowKey={(item) => item.id}
        emptyMessage="No parameters found"
        onRowClick={(item) =>
          navigate(`/app/loan-types/underwriting/${item.id}`)
        }
      />

      <FormModal
        isOpen={modalOpen}
        onClose={closeCreate}
        title="Add Parameter"
        onSubmit={handleSubmit}
        submitLabel="Create"
        loading={submitLoading}
        error={submitError}
      >
        <FormField label="Name" required>
          <FormInput value={name} onChange={setName} placeholder="e.g. Monthly Income" />
        </FormField>
        <FormField label="Topic" required>
          <FormSelect
            value={topic}
            onChange={setTopic}
            options={PRODUCT_TOPICS.map((t) => ({ value: t, label: t }))}
            placeholder="Select topic"
          />
        </FormField>
        <FormField label="Parameter type" required>
          <FormSelect
            value={parameterType}
            onChange={(v) => {
              setParameterType(v as ParameterType);
              setSubmitError(null);
            }}
            options={PARAMETER_TYPE_OPTIONS}
            placeholder="Select type"
          />
        </FormField>
        <FormField label="Score weightage" required>
          <FormInput
            value={scoreWeightage}
            onChange={setScoreWeightage}
            placeholder="10"
          />
        </FormField>

        {parameterType === 'reference' && (
          <>
            <FormField label="Reference type" required>
              <FormInput
                value={referenceType}
                onChange={setReferenceType}
                placeholder="e.g. customer"
              />
            </FormField>
            <FormField label="Reference id" required>
              <FormInput
                value={referenceId}
                onChange={setReferenceId}
                placeholder="e.g. eid or id"
              />
            </FormField>
          </>
        )}

        {parameterType === 'loan_application_column' && (
          <FormField label="Loan application column" required>
            <FormInput
              value={loanApplicationColumn}
              onChange={setLoanApplicationColumn}
              placeholder="e.g. principal_amount"
            />
          </FormField>
        )}

        {parameterType === 'api_settings' && (
          <>
            <FormField label="API adapter" required>
              <FormSelect
                value={adapterName}
                onChange={(v) => setAdapterName(v as AdapterName)}
                options={[
                  { value: 'Decentro', label: 'Decentro' },
                  { value: 'Finbox', label: 'Finbox' },
                ]}
                placeholder="Select adapter"
              />
            </FormField>
            <FormField label="Fetch method" required>
              <FormSelect
                value={fetchMethod}
                onChange={setFetchMethod}
                options={capabilities.map((c) => ({
                  value: c.api_adapter_fetch_method,
                  label: `${c.label} (${c.api_adapter_fetch_method})`,
                }))}
                placeholder={
                  capabilitiesLoading ? 'Loading…' : 'Select fetch method'
                }
                disabled={capabilitiesLoading || capabilities.length === 0}
              />
            </FormField>
          </>
        )}

        {parameterType === 'form_field_api' && (
          <p className="text-xs text-[#6B7280]">
            Form fields can be linked after create from the parameter detail page.
          </p>
        )}
      </FormModal>
    </div>
  );
}
