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
        label: 'Global Parameter Configurations',
        description: 'Tenant-wide scoring parameters and external data sources',
        path: '/app/loan-types/underwriting',
    },
];
