import XUIRadio, { XUIRadioGroup } from '@xero/xui/react/radio';
import { METRIC_TYPES, type MetricType } from '../types/query';

interface MetricTypeSelectorProps {
  selectedMetricType: MetricType;
  onChange: (metricType: MetricType) => void;
}

export function MetricTypeSelector({ selectedMetricType, onChange }: MetricTypeSelectorProps) {
  return (
    <XUIRadioGroup label="Metric Type" isFieldLayout>
      {METRIC_TYPES.map(({ value, label }) => (
        <XUIRadio
          key={value}
          name="metricType"
          value={value}
          isChecked={selectedMetricType === value}
          onChange={() => onChange(value)}
        >
          {label}
        </XUIRadio>
      ))}
    </XUIRadioGroup>
  );
}
