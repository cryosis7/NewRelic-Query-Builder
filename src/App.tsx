import { Provider } from 'jotai';
import {
    ApplicationSelector,
    CommonQueriesPanelSection,
    EnvironmentSelector,
    FacetSelector,
    Flex,
    FlexItem,
    QueryOptions,
    MetricQueryBuilder,
    QueryPreview,
    TimePeriodSelector,
} from './components';
import XUIPanel, {
    XUIPanelHeader,
    XUIPanelHeading,
    XUIPanelSection,
    XUIPanelSectionHeading
} from "@xero/xui/react/panel";

function App() {

    const header = (
        <XUIPanelHeader>
            <Flex align="center" gap="1rem">
                <img src="/nr-builder-logo.svg" alt="NR Query Builder Logo" style={{ height: '48px', width: '48px' }} />
                <XUIPanelHeading headingLevel={1}>New Relic Query Builder</XUIPanelHeading>
            </Flex>
        </XUIPanelHeader>
    )

    return (
        <Provider>
            <div className="xui-page-width-large xui-padding-large">
                <XUIPanel
                    header={header}
                >
                    <CommonQueriesPanelSection />

                    <XUIPanelSection className="xui-padding-large">
                        <XUIPanelSectionHeading headingLevel={2}>General Query Filters</XUIPanelSectionHeading>

                        <Flex gap="1rem" className="xui-margin-top-small">
                            <FlexItem flex={1}>
                                <ApplicationSelector />
                            </FlexItem>
                            <FlexItem flex={1}>
                                <EnvironmentSelector />
                            </FlexItem>
                            <FlexItem flex={1}>
                                <TimePeriodSelector />
                            </FlexItem>
                        </Flex>
                    </XUIPanelSection>

                    <XUIPanelSection className="xui-padding-large">
                        <XUIPanelSectionHeading headingLevel={2}>Metric to Query</XUIPanelSectionHeading>

                        <MetricQueryBuilder />
                    </XUIPanelSection>

                    <XUIPanelSection className="xui-padding-large">
                        <XUIPanelSectionHeading headingLevel={2}>View Options</XUIPanelSectionHeading>

                        <Flex gap="1rem" className="xui-margin-top">
                            <FlexItem flex={1}>
                                <QueryOptions />
                            </FlexItem>
                            <FlexItem flex={1}>
                                <FacetSelector />
                            </FlexItem>
                        </Flex>
                    </XUIPanelSection>


                    <XUIPanelSection className="xui-padding-large">
                        <XUIPanelSectionHeading headingLevel={2}>NewRelic Query</XUIPanelSectionHeading>
                        <QueryPreview />
                    </XUIPanelSection>
                </XUIPanel>

            </div>
        </Provider>
    );
}

export default App;
