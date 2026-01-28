export type Application = 
  | 'global-tax-mapper-api'
  | 'global-tax-mapper-bff'
  | 'global-tax-mapper-integrator-api';

export type Environment = 'prod' | 'uat';

export type MetricType = 
  | 'duration'
  | 'transaction-count'
  | 'response.status';

export type AggregationType =
  | 'count'
  | 'average'
  | 'p95';

export type MetricFilterOperator = '>' | '>=' | '<' | '<=' | '=' | 'LIKE' | 'IN';

/** Filter field types - all metric types except transaction-count */
export type FilterField = 'duration' | 'response.status';

export type FacetOption = 
  | 'none'
  | 'request.uri'
  | 'response.status'
  | 'http.method'
  | 'name';
export type TimePeriodMode = 'absolute' | 'relative';

export interface TimePeriod {
  mode: TimePeriodMode;
  since: string; // ISO datetime string from datetime-local input
  until: string; // ISO datetime string from datetime-local input
  relative: string; // e.g. "3h ago"
}

export interface QueryState {
  applications: Application[];
  environment: Environment;
  metricItems: MetricQueryItem[];
  timePeriod: TimePeriod;
  excludeHealthChecks: boolean;
  useTimeseries: boolean;
  facet: FacetOption;
}

export interface MetricFilter {
  id: string;
  field: FilterField;
  operator: MetricFilterOperator;
  value: string;
}

export interface MetricQueryItem {
  id: string;
  metricType: MetricType;
  aggregationType: AggregationType;
  filters: MetricFilter[];
}

export const APPLICATIONS: { value: Application; label: string }[] = [
  { value: 'global-tax-mapper-api', label: 'API' },
  { value: 'global-tax-mapper-bff', label: 'BFF' },
  { value: 'global-tax-mapper-integrator-api', label: 'Integrator API' },
];

export const ENVIRONMENTS: { value: Environment; label: string }[] = [
  { value: 'prod', label: 'Production' },
  { value: 'uat', label: 'UAT' },
];

export const METRIC_TYPES: { value: MetricType; label: string }[] = [
  { value: 'duration', label: 'Duration' },
  { value: 'transaction-count', label: 'Transaction' },
  { value: 'response.status', label: 'Response Status' },
];

export const AGGREGATION_TYPES: { value: AggregationType; label: string }[] = [
  { value: 'count', label: 'Count' },
  { value: 'average', label: 'Average' },
  { value: 'p95', label: '95th Percentile' },
];

export const METRIC_FILTER_OPERATORS: { value: MetricFilterOperator; label: string }[] = [
  { value: '>', label: '>' },
  { value: '>=', label: '>=' },
  { value: '<', label: '<' },
  { value: '<=', label: '<=' },
  { value: '=', label: '=' },
  { value: 'LIKE', label: 'LIKE' },
  { value: 'IN', label: 'IN' },
];

export const FILTER_FIELDS: { value: FilterField; label: string }[] = [
  { value: 'duration', label: 'Duration' },
  { value: 'response.status', label: 'Response Status' },
];

export const FACET_OPTIONS: { value: FacetOption; label: string }[] = [
  { value: 'none', label: 'No Facet' },
  { value: 'request.uri', label: 'Request URI' },
  { value: 'response.status', label: 'Response Status' },
  { value: 'http.method', label: 'HTTP Method' },
  { value: 'name', label: 'Transaction Name' },
];

export const HEALTH_CHECK_PATHS = [
  '/ping',
  '/secureping',
  '/health',
  '/healthcheck',
  '/secure-ping',
  '/ready',
  '/accountsV2/bulk',
];
