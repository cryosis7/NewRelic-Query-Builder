# Lib - Pure Business Logic Functions

This folder contains all pure, testable business logic functions. These functions have no side effects and produce deterministic output.

## Purpose

The `lib/` folder houses stateless business logic that:
- Generates NRQL queries from application state
- Creates domain objects (metric items, filters)
- Performs data transformations and validations
- Contains no React, no state management, no side effects

---

## Key Exports

### `buildNrqlQuery(state: QueryState): string`

Main function that generates NRQL query strings from application state.

### `createMetricItem(field: string, aggregationType: AggregationType): MetricQueryItem`

Factory function for creating metric query items with proper defaults.

### `createMetricFilter(field: string, value: string): MetricFilter`

Factory function for creating filter objects.

---

## Pure Function Pattern

All business logic must be pure functions: no side effects, deterministic output based solely on inputs.

```ts
// buildNrqlQuery.ts

// ✅ Pure function - no side effects, deterministic output
export function buildNrqlQuery(state: QueryState): string {
  // Validation
  if (state.applications.length === 0) {
    return '-- Select at least one application';
  }
  
  // Build query parts
  const appNames = state.applications.map(app => `${app}-${state.environment}`);
  const fromClause = 'FROM Transaction';
  const whereClause = buildWhereClause(state);
  const selectClause = buildSelectClause(state.metricItems);
  
  // Assemble query
  const queryParts = [
    fromClause,
    selectClause,
    whereClause,
    // ... other clauses
  ];
  
  return queryParts.join('\n');
}

// ✅ Helper functions are also pure
function buildWhereClause(state: QueryState): string {
  const conditions: string[] = [];
  
  const appNames = state.applications
    .map(app => `'${app}-${state.environment}'`)
    .join(', ');
  conditions.push(`appName IN (${appNames})`);
  
  if (state.excludeHealthChecks) {
    conditions.push(buildHealthCheckExclusion());
  }
  
  return `WHERE ${conditions.join(' AND ')}`;
}
```

**Guidelines:**
- Function output depends only on inputs
- No external state access
- No side effects (no mutations, no I/O)
- No async operations
- Deterministic: same inputs always produce same outputs

---

## Factory Function Pattern

Factory functions create domain objects with proper initialization and defaults.

```ts
// ✅ Factory functions for creating domain objects
export function createMetricItem(
  field: string, 
  aggregationType: AggregationType
): MetricQueryItem {
  return {
    id: generateId(),
    field,
    aggregationType: normalizeAggregationForMetric(field, aggregationType),
    filters: [],
  };
}

export function createMetricFilter(field: string, value: string): MetricFilter {
  return {
    id: generateId(),
    field,
    operator: '=',
    value,
  };
}

// Helper for generating unique IDs
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
```

**Guidelines:**
- Initialize all required fields
- Apply sensible defaults
- Use helper functions for common operations (e.g., ID generation)
- Return properly typed objects

---

## Testing Pure Functions

Pure functions are easy to test because they have no dependencies.

### Test Pattern

```ts
import { buildNrqlQuery, createMetricItem } from './buildNrqlQuery';
import type { QueryState } from '../types/query';

// ✅ Helper function to create test state
function createTestState(overrides: Partial<QueryState> = {}): QueryState {
  return {
    applications: ['global-tax-mapper-api'],
    environment: 'prod',
    metricItems: [createMetricItem('duration', 'count')],
    timePeriod: { mode: 'relative', relative: '3h ago' },
    excludeHealthChecks: true,
    useTimeseries: true,
    facet: 'request.uri',
    ...overrides,
  };
}

describe('buildNrqlQuery', () => {
  it('generates basic query', () => {
    const state = createTestState();
    const result = buildNrqlQuery(state);
    
    expect(result).toContain('FROM Transaction');
    expect(result).toContain("appName IN ('global-tax-mapper-api-prod')");
    expect(result).toContain('count(*)');
  });

  it('handles multiple applications', () => {
    const state = createTestState({
      applications: ['global-tax-mapper-api', 'global-tax-mapper-bff'],
    });
    const result = buildNrqlQuery(state);
    
    expect(result).toContain('global-tax-mapper-api-prod');
    expect(result).toContain('global-tax-mapper-bff-prod');
  });

  it('returns error message for empty applications', () => {
    const state = createTestState({ applications: [] });
    const result = buildNrqlQuery(state);
    
    expect(result).toBe('-- Select at least one application');
  });
});

describe('createMetricItem', () => {
  it('creates metric item with defaults', () => {
    const item = createMetricItem('duration', 'count');
    
    expect(item.field).toBe('duration');
    expect(item.aggregationType).toBe('count');
    expect(item.filters).toEqual([]);
    expect(item.id).toBeDefined();
  });
});
```

### Testing Guidelines

- Use helper functions like `createTestState()` to reduce boilerplate
- Test edge cases (empty arrays, null values, boundary conditions)
- Test each function in isolation
- Use descriptive test names that explain the scenario
- Assert on specific output values, not just truthiness

### Running Tests

```bash
# Run all lib tests
npm run test -- src/lib

# Run single test file
npm run test:run -- src/lib/buildNrqlQuery.test.ts

# Type check single file
npx tsc --noEmit src/lib/buildNrqlQuery.ts
```

---

## Do

- Keep business logic in pure functions
- Make functions deterministic (same inputs → same outputs)
- Use factory functions for creating domain objects
- Import types from `../types/query`
- Write comprehensive tests for all functions
- Use helper functions to reduce test boilerplate
- Test edge cases and error conditions

## Don't

- Don't access external state (React context, Jotai atoms, etc.)
- Don't perform side effects (mutations, I/O, API calls)
- Don't use async functions (unless absolutely necessary)
- Don't import React or Jotai in lib files
- Don't skip tests - pure functions are easy to test
