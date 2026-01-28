import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EnvironmentSelector } from './EnvironmentSelector';

describe('EnvironmentSelector', () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it('renders Production and UAT options', () => {
    render(
      <EnvironmentSelector
        selectedEnvironment="prod"
        onChange={mockOnChange}
      />
    );

    expect(screen.getByText('Production')).toBeInTheDocument();
    expect(screen.getByText('UAT')).toBeInTheDocument();
  });

  it('calls onChange with prod when Production is clicked', async () => {
    const user = userEvent.setup();
    render(
      <EnvironmentSelector
        selectedEnvironment="uat"
        onChange={mockOnChange}
      />
    );

    await user.click(screen.getByText('Production'));
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

    await user.click(screen.getByText('UAT'));
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
