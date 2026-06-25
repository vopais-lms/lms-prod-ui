// @ts-nocheck
import { useState, useEffect, useCallback, useRef } from 'react';
import {
  ArrowLeftIcon,
  DocumentArrowUpIcon,
  TrashIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  PencilSquareIcon,
  ShieldCheckIcon,
  DocumentMagnifyingGlassIcon,
  CloudArrowUpIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { useNavigate, useParams } from 'react-router-dom';
import { PageShell } from '../shared/PageShell';
import { StatusBadge } from '../shared/StatusBadge';
import { customersApi } from '../../../apis/customers';
import { customerDocumentsApi, customerVerificationsApi } from '../../../apis/customerDocuments';
import { governmentDocumentsApi } from '../../../apis/governmentDocuments';
import { hasUploadedCustomerDocumentFile } from '../../../apis/kycMappers';
import type { Customer, CustomerDocument, GovernmentDocument } from '../../../apis/types';

export function CustomerKycPage() {
  const navigate = useNavigate();
  const { customerEid } = useParams<{ customerEid: string }>();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [documents, setDocuments] = useState<CustomerDocument[]>([]);
  const [govDocs, setGovDocs] = useState<GovernmentDocument[]>([]);
  const [loading, setLoading] = useState(true);

  // Upload state
  const [uploadDocId, setUploadDocId] = useState<number | ''>('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Manual value states (per document)
  const [manualValues, setManualValues] = useState<Record<number, string>>({});
  const [manualValueErrors, setManualValueErrors] = useState<Record<number, string>>({});
  const [manualValueSuccess, setManualValueSuccess] = useState<Record<number, boolean>>({});
  const [verifyNotes, setVerifyNotes] = useState<Record<number, string>>({});
  const [actionLoading, setActionLoading] = useState<Record<number, boolean>>({});

  const fetchData = useCallback(async () => {
    if (!customerEid) return;
    setLoading(true);
    try {
      const [customerRes, docsRes, govDocsList] = await Promise.all([
        customersApi.get(customerEid),
        customerDocumentsApi.list(customerEid, { page: 1, per_page: 100 }),
        governmentDocumentsApi.list(),
      ]);
      setCustomer(customerRes);
      setDocuments(docsRes.data || []);
      setGovDocs(govDocsList);

      // Initialize manual values from existing data
      const values: Record<number, string> = {};
      (docsRes.data || []).forEach((doc: CustomerDocument) => {
        values[doc.user_government_document_value_mapping_id] = doc.user_input_value || '';
      });
      setManualValues(values);
    } catch (err) {
      console.error('Failed to load KYC data', err);
    } finally {
      setLoading(false);
    }
  }, [customerEid]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleUpload = async () => {
    if (!customerEid || !uploadFile || !uploadDocId) return;
    setUploading(true);
    setUploadError(null);
    try {
      const govDocumentId = Number(uploadDocId);
      const existingDoc = documents.find((doc) => doc.document_id === govDocumentId);

      if (existingDoc) {
        await customerDocumentsApi.replaceFile(
          customerEid,
          existingDoc.user_government_document_value_mapping_id,
          uploadFile,
        );
      } else {
        await customerDocumentsApi.upload(customerEid, uploadFile, govDocumentId);
      }

      setUploadFile(null);
      setUploadDocId('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      fetchData();
    } catch (err: any) {
      console.error('Upload failed', err);
      setUploadError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleReplaceFile = async (mappingId: number, file: File) => {
    if (!customerEid) return;
    setActionLoading((prev) => ({ ...prev, [mappingId]: true }));
    try {
      await customerDocumentsApi.replaceFile(customerEid, mappingId, file);
      fetchData();
    } catch (err) {
      console.error('Replace failed', err);
    } finally {
      setActionLoading((prev) => ({ ...prev, [mappingId]: false }));
    }
  };

  const handleManualValueSave = async (mappingId: number) => {
    if (!customerEid) return;

    const value = (manualValues[mappingId] ?? '').trim();
    if (!value) {
      setManualValueErrors((prev) => ({ ...prev, [mappingId]: 'Enter a document value before saving.' }));
      setManualValueSuccess((prev) => ({ ...prev, [mappingId]: false }));
      return;
    }

    setActionLoading((prev) => ({ ...prev, [mappingId]: true }));
    setManualValueErrors((prev) => ({ ...prev, [mappingId]: '' }));
    setManualValueSuccess((prev) => ({ ...prev, [mappingId]: false }));

    try {
      await customerDocumentsApi.manualValueAdd(customerEid, mappingId, {
        user_input_value: value,
      });
      setManualValueSuccess((prev) => ({ ...prev, [mappingId]: true }));
      await fetchData();
    } catch (err: any) {
      console.error('Manual value add failed', err);
      setManualValueErrors((prev) => ({
        ...prev,
        [mappingId]: err.message || 'Failed to save document value.',
      }));
    } finally {
      setActionLoading((prev) => ({ ...prev, [mappingId]: false }));
    }
  };

  const handleManualValueKeyDown = (mappingId: number, event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleManualValueSave(mappingId);
    }
  };

  const handleManualVerify = async (mappingId: number) => {
    if (!customerEid) return;
    setActionLoading((prev) => ({ ...prev, [mappingId]: true }));
    try {
      await customerDocumentsApi.manualVerify(customerEid, mappingId, {
        note: verifyNotes[mappingId] || null,
      });
      fetchData();
    } catch (err) {
      console.error('Manual verify failed', err);
    } finally {
      setActionLoading((prev) => ({ ...prev, [mappingId]: false }));
    }
  };

  const handleStartExtraction = async (doc: CustomerDocument) => {
    if (!customerEid) return;
    const mappingId = doc.user_government_document_value_mapping_id;
    setActionLoading((prev) => ({ ...prev, [mappingId]: true }));
    try {
      await customerVerificationsApi.startExtraction(customerEid, mappingId, {
        type_of_document: doc.document_name,
        document_id: doc.document_id,
      });
      fetchData();
    } catch (err) {
      console.error('Extraction start failed', err);
    } finally {
      setActionLoading((prev) => ({ ...prev, [mappingId]: false }));
    }
  };

  const handleDeleteDoc = async (mappingId: number) => {
    if (!customerEid) return;
    setActionLoading((prev) => ({ ...prev, [mappingId]: true }));
    try {
      await customerDocumentsApi.delete(customerEid, mappingId);
      fetchData();
    } catch (err) {
      console.error('Delete failed', err);
    } finally {
      setActionLoading((prev) => ({ ...prev, [mappingId]: false }));
    }
  };

  const getDocStatusInfo = (doc: CustomerDocument) => {
    if (doc.is_verified) return { status: 'verified' as const, label: 'Verified' };
    if (doc.extraction_status === 'completed' || doc.extraction_status?.includes('completed')) {
      return { status: 'extracted' as const, label: 'Extracted' };
    }
    if (doc.extraction_status === 'in_progress' || doc.extraction_status?.includes('in progress')) {
      return { status: 'pending' as const, label: 'Extracting...' };
    }
    if (doc.extraction_status === 'failed' || doc.extraction_status?.includes('failed')) {
      return { status: 'error' as const, label: 'Extraction Failed' };
    }
    if (hasUploadedCustomerDocumentFile(doc)) {
      return { status: 'pending' as const, label: 'Uploaded' };
    }
    return { status: 'pending' as const, label: 'Pending Review' };
  };

  const getCustomerDocumentForGovDoc = (govDocId: number) =>
    documents.find((doc) => doc.document_id === govDocId);

  const getGovDocCatalogStatus = (govDoc: GovernmentDocument) => {
    const customerDoc = getCustomerDocumentForGovDoc(govDoc.id);
    if (!customerDoc) {
      return { status: 'inactive' as const, label: 'Not uploaded' };
    }
    if (customerDoc.is_verified) {
      return { status: 'verified' as const, label: 'Verified' };
    }
    if (hasUploadedCustomerDocumentFile(customerDoc)) {
      return { status: 'active' as const, label: 'Uploaded' };
    }
    return { status: 'pending' as const, label: 'Pending upload' };
  };

  if (loading) {
    return (
      <PageShell title="Customer KYC" subtitle="Loading...">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-[#E5E7EB] p-6 animate-pulse">
              <div className="h-6 bg-[#E5E7EB] rounded w-1/3 mb-4" />
              <div className="h-32 bg-[#F3F4F6] rounded-lg" />
            </div>
          ))}
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Customer KYC Documents"
      subtitle={customer ? `${customer.name} — ${customer.linked_phone_number}` : ''}
      actions={
        <button
          onClick={() => navigate('/app/customers')}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-[#6B7280] bg-white border border-[#E5E7EB] rounded-lg hover:bg-[#F9FAFB] transition-colors"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Back to Customers
        </button>
      }
    >
      {/* Customer Info Card */}
      {customer && (
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-6 shadow-sm">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-[#6B7280] uppercase tracking-wide mb-1">Name</p>
              <p className="text-sm font-medium text-[#111827]">{customer.name}</p>
            </div>
            <div>
              <p className="text-xs text-[#6B7280] uppercase tracking-wide mb-1">Email</p>
              <p className="text-sm font-medium text-[#111827]">{customer.email}</p>
            </div>
            <div>
              <p className="text-xs text-[#6B7280] uppercase tracking-wide mb-1">Phone</p>
              <p className="text-sm font-medium text-[#111827]">{customer.linked_phone_number}</p>
            </div>
            <div>
              <p className="text-xs text-[#6B7280] uppercase tracking-wide mb-1">Status</p>
              <StatusBadge status={customer.is_active ? 'active' : 'inactive'} />
            </div>
          </div>
        </div>
      )}

      {govDocs.length > 0 && (
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-6 shadow-sm">
          <div className="mb-4">
            <h3 className="text-base font-semibold text-[#111827]">Government Document Types</h3>
            <p className="text-sm text-[#6B7280]">Required document catalog and upload status for this customer</p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-[#E5E7EB] text-left">
                  <th className="py-3 pr-4 font-medium text-[#6B7280]">Document Type</th>
                  <th className="py-3 pr-4 font-medium text-[#6B7280]">Status</th>
                  <th className="py-3 font-medium text-[#6B7280]">Customer Record</th>
                </tr>
              </thead>
              <tbody>
                {govDocs.map((govDoc) => {
                  const customerDoc = getCustomerDocumentForGovDoc(govDoc.id);
                  const catalogStatus = getGovDocCatalogStatus(govDoc);
                  return (
                    <tr key={govDoc.id} className="border-b border-[#F3F4F6] last:border-0">
                      <td className="py-3 pr-4 font-medium text-[#111827]">{govDoc.name}</td>
                      <td className="py-3 pr-4">
                        <StatusBadge status={catalogStatus.status} label={catalogStatus.label} />
                      </td>
                      <td className="py-3 text-[#6B7280]">
                        {customerDoc
                          ? `Mapping #${customerDoc.user_government_document_value_mapping_id}`
                          : 'Not created yet'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Upload New Document Card */}
      <div className="bg-white rounded-xl border-2 border-dashed border-[#D1D5DB] p-6 hover:border-[#2563EB] transition-colors">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-blue-50 rounded-xl">
            <CloudArrowUpIcon className="w-6 h-6 text-blue-600" />
          </div>
          <div className="flex-1 space-y-4">
            <div>
              <h3 className="text-base font-semibold text-[#111827]">Upload New Document</h3>
              <p className="text-sm text-[#6B7280]">Select a document type and upload the corresponding file</p>
            </div>
            {uploadError && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {uploadError}
              </p>
            )}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div>
                <label className="block text-sm font-medium text-[#374151] mb-1.5">Document Type</label>
                <select
                  value={uploadDocId}
                  onChange={(e) => setUploadDocId(e.target.value ? Number(e.target.value) : '')}
                  className="w-full px-3 py-2 text-sm border border-[#D1D5DB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
                >
                  <option value="">Select document type</option>
                  {govDocs.map((doc) => (
                    <option key={doc.id} value={doc.id}>{doc.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#374151] mb-1.5">File</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                  className="w-full text-sm text-[#6B7280] file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-[#F3F4F6] file:text-[#374151] hover:file:bg-[#E5E7EB]"
                  accept=".pdf,.jpg,.jpeg,.png"
                />
              </div>
              <button
                onClick={handleUpload}
                disabled={!uploadDocId || !uploadFile || uploading}
                className="px-4 py-2 text-sm font-medium text-white bg-[#2563EB] rounded-lg hover:bg-[#1D4ED8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <DocumentArrowUpIcon className="w-4 h-4" />
                {uploading ? 'Uploading...' : 'Upload'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Existing Documents — One Card Per Document */}
      {documents.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-12 text-center">
          <DocumentMagnifyingGlassIcon className="w-12 h-12 text-[#D1D5DB] mx-auto mb-4" />
          <h3 className="text-lg font-medium text-[#111827] mb-2">No Documents Yet</h3>
          <p className="text-sm text-[#6B7280]">Upload KYC documents above to get started with verification.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {documents.map((doc) => {
            const mappingId = doc.user_government_document_value_mapping_id;
            const statusInfo = getDocStatusInfo(doc);
            const isLoading = actionLoading[mappingId];

            return (
              <div
                key={mappingId}
                className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm overflow-hidden"
              >
                {/* Card Header */}
                <div className="px-6 py-4 bg-[#F9FAFB] border-b border-[#E5E7EB] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg border border-[#E5E7EB]">
                      <DocumentArrowUpIcon className="w-5 h-5 text-[#6B7280]" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-[#111827]">{doc.document_name || `Document #${doc.document_id}`}</h3>
                      <p className="text-xs text-[#6B7280]">ID: {mappingId}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={statusInfo.status} label={statusInfo.label} />
                    {isLoading && (
                      <ArrowPathIcon className="w-4 h-4 text-[#6B7280] animate-spin" />
                    )}
                  </div>
                </div>

                {/* Card Body — Two Columns */}
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left: Document Upload / File */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide">
                        Document File
                      </h4>
                      {hasUploadedCustomerDocumentFile(doc) ? (
                        <div className="p-4 bg-[#F9FAFB] rounded-lg border border-[#E5E7EB]">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <CheckCircleIcon className="w-4 h-4 text-green-500" />
                              <span className="text-sm text-[#374151] font-medium">File uploaded</span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {doc.file_url && (
                              <a
                                href={doc.file_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-1.5 text-xs font-medium text-[#2563EB] bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                              >
                                View File
                              </a>
                            )}
                            <label className="px-3 py-1.5 text-xs font-medium text-[#6B7280] bg-[#F3F4F6] rounded-lg hover:bg-[#E5E7EB] cursor-pointer transition-colors">
                              Replace
                              <input
                                type="file"
                                className="hidden"
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handleReplaceFile(mappingId, file);
                                }}
                              />
                            </label>
                          </div>
                        </div>
                      ) : (
                        <div className="p-4 bg-[#FFFBEB] rounded-lg border border-amber-200">
                          <p className="text-sm text-amber-700 mb-3">No file uploaded yet</p>
                          <label className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-amber-700 bg-amber-50 rounded-lg hover:bg-amber-100 cursor-pointer transition-colors border border-amber-200">
                            <CloudArrowUpIcon className="w-4 h-4" />
                            Upload Now
                            <input
                              type="file"
                              className="hidden"
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleReplaceFile(mappingId, file);
                              }}
                            />
                          </label>
                        </div>
                      )}

                      {/* Extraction Action */}
                      {!doc.is_verified && (
                        <button
                          onClick={() => handleStartExtraction(doc)}
                          disabled={isLoading || doc.extraction_status === 'in_progress'}
                          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-purple-700 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors border border-purple-200 disabled:opacity-50"
                        >
                          <DocumentMagnifyingGlassIcon className="w-4 h-4" />
                          {doc.extraction_status === 'in_progress' ? 'Extraction In Progress...' : 'Start Auto-Extraction'}
                        </button>
                      )}
                    </div>

                    {/* Right: Manual Entry */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide">
                        Manual Entry / Verification
                      </h4>

                      {/* Manual Value Input */}
                      <div>
                        <label className="block text-xs font-medium text-[#374151] mb-1.5">
                          Document Value (manual entry)
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={manualValues[mappingId] || ''}
                            onChange={(e) => {
                              setManualValues((prev) => ({ ...prev, [mappingId]: e.target.value }));
                              setManualValueErrors((prev) => ({ ...prev, [mappingId]: '' }));
                              setManualValueSuccess((prev) => ({ ...prev, [mappingId]: false }));
                            }}
                            onKeyDown={(e) => handleManualValueKeyDown(mappingId, e)}
                            placeholder="e.g. ABCDE1234F"
                            disabled={doc.is_verified || isLoading}
                            className="flex-1 px-3 py-2 text-sm border border-[#D1D5DB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent disabled:bg-[#F9FAFB] disabled:text-[#9CA3AF]"
                          />
                          <button
                            type="button"
                            onClick={() => handleManualValueSave(mappingId)}
                            disabled={doc.is_verified || isLoading}
                            className="px-3 py-2 text-xs font-medium text-white bg-[#2563EB] rounded-lg hover:bg-[#1D4ED8] transition-colors disabled:opacity-50 flex items-center gap-1.5"
                            title="Save Value"
                          >
                            {isLoading ? (
                              <ArrowPathIcon className="w-4 h-4 animate-spin" />
                            ) : (
                              <PencilSquareIcon className="w-4 h-4" />
                            )}
                            Save
                          </button>
                        </div>
                        {manualValueErrors[mappingId] && (
                          <p className="text-xs text-red-600 mt-1">{manualValueErrors[mappingId]}</p>
                        )}
                        {manualValueSuccess[mappingId] && !manualValueErrors[mappingId] && (
                          <p className="text-xs text-green-600 mt-1">Document value saved.</p>
                        )}
                        {doc.user_input_value && (
                          <p className="text-xs text-[#6B7280] mt-1">
                            Saved value: <strong className="text-[#111827]">{doc.user_input_value}</strong>
                          </p>
                        )}
                        {doc.extracted_value && !doc.user_input_value && (
                          <p className="text-xs text-purple-600 mt-1">
                            Extracted value: <strong>{doc.extracted_value}</strong>
                          </p>
                        )}
                      </div>

                      {/* Verification */}
                      {!doc.is_verified && (
                        <div>
                          <label className="block text-xs font-medium text-[#374151] mb-1.5">
                            Verification Note (optional)
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={verifyNotes[mappingId] || ''}
                              onChange={(e) =>
                                setVerifyNotes((prev) => ({ ...prev, [mappingId]: e.target.value }))
                              }
                              placeholder="Add verification note..."
                              className="flex-1 px-3 py-2 text-sm border border-[#D1D5DB] rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            />
                            <button
                              onClick={() => handleManualVerify(mappingId)}
                              disabled={isLoading}
                              className="px-3 py-2 text-xs font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center gap-1"
                              title="Verify"
                            >
                              <ShieldCheckIcon className="w-4 h-4" />
                              Verify
                            </button>
                          </div>
                        </div>
                      )}

                      {doc.is_verified && (
                        <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                          <div className="flex items-center gap-2">
                            <CheckCircleIcon className="w-4 h-4 text-emerald-600" />
                            <span className="text-sm font-medium text-emerald-700">Document Verified</span>
                          </div>
                          {doc.verification_note && (
                            <p className="text-xs text-emerald-600 mt-1">Note: {doc.verification_note}</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Footer — Delete */}
                <div className="px-6 py-3 bg-[#FAFAFA] border-t border-[#E5E7EB] flex justify-end">
                  <button
                    onClick={() => handleDeleteDoc(mappingId)}
                    disabled={isLoading}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <TrashIcon className="w-3.5 h-3.5" />
                    Remove Document
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </PageShell>
  );
}
