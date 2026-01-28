import XUIButton from '@xero/xui/react/button';
import {
  XUISingleSelect,
  XUISingleSelectLabel,
  XUISingleSelectOption,
  XUISingleSelectOptions,
  XUISingleSelectTrigger,
} from '@xero/xui/react/singleselect';
import { XUIRow, XUIColumn } from '@xero/xui/react/structural';
import {
  AGGREGATION_TYPES,
  METRIC_TYPES,
  type AggregationType,
  type FilterField,
  type MetricFilter,
  type MetricQueryItem,
  type MetricType,
} from '../types/query';
import { FilterRow } from './FilterRow';

interface MetricItemProps {
  item: MetricQueryItem;
  index: number;
  isSingleItem: boolean;
  onRemoveItem: (id: string) => void;
  onUpdateItem: (id: string, updates: Partial<MetricQueryItem>) => void;
  onAddFilter: (metricItemId: string, field?: FilterField) => void;
  onUpdateFilter: (metricItemId: string, filterId: string, updates: Partial<MetricFilter>) => void;
  onRemoveFilter: (metricItemId: string, filterId: string) => void;
}

function isDurationMetric(metricType: MetricType): boolean {
  return metricType === 'duration';
}

export function MetricItem({
  item,
  index,
  isSingleItem,
  onRemoveItem,
  onUpdateItem,
  onAddFilter,
  onUpdateFilter,
  onRemoveFilter,
}: MetricItemProps) {
  const availableAggregations = isDurationMetric(item.metricType)
    ? AGGREGATION_TYPES
    : AGGREGATION_TYPES.filter((aggregation) => aggregation.value === 'count');

  return (
    <div
      className="xui-border xui-padding xui-margin-bottom"
      style={{ borderRadius: '6px' }}
    >
      <XUIRow variant="grid" className="xui-margin-bottom-small">
        <XUIColumn gridColumns={5}>
          <XUISingleSelect
            key={`${item.id}-metricType-${item.metricType}`}
            defaultSelectedOptionId={item.metricType}
            onSelect={(selectedValue) =>
              onUpdateItem(item.id, { metricType: selectedValue as MetricType })
            }
          >
            <XUISingleSelectLabel>Metric {index + 1}</XUISingleSelectLabel>
            <XUISingleSelectTrigger />
            <XUISingleSelectOptions matchTriggerWidth>
              {METRIC_TYPES.map(({ value, label }) => (
                <XUISingleSelectOption key={value} id={value}>
                  {label}
                </XUISingleSelectOption>
              ))}
            </XUISingleSelectOptions>
          </XUISingleSelect>
        </XUIColumn>
        <XUIColumn gridColumns={4}>
          <XUISingleSelect
            key={`${item.id}-aggregation-${item.aggregationType}`}
            defaultSelectedOptionId={item.aggregationType}
            onSelect={(selectedValue) =>
              onUpdateItem(item.id, { aggregationType: selectedValue as AggregationType })
            }
          >
            <XUISingleSelectLabel>Aggregation</XUISingleSelectLabel>
            <XUISingleSelectTrigger />
            <XUISingleSelectOptions matchTriggerWidth>
              {availableAggregations.map(({ value, label }) => (
                <XUISingleSelectOption key={value} id={value}>
                  {label}
                </XUISingleSelectOption>
              ))}
            </XUISingleSelectOptions>
          </XUISingleSelect>
        </XUIColumn>
        <XUIColumn gridColumns={3}>
          <XUIButton
            variant="negative"
            onClick={() => onRemoveItem(item.id)}
            isDisabled={isSingleItem}
          >
            Remove
          </XUIButton>
        </XUIColumn>
      </XUIRow>

      {/* Filters section */}
      {item.filters.length > 0 && (
        <div className="xui-margin-bottom-small">
          <div className="xui-text-label xui-margin-bottom-xsmall">Filters (AND)</div>
          {item.filters.map((filter) => (
            <FilterRow
              key={filter.id}
              filter={filter}
              metricItemId={item.id}
              onUpdate={onUpdateFilter}
              onRemove={onRemoveFilter}
            />
          ))}
        </div>
      )}

      <XUIButton
        variant="borderless-main"
        size="small"
        onClick={() => onAddFilter(item.id)}
      >
        + Add filter
      </XUIButton>
    </div>
  );
}
