# Types - TypeScript Types & Domain Constants

This folder contains all TypeScript types, interfaces, and domain constants used throughout the application.

## Purpose

The `types/` folder is the single source of truth for:
- TypeScript type definitions
- Domain constants (applications, environments, fields)
- Enum-like values
- Shared interfaces

---

## Key File: `query.ts`

All types and constants are defined in `query.ts`:

```ts
// Core domain types
export type Application = 'global-tax-mapper-api' | 'global-tax-mapper-bff' | 'global-tax-mapper-integrator-api';
export type Environment = 'prod' | 'preprod' | 'perf';
export type AggregationType = 'count' | 'average' | 'p95';

// Domain objects
export interface QueryState {
  applications: Application[];
  environment: Environment;
  metricItems: MetricQueryItem[];
  timePeriod: TimePeriod;
  excludeHealthChecks: boolean;
  useTimeseries: boolean;
  facet: string;
}

export interface MetricQueryItem {
  id: string;
  field: string;
  aggregationType: AggregationType;
  filters: MetricFilter[];
}

// Constants
export const APPLICATIONS: Array<{ value: Application; label: string }> = [
  { value: 'global-tax-mapper-api', label: 'API' },
  { value: 'global-tax-mapper-bff', label: 'BFF' },
  { value: 'global-tax-mapper-integrator-api', label: 'Integrator API' },
];

export const NRQL_FIELDS: Record<string, FieldDefinition> = {
  duration: { type: 'numeric', canAggregate: true, canFacet: false },
  'response.status': { type: 'string', canAggregate: false, canFacet: true },
  'request.uri': { type: 'string', canAggregate: false, canFacet: true },
  // ...
};
```

---

## Type Exports

### Core Domain Types

| Type | Description | Values |
|------|-------------|--------|
| `Application` | GTM applications | `'global-tax-mapper-api'` \| `'global-tax-mapper-bff'` \| `'global-tax-mapper-integrator-api'` |
| `Environment` | Deployment environments | `'prod'` \| `'preprod'` \| `'perf'` |
| `AggregationType` | NRQL aggregation functions | `'count'` \| `'average'` \| `'p95'` |

### Interfaces

| Interface | Purpose |
|-----------|---------|
| `QueryState` | Complete application state shape |
| `MetricQueryItem` | Single metric with aggregation and filters |
| `MetricFilter` | Filter condition for a metric |
| `TimePeriod` | Time range specification (relative or absolute) |
| `FieldDefinition` | Metadata about NRQL fields |

---

## Constants to Use

Always use these constants instead of hardcoding values:

### `APPLICATIONS`

Array of application definitions with display labels:

```ts
export const APPLICATIONS: Array<{ value: Application; label: string }> = [
  { value: 'global-tax-mapper-api', label: 'API' },
  { value: 'global-tax-mapper-bff', label: 'BFF' },
  { value: 'global-tax-mapper-integrator-api', label: 'Integrator API' },
];

// ✅ Use in components
{APPLICATIONS.map(({ value, label }) => (
  <option key={value} value={value}>{label}</option>
))}

// ❌ Don't hardcode
<option value="global-tax-mapper-api">API</option>
```

### `ENVIRONMENTS`

Array of environment definitions:

```ts
export const ENVIRONMENTS: Array<{ value: Environment; label: string }> = [
  { value: 'prod', label: 'Production' },
  { value: 'preprod', label: 'Pre-Production' },
  { value: 'perf', label: 'Performance' },
];
```

### `NRQL_FIELDS`

Field definitions with metadata:

```ts
export interface FieldDefinition {
  type: 'numeric' | 'string';
  canAggregate: boolean;
  canFacet: boolean;
  label?: string;
}

export const NRQL_FIELDS: Record<string, FieldDefinition> = {
  duration: { type: 'numeric', canAggregate: true, canFacet: false, label: 'Duration' },
  'response.status': { type: 'string', canAggregate: false, canFacet: true, label: 'Status Code' },
  'request.uri': { type: 'string', canAggregate: false, canFacet: true, label: 'Request URI' },
  'http.method': { type: 'string', canAggregate: false, canFacet: true, label: 'HTTP Method' },
  name: { type: 'string', canAggregate: false, canFacet: true, label: 'Transaction Name' },
};

// ✅ Use to validate aggregations
const field = NRQL_FIELDS[fieldName];
if (field.canAggregate) {
  // Show aggregation options
}

// ✅ Use for field labels
const label = NRQL_FIELDS[fieldName]?.label || fieldName;
```

### `HEALTH_CHECK_PATHS`

Paths to exclude when filtering health checks:

```ts
export const HEALTH_CHECK_PATHS = [
  '/ping',
  '/secureping',
  '/health',
  '/healthcheck',
  '/secure-ping',
  '/ready',
  '/accountsV2/bulk',
];

// ✅ Use in query building
if (state.excludeHealthChecks) {
  const exclusion = HEALTH_CHECK_PATHS
    .map(path => `request.uri NOT LIKE '%${path}%'`)
    .join(' AND ');
}
```

---

## Usage Patterns

### Importing Types

```ts
// ✅ Import types and constants together
import type { Application, Environment, QueryState } from '../types/query';
import { APPLICATIONS, NRQL_FIELDS } from '../types/query';

// ✅ Type-only imports for interfaces
import type { MetricQueryItem } from '../types/query';
```

### Type Guards

When you need runtime type checking:

```ts
export function isNumericField(field: string): boolean {
  return NRQL_FIELDS[field]?.type === 'numeric';
}

export function canAggregateField(field: string): boolean {
  return NRQL_FIELDS[field]?.canAggregate ?? false;
}
```

### Extending Types

If you need to add new types, add them to `query.ts`:

```ts
// New type in query.ts
export type ChartType = 'line' | 'bar' | 'pie';

export interface ChartConfig {
  type: ChartType;
  colors: string[];
}
```

---

## Do

- Use constants from this file (e.g., `APPLICATIONS`, `NRQL_FIELDS`)
- Import types with `import type { ... }` for interfaces
- Use string literal unions for enum-like types
- Add new types to `query.ts`
- Document complex types with JSDoc comments
- Use `Record<K, V>` for object types with dynamic keys

## Don't

- Don't hardcode application names - use `APPLICATIONS` constant
- Don't hardcode field definitions - use `NRQL_FIELDS` constant
- Don't hardcode environment names - use `ENVIRONMENTS` constant
- Don't create separate files for types unless they're very large
- Don't use `enum` - prefer string literal unions
- Don't add types to other folders - keep them here

---

## GTM Domain Knowledge

### Applications

Three applications in the Global Tax Mapper (GTM) system:
- `global-tax-mapper-api` (API): Main REST API
- `global-tax-mapper-bff` (BFF): Backend for Frontend
- `global-tax-mapper-integrator-api` (Integrator API): Integration service

In New Relic, app names combine with environment: `{app}-{env}` (e.g., `global-tax-mapper-api-prod`)

### NRQL Fields

| Field | Data Type | Can Aggregate | Can Facet |
|-------|-----------|---------------|-----------|
| `duration` | numeric | ✓ | ✗ |
| `response.status` | string | ✗ | ✓ |
| `request.uri` | string | ✗ | ✓ |
| `http.method` | string | ✗ | ✓ |
| `name` | string | ✗ | ✓ |

### Aggregation Types

| Type | Description | Numeric Only |
|------|-------------|--------------|
| `count` | Total count | No (works for all) |
| `average` | Average value | Yes |
| `p95` | 95th percentile | Yes |
