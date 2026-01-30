import { useSetAtom } from 'jotai';
import XUIButton from '@xero/xui/react/button';
import {XUIPanelSection, XUIPanelSectionHeading} from '@xero/xui/react/panel';
import {QUERY_PRESETS} from '../data/presets';
import {Flex} from './layout';
import { applyPresetAtom, resetAtom } from '../atoms';

export function CommonQueriesPanelSection() {
    const applyPreset = useSetAtom(applyPresetAtom);
    const reset = useSetAtom(resetAtom);

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
                        onClick={() => applyPreset(preset.state)}
                        title={preset.description}
                    >
                        {preset.name}
                    </XUIButton>
                ))}
                <XUIButton
                    variant="standard"
                    size="small"
                    onClick={() => reset()}
                    title="Reset to default query"
                >
                    Reset
                </XUIButton>
            </Flex>
        </XUIPanelSection>
    );
}
