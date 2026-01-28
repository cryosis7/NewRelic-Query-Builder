import {
  XUISingleSelect,
  XUISingleSelectLabel,
  XUISingleSelectOption,
  XUISingleSelectOptions,
  XUISingleSelectTrigger,
} from '@xero/xui/react/singleselect';
import { AGGREGATION_TYPES, type AggregationType, type MetricType } from '../types/query';

interface AggregationTypeSelectorProps {
  metricType: MetricType;
  selectedAggregationType: AggregationType;
  onChange: (aggregationType: AggregationType) => void;
}

function isDurationMetric(metricType: MetricType): boolean {
  return metricType === 'duration';
}

export function AggregationTypeSelector({
  metricType,
  selectedAggregationType,
  onChange,
}: AggregationTypeSelectorProps) {
  const allowsDurationAggregations = isDurationMetric(metricType);
  const availableAggregations = allowsDurationAggregations
    ? AGGREGATION_TYPES
    : AGGREGATION_TYPES.filter(({ value }) => value === 'count');
  const defaultAggregation = availableAggregations.some(({ value }) => value === selectedAggregationType)
    ? selectedAggregationType
    : availableAggregations[0].value;

  return (
    <XUISingleSelect
      key={`aggregationType-${metricType}-${selectedAggregationType}`}
      defaultSelectedOptionId={defaultAggregation}
      onSelect={(value) => onChange(value as AggregationType)}
    >
      <XUISingleSelectLabel>Aggregation Type</XUISingleSelectLabel>
      <XUISingleSelectTrigger />
      <XUISingleSelectOptions matchTriggerWidth>
        {availableAggregations.map(({ value, label }) => (
          <XUISingleSelectOption key={value} id={value}>
            {label}
          </XUISingleSelectOption>
        ))}
      </XUISingleSelectOptions>
    </XUISingleSelect>
  );
}
