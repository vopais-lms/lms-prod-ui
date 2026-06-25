import type {
    AppModule,
    Branch,
    Customer,
    CustomerDocument,
    Employee,
    EmployeeDesignation,
    GovernmentDocument,
    MenuItem,
    Permission,
    Profile,
    TenantDetails,
} from '../apis/types'

export type MockCustomerDocument = CustomerDocument & {
    customer_eid: string
}

export const modules: AppModule[] = [
    { id: 1, name: 'branches', label: 'Branches', link: '/app/branches', icon: 'Building2' },
    { id: 2, name: 'employees', label: 'Employees', link: '/app/employees', icon: 'Users' },
    { id: 3, name: 'customers', label: 'Customers', link: '/app/customers', icon: 'UserRound' },
    { id: 4, name: 'profiles', label: 'Profiles', link: '/app/profiles', icon: 'ShieldCheck' },
    { id: 5, name: 'kyc', label: 'KYC Documents', link: '/app/customers', icon: 'FileCheck' },
]

export const menuItems: MenuItem[] = modules.map((module) => ({
    id: module.id,
    label: module.label,
    link: module.link,
    icon: module.icon ?? 'Circle',
}))

export const tenant: TenantDetails = {
    eid: 'tenant-demo',
    name: 'Aditi Digital Finance',
    contact_email: 'ops@aditi.example',
    first_line_address: '4th Floor, Horizon Tower',
    second_line_address: 'MI Road',
    city: 'Jaipur',
    state: 'Rajasthan',
    country: 'India',
    pincode: '302001',
    phone_number: '+91 141 400 1200',
}

export const branches: Branch[] = [
    {
        id: 101,
        name: 'Jaipur Main',
        code: 'JPR-001',
        first_line_address: 'Horizon Tower, MI Road',
        second_line_address: 'Near Ajmeri Gate',
        city: 'Jaipur',
        state: 'Rajasthan',
        country: 'India',
        pincode: '302001',
        phone_number: '+91 141 400 1200',
        is_active: true,
    },
    {
        id: 102,
        name: 'Delhi North',
        code: 'DEL-014',
        first_line_address: 'Netaji Subhash Place',
        second_line_address: 'Pitampura',
        city: 'Delhi',
        state: 'Delhi',
        country: 'India',
        pincode: '110034',
        phone_number: '+91 11 4500 9800',
        is_active: true,
    },
    {
        id: 103,
        name: 'Mumbai West',
        code: 'MUM-022',
        first_line_address: 'Linking Road',
        second_line_address: 'Bandra West',
        city: 'Mumbai',
        state: 'Maharashtra',
        country: 'India',
        pincode: '400050',
        phone_number: '+91 22 6100 4500',
        is_active: false,
    },
]

export const designations: EmployeeDesignation[] = [
    { id: 1, name: 'Branch Manager' },
    { id: 2, name: 'Loan Officer' },
    { id: 3, name: 'KYC Analyst' },
    { id: 4, name: 'Collections Executive' },
]

export const employees: Employee[] = [
    {
        eid: 'emp-001',
        tenant_user_eid: 'tu-001',
        tenant_eid: tenant.eid,
        employee_id: 'EMP-001',
        branch_id: 101,
        is_active: true,
        designation_id: 1,
        date_of_joining: '2023-02-14',
        supervisor_eid: null,
        first_name: 'Meera',
        last_name: 'Sharma',
        email: 'meera.sharma@aditi.example',
        phone_number: '+91 98765 12001',
    },
    {
        eid: 'emp-002',
        tenant_user_eid: 'tu-002',
        tenant_eid: tenant.eid,
        employee_id: 'EMP-002',
        branch_id: 101,
        is_active: true,
        designation_id: 2,
        date_of_joining: '2023-07-10',
        supervisor_eid: 'emp-001',
        first_name: 'Arjun',
        last_name: 'Kapoor',
        email: 'arjun.kapoor@aditi.example',
        phone_number: '+91 98765 12002',
    },
    {
        eid: 'emp-003',
        tenant_user_eid: 'tu-003',
        tenant_eid: tenant.eid,
        employee_id: 'EMP-003',
        branch_id: 102,
        is_active: false,
        designation_id: 3,
        date_of_joining: '2024-01-22',
        supervisor_eid: 'emp-001',
        first_name: 'Naina',
        last_name: 'Khan',
        email: 'naina.khan@aditi.example',
        phone_number: '+91 98765 12003',
    },
]

export const profiles: Profile[] = [
    { id: 1, is_internal: true, name: 'Administrator', modules },
    { id: 2, is_internal: true, name: 'Branch Operations', modules: modules.slice(0, 4) },
    { id: 3, is_internal: false, name: 'Customer Portal', modules: modules.slice(2, 3) },
]

export const permissions: Permission[] = [
    { permission_id: 1, permission_name: 'branches.manage' },
    { permission_id: 2, permission_name: 'employees.manage' },
    { permission_id: 3, permission_name: 'customers.manage' },
    { permission_id: 4, permission_name: 'kyc.verify' },
]

export const customers: Customer[] = [
    {
        eid: 'cust-001',
        tenant_user_eid: 'ctu-001',
        tenant_eid: tenant.eid,
        linked_phone_number: '+91 90000 10001',
        email: 'ritu.verma@example.com',
        is_active: true,
        name: 'Ritu Verma',
        first_line_address: '12 Civil Lines',
        second_line_address: 'Jaipur',
        secondary_phone: '+91 90000 19991',
        verified_phone_number_timestamp: '2025-01-08T10:30:00.000Z',
        verified_email_timestamp: '2025-01-08T10:32:00.000Z',
    },
    {
        eid: 'cust-002',
        tenant_user_eid: 'ctu-002',
        tenant_eid: tenant.eid,
        linked_phone_number: '+91 90000 10002',
        email: 'kabir.sethi@example.com',
        is_active: true,
        name: 'Kabir Sethi',
        first_line_address: '88 Nehru Place',
        second_line_address: 'New Delhi',
        secondary_phone: null,
        verified_phone_number_timestamp: null,
        verified_email_timestamp: null,
    },
]

export const governmentDocuments: GovernmentDocument[] = [
    { id: 1, name: 'PAN Card' },
    { id: 2, name: 'Aadhaar Card' },
    { id: 3, name: 'Voter ID' },
    { id: 4, name: 'Driving License' },
]

export const customerDocuments: MockCustomerDocument[] = [
    {
        customer_eid: 'cust-001',
        id: 1,
        user_government_document_value_mapping_id: 501,
        document_name: 'PAN Card',
        document_id: 1,
        file_url: '/mock-files/pan-card.pdf',
        user_input_value: 'ABCDE1234F',
        is_verified: true,
        verification_note: 'Matched customer name and date of birth.',
        extraction_status: 'completed',
    },
    {
        customer_eid: 'cust-001',
        id: 2,
        user_government_document_value_mapping_id: 502,
        document_name: 'Aadhaar Card',
        document_id: 2,
        file_url: '/mock-files/aadhaar-card.pdf',
        user_input_value: 'XXXX-XXXX-1234',
        is_verified: false,
        verification_note: null,
        extraction_status: 'completed',
    },
    {
        customer_eid: 'cust-002',
        id: 3,
        user_government_document_value_mapping_id: 503,
        document_name: 'Voter ID',
        document_id: 3,
        file_url: undefined,
        user_input_value: undefined,
        is_verified: false,
        verification_note: null,
        extraction_status: 'pending',
    },
]
