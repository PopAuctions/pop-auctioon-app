import { getCalendarMonths, getMonthName } from '@/utils/calendar';

describe('Calendar Utils', () => {
  it('should return calendar months map', () => {
    const months = getCalendarMonths();

    expect(months).toBeInstanceOf(Map);
    expect(months.size).toBeGreaterThan(0);
  });

  it('should get month names correctly', () => {
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
});
