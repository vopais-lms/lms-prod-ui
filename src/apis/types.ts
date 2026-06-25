export interface PaginatedResponse<T> {
  page: number;
  per_page: number;
  total_records: number;
  total_employee_records?: number;
  data: T[];
}

export interface LoanType {
  id: number;
  name: string;
  status: boolean;
}

export interface LoanTypeListResponse {
  data: LoanType[];
  total: number;
  page: number;
  per_page: number;
}

export type LoanTypeFormPurpose =
  | 'loan_application_form_json'
  | 'disbursement_request_form_json'
  | 'moratorium_request_form_json';

export interface LoanTypeDetail extends LoanType {
  form_json?: Record<string, unknown> | null;
}

export interface TenantDetails {
  eid: string;
  name: string;
  contact_email: string;
  first_line_address?: string;
  second_line_address?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
  phone_number?: string;
  tenant_logo?: string;
}

export interface Branch {
  id: number;
  name: string;
  code: string;
  first_line_address: string;
  second_line_address: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  phone_number: string;
  is_active: boolean;
}

export interface EmployeeDesignation {
  id: number;
  name: string;
}

export interface Employee {
  eid: string;
  tenant_user_eid: string;
  tenant_eid: string;
  employee_id: string;
  branch_id: number;
  is_active: boolean;
  designation_id: number;
  date_of_joining: string;
  supervisor_eid: string | null;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
}

export interface AppModule {
  id: number;
  name?: string;
  link: string;
  label: string;
  icon?: string;
}

export interface Profile {
  id: number;
  is_internal: boolean;
  name: string;
  modules?: AppModule[];
}

export interface Permission {
  permission_id: number;
  permission_name: string;
}

// --- Auth ---

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
}

export interface CustomerLoginResponse {
  message: string;
}

export interface MenuItem {
  id: number;
  label: string;
  link: string;
  icon: string;
}

// --- Customer ---

export type LoanApplicationStatus =
  | 'inactive'
  | 'initiated'
  | 'submitted'
  | 'approval_pending'
  | 'approved'
  | 'rejected'
  | 'start_disbursement';

export interface LoanApplicationTerms {
  principal_disbursement_amount: number;
  interest_rate: number;
  emi_schedule: string;
  time_unit: string;
  no_of_units: number;
  amount_disbursed?: number;
  emi_start_date?: string | null;
  pre_emi_type?: string | null;
  pre_emi_last_date?: string | null;
  calculated_current_emi?: number;
  max_moratorium_period_in_days?: number;
  moratorium_active?: boolean;
  is_single_disbursement?: boolean;
  bpi_interest_rate?: number;
  bpi_calculation_type?: string;
  bpi_amount?: number;
  penalty_amount?: number;
  penalty_amount_paid?: number;
  penalty_basis?: string;
  penalty_calculation_type?: string;
  penalty_calculation_value?: number;
  penalty_calculation_frequency?: string;
}

export interface LoanApplication extends LoanApplicationTerms {
  eid: string;
  loan_type_id: number;
  customer_eid: string;
  loan_officer_eid: string;
  status: LoanApplicationStatus;
  created_at: string;
  updated_at: string;
}

export interface LoanApplicationDetail extends LoanApplication {
  form?: Record<string, unknown> | null;
  form_values?: Record<string, unknown> | null;
}

export interface LoanApplicationListResponse {
  data: LoanApplication[];
  page: number;
  per_page: number;
  total_records: number;
}

export type LoanApplicationCreatePayload = {
  loan_type_id: number;
  customer_eid: string;
  principal_disbursement_amount: number;
  interest_rate: number;
  emi_schedule: string;
  time_unit: string;
  no_of_units: number;
  emi_start_date?: string | null;
  max_moratorium_period_in_days?: number;
  is_single_disbursement?: boolean;
  bpi_interest_rate?: number | null;
  bpi_calculation_type?: string | null;
  bpi_amount?: number | null;
  penalty_basis?: string;
  penalty_calculation_type?: string;
  penalty_calculation_value?: number;
  penalty_calculation_frequency?: string;
};

