/**
 * Canonical calendar values. Labels live in the locale dictionaries.
 * Keys are month numbers from 0-12 as strings (0 = today).
 */
export const CALENDAR_MONTH_VALUES = {
  '0': 0,
  '1': 1,
  '2': 2,
  '3': 3,
  '4': 4,
  '5': 5,
  '6': 6,
  '7': 7,
  '8': 8,
  '9': 9,
  '10': 10,
  '11': 11,
  '12': 12,
} as const;

export type CalendarMonthKey = keyof typeof CALENDAR_MONTH_VALUES;

export function isCalendarMonthKey(value: string): value is CalendarMonthKey {
  return Object.prototype.hasOwnProperty.call(CALENDAR_MONTH_VALUES, value);
}
