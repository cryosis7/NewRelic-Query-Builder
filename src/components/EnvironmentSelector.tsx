import XUIRadio, { XUIRadioGroup } from '@xero/xui/react/radio';
import { ENVIRONMENTS, type Environment } from '../types/query';

interface EnvironmentSelectorProps {
  selectedEnvironment: Environment;
  onChange: (env: Environment) => void;
}

export function EnvironmentSelector({ selectedEnvironment, onChange }: EnvironmentSelectorProps) {
  return (
    <XUIRadioGroup label="Environment" isFieldLayout>
      {ENVIRONMENTS.map(({ value, label }) => (
        <XUIRadio
          key={value}
          name="environment"
          value={value}
          isChecked={selectedEnvironment === value}
          onChange={() => onChange(value)}
        >
          {label}
        </XUIRadio>
      ))}
    </XUIRadioGroup>
  );
}
