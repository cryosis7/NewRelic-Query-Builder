import XUIButton from '@xero/xui/react/button';
import XUIPanel, { XUIPanelSection, XUIPanelSectionHeading } from '@xero/xui/react/panel';
import { QUERY_PRESETS } from '../data/presets';
import type { QueryState } from '../types/query';

interface CommonQueriesPanelProps {
  onSelectPreset: (preset: Partial<QueryState>) => void;
}

export function CommonQueriesPanel({ onSelectPreset }: CommonQueriesPanelProps) {
  return (
    <XUIPanel>
      <XUIPanelSection className="xui-padding-large">
        <XUIPanelSectionHeading headingLevel={2} className="xui-margin-bottom">Common Queries</XUIPanelSectionHeading>
        <div className="xui-u-flex xui-u-flex-wrap" style={{ gap: '8px' }}>
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
        </div>
      </XUIPanelSection>
    </XUIPanel>
  );
}
