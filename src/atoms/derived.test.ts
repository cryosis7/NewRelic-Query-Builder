import { createStore } from 'jotai';
import {
  timePeriodAtom,
  sinceDateAtom,
  sinceTimeAtom,
  untilDateAtom,
  untilTimeAtom,
  initializeTimePeriodAtom,
} from './index';

describe('Time Period Derived Atoms', () => {
  describe('sinceDateAtom', () => {
    it('returns undefined when since is undefined', () => {
      const store = createStore();
      store.set(timePeriodAtom, {
        mode: 'relative',
        since: undefined,
        until: undefined,
        relative: '3h ago',
      });

      expect(store.get(sinceDateAtom)).toBeUndefined();
    });

    it('parses since into a Date object', () => {
      const store = createStore();
      store.set(timePeriodAtom, {
        mode: 'absolute',
        since: '2026-01-28T14:30',
        until: '2026-01-28T15:30',
        relative: '3h ago',
      });

      const date = store.get(sinceDateAtom);
      expect(date).toBeInstanceOf(Date);
      expect(date?.getFullYear()).toBe(2026);
      expect(date?.getMonth()).toBe(0); // January
      expect(date?.getDate()).toBe(28);
    });

    it('updates timePeriodAtom when date is set', () => {
      const store = createStore();
      store.set(timePeriodAtom, {
        mode: 'absolute',
        since: '2026-01-28T14:30',
        until: '2026-01-28T15:30',
        relative: '3h ago',
      });

      store.set(sinceDateAtom, new Date(2026, 5, 15)); // June 15, 2026

      expect(store.get(timePeriodAtom).since).toBe('2026-06-15T14:30');
    });

    it('preserves time when date is updated', () => {
      const store = createStore();
      store.set(timePeriodAtom, {
        mode: 'absolute',
        since: '2026-01-28T09:45',
        until: '2026-01-28T15:30',
        relative: '3h ago',
      });

      store.set(sinceDateAtom, new Date(2026, 2, 10)); // March 10, 2026

      expect(store.get(timePeriodAtom).since).toBe('2026-03-10T09:45');
    });

    it('handles null date by setting empty since', () => {
      const store = createStore();
      store.set(timePeriodAtom, {
        mode: 'absolute',
        since: '2026-01-28T14:30',
        until: '2026-01-28T15:30',
        relative: '3h ago',
      });

      store.set(sinceDateAtom, null);

      expect(store.get(timePeriodAtom).since).toBe('');
    });

    it('defaults time to 00:00 when since is undefined in setter', () => {
      const store = createStore();
      store.set(timePeriodAtom, {
        mode: 'absolute',
        since: undefined,
        until: '2026-01-28T15:30',
        relative: '3h ago',
      });

      store.set(sinceDateAtom, new Date(2026, 5, 15));

      expect(store.get(timePeriodAtom).since).toBe('2026-06-15T00:00');
    });

    it('defaults time to 00:00 when since has no time part', () => {
      const store = createStore();
      store.set(timePeriodAtom, {
        mode: 'absolute',
        since: '2026-01-28',
        until: '2026-01-28T15:30',
        relative: '3h ago',
      });

      store.set(sinceDateAtom, new Date(2026, 5, 15));

      expect(store.get(timePeriodAtom).since).toBe('2026-06-15T00:00');
    });
  });

  describe('sinceTimeAtom', () => {
    it('parses time from since value', () => {
      const store = createStore();
      store.set(timePeriodAtom, {
        mode: 'absolute',
        since: '2026-01-28T14:30',
        until: '2026-01-28T15:30',
        relative: '3h ago',
      });

      expect(store.get(sinceTimeAtom)).toBe('14:30');
    });

    it('returns 00:00 when since is undefined', () => {
      const store = createStore();
      store.set(timePeriodAtom, {
        mode: 'relative',
        since: undefined,
        until: undefined,
        relative: '3h ago',
      });

      expect(store.get(sinceTimeAtom)).toBe('00:00');
    });

    it('updates time in timePeriodAtom', () => {
      const store = createStore();
      store.set(timePeriodAtom, {
        mode: 'absolute',
        since: '2026-01-28T14:30',
        until: '2026-01-28T15:30',
        relative: '3h ago',
      });

      store.set(sinceTimeAtom, '09:15');

      expect(store.get(timePeriodAtom).since).toBe('2026-01-28T09:15');
    });

    it('preserves date when time is updated', () => {
      const store = createStore();
      store.set(timePeriodAtom, {
        mode: 'absolute',
        since: '2026-03-15T14:30',
        until: '2026-03-15T15:30',
        relative: '3h ago',
      });

      store.set(sinceTimeAtom, '08:00');

      expect(store.get(timePeriodAtom).since).toBe('2026-03-15T08:00');
    });

    it('validates and defaults invalid time to 00:00', () => {
      const store = createStore();
      store.set(timePeriodAtom, {
        mode: 'absolute',
        since: '2026-01-28T14:30',
        until: '2026-01-28T15:30',
        relative: '3h ago',
      });

      store.set(sinceTimeAtom, 'invalid');

      expect(store.get(timePeriodAtom).since).toBe('2026-01-28T00:00');
    });

    it('handles setting time when since is undefined', () => {
      const store = createStore();
      store.set(timePeriodAtom, {
        mode: 'absolute',
        since: undefined,
        until: '2026-01-28T15:30',
        relative: '3h ago',
      });

      store.set(sinceTimeAtom, '10:30');

      // When since is undefined, date part is empty, so formatDateTime returns empty string
      expect(store.get(timePeriodAtom).since).toBe('');
    });
  });

  describe('untilDateAtom', () => {
    it('returns undefined when until is undefined', () => {
      const store = createStore();
      store.set(timePeriodAtom, {
        mode: 'relative',
        since: undefined,
        until: undefined,
        relative: '3h ago',
      });

      expect(store.get(untilDateAtom)).toBeUndefined();
    });

    it('parses until into a Date object', () => {
      const store = createStore();
      store.set(timePeriodAtom, {
        mode: 'absolute',
        since: '2026-01-28T14:30',
        until: '2026-01-28T15:30',
        relative: '3h ago',
      });

      const date = store.get(untilDateAtom);
      expect(date).toBeInstanceOf(Date);
      expect(date?.getFullYear()).toBe(2026);
      expect(date?.getMonth()).toBe(0);
      expect(date?.getDate()).toBe(28);
    });

    it('updates timePeriodAtom when date is set', () => {
      const store = createStore();
      store.set(timePeriodAtom, {
        mode: 'absolute',
        since: '2026-01-28T14:30',
        until: '2026-01-28T15:30',
        relative: '3h ago',
      });

      store.set(untilDateAtom, new Date(2026, 5, 20)); // June 20, 2026

      expect(store.get(timePeriodAtom).until).toBe('2026-06-20T15:30');
    });

    it('defaults time to 00:00 when until is undefined in setter', () => {
      const store = createStore();
      store.set(timePeriodAtom, {
        mode: 'absolute',
        since: '2026-01-28T14:30',
        until: undefined,
        relative: '3h ago',
      });

      store.set(untilDateAtom, new Date(2026, 5, 20));

      // When until is undefined, parseDateTime('') returns time '00:00' which is truthy
      expect(store.get(timePeriodAtom).until).toBe('2026-06-20T00:00');
    });
  });

  describe('untilTimeAtom', () => {
    it('parses time from until value', () => {
      const store = createStore();
      store.set(timePeriodAtom, {
        mode: 'absolute',
        since: '2026-01-28T14:30',
        until: '2026-01-28T15:45',
        relative: '3h ago',
      });

      expect(store.get(untilTimeAtom)).toBe('15:45');
    });

    it('updates time in timePeriodAtom', () => {
      const store = createStore();
      store.set(timePeriodAtom, {
        mode: 'absolute',
        since: '2026-01-28T14:30',
        until: '2026-01-28T15:30',
        relative: '3h ago',
      });

      store.set(untilTimeAtom, '18:00');

      expect(store.get(timePeriodAtom).until).toBe('2026-01-28T18:00');
    });

    it('validates and defaults invalid time to 23:59', () => {
      const store = createStore();
      store.set(timePeriodAtom, {
        mode: 'absolute',
        since: '2026-01-28T14:30',
        until: '2026-01-28T15:30',
        relative: '3h ago',
      });

      store.set(untilTimeAtom, '25:00'); // Invalid hour

      expect(store.get(timePeriodAtom).until).toBe('2026-01-28T23:59');
    });

    it('returns 00:00 when until is undefined', () => {
      const store = createStore();
      store.set(timePeriodAtom, {
        mode: 'relative',
        since: undefined,
        until: undefined,
        relative: '3h ago',
      });

      expect(store.get(untilTimeAtom)).toBe('00:00');
    });

    it('handles setting time when until is undefined', () => {
      const store = createStore();
      store.set(timePeriodAtom, {
        mode: 'absolute',
        since: '2026-01-28T14:30',
        until: undefined,
        relative: '3h ago',
      });

      store.set(untilTimeAtom, '18:00');

      // When until is undefined, date part is empty, so formatDateTime returns empty string
      expect(store.get(timePeriodAtom).until).toBe('');
    });
  });

  describe('initializeTimePeriodAtom', () => {
    it('initializes since when undefined', () => {
      const store = createStore();
      store.set(timePeriodAtom, {
        mode: 'relative',
        since: undefined,
        until: '2026-01-28T15:30',
        relative: '3h ago',
      });

      store.set(initializeTimePeriodAtom);

      const since = store.get(timePeriodAtom).since;
      expect(since).toBeDefined();
      expect(since).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/);
    });

    it('initializes until when undefined', () => {
      const store = createStore();
      store.set(timePeriodAtom, {
        mode: 'relative',
        since: '2026-01-28T14:30',
        until: undefined,
        relative: '3h ago',
      });

      store.set(initializeTimePeriodAtom);

      const until = store.get(timePeriodAtom).until;
      expect(until).toBeDefined();
      expect(until).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/);
    });

    it('does not modify already defined values', () => {
      const store = createStore();
      store.set(timePeriodAtom, {
        mode: 'absolute',
        since: '2026-01-28T14:30',
        until: '2026-01-28T15:30',
        relative: '3h ago',
      });

      store.set(initializeTimePeriodAtom);

      expect(store.get(timePeriodAtom).since).toBe('2026-01-28T14:30');
      expect(store.get(timePeriodAtom).until).toBe('2026-01-28T15:30');
    });

    it('initializes both since and until to the same date when both are undefined', () => {
      const store = createStore();
      store.set(timePeriodAtom, {
        mode: 'relative',
        since: undefined,
        until: undefined,
        relative: '3h ago',
      });

      store.set(initializeTimePeriodAtom);

      const since = store.get(timePeriodAtom).since;
      const until = store.get(timePeriodAtom).until;
      
      expect(since).toBeDefined();
      expect(until).toBeDefined();
      
      // Extract dates from the datetime strings
      const sinceDate = since?.split('T')[0];
      const untilDate = until?.split('T')[0];
      
      // Both should have the same date
      expect(sinceDate).toBe(untilDate);
      
      // Verify default times
      expect(since).toMatch(/T00:00$/);
      expect(until).toMatch(/T23:59$/);
    });
  });
});
