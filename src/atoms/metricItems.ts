import {atom} from 'jotai';
import type {MetricFilter, MetricQueryItem} from '../types/query';
import {getFieldByName} from '../types/query';
import {createMetricFilter, createMetricItem} from '../lib/buildNrqlQuery';

// Base atom for metric items
export const metricItemsAtom = atom<MetricQueryItem[]>([
  createMetricItem('duration', 'average'),
]);

// Write-only action atom to add a new metric item
export const addMetricItemAtom = atom(
  null,
  (get, set) => {
    const current = get(metricItemsAtom);
    set(metricItemsAtom, [...current, createMetricItem('duration', 'average')]);
  }
);

// Write-only action atom to update a metric item
export const updateMetricItemAtom = atom(
  null,
  (get, set, { id, updates }: { id: string; updates: Partial<MetricQueryItem> }) => {
    const current = get(metricItemsAtom);
    set(
      metricItemsAtom,
      current.map(item => {
        if (item.id !== id) {
          return item;
        }

        return {
          ...item,
          ...updates
        };
      })
    );
  }
);

// Write-only action atom to remove a metric item
export const removeMetricItemAtom = atom(
  null,
  (get, set, id: string) => {
    const current = get(metricItemsAtom);
    set(metricItemsAtom, current.filter(item => item.id !== id));
  }
);

// Write-only action atom to add a filter to a metric item
export const addFilterAtom = atom(
  null,
  (get, set, { metricItemId, field }: { metricItemId: string; field?: string }) => {
    const current = get(metricItemsAtom);
    set(
      metricItemsAtom,
      current.map(item => {
        if (item.id !== metricItemId) {
          return item;
        }
        return {
          ...item,
          filters: [...item.filters, createMetricFilter(field)],
        };
      })
    );
  }
);

// Write-only action atom to update a filter
export const updateFilterAtom = atom(
  null,
  (get, set, { metricItemId, filterId, updates }: { metricItemId: string; filterId: string; updates: Partial<MetricFilter> }) => {
    const current = get(metricItemsAtom);
    set(
      metricItemsAtom,
      current.map(item => {
        if (item.id !== metricItemId) {
          return item;
        }
        return {
          ...item,
          filters: item.filters.map(filter => {
            if (filter.id !== filterId) {
              return filter;
            }
            // When field changes, reset operator to appropriate default
            const newField = updates.field ?? filter.field;
            const operatorNeedsReset = updates.field && updates.field !== filter.field;
            const fieldDef = getFieldByName(newField);
            const newOperator = operatorNeedsReset
              ? (fieldDef?.dataType === 'string' ? '=' : '>')
              : (updates.operator ?? filter.operator);
            return {
              ...filter,
              ...updates,
              field: newField,
              operator: newOperator,
            };
          }),
        };
      })
    );
  }
);

// Write-only action atom to remove a filter
export const removeFilterAtom = atom(
  null,
  (get, set, { metricItemId, filterId }: { metricItemId: string; filterId: string }) => {
    const current = get(metricItemsAtom);
    set(
      metricItemsAtom,
      current.map(item => {
        if (item.id !== metricItemId) {
          return item;
        }
        return {
          ...item,
          filters: item.filters.filter(f => f.id !== filterId),
        };
      })
    );
  }
);
