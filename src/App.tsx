import {useQueryBuilder} from './hooks/useQueryBuilder';
import {
    ApplicationSelector,
    EnvironmentSelector,
    MetricQueryBuilder,
    TimePeriodSelector,
    HealthCheckToggle,
    CommonQueriesPanelSection,
    QueryPreview,
    FacetSelector,
    Flex,
    FlexItem,
} from './components';
import {XUIPageHeader} from "@xero/xui/react/pageheader";
import XUIPanel, {
    XUIPanelFooter,
    XUIPanelHeader,
    XUIPanelHeading,
    XUIPanelSection,
    XUIPanelSectionHeading
} from "@xero/xui/react/panel";

function App() {
    const {
        state,
        query,
        toggleApplication,
        setEnvironment,
        addMetricItem,
        updateMetricItem,
        removeMetricItem,
        addFilter,
        updateFilter,
        removeFilter,
        setTimeMode,
        setSince,
        setUntil,
        setRelative,
        setExcludeHealthChecks,
        setUseTimeseries,
        setFacet,
        applyPreset,
    } = useQueryBuilder();

    const header = (<XUIPanelHeader><XUIPanelHeading headingLevel={1}>New Relic Query
        Builder</XUIPanelHeading>
    </XUIPanelHeader>)
    const footer = (<XUIPanelFooter><QueryPreview query={query}/></XUIPanelFooter>)

    return (
        <div className="xui-page-width-large xui-padding-large">
            {/*<XUIPageHeader title="New Relic Query Builder" className="xui-margin-bottom"/>*/}

            <XUIPanel
                header={header}
                footer={footer}
            >
                <CommonQueriesPanelSection onSelectPreset={applyPreset}/>

                <XUIPanelSection className="xui-padding-large">
                    <XUIPanelSectionHeading headingLevel={2}>General Query Filters</XUIPanelSectionHeading>

                    <Flex gap="1rem" className="xui-margin-top-small">
                        <FlexItem flex={1}>
                            <ApplicationSelector
                                selectedApplications={state.applications}
                                onToggle={toggleApplication}
                            />
                        </FlexItem>
                        <FlexItem flex={1}>
                            <EnvironmentSelector
                                selectedEnvironment={state.environment}
                                onChange={setEnvironment}
                            />
                        </FlexItem>
                        <FlexItem flex={1}>
                            <TimePeriodSelector
                                mode={state.timePeriod.mode}
                                since={state.timePeriod.since}
                                until={state.timePeriod.until}
                                relative={state.timePeriod.relative}
                                onModeChange={setTimeMode}
                                onSinceChange={setSince}
                                onUntilChange={setUntil}
                                onRelativeChange={setRelative}
                            />
                        </FlexItem>
                    </Flex>
                </XUIPanelSection>

                <XUIPanelSection className="xui-padding-large">
                    <XUIPanelSectionHeading headingLevel={2}>Metric to Query</XUIPanelSectionHeading>

                    <MetricQueryBuilder
                        items={state.metricItems}
                        onAddItem={addMetricItem}
                        onRemoveItem={removeMetricItem}
                        onUpdateItem={updateMetricItem}
                        onAddFilter={addFilter}
                        onUpdateFilter={updateFilter}
                        onRemoveFilter={removeFilter}
                    />
                </XUIPanelSection>
            </XUIPanel>


            <Flex gap="1rem" className="xui-margin-top">
                <FlexItem flex={1}>
                    <HealthCheckToggle
                        isExcluded={state.excludeHealthChecks}
                        onChange={setExcludeHealthChecks}
                        useTimeseries={state.useTimeseries}
                        onTimeseriesChange={setUseTimeseries}
                    />
                </FlexItem>
                <FlexItem flex={1}>
                    <FacetSelector
                        selectedFacet={state.facet}
                        onChange={setFacet}
                    />
                </FlexItem>
            </Flex>

            <div className="xui-margin-top-large">
                <QueryPreview query={query}/>
            </div>
        </div>
    );
}

export default App;
