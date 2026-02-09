# Data - Query Presets

Pre-configured query combinations applied with a single click via `applyPresetAtom`.

## File: `presets.ts`

```ts
export interface QueryPreset {
  id: string;               // Unique kebab-case ID
  name: string;             // Display name in UI
  description: string;      // Tooltip text
  state: Partial<QueryState>; // Fields to apply (omitted fields keep current values)
}

export const QUERY_PRESETS: QueryPreset[] = [ ... ];
```

## Current Presets (3)

| ID | Name | What It Does |
|----|------|-------------|
| `api-throughput-3h` | API Throughput - Last 3 Hours | Total + 2xx/4xx/5xx counts, TIMESERIES, no facet |
| `api-latency-3h` | API Latency - Last 3 Hours | Average duration, TIMESERIES, health+bulk excluded |
| `api-error-count` | API Error Count | 4xx + 5xx counts, facet by `request.uri`, no TIMESERIES |

## Preset State Fields

Presets use `Partial<QueryState>` — only include fields that should change:
- `applications`, `environment`, `metricItems`, `timePeriod`
- `excludeHealthChecks`, `excludeBulkEndpoint`
- `useTimeseries`, `facet`

## How Presets Are Applied

```tsx
// In components (CommonQueriesPanelSection)
import { useSetAtom } from 'jotai';
import { applyPresetAtom } from '../atoms';
import { QUERY_PRESETS } from '../data/presets';

const applyPreset = useSetAtom(applyPresetAtom);
const preset = QUERY_PRESETS.find(p => p.id === presetId);
if (preset) applyPreset(preset.state);
```

## Adding a Preset

1. Define inline metric items with `id`, `field`, `aggregationType`, `filters` (use explicit IDs like `'preset-my-total'`)
2. Include `negated: false` on all filter objects
3. Include `excludeBulkEndpoint` in state
4. Add to `QUERY_PRESETS` array

## Rules

- Use kebab-case IDs
- Only include state fields that should change
- Inline metric items directly (don't use `createMetricItem()` — presets define fixed IDs)
