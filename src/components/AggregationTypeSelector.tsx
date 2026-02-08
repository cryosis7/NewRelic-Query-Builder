import {
  XUISingleSelect,
  XUISingleSelectLabel,
  XUISingleSelectOption,
  XUISingleSelectOptions,
  XUISingleSelectTrigger,
} from '@xero/xui/react/singleselect';
import { AGGREGATION_TYPES, type AggregationType, getFieldByName } from '../types/query';

interface AggregationTypeSelectorProps {
  metricType: string;
  selectedAggregationType: AggregationType;
  onChange: (aggregationType: AggregationType) => void;
}

export function AggregationTypeSelector({
  metricType,
  selectedAggregationType,
  onChange,
}: AggregationTypeSelectorProps) {
  const fieldDef = getFieldByName(metricType);
  if (!fieldDef) {
    throw new Error('Unknown metricType: ' + metricType);
  }

  console.dir(AGGREGATION_TYPES)
  console.dir(fieldDef);

  const availableAggregations = fieldDef.dataType === 'string'
    ? AGGREGATION_TYPES.filter((aggregator => aggregator.isNumericalAggregator !== true))
    : AGGREGATION_TYPES;

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
      <XUISingleSelectOptions matchTriggerWidth={false}>
        {availableAggregations.map(({ value, label }) => (
          <XUISingleSelectOption key={value} id={value}>
            {label}
          </XUISingleSelectOption>
        ))}
      </XUISingleSelectOptions>
    </XUISingleSelect>
  );
}
