import {
  XUISingleSelect,
  XUISingleSelectLabel,
  XUISingleSelectOption,
  XUISingleSelectOptions,
  XUISingleSelectTrigger,
} from '@xero/xui/react/singleselect';
import { METRIC_TYPES, type MetricType } from '../types/query';

interface MetricTypeSelectorProps {
  selectedMetricType: MetricType;
  onChange: (metricType: MetricType) => void;
}

export function MetricTypeSelector({ selectedMetricType, onChange }: MetricTypeSelectorProps) {
  return (
    <XUISingleSelect
      key={`metricType-${selectedMetricType}`}
      defaultSelectedOptionId={selectedMetricType}
      onSelect={(value) => onChange(value as MetricType)}
    >
      <XUISingleSelectLabel>Metric Type</XUISingleSelectLabel>
      <XUISingleSelectTrigger />
      <XUISingleSelectOptions matchTriggerWidth>
        {METRIC_TYPES.map(({ value, label }) => (
          <XUISingleSelectOption key={value} id={value}>
            {label}
          </XUISingleSelectOption>
        ))}
      </XUISingleSelectOptions>
    </XUISingleSelect>
  );
}
