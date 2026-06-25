import { ApiError } from '../utils/apiClient'
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

type MockRequestOptions = {
  method?: string
  body?: BodyInit | null
  params?: Record<string, string | number | boolean | undefined>
}

type Scenario = 'normal' | 'empty' | 'unauthorized' | 'server-error' | 'slow' | 'validation-error'

const readScenario = (): Scenario => {
  const scenario = window.localStorage.getItem('mock:scenario') as Scenario | null
  return scenario ?? 'normal'
}

const wait = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms))

const scenarioGate = async (method: string) => {
  const scenario = readScenario()
  await wait(scenario === 'slow' ? 900 : 150)

  if (scenario === 'unauthorized') {
    throw new ApiError('Mock unauthorized response', 401)
  }

  if (scenario === 'server-error') {
    throw new ApiError('Mock server error response', 500)
  }

  if (scenario === 'validation-error' && method !== 'GET') {
    throw new ApiError('Mock validation error', 422, { errors: { name: ['This field is required.'] } })
  }
}

const jsonBody = <T>(body: BodyInit | null | undefined): Partial<T> => {
  if (typeof body !== 'string') return {}

  try {
    return JSON.parse(body) as Partial<T>
  } catch {
    return {}
  }
}

const normalizeEndpoint = (endpoint: string, params?: MockRequestOptions['params']) => {
  const url = new URL(endpoint, window.location.origin)

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, String(value))
      }
    })
  }

  return {
    path: url.pathname.replace(/\/+$/, '') || '/',
    searchParams: url.searchParams,
  }
}

const paginate = <T>(items: T[], searchParams: URLSearchParams): PaginatedResponse<T> => {
  const page = Math.max(1, Number(searchParams.get('page') ?? 1))
  const perPage = Math.max(1, Number(searchParams.get('per_page') ?? 10))
  const sourceItems = readScenario() === 'empty' ? [] : items
  const start = (page - 1) * perPage

  return {
    page,
    per_page: perPage,
    total_records: sourceItems.length,
    data: sourceItems.slice(start, start + perPage),
  }
}

const nextNumericId = <T extends { id: number }>(items: T[]) =>
  Math.max(0, ...items.map((item) => item.id)) + 1

const nextMappingId = () =>
  Math.max(500, ...customerDocuments.map((doc) => doc.user_government_document_value_mapping_id)) + 1

const publicDocument = (doc: MockCustomerDocument): CustomerDocument => {
  const { customer_eid: customerEid, ...rest } = doc
  void customerEid
  return rest
}

const notFound = (message: string): never => {
  throw new ApiError(message, 404, { message })
}

const createdCustomer = (body: Partial<Customer>): Customer => ({
  ...(body as Customer),
  eid: `cust-${String(customers.length + 101).padStart(3, '0')}`,
  tenant_user_eid: `ctu-${String(customers.length + 101).padStart(3, '0')}`,
  tenant_eid: tenant.eid,
  is_active: true,
  verified_phone_number_timestamp: null,
  verified_email_timestamp: null,
  secondary_phone: body.secondary_phone ?? null,
})

