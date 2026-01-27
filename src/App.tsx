import './App.css';
import { XUIRow, XUIColumn } from '@xero/xui/react/structural';
import { useQueryBuilder } from './hooks/useQueryBuilder';
import { 
  ApplicationSelector, 
  EnvironmentSelector, 
  MetricTypeSelector,
  TimePeriodSelector,
  HealthCheckToggle,
  CommonQueriesPanel,
  QueryPreview,
} from './components';

function App() {
  const {
    state,
    query,
    toggleApplication,
    setEnvironment,
    setMetricType,
    setSince,
    setUntil,
    setExcludeHealthChecks,
    applyPreset,
  } = useQueryBuilder();

  return (
    <div className="xui-page-width-standard xui-padding-large">
      <h1 className="xui-heading-xlarge xui-margin-bottom-large">New Relic Query Builder</h1>
      <p className="xui-text-secondary xui-margin-bottom-large">Global Tax Mapper Applications</p>

      <CommonQueriesPanel onSelectPreset={applyPreset} />

      <XUIRow variant="grid" className="xui-margin-top-large">
        <XUIColumn gridColumns={3}>
          <ApplicationSelector
            selectedApplications={state.applications}
            onToggle={toggleApplication}
          />
        </XUIColumn>
        <XUIColumn gridColumns={2}>
          <EnvironmentSelector
            selectedEnvironment={state.environment}
            onChange={setEnvironment}
          />
        </XUIColumn>
        <XUIColumn gridColumns={3}>
          <MetricTypeSelector
            selectedMetricType={state.metricType}
            onChange={setMetricType}
          />
        </XUIColumn>
        <XUIColumn gridColumns={4}>
          <TimePeriodSelector
            since={state.timePeriod.since}
            until={state.timePeriod.until}
            onSinceChange={setSince}
            onUntilChange={setUntil}
          />
        </XUIColumn>
      </XUIRow>

      <XUIRow variant="grid" className="xui-margin-top">
        <XUIColumn gridColumns={3}>
          <HealthCheckToggle
            isExcluded={state.excludeHealthChecks}
            onChange={setExcludeHealthChecks}
          />
        </XUIColumn>
      </XUIRow>

      <XUIRow variant="grid" className="xui-margin-top-large">
        <XUIColumn gridColumns={12}>
          <QueryPreview query={query} />
        </XUIColumn>
      </XUIRow>
    </div>
  );
}

export default App;
