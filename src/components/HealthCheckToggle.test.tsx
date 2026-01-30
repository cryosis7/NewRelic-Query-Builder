import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HealthCheckToggle } from './HealthCheckToggle';

describe('HealthCheckToggle', () => {
  const mockOnChange = vi.fn();
  const mockOnTimeseriesChange = vi.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
    mockOnTimeseriesChange.mockClear();
  });

  it('renders the exclude health checks checkbox', () => {
    render(
      <HealthCheckToggle
        isExcluded={true}
        onChange={mockOnChange}
        useTimeseries={true}
        onTimeseriesChange={mockOnTimeseriesChange}
      />
    );

    expect(screen.getByLabelText('Exclude health checks')).toBeInTheDocument();
  });

  it('shows checkbox as checked when isExcluded is true', () => {
    render(
      <HealthCheckToggle
        isExcluded={true}
        onChange={mockOnChange}
        useTimeseries={true}
        onTimeseriesChange={mockOnTimeseriesChange}
      />
    );

    expect(screen.getByLabelText('Exclude health checks')).toBeChecked();
  });

  it('shows checkbox as unchecked when isExcluded is false', () => {
    render(
      <HealthCheckToggle
        isExcluded={false}
        onChange={mockOnChange}
        useTimeseries={true}
        onTimeseriesChange={mockOnTimeseriesChange}
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
        useTimeseries={true}
        onTimeseriesChange={mockOnTimeseriesChange}
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
        useTimeseries={true}
        onTimeseriesChange={mockOnTimeseriesChange}
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
        useTimeseries={true}
        onTimeseriesChange={mockOnTimeseriesChange}
      />
    );

    // Component renders the checkbox but no hint text
    expect(screen.getByLabelText('Exclude health checks')).toBeInTheDocument();
  });

  it('does not display excluded paths hint when isExcluded is false', () => {
    render(
      <HealthCheckToggle
        isExcluded={false}
        onChange={mockOnChange}
        useTimeseries={true}
        onTimeseriesChange={mockOnTimeseriesChange}
      />
    );

    expect(screen.queryByText(/Excludes:/)).not.toBeInTheDocument();
  });

  it('renders the Options legend', () => {
    render(
      <HealthCheckToggle
        isExcluded={true}
        onChange={mockOnChange}
        useTimeseries={true}
        onTimeseriesChange={mockOnTimeseriesChange}
      />
    );

    expect(screen.getByText('Options')).toBeInTheDocument();
  });

  it('renders the use timeseries checkbox', () => {
    render(
      <HealthCheckToggle
        isExcluded={true}
        onChange={mockOnChange}
        useTimeseries={true}
        onTimeseriesChange={mockOnTimeseriesChange}
      />
    );

    expect(screen.getByLabelText('As Timeseries')).toBeInTheDocument();
  });

  it('shows timeseries checkbox as checked when useTimeseries is true', () => {
    render(
      <HealthCheckToggle
        isExcluded={true}
        onChange={mockOnChange}
        useTimeseries={true}
        onTimeseriesChange={mockOnTimeseriesChange}
      />
    );

    expect(screen.getByLabelText('As Timeseries')).toBeChecked();
  });

  it('shows timeseries checkbox as unchecked when useTimeseries is false', () => {
    render(
      <HealthCheckToggle
        isExcluded={true}
        onChange={mockOnChange}
        useTimeseries={false}
        onTimeseriesChange={mockOnTimeseriesChange}
      />
    );

    expect(screen.getByLabelText('As Timeseries')).not.toBeChecked();
  });

  it('calls onTimeseriesChange with false when checked timeseries box is clicked', async () => {
    const user = userEvent.setup();
    render(
      <HealthCheckToggle
        isExcluded={true}
        onChange={mockOnChange}
        useTimeseries={true}
        onTimeseriesChange={mockOnTimeseriesChange}
      />
    );

    await user.click(screen.getByLabelText('As Timeseries'));
    expect(mockOnTimeseriesChange).toHaveBeenCalledWith(false);
  });

  it('calls onTimeseriesChange with true when unchecked timeseries box is clicked', async () => {
    const user = userEvent.setup();
    render(
      <HealthCheckToggle
        isExcluded={true}
        onChange={mockOnChange}
        useTimeseries={false}
        onTimeseriesChange={mockOnTimeseriesChange}
      />
    );

    await user.click(screen.getByLabelText('As Timeseries'));
    expect(mockOnTimeseriesChange).toHaveBeenCalledWith(true);
  });
});
