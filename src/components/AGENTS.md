# Components - React UI Layer

This folder contains all React components for the NR-Query-Builder application. Components consume Jotai atoms and render using Xero UI (XUI) components.

## File Organization

```
components/
├── index.ts                    # Barrel export for all components
├── ComponentName.tsx           # Component implementation
└── ComponentName.test.tsx      # Co-located tests
```

---

## Component Structure Pattern

Components consume atoms directly via `useAtom` and have minimal internal logic. Business logic lives in pure functions in `../lib/`.

```tsx
// ✅ Correct component pattern
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
```

**Guidelines:**
- Import atoms from `../atoms` (barrel export)
- Use `useAtom` to read and write state
- Keep event handlers simple
- Delegate complex logic to pure functions
- Use XUI components exclusively (see below)

---

## XUI Component Usage

Always use `@xero/xui` components. **Never use raw HTML form elements.**

### Import Patterns

```tsx
// ✅ Correct imports
import XUICheckbox, { XUICheckboxGroup } from '@xero/xui/react/checkbox';
import XUIButton from '@xero/xui/react/button';
import XUIRadio, { XUIRadioGroup } from '@xero/xui/react/radio';
import XUITextInput from '@xero/xui/react/textinput';
import XUISelect from '@xero/xui/react/select';
import XUIPanel, { XUIPanelSection } from '@xero/xui/react/panel';

// ❌ Never use raw HTML
<input type="checkbox" />
<button>Click</button>
<select>...</select>
```

### Common XUI Components

| Component | Import | Usage |
|-----------|--------|-------|
| Button | `import XUIButton from '@xero/xui/react/button'` | Primary actions |
| Checkbox | `import XUICheckbox, { XUICheckboxGroup } from '@xero/xui/react/checkbox'` | Multi-select |
| Radio | `import XUIRadio, { XUIRadioGroup } from '@xero/xui/react/radio'` | Single-select |
| TextInput | `import XUITextInput from '@xero/xui/react/textinput'` | Text entry |
| Select | `import XUISelect from '@xero/xui/react/select'` | Dropdown |
| Panel | `import XUIPanel, { XUIPanelSection } from '@xero/xui/react/panel'` | Content sections |

### Finding XUI Components

Use the Xero docs tool to search for XUI components, props, and utility classes:
```
Search Xero docs for: XUI Button component props
```

---

## Layout Patterns

### Multi-Column Layouts

Use `Flex` and `FlexItem` components for responsive layouts:

```tsx
// ✅ Use Flex/FlexItem from components for multi-column layouts
import { Flex, FlexItem } from './components';

<Flex gap="1rem" className="xui-margin-top">
  <FlexItem flex={1}>Column 1</FlexItem>
  <FlexItem flex={1}>Column 2</FlexItem>
</Flex>
```

### XUI Utility Classes

Use XUI utility classes for spacing and styling:

```tsx
// ✅ XUI utility classes for spacing
<div className="xui-margin-top xui-padding-large">
  <QueryPreview />
</div>

// Common utility classes:
// xui-margin-top, xui-margin-bottom, xui-margin-left, xui-margin-right
// xui-padding-small, xui-padding-medium, xui-padding-large
// xui-text-center, xui-text-right
```

---

## Component Testing

### Test Pattern

Components are tested using Vitest + React Testing Library. Always wrap components in Jotai `Provider`.

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'jotai';
import { ComponentName } from './ComponentName';

describe('ComponentName', () => {
  it('renders expected elements', () => {
    render(
      <Provider>
        <ComponentName />
      </Provider>
    );
    expect(screen.getByLabelText('Label')).toBeInTheDocument();
  });

  it('handles user interaction', async () => {
    const user = userEvent.setup();
    render(
      <Provider>
        <ComponentName />
      </Provider>
    );
    
    await user.click(screen.getByLabelText('Label'));
    
    // Assert state change via UI
    expect(screen.getByText('Expected Result')).toBeInTheDocument();
  });

  it('calls action atom on button click', async () => {
    const user = userEvent.setup();
    render(
      <Provider>
        <ComponentName />
      </Provider>
    );
    
    const button = screen.getByRole('button', { name: 'Submit' });
    await user.click(button);
    
    // Assert via UI changes or query output
  });
});
```

### Testing Guidelines

- **Framework**: Vitest with jsdom environment
- **Libraries**: `@testing-library/react`, `@testing-library/user-event`
- **Global `vi`**: Available without import (configured in vite.config.ts)
- **Setup file**: `../test/setup.ts` imports `@testing-library/jest-dom`

### Running Tests

```bash
# Run all component tests
npm run test

# Run single test file
npm run test:run -- src/components/ComponentName.test.tsx

# Watch mode
npm run test
```

---

## Barrel Export Pattern

Always export all components from `index.ts` for centralized imports.

```ts
// index.ts - Central export for all components
export { ApplicationSelector } from './ApplicationSelector';
export { EnvironmentSelector } from './EnvironmentSelector';
export { MetricQueryBuilder } from './MetricQueryBuilder';
export { QueryPreview } from './QueryPreview';
export { Flex, FlexItem } from './Flex';
// ...
```

**Usage:**
```tsx
// ✅ Import from barrel export (in App.tsx or other files)
import { ApplicationSelector, EnvironmentSelector } from './components';

// ❌ Don't import directly from files
import { ApplicationSelector } from './components/ApplicationSelector';
```

---

## Do

- Use `@xero/xui` components for all UI elements
- Use Xero docs tool to search for XUI components, props, utility classes
- Import atoms from `../atoms` (barrel export)
- Import components from barrel export in `index.ts`
- Keep components focused on rendering and user interaction
- Co-locate test files with components
- Wrap components in Jotai `Provider` during testing
- Use `userEvent` for testing user interactions
- Update tests when modifying components

## Don't

- Don't use raw HTML form elements (`<input>`, `<button>`, `<select>`)
- Don't put business logic in components - extract to pure functions in `../lib/`
- Don't import atoms/components directly from their files - use barrel exports
- Don't create stateful hooks - use Jotai atoms instead
- Don't forget to export new components from `index.ts`
- Don't skip testing - all components should have tests