export const handleMockApiRequest = async <T>(
  endpoint: string,
  options: MockRequestOptions = {},
): Promise<T> => {
  const method = (options.method ?? 'GET').toUpperCase()
  const { path, searchParams } = normalizeEndpoint(endpoint, options.params)

  await scenarioGate(method)

  if (method === 'POST' && path === '/auth/login') return { access_token: 'mock-access-token', refresh_token: 'mock-refresh-token' } as T
  if (method === 'POST' && path === '/auth/refresh_token') return { access_token: 'mock-access-token', refresh_token: 'mock-refresh-token' } as T
  if (method === 'POST' && path === '/auth/reset_password') return {} as T
  if (method === 'POST' && path === '/auth/customer_login') return { message: 'If the number is registered, an OTP has been sent.' } as T
  if (method === 'POST' && path === '/auth/authenticate_customer_otp') return { access_token: 'mock-access-token', refresh_token: 'mock-refresh-token' } as T
  if (method === 'GET' && path === '/auth/menu_items') return { data: menuItems } as T

  if (method === 'POST' && path === '/tenant_details/register') {
    Object.assign(tenant, jsonBody<TenantDetails>(options.body), { eid: tenant.eid })
    return tenant as T
  }

  if (method === 'GET' && path.startsWith('/tenant_details/')) return tenant as T
  if ((method === 'POST' || method === 'PATCH') && path.startsWith('/tenant_details/')) return {} as T

  if (method === 'GET' && path === '/modules') return { module_listing: modules } as T

  if (path === '/branches' && method === 'GET') return paginate(branches, searchParams) as T
  if (path === '/branches' && method === 'POST') {
    const body = jsonBody<Branch>(options.body)
    const branch = { ...body, id: nextNumericId(branches), is_active: body.is_active ?? true } as Branch
    branches.unshift(branch)
    return branch as T
  }

  const branchMatch = path.match(/^\/branches\/(\d+)$/)
  if (branchMatch) {
    const branchId = Number(branchMatch[1])
    const branch = branches.find((item) => item.id === branchId)
    if (!branch) {
      return notFound('Branch not found')
    }
    if (method === 'GET') return branch as T
    if (method === 'PATCH') {
      Object.assign(branch, jsonBody<Branch>(options.body))
      return branch as T
    }
    if (method === 'DELETE') {
      branches.splice(branches.indexOf(branch), 1)
      return {} as T
    }
  }

  if (path === '/employee_designations' && method === 'GET') return paginate(designations, searchParams) as T
  if (path === '/employee_designations' && method === 'POST') {
    const body = jsonBody<EmployeeDesignation>(options.body)
    const designation = { id: nextNumericId(designations), name: body.name ?? 'New Designation' }
    designations.unshift(designation)
    return designation as T
  }

  const designationMatch = path.match(/^\/employee_designations\/(\d+)$/)
  if (designationMatch) {
    const designation = designations.find((item) => item.id === Number(designationMatch[1]))
    if (!designation) {
      return notFound('Employee designation not found')
    }
    if (method === 'GET') return designation as T
    if (method === 'PATCH') {
      Object.assign(designation, jsonBody<EmployeeDesignation>(options.body))
      return designation as T
    }
    if (method === 'DELETE') {
      designations.splice(designations.indexOf(designation), 1)
      return {} as T
    }
  }

  if (path === '/employees' && method === 'GET') return paginate(employees, searchParams) as T
  if (path === '/employees' && method === 'POST') {
    const body = jsonBody<Employee>(options.body)
    const employeeNumber = employees.length + 101
    const employee = {
      ...body,
      eid: `emp-${String(employeeNumber).padStart(3, '0')}`,
      tenant_user_eid: `tu-${String(employeeNumber).padStart(3, '0')}`,
      tenant_eid: tenant.eid,
      is_active: true,
      supervisor_eid: null,
    } as Employee
    employees.unshift(employee)
    return employee as T
  }

  const employeeMatch = path.match(/^\/employees\/([^/]+)(?:\/(manage_supervisor|update_status))?$/)
  if (employeeMatch) {
    const employee = employees.find((item) => item.eid === employeeMatch[1])
    if (!employee) {
      return notFound('Employee not found')
    }
    if (method === 'GET') return employee as T
    if (method === 'PATCH' && employeeMatch[2] === 'update_status') {
      employee.is_active = Boolean(jsonBody<{ is_active: boolean }>(options.body).is_active)
      return employee as T
    }
    if (method === 'POST' && employeeMatch[2] === 'manage_supervisor') {
      employee.supervisor_eid = jsonBody<{ eid: string | null }>(options.body).eid ?? null
      return employee as T
    }
    if (method === 'PATCH') {
      Object.assign(employee, jsonBody<Employee>(options.body))
      return employee as T
    }
  }

  if (path === '/profiles' && method === 'GET') return paginate(profiles, searchParams) as T
  if (path === '/profiles' && method === 'POST') {
    const body = jsonBody<Profile>(options.body)
    const profile = { id: nextNumericId(profiles), is_internal: body.is_internal ?? true, name: body.name ?? 'New Profile', modules: [] }
    profiles.unshift(profile)
    return profile as T
  }

  const profileMatch = path.match(/^\/profiles\/(\d+)(?:\/(modules|create_module_mappings))?$/)
  if (profileMatch) {
    const profile = profiles.find((item) => item.id === Number(profileMatch[1]))
    if (!profile) {
      return notFound('Profile not found')
    }
    if (method === 'GET') return profile as T
    if (method === 'POST' && profileMatch[2] === 'create_module_mappings') {
      const selectedIds = new Set((jsonBody<{ modules: { id: number }[] }>(options.body).modules ?? []).map((module) => module.id))
      profile.modules = modules.filter((module) => selectedIds.has(module.id))
      return {} as T
    }
    if (method === 'PATCH') {
      Object.assign(profile, jsonBody<Profile>(options.body))
      return profile as T
    }
    if (method === 'DELETE') {
      profiles.splice(profiles.indexOf(profile), 1)
      return {} as T
    }
  }

  if (method === 'GET' && path === '/permissions') return { data: permissions } as T
  if (method === 'GET' && path === '/permissions/user_permissions') return { data: permissions } as T
  if (method === 'POST' && path === '/permissions/user_permissions') return { message: 'Permissions assigned.' } as T

  if (path === '/customers' && method === 'GET') return paginate(customers, searchParams) as T
  if (path === '/customers' && method === 'POST') {
    const customer = createdCustomer(jsonBody<Customer>(options.body))
    customers.unshift(customer)
    return customer as T
  }

  const customerMatch = path.match(/^\/customers\/([^/]+)(?:\/(send_otps_for_verification|verify_linked_phone|verify_email|public_verify_linked_phone|public_verify_email))?$/)
  if (customerMatch) {
    const customer = customers.find((item) => item.eid === customerMatch[1])
    if (!customer) {
      return notFound('Customer not found')
    }
    if (method === 'GET') return customer as T
    if (method === 'POST' && customerMatch[2] === 'send_otps_for_verification') return {} as T
    if (method === 'POST' && customerMatch[2] === 'verify_linked_phone') {
      customer.verified_phone_number_timestamp = new Date().toISOString()
      return {} as T
    }
    if (method === 'POST' && customerMatch[2] === 'verify_email') {
      customer.verified_email_timestamp = new Date().toISOString()
      return {} as T
    }
    if (method === 'POST' && customerMatch[2] === 'public_verify_linked_phone') {
      customer.verified_phone_number_timestamp = new Date().toISOString()
      return {} as T
    }
    if (method === 'POST' && customerMatch[2] === 'public_verify_email') {
      customer.verified_email_timestamp = new Date().toISOString()
      return {} as T
    }
    if (method === 'PATCH') {
      Object.assign(customer, jsonBody<Customer>(options.body))
      return customer as T
    }
    if (method === 'DELETE') {
      customers.splice(customers.indexOf(customer), 1)
      return {} as T
    }
  }

  if (method === 'GET' && path === '/government_documents') return { data: governmentDocuments } as T

  const documentListMatch = path.match(/^\/customer_documents\/([^/]+)$/)
  if (documentListMatch && method === 'GET') {
    const docs = customerDocuments
      .filter((doc) => doc.customer_eid === documentListMatch[1])
      .map(publicDocument)
    return paginate(docs, searchParams) as T
  }

  if (documentListMatch && method === 'POST') {
    const formData = options.body instanceof FormData ? options.body : new FormData()
    const documentId = Number(formData.get('government_document_id') ?? formData.get('document_id'))
    const file = formData.get('file_obj') ?? formData.get('file')
    const governmentDocument = governmentDocuments.find((doc) => doc.id === documentId)
    const fileName = file instanceof File ? file.name : 'uploaded-document.pdf'
    const document: MockCustomerDocument = {
      customer_eid: documentListMatch[1],
      id: nextNumericId(customerDocuments),
      user_government_document_value_mapping_id: nextMappingId(),
      document_name: governmentDocument?.name ?? 'Uploaded Document',
      document_id: documentId,
      file_url: `/mock-files/${encodeURIComponent(fileName)}`,
      is_verified: false,
      verification_note: null,
      extraction_status: 'pending',
    }
    customerDocuments.unshift(document)
    return publicDocument(document) as T
  }

  const documentActionMatch = path.match(/^\/customer_documents\/([^/]+)\/(\d+)(?:\/(replace_file|manual_value_add|manual_verify))?$/)
  if (documentActionMatch) {
    const document = customerDocuments.find(
      (doc) =>
        doc.customer_eid === documentActionMatch[1] &&
        doc.user_government_document_value_mapping_id === Number(documentActionMatch[2]),
    )
    if (!document) {
      return notFound('Customer document not found')
    }
    if (method === 'POST' && documentActionMatch[3] === 'replace_file') {
      const formData = options.body instanceof FormData ? options.body : new FormData()
      const file = formData.get('file_obj') ?? formData.get('file')
      document.file_url = `/mock-files/${encodeURIComponent(file instanceof File ? file.name : 'replacement-document.pdf')}`
      document.extraction_status = 'pending'
      document.is_verified = false
      return publicDocument(document) as T
    }
    if (method === 'PATCH' && documentActionMatch[3] === 'manual_value_add') {
      document.user_input_value = jsonBody<{ user_input_value: string }>(options.body).user_input_value ?? ''
      return {} as T
    }
    if (method === 'PATCH' && documentActionMatch[3] === 'manual_verify') {
      document.is_verified = true
      document.verification_note = jsonBody<{ note: string | null }>(options.body).note ?? 'Verified manually.'
      document.extraction_status = 'completed'
      return publicDocument(document) as T
    }
    if (method === 'DELETE') {
      customerDocuments.splice(customerDocuments.indexOf(document), 1)
      return {} as T
    }
  }

  const extractionMatch = path.match(/^\/customer_automated_verifications\/extraction\/([^/]+)\/(\d+)\/(start|check)$/)
  if (extractionMatch) {
    const document = customerDocuments.find(
      (doc) =>
        doc.customer_eid === extractionMatch[1] &&
        doc.user_government_document_value_mapping_id === Number(extractionMatch[2]),
    )
    if (!document) {
      return notFound('Customer document not found')
    }
    if (method === 'POST' && extractionMatch[3] === 'start') {
      document.extraction_status = 'in_progress'
      return { status: 'in_progress' } as T
    }
    if (method === 'GET' && extractionMatch[3] === 'check') {
      document.extraction_status = 'completed'
      document.user_input_value = document.user_input_value ?? 'MOCK-EXTRACTED-VALUE'
      return { extraction_status: document.extraction_status } as T
    }
  }

  throw new ApiError(`No mock handler for ${method} ${path}`, 404)
}
