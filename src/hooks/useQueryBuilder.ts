import { useState, useMemo, useCallback } from 'react';
import type { QueryState, Application, Environment, MetricType, TimePeriod, FacetOption } from '../types/query';
import { HEALTH_CHECK_PATHS } from '../types/query';

function getDefaultTimePeriod(): TimePeriod {
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  
  // Format for datetime-local input (YYYY-MM-DDTHH:mm)
  const formatForInput = (date: Date) => {
    return date.toISOString().slice(0, 16);
  };
  
  return {
    mode: 'absolute',
    since: formatForInput(oneHourAgo),
    until: formatForInput(now),
    relative: '1h ago',
  };
}

function getInitialState(): QueryState {
  return {
    applications: [],
    environment: 'prod',
    metricType: 'count-with-average',
    timePeriod: getDefaultTimePeriod(),
    excludeHealthChecks: true,
    facet: 'request.uri',
  };
}

function formatDateForNrql(isoString: string): string {
  // Convert from datetime-local format (2026-01-28T08:41) to NRQL format (2026-01-28 08:41:00 +13:00)
  const date = new Date(isoString);
  const timezoneOffset = -date.getTimezoneOffset();
  const sign = timezoneOffset >= 0 ? '+' : '-';
  const hours = String(Math.floor(Math.abs(timezoneOffset) / 60)).padStart(2, '0');
  const minutes = String(Math.abs(timezoneOffset) % 60).padStart(2, '0');
  const timezone = `${sign}${hours}:${minutes}`;
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');
  const second = '00';
  
  return `${year}-${month}-${day} ${hour}:${minute}:${second} ${timezone}`;
}

function parseRelativeTimeInput(value: string): string | null {
  const normalized = value.trim().toLowerCase();
  if (!normalized) {
    return null;
  }

  const match = normalized.match(/^([0-9]+)\s*(m|min|mins|minute|minutes|h|hr|hrs|hour|hours|d|day|days)\s*(ago)?$/i);
  if (!match) {
    return null;
  }

  const amount = Number(match[1]);
  if (!Number.isFinite(amount) || amount <= 0) {
    return null;
  }

  const unitRaw = match[2].toLowerCase();
  let unit: 'minutes' | 'hours' | 'days';
  if (['m', 'min', 'mins', 'minute', 'minutes'].includes(unitRaw)) {
    unit = 'minutes';
  } else if (['h', 'hr', 'hrs', 'hour', 'hours'].includes(unitRaw)) {
    unit = 'hours';
  } else {
    unit = 'days';
  }

  return `${amount} ${unit} ago`;
}

export function buildNrqlQuery(state: QueryState): string {
  if (state.applications.length === 0) {
    return '-- Select at least one application';
  }

  // Build SELECT clause based on metric type
  let selectClause: string;
  switch (state.metricType) {
    case 'average-duration':
      selectClause = 'average(duration)';
      break;
    case 'count':
      selectClause = 'count(*)';
      break;
    case 'count-with-average':
      selectClause = 'average(duration), count(*)';
      break;
  }

  // Build app names with environment suffix
  const appNames = state.applications
    .map(app => `'${app}-${state.environment}'`)
    .join(', ');

  // Build WHERE clause
  const whereConditions: string[] = [`appName in (${appNames})`];

  if (state.excludeHealthChecks) {
    const paths = HEALTH_CHECK_PATHS.map(p => `'${p}'`).join(', ');
    whereConditions.push(`request.uri not in (${paths})`);
  }

  // Build time range
  let sinceClause: string;
  let untilClause: string;

  if (state.timePeriod.mode === 'relative') {
    const parsed = parseRelativeTimeInput(state.timePeriod.relative);
    if (!parsed) {
      return '-- Enter a valid relative time (e.g., 3h ago)';
    }
    sinceClause = `SINCE ${parsed}`;
    untilClause = 'UNTIL now';
  } else {
    const since = formatDateForNrql(state.timePeriod.since);
    const until = formatDateForNrql(state.timePeriod.until);
    sinceClause = `SINCE '${since}'`;
    untilClause = `UNTIL '${until}'`;
  }

  // Assemble full query
  const queryParts = [
    'FROM Transaction',
    `select ${selectClause}`,
    `WHERE ${whereConditions.join(' and ')}`,
    'TIMESERIES 1 MINUTE',
    sinceClause,
    untilClause,
  ];

  if (state.facet !== 'none') {
    queryParts.push(`FACET ${state.facet}`);
  }

  const query = queryParts.join(' ');

  return query;
}

export function useQueryBuilder() {
  const [state, setState] = useState<QueryState>(getInitialState);

  const query = useMemo(() => buildNrqlQuery(state), [state]);

  const setApplications = useCallback((applications: Application[]) => {
    setState(prev => ({ ...prev, applications }));
  }, []);

  const toggleApplication = useCallback((app: Application) => {
    setState(prev => ({
      ...prev,
      applications: prev.applications.includes(app)
        ? prev.applications.filter(a => a !== app)
        : [...prev.applications, app],
    }));
  }, []);

  const setEnvironment = useCallback((environment: Environment) => {
    setState(prev => ({ ...prev, environment }));
  }, []);

  const setMetricType = useCallback((metricType: MetricType) => {
    setState(prev => ({ ...prev, metricType }));
  }, []);

  const setTimePeriod = useCallback((timePeriod: TimePeriod) => {
    setState(prev => ({ ...prev, timePeriod }));
  }, []);

  const setTimeMode = useCallback((mode: TimePeriod['mode']) => {
    setState(prev => ({ ...prev, timePeriod: { ...prev.timePeriod, mode } }));
  }, []);

  const setSince = useCallback((since: string) => {
    setState(prev => ({ ...prev, timePeriod: { ...prev.timePeriod, since } }));
  }, []);

  const setUntil = useCallback((until: string) => {
    setState(prev => ({ ...prev, timePeriod: { ...prev.timePeriod, until } }));
  }, []);

  const setRelative = useCallback((relative: string) => {
    setState(prev => ({ ...prev, timePeriod: { ...prev.timePeriod, relative } }));
  }, []);

  const setExcludeHealthChecks = useCallback((excludeHealthChecks: boolean) => {
    setState(prev => ({ ...prev, excludeHealthChecks }));
  }, []);

  const setFacet = useCallback((facet: FacetOption) => {
    setState(prev => ({ ...prev, facet }));
  }, []);

  const applyPreset = useCallback((preset: Partial<QueryState>) => {
    setState(prev => ({ ...prev, ...preset }));
  }, []);

  const reset = useCallback(() => {
    setState(getInitialState());
  }, []);

  return {
    state,
    query,
    setApplications,
    toggleApplication,
    setEnvironment,
    setMetricType,
    setTimePeriod,
    setTimeMode,
    setSince,
    setUntil,
    setRelative,
    setExcludeHealthChecks,
    setFacet,
    applyPreset,
    reset,
  };
}
