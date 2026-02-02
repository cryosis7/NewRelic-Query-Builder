import { atom } from 'jotai';
import type { Application, Environment, TimePeriod, FacetOption } from '../types/query';
import { getDefaultTimePeriod } from '../lib/buildNrqlQuery';

export const applicationsAtom = atom<Application[]>(['global-tax-mapper-api']);

export const environmentAtom = atom<Environment>('prod');

export const timePeriodAtom = atom<TimePeriod>(getDefaultTimePeriod());

export const excludeHealthChecksAtom = atom<boolean>(true);
export const excludeBulkEndpointAtom = atom<boolean>(true);

export const useTimeseriesAtom = atom<boolean>(true);

export const facetAtom = atom<FacetOption>('request.uri');
