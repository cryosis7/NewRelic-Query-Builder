# Components - React UI Layer

React components consuming Jotai atoms and rendering via XUI. Import from `src/components/index.ts` (barrel export).

## File Organization

```
components/
├── index.ts                        # Barrel export
├── layout/                         # Layout primitives
│   ├── index.ts
│   ├── Flex.tsx / .test.tsx
│   └── FlexItem.tsx / .test.tsx
├── ApplicationSelector.tsx / .test.tsx
├── EnvironmentSelector.tsx / .test.tsx
├── MetricQueryBuilder.tsx / .test.tsx
├── MetricItem.tsx / .test.tsx
├── MetricTypeSelector.tsx / .test.tsx
├── AggregationTypeSelector.tsx / .test.tsx
├── FilterRow.tsx / .test.tsx
├── TimePeriodSelector.tsx / .test.tsx
├── DateTimeInput.tsx               # Composite: XUIDateInput + TimePicker (internal, not exported)
├── TimePicker.tsx                  # Time input wrapper (internal, not exported)
├── QueryOptions.tsx / .test.tsx
├── QueryPreview.tsx / .test.tsx
├── FacetSelector.tsx / .test.tsx
├── SectionRule.tsx / .test.tsx
└── CommonQueriesPanelSection.tsx / .test.tsx
```

## Component Pattern

Components consume atoms directly and keep logic minimal:

```tsx
import { useAtom } from 'jotai';
import XUICheckbox, { XUICheckboxGroup } from '@xero/xui/react/checkbox';
import { APPLICATIONS, type Application } from '../types/query';
import { applicationsAtom } from '../atoms';

export function ApplicationSelector() {
  const [selectedApplications, setSelectedApplications] = useAtom(applicationsAtom);
  const handleToggle = (app: Application) => {
    setSelectedApplications(prev =>
      prev.includes(app) ? prev.filter(a => a !== app) : [...prev, app]
    );
  };
  return (
    <XUICheckboxGroup label="Applications" isFieldLayout>
      {APPLICATIONS.map(({ value, label }) => (
        <XUICheckbox key={value} isChecked={selectedApplications.includes(value)} onChange={() => handleToggle(value)}>
          {label}
        </XUICheckbox>
      ))}
    </XUICheckboxGroup>
  );
}
```

## XUI Components Used

**Never use raw HTML form elements.** Always use `@xero/xui`:

| Component | Import Path | Usage |
|-----------|-------------|-------|
| `XUIButton` | `@xero/xui/react/button` | Actions |
| `XUICheckbox` / `XUICheckboxGroup` | `@xero/xui/react/checkbox` | Multi-select |
| `XUISingleSelect` family | `@xero/xui/react/singleselect` | Dropdowns (`XUISingleSelectLabel`, `Trigger`, `Options`, `Option`) |
| `XUIToggle` / `XUIToggleOption` | `@xero/xui/react/toggle` | Mode switching |
| `XUITextInput` | `@xero/xui/react/textinput` | Text entry |
| `XUITextInputSideElement` | `@xero/xui/react/textinput` | Embedded side elements |
| `XUIDateInput` | `@xero/xui/react/dateinput` | Date picker |
| `XUIControlGroup` | `@xero/xui/react/controlgroup` | Grouped controls |
| `XUIIconButton` | `@xero/xui/react/iconbutton` | Icon actions |
| `XUIPanel` / `XUIPanelSection` | `@xero/xui/react/panel` | Content sections |
| `XUIRow` / `XUIColumn` | `@xero/xui/react/structural` | Structural layout |
| Icons | `@xero/xui-icon/icons/{name}` | `copy`, `clear`, `exclamation`, `plusIcon` |

### XUI `key` Pattern for Controlled Selects

`XUISingleSelect` uses `defaultSelectedOptionId` (uncontrolled). Force re-render on state change:
```tsx
<XUISingleSelect key={`${item.id}-field-${item.field}`} defaultSelectedOptionId={item.field}>
```

### Finding XUI Components

Use the Xero docs MCP tool to search for XUI component props and patterns.

## Layout

Use `Flex`/`FlexItem` from `./layout` for multi-column layouts:
```tsx
import { Flex, FlexItem } from './components';
<Flex gap="1rem">
  <FlexItem flex={1}>Column 1</FlexItem>
  <FlexItem flex={1}>Column 2</FlexItem>
</Flex>
```

## Testing

Framework: Vitest + React Testing Library. Wrap in Jotai `Provider`:

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'jotai';

describe('ComponentName', () => {
  it('renders and interacts', async () => {
    const user = userEvent.setup();
    render(<Provider><ComponentName /></Provider>);
    await user.click(screen.getByLabelText('Label'));
    expect(screen.getByText('Expected')).toBeInTheDocument();
  });
});
```

- `vi`, `describe`, `it`, `expect` are global (no import needed)
- Setup file imports `@testing-library/jest-dom`
- Run: `npm run test -- src/components/ComponentName.test.tsx`

## Rules

- Always use XUI components, never raw HTML form elements
- Import atoms from `../atoms` barrel, components from `./` barrel
- Co-locate test files with components
- Keep components focused on rendering — extract logic to `../lib/`
- Export new components from `index.ts`
- Update tests when modifying components
