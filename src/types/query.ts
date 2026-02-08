export type Application =
    | 'global-tax-mapper-api'
    | 'global-tax-mapper-bff'
    | 'global-tax-mapper-integrator-api';

export type Environment = 'prod' | 'uat';

export interface NrqlField {
    name: string;           // NRQL field name (e.g., 'duration')
    label: string;          // Display label
    dataType: 'numeric' | 'string';
    canFacet: boolean;      // Can be used in FACET clause
    canSearch: boolean;
    canFilter: boolean;
}

export interface AggregationConfig {
    value: string;
    label: string;
    nrqlTemplate: string;
    isNumericalAggregator?: boolean;
}

export const AGGREGATION_TYPES: AggregationConfig[] = [
    { value: 'average', label: 'Average', nrqlTemplate: 'average({field})', isNumericalAggregator: true },
    { value: 'count', label: 'Count', nrqlTemplate: 'count({field})' },
    { value: 'p95', label: '95th Percentile', nrqlTemplate: 'percentile({field}, 95)', isNumericalAggregator: true },
    { value: 'uniques', label: 'Unique List', nrqlTemplate: 'uniques({field})' },
    { value: 'median', label: 'Median', nrqlTemplate: 'median({field})', isNumericalAggregator: true },
];

export type AggregationType = typeof AGGREGATION_TYPES[number]['value'];

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

const createNrqlField = (
    name: string,
    label: string,
    dataType: 'numeric' | 'string',
    options: {
        canFacet?: boolean;
        canSearch?: boolean;
        canFilter?: boolean;
    } = {}
): NrqlField => ({
    name,
    label,
    dataType,
    canFacet: options.canFacet ?? true,
    canSearch: options.canSearch ?? true,
    canFilter: options.canFilter ?? true,
});

export const NRQL_FIELDS: NrqlField[] = [
    createNrqlField('duration', 'Duration', 'numeric', { canFacet: false }),
    createNrqlField('response.status', 'Response Status', 'string'),
    createNrqlField('request.uri', 'Request URI', 'string'),
    createNrqlField('request.method', 'Request Method', 'string'),
    createNrqlField('name', 'Name', 'string', { canSearch: false}),
    createNrqlField('appName', 'Application', 'string', { canSearch: false, canFilter: false }),
];

// Derived constants from NRQL_FIELDS
export const SEARCH_FIELDS = NRQL_FIELDS.filter(f => f.canSearch).map(f => ({
    value: f.name,
    label: f.label
}));
export const FILTER_FIELDS = NRQL_FIELDS.map(f => ({ value: f.name, label: f.label }));
export const FACET_OPTIONS: { value: FacetOption; label: string }[] = [
    { value: 'none', label: 'No Facet' },
    ...NRQL_FIELDS.filter(f => f.canFacet).map(f => ({ value: f.name, label: f.label })),
];

// Helper function to get aggregation config by type
export function getAggregationConfig(type: AggregationType): AggregationConfig | undefined {
    return AGGREGATION_TYPES.find(a => a.value === type);
}

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
