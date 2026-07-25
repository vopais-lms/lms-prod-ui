export type LoanTypeDetailSectionId = 'forms' | 'loan-approvals';

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
];
