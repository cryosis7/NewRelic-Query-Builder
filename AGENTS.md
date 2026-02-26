# NR-Query-Builder Agent Instructions

React + TypeScript + Vite app for building New Relic NRQL queries targeting Global Tax Mapper (GTM) applications. Uses **@xero/xui** design system and **Jotai** for state management.

## Build and Test

```bash
npm run dev        # Dev server (localhost:5173)
npm run test   # Run unit tests (always run after changes)
npm run test:e2e   # Run Playwright E2E tests
npm run lint       # Lint
npm run build      # Build
```

## Architecture

### Data Flow

```
User Interaction → Component → useAtom(primitiveAtom) → State Update
                                         ↓
                              nrqlQueryAtom (derived)
                                         ↓
                              buildNrqlQuery(QueryState)
                                         ↓
                              NRQL Query String → QueryPreview
```

### Layer Responsibilities

| Layer | Location | Responsibility |
|-------|----------|----------------|
| **Components** | `src/components/` | UI rendering via XUI, atom consumption |
| **Atoms** | `src/atoms/` | Primitives, derived, actions, CRUD atoms |
| **Pure Functions** | `src/lib/` | Stateless NRQL generation, date/time utils |
| **Types** | `src/types/query.ts` | All types, interfaces, constants, helpers |
| **Presets** | `src/data/presets.ts` | Pre-configured `QueryPreset` definitions |
| **E2E** | `e2e/` | Playwright browser tests |

## Project Structure

```
src/
├── atoms/
│   ├── index.ts              # Barrel export
│   ├── primitives.ts         # Base state atoms
│   ├── derived.ts            # nrqlQueryAtom, date/time atoms
│   ├── derived.test.ts       # Tests for derived atoms
│   ├── actions.ts            # Write-only action atoms
│   └── metricItems.ts        # CRUD atoms for metric items + filters
├── components/
│   ├── index.ts              # Barrel export
│   ├── layout/               # Flex, FlexItem layout components
│   │   └── index.ts
│   ├── ApplicationSelector.tsx / .test.tsx
│   ├── EnvironmentSelector.tsx / .test.tsx
│   ├── MetricQueryBuilder.tsx / .test.tsx
│   ├── MetricItem.tsx / .test.tsx
│   ├── MetricTypeSelector.tsx / .test.tsx
│   ├── AggregationTypeSelector.tsx / .test.tsx
│   ├── FilterRow.tsx / .test.tsx
│   ├── TimePeriodSelector.tsx / .test.tsx
│   ├── DateTimeInput.tsx         # Composite: XUIDateInput + TimePicker
│   ├── TimePicker.tsx            # Time input wrapper
│   ├── QueryOptions.tsx / .test.tsx
│   ├── QueryPreview.tsx / .test.tsx
│   ├── FacetSelector.tsx / .test.tsx
│   ├── SectionRule.tsx / .test.tsx
│   └── CommonQueriesPanelSection.tsx / .test.tsx
├── lib/
│   ├── buildNrqlQuery.ts     # NRQL generation + factory functions
│   ├── buildNrqlQuery.test.ts
│   ├── dateTimeUtils.ts      # Date/time parsing utilities
│   └── dateTimeUtils.test.ts
├── types/
│   └── query.ts              # All types, constants, derived constants, helpers
├── data/
│   └── presets.ts            # QueryPreset definitions (3 presets)
├── test/
│   └── setup.ts              # Vitest setup (@testing-library/jest-dom)
├── App.tsx                   # Main app with Jotai Provider
└── main.tsx                  # Entry point
e2e/                          # Playwright E2E tests (8 spec files)
```

## Project Conventions

## Development Workflow

Modifications or minor changes do not need to follow this flow, however large refactors or new feature do.

Test Driven Development practices should be followed.
This process is for large refactors or developing new features and MUST be followed in this order:

- Explore the existing structure and how the new feature will be integrated
- Draw on any relevant knowledge in your skills or tool set.
- Plan the feature development work, including unit/e2e tests that codify the requirements
- (RED) Delegate agents to write e2e and unit tests; parallelise these if possible.
- (GREEN) Delegate an agent to write the minimum, simplest code necessary to make the test pass. The focus is on passing the test, not perfect implementation.
- (REFACTOR) Delegate an agent to clean up and restructure the code, improving readability, structure, and removing duplication while ensuring all tests still pass.
- Run all tests, including unit tests with coverage and linting. Code coverage must meet 100% branch coverage
- Review the implementation against the requirements and repeat as necessary.

### Critical Rules

1. **Always use XUI components** — never raw HTML form elements (`<input>`, `<button>`, `<select>`)
2. **Tests required** — update tests when modifying code, run `npm run test` after changes
3. **Jotai atoms for state** — state lives in `src/atoms/`, components consume via `useAtom`
4. **Use constants** — import from `src/types/query.ts`, never hardcode values
5. **Barrel exports** — import from `src/atoms/index.ts` and `src/components/index.ts`

## Domain Knowledge

### GTM Applications

Three apps defined in `APPLICATIONS` constant: API, BFF, Integrator API.
NRQL app names: `{app}-{env}` (e.g., `global-tax-mapper-api-prod`)

### Environments

Two environments: `prod` (Production), `uat` (UAT). Defined in `ENVIRONMENTS` constant.

### NRQL Fields (`NRQL_FIELDS` array)

| Field | Data Type | Can Facet | Can Search | Can Filter |
|-------|-----------|-----------|------------|------------|
| `duration` | numeric | ✗ | ✓ | ✓ |
| `response.status` | string | ✓ | ✓ | ✓ |
| `request.uri` | string | ✓ | ✓ | ✓ |
| `request.method` | string | ✓ | ✓ | ✓ |
| `name` | string | ✓ | ✗ | ✓ |
| `appName` | string | ✓ | ✗ | ✗ |

Derived constants: `SEARCH_FIELDS`, `FILTER_FIELDS`, `FACET_OPTIONS` (auto-generated from `NRQL_FIELDS`).

### Aggregation Types (5 total, config-driven)

| Type | Template | Numeric Only |
|------|----------|-------------|
| `average` | `average({field})` | ✓ |
| `count` | `count({field})` | ✗ |
| `p95` | `percentile({field}, 95)` | ✓ |
| `uniques` | `uniques({field})` | ✗ |
| `median` | `median({field})` | ✓ |

### Filter Behavior

- Filters with empty values are ignored
- When all metrics share the same filters, they're lifted to global WHERE
- When filters differ, each metric uses `filter()` wrapper
- Status codes: exact (`404`), multiple (`404, 503`), fuzzy (`4xx` → `LIKE '4%'`)
- Filters support **negation** (`negated: boolean`): `=` → `!=`, `>` → `<=`, `LIKE` → `NOT LIKE`, `IN` → `NOT IN`
- Operators are type-dependent: numeric fields get `>`, `>=`, `<`, `<=`, `=`; string fields get `=`, `IN`

### Path Exclusions

- `HEALTH_CHECK_PATHS`: `/ping`, `/secureping`, `/health`, `/healthcheck`, `/secure-ping`, `/ready`
- `BULK_ENDPOINT_PATHS`: `/accountsV2/bulk` (separate constant, controlled by `excludeBulkEndpoint`)
- Both use `request.uri NOT IN (...)` syntax

---
