import XUIButton from '@xero/xui/react/button';
import XUICheckbox from '@xero/xui/react/checkbox';
import XUIControlGroup from '@xero/xui/react/controlgroup';
import {
  XUISingleSelect,
  XUISingleSelectLabel,
  XUISingleSelectOption,
  XUISingleSelectOptions,
  XUISingleSelectTrigger,
} from '@xero/xui/react/singleselect';
import XUITextInput from '@xero/xui/react/textinput';
import { XUIRow, XUIColumn } from '@xero/xui/react/structural';
import {
  AGGREGATION_TYPES,
  METRIC_FILTER_OPERATORS,
  METRIC_TYPES,
  type AggregationType,
  type MetricFilter,
  type MetricQueryItem,
  type MetricType,
} from '../types/query';

interface MetricQueryBuilderProps {
  items: MetricQueryItem[];
  onAddItem: () => void;
  onRemoveItem: (id: string) => void;
  onUpdateItem: (id: string, updates: Partial<MetricQueryItem>) => void;
}

function isDurationMetric(metricType: MetricType): boolean {
  return metricType === 'duration';
}

function getFilterFieldLabel(metricType: MetricType): string {
  if (metricType === 'status-2xx' || metricType === 'status-4xx' || metricType === 'status-5xx') {
    return 'response.status';
  }

  return 'duration';
}

export function MetricQueryBuilder({ items, onAddItem, onRemoveItem, onUpdateItem }: MetricQueryBuilderProps) {
  return (
    <XUIControlGroup label="Metric Queries" isFieldLayout>
      {items.map((item, index) => {
        const isSingleItem = items.length === 1;
        const availableAggregations = isDurationMetric(item.metricType)
          ? AGGREGATION_TYPES
          : AGGREGATION_TYPES.filter((aggregation) => aggregation.value === 'count');

        return (
          <div
            key={item.id}
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

            <XUIRow variant="grid">
              <XUIColumn gridColumns={12}>
                <XUICheckbox
                  isChecked={item.filter.isEnabled}
                  onChange={(event) =>
                    onUpdateItem(item.id, {
                      filter: { ...item.filter, isEnabled: event.target.checked },
                    })
                  }
                >
                  Where {getFilterFieldLabel(item.metricType)}
                </XUICheckbox>
              </XUIColumn>
            </XUIRow>

            {item.filter.isEnabled && (
              <XUIRow variant="grid" className="xui-margin-top-small">
                <XUIColumn gridColumns={3}>
                  <XUISingleSelect
                    key={`${item.id}-operator-${item.filter.operator}`}
                    defaultSelectedOptionId={item.filter.operator}
                    onSelect={(selectedValue) =>
                      onUpdateItem(item.id, {
                        filter: { ...item.filter, operator: selectedValue as MetricFilter['operator'] },
                      })
                    }
                  >
                    <XUISingleSelectLabel>Operator</XUISingleSelectLabel>
                    <XUISingleSelectTrigger />
                    <XUISingleSelectOptions matchTriggerWidth>
                      {METRIC_FILTER_OPERATORS.map(({ value, label }) => (
                        <XUISingleSelectOption key={value} id={value}>
                          {label}
                        </XUISingleSelectOption>
                      ))}
                    </XUISingleSelectOptions>
                  </XUISingleSelect>
                </XUIColumn>
                <XUIColumn gridColumns={9}>
                  <XUITextInput
                    label="Value"
                    type="text"
                    placeholder="e.g. 0.5"
                    value={item.filter.value}
                    onChange={(event) =>
                      onUpdateItem(item.id, { filter: { ...item.filter, value: event.target.value } })
                    }
                    isFieldLayout
                  />
                </XUIColumn>
              </XUIRow>
            )}
          </div>
        );
      })}

      <XUIButton variant="standard" onClick={onAddItem}>
        Add metric
      </XUIButton>
    </XUIControlGroup>
  );
}
