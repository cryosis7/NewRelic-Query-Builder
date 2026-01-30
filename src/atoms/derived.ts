import { atom } from 'jotai';
import { buildNrqlQuery } from '../lib/buildNrqlQuery';
import {
  applicationsAtom,
  environmentAtom,
  timePeriodAtom,
  excludeHealthChecksAtom,
  useTimeseriesAtom,
  facetAtom,
} from './primitives';
import { metricItemsAtom } from './metricItems';

export const nrqlQueryAtom = atom((get) => {
  const state = {
    applications: get(applicationsAtom),
    environment: get(environmentAtom),
    metricItems: get(metricItemsAtom),
    timePeriod: get(timePeriodAtom),
    excludeHealthChecks: get(excludeHealthChecksAtom),
    useTimeseries: get(useTimeseriesAtom),
    facet: get(facetAtom),
  };
  return buildNrqlQuery(state);
});
