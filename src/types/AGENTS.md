# Types - TypeScript Types & Domain Constants

Single source of truth for all TypeScript types, interfaces, domain constants, and helpers. Everything lives in `query.ts`.

---

## Core Types

| Type | Description | Values |
|------|-------------|--------|
| `Application` | GTM applications | `'global-tax-mapper-api'` \| `'global-tax-mapper-bff'` \| `'global-tax-mapper-integrator-api'` |
| `Environment` | Deployment environments | `'prod'` \| `'uat'` |
| `AggregationType` | Derived from `AGGREGATION_TYPES[number]['value']` | `'average'` \| `'count'` \| `'p95'` \| `'uniques'` \| `'median'` |
| `FacetOption` | `'none'` \| any field name | `'none'` \| `string` |
| `TimePeriodMode` | Time range mode | `'absolute'` \| `'relative'` |
| `NumericOperator` | Filter operators for numeric fields | `'>'` \| `'>='` \| `'<'` \| `'<='` \| `'='` |
| `StringOperator` | Filter operators for string fields | `'='` \| `'IN'` |
| `MetricFilterOperator` | Union of numeric + string operators | `NumericOperator \| StringOperator` |

## Interfaces

```ts
interface NrqlField {
  name: string;           // NRQL field name (e.g., 'duration')
  label: string;          // Display label
  dataType: 'numeric' | 'string';
  canFacet: boolean;
  canSearch: boolean;
  canFilter: boolean;
}

interface AggregationConfig {
  value: string;
  label: string;
  nrqlTemplate: string;           // e.g., 'average({field})', 'percentile({field}, 95)'
  isNumericalAggregator?: boolean; // true = only works with numeric fields
}

interface QueryState {
  applications: Application[];
  environment: Environment;
  metricItems: MetricQueryItem[];
  timePeriod: TimePeriod;
  excludeHealthChecks: boolean;
  excludeBulkEndpoint: boolean;
  useTimeseries: boolean;
  facet: FacetOption;
}

interface MetricQueryItem {
  id: string;
  field: string;
  aggregationType: AggregationType;
  filters: MetricFilter[];
}

interface MetricFilter {
  id: string;
  field: string;
  operator: MetricFilterOperator;
  value: string;
  negated: boolean;              // true flips operator: = → !=, > → <=, LIKE → NOT LIKE, IN → NOT IN
}

interface TimePeriod {
  mode: TimePeriodMode;
  since?: string;    // ISO datetime string (absolute mode)
  until?: string;    // ISO datetime string (absolute mode)
  relative: string;  // e.g., '3h ago'
}
```

## Constants

### `APPLICATIONS`
Array of `{ value: Application; label: string }` — 3 GTM apps.

### `ENVIRONMENTS`
Array of `{ value: Environment; label: string }` — `prod` (Production), `uat` (UAT).

### `NRQL_FIELDS` (array, not Record)

```ts
const NRQL_FIELDS: NrqlField[] = [
  { name: 'duration',        label: 'Duration',        dataType: 'numeric', canFacet: false, canSearch: true,  canFilter: true },
  { name: 'response.status', label: 'Response Status', dataType: 'string',  canFacet: true,  canSearch: true,  canFilter: true },
  { name: 'request.uri',     label: 'Request URI',     dataType: 'string',  canFacet: true,  canSearch: true,  canFilter: true },
  { name: 'request.method',  label: 'Request Method',  dataType: 'string',  canFacet: true,  canSearch: true,  canFilter: true },
  { name: 'name',            label: 'Name',            dataType: 'string',  canFacet: true,  canSearch: false, canFilter: true },
  { name: 'appName',         label: 'Application',     dataType: 'string',  canFacet: true,  canSearch: false, canFilter: false },
];
```

### `AGGREGATION_TYPES`
Array of `AggregationConfig` — 5 types with `nrqlTemplate` for config-driven SELECT generation.

### Derived Constants (auto-generated from `NRQL_FIELDS`)
- `SEARCH_FIELDS` — fields where `canSearch: true`
- `FILTER_FIELDS` — all fields as `{ value, label }`
- `FACET_OPTIONS` — `[{ value: 'none', label: 'No Facet' }, ...canFacet fields]`

### Operator Constants
- `NUMERIC_OPERATORS` — `{ value: NumericOperator; label: string }[]`
- `STRING_OPERATORS` — `{ value: StringOperator; label: string }[]`

### Path Exclusion Constants
- `HEALTH_CHECK_PATHS` — 6 paths (`/ping`, `/secureping`, `/health`, `/healthcheck`, `/secure-ping`, `/ready`)
- `BULK_ENDPOINT_PATHS` — `['/accountsV2/bulk']` (separate constant, separate checkbox)

## Helper Functions

```ts
getAggregationConfig(type: AggregationType): AggregationConfig | undefined
getFieldByName(fieldName: string): NrqlField | undefined
getOperatorsForField(fieldName: string): { value: MetricFilterOperator; label: string }[]
```

## Rules

- Import types with `import type { ... }` for interfaces
- Use string literal unions, never `enum`
- Use constants — never hardcode app names, fields, or environments
- Add new types to `query.ts` — don't scatter types across files
