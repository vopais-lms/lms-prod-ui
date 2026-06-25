export type LoanApplicationDetailSectionId =
    | 'overview'
    | 'application-form'
    | 'approvals'
    | 'uploaded-documents'
    | 'disbursements'
    | 'repayment-schedule'
    | 'disbursement-requests'
    | 'ledgers'
    | 'loan-application-penalties'
    | 'collections'
    | 'moratorium-requests';

export type LoanApplicationDetailSection = {
    id: LoanApplicationDetailSectionId;
    label: string;
    description: string;
    lazy: boolean;
};

export const LOAN_APPLICATION_DETAIL_SECTIONS: LoanApplicationDetailSection[] = [
    {
        id: 'overview',
        label: 'Overview',
        description: 'Core loan application fields',
        lazy: false,
    },
    {
        id: 'application-form',
        label: 'Application form',
        description: 'Submitted Loan Type specific values',
        lazy: false,
    },
    {
        id: 'approvals',
        label: 'Approvals',
        description: 'Approval workflow steps for this application',
        lazy: true,
    },
    {
        id: 'uploaded-documents',
        label: 'Uploaded documents',
        description: 'Files attached to the application form',
        lazy: true,
    },
    {
        id: 'disbursements',
        label: 'Disbursements',
        description: 'Loan disbursement records',
        lazy: true,
    },
    {
        id: 'repayment-schedule',
        label: 'Repayment schedule',
        description: 'EMI repayment schedule for this loan',
        lazy: true,
    },
    {
        id: 'disbursement-requests',
        label: 'Disbursement requests',
        description: 'Disbursement request workflows',
        lazy: true,
    },
    {
        id: 'ledgers',
        label: 'Ledgers',
        description: 'Ledger transactions for this loan',
        lazy: true,
    },
    {
        id: 'loan-application-penalties',
        label: 'Penalties',
        description: 'Penalty records for this loan',
        lazy: true,
    },
    {
        id: 'collections',
        label: 'Collections',
        description: 'Collection records for this loan',
        lazy: true,
    },
    {
        id: 'moratorium-requests',
        label: 'Moratorium requests',
        description: 'Moratorium request workflows',
        lazy: true,
    },
];

export const LIST_FETCH_PER_PAGE = 100;
