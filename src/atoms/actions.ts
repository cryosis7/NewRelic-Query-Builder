import { atom } from "jotai";
import type { QueryState, SavedQuery, TimePeriodMode } from "../types/query";
import {
  getInitialState,
  buildNrqlQuery,
  generateId,
} from "../lib/buildNrqlQuery";
import {
  applicationsAtom,
  environmentAtom,
  timePeriodAtom,
  excludeHealthChecksAtom,
  excludeBulkEndpointAtom,
  useTimeseriesAtom,
  facetAtom,
  savedQueriesAtom,
} from "./primitives";
import { metricItemsAtom } from "./metricItems";

export const applyPresetAtom = atom(
  null,
  (_get, set, preset: Partial<QueryState>) => {
    if (preset.applications !== undefined)
      set(applicationsAtom, preset.applications);
    if (preset.environment !== undefined)
      set(environmentAtom, preset.environment);
    if (preset.metricItems !== undefined)
      set(metricItemsAtom, preset.metricItems);
    if (preset.timePeriod !== undefined) set(timePeriodAtom, preset.timePeriod);
    if (preset.excludeHealthChecks !== undefined)
      set(excludeHealthChecksAtom, preset.excludeHealthChecks);
    if (preset.excludeBulkEndpoint !== undefined)
      set(excludeBulkEndpointAtom, preset.excludeBulkEndpoint);
    if (preset.useTimeseries !== undefined)
      set(useTimeseriesAtom, preset.useTimeseries);
    if (preset.facet !== undefined) set(facetAtom, preset.facet);
  },
);

export const resetAtom = atom(null, (_get, set) => {
  const initial = getInitialState();
  set(applicationsAtom, initial.applications);
  set(environmentAtom, initial.environment);
  set(metricItemsAtom, initial.metricItems);
  set(timePeriodAtom, initial.timePeriod);
  set(excludeHealthChecksAtom, initial.excludeHealthChecks);
  set(excludeBulkEndpointAtom, initial.excludeBulkEndpoint);
  set(useTimeseriesAtom, initial.useTimeseries);
  set(facetAtom, initial.facet);
});

export const setTimePeriodModeAtom = atom(
  null,
  (get, set, mode: TimePeriodMode) => {
    const current = get(timePeriodAtom);
    set(timePeriodAtom, { ...current, mode });
  },
);

export const setTimePeriodSinceAtom = atom(null, (get, set, since: string) => {
  const current = get(timePeriodAtom);
  set(timePeriodAtom, { ...current, since });
});

export const setTimePeriodUntilAtom = atom(null, (get, set, until: string) => {
  const current = get(timePeriodAtom);
  set(timePeriodAtom, { ...current, until });
});

export const setTimePeriodRelativeAtom = atom(
  null,
  (get, set, relative: string) => {
    const current = get(timePeriodAtom);
    set(timePeriodAtom, { ...current, relative });
  },
);

export const saveQueryAtom = atom(
  null,
  (get, set, { name }: { name: string }) => {
    const state: QueryState = {
      applications: get(applicationsAtom),
      environment: get(environmentAtom),
      metricItems: get(metricItemsAtom),
      timePeriod: get(timePeriodAtom),
      excludeHealthChecks: get(excludeHealthChecksAtom),
      excludeBulkEndpoint: get(excludeBulkEndpointAtom),
      useTimeseries: get(useTimeseriesAtom),
      facet: get(facetAtom),
    };

    const savedQuery: SavedQuery = {
      id: generateId(),
      name: name.trim(),
      nrqlQuery: buildNrqlQuery(state),
      state,
      createdAt: new Date().toISOString(),
    };

    const current = get(savedQueriesAtom);
    set(savedQueriesAtom, [...current, savedQuery]);
  },
);

export const deleteSavedQueryAtom = atom(null, (get, set, id: string) => {
  const current = get(savedQueriesAtom);
  set(
    savedQueriesAtom,
    current.filter((q) => q.id !== id),
  );
});
