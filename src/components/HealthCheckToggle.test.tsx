import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HealthCheckToggle } from './HealthCheckToggle';

describe('HealthCheckToggle', () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it('renders the exclude health checks checkbox', () => {
    render(
      <HealthCheckToggle
        isExcluded={true}
        onChange={mockOnChange}
      />
    );

    expect(screen.getByLabelText('Exclude health checks')).toBeInTheDocument();
  });

  it('shows checkbox as checked when isExcluded is true', () => {
    render(
      <HealthCheckToggle
        isExcluded={true}
        onChange={mockOnChange}
      />
    );

    expect(screen.getByLabelText('Exclude health checks')).toBeChecked();
  });

  it('shows checkbox as unchecked when isExcluded is false', () => {
    render(
      <HealthCheckToggle
        isExcluded={false}
        onChange={mockOnChange}
      />
    );

    expect(screen.getByLabelText('Exclude health checks')).not.toBeChecked();
  });

  it('calls onChange with false when checked box is clicked', async () => {
    const user = userEvent.setup();
    render(
      <HealthCheckToggle
        isExcluded={true}
        onChange={mockOnChange}
      />
    );

    await user.click(screen.getByLabelText('Exclude health checks'));
    expect(mockOnChange).toHaveBeenCalledWith(false);
  });

  it('calls onChange with true when unchecked box is clicked', async () => {
    const user = userEvent.setup();
    render(
      <HealthCheckToggle
        isExcluded={false}
        onChange={mockOnChange}
      />
    );

    await user.click(screen.getByLabelText('Exclude health checks'));
    expect(mockOnChange).toHaveBeenCalledWith(true);
  });

  it('displays excluded paths hint when isExcluded is true', () => {
    render(
      <HealthCheckToggle
        isExcluded={true}
        onChange={mockOnChange}
      />
    );

    // Should show first 3 paths followed by ...
    expect(screen.getByText(/Excludes:/)).toBeInTheDocument();
    expect(screen.getByText(/\/ping/)).toBeInTheDocument();
  });

  it('does not display excluded paths hint when isExcluded is false', () => {
    render(
      <HealthCheckToggle
        isExcluded={false}
        onChange={mockOnChange}
      />
    );

    expect(screen.queryByText(/Excludes:/)).not.toBeInTheDocument();
  });

  it('renders the Options legend', () => {
    render(
      <HealthCheckToggle
        isExcluded={true}
        onChange={mockOnChange}
      />
    );

    expect(screen.getByText('Options')).toBeInTheDocument();
  });
});
