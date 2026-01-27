export type Application = 
  | 'global-tax-mapper-api'
  | 'global-tax-mapper-bff'
  | 'global-tax-mapper-integrator-api';

export type Environment = 'prod' | 'uat';

export type MetricType = 
  | 'average-duration'
  | 'count'
  | 'count-with-average';

export interface TimePeriod {
  since: string; // ISO datetime string from datetime-local input
  until: string; // ISO datetime string from datetime-local input
}

export interface QueryState {
  applications: Application[];
  environment: Environment;
  metricType: MetricType;
  timePeriod: TimePeriod;
  excludeHealthChecks: boolean;
}

export const APPLICATIONS: { value: Application; label: string }[] = [
  { value: 'global-tax-mapper-api', label: 'Global Tax Mapper API' },
  { value: 'global-tax-mapper-bff', label: 'Global Tax Mapper BFF' },
  { value: 'global-tax-mapper-integrator-api', label: 'Global Tax Mapper Integrator API' },
];

export const ENVIRONMENTS: { value: Environment; label: string }[] = [
  { value: 'prod', label: 'Production' },
  { value: 'uat', label: 'UAT' },
];

export const METRIC_TYPES: { value: MetricType; label: string }[] = [
  { value: 'average-duration', label: 'Average Duration' },
  { value: 'count', label: 'Total Count' },
  { value: 'count-with-average', label: 'Count & Average Duration' },
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
