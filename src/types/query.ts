export type Application = 
  | 'global-tax-mapper-api'
  | 'global-tax-mapper-bff'
  | 'global-tax-mapper-integrator-api';

export type Environment = 'prod' | 'uat';

export type FieldDataType = 'numeric' | 'string';

export interface NrqlField {
  name: string;           // NRQL field name (e.g., 'duration')
  label: string;          // Display label
  dataType: FieldDataType;
  canAggregate: boolean;  // Supports average/percentile (numeric only)
  canFacet: boolean;      // Can be used in FACET clause
}

export type AggregationType =
  | 'count'
  | 'average'
  | 'p95';

export type NumericOperator = '>' | '>=' | '<' | '<=' | '=';
export type StringOperator = '=' | 'IN';
export type MetricFilterOperator = NumericOperator | StringOperator;

export type FacetOption = 'none' | string;
export type TimePeriodMode = 'absolute' | 'relative';

export interface TimePeriod {
  mode: TimePeriodMode;
  since?: string; // ISO datetime string from datetime-local input (for absolute mode)
  until?: string; // ISO datetime string from datetime-local input (for absolute mode)
  relative: string; // e.g. "3h ago"
}

export interface QueryState {
  applications: Application[];
  environment: Environment;
  metricItems: MetricQueryItem[];
  timePeriod: TimePeriod;
  excludeHealthChecks: boolean;
  excludeBulkEndpoint: boolean;
  useTimeseries: boolean;
  facet: FacetOption;
}

export interface MetricFilter {
  id: string;
  field: string;
  operator: MetricFilterOperator;
  value: string;
  negated: boolean;
}

export interface MetricQueryItem {
  id: string;
  field: string;
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

// Core NRQL field definitions
export const NRQL_FIELDS: NrqlField[] = [
  { name: 'duration', label: 'Duration', dataType: 'numeric', canAggregate: true, canFacet: false },
  { name: 'response.status', label: 'Response Status', dataType: 'string', canAggregate: false, canFacet: true },
  { name: 'request.uri', label: 'Request URI', dataType: 'string', canAggregate: false, canFacet: true },
  { name: 'http.method', label: 'HTTP Method', dataType: 'string', canAggregate: false, canFacet: true },
  { name: 'name', label: 'Transaction Name', dataType: 'string', canAggregate: false, canFacet: true },
];

// Derived constants from NRQL_FIELDS
export const METRIC_FIELDS = NRQL_FIELDS.map(f => ({ value: f.name, label: f.label }));
export const FILTER_FIELDS = NRQL_FIELDS.map(f => ({ value: f.name, label: f.label }));
export const FACET_OPTIONS: { value: FacetOption; label: string }[] = [
  { value: 'none', label: 'No Facet' },
  ...NRQL_FIELDS.filter(f => f.canFacet).map(f => ({ value: f.name, label: f.label })),
];

export const AGGREGATION_TYPES: { value: AggregationType; label: string }[] = [
  { value: 'count', label: 'Count' },
  { value: 'average', label: 'Average' },
  { value: 'p95', label: '95th Percentile' },
];

export const NUMERIC_OPERATORS: { value: NumericOperator; label: string }[] = [
  { value: '>', label: '>' },
  { value: '>=', label: '>=' },
  { value: '<', label: '<' },
  { value: '<=', label: '<=' },
  { value: '=', label: '=' },
];

export const STRING_OPERATORS: { value: StringOperator; label: string }[] = [
  { value: '=', label: '=' },
  { value: 'IN', label: 'IN' },
];

// Helper function to get field definition by name
export function getFieldByName(fieldName: string): NrqlField | undefined {
  return NRQL_FIELDS.find(f => f.name === fieldName);
}

// Helper function to get operators for a field
export function getOperatorsForField(fieldName: string): { value: MetricFilterOperator; label: string }[] {
  const field = getFieldByName(fieldName);
  return field?.dataType === 'numeric' ? NUMERIC_OPERATORS : STRING_OPERATORS;
}

export const HEALTH_CHECK_PATHS = [
  '/ping',
  '/secureping',
  '/health',
  '/healthcheck',
  '/secure-ping',
  '/ready',
];

export const BULK_ENDPOINT_PATHS = ['/accountsV2/bulk'];
