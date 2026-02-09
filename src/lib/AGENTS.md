# Lib - Pure Business Logic

Stateless, deterministic functions with no React or Jotai dependencies. Two files:

## Files

### `buildNrqlQuery.ts`

NRQL query generation and factory functions.

**Exports:**
```ts
buildNrqlQuery(state: QueryState): string       // Main: state → NRQL string
createMetricItem(field, aggregationType): MetricQueryItem
createMetricFilter(field?: string): MetricFilter // field defaults to 'duration'; operator auto-set by dataType
getDefaultTimePeriod(): TimePeriod               // { mode: 'relative', relative: '3h ago' }
getInitialState(): QueryState                    // Full default state for reset
generateId(): string                             // crypto.randomUUID() with fallback
```

### `dateTimeUtils.ts`

Date/time parsing utilities for the absolute time period mode.

**Exports:**
```ts
parseDateTime(value: string): { date: string; time: string }
formatDateTime(date: string, time: string): string
parseDateStringToDate(date: string): Date | undefined
formatDateToString(date: Date | null | undefined): string
```

## Key Logic

### Config-Driven Aggregation

SELECT clauses use `nrqlTemplate` from `AGGREGATION_TYPES`:
```ts
const config = getAggregationConfig(item.aggregationType);
config.nrqlTemplate.replace('{field}', item.field)
// 'average({field})' → 'average(duration)'
// 'percentile({field}, 95)' → 'percentile(duration, 95)'
```

### Filter-Aware SELECT

When all metrics share the same filters, filters are lifted to a global WHERE clause. When filters differ, each metric is wrapped in `filter()`:
```sql
-- Shared filters → global WHERE
SELECT count(*), average(duration) WHERE response.status = 200

-- Different filters → per-metric filter()
SELECT filter(count(*), WHERE response.status LIKE '4%'), filter(count(*), WHERE response.status LIKE '5%')
```

### Smart Status Code Filtering

`response.status` filters are parsed intelligently:
- Exact: `404` → `response.status = 404`
- Multiple: `404, 503` → `response.status IN (404, 503)`
- Fuzzy: `4xx` → `response.status LIKE '4%'`
- Mixed: combined with `OR`

### Filter Negation

When `MetricFilter.negated` is true, operators flip:
- `=` → `!=`, `>` → `<=`, `>=` → `<`, `<` → `>=`, `<=` → `>`
- `LIKE` → `NOT LIKE`, `IN` → `NOT IN`

### Path Exclusions

- `excludeHealthChecks` → `request.uri NOT IN ('/ping', '/secureping', ...)`
- `excludeBulkEndpoint` → `request.uri NOT IN ('/accountsV2/bulk')`
- Both true → merged into single `NOT IN` clause

### Factory Function Behavior

`createMetricFilter(field?)`:
- `field` defaults to `'duration'`
- Auto-selects operator based on field dataType: string → `=`, numeric → `>`
- Sets `negated: false`, `value: ''`

`createMetricItem(field, aggregationType)`:
- Normalizes aggregation: string fields always get `'count'` (via `normalizeAggregationForMetric`)

## Testing

Tests use a `createTestState()` helper for minimal boilerplate:
```ts
function createTestState(overrides: Partial<QueryState> = {}): QueryState {
  return { ...getInitialState(), ...overrides };
}
```

```bash
npm run test -- src/lib/buildNrqlQuery.test.ts
npm run test -- src/lib/dateTimeUtils.test.ts
```

## Rules

- No side effects, no external state, no async
- Same inputs → same outputs always
- Import types from `../types/query`
- Don't import React or Jotai
