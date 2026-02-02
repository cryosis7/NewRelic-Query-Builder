import { atom } from 'jotai';
import type { QueryState, TimePeriodMode } from '../types/query';
import { getInitialState } from '../lib/buildNrqlQuery';
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

export const applyPresetAtom = atom(
  null,
  (_get, set, preset: Partial<QueryState>) => {
    if (preset.applications !== undefined) set(applicationsAtom, preset.applications);
    if (preset.environment !== undefined) set(environmentAtom, preset.environment);
    if (preset.metricItems !== undefined) set(metricItemsAtom, preset.metricItems);
    if (preset.timePeriod !== undefined) set(timePeriodAtom, preset.timePeriod);
    if (preset.excludeHealthChecks !== undefined) set(excludeHealthChecksAtom, preset.excludeHealthChecks);
    if (preset.excludeBulkEndpoint !== undefined) set(excludeBulkEndpointAtom, preset.excludeBulkEndpoint);
    if (preset.useTimeseries !== undefined) set(useTimeseriesAtom, preset.useTimeseries);
    if (preset.facet !== undefined) set(facetAtom, preset.facet);
  }
);

export const resetAtom = atom(
  null,
  (_get, set) => {
    const initial = getInitialState();
    set(applicationsAtom, initial.applications);
    set(environmentAtom, initial.environment);
    set(metricItemsAtom, initial.metricItems);
    set(timePeriodAtom, initial.timePeriod);
    set(excludeHealthChecksAtom, initial.excludeHealthChecks);
    set(excludeBulkEndpointAtom, initial.excludeBulkEndpoint);
    set(useTimeseriesAtom, initial.useTimeseries);
    set(facetAtom, initial.facet);
  }
);

export const setTimePeriodModeAtom = atom(
  null,
  (get, set, mode: TimePeriodMode) => {
    const current = get(timePeriodAtom);
    set(timePeriodAtom, { ...current, mode });
  }
);

export const setTimePeriodSinceAtom = atom(
  null,
  (get, set, since: string) => {
    const current = get(timePeriodAtom);
    set(timePeriodAtom, { ...current, since });
  }
);

export const setTimePeriodUntilAtom = atom(
  null,
  (get, set, until: string) => {
    const current = get(timePeriodAtom);
    set(timePeriodAtom, { ...current, until });
  }
);

export const setTimePeriodRelativeAtom = atom(
  null,
  (get, set, relative: string) => {
    const current = get(timePeriodAtom);
    set(timePeriodAtom, { ...current, relative });
  }
);
