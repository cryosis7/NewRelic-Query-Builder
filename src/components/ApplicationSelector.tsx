import XUICheckbox, { XUICheckboxGroup } from '@xero/xui/react/checkbox';
import { APPLICATIONS, type Application } from '../types/query';

interface ApplicationSelectorProps {
  selectedApplications: Application[];
  onToggle: (app: Application) => void;
}

export function ApplicationSelector({ selectedApplications, onToggle }: ApplicationSelectorProps) {
  return (
    <XUICheckboxGroup label="Applications" isFieldLayout>
      {APPLICATIONS.map(({ value, label }) => (
        <XUICheckbox
          key={value}
          isChecked={selectedApplications.includes(value)}
          onChange={() => onToggle(value)}
        >
          {label}
        </XUICheckbox>
      ))}
    </XUICheckboxGroup>
  );
}
