import { atom } from 'jotai';
import type { QueryState } from '../types/query';
import { getInitialState } from '../lib/buildNrqlQuery';
import {
  applicationsAtom,
  environmentAtom,
  timePeriodAtom,
  excludeHealthChecksAtom,
  useTimeseriesAtom,
  facetAtom,
} from './primitives';
import { metricItemsAtom } from './metricItems';

export const applyPresetAtom = atom(
  null,
  (get, set, preset: Partial<QueryState>) => {
    if (preset.applications !== undefined) set(applicationsAtom, preset.applications);
    if (preset.environment !== undefined) set(environmentAtom, preset.environment);
    if (preset.metricItems !== undefined) set(metricItemsAtom, preset.metricItems);
    if (preset.timePeriod !== undefined) set(timePeriodAtom, preset.timePeriod);
    if (preset.excludeHealthChecks !== undefined) set(excludeHealthChecksAtom, preset.excludeHealthChecks);
    if (preset.useTimeseries !== undefined) set(useTimeseriesAtom, preset.useTimeseries);
    if (preset.facet !== undefined) set(facetAtom, preset.facet);
  }
);

export const resetAtom = atom(
  null,
  (get, set) => {
    const initial = getInitialState();
    set(applicationsAtom, initial.applications);
    set(environmentAtom, initial.environment);
    set(metricItemsAtom, initial.metricItems);
    set(timePeriodAtom, initial.timePeriod);
    set(excludeHealthChecksAtom, initial.excludeHealthChecks);
    set(useTimeseriesAtom, initial.useTimeseries);
    set(facetAtom, initial.facet);
  }
);
