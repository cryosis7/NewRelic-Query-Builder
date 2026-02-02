# Data - Query Presets

This folder contains pre-configured query combinations that users can quickly apply.

## Purpose

Presets provide common query configurations that can be applied with a single click:
- Common monitoring scenarios (error rates, latency, throughput)
- Frequently used metric combinations
- Standard time periods and facets

---

## File: `presets.ts`

Presets are defined as an array of partial `QueryState` objects:

```ts
import type { QueryState, MetricQueryItem } from '../types/query';
import { createMetricItem } from '../lib/buildNrqlQuery';

export interface Preset {
  id: string;
  label: string;
  description: string;
  state: Partial<QueryState>;
}

export const PRESETS: Preset[] = [
  {
    id: 'error-rate',
    label: 'Error Rate',
    description: 'Count of 4xx and 5xx responses',
    state: {
      metricItems: [
        createMetricItem('response.status', 'count'),
      ],
      facet: 'response.status',
      timePeriod: { mode: 'relative', relative: '1h ago' },
    },
  },
  {
    id: 'latency-p95',
    label: 'P95 Latency',
    description: '95th percentile response time by endpoint',
    state: {
      metricItems: [
        {
          ...createMetricItem('duration', 'p95'),
          filters: [],
        },
      ],
      facet: 'request.uri',
      timePeriod: { mode: 'relative', relative: '3h ago' },
      useTimeseries: true,
    },
  },
  // ... more presets
];
```

---

## Preset Structure

### Required Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Unique identifier (kebab-case) |
| `label` | `string` | Display name in UI |
| `description` | `string` | Tooltip/help text |
| `state` | `Partial<QueryState>` | State values to apply |

### State Field Options

Presets use `Partial<QueryState>`, meaning all fields are optional. Common fields to include:

- `applications`: Which GTM apps to query
- `environment`: Which environment
- `metricItems`: Metrics to SELECT
- `timePeriod`: Time range
- `facet`: Field to group by
- `useTimeseries`: Whether to use TIMESERIES
- `excludeHealthChecks`: Whether to filter out health checks

**Note**: Only include fields you want to change. Omitted fields keep their current values.

---

## How Presets Are Applied

Presets are applied via the `applyPresetAtom` action atom:

```ts
// In atoms/actions.ts
export const applyPresetAtom = atom(
  null,
  (get, set, preset: Partial<QueryState>) => {
    if (preset.applications !== undefined) set(applicationsAtom, preset.applications);
    if (preset.environment !== undefined) set(environmentAtom, preset.environment);
    if (preset.metricItems !== undefined) set(metricItemsAtom, preset.metricItems);
    if (preset.timePeriod !== undefined) set(timePeriodAtom, preset.timePeriod);
    // ... other fields
  }
);

// In components
import { useSetAtom } from 'jotai';
import { applyPresetAtom } from '../atoms';
import { PRESETS } from '../data/presets';

const applyPreset = useSetAtom(applyPresetAtom);

const handlePresetClick = (presetId: string) => {
  const preset = PRESETS.find(p => p.id === presetId);
  if (preset) {
    applyPreset(preset.state);
  }
};
```

---

## Creating New Presets

When adding a new preset:

1. Give it a unique `id` (kebab-case)
2. Write a clear `label` (shown in UI)
3. Add a helpful `description` (shows as tooltip)
4. Use factory functions like `createMetricItem()` for consistent structure
5. Only include state fields that should change
6. Test the preset in the UI

### Example: Adding a Throughput Preset

```ts
{
  id: 'throughput',
  label: 'Throughput',
  description: 'Request count by HTTP method',
  state: {
    metricItems: [
      createMetricItem('request.uri', 'count'),
    ],
    facet: 'http.method',
    timePeriod: { mode: 'relative', relative: '30m ago' },
    useTimeseries: true,
    excludeHealthChecks: true,
  },
}
```

---

## Common Preset Patterns

### Error Monitoring

```ts
{
  id: 'errors-4xx-5xx',
  label: '4xx/5xx Errors',
  description: 'Client and server errors over time',
  state: {
    metricItems: [
      {
        ...createMetricItem('response.status', 'count'),
        filters: [
          { id: '1', field: 'response.status', operator: 'LIKE', value: '4%' },
          { id: '2', field: 'response.status', operator: 'LIKE', value: '5%' },
        ],
      },
    ],
    facet: 'response.status',
    useTimeseries: true,
  },
}
```

### Performance Monitoring

```ts
{
  id: 'slow-endpoints',
  label: 'Slow Endpoints',
  description: 'Average duration by endpoint',
  state: {
    metricItems: [
      createMetricItem('duration', 'average'),
    ],
    facet: 'request.uri',
    timePeriod: { mode: 'relative', relative: '1h ago' },
    excludeHealthChecks: true,
  },
}
```

---

## Do

- Use factory functions (`createMetricItem`) for consistency
- Give presets descriptive labels and helpful descriptions
- Use kebab-case for preset IDs
- Only include state fields that should change
- Test presets after adding them
- Keep preset count reasonable (5-10 is good)

## Don't

- Don't hardcode metric items - use `createMetricItem()`
- Don't include all state fields - only what needs to change
- Don't use spaces or special characters in IDs
- Don't forget to add the preset to the `PRESETS` array
- Don't create too many presets - keep it focused on common use cases
