import {
  XUISingleSelect,
  XUISingleSelectLabel,
  XUISingleSelectOption,
  XUISingleSelectOptions,
  XUISingleSelectTrigger,
} from '@xero/xui/react/singleselect';
import { ENVIRONMENTS, type Environment } from '../types/query';

interface EnvironmentSelectorProps {
  selectedEnvironment: Environment;
  onChange: (env: Environment) => void;
}

export function EnvironmentSelector({ selectedEnvironment, onChange }: EnvironmentSelectorProps) {
  return (
    <XUISingleSelect
      key={`environment-${selectedEnvironment}`}
      defaultSelectedOptionId={selectedEnvironment}
      onSelect={(value) => onChange(value as Environment)}
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
