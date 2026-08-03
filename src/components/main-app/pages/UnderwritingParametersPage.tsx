// @ts-nocheck
import { useCallback, useEffect, useState } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { DataTable } from '../shared/DataTable';
import { FormModal, FormField, FormInput, FormSelect } from '../shared/FormModal';
import {
  capabilityOptionValue,
  flattenCapabilityOptions,
  parametersApi,
  parseCapabilityOptionValue,
} from '../../../apis/parameters';
import type {
  ParameterCapabilityOption,
  ParameterCreateRequest,
  ParameterListItem,
  ParameterSetting,
  ParameterType,
} from '../../../apis/types';
import {
  CORE_LOAN_TERM_OPTIONS,
  PARAMETER_TYPE_OPTIONS,
  PRODUCT_TOPICS,
} from '../../../constants/underwritingParameterLabels';

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
  const [loanApplicationColumn, setLoanApplicationColumn] = useState(
    CORE_LOAN_TERM_OPTIONS[0].value,
  );
  const [capabilityOptions, setCapabilityOptions] = useState<ParameterCapabilityOption[]>(
    [],
  );
  const [selectedCapability, setSelectedCapability] = useState('');
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

  const loadCapabilities = useCallback(async () => {
    setCapabilitiesLoading(true);
    try {
      const res = await parametersApi.allAdapterCapabilities();
      const options = flattenCapabilityOptions(res.data);
      setCapabilityOptions(options);
      setSelectedCapability((prev) => {
        if (prev && options.some((o) => capabilityOptionValue(o) === prev)) {
          return prev;
        }
        return options[0] ? capabilityOptionValue(options[0]) : '';
      });
    } catch (err: any) {
      setCapabilityOptions([]);
      setSelectedCapability('');
      setSubmitError(err.message || 'Failed to load data checks');
    } finally {
      setCapabilitiesLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!modalOpen || parameterType !== 'api_settings') return;
    loadCapabilities();
  }, [modalOpen, parameterType, loadCapabilities]);

  const resetCreateForm = () => {
    setName('');
    setTopic(PRODUCT_TOPICS[0]);
    setScoreWeightage('10');
    setParameterType('form_field_api');
    setLoanApplicationColumn(CORE_LOAN_TERM_OPTIONS[0].value);
    setSelectedCapability('');
    setCapabilityOptions([]);
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
    if (parameterType === 'loan_application_column') {
      if (!loanApplicationColumn) {
        setSubmitError('Choose a core loan term.');
        return null;
      }
      return { loan_application_column: loanApplicationColumn };
    }
    if (parameterType === 'api_settings') {
      const picked = parseCapabilityOptionValue(selectedCapability, capabilityOptions);
      if (!picked) {
        setSubmitError('Choose an external data check.');
        return null;
      }
      return {
        api_settings: {
          api_adapter: picked.api_adapter,
          api_adapter_fetch_method: picked.api_adapter_fetch_method,
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
            Generic scoring parameters. Topic is only a group label — each
            parameter gets its value from form fields or an external data check.
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
          <p className="text-xs text-[#6B7280] mt-1">
            Grouping only (e.g. Credit Bureau). Does not lock how the value is
            sourced.
          </p>
        </FormField>
        <FormField label="How this parameter gets its value" required>
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

        {parameterType === 'loan_application_column' && (
          <FormField label="Core loan term" required>
            <FormSelect
              value={loanApplicationColumn}
              onChange={setLoanApplicationColumn}
              options={CORE_LOAN_TERM_OPTIONS}
              placeholder="Select loan term"
            />
          </FormField>
        )}

        {parameterType === 'api_settings' && (
          <FormField label="External data check" required>
            <FormSelect
              value={selectedCapability}
              onChange={setSelectedCapability}
              options={capabilityOptions.map((c) => ({
                value: capabilityOptionValue(c),
                label: c.label,
              }))}
              placeholder={
                capabilitiesLoading ? 'Loading…' : 'Select a data check'
              }
              disabled={capabilitiesLoading || capabilityOptions.length === 0}
            />
          </FormField>
        )}

        {parameterType === 'form_field_api' && (
          <p className="text-xs text-[#6B7280]">
            After creating, open the parameter to link existing application form
            fields or design new ones with the form builder.
          </p>
        )}
        {parameterType === 'api_settings' && (
          <p className="text-xs text-[#6B7280]">
            Pick which external capability supplies this parameter when scoring.
            You can switch to form fields later on the detail page.
          </p>
        )}
      </FormModal>
    </div>
  );
}
