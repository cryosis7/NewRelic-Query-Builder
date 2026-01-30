import { useAtom } from 'jotai';
import XUICheckbox, { XUICheckboxGroup } from '@xero/xui/react/checkbox';
import { APPLICATIONS, type Application } from '../types/query';
import { applicationsAtom } from '../atoms';

export function ApplicationSelector() {
  const [selectedApplications, setSelectedApplications] = useAtom(applicationsAtom);

  const handleToggle = (app: Application) => {
    setSelectedApplications(prev =>
      prev.includes(app)
        ? prev.filter(a => a !== app)
        : [...prev, app]
    );
  };

  return (
    <XUICheckboxGroup label="Applications" isFieldLayout>
      {APPLICATIONS.map(({ value, label }) => (
        <XUICheckbox
          key={value}
          isChecked={selectedApplications.includes(value)}
          onChange={() => handleToggle(value)}
        >
          {label}
        </XUICheckbox>
      ))}
    </XUICheckboxGroup>
  );
}
