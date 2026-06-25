export type LoanTypeDetailSectionId = 'forms' | 'loan-approvals';

export type LoanTypeDetailSection = {
  id: LoanTypeDetailSectionId;
  label: string;
  description: string;
};

export const LOAN_TYPE_DETAIL_SECTIONS: LoanTypeDetailSection[] = [
  {
    id: 'forms',
    label: 'Form builder',
    description: 'Configure Form.io schemas for each workflow',
  },
  {
    id: 'loan-approvals',
    label: 'Loan approvals',
    description: 'Define approval steps and allowed designations',
  },
];
