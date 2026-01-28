import XUIButton from '@xero/xui/react/button';
import XUIControlGroup from '@xero/xui/react/controlgroup';
import type { FilterField, MetricFilter, MetricQueryItem } from '../types/query';
import { MetricItem } from './MetricItem';

interface MetricQueryBuilderProps {
  items: MetricQueryItem[];
  onAddItem: () => void;
  onRemoveItem: (id: string) => void;
  onUpdateItem: (id: string, updates: Partial<MetricQueryItem>) => void;
  onAddFilter: (metricItemId: string, field?: FilterField) => void;
  onUpdateFilter: (metricItemId: string, filterId: string, updates: Partial<MetricFilter>) => void;
  onRemoveFilter: (metricItemId: string, filterId: string) => void;
}

export function MetricQueryBuilder({
  items,
  onAddItem,
  onRemoveItem,
  onUpdateItem,
  onAddFilter,
  onUpdateFilter,
  onRemoveFilter,
}: MetricQueryBuilderProps) {
  return (
    <XUIControlGroup label="Metric Queries" isFieldLayout>
      {items.map((item, index) => {
        const isSingleItem = items.length === 1;

        return (
          <MetricItem
            key={item.id}
            item={item}
            index={index}
            isSingleItem={isSingleItem}
            onRemoveItem={onRemoveItem}
            onUpdateItem={onUpdateItem}
            onAddFilter={onAddFilter}
            onUpdateFilter={onUpdateFilter}
            onRemoveFilter={onRemoveFilter}
          />
        );
      })}

      <XUIButton variant="standard" onClick={onAddItem}>
        Add metric
      </XUIButton>
    </XUIControlGroup>
  );
}
