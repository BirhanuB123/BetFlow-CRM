import {
  toEthiopianDate,
  toGregorianDate,
  formatDualDate,
  isEthiopianLeapYear,
  isGregorianLeapYear,
  getEthiopianDaysInMonth,
} from '@betflow/shared';

describe('Ethiopian Calendar & Dual-Calendar Conversion Utilities', () => {
  describe('toEthiopianDate()', () => {
    it('should correctly convert Ethiopian New Year (Enkutatash) 2017 EC', () => {
      const ec = toEthiopianDate(new Date('2024-09-11'));
      expect(ec).not.toBeNull();
      expect(ec?.ecYear).toBe(2017);
      expect(ec?.ecMonth).toBe(1);
      expect(ec?.ecDay).toBe(1);
      expect(ec?.ecMonthNameAmharic).toBe('መስከረም');
      expect(ec?.ecMonthName).toBe('Meskerem');
    });

    it('should correctly convert Ethiopian New Year 2019 EC (September 11, 2026)', () => {
      const ec = toEthiopianDate(new Date('2026-09-11'));
      expect(ec).not.toBeNull();
      expect(ec?.ecYear).toBe(2019);
      expect(ec?.ecMonth).toBe(1);
      expect(ec?.ecDay).toBe(1);
      expect(ec?.formattedAmharic).toBe('መስከረም 1, 2019 ዓ.ም');
    });

    it('should correctly convert Pagume (13th Month) dates', () => {
      const ec = toEthiopianDate(new Date('2026-09-08'));
      expect(ec).not.toBeNull();
      expect(ec?.ecYear).toBe(2018);
      expect(ec?.ecMonth).toBe(13);
      expect(ec?.ecDay).toBe(3);
      expect(ec?.ecMonthNameAmharic).toBe('ጳጉሜን');
    });

    it('should return null for null or invalid inputs', () => {
      expect(toEthiopianDate(null)).toBeNull();
      expect(toEthiopianDate(undefined)).toBeNull();
      expect(toEthiopianDate('invalid-date')).toBeNull();
    });
  });

  describe('toGregorianDate() & Bidirectional Consistency', () => {
    it('should roundtrip convert from EC back to GC accurately', () => {
      const gc = toGregorianDate(2019, 1, 1);
      expect(gc.getFullYear()).toBe(2026);
      expect(gc.getMonth() + 1).toBe(9);
      expect(gc.getDate()).toBe(11);
    });

    it('should maintain 100% roundtrip consistency across all 365 days of a year', () => {
      const startDate = new Date(2026, 0, 1);
      for (let i = 0; i < 365; i++) {
        const testDate = new Date(startDate);
        testDate.setDate(testDate.getDate() + i);

        const ec = toEthiopianDate(testDate);
        expect(ec).not.toBeNull();
        if (ec) {
          const roundtrip = toGregorianDate(ec.ecYear, ec.ecMonth, ec.ecDay);
          expect(roundtrip.getFullYear()).toBe(testDate.getFullYear());
          expect(roundtrip.getMonth()).toBe(testDate.getMonth());
          expect(roundtrip.getDate()).toBe(testDate.getDate());
        }
      }
    });
  });

  describe('formatDualDate()', () => {
    it('should format dual date in English mode (GC first, EC secondary)', () => {
      const formatted = formatDualDate('2026-09-18', 'en');
      expect(formatted).toContain('Sep 18, 2026');
      expect(formatted).toContain('መስከረም 8, 2019 ዓ.ም');
    });

    it('should format dual date in Amharic mode (EC first, GC secondary)', () => {
      const formatted = formatDualDate('2026-09-18', 'am');
      expect(formatted).toContain('መስከረም 8, 2019 ዓ.ም');
      expect(formatted).toContain('Sep 18, 2026');
    });

    it('should handle null / empty dates gracefully with em-dash', () => {
      expect(formatDualDate(null)).toBe('—');
      expect(formatDualDate(undefined)).toBe('—');
    });
  });

  describe('Leap Year and Month Day Rules', () => {
    it('should identify Ethiopian leap years (year % 4 === 3)', () => {
      expect(isEthiopianLeapYear(2015)).toBe(true);
      expect(isEthiopianLeapYear(2019)).toBe(true);
      expect(isEthiopianLeapYear(2018)).toBe(false);
    });

    it('should have 6 days in Pagume during leap year and 5 in common year', () => {
      expect(getEthiopianDaysInMonth(2015, 13)).toBe(6);
      expect(getEthiopianDaysInMonth(2018, 13)).toBe(5);
      expect(getEthiopianDaysInMonth(2018, 1)).toBe(30);
    });
  });
});
