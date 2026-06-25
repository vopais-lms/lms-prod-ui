import { delay, http, HttpResponse } from 'msw'
import type {
  Branch,
  Customer,
  CustomerDocument,
  Employee,
  EmployeeDesignation,
  PaginatedResponse,
  Profile,
  TenantDetails,
} from '../apis/types'
import {
  branches,
  customerDocuments,
  customers,
  designations,
  employees,
  governmentDocuments,
  menuItems,
  modules,
  permissions,
  profiles,
  tenant,
} from './db'
import type { MockCustomerDocument } from './db'

type ListParams = {
  page: number
  perPage: number
}

type Scenario = 'normal' | 'empty' | 'unauthorized' | 'server-error' | 'slow' | 'validation-error'

const nowIso = () => new Date().toISOString()

const nextNumericId = <T extends { id: number }>(items: T[]) =>
  Math.max(0, ...items.map((item) => item.id)) + 1

const nextMappingId = () =>
  Math.max(500, ...customerDocuments.map((doc) => doc.user_government_document_value_mapping_id)) + 1

const readScenario = (): Scenario => {
  const scenario = window.localStorage.getItem('mock:scenario') as Scenario | null
  return scenario ?? 'normal'
}

const scenarioGate = async (request: Request): Promise<Response | undefined> => {
  const scenario = readScenario()

  await delay(scenario === 'slow' ? 900 : 150)

  if (scenario === 'unauthorized') {
    return HttpResponse.json({ message: 'Mock unauthorized response' }, { status: 401 })
  }

  if (scenario === 'server-error') {
    return HttpResponse.json({ message: 'Mock server error response' }, { status: 500 })
  }

  if (scenario === 'validation-error' && request.method !== 'GET') {
    return HttpResponse.json(
      { message: 'Mock validation error', errors: { name: ['This field is required.'] } },
      { status: 422 },
    )
  }

  return undefined
}

const parseJson = async <T>(request: Request): Promise<Partial<T>> => {
  try {
    return (await request.json()) as Partial<T>
  } catch {
    return {}
  }
}

const getListParams = (request: Request): ListParams => {
  const url = new URL(request.url)
  const page = Number(url.searchParams.get('page') ?? 1)
  const perPage = Number(url.searchParams.get('per_page') ?? 10)

  return {
    page: Number.isFinite(page) && page > 0 ? page : 1,
    perPage: Number.isFinite(perPage) && perPage > 0 ? perPage : 10,
  }
}

const paginate = <T>(items: T[], request: Request): PaginatedResponse<T> => {
  const scenario = readScenario()
  const { page, perPage } = getListParams(request)
  const sourceItems = scenario === 'empty' ? [] : items
  const start = (page - 1) * perPage

  return {
    page,
    per_page: perPage,
    total_records: sourceItems.length,
    data: sourceItems.slice(start, start + perPage),
  }
}

const idParam = (value: string | readonly string[] | undefined) =>
  Number(Array.isArray(value) ? value[0] : value)

const stringParam = (value: string | readonly string[] | undefined) =>
  Array.isArray(value) ? value[0] : value ?? ''

const notFound = (message: string) => HttpResponse.json({ message }, { status: 404 })

const publicDocument = (doc: MockCustomerDocument): CustomerDocument => {
  const { customer_eid: customerEid, ...rest } = doc
  void customerEid
  return rest
}

const customerDocumentList = (customerEid: string, request: Request) => {
  const docs = customerDocuments
    .filter((doc) => doc.customer_eid === customerEid)
    .map(publicDocument)

  return paginate(docs, request)
}

const loginResponse = {
  access_token: 'mock-access-token',
  refresh_token: 'mock-refresh-token',
}

