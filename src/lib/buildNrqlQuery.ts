import type {
  AggregationType,
  FilterField,
  MetricFilter,
  MetricQueryItem,
  MetricType,
  QueryState,
  TimePeriod,
} from '../types/query';
import {HEALTH_CHECK_PATHS} from '../types/query';

export function getDefaultTimePeriod(): TimePeriod {
  return {
    mode: 'relative',
    relative: '3h ago',
  };
}

export function getInitialState(): QueryState {
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

export function generateId(): string {
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

export function createMetricItem(metricType: MetricType, aggregationType: AggregationType): MetricQueryItem {
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
    // For absolute mode, use provided values or defaults
    const sinceValue = state.timePeriod.since || new Date(Date.now() - 3600000).toISOString().slice(0, 16);
    const untilValue = state.timePeriod.until || new Date().toISOString().slice(0, 16);
    const since = formatDateForNrql(sinceValue);
    const until = formatDateForNrql(untilValue);
    sinceClause = `SINCE '${since}'`;
    untilClause = `UNTIL '${until}'`;
  }

  // Assemble full query
  const queryParts = [
    'FROM Transaction',
    `SELECT ${selectClause}`,
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

  return queryParts.join('\n');
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
