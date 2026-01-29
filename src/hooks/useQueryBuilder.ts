import { useState, useMemo, useCallback } from 'react';
import type {
  QueryState,
  Application,
  Environment,
  MetricType,
  AggregationType,
  TimePeriod,
  FacetOption,
  MetricQueryItem,
  MetricFilter,
  FilterField,
} from '../types/query';
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
    applications: ['global-tax-mapper-api'],
    environment: 'prod',
    metricItems: [createMetricItem('transaction-count', 'count')],
    timePeriod: getDefaultTimePeriod(),
    excludeHealthChecks: true,
    useTimeseries: true,
    facet: 'request.uri',
  };
}

function isDurationMetric(metricType: MetricType): boolean {
  return metricType === 'duration';
}

function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function createMetricFilter(field: FilterField = 'duration'): MetricFilter {
  return {
    id: generateId(),
    field,
    operator: field === 'response.status' ? '=' : '>',
    value: '',
  };
}

function createMetricItem(metricType: MetricType, aggregationType: AggregationType): MetricQueryItem {
  return {
    id: generateId(),
    metricType,
    aggregationType: normalizeAggregationForMetric(metricType, aggregationType),
    filters: [],
  };
}

function normalizeAggregationForMetric(metricType: MetricType, aggregationType: AggregationType): AggregationType {
  return isDurationMetric(metricType) ? aggregationType : 'count';
}

function normalizeFuzzyStatusCode(value: string): string {
  // Normalize 4xx, 5xx, 2xx to 4%, 5%, 2%
  return value.replace(/xx$/i, '%');
}

function parseStatusFilterValue(value: string): { exact: string[], fuzzy: string[] } {
  const values = value.split(',').map(v => v.trim()).filter(Boolean);
  const exact: string[] = [];
  const fuzzy: string[] = [];

  for (const val of values) {
    // Check if it's a fuzzy pattern (ends with xx or %)
    if (/xx$/i.test(val) || val.endsWith('%')) {
      fuzzy.push(normalizeFuzzyStatusCode(val));
    } else {
      exact.push(val);
    }
  }

  return { exact, fuzzy };
}

function buildStatusFilterCondition(value: string): string {
  const { exact, fuzzy } = parseStatusFilterValue(value);
  const conditions: string[] = [];

  if (exact.length === 1) {
    conditions.push(`response.status = ${exact[0]}`);
  } else if (exact.length > 1) {
    conditions.push(`response.status IN (${exact.join(', ')})`);
  }

  for (const pattern of fuzzy) {
    conditions.push(`response.status LIKE '${pattern}'`);
  }

  if (conditions.length === 1) {
    return conditions[0];
  } else if (conditions.length > 1) {
    return `(${conditions.join(' OR ')})`;
  }

  return '';
}

function buildSingleFilterCondition(filter: MetricFilter): string | null {
  const value = filter.value.trim();
  if (!value) {
    return null; // Empty filter value - skip it
  }

  if (filter.field === 'response.status') {
    return buildStatusFilterCondition(value);
  }

  // For duration field, use the operator directly
  return `${filter.field} ${filter.operator} ${value}`;
}

function buildFilterConditions(filters: MetricFilter[]): string[] {
  return filters
    .map(buildSingleFilterCondition)
    .filter((condition): condition is string => condition !== null);
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

  if (state.metricItems.length === 0) {
    return '-- Select at least one metric';
  }

  // Build filter conditions for each metric item (empty filters are dropped)
  const itemFilters = state.metricItems.map((item) => buildFilterConditions(item.filters));

  const conditionKey = (conditions: string[]) => conditions.slice().sort().join(' && ');
  const conditionKeys = itemFilters.map(conditionKey);
  const uniqueConditionKeys = new Set(conditionKeys);
  const canLiftItemFilters = uniqueConditionKeys.size === 1;
  const sharedItemFilters = canLiftItemFilters ? itemFilters[0] : [];

  const selectItems = state.metricItems.map((item, index) => {
    const conditions = itemFilters[index];
    const baseSelect = buildMetricSelect(item);

    if (canLiftItemFilters && sharedItemFilters.length > 0) {
      return baseSelect;
    }

    if (conditions.length > 0) {
      return `filter(${baseSelect}, where ${conditions.join(' and ')})`;
    }

    return baseSelect;
  });

  const selectClause = selectItems.join(', ');

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

  if (canLiftItemFilters && sharedItemFilters.length > 0) {
    whereConditions.push(...sharedItemFilters);
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
  ];

  if (state.useTimeseries) {
    queryParts.push('TIMESERIES AUTO');
  }

  queryParts.push(sinceClause);
  queryParts.push(untilClause);

  if (state.facet !== 'none') {
    queryParts.push(`FACET ${state.facet}`);
  }

  const query = queryParts.join(' ');

  return query;
}