export const handlers = [
  http.post('/api/v1/auth/login', async ({ request }) => {
    const gate = await scenarioGate(request)
    if (gate) return gate

    return HttpResponse.json(loginResponse)
  }),

  http.post('/api/v1/auth/refresh_token', async ({ request }) => {
    const gate = await scenarioGate(request)
    if (gate) return gate

    return HttpResponse.json(loginResponse)
  }),

  http.post('/api/v1/auth/reset_password', async ({ request }) => {
    const gate = await scenarioGate(request)
    if (gate) return gate

    return new HttpResponse(null, { status: 204 })
  }),

  http.post('/api/v1/auth/customer_login', async ({ request }) => {
    const gate = await scenarioGate(request)
    if (gate) return gate

    return HttpResponse.json({ message: 'If the number is registered, an OTP has been sent.' })
  }),

  http.post('/api/v1/auth/authenticate_customer_otp', async ({ request }) => {
    const gate = await scenarioGate(request)
    if (gate) return gate

    return HttpResponse.json(loginResponse)
  }),

  http.get('/api/v1/auth/menu_items', async ({ request }) => {
    const gate = await scenarioGate(request)
    if (gate) return gate

    return HttpResponse.json({ data: menuItems })
  }),

  http.post('/api/v1/tenant_details/register', async ({ request }) => {
    const gate = await scenarioGate(request)
    if (gate) return gate

    const body = await parseJson<TenantDetails>(request)
    Object.assign(tenant, body, { eid: tenant.eid })

    return HttpResponse.json(tenant)
  }),

  http.post('/api/v1/tenant_details/:tenantEid/verify', async ({ request }) => {
    const gate = await scenarioGate(request)
    if (gate) return gate

    return new HttpResponse(null, { status: 204 })
  }),

  http.post('/api/v1/tenant_details/:tenantEid/verify_via_internal_user/:verdictAction', async ({ request }) => {
    const gate = await scenarioGate(request)
    if (gate) return gate

    return new HttpResponse(null, { status: 204 })
  }),

  http.patch('/api/v1/tenant_details/:tenantEid', async ({ request }) => {
    const gate = await scenarioGate(request)
    if (gate) return gate

    const body = await parseJson<TenantDetails>(request)
    Object.assign(tenant, body, { eid: tenant.eid })

    return HttpResponse.json(tenant)
  }),

  http.get('/api/v1/tenant_details/:tenantEid', async ({ request }) => {
    const gate = await scenarioGate(request)
    if (gate) return gate

    return HttpResponse.json(tenant)
  }),

  http.get('/api/v1/modules/', async ({ request }) => {
    const gate = await scenarioGate(request)
    if (gate) return gate

    return HttpResponse.json({ module_listing: modules })
  }),

  http.get('/api/v1/branches/', async ({ request }) => {
    const gate = await scenarioGate(request)
    if (gate) return gate

    return HttpResponse.json(paginate(branches, request))
  }),

  http.post('/api/v1/branches/', async ({ request }) => {
    const gate = await scenarioGate(request)
    if (gate) return gate

    const body = await parseJson<Branch>(request)
    const branch = { ...body, id: nextNumericId(branches), is_active: body.is_active ?? true } as Branch
    branches.unshift(branch)

    return HttpResponse.json(branch, { status: 201 })
  }),

  http.get('/api/v1/branches/:branchId', async ({ request, params }) => {
    const gate = await scenarioGate(request)
    if (gate) return gate

    const branch = branches.find((item) => item.id === idParam(params.branchId))
    return branch ? HttpResponse.json(branch) : notFound('Branch not found')
  }),

  http.patch('/api/v1/branches/:branchId', async ({ request, params }) => {
    const gate = await scenarioGate(request)
    if (gate) return gate

    const branch = branches.find((item) => item.id === idParam(params.branchId))
    if (!branch) return notFound('Branch not found')

    Object.assign(branch, await parseJson<Branch>(request))
    return HttpResponse.json(branch)
  }),

  http.delete('/api/v1/branches/:branchId', async ({ request, params }) => {
    const gate = await scenarioGate(request)
    if (gate) return gate

    const index = branches.findIndex((item) => item.id === idParam(params.branchId))
    if (index === -1) return notFound('Branch not found')

    branches.splice(index, 1)
    return new HttpResponse(null, { status: 204 })
  }),

  http.get('/api/v1/employee_designations/', async ({ request }) => {
    const gate = await scenarioGate(request)
    if (gate) return gate

    return HttpResponse.json(paginate(designations, request))
  }),

  http.post('/api/v1/employee_designations/', async ({ request }) => {
    const gate = await scenarioGate(request)
    if (gate) return gate

    const body = await parseJson<EmployeeDesignation>(request)
    const designation = { id: nextNumericId(designations), name: body.name ?? 'New Designation' }
    designations.unshift(designation)

    return HttpResponse.json(designation, { status: 201 })
  }),

  http.get('/api/v1/employee_designations/:designationId', async ({ request, params }) => {
    const gate = await scenarioGate(request)
    if (gate) return gate

    const designation = designations.find((item) => item.id === idParam(params.designationId))
    return designation ? HttpResponse.json(designation) : notFound('Employee designation not found')
  }),

  http.patch('/api/v1/employee_designations/:designationId', async ({ request, params }) => {
    const gate = await scenarioGate(request)
    if (gate) return gate

    const designation = designations.find((item) => item.id === idParam(params.designationId))
    if (!designation) return notFound('Employee designation not found')

    Object.assign(designation, await parseJson<EmployeeDesignation>(request))
    return HttpResponse.json(designation)
  }),

  http.delete('/api/v1/employee_designations/:designationId', async ({ request, params }) => {
    const gate = await scenarioGate(request)
    if (gate) return gate

    const index = designations.findIndex((item) => item.id === idParam(params.designationId))
    if (index === -1) return notFound('Employee designation not found')

    designations.splice(index, 1)
    return new HttpResponse(null, { status: 204 })
  }),

  http.get('/api/v1/employees/', async ({ request }) => {
    const gate = await scenarioGate(request)
    if (gate) return gate

    return HttpResponse.json(paginate(employees, request))
  }),

  http.post('/api/v1/employees/', async ({ request }) => {
    const gate = await scenarioGate(request)
    if (gate) return gate

    const body = await parseJson<Employee>(request)
    const employeeNumber = employees.length + 1
    const employee = {
      ...body,
      eid: `emp-${String(employeeNumber + 100).padStart(3, '0')}`,
      tenant_user_eid: `tu-${String(employeeNumber + 100).padStart(3, '0')}`,
      tenant_eid: tenant.eid,
      is_active: true,
      supervisor_eid: null,
    } as Employee
    employees.unshift(employee)

    return HttpResponse.json(employee, { status: 201 })
  }),

  http.get('/api/v1/employees/:employeeEid', async ({ request, params }) => {
    const gate = await scenarioGate(request)
    if (gate) return gate

    const employee = employees.find((item) => item.eid === stringParam(params.employeeEid))
    return employee ? HttpResponse.json(employee) : notFound('Employee not found')
  }),

  http.patch('/api/v1/employees/:employeeEid', async ({ request, params }) => {
    const gate = await scenarioGate(request)
    if (gate) return gate

    const employee = employees.find((item) => item.eid === stringParam(params.employeeEid))
    if (!employee) return notFound('Employee not found')

    Object.assign(employee, await parseJson<Employee>(request))
    return HttpResponse.json(employee)
  }),

  http.post('/api/v1/employees/:employeeEid/manage_supervisor', async ({ request, params }) => {
    const gate = await scenarioGate(request)
    if (gate) return gate

    const employee = employees.find((item) => item.eid === stringParam(params.employeeEid))
    if (!employee) return notFound('Employee not found')

    const body = await parseJson<{ eid: string | null }>(request)
    employee.supervisor_eid = body.eid ?? null

    return HttpResponse.json(employee)
  }),

  http.patch('/api/v1/employees/:employeeEid/update_status', async ({ request, params }) => {
    const gate = await scenarioGate(request)
    if (gate) return gate

    const employee = employees.find((item) => item.eid === stringParam(params.employeeEid))
    if (!employee) return notFound('Employee not found')

    const body = await parseJson<{ is_active: boolean }>(request)
    employee.is_active = Boolean(body.is_active)

    return HttpResponse.json(employee)
  }),

  http.get('/api/v1/profiles/', async ({ request }) => {
    const gate = await scenarioGate(request)
    if (gate) return gate

    return HttpResponse.json(paginate(profiles, request))
  }),

  http.post('/api/v1/profiles/', async ({ request }) => {
    const gate = await scenarioGate(request)
    if (gate) return gate

    const body = await parseJson<Profile>(request)
    const profile = {
      id: nextNumericId(profiles),
      is_internal: body.is_internal ?? true,
      name: body.name ?? 'New Profile',
      modules: [],
    }
    profiles.unshift(profile)

    return HttpResponse.json(profile, { status: 201 })
  }),

  http.get('/api/v1/profiles/:profileId/modules', async ({ request, params }) => {
    const gate = await scenarioGate(request)
    if (gate) return gate

    const profile = profiles.find((item) => item.id === idParam(params.profileId))
    return profile ? HttpResponse.json(profile) : notFound('Profile not found')
  }),

  http.post('/api/v1/profiles/:profileId/create_module_mappings', async ({ request, params }) => {
    const gate = await scenarioGate(request)
    if (gate) return gate

    const profile = profiles.find((item) => item.id === idParam(params.profileId))
    if (!profile) return notFound('Profile not found')

    const body = await parseJson<{ modules: { id: number }[] }>(request)
    const selectedIds = new Set((body.modules ?? []).map((module) => module.id))
    profile.modules = modules.filter((module) => selectedIds.has(module.id))

    return new HttpResponse(null, { status: 204 })
  }),

  http.get('/api/v1/profiles/:profileId', async ({ request, params }) => {
    const gate = await scenarioGate(request)
    if (gate) return gate

    const profile = profiles.find((item) => item.id === idParam(params.profileId))
    return profile ? HttpResponse.json(profile) : notFound('Profile not found')
  }),

  http.patch('/api/v1/profiles/:profileId', async ({ request, params }) => {
    const gate = await scenarioGate(request)
    if (gate) return gate

    const profile = profiles.find((item) => item.id === idParam(params.profileId))
    if (!profile) return notFound('Profile not found')

    Object.assign(profile, await parseJson<Profile>(request))
    return HttpResponse.json(profile)
  }),

  http.delete('/api/v1/profiles/:profileId', async ({ request, params }) => {
    const gate = await scenarioGate(request)
    if (gate) return gate

    const index = profiles.findIndex((item) => item.id === idParam(params.profileId))
    if (index === -1) return notFound('Profile not found')

    profiles.splice(index, 1)
    return new HttpResponse(null, { status: 204 })
  }),

  http.get('/api/v1/permissions/', async ({ request }) => {
    const gate = await scenarioGate(request)
    if (gate) return gate

    return HttpResponse.json({ data: permissions })
  }),

  http.get('/api/v1/permissions/user_permissions', async ({ request }) => {
    const gate = await scenarioGate(request)
    if (gate) return gate

    return HttpResponse.json({ data: permissions })
  }),

  http.post('/api/v1/permissions/user_permissions', async ({ request }) => {
    const gate = await scenarioGate(request)
    if (gate) return gate

    return HttpResponse.json({ message: 'Permissions assigned.' }, { status: 201 })
  }),

  http.get('/api/v1/customers/', async ({ request }) => {
    const gate = await scenarioGate(request)
    if (gate) return gate

    return HttpResponse.json(paginate(customers, request))
  }),

  http.post('/api/v1/customers/', async ({ request }) => {
    const gate = await scenarioGate(request)
    if (gate) return gate

    const body = await parseJson<Customer>(request)
    const customer = {
      ...body,
      eid: `cust-${String(customers.length + 101).padStart(3, '0')}`,
      tenant_user_eid: `ctu-${String(customers.length + 101).padStart(3, '0')}`,
      tenant_eid: tenant.eid,
      is_active: true,
      verified_phone_number_timestamp: null,
      verified_email_timestamp: null,
      secondary_phone: body.secondary_phone ?? null,
    } as Customer
    customers.unshift(customer)

    return HttpResponse.json(customer, { status: 201 })
  }),

  http.get('/api/v1/customers/:customerEid', async ({ request, params }) => {
    const gate = await scenarioGate(request)
    if (gate) return gate

    const customer = customers.find((item) => item.eid === stringParam(params.customerEid))
    return customer ? HttpResponse.json(customer) : notFound('Customer not found')
  }),

  http.patch('/api/v1/customers/:customerEid', async ({ request, params }) => {
    const gate = await scenarioGate(request)
    if (gate) return gate

    const customer = customers.find((item) => item.eid === stringParam(params.customerEid))
    if (!customer) return notFound('Customer not found')

    Object.assign(customer, await parseJson<Customer>(request))
    return HttpResponse.json(customer)
  }),

  http.delete('/api/v1/customers/:customerEid', async ({ request, params }) => {
    const gate = await scenarioGate(request)
    if (gate) return gate

    const customerEid = stringParam(params.customerEid)
    const index = customers.findIndex((item) => item.eid === customerEid)
    if (index === -1) return notFound('Customer not found')

    customers.splice(index, 1)
    for (let i = customerDocuments.length - 1; i >= 0; i -= 1) {
      if (customerDocuments[i].customer_eid === customerEid) {
        customerDocuments.splice(i, 1)
      }
    }

    return new HttpResponse(null, { status: 204 })
  }),

  http.post('/api/v1/customers/:customerEid/send_otps_for_verification', async ({ request }) => {
    const gate = await scenarioGate(request)
    if (gate) return gate

    return new HttpResponse(null, { status: 204 })
  }),

  http.post('/api/v1/customers/:customerEid/verify_linked_phone', async ({ request, params }) => {
    const gate = await scenarioGate(request)
    if (gate) return gate

    const customer = customers.find((item) => item.eid === stringParam(params.customerEid))
    if (!customer) return notFound('Customer not found')

    customer.verified_phone_number_timestamp = nowIso()
    return new HttpResponse(null, { status: 204 })
  }),

  http.post('/api/v1/customers/:customerEid/verify_email', async ({ request, params }) => {
    const gate = await scenarioGate(request)
    if (gate) return gate

    const customer = customers.find((item) => item.eid === stringParam(params.customerEid))
    if (!customer) return notFound('Customer not found')

    customer.verified_email_timestamp = nowIso()
    return new HttpResponse(null, { status: 204 })
  }),

  http.post('/api/v1/customers/:customerEid/public_verify_linked_phone', async ({ request, params }) => {
    const gate = await scenarioGate(request)
    if (gate) return gate

    const customer = customers.find((item) => item.eid === stringParam(params.customerEid))
    if (!customer) return notFound('Customer not found')

    customer.verified_phone_number_timestamp = nowIso()
    return new HttpResponse(null, { status: 204 })
  }),

  http.post('/api/v1/customers/:customerEid/public_verify_email', async ({ request, params }) => {
    const gate = await scenarioGate(request)
    if (gate) return gate

    const customer = customers.find((item) => item.eid === stringParam(params.customerEid))
    if (!customer) return notFound('Customer not found')

    customer.verified_email_timestamp = nowIso()
    return new HttpResponse(null, { status: 204 })
  }),

  http.get('/api/v1/government_documents/', async ({ request }) => {
    const gate = await scenarioGate(request)
    if (gate) return gate

    return HttpResponse.json({ data: governmentDocuments })
  }),

  http.get('/api/v1/customer_documents/:customerEid', async ({ request, params }) => {
    const gate = await scenarioGate(request)
    if (gate) return gate

    return HttpResponse.json(customerDocumentList(stringParam(params.customerEid), request))
  }),

  http.post('/api/v1/customer_documents/:customerEid/upload', async ({ request, params }) => {
    const gate = await scenarioGate(request)
    if (gate) return gate

    const formData = await request.formData()
    const documentId = Number(formData.get('government_document_id') ?? formData.get('document_id'))
    const file = formData.get('file_obj') ?? formData.get('file')
    const governmentDocument = governmentDocuments.find((doc) => doc.id === documentId)
    const fileName = file instanceof File ? file.name : 'uploaded-document.pdf'
    const document: MockCustomerDocument = {
      customer_eid: stringParam(params.customerEid),
      id: nextNumericId(customerDocuments),
      user_government_document_value_mapping_id: nextMappingId(),
      document_name: governmentDocument?.name ?? 'Uploaded Document',
      document_id: documentId,
      file_url: `/mock-files/${encodeURIComponent(fileName)}`,
      user_input_value: undefined,
      is_verified: false,
      verification_note: null,
      extraction_status: 'pending',
    }
    customerDocuments.unshift(document)

    return HttpResponse.json(publicDocument(document), { status: 201 })
  }),

  http.post('/api/v1/customer_documents/:customerEid/:mappingId/replace_file', async ({ request, params }) => {
    const gate = await scenarioGate(request)
    if (gate) return gate

    const document = customerDocuments.find(
      (doc) =>
        doc.customer_eid === stringParam(params.customerEid) &&
        doc.user_government_document_value_mapping_id === idParam(params.mappingId),
    )
    if (!document) return notFound('Customer document not found')

    const formData = await request.formData()
    const file = formData.get('file_obj') ?? formData.get('file')
    const fileName = file instanceof File ? file.name : 'replacement-document.pdf'
    document.file_url = `/mock-files/${encodeURIComponent(fileName)}`
    document.extraction_status = 'pending'
    document.is_verified = false

    return HttpResponse.json(publicDocument(document))
  }),

  http.patch('/api/v1/customer_documents/:customerEid/:mappingId/manual_value_add', async ({ request, params }) => {
    const gate = await scenarioGate(request)
    if (gate) return gate

    const document = customerDocuments.find(
      (doc) =>
        doc.customer_eid === stringParam(params.customerEid) &&
        doc.user_government_document_value_mapping_id === idParam(params.mappingId),
    )
    if (!document) return notFound('Customer document not found')

    const body = await parseJson<{ user_input_value: string }>(request)
    document.user_input_value = body.user_input_value ?? ''

    return new HttpResponse(null, { status: 204 })
  }),

  http.patch('/api/v1/customer_documents/:customerEid/:mappingId/manual_verify', async ({ request, params }) => {
    const gate = await scenarioGate(request)
    if (gate) return gate

    const document = customerDocuments.find(
      (doc) =>
        doc.customer_eid === stringParam(params.customerEid) &&
        doc.user_government_document_value_mapping_id === idParam(params.mappingId),
    )
    if (!document) return notFound('Customer document not found')

    const body = await parseJson<{ note: string | null }>(request)
    document.is_verified = true
    document.verification_note = body.note ?? 'Verified manually.'
    document.extraction_status = 'completed'

    return HttpResponse.json(publicDocument(document))
  }),

  http.delete('/api/v1/customer_documents/:customerEid/:mappingId', async ({ request, params }) => {
    const gate = await scenarioGate(request)
    if (gate) return gate

    const index = customerDocuments.findIndex(
      (doc) =>
        doc.customer_eid === stringParam(params.customerEid) &&
        doc.user_government_document_value_mapping_id === idParam(params.mappingId),
    )
    if (index === -1) return notFound('Customer document not found')

    customerDocuments.splice(index, 1)
    return new HttpResponse(null, { status: 204 })
  }),

  http.post(
    '/api/v1/customer_automated_verifications/extraction/:customerEid/:mappingId/start',
    async ({ request, params }) => {
      const gate = await scenarioGate(request)
      if (gate) return gate

      const document = customerDocuments.find(
        (doc) =>
          doc.customer_eid === stringParam(params.customerEid) &&
          doc.user_government_document_value_mapping_id === idParam(params.mappingId),
      )
      if (!document) return notFound('Customer document not found')

      document.extraction_status = 'in_progress'
      return HttpResponse.json({ status: 'in_progress' })
    },
  ),

  http.get(
    '/api/v1/customer_automated_verifications/extraction/:customerEid/:mappingId/check',
    async ({ request, params }) => {
      const gate = await scenarioGate(request)
      if (gate) return gate

      const document = customerDocuments.find(
        (doc) =>
          doc.customer_eid === stringParam(params.customerEid) &&
          doc.user_government_document_value_mapping_id === idParam(params.mappingId),
      )
      if (!document) return notFound('Customer document not found')

      if (document.extraction_status === 'in_progress') {
        document.extraction_status = 'completed'
        document.user_input_value = document.user_input_value ?? 'MOCK-EXTRACTED-VALUE'
      }

      return HttpResponse.json({ extraction_status: document.extraction_status ?? 'pending' })
    },
  ),

  http.get('/api/v1/loan_settings/', async ({ request }) => {
    const gate = await scenarioGate(request)
    if (gate) return gate

    return HttpResponse.json({ page: 1, per_page: 10, total_records: 0, data: [] })
  }),

  http.get('/', async ({ request }) => {
    const gate = await scenarioGate(request)
    if (gate) return gate

    return HttpResponse.json({ message: 'Mock LMS API root' })
  }),

  http.get('/health', async ({ request }) => {
    const gate = await scenarioGate(request)
    if (gate) return gate

    return HttpResponse.json({ status: 'ok' })
  }),
]
