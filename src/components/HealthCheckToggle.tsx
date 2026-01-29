import XUICheckbox, {XUICheckboxGroup} from '@xero/xui/react/checkbox';

interface HealthCheckToggleProps {
  isExcluded: boolean;
  onChange: (excluded: boolean) => void;
  useTimeseries: boolean;
  onTimeseriesChange: (useTimeseries: boolean) => void;
}

export function HealthCheckToggle({ isExcluded, onChange, useTimeseries, onTimeseriesChange }: HealthCheckToggleProps) {
  return (
    <XUICheckboxGroup label="Options">
      <XUICheckbox
        isChecked={isExcluded}
        onChange={(e) => onChange(e.target.checked)}
      >
        Exclude health checks
      </XUICheckbox>
      <XUICheckbox
        isChecked={useTimeseries}
        onChange={(e) => onTimeseriesChange(e.target.checked)}
      >
        As Timeseries
      </XUICheckbox>
    </XUICheckboxGroup>
  );
}
