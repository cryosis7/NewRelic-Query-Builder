import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EnvironmentSelector } from './EnvironmentSelector';

describe('EnvironmentSelector', () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it('renders Production and UAT options', async () => {
    const user = userEvent.setup();
    render(
      <EnvironmentSelector
        selectedEnvironment="prod"
        onChange={mockOnChange}
      />
    );

    // Open the dropdown first
    await user.click(screen.getByRole('combobox'));

    expect(screen.getByRole('option', { name: 'Production' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'UAT' })).toBeInTheDocument();
  });

  it('calls onChange with prod when Production is clicked', async () => {
    const user = userEvent.setup();
    render(
      <EnvironmentSelector
        selectedEnvironment="uat"
        onChange={mockOnChange}
      />
    );

    // Open the dropdown first
    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: 'Production' }));
    expect(mockOnChange).toHaveBeenCalledWith('prod');
  });

  it('calls onChange with uat when UAT is clicked', async () => {
    const user = userEvent.setup();
    render(
      <EnvironmentSelector
        selectedEnvironment="prod"
        onChange={mockOnChange}
      />
    );

    // Open the dropdown first
    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: 'UAT' }));
    expect(mockOnChange).toHaveBeenCalledWith('uat');
  });

  it('renders the Environment legend', () => {
    render(
      <EnvironmentSelector
        selectedEnvironment="prod"
        onChange={mockOnChange}
      />
    );

    expect(screen.getByText('Environment')).toBeInTheDocument();
  });
});
