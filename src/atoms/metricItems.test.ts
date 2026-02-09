import { createStore } from 'jotai';
import type { MetricQueryItem, MetricFilter } from '../types/query';
import {
  metricItemsAtom,
  addMetricItemAtom,
  updateMetricItemAtom,
  removeMetricItemAtom,
  addFilterAtom,
  updateFilterAtom,
  removeFilterAtom,
} from './index';

// Helper to build a MetricQueryItem with a known id
function makeItem(
  id: string,
  field = 'duration',
  aggregationType = 'average',
  filters: MetricFilter[] = [],
): MetricQueryItem {
  return { id, field, aggregationType, filters };
}

// Helper to build a MetricFilter with a known id
function makeFilter(
  id: string,
  field = 'duration',
  operator: MetricFilter['operator'] = '>',
  value = '',
  negated = false,
): MetricFilter {
  return { id, field, operator, value, negated };
}

describe('metricItemsAtom', () => {
  it('has a default value with one duration/average item', () => {
    const store = createStore();
    const items = store.get(metricItemsAtom);
    expect(items).toHaveLength(1);
    expect(items[0].field).toBe('duration');
    expect(items[0].aggregationType).toBe('average');
    expect(items[0].filters).toEqual([]);
  });
});

describe('addMetricItemAtom', () => {
  it('appends a new duration/average item', () => {
    const store = createStore();
    store.set(metricItemsAtom, [makeItem('item-1', 'duration', 'count')]);

    store.set(addMetricItemAtom);

    const items = store.get(metricItemsAtom);
    expect(items).toHaveLength(2);
    expect(items[0].id).toBe('item-1');
    expect(items[1].field).toBe('duration');
    expect(items[1].aggregationType).toBe('average');
  });
});

describe('updateMetricItemAtom', () => {
  it('updates the matching item and leaves others unchanged', () => {
    const store = createStore();
    store.set(metricItemsAtom, [
      makeItem('item-1', 'duration', 'average'),
      makeItem('item-2', 'duration', 'count'),
    ]);

    store.set(updateMetricItemAtom, {
      id: 'item-2',
      updates: { field: 'response.status', aggregationType: 'uniques' },
    });

    const items = store.get(metricItemsAtom);
    expect(items[0]).toEqual(makeItem('item-1', 'duration', 'average'));
    expect(items[1].field).toBe('response.status');
    expect(items[1].aggregationType).toBe('uniques');
  });
});

describe('removeMetricItemAtom', () => {
  it('removes the item with the given id', () => {
    const store = createStore();
    store.set(metricItemsAtom, [
      makeItem('item-1'),
      makeItem('item-2'),
      makeItem('item-3'),
    ]);

    store.set(removeMetricItemAtom, 'item-2');

    const items = store.get(metricItemsAtom);
    expect(items).toHaveLength(2);
    expect(items.map(i => i.id)).toEqual(['item-1', 'item-3']);
  });

  it('leaves the list unchanged when id does not exist', () => {
    const store = createStore();
    const original = [makeItem('item-1'), makeItem('item-2')];
    store.set(metricItemsAtom, original);

    store.set(removeMetricItemAtom, 'non-existent');

    expect(store.get(metricItemsAtom)).toEqual(original);
  });

  it('results in an empty list when the only item is removed', () => {
    const store = createStore();
    store.set(metricItemsAtom, [makeItem('only-item')]);

    store.set(removeMetricItemAtom, 'only-item');

    expect(store.get(metricItemsAtom)).toEqual([]);
  });
});

