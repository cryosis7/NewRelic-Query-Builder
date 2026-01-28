import XUICheckbox, { XUICheckboxGroup } from '@xero/xui/react/checkbox';
import { HEALTH_CHECK_PATHS } from '../types/query';

interface HealthCheckToggleProps {
  isExcluded: boolean;
  onChange: (excluded: boolean) => void;
  useTimeseries: boolean;
  onTimeseriesChange: (useTimeseries: boolean) => void;
}

export function HealthCheckToggle({ isExcluded, onChange, useTimeseries, onTimeseriesChange }: HealthCheckToggleProps) {
  return (
    <XUICheckboxGroup label="Options" isFieldLayout>
      <XUICheckbox
        isChecked={isExcluded}
        onChange={(e) => onChange(e.target.checked)}
        hintMessage={isExcluded ? `Excludes: ${HEALTH_CHECK_PATHS.slice(0, 3).join(', ')}...` : undefined}
      >
        Exclude health checks
      </XUICheckbox>
      <XUICheckbox
        isChecked={useTimeseries}
        onChange={(e) => onTimeseriesChange(e.target.checked)}
      >
        Use TIMESERIES
      </XUICheckbox>
    </XUICheckboxGroup>
  );
}
