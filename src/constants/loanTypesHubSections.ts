export type LoanTypesHubSectionId = 'configurations' | 'underwriting';

export type LoanTypesHubSection = {
  id: LoanTypesHubSectionId;
  label: string;
  description: string;
  path: string;
};

export const LOAN_TYPES_HUB_SECTIONS: LoanTypesHubSection[] = [
  {
    id: 'configurations',
    label: 'Loan Type Configurations',
    description: 'Manage loan products, forms, and approval chains',
    path: '/app/loan-types',
  },
  {
    id: 'underwriting',
    label: 'Underwriting configurations',
    description: 'Score parameters and data sources for underwriting',
    path: '/app/loan-types/underwriting',
  },
];
