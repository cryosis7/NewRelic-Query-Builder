import { useAtom } from 'jotai';
import {
  XUISingleSelect,
  XUISingleSelectLabel,
  XUISingleSelectOption,
  XUISingleSelectOptions,
  XUISingleSelectTrigger,
} from '@xero/xui/react/singleselect';
import { ENVIRONMENTS, type Environment } from '../types/query';
import { environmentAtom } from '../atoms';

export function EnvironmentSelector() {
  const [selectedEnvironment, setSelectedEnvironment] = useAtom(environmentAtom);

  return (
    <XUISingleSelect
      key={`environment-${selectedEnvironment}`}
      defaultSelectedOptionId={selectedEnvironment}
      onSelect={(value) => setSelectedEnvironment(value as Environment)}
    >
      <XUISingleSelectLabel>Environment</XUISingleSelectLabel>
      <XUISingleSelectTrigger />
      <XUISingleSelectOptions matchTriggerWidth>
        {ENVIRONMENTS.map(({ value, label }) => (
          <XUISingleSelectOption key={value} id={value}>
            {label}
          </XUISingleSelectOption>
        ))}
      </XUISingleSelectOptions>
    </XUISingleSelect>
  );
}
