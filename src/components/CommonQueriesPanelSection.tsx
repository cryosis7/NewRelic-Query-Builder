import XUIButton from '@xero/xui/react/button';
import {XUIPanelSection, XUIPanelSectionHeading} from '@xero/xui/react/panel';
import {QUERY_PRESETS} from '../data/presets';
import type {QueryState} from '../types/query';
import {Flex} from './layout';

interface CommonQueriesPanelProps {
    onSelectPreset: (preset: Partial<QueryState>) => void;
}

export function CommonQueriesPanelSection({onSelectPreset}: CommonQueriesPanelProps) {
    return (
        <XUIPanelSection className="xui-padding-large">
            <XUIPanelSectionHeading headingLevel={2} className="xui-margin-bottom">Common
                Queries</XUIPanelSectionHeading>
            <Flex wrap gap="8px">
                {QUERY_PRESETS.map((preset) => (
                    <XUIButton
                        key={preset.id}
                        variant="standard"
                        size="small"
                        onClick={() => onSelectPreset(preset.state)}
                        title={preset.description}
                    >
                        {preset.name}
                    </XUIButton>
                ))}
            </Flex>
        </XUIPanelSection>
    );
}
