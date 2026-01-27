import XUITextInput from '@xero/xui/react/textinput';
import XUIControlGroup from '@xero/xui/react/controlgroup';

interface TimePeriodSelectorProps {
  since: string;
  until: string;
  onSinceChange: (value: string) => void;
  onUntilChange: (value: string) => void;
}

export function TimePeriodSelector({ since, until, onSinceChange, onUntilChange }: TimePeriodSelectorProps) {
  return (
    <XUIControlGroup label="Time Period" isFieldLayout>
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
    </XUIControlGroup>
  );
}
