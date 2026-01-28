import XUITextInput, { XUITextInputSideElement } from '@xero/xui/react/textinput';
import XUIControlGroup from '@xero/xui/react/controlgroup';
import {
  XUISingleSelect,
  XUISingleSelectLabel,
  XUISingleSelectOption,
  XUISingleSelectOptions,
  XUISingleSelectTrigger,
} from '@xero/xui/react/singleselect';
import XUIRadio, { XUIRadioGroup } from '@xero/xui/react/radio';
import type { TimePeriodMode } from '../types/query';

interface TimePeriodSelectorProps {
  mode: TimePeriodMode;
  since: string;
  until: string;
  relative: string;
  onModeChange: (mode: TimePeriodMode) => void;
  onSinceChange: (value: string) => void;
  onUntilChange: (value: string) => void;
  onRelativeChange: (value: string) => void;
}

const RELATIVE_OPTIONS = ['15m ago', '30m ago', '1h ago', '3h ago', '6h ago', '12h ago', '24h ago', '7d ago'];

export function TimePeriodSelector({
  mode,
  since,
  until,
  relative,
  onModeChange,
  onSinceChange,
  onUntilChange,
  onRelativeChange,
}: TimePeriodSelectorProps) {
  const selectedRelativeOption = relative || RELATIVE_OPTIONS[0];
  const relativeOptions = RELATIVE_OPTIONS.includes(selectedRelativeOption)
    ? RELATIVE_OPTIONS
    : [selectedRelativeOption, ...RELATIVE_OPTIONS];

  return (
    <XUIControlGroup label="Time Period" isFieldLayout>
      <XUIRadioGroup label="Mode" isFieldLayout>
        <XUIRadio
          name="timePeriodMode"
          value="absolute"
          isChecked={mode === 'absolute'}
          onChange={() => onModeChange('absolute')}
        >
          Exact
        </XUIRadio>
        <XUIRadio
          name="timePeriodMode"
          value="relative"
          isChecked={mode === 'relative'}
          onChange={() => onModeChange('relative')}
        >
          Relative
        </XUIRadio>
      </XUIRadioGroup>

      {mode === 'absolute' ? (
        <>
          <XUITextInput
            label="Since"
            type="text"
            placeholder="YYYY-MM-DDTHH:mm"
            value={since}
            onChange={(e) => onSinceChange(e.target.value)}
            inputProps={{ id: 'since-input' }}
            isFieldLayout
          />
          <XUITextInput
            label="Until"
            type="text"
            placeholder="YYYY-MM-DDTHH:mm"
            value={until}
            onChange={(e) => onUntilChange(e.target.value)}
            inputProps={{ id: 'until-input' }}
            isFieldLayout
          />
        </>
      ) : (
        <>
          <XUITextInput
            label="Relative"
            type="text"
            placeholder="e.g. 3h ago"
            value={relative}
            onChange={(e) => onRelativeChange(e.target.value)}
            inputProps={{ id: 'relative-input' }}
            isFieldLayout
            rightElement={
              <XUITextInputSideElement type="button">
                <XUISingleSelect
                  key={`relative-${selectedRelativeOption}`}
                  defaultSelectedOptionId={selectedRelativeOption}
                  onSelect={(value) => {
                    onRelativeChange(String(value));
                    onModeChange('relative');
                  }}
                >
                  <XUISingleSelectLabel>Quick range</XUISingleSelectLabel>
                  <XUISingleSelectTrigger />
                  <XUISingleSelectOptions>
                    {relativeOptions.map((option) => (
                      <XUISingleSelectOption key={option} id={option}>
                        {option}
                      </XUISingleSelectOption>
                    ))}
                  </XUISingleSelectOptions>
                </XUISingleSelect>
              </XUITextInputSideElement>
            }
          />
        </>
      )}
    </XUIControlGroup>
  );
}