describe('addFilterAtom', () => {
  it('adds a filter with the default field (duration) when no field is specified', () => {
    const store = createStore();
    store.set(metricItemsAtom, [makeItem('item-1')]);

    store.set(addFilterAtom, { metricItemId: 'item-1' });

    const items = store.get(metricItemsAtom);
    expect(items[0].filters).toHaveLength(1);
    const filter = items[0].filters[0];
    expect(filter.field).toBe('duration');
    // duration is numeric, so default operator should be '>'
    expect(filter.operator).toBe('>');
    expect(filter.value).toBe('');
    expect(filter.negated).toBe(false);
  });

  it('adds a filter with a specified string field', () => {
    const store = createStore();
    store.set(metricItemsAtom, [makeItem('item-1')]);

    store.set(addFilterAtom, { metricItemId: 'item-1', field: 'response.status' });

    const items = store.get(metricItemsAtom);
    expect(items[0].filters).toHaveLength(1);
    const filter = items[0].filters[0];
    expect(filter.field).toBe('response.status');
    // response.status is a string field, so default operator should be '='
    expect(filter.operator).toBe('=');
  });

  it('appends to existing filters without overwriting them', () => {
    const store = createStore();
    const existingFilter = makeFilter('f-1', 'duration', '>', '100');
    store.set(metricItemsAtom, [makeItem('item-1', 'duration', 'average', [existingFilter])]);

    store.set(addFilterAtom, { metricItemId: 'item-1', field: 'request.uri' });

    const items = store.get(metricItemsAtom);
    expect(items[0].filters).toHaveLength(2);
    expect(items[0].filters[0]).toEqual(existingFilter);
    expect(items[0].filters[1].field).toBe('request.uri');
  });

  it('does not modify other metric items', () => {
    const store = createStore();
    store.set(metricItemsAtom, [makeItem('item-1'), makeItem('item-2')]);

    store.set(addFilterAtom, { metricItemId: 'item-1', field: 'name' });

    const items = store.get(metricItemsAtom);
    expect(items[0].filters).toHaveLength(1);
    expect(items[1].filters).toHaveLength(0);
  });

  it('does nothing when metricItemId does not match any item', () => {
    const store = createStore();
    store.set(metricItemsAtom, [makeItem('item-1')]);

    store.set(addFilterAtom, { metricItemId: 'non-existent' });

    expect(store.get(metricItemsAtom)[0].filters).toHaveLength(0);
  });
});

