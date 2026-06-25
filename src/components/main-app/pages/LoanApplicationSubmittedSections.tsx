// @ts-nocheck
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { loanApplicationsApi } from '../../../apis/loanApplications';
import type {
  DisbursementRequestListItem,
  LoanApplicationApproval,
  LoanApplicationDetail,
  LoanApplicationPenalty,
  LoanApplicationUploadedFile,
  LoanCollection,
  LoanDisbursement,
  LoanLedger,
  MoratoriumRequestListItem,
  RepaymentSchedule,
} from '../../../apis/types';
import { LoanApplicationCollectionsPanel } from './LoanApplicationCollectionsPanel';
import { LoanApplicationApprovalsPanel } from './LoanApplicationApprovalsPanel';
import { LoanApplicationMoratoriumRequestsPanel } from './LoanApplicationMoratoriumRequestsPanel';
import { LoanApplicationDisbursementRequestsPanel } from './LoanApplicationDisbursementRequestsPanel';
import { LoanApplicationDisbursementsPanel } from './LoanApplicationDisbursementsPanel';
import {
  LOAN_APPLICATION_DETAIL_SECTIONS,
  LIST_FETCH_PER_PAGE,
  type LoanApplicationDetailSectionId,
} from '../../../constants/loanApplicationDetailSections';
import { buildStandardFieldGroups } from '../../../constants/loanApplicationFieldLabels';
import { DataTable } from '../shared/DataTable';
import { KeyValueGrid } from '../shared/KeyValueGrid';
import { LmsFormioReadOnlyForm } from '../shared/LmsFormioReadOnlyForm';
import { StatusBadge } from '../shared/StatusBadge';

type SectionListState<T> = {
  data: T[];
  totalRecords: number;
  page: number;
  loading: boolean;
  error: string | null;
};

type LoanApplicationSubmittedSectionsProps = {
  eid: string;
  application: LoanApplicationDetail;
  onApplicationReload?: () => Promise<void>;
};

function basenameFromS3Link(s3Link: string): string {
  const parts = s3Link.split('/');
  return parts[parts.length - 1] || s3Link;
}

function formatMoney(value: number | string | undefined): string {
  const num = Number(value);
  if (Number.isNaN(num)) {
    return '—';
  }
  return `₹${num.toLocaleString()}`;
}

function formatDateTime(value: string | undefined): string {
  if (!value) return '—';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }
  return parsed.toLocaleString();
}

function createEmptyListState<T>(): SectionListState<T> {
  return {
    data: [],
    totalRecords: 0,
    page: 1,
    loading: false,
    error: null,
  };
}

