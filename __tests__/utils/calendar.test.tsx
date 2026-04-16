import {
  getCalendarMonths,
  getMonthName,
  getCurrentMonthName,
  isCurrentMonth,
  formatCalendarDate,
} from '@/utils/calendar';

describe('Calendar Utils', () => {
  describe('getCalendarMonths', () => {
    it('should return calendar months map', () => {
      const months = getCalendarMonths();

      expect(months).toBeInstanceOf(Map);
      expect(months.size).toBeGreaterThan(0);
    });

    it('should include "Hoy/Today" as month 0', () => {
      const months = getCalendarMonths();
      expect(months.has('0')).toBe(true);
      expect(months.get('0')?.es).toBe('Hoy');
      expect(months.get('0')?.en).toBe('Today');
      expect(months.get('0')?.value).toBe(0);
    });

    it('should return next 2 months from current date', () => {
      const months = getCalendarMonths();
      // Should have "0" (Today) + 2 months
      expect(months.size).toBe(3);
    });

    it('should wrap months correctly at year end', () => {
      const months = getCalendarMonths();
      const monthKeys = Array.from(months.keys()).filter((k) => k !== '0');

      // All month keys should be valid month numbers (1-12)
      monthKeys.forEach((key) => {
        const monthNumber = parseInt(key);
        expect(monthNumber).toBeGreaterThanOrEqual(1);
        expect(monthNumber).toBeLessThanOrEqual(12);
      });
    });

    it('should preserve insertion order in Map', () => {
      const months = getCalendarMonths();
      const keys = Array.from(months.keys());

      // First key should always be '0' (Today)
      expect(keys[0]).toBe('0');
    });
  });

  describe('getMonthName', () => {
    it('should get month names correctly in English', () => {
      const januaryEn = getMonthName(1, 'en');
      const januaryEs = getMonthName(1, 'es');

      expect(typeof januaryEn).toBe('string');
      expect(typeof januaryEs).toBe('string');
      expect(januaryEn.length).toBeGreaterThan(0);
      expect(januaryEs.length).toBeGreaterThan(0);
    });

    it('should handle different months', () => {
      const december = getMonthName(12, 'en');
      const june = getMonthName(6, 'es');

      expect(typeof december).toBe('string');
      expect(typeof june).toBe('string');
    });

    it('should get month name by number string', () => {
      const january = getMonthName('1', 'es');
      expect(january).toBe('Enero');
    });

    it('should get month name by number', () => {
      const january = getMonthName(1, 'en');
      expect(january).toBe('January');
    });

    it('should handle all valid months (1-12)', () => {
      for (let i = 1; i <= 12; i++) {
        const spanishName = getMonthName(i, 'es');
        const englishName = getMonthName(i, 'en');

        expect(spanishName).toBeTruthy();
        expect(englishName).toBeTruthy();
      }
    });

    it('should return special value for month 0 (Today)', () => {
      // Month 0 represents "Hoy/Today" in the calendar system
      expect(getMonthName('0', 'es')).toBe('Hoy');
      expect(getMonthName('0', 'en')).toBe('Today');
    });

    it('should return empty string for invalid month numbers (> 12)', () => {
      // Month 13+ are invalid
      expect(getMonthName('13', 'es')).toBe('');
      expect(getMonthName('99', 'es')).toBe('');
    });

    it('should default to Spanish locale', () => {
      const defaultName = getMonthName('6');
      const spanishName = getMonthName('6', 'es');
      expect(defaultName).toBe(spanishName);
    });

    it('should handle both string and number input types', () => {
      const stringInput = getMonthName('3', 'es');
      const numberInput = getMonthName(3, 'es');
      expect(stringInput).toBe(numberInput);
    });
  });

  describe('getCurrentMonthName', () => {
    it('should get current month name in Spanish', () => {
      const spanishName = getCurrentMonthName('es');
      expect(spanishName).toBeTruthy();
      expect(typeof spanishName).toBe('string');
    });

    it('should get current month name in English', () => {
      const englishName = getCurrentMonthName('en');
      expect(englishName).toBeTruthy();
      expect(typeof englishName).toBe('string');
    });

    it('should default to Spanish when no locale is provided', () => {
      const defaultName = getCurrentMonthName();
      const spanishName = getCurrentMonthName('es');
      expect(defaultName).toBe(spanishName);
    });

    it('should return valid month name', () => {
      const monthName = getCurrentMonthName();
      expect(monthName.length).toBeGreaterThan(0);
    });
  });

  describe('isCurrentMonth', () => {
    it('should return true for current date', () => {
      const today = new Date();
      expect(isCurrentMonth(today)).toBe(true);
    });

    it('should return true for different day in current month', () => {
      const today = new Date();
      const firstDayOfMonth = new Date(
        today.getFullYear(),
        today.getMonth(),
        1
      );
      expect(isCurrentMonth(firstDayOfMonth)).toBe(true);
    });

    it('should return false for date in previous month', () => {
      const today = new Date();
      const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 15);
      expect(isCurrentMonth(lastMonth)).toBe(false);
    });

    it('should return false for date in next month', () => {
      const today = new Date();
      const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 15);
      expect(isCurrentMonth(nextMonth)).toBe(false);
    });

    it('should return false for same month in different year', () => {
      const today = new Date();
      const sameMonthLastYear = new Date(
        today.getFullYear() - 1,
        today.getMonth(),
        15
      );
      expect(isCurrentMonth(sameMonthLastYear)).toBe(false);
    });

    it('should handle last day of month', () => {
      const today = new Date();
      const lastDayOfMonth = new Date(
        today.getFullYear(),
        today.getMonth() + 1,
        0
      );
      expect(isCurrentMonth(lastDayOfMonth)).toBe(true);
    });
  });

  describe('formatCalendarDate', () => {
    it('should format date with default Spanish locale', () => {
      const date = new Date(2024, 0, 15); // January 15, 2024
      const formatted = formatCalendarDate(date);

      expect(formatted).toBeTruthy();
      expect(typeof formatted).toBe('string');
      expect(formatted.toLowerCase()).toContain('enero');
    });

    it('should format date with English locale', () => {
      const date = new Date(2024, 0, 15); // January 15, 2024
      const formatted = formatCalendarDate(date, 'en-US');

      expect(formatted).toBeTruthy();
      expect(typeof formatted).toBe('string');
      expect(formatted.toLowerCase()).toContain('january');
    });

    it('should include day, month, and year', () => {
      const date = new Date(2024, 5, 20); // June 20, 2024
      const formatted = formatCalendarDate(date, 'es-ES');

      expect(formatted).toContain('20');
      expect(formatted).toContain('2024');
    });

    it('should handle first day of month', () => {
      const date = new Date(2024, 11, 1); // December 1, 2024
      const formatted = formatCalendarDate(date);

      expect(formatted).toBeTruthy();
      expect(formatted).toContain('1');
    });

    it('should handle last day of month', () => {
      const date = new Date(2024, 0, 31); // January 31, 2024
      const formatted = formatCalendarDate(date);

      expect(formatted).toBeTruthy();
      expect(formatted).toContain('31');
    });

    it('should format leap year dates correctly', () => {
      const date = new Date(2024, 1, 29); // February 29, 2024 (leap year)
      const formatted = formatCalendarDate(date);

      expect(formatted).toBeTruthy();
      expect(formatted).toContain('29');
    });
  });
});