describe('updateFilterAtom', () => {
  it('updates the filter value without changing other properties', () => {
    const store = createStore();
    const filter = makeFilter('f-1', 'duration', '>', '');
    store.set(metricItemsAtom, [makeItem('item-1', 'duration', 'average', [filter])]);

    store.set(updateFilterAtom, {
      metricItemId: 'item-1',
      filterId: 'f-1',
      updates: { value: '500' },
    });

    const updated = store.get(metricItemsAtom)[0].filters[0];
    expect(updated.value).toBe('500');
    expect(updated.field).toBe('duration');
    expect(updated.operator).toBe('>');
  });

  it('updates the operator without resetting when the field does not change', () => {
    const store = createStore();
    const filter = makeFilter('f-1', 'duration', '>', '100');
    store.set(metricItemsAtom, [makeItem('item-1', 'duration', 'average', [filter])]);

    store.set(updateFilterAtom, {
      metricItemId: 'item-1',
      filterId: 'f-1',
      updates: { operator: '<=' },
    });

    const updated = store.get(metricItemsAtom)[0].filters[0];
    expect(updated.operator).toBe('<=');
    expect(updated.field).toBe('duration');
  });

  it('resets operator to "=" when field changes to a string type', () => {
    const store = createStore();
    // Start with numeric field and operator '>'
    const filter = makeFilter('f-1', 'duration', '>', '100');
    store.set(metricItemsAtom, [makeItem('item-1', 'duration', 'average', [filter])]);

    store.set(updateFilterAtom, {
      metricItemId: 'item-1',
      filterId: 'f-1',
      updates: { field: 'response.status' },
    });

    const updated = store.get(metricItemsAtom)[0].filters[0];
    expect(updated.field).toBe('response.status');
    expect(updated.operator).toBe('=');
  });

  it('resets operator to ">" when field changes to a numeric type', () => {
    const store = createStore();
    // Start with string field and operator '='
    const filter = makeFilter('f-1', 'response.status', '=', '200');
    store.set(metricItemsAtom, [makeItem('item-1', 'duration', 'average', [filter])]);

    store.set(updateFilterAtom, {
      metricItemId: 'item-1',
      filterId: 'f-1',
      updates: { field: 'duration' },
    });

    const updated = store.get(metricItemsAtom)[0].filters[0];
    expect(updated.field).toBe('duration');
    expect(updated.operator).toBe('>');
  });

  it('resets operator when changing from one string field to another string field', () => {
    const store = createStore();
    // Start with string field 'response.status' and operator 'IN'
    const filter = makeFilter('f-1', 'response.status', 'IN', '200,201');
    store.set(metricItemsAtom, [makeItem('item-1', 'duration', 'average', [filter])]);

    store.set(updateFilterAtom, {
      metricItemId: 'item-1',
      filterId: 'f-1',
      updates: { field: 'request.method' },
    });

    const updated = store.get(metricItemsAtom)[0].filters[0];
    expect(updated.field).toBe('request.method');
    // String field reset -> '='
    expect(updated.operator).toBe('=');
  });

  it('does NOT reset operator when field is set to its current value', () => {
    const store = createStore();
    const filter = makeFilter('f-1', 'duration', '<=', '100');
    store.set(metricItemsAtom, [makeItem('item-1', 'duration', 'average', [filter])]);

    store.set(updateFilterAtom, {
      metricItemId: 'item-1',
      filterId: 'f-1',
      updates: { field: 'duration' },
    });

    const updated = store.get(metricItemsAtom)[0].filters[0];
    // Field did not actually change, so operator should stay as-is
    expect(updated.operator).toBe('<=');
  });

  it('uses the provided operator when field does not change', () => {
    const store = createStore();
    const filter = makeFilter('f-1', 'response.status', '=', '200');
    store.set(metricItemsAtom, [makeItem('item-1', 'duration', 'average', [filter])]);

    store.set(updateFilterAtom, {
      metricItemId: 'item-1',
      filterId: 'f-1',
      updates: { operator: 'IN' },
    });

    const updated = store.get(metricItemsAtom)[0].filters[0];
    expect(updated.operator).toBe('IN');
  });

  it('applies field reset even when operator is also provided in the same update', () => {
    const store = createStore();
    // Numeric filter with operator '<'
    const filter = makeFilter('f-1', 'duration', '<', '100');
    store.set(metricItemsAtom, [makeItem('item-1', 'duration', 'average', [filter])]);

    // Change field to string AND provide an operator -- field change takes priority
    store.set(updateFilterAtom, {
      metricItemId: 'item-1',
      filterId: 'f-1',
      updates: { field: 'request.uri', operator: 'IN' },
    });

    const updated = store.get(metricItemsAtom)[0].filters[0];
    expect(updated.field).toBe('request.uri');
    // Operator reset to '=' because the field changed to a string type
    expect(updated.operator).toBe('=');
  });

  it('updates the negated flag', () => {
    const store = createStore();
    const filter = makeFilter('f-1', 'duration', '>', '100', false);
    store.set(metricItemsAtom, [makeItem('item-1', 'duration', 'average', [filter])]);

    store.set(updateFilterAtom, {
      metricItemId: 'item-1',
      filterId: 'f-1',
      updates: { negated: true },
    });

    const updated = store.get(metricItemsAtom)[0].filters[0];
    expect(updated.negated).toBe(true);
    // Other properties remain unchanged
    expect(updated.operator).toBe('>');
  });

  it('does not modify filters on non-matching metric items', () => {
    const store = createStore();
    const filter1 = makeFilter('f-1', 'duration', '>', '100');
    const filter2 = makeFilter('f-2', 'duration', '>', '200');
    store.set(metricItemsAtom, [
      makeItem('item-1', 'duration', 'average', [filter1]),
      makeItem('item-2', 'duration', 'average', [filter2]),
    ]);

    store.set(updateFilterAtom, {
      metricItemId: 'item-1',
      filterId: 'f-1',
      updates: { value: '999' },
    });

    const items = store.get(metricItemsAtom);
    expect(items[1].filters[0]).toEqual(filter2);
  });

  it('does nothing when metricItemId does not match any item', () => {
    const store = createStore();
    const filter = makeFilter('f-1', 'duration', '>', '100');
    const original = [makeItem('item-1', 'duration', 'average', [filter])];
    store.set(metricItemsAtom, original);

    store.set(updateFilterAtom, {
      metricItemId: 'non-existent',
      filterId: 'f-1',
      updates: { value: '999' },
    });

    expect(store.get(metricItemsAtom)[0].filters[0].value).toBe('100');
  });

  it('does nothing when filterId does not match any filter', () => {
    const store = createStore();
    const filter = makeFilter('f-1', 'duration', '>', '100');
    store.set(metricItemsAtom, [makeItem('item-1', 'duration', 'average', [filter])]);

    store.set(updateFilterAtom, {
      metricItemId: 'item-1',
      filterId: 'non-existent',
      updates: { value: '999' },
    });

    expect(store.get(metricItemsAtom)[0].filters[0]).toEqual(filter);
  });

  it('keeps field and operator unchanged when only value is updated', () => {
    const store = createStore();
    const filter = makeFilter('f-1', 'response.status', '=', '200');
    store.set(metricItemsAtom, [makeItem('item-1', 'duration', 'average', [filter])]);

    store.set(updateFilterAtom, {
      metricItemId: 'item-1',
      filterId: 'f-1',
      updates: { value: '404' },
    });

    const updated = store.get(metricItemsAtom)[0].filters[0];
    expect(updated.value).toBe('404');
    expect(updated.field).toBe('response.status');
    expect(updated.operator).toBe('=');
  });

  it('defaults operator to ">" when field changes to an unknown field', () => {
    const store = createStore();
    const filter = makeFilter('f-1', 'response.status', '=', '200');
    store.set(metricItemsAtom, [makeItem('item-1', 'duration', 'average', [filter])]);

    store.set(updateFilterAtom, {
      metricItemId: 'item-1',
      filterId: 'f-1',
      updates: { field: 'unknown.field' },
    });

    const updated = store.get(metricItemsAtom)[0].filters[0];
    expect(updated.field).toBe('unknown.field');
    // fieldDef is undefined for unknown field, so dataType check yields undefined !== 'string' -> '>'
    expect(updated.operator).toBe('>');
  });
});

