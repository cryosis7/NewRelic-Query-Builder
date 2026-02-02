import { useAtom } from 'jotai';
import XUICheckbox, {XUICheckboxGroup} from '@xero/xui/react/checkbox';
import { excludeBulkEndpointAtom, excludeHealthChecksAtom, useTimeseriesAtom } from '../atoms';

export function QueryOptions() {
  const [excludeHealthChecks, setExcludeHealthChecks] = useAtom(excludeHealthChecksAtom);
  const [excludeBulkEndpoint, setExcludeBulkEndpoint] = useAtom(excludeBulkEndpointAtom);
  const [useTimeseries, setUseTimeseries] = useAtom(useTimeseriesAtom);

  return (
    <XUICheckboxGroup label="Options">
      <XUICheckbox
        isChecked={excludeHealthChecks}
        onChange={(e) => setExcludeHealthChecks(e.target.checked)}
      >
        Exclude health checks
      </XUICheckbox>
      <XUICheckbox
        isChecked={excludeBulkEndpoint}
        onChange={(e) => setExcludeBulkEndpoint(e.target.checked)}
      >
        Exclude bulk endpoint
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
