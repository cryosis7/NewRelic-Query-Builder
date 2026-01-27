import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EnvironmentSelector } from './EnvironmentSelector';
import type { Environment } from '../types/query';

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

    expect(screen.getByLabelText('Production')).toBeInTheDocument();
    expect(screen.getByLabelText('UAT')).toBeInTheDocument();
  });

  it('shows Production as checked when prod is selected', () => {
    render(
      <EnvironmentSelector
        selectedEnvironment="prod"
        onChange={mockOnChange}
      />
    );

    expect(screen.getByLabelText('Production')).toBeChecked();
    expect(screen.getByLabelText('UAT')).not.toBeChecked();
  });

  it('shows UAT as checked when uat is selected', () => {
    render(
      <EnvironmentSelector
        selectedEnvironment="uat"
        onChange={mockOnChange}
      />
    );

    expect(screen.getByLabelText('Production')).not.toBeChecked();
    expect(screen.getByLabelText('UAT')).toBeChecked();
  });

  it('calls onChange with prod when Production is clicked', async () => {
    const user = userEvent.setup();
    render(
      <EnvironmentSelector
        selectedEnvironment="uat"
        onChange={mockOnChange}
      />
    );

    await user.click(screen.getByLabelText('Production'));
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

    await user.click(screen.getByLabelText('UAT'));
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

  it('uses radio buttons (only one can be selected)', () => {
    render(
      <EnvironmentSelector
        selectedEnvironment="prod"
        onChange={mockOnChange}
      />
    );

    const prodRadio = screen.getByLabelText('Production');
    const uatRadio = screen.getByLabelText('UAT');

    expect(prodRadio).toHaveAttribute('type', 'radio');
    expect(uatRadio).toHaveAttribute('type', 'radio');
    expect(prodRadio).toHaveAttribute('name', 'environment');
    expect(uatRadio).toHaveAttribute('name', 'environment');
  });
});
