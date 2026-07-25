/**
 * Display-only masking helpers for PII (phone, email).
 * Never mutate stored values — apply only when rendering in read contexts.
 */

/** Mask a phone number, revealing only the last 4 digits. e.g. "+919876543210" -> "•••••• 3210" */
export const maskPhone = (value?: string | null): string => {
  if (!value) return '—';
  const digits = value.replace(/[^0-9]/g, '');
  if (digits.length <= 4) return '••••';
  const last4 = digits.slice(-4);
  const hidden = '•'.repeat(Math.max(2, digits.length - 4));
  return `${hidden} ${last4}`;
};

/** Mask an email, revealing the first char of the local part and the TLD. e.g. "roshan@gmail.com" -> "r•••••@•••••.com" */
export const maskEmail = (value?: string | null): string => {
  if (!value) return '—';
  const at = value.indexOf('@');
  if (at <= 0) return '••••••';
  const local = value.slice(0, at);
  const domain = value.slice(at + 1);
  const dot = domain.lastIndexOf('.');
  const tld = dot >= 0 ? domain.slice(dot) : '';
  const localMasked = `${local[0]}${'•'.repeat(Math.max(3, local.length - 1))}`;
  return `${localMasked}@${'•'.repeat(3)}${tld}`;
};
