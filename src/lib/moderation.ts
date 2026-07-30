/**
 * Content moderation utilities — zero-cost, zero-dependency phone number detection.
 * Covers Kenyan number formats: 07xx, +254, 254, spaced, hyphenated, dotted variants.
 */

// Matches: 0712345678 | +254712345678 | 254712345678 | 0712 345 678 | 07-12-345-678
const PHONE_REGEX = /(\+?254|0)[17]\d[\s\-.]?\d{2}[\s\-.]?\d{3}[\s\-.]?\d{3}/g;

/**
 * Returns true if the text contains a phone number pattern.
 */
export function containsPhone(text: string): boolean {
  PHONE_REGEX.lastIndex = 0; // reset stateful global regex
  return PHONE_REGEX.test(text);
}

/**
 * Replaces all detected phone numbers with a placeholder.
 * Useful for admin display to highlight violations.
 */
export function redactPhones(text: string): string {
  PHONE_REGEX.lastIndex = 0;
  return text.replace(PHONE_REGEX, "[contact hidden]");
}
