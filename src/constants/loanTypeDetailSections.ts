export type LoanTypeDetailSectionId = 'forms' | 'loan-approvals' | 'underwriting-config';

export type LoanTypeDetailSection = {
  id: LoanTypeDetailSectionId;
  label: string;
  description: string;
};

export const LOAN_TYPE_DETAIL_SECTIONS: LoanTypeDetailSection[] = [
  {
    id: 'forms',
    label: 'Loan Application Customized Form',
    description: 'Design the custom application form fields borrowers fill for this loan product',
  },
  {
    id: 'loan-approvals',
    label: 'Loan approvals',
    description: 'Define approval steps and allowed designations',
  },
  {
    id: 'underwriting-config',
    label: 'Underwriting configuration',
    description: 'Manage verification and scoring parameter groups for this loan type',
  },
];
