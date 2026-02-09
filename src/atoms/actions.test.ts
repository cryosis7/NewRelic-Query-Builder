import { createStore } from 'jotai';
import {
  applicationsAtom,
  environmentAtom,
  timePeriodAtom,
  excludeHealthChecksAtom,
  excludeBulkEndpointAtom,
  useTimeseriesAtom,
  facetAtom,
  metricItemsAtom,
  applyPresetAtom,
  resetAtom,
  setTimePeriodModeAtom,
  setTimePeriodSinceAtom,
  setTimePeriodUntilAtom,
  setTimePeriodRelativeAtom,
} from './index';
import { getInitialState } from '../lib/buildNrqlQuery';

describe('Action Atoms', () => {
  describe('resetAtom', () => {
    it('resets all atoms to initial state values', () => {
      const store = createStore();
      const initial = getInitialState();

      // Set every atom to a non-default value
      store.set(applicationsAtom, ['global-tax-mapper-bff']);
      store.set(environmentAtom, 'uat');
      store.set(metricItemsAtom, []);
      store.set(timePeriodAtom, {
        mode: 'absolute',
        since: '2026-01-01T00:00',
        until: '2026-01-02T00:00',
        relative: '1d ago',
      });
      store.set(excludeHealthChecksAtom, false);
      store.set(excludeBulkEndpointAtom, false);
      store.set(useTimeseriesAtom, false);
      store.set(facetAtom, 'none');

      // Invoke reset
      store.set(resetAtom);

      // Verify every atom matches initial state
      expect(store.get(applicationsAtom)).toEqual(initial.applications);
      expect(store.get(environmentAtom)).toBe(initial.environment);
      const metricItems = store.get(metricItemsAtom);
      expect(metricItems).toHaveLength(initial.metricItems.length);
      expect(metricItems[0]).toEqual(expect.objectContaining({
        field: initial.metricItems[0].field,
        aggregationType: initial.metricItems[0].aggregationType,
        filters: initial.metricItems[0].filters,
      }));
      expect(store.get(timePeriodAtom)).toEqual(initial.timePeriod);
      expect(store.get(excludeHealthChecksAtom)).toBe(initial.excludeHealthChecks);
      expect(store.get(excludeBulkEndpointAtom)).toBe(initial.excludeBulkEndpoint);
      expect(store.get(useTimeseriesAtom)).toBe(initial.useTimeseries);
      expect(store.get(facetAtom)).toBe(initial.facet);
    });

    it('is idempotent when called on already-default state', () => {
      const store = createStore();
      const initial = getInitialState();

      store.set(resetAtom);

      expect(store.get(applicationsAtom)).toEqual(initial.applications);
      expect(store.get(environmentAtom)).toBe(initial.environment);
      expect(store.get(timePeriodAtom)).toEqual(initial.timePeriod);
      expect(store.get(excludeHealthChecksAtom)).toBe(initial.excludeHealthChecks);
      expect(store.get(excludeBulkEndpointAtom)).toBe(initial.excludeBulkEndpoint);
      expect(store.get(useTimeseriesAtom)).toBe(initial.useTimeseries);
      expect(store.get(facetAtom)).toBe(initial.facet);
    });
  });

  describe('applyPresetAtom', () => {
    it('applies a full preset to all atoms', () => {
      const store = createStore();

      store.set(applyPresetAtom, {
        applications: ['global-tax-mapper-bff', 'global-tax-mapper-integrator-api'],
        environment: 'uat',
        metricItems: [],
        timePeriod: { mode: 'absolute', since: '2026-06-01T08:00', until: '2026-06-01T17:00', relative: '1h ago' },
        excludeHealthChecks: false,
        excludeBulkEndpoint: false,
        useTimeseries: false,
        facet: 'name',
      });

      expect(store.get(applicationsAtom)).toEqual(['global-tax-mapper-bff', 'global-tax-mapper-integrator-api']);
      expect(store.get(environmentAtom)).toBe('uat');
      expect(store.get(metricItemsAtom)).toEqual([]);
      expect(store.get(timePeriodAtom)).toEqual({
        mode: 'absolute',
        since: '2026-06-01T08:00',
        until: '2026-06-01T17:00',
        relative: '1h ago',
      });
      expect(store.get(excludeHealthChecksAtom)).toBe(false);
      expect(store.get(excludeBulkEndpointAtom)).toBe(false);
      expect(store.get(useTimeseriesAtom)).toBe(false);
      expect(store.get(facetAtom)).toBe('name');
    });

    it('applies a partial preset without affecting other atoms', () => {
      const store = createStore();
      const initial = getInitialState();

      // Only change environment and facet
      store.set(applyPresetAtom, {
        environment: 'uat',
        facet: 'none',
      });

      expect(store.get(environmentAtom)).toBe('uat');
      expect(store.get(facetAtom)).toBe('none');

      // Everything else should remain at defaults
      expect(store.get(applicationsAtom)).toEqual(initial.applications);
      expect(store.get(timePeriodAtom)).toEqual(initial.timePeriod);
      expect(store.get(excludeHealthChecksAtom)).toBe(initial.excludeHealthChecks);
      expect(store.get(excludeBulkEndpointAtom)).toBe(initial.excludeBulkEndpoint);
      expect(store.get(useTimeseriesAtom)).toBe(initial.useTimeseries);
    });

    it('does not modify any atom when preset is empty', () => {
      const store = createStore();
      const initial = getInitialState();

      store.set(applyPresetAtom, {});

      expect(store.get(applicationsAtom)).toEqual(initial.applications);
      expect(store.get(environmentAtom)).toBe(initial.environment);
      expect(store.get(timePeriodAtom)).toEqual(initial.timePeriod);
      expect(store.get(excludeHealthChecksAtom)).toBe(initial.excludeHealthChecks);
      expect(store.get(excludeBulkEndpointAtom)).toBe(initial.excludeBulkEndpoint);
      expect(store.get(useTimeseriesAtom)).toBe(initial.useTimeseries);
      expect(store.get(facetAtom)).toBe(initial.facet);
    });

    it('applies a preset with only metricItems set', () => {
      const store = createStore();
      const initial = getInitialState();

      store.set(applyPresetAtom, {
        metricItems: [],
      });

      expect(store.get(metricItemsAtom)).toEqual([]);

      // All other atoms remain at defaults
      expect(store.get(applicationsAtom)).toEqual(initial.applications);
      expect(store.get(environmentAtom)).toBe(initial.environment);
      expect(store.get(timePeriodAtom)).toEqual(initial.timePeriod);
      expect(store.get(excludeHealthChecksAtom)).toBe(initial.excludeHealthChecks);
      expect(store.get(excludeBulkEndpointAtom)).toBe(initial.excludeBulkEndpoint);
      expect(store.get(useTimeseriesAtom)).toBe(initial.useTimeseries);
      expect(store.get(facetAtom)).toBe(initial.facet);
    });

    it('applies a preset with only excludeHealthChecks and useTimeseries', () => {
      const store = createStore();
      const initial = getInitialState();

      store.set(applyPresetAtom, {
        excludeHealthChecks: false,
        useTimeseries: false,
      });

      expect(store.get(excludeHealthChecksAtom)).toBe(false);
      expect(store.get(useTimeseriesAtom)).toBe(false);

      // All other atoms remain at defaults
      expect(store.get(applicationsAtom)).toEqual(initial.applications);
      expect(store.get(environmentAtom)).toBe(initial.environment);
      expect(store.get(timePeriodAtom)).toEqual(initial.timePeriod);
      expect(store.get(excludeBulkEndpointAtom)).toBe(initial.excludeBulkEndpoint);
      expect(store.get(facetAtom)).toBe(initial.facet);
    });

    it('applies a preset with only timePeriod and excludeBulkEndpoint', () => {
      const store = createStore();
      const initial = getInitialState();

      store.set(applyPresetAtom, {
        timePeriod: { mode: 'absolute', since: '2026-06-01T08:00', until: '2026-06-01T17:00', relative: '1h ago' },
        excludeBulkEndpoint: false,
      });

      expect(store.get(timePeriodAtom)).toEqual({
        mode: 'absolute',
        since: '2026-06-01T08:00',
        until: '2026-06-01T17:00',
        relative: '1h ago',
      });
      expect(store.get(excludeBulkEndpointAtom)).toBe(false);

      // All other atoms remain at defaults
      expect(store.get(applicationsAtom)).toEqual(initial.applications);
      expect(store.get(environmentAtom)).toBe(initial.environment);
      expect(store.get(excludeHealthChecksAtom)).toBe(initial.excludeHealthChecks);
      expect(store.get(useTimeseriesAtom)).toBe(initial.useTimeseries);
      expect(store.get(facetAtom)).toBe(initial.facet);
    });
  });

  describe('setTimePeriodModeAtom', () => {
    it('changes mode from relative to absolute', () => {
      const store = createStore();
      store.set(timePeriodAtom, { mode: 'relative', relative: '3h ago' });

      store.set(setTimePeriodModeAtom, 'absolute');

      expect(store.get(timePeriodAtom).mode).toBe('absolute');
      expect(store.get(timePeriodAtom).relative).toBe('3h ago');
    });

    it('changes mode from absolute to relative', () => {
      const store = createStore();
      store.set(timePeriodAtom, {
        mode: 'absolute',
        since: '2026-01-28T14:30',
        until: '2026-01-28T15:30',
        relative: '3h ago',
      });

      store.set(setTimePeriodModeAtom, 'relative');

      const result = store.get(timePeriodAtom);
      expect(result.mode).toBe('relative');
      expect(result.since).toBe('2026-01-28T14:30');
      expect(result.until).toBe('2026-01-28T15:30');
    });
  });

  describe('setTimePeriodSinceAtom', () => {
    it('updates the since value while preserving other fields', () => {
      const store = createStore();
      store.set(timePeriodAtom, {
        mode: 'absolute',
        since: '2026-01-28T14:30',
        until: '2026-01-28T15:30',
        relative: '3h ago',
      });

      store.set(setTimePeriodSinceAtom, '2026-03-01T09:00');

      const result = store.get(timePeriodAtom);
      expect(result.since).toBe('2026-03-01T09:00');
      expect(result.mode).toBe('absolute');
      expect(result.until).toBe('2026-01-28T15:30');
      expect(result.relative).toBe('3h ago');
    });
  });

  describe('setTimePeriodUntilAtom', () => {
    it('updates the until value while preserving other fields', () => {
      const store = createStore();
      store.set(timePeriodAtom, {
        mode: 'absolute',
        since: '2026-01-28T14:30',
        until: '2026-01-28T15:30',
        relative: '3h ago',
      });

      store.set(setTimePeriodUntilAtom, '2026-02-10T23:59');

      const result = store.get(timePeriodAtom);
      expect(result.until).toBe('2026-02-10T23:59');
      expect(result.mode).toBe('absolute');
      expect(result.since).toBe('2026-01-28T14:30');
      expect(result.relative).toBe('3h ago');
    });

    it('can set until on a time period that had no until defined', () => {
      const store = createStore();
      store.set(timePeriodAtom, {
        mode: 'relative',
        relative: '3h ago',
      });

      store.set(setTimePeriodUntilAtom, '2026-05-20T18:00');

      const result = store.get(timePeriodAtom);
      expect(result.until).toBe('2026-05-20T18:00');
      expect(result.mode).toBe('relative');
      expect(result.relative).toBe('3h ago');
    });
  });

  describe('setTimePeriodRelativeAtom', () => {
    it('updates the relative value while preserving other fields', () => {
      const store = createStore();
      store.set(timePeriodAtom, {
        mode: 'relative',
        since: '2026-01-28T14:30',
        until: '2026-01-28T15:30',
        relative: '3h ago',
      });

      store.set(setTimePeriodRelativeAtom, '7d ago');

      const result = store.get(timePeriodAtom);
      expect(result.relative).toBe('7d ago');
      expect(result.mode).toBe('relative');
      expect(result.since).toBe('2026-01-28T14:30');
      expect(result.until).toBe('2026-01-28T15:30');
    });

    it('can update relative from the default time period', () => {
      const store = createStore();
      // Default timePeriodAtom is { mode: 'relative', relative: '3h ago' }

      store.set(setTimePeriodRelativeAtom, '30m ago');

      const result = store.get(timePeriodAtom);
      expect(result.relative).toBe('30m ago');
      expect(result.mode).toBe('relative');
    });
  });
});