function buildMetricSelect(item: MetricQueryItem): string {
  if (isDurationMetric(item.metricType)) {
    switch (item.aggregationType) {
      case 'average':
        return 'average(duration)';
      case 'p95':
        return 'percentile(duration, 95)';
      case 'count':
        return 'count(duration)';
    }
  }

  if (item.metricType === 'response.status') {
    return 'count(response.status)';
  }

  return 'count(*)';
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

  const addMetricItem = useCallback(() => {
    setState(prev => ({
      ...prev,
      metricItems: [...prev.metricItems, createMetricItem('transaction-count', 'count')],
    }));
  }, []);

  const updateMetricItem = useCallback((id: string, updates: Partial<MetricQueryItem>) => {
    setState(prev => ({
      ...prev,
      metricItems: prev.metricItems.map(item => {
        if (item.id !== id) {
          return item;
        }

        const updatedMetricType = updates.metricType ?? item.metricType;
        const updatedAggregationType = normalizeAggregationForMetric(
          updatedMetricType,
          updates.aggregationType ?? item.aggregationType
        );

        return {
          ...item,
          ...updates,
          metricType: updatedMetricType,
          aggregationType: updatedAggregationType,
        };
      }),
    }));
  }, []);

  const removeMetricItem = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      metricItems: prev.metricItems.filter(item => item.id !== id),
    }));
  }, []);

  const addFilter = useCallback((metricItemId: string, field: FilterField = 'duration') => {
    setState(prev => ({
      ...prev,
      metricItems: prev.metricItems.map(item => {
        if (item.id !== metricItemId) {
          return item;
        }
        return {
          ...item,
          filters: [...item.filters, createMetricFilter(field)],
        };
      }),
    }));
  }, []);

  const updateFilter = useCallback((metricItemId: string, filterId: string, updates: Partial<MetricFilter>) => {
    setState(prev => ({
      ...prev,
      metricItems: prev.metricItems.map(item => {
        if (item.id !== metricItemId) {
          return item;
        }
        return {
          ...item,
          filters: item.filters.map(filter => {
            if (filter.id !== filterId) {
              return filter;
            }
            // When field changes, reset operator to appropriate default
            const newField = updates.field ?? filter.field;
            const operatorNeedsReset = updates.field && updates.field !== filter.field;
            const newOperator = operatorNeedsReset
              ? (newField === 'response.status' ? '=' : '>')
              : (updates.operator ?? filter.operator);
            return {
              ...filter,
              ...updates,
              field: newField,
              operator: newOperator,
            };
          }),
        };
      }),
    }));
  }, []);

  const removeFilter = useCallback((metricItemId: string, filterId: string) => {
    setState(prev => ({
      ...prev,
      metricItems: prev.metricItems.map(item => {
        if (item.id !== metricItemId) {
          return item;
        }
        return {
          ...item,
          filters: item.filters.filter(f => f.id !== filterId),
        };
      }),
    }));
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

  const setUseTimeseries = useCallback((useTimeseries: boolean) => {
    setState(prev => ({ ...prev, useTimeseries }));
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
    addMetricItem,
    updateMetricItem,
    removeMetricItem,
    addFilter,
    updateFilter,
    removeFilter,
    setTimePeriod,
    setTimeMode,
    setSince,
    setUntil,
    setRelative,
    setExcludeHealthChecks,
    setUseTimeseries,
    setFacet,
    applyPreset,
    reset,
  };
}
