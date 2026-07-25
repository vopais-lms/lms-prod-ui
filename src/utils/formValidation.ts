/**
 * Shared input sanitizers and validators for form fields.
 * Sanitizers run on every keystroke (via FormInput `sanitize`) to "lock" input;
 * validators run at submit time to surface inline errors.
 */

/** Strip everything except digits. Use for pincode / numeric-only fields. */
export const digitsOnly = (value: string): string => value.replace(/[^0-9]/g, '');

/** Allow digits and a single leading `+` (phone numbers with country code). */
export const phoneChars = (value: string): string => {
  const cleaned = value.replace(/[^0-9+]/g, '');
  // keep a leading '+' only; drop any other '+'
  const hasLeadingPlus = cleaned.startsWith('+');
  const digits = cleaned.replace(/\+/g, '');
  return hasLeadingPlus ? `+${digits}` : digits;
};

/** Phone: optional leading '+', 7–15 digits. */
export const isValidPhone = (value: string): boolean =>
  /^\+?[0-9]{7,15}$/.test(value.trim());

/** Indian-style 6-digit pincode. */
export const isValidPincode = (value: string): boolean => /^[0-9]{6}$/.test(value.trim());

/** Email must contain a single `@` and a domain with a dot. */
export const isValidEmail = (value: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

/** Employee ID: alphanumeric "mix" — must contain at least one letter and one digit (hyphens allowed). e.g. EMP-001 */
export const isValidEmployeeId = (value: string): boolean => {
  const v = value.trim();
  return /^[A-Za-z0-9-]+$/.test(v) && /[A-Za-z]/.test(v) && /[0-9]/.test(v);
};