export function LoanApplicationSubmittedSections({
  eid,
  application,
  onApplicationReload,
}: LoanApplicationSubmittedSectionsProps) {
  const [activeSection, setActiveSection] =
    useState<LoanApplicationDetailSectionId>('overview');

  const fetchedSectionsRef = useRef<Set<LoanApplicationDetailSectionId>>(new Set());

  const [uploadedFiles, setUploadedFiles] =
    useState(createEmptyListState<LoanApplicationUploadedFile>());
  const [disbursements, setDisbursements] =
    useState(createEmptyListState<LoanDisbursement>());
  const [repaymentSchedules, setRepaymentSchedules] =
    useState(createEmptyListState<RepaymentSchedule>());
  const [disbursementRequests, setDisbursementRequests] =
    useState(createEmptyListState<DisbursementRequestListItem>());
  const [ledgers, setLedgers] = useState(createEmptyListState<LoanLedger>());
  const [loanApplicationPenalties, setLoanApplicationPenalties] =
    useState(createEmptyListState<LoanApplicationPenalty>());
  const [collections, setCollections] = useState(createEmptyListState<LoanCollection>());
  const [moratoriumRequests, setMoratoriumRequests] =
    useState(createEmptyListState<MoratoriumRequestListItem>());
  const [approvals, setApprovals] =
    useState(createEmptyListState<LoanApplicationApproval>());

  const [downloadingFileId, setDownloadingFileId] = useState<number | null>(null);

  const visibleSections = useMemo(
    () =>
      LOAN_APPLICATION_DETAIL_SECTIONS.filter(
        (section) =>
          section.id !== 'disbursement-requests' ||
          application.is_single_disbursement === false,
      ),
    [application.is_single_disbursement],
  );

  useEffect(() => {
    if (
      application.is_single_disbursement !== false &&
      activeSection === 'disbursement-requests'
    ) {
      setActiveSection('overview');
    }
  }, [application.is_single_disbursement, activeSection]);

  const fetchApprovals = useCallback(
    async ({ force = false }: { force?: boolean } = {}) => {
      if (!force && fetchedSectionsRef.current.has('approvals')) {
        return;
      }

      if (force) {
        fetchedSectionsRef.current.delete('approvals');
      }
      fetchedSectionsRef.current.add('approvals');

      const listParams = { page: 1, per_page: LIST_FETCH_PER_PAGE };

      setApprovals((prev) => ({
        ...prev,
        loading: prev.data.length === 0,
        error: null,
      }));

      try {
        const res = await loanApplicationsApi.listApprovals(eid, listParams);
        setApprovals({
          data: res.data,
          totalRecords: res.total_records,
          page: 1,
          loading: false,
          error: null,
        });
      } catch (err: any) {
        fetchedSectionsRef.current.delete('approvals');
        setApprovals((prev) => ({
          ...prev,
          loading: false,
          error: err?.message || 'Failed to load approvals',
        }));
      }
    },
    [eid],
  );

  const loadSectionOnce = useCallback(
    async (sectionId: LoanApplicationDetailSectionId) => {
      if (fetchedSectionsRef.current.has(sectionId)) {
        return;
      }
      fetchedSectionsRef.current.add(sectionId);

      const listParams = { page: 1, per_page: LIST_FETCH_PER_PAGE };

      try {
        switch (sectionId) {
          case 'uploaded-documents': {
            setUploadedFiles((prev) => ({ ...prev, loading: true, error: null }));
            const res = await loanApplicationsApi.listUploadedFiles(eid, listParams);
            setUploadedFiles({
              data: res.data,
              totalRecords: res.total_records,
              page: 1,
              loading: false,
              error: null,
            });
            break;
          }
          case 'disbursements': {
            setDisbursements((prev) => ({ ...prev, loading: true, error: null }));
            const res = await loanApplicationsApi.listDisbursements(eid, listParams);
            setDisbursements({
              data: res.data,
              totalRecords: res.total_records,
              page: 1,
              loading: false,
              error: null,
            });
            break;
          }
          case 'repayment-schedule': {
            setRepaymentSchedules((prev) => ({ ...prev, loading: true, error: null }));
            const res = await loanApplicationsApi.listRepaymentSchedules(eid, listParams);
            setRepaymentSchedules({
              data: res.data,
              totalRecords: res.total_records,
              page: 1,
              loading: false,
              error: null,
            });
            break;
          }
          case 'disbursement-requests': {
            setDisbursementRequests((prev) => ({ ...prev, loading: true, error: null }));
            const res = await loanApplicationsApi.listDisbursementRequests(eid, listParams);
            setDisbursementRequests({
              data: res.data,
              totalRecords: res.total_records,
              page: 1,
              loading: false,
              error: null,
            });
            break;
          }
          case 'ledgers': {
            setLedgers((prev) => ({ ...prev, loading: true, error: null }));
            const res = await loanApplicationsApi.listLedgers(eid, listParams);
            setLedgers({
              data: res.data,
              totalRecords: res.total_records,
              page: 1,
              loading: false,
              error: null,
            });
            break;
          }
          case 'loan-application-penalties': {
            setLoanApplicationPenalties((prev) => ({ ...prev, loading: true, error: null }));
            const res = await loanApplicationsApi.listLoanApplicationPenalties(eid, listParams);
            setLoanApplicationPenalties({
              data: res.data,
              totalRecords: res.total_records,
              page: 1,
              loading: false,
              error: null,
            });
            break;
          }
          case 'collections': {
            setCollections((prev) => ({ ...prev, loading: true, error: null }));
            const res = await loanApplicationsApi.listCollections(eid, listParams);
            setCollections({
              data: res.data,
              totalRecords: res.total_records,
              page: 1,
              loading: false,
              error: null,
            });
            break;
          }
          case 'moratorium-requests': {
            setMoratoriumRequests((prev) => ({ ...prev, loading: true, error: null }));
            const res = await loanApplicationsApi.listMoratoriumRequests(eid, listParams);
            setMoratoriumRequests({
              data: res.data,
              totalRecords: res.total_records,
              page: 1,
              loading: false,
              error: null,
            });
            break;
          }
          case 'approvals': {
            fetchedSectionsRef.current.delete('approvals');
            await fetchApprovals({ force: true });
            break;
          }
          default:
            fetchedSectionsRef.current.delete(sectionId);
        }
      } catch (err: any) {
        fetchedSectionsRef.current.delete(sectionId);
        const message = err?.message || 'Failed to load data';

        switch (sectionId) {
          case 'uploaded-documents':
            setUploadedFiles((prev) => ({ ...prev, loading: false, error: message }));
            break;
          case 'disbursements':
            setDisbursements((prev) => ({ ...prev, loading: false, error: message }));
            break;
          case 'repayment-schedule':
            setRepaymentSchedules((prev) => ({ ...prev, loading: false, error: message }));
            break;
          case 'disbursement-requests':
            setDisbursementRequests((prev) => ({ ...prev, loading: false, error: message }));
            break;
          case 'ledgers':
            setLedgers((prev) => ({ ...prev, loading: false, error: message }));
            break;
          case 'loan-application-penalties':
            setLoanApplicationPenalties((prev) => ({ ...prev, loading: false, error: message }));
            break;
          case 'collections':
            setCollections((prev) => ({ ...prev, loading: false, error: message }));
            break;
          case 'moratorium-requests':
            setMoratoriumRequests((prev) => ({ ...prev, loading: false, error: message }));
            break;
          case 'approvals':
            setApprovals((prev) => ({ ...prev, loading: false, error: message }));
            break;
        }
      }
    },
    [eid, fetchApprovals],
  );

  const reloadApprovals = useCallback(async () => {
    await fetchApprovals({ force: true });
  }, [fetchApprovals]);

  const reloadMoratoriumRequests = useCallback(async () => {
    fetchedSectionsRef.current.delete('moratorium-requests');
    await loadSectionOnce('moratorium-requests');
  }, [loadSectionOnce]);

  const reloadDisbursementRequests = useCallback(async () => {
    fetchedSectionsRef.current.delete('disbursement-requests');
    await loadSectionOnce('disbursement-requests');
  }, [loadSectionOnce]);

  const reloadDisbursements = useCallback(async () => {
    fetchedSectionsRef.current.delete('disbursements');
    await loadSectionOnce('disbursements');
  }, [loadSectionOnce]);

  const reloadCollections = useCallback(async () => {
    fetchedSectionsRef.current.delete('collections');
    await loadSectionOnce('collections');
  }, [loadSectionOnce]);

  useEffect(() => {
    const section = LOAN_APPLICATION_DETAIL_SECTIONS.find((item) => item.id === activeSection);
    if (section?.lazy) {
      loadSectionOnce(activeSection);
    }
  }, [activeSection, loadSectionOnce]);

  const handleDownloadFile = async (fileId: number) => {
    setDownloadingFileId(fileId);
    try {
      const res = await loanApplicationsApi.downloadUploadedFile(eid, fileId);
      if (res.url) {
        window.open(res.url, '_blank', 'noopener,noreferrer');
      }
    } catch (err) {
      console.error('Failed to download file', err);
    } finally {
      setDownloadingFileId(null);
    }
  };

  const activeMeta = visibleSections.find((item) => item.id === activeSection);
  const standardFieldGroups = buildStandardFieldGroups(application);

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'overview':
        return <KeyValueGrid groups={standardFieldGroups} />;

      case 'application-form':
        if (!application.form) {
          return (
            <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              No application form schema is configured for this loan type.
            </p>
          );
        }
        return (
          <LmsFormioReadOnlyForm
            form={application.form}
            submission={(application.form_values as Record<string, unknown>) || {}}
          />
        );

      case 'approvals':
        return (
          <LoanApplicationApprovalsPanel
            eid={eid}
            approvals={approvals.data}
            loading={approvals.loading}
            error={approvals.error}
            onReload={reloadApprovals}
            onApplicationReload={onApplicationReload}
          />
        );

      case 'uploaded-documents':
        if (uploadedFiles.error) {
          return <SectionError message={uploadedFiles.error} />;
        }
        return (
          <DataTable
            columns={[
              {
                key: 'field',
                label: 'Form field',
                render: (item) =>
                  String(item.custom_metadata?.form_field_key ?? '—'),
              },
              {
                key: 'file',
                label: 'File',
                render: (item) => basenameFromS3Link(item.s3_link),
              },
              {
                key: 'status',
                label: 'Status',
                render: (item) => item.upload_status,
              },
              {
                key: 'action',
                label: 'Action',
                render: (item) => (
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      handleDownloadFile(item.id);
                    }}
                    disabled={downloadingFileId === item.id}
                    className="text-sm text-[#2563EB] hover:underline disabled:opacity-50"
                  >
                    {downloadingFileId === item.id ? 'Opening…' : 'Download'}
                  </button>
                ),
              },
            ]}
            data={uploadedFiles.data}
            loading={uploadedFiles.loading}
            page={uploadedFiles.page}
            totalRecords={uploadedFiles.totalRecords}
            onPageChange={(newPage) => setUploadedFiles((prev) => ({ ...prev, page: newPage }))}
            rowKey={(item) => item.id}
            emptyMessage="No uploaded documents"
          />
        );

      case 'disbursements':
        return (
          <LoanApplicationDisbursementsPanel
            loanApplicationEid={eid}
            application={application}
            disbursements={disbursements.data}
            loading={disbursements.loading}
            error={disbursements.error}
            onReload={reloadDisbursements}
            onApplicationReload={onApplicationReload}
          />
        );

      case 'repayment-schedule':
        if (repaymentSchedules.error) {
          return <SectionError message={repaymentSchedules.error} />;
        }
        return (
          <DataTable
            columns={[
              { key: 'id', label: 'ID' },
              {
                key: 'repayment_due_date',
                label: 'Due date',
                render: (item) => formatDateTime(item.repayment_due_date),
              },
              {
                key: 'repayment_amount',
                label: 'EMI amount',
                render: (item) => formatMoney(item.repayment_amount),
              },
              {
                key: 'principal_breakup',
                label: 'Principal',
                render: (item) => formatMoney(item.principal_breakup),
              },
              {
                key: 'interest_breakup',
                label: 'Interest',
                render: (item) => formatMoney(item.interest_breakup),
              },
              {
                key: 'bpi_breakup',
                label: 'BPI',
                render: (item) => formatMoney(item.bpi_breakup),
              },
              { key: 'type_of_repayment', label: 'Type' },
              {
                key: 'status',
                label: 'Status',
                render: (item) => (
                  <StatusBadge
                    status={item.status ? 'approved' : 'pending'}
                    label={item.status ? 'Paid' : 'Unpaid'}
                  />
                ),
              },
              {
                key: 'created_at',
                label: 'Created',
                render: (item) => formatDateTime(item.created_at),
              },
              {
                key: 'updated_at',
                label: 'Updated',
                render: (item) => formatDateTime(item.updated_at),
              },
            ]}
            data={repaymentSchedules.data}
            loading={repaymentSchedules.loading}
            page={repaymentSchedules.page}
            totalRecords={repaymentSchedules.totalRecords}
            onPageChange={(newPage) => setRepaymentSchedules((prev) => ({ ...prev, page: newPage }))}
            rowKey={(item) => item.id}
            emptyMessage="No repayment schedule entries"
          />
        );

      case 'disbursement-requests':
        return (
          <LoanApplicationDisbursementRequestsPanel
            loanApplicationEid={eid}
            application={application}
            requests={disbursementRequests.data}
            loading={disbursementRequests.loading}
            error={disbursementRequests.error}
            onReload={reloadDisbursementRequests}
          />
        );

      case 'ledgers':
        if (ledgers.error) {
          return <SectionError message={ledgers.error} />;
        }
        return (
          <DataTable
            columns={[
              { key: 'id', label: 'ID' },
              {
                key: 'transaction_datetime',
                label: 'Date',
                render: (item) => formatDateTime(item.transaction_datetime),
              },
              { key: 'transaction_type', label: 'Type' },
              {
                key: 'amount',
                label: 'Amount',
                render: (item) => formatMoney(item.amount),
              },
              {
                key: 'balance',
                label: 'Balance',
                render: (item) => formatMoney(item.balance),
              },
              { key: 'record_type', label: 'Record type' },
            ]}
            data={ledgers.data}
            loading={ledgers.loading}
            page={ledgers.page}
            totalRecords={ledgers.totalRecords}
            onPageChange={(newPage) => setLedgers((prev) => ({ ...prev, page: newPage }))}
            rowKey={(item) => item.id}
            emptyMessage="No ledger entries"
          />
        );

      case 'loan-application-penalties':
        if (loanApplicationPenalties.error) {
          return <SectionError message={loanApplicationPenalties.error} />;
        }
        return (
          <DataTable
            columns={[
              { key: 'id', label: 'ID' },
              {
                key: 'penalty_amount',
                label: 'Amount',
                render: (item) => formatMoney(item.penalty_amount),
              },
              {
                key: 'penalty_amount_paid',
                label: 'Paid',
                render: (item) => formatMoney(item.penalty_amount_paid),
              },
              { key: 'penalty_status', label: 'Status' },
              {
                key: 'created_at',
                label: 'Created',
                render: (item) => formatDateTime(item.created_at),
              },
              {
                key: 'updated_at',
                label: 'Updated',
                render: (item) => formatDateTime(item.updated_at),
              },
            ]}
            data={loanApplicationPenalties.data}
            loading={loanApplicationPenalties.loading}
            page={loanApplicationPenalties.page}
            totalRecords={loanApplicationPenalties.totalRecords}
            onPageChange={(newPage) =>
              setLoanApplicationPenalties((prev) => ({ ...prev, page: newPage }))
            }
            rowKey={(item) => item.id}
            emptyMessage="No penalty records"
          />
        );

      case 'collections':
        return (
          <LoanApplicationCollectionsPanel
            loanApplicationEid={eid}
            application={application}
            collections={collections.data}
            loading={collections.loading}
            error={collections.error}
            onReload={reloadCollections}
          />
        );

      case 'moratorium-requests':
        return (
          <LoanApplicationMoratoriumRequestsPanel
            loanApplicationEid={eid}
            application={application}
            requests={moratoriumRequests.data}
            loading={moratoriumRequests.loading}
            error={moratoriumRequests.error}
            onReload={reloadMoratoriumRequests}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)] gap-6">
      <aside className="bg-white rounded-xl border border-[#E5E7EB] p-4 h-fit">
        <h3 className="text-sm font-semibold text-[#111827] mb-3">Sections</h3>
        <nav className="space-y-2">
          {visibleSections.map((section) => {
            const isActive = section.id === activeSection;
            return (
              <button
                key={section.id}
                type="button"
                onClick={() => setActiveSection(section.id)}
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
      </aside>

      <section className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm">
        <div className="px-6 py-4 border-b border-[#E5E7EB]">
          <h3 className="text-base font-semibold text-[#111827]">{activeMeta?.label}</h3>
          <p className="text-sm text-[#6B7280]">{activeMeta?.description}</p>
        </div>
        <div className="p-6">{renderSectionContent()}</div>
      </section>
    </div>
  );
}

function SectionError({ message }: { message: string }) {
  return (
    <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
      {message}
    </p>
  );
}
