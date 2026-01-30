import { useAtom } from 'jotai';
import XUICheckbox, {XUICheckboxGroup} from '@xero/xui/react/checkbox';
import { excludeHealthChecksAtom, useTimeseriesAtom } from '../atoms';

export function QueryOptions() {
  const [isExcluded, setIsExcluded] = useAtom(excludeHealthChecksAtom);
  const [useTimeseries, setUseTimeseries] = useAtom(useTimeseriesAtom);

  return (
    <XUICheckboxGroup label="Options">
      <XUICheckbox
        isChecked={isExcluded}
        onChange={(e) => setIsExcluded(e.target.checked)}
      >
        Exclude health checks
      </XUICheckbox>
      <XUICheckbox
        isChecked={useTimeseries}
        onChange={(e) => setUseTimeseries(e.target.checked)}
      >
        As Timeseries
      </XUICheckbox>
    </XUICheckboxGroup>
  );
}
