/**
 * Commission calculation utility.
 *
 * Pure function — no I/O, no side-effects.
 * All money values are in KES (Kenyan Shillings).
 *
 * Rules:
 *  - PERCENTAGE: commission = round(amount × (value / 100), 2)
 *  - FIXED:      commission = min(value, amount)  — never exceeds the payment
 *
 * Both results are rounded to 2 decimal places.
 */

export type CommissionType = "PERCENTAGE" | "FIXED";

/**
 * Calculate the platform commission for a single payment.
 *
 * @param amount  - The payment amount in KES (e.g. 5000)
 * @param type    - "PERCENTAGE" or "FIXED"
 * @param value   - Percentage (e.g. 10 for 10%) or fixed KES amount (e.g. 200)
 * @returns       - Commission amount in KES, rounded to 2 d.p.
 */
export function calculateCommission(
  amount: number,
  type: CommissionType,
  value: number
): number {
  if (amount <= 0) return 0;
  if (type === "PERCENTAGE") {
    return Math.round(amount * (value / 100) * 100) / 100;
  }
  // FIXED — commission can never exceed the payment itself
  return Math.min(value, amount);
}

/**
 * Calculate the partner's payout share after commission deduction.
 *
 * @param amount     - Payment amount
 * @param commission - Commission amount (from calculateCommission)
 * @returns          - Partner's net payout amount
 */
export function partnerShare(amount: number, commission: number): number {
  return Math.max(0, Math.round((amount - commission) * 100) / 100);
}
