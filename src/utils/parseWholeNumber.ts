/**
 * Parses a whole number typed into a form field, or returns null.
 * Blank, fractional, exponent and non-numeric input are rejected, so an empty
 * box is never read as 0 (which `Number("")` would do).
 */
export function parseWholeNumber(
  raw: string,
  { min, allowZero = true }: { min?: number; allowZero?: boolean } = {},
): number | null {
  const text = raw.trim();
  if (!/^[+-]?\d+$/.test(text)) return null;

  const n = Number(text) || 0; // `|| 0` turns "-0" into 0
  if (!Number.isSafeInteger(n)) return null;
  if (!allowZero && n === 0) return null;
  if (min !== undefined && n < min) return null;
  return n;
}
