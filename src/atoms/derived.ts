import { atom } from 'jotai';
import { buildNrqlQuery } from '../lib/buildNrqlQuery';
import {
  applicationsAtom,
  environmentAtom,
  timePeriodAtom,
  excludeHealthChecksAtom,
  excludeBulkEndpointAtom,
  useTimeseriesAtom,
  facetAtom,
} from './primitives';
import { metricItemsAtom } from './metricItems';
import {
  parseDateTime,
  formatDateTime,
  parseDateStringToDate,
  formatDateToString,
} from '../lib/dateTimeUtils';

export const nrqlQueryAtom = atom((get) => {
  const state = {
    applications: get(applicationsAtom),
    environment: get(environmentAtom),
    metricItems: get(metricItemsAtom),
    timePeriod: get(timePeriodAtom),
    excludeHealthChecks: get(excludeHealthChecksAtom),
    excludeBulkEndpoint: get(excludeBulkEndpointAtom),
    useTimeseries: get(useTimeseriesAtom),
    facet: get(facetAtom),
  };
  return buildNrqlQuery(state);
});

/** Parsed since date as Date object */
export const sinceDateAtom = atom(
  (get) => {
    const { since } = get(timePeriodAtom);
    if (!since) return undefined;
    const { date } = parseDateTime(since);
    return parseDateStringToDate(date);
  },
  (get, set, newDate: Date | null | undefined) => {
    const current = get(timePeriodAtom);
    const { time } = parseDateTime(current.since ?? '');
    const newDateStr = formatDateToString(newDate);
    set(timePeriodAtom, {
      ...current,
      since: formatDateTime(newDateStr, time || '00:00'),
    });
  }
);

/** Parsed since time as HH:mm string */
export const sinceTimeAtom = atom(
  (get) => {
    const { since } = get(timePeriodAtom);
    const { time } = parseDateTime(since ?? '');
    return time;
  },
  (get, set, newTime: string) => {
    const current = get(timePeriodAtom);
    const { date } = parseDateTime(current.since ?? '');
    // Validate time format, default to 00:00 if invalid
    const validTime = /^([01]\d|2[0-3]):[0-5]\d$/.test(newTime) ? newTime : '00:00';
    set(timePeriodAtom, {
      ...current,
      since: formatDateTime(date, validTime),
    });
  }
);

/** Parsed until date as Date object */
export const untilDateAtom = atom(
  (get) => {
    const { until } = get(timePeriodAtom);
    if (!until) return undefined;
    const { date } = parseDateTime(until);
    return parseDateStringToDate(date);
  },
  (get, set, newDate: Date | null | undefined) => {
    const current = get(timePeriodAtom);
    const { time } = parseDateTime(current.until ?? '');
    const newDateStr = formatDateToString(newDate);
    set(timePeriodAtom, {
      ...current,
      until: formatDateTime(newDateStr, time || '00:00'),
    });
  }
);

/** Parsed until time as HH:mm string */
export const untilTimeAtom = atom(
  (get) => {
    const { until } = get(timePeriodAtom);
    const { time } = parseDateTime(until ?? '');
    return time;
  },
  (get, set, newTime: string) => {
    const current = get(timePeriodAtom);
    const { date } = parseDateTime(current.until ?? '');
    // Validate time format, default to 00:00 if invalid
    const validTime = /^([01]\d|2[0-3]):[0-5]\d$/.test(newTime) ? newTime : '00:00';
    set(timePeriodAtom, {
      ...current,
      until: formatDateTime(date, validTime),
    });
  }
);

/** Initialize since/until with default values if undefined */
export const initializeTimePeriodAtom = atom(null, (get, set) => {
  const current = get(timePeriodAtom);
  const ONE_HOUR_MS = 60 * 60 * 1000;
  const updates: Partial<typeof current> = {};

  if (current.since === undefined) {
    const oneHourAgo = new Date(Date.now() - ONE_HOUR_MS);
    updates.since = oneHourAgo.toISOString().slice(0, 16);
  }
  if (current.until === undefined) {
    updates.until = new Date().toISOString().slice(0, 16);
  }

  if (Object.keys(updates).length > 0) {
    set(timePeriodAtom, { ...current, ...updates });
  }
});
