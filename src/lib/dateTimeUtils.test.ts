import {
  parseDateTime,
  formatDateTime,
  parseDateStringToDate,
  formatDateToString,
} from './dateTimeUtils';

describe('dateTimeUtils', () => {
  describe('parseDateTime', () => {
    it('parses valid datetime string into date and time parts', () => {
      const result = parseDateTime('2026-01-28T14:30');
      expect(result).toEqual({ date: '2026-01-28', time: '14:30' });
    });

    it('returns empty date and default time for empty value', () => {
      const result = parseDateTime('');
      expect(result).toEqual({ date: '', time: '00:00' });
    });

    it('returns date with default time when value has only date portion', () => {
      const result = parseDateTime('2026-01-28');
      expect(result).toEqual({ date: '2026-01-28', time: '00:00' });
    });

    it('defaults time to 00:00 when time portion is missing after T', () => {
      const result = parseDateTime('2026-01-28T');
      expect(result).toEqual({ date: '2026-01-28', time: '00:00' });
    });
  });

  describe('formatDateTime', () => {
    it('combines date and time into datetime string', () => {
      const result = formatDateTime('2026-01-28', '14:30');
      expect(result).toBe('2026-01-28T14:30');
    });

    it('returns empty string when date is empty', () => {
      const result = formatDateTime('', '14:30');
      expect(result).toBe('');
    });

    it('defaults time to 00:00 when time is empty', () => {
      const result = formatDateTime('2026-01-28', '');
      expect(result).toBe('2026-01-28T00:00');
    });

    it('combines correctly with midnight time', () => {
      const result = formatDateTime('2026-01-28', '00:00');
      expect(result).toBe('2026-01-28T00:00');
    });
  });

  describe('parseDateStringToDate', () => {
    it('converts valid date string to Date object', () => {
      const result = parseDateStringToDate('2026-01-28');
      expect(result).toBeInstanceOf(Date);
      expect(result?.getFullYear()).toBe(2026);
      expect(result?.getMonth()).toBe(0); // January is 0-indexed
      expect(result?.getDate()).toBe(28);
    });

    it('returns undefined for empty string', () => {
      const result = parseDateStringToDate('');
      expect(result).toBeUndefined();
    });

    it('returns undefined for invalid format', () => {
      const result = parseDateStringToDate('invalid-date');
      expect(result).toBeUndefined();
    });

    it('returns undefined for partial date string', () => {
      const result = parseDateStringToDate('2026-01');
      expect(result).toBeUndefined();
    });

    it('handles single digit month and day correctly', () => {
      const result = parseDateStringToDate('2026-01-05');
      expect(result).toBeInstanceOf(Date);
      expect(result?.getMonth()).toBe(0);
      expect(result?.getDate()).toBe(5);
    });
  });

  describe('formatDateToString', () => {
    it('formats Date object to YYYY-MM-DD string', () => {
      const date = new Date(2026, 0, 28); // January 28, 2026
      const result = formatDateToString(date);
      expect(result).toBe('2026-01-28');
    });

    it('returns empty string for null', () => {
      const result = formatDateToString(null);
      expect(result).toBe('');
    });

    it('returns empty string for undefined', () => {
      const result = formatDateToString(undefined);
      expect(result).toBe('');
    });

    it('zero-pads single digit month', () => {
      const date = new Date(2026, 0, 15); // January 15, 2026
      const result = formatDateToString(date);
      expect(result).toBe('2026-01-15');
    });

    it('zero-pads single digit day', () => {
      const date = new Date(2026, 11, 5); // December 5, 2026
      const result = formatDateToString(date);
      expect(result).toBe('2026-12-05');
    });

    it('zero-pads both single digit month and day', () => {
      const date = new Date(2026, 0, 5); // January 5, 2026
      const result = formatDateToString(date);
      expect(result).toBe('2026-01-05');
    });
  });
});
