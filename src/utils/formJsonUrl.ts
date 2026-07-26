import { EMPTY_FORMIO_SCHEMA } from '../apis/loanTypeForms';

export async function fetchFormJsonSchema(
  formJsonUrl: string | null | undefined,
  fallback: Record<string, unknown> = EMPTY_FORMIO_SCHEMA,
): Promise<Record<string, unknown>> {
  if (!formJsonUrl) {
    return fallback;
  }

  const response = await fetch(formJsonUrl);
  if (!response.ok) {
    throw new Error(`Failed to load form schema (${response.status})`);
  }

  const schema = (await response.json()) as unknown;
  if (!schema || typeof schema !== 'object' || Array.isArray(schema)) {
    throw new Error('Form schema must be a JSON object');
  }

  return schema as Record<string, unknown>;
}
