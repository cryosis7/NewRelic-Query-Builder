import {
  XUISingleSelect,
  XUISingleSelectLabel,
  XUISingleSelectOption,
  XUISingleSelectOptions,
  XUISingleSelectTrigger,
} from '@xero/xui/react/singleselect';
import { METRIC_FIELDS } from '../types/query';

interface MetricTypeSelectorProps {
  selectedMetricType: string;
  onChange: (field: string) => void;
}

export function MetricTypeSelector({ selectedMetricType, onChange }: MetricTypeSelectorProps) {
  return (
    <XUISingleSelect
      key={`metricType-${selectedMetricType}`}
      defaultSelectedOptionId={selectedMetricType}
      onSelect={(value) => onChange(value)}
    >
      <XUISingleSelectLabel>Metric Type</XUISingleSelectLabel>
      <XUISingleSelectTrigger />
      <XUISingleSelectOptions matchTriggerWidth={false}>
        {METRIC_FIELDS.map(({ value, label }) => (
          <XUISingleSelectOption key={value} id={value}>
            {label}
          </XUISingleSelectOption>
        ))}
      </XUISingleSelectOptions>
    </XUISingleSelect>
  );
}
