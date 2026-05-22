// Canonical Brand Host rates from Spec Section 7.2.
// All amounts in pence. Used by shift auto-creation and pay calculation.

export const BH_RATES = {
  weekdayHourlyPence: 1700,
  weekendHourlyPence: 2000,
  convertedViewingHourlyPence: 3500,
  travelAllowancePerShiftPence: 1050,
  escalationMultiplier: 2,
  referralBonusPence: 2000,
  referralBonusAfterShifts: 5
} as const;

export type BhRates = typeof BH_RATES;

export function isWeekend(date: Date): boolean {
  const day = date.getUTCDay();
  return day === 0 || day === 6;
}

export function baseShiftHourlyPence(date: Date): number {
  return isWeekend(date) ? BH_RATES.weekendHourlyPence : BH_RATES.weekdayHourlyPence;
}