describe('removeFilterAtom', () => {
  it('removes the correct filter from the correct metric item', () => {
    const store = createStore();
    const f1 = makeFilter('f-1', 'duration', '>', '100');
    const f2 = makeFilter('f-2', 'response.status', '=', '200');
    store.set(metricItemsAtom, [makeItem('item-1', 'duration', 'average', [f1, f2])]);

    store.set(removeFilterAtom, { metricItemId: 'item-1', filterId: 'f-1' });

    const filters = store.get(metricItemsAtom)[0].filters;
    expect(filters).toHaveLength(1);
    expect(filters[0].id).toBe('f-2');
  });

  it('leaves other metric items untouched', () => {
    const store = createStore();
    const f1 = makeFilter('f-1', 'duration', '>', '100');
    const f2 = makeFilter('f-2', 'response.status', '=', '200');
    store.set(metricItemsAtom, [
      makeItem('item-1', 'duration', 'average', [f1]),
      makeItem('item-2', 'duration', 'average', [f2]),
    ]);

    store.set(removeFilterAtom, { metricItemId: 'item-1', filterId: 'f-1' });

    const items = store.get(metricItemsAtom);
    expect(items[0].filters).toHaveLength(0);
    expect(items[1].filters).toHaveLength(1);
    expect(items[1].filters[0]).toEqual(f2);
  });

  it('results in an empty filters array when the only filter is removed', () => {
    const store = createStore();
    const filter = makeFilter('f-1', 'duration', '>', '100');
    store.set(metricItemsAtom, [makeItem('item-1', 'duration', 'average', [filter])]);

    store.set(removeFilterAtom, { metricItemId: 'item-1', filterId: 'f-1' });

    expect(store.get(metricItemsAtom)[0].filters).toEqual([]);
  });

  it('does nothing when filterId does not exist', () => {
    const store = createStore();
    const filter = makeFilter('f-1', 'duration', '>', '100');
    store.set(metricItemsAtom, [makeItem('item-1', 'duration', 'average', [filter])]);

    store.set(removeFilterAtom, { metricItemId: 'item-1', filterId: 'non-existent' });

    expect(store.get(metricItemsAtom)[0].filters).toHaveLength(1);
  });

  it('does nothing when metricItemId does not match', () => {
    const store = createStore();
    const filter = makeFilter('f-1', 'duration', '>', '100');
    store.set(metricItemsAtom, [makeItem('item-1', 'duration', 'average', [filter])]);

    store.set(removeFilterAtom, { metricItemId: 'non-existent', filterId: 'f-1' });

    expect(store.get(metricItemsAtom)[0].filters).toHaveLength(1);
  });
});
