/**
 * Phone formatting utility for Dominican Republic (+1) numbers.
 * Formats as xxx-xxx-xxxx with optional +1 prefix.
 */

/** Format a raw phone string to xxx-xxx-xxxx. Strips non-digits, then inserts dashes. */
export function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
}

/** Format with +1 country code: +1 xxx-xxx-xxxx */
export function formatPhoneWithCode(value: string): string {
  const formatted = formatPhone(value);
  if (!formatted) return '';
  return `+1 ${formatted}`;
}

/** Handle phone input onChange: auto-insert dashes, only digits. Returns formatted value. */
export function handlePhoneInput(raw: string): string {
  return formatPhone(raw);
}