export type LoanApplicationTermsUpdatePayload = LoanApplicationTerms;

export interface PaginatedListResponse<T> {
  data: T[];
  page: number;
  per_page: number;
  total_records: number;
}

export interface LoanApplicationUploadedFile {
  id: number;
  s3_link: string;
  document_type: string;
  record_id: number;
  purpose?: string | null;
  upload_status: string;
  custom_metadata?: Record<string, unknown> | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface LoanDisbursement {
  id: number;
  loan_application_eid: string;
  disbursement_amount: number;
  amortization_type: 'adjust_tenure' | 'keep_tenured_fixed';
  disbursement_due_date: string;
  status: string;
  loan_disbursement_external_txn_id?: string | null;
  description?: string | null;
}

export interface RepaymentSchedule {
  id: number;
  loan_application_eid: string;
  repayment_amount: number;
  repayment_due_date: string;
  principal_breakup: number;
  interest_breakup: number;
  bpi_breakup: number;
  status: boolean;
  type_of_repayment: string;
  created_at: string;
  updated_at: string;
}

export interface LoanApplicationApproval {
  id: number;
  loan_application_eid: string;
  approval_sequence: number;
  approver_id?: number | null;
  approver_eid?: string | null;
  approver_name?: string | null;
  approval_status: string;
  comments?: string | null;
  employee_designation_ids: number[];
  can_act: boolean;
}

export interface LoanApproval {
  id: number;
  loan_type_id: number;
  approval_sequence: number;
  employee_designation_ids: number[];
}

export interface LoanLedger {
  id: number;
  loan_application_eid: string;
  amount: number;
  transaction_datetime: string;
  transaction_type: string;
  balance: number;
  record_id: number;
  record_type: string;
}

export interface LoanApplicationPenalty {
  id: number;
  loan_application_eid: string;
  penalty_amount: number;
  penalty_amount_paid: number;
  penalty_status: string;
  created_at: string;
  updated_at: string;
}

export interface LoanCollection {
  id: number;
  loan_application_eid: string;
  loan_collection_officer_eid: string;
  amount: number;
  collection_datetime: string;
  collection_status: string;
  payment_mode: string;
  utr?: string | null;
  created_at: string;
  updated_at: string;
}

export type MoratoriumRequestStatus =
  | 'pending'
  | 'verification_pending'
  | 'approved'
  | 'rejected';

export interface MoratoriumRequestListItem {
  id: number;
  moratorium_request_eid: string;
  loan_application_eid: string;
  moratorium_type: string;
  moratorium_period_in_days: number;
  moratorium_start_date?: string | null;
  keep_tenured_fixed: boolean;
  status: MoratoriumRequestStatus;
  created_at: string;
  updated_at: string;
}

export interface MoratoriumRequestDetail extends MoratoriumRequestListItem {
  form_json?: Record<string, unknown> | null;
  form_values?: Record<string, unknown> | null;
}

export interface DisbursementRequestListItem {
  id: number;
  disbursement_request_eid: string;
  loan_application_eid: string;
  disbursement_amount: number;
  amortization_type: 'adjust_tenure' | 'keep_tenured_fixed';
  status: string;
  created_at: string;
  updated_at: string;
}

export interface DisbursementRequestDetail extends DisbursementRequestListItem {
  form_json?: Record<string, unknown> | null;
  form_values?: Record<string, unknown> | null;
}

export interface Customer {
  eid: string;
  tenant_user_eid: string;
  tenant_eid: string;
  linked_phone_number: string;
  email: string;
  is_active: boolean;
  name: string;
  first_line_address: string;
  second_line_address: string;
  secondary_phone: string | null;
  verified_phone_number_timestamp: string | null;
  verified_email_timestamp: string | null;
}

// --- KYC / Documents ---

export interface GovernmentDocument {
  id: number;
  name: string;
}

export interface CustomerDocument {
  id: number;
  user_government_document_value_mapping_id: number;
  document_name: string;
  document_id: number;
  file_url?: string;
  user_input_value?: string;
  extracted_value?: string;
  is_verified: boolean;
  verification_note?: string | null;
  extraction_status?: string;
}
